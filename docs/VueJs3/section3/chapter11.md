# 快速 Diff 算法

快速 Diff 算法最早应用于 ivi 和 inferno 这两个框架，在 DOM 操作的各个方面，这个算法性能都要稍优于 Vue.js 2 所采用的双端 Diff 算法。

## 相同的前置元素和后置元素

### 纯文本 Diff 算法

不同于简单 Diff 算法和双端 Diff 算法，快速 Diff 算法包含预处理步骤，这借鉴了纯文本 Diff 算法的思路。在纯文本 Diff 算法中，存在对两段文本进行预处理的过程。

例如，在两段文本进行 Diff 之前，可以对它们进行全等比较：

```js
if(text1 === text2) return
```

这也成为**快捷路径**。如果两端文本内容相等，就无需进入核心 Diff 算法的步骤了。除此之外，Diff 算法还会处理两段文本的前缀和后缀：

```shell
TEXT1： I use vue for app development
TEXT2： I use react for app development

TEXT1：vue
TEXT2：react
========================================
TEXT1： I like you
TEXT2： I like you too

TEXT1：
TEXT2：too
========================================
TEXT1： I like you too
TEXT2： I like you

TEXT1：too
TEXT2：
```

这么做的好处是，在特定情况下我们能够轻松判断文本的插入和删除。

### 快速 Diff 算法

快速 Diff 算法借鉴了纯文本 Diff 算法中的预处理的步骤。它会先处理一下新旧子节点里相同的前置节点和后置节点。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/11.2.1.png)

处理完前置和后置节点之后，新子节点未处理的部分 **[ j, newEnd ]** 区间内的节点，作为新元素挂载。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/11.2.2.png)

处理完前置和后置节点之后，旧子节点未处理的部分 **[ j, oldEnd ]** 区间内的节点要卸载。

```js
function patchKeyedChildren(n1, n2, container) {
    const newChildren = n2.children
    const oldChildren = n1.children
    // 更新相同的前缀节点
    // 索引 j 指向新旧两组子节点的开头
    let j = 0
    let oldVNode = oldChildren[j]
    let newVNode = newChildren[j]
    // while 循环向后遍历，直到遇到拥有不同 key 值的节点为止
    while (oldVNode.key === newVNode.key) {
        // 调用 patch 函数更新
        patch(oldVNode, newVNode, container)
        j++
        oldVNode = oldChildren[j]
        newVNode = newChildren[j]
    }

    // 更新相同的后缀节点
    // 索引 oldEnd 指向旧的一组子节点的最后一个节点
    let oldEnd = oldChildren.length - 1
    // 索引 newEnd 指向新的一组子节点的最后一个节点
    let newEnd = newChildren.length - 1

    oldVNode = oldChildren[oldEnd]
    newVNode = newChildren[newEnd]

    // while 循环向前遍历，直到遇到拥有不同 key 值的节点为止
    while (oldVNode.key === newVNode.key) {
        // 调用 patch 函数更新
        patch(oldVNode, newVNode, container)
        oldEnd--
        newEnd--
        oldVNode = oldChildren[oldEnd]
        newVNode = newChildren[newEnd]
    }

    // 满足条件，则说明从 j -> newEnd 之间的节点应作为新节点插入
    // j > oldEnd：旧节点全部被处理完毕
    if (j > oldEnd && j <= newEnd) {
        // 锚点的索引
        const anchorIndex = newEnd + 1
        // 锚点元素
        const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null
        // 采用 while 循环，调用 patch 函数逐个挂载新增的节点
        while (j <= newEnd) {
            patch(null, newChildren[j++], container, anchor)
        }
    } else if (j > newEnd && j <= oldEnd) {
        // j -> oldEnd 之间的节点应该被卸载
        // j > newnd：新节点全部被处理完毕
        while (j <= oldEnd) {
            unmount(oldChildren[j++])
        }
    } 
}
```

## 移动操作判断

之前介绍了快速 Diff 算法的预处理过程，即处理相同的前置节点和后置节点。

但是，之前的例子比较理性化，总是假定新旧子节点有一组会被全部处理完毕。在这种情况下，只需要简单地挂载、卸载节点即可。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/quick.2.1.png)

经过预处理之后，无论是新的一组子节点还是旧的一组子节点都有节点未处理。我们需要对此进一步处理：

- 判断是否有节点需要移动，以及应该如何移动
- 找出那些需要被添加或移除的节点

```js
if (j > oldEnd && j <= newEnd) {
    // 只有需要新增的节点
} else if (j > newEnd && j <= oldEnd) {
    // 只有需要卸载的节点
} else {
    // 处理非理想情况
} 
```

### souce 数组

首先，我们需要构建一个 source 数组，它的长度为新的一组新节点中剩余未处理节点的数量，source 数组用来存储新的一组子节点中的节点在旧的一组子节点中的位置索引，后面将会使用它计算出一个最长递增子序列，并用于辅助完成 DOM 的移动操作。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/quick.2.2.png)

> 当遍历剩余的新子节点时，如果这个节点在 source 中对应的值为 -1，表示这个节点无法在旧子节点数组中找到可复用的节点，这就是一个需要新增的节点。

```js
if (j > oldEnd && j <= newEnd) {
    // 只有需要新增的节点
} else if (j > newEnd && j <= oldEnd) {
    // 只有需要卸载的节点
} else {
    const count = newEnd - j + 1  // 新的一组子节点中剩余未处理节点的数量
    const source = new Array(count)
    source.fill(-1)
    
    // oldStart 和 newStart 分别未起始索引，即 j
    const oldStart = j;
    const newStart = j;
    // 遍历旧的一组子节点
    for(let i = oldStart; i <= oldEnd; i++) {
        const oldVNode = oldChildren[i]
        // 遍历新的一组子节点
        for(let k = newStart; k <= newEnd; k++) {
            const newVNode = newChildren[i]
            // 找到拥有相同 key 的可复用节点
            if(oldVNode.key === newVNode.key) {
                // 调用 patch 进行更新
                patch(oldVNode, newVNode, container)
                // 最后填充 source 数组
                source[k - newStart] = i
            }
        }
    }
} 
```

> source 记录的是**剩余未处理**的新子节点在旧子节点当中的可复用节点，索引记录的下标要减去 newStart

### 索引表降低时间复杂度

当前的双层 for 循环的时间复杂度未 O(n^2)，我们可以利用索引表来把时间复杂度降低到 O(n)

```js
if (j > oldEnd && j <= newEnd) {
    // 只有需要新增的节点
} else if (j > newEnd && j <= oldEnd) {
    // 只有需要卸载的节点
} else {
    const count = newEnd - j + 1  // 新的一组子节点中剩余未处理节点的数量
    const source = new Array(count)
    source.fill(-1)

    // oldStart 和 newStart 分别未起始索引，即 j
    const oldStart = j;
    const newStart = j;
    // 🔥 构建索引表
    const keyIndex = {}
    for(let i = newStart; i <= newEnd; i++) {
        keyIndex[newChildren[i].key] = i
    }
    // 遍历旧的一组子节点中剩余未处理的节点
    for(let i = oldStart; i <= oldEnd; i++) {
        oldVNode = oldChildren[i]
        // 通过索引表快速找到新的一组子节点中可复用节点的位置
        const k = keyIndex[oldVNode.key]
        
        if (typeof k !== 'undefined') {
            newVNode = newChildren[k]
            // 调用 patch 函数完成更新
            patch(oldVNode, newVNode, container)
            // 🚀 填充 source 数组
            source[k - newStart] = i
        } else {
            // 没找到，卸载
            unmount(oldVNode)
        }
    }

} 
```

::: tip 构建 source 数组

- 索引表存着剩余未处理子节点，键值分别为节点 key 和新子节点数组当中的索引：**keyIndex: Record<key, newIdx>**
- 在遍历旧子节点数组的过程中，如果无法在新子节点列表中找到可复用节点，则卸载该节点
- 如果找到了可复用节点，则把新子节点对应的旧子节点的索引记录在 source 数组当中

::: 

