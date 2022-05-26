# 双端 Diff 算法

## 双端比较原理

### 简单 Diff 

简单 Diff 算法的问题在于，它对 DOM 的移动操作并不是最优的。以下面这个子节点列表更新为例：
![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/simpleDiff.png)

如图可见，使用简单 diff 算法在本次比较过程中需要两次 DOM 移动操作，分别是将 p-1 和 p-2 移动到 p-3 之后。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/10.1.1.png)

然而，上述更新过程并非**最优解**。实际上，我们只要一次 DOM 移动操作即可完成更新，即将真实 DOM 节点 p-3 移动到真实 DOM 节点 p-1 前面。

### 双端 Diff

::: tip 双端 Diff 算法，顾名思义就是使用四个指针，分别指向新旧子节点数组的头尾，然后按照一定的顺序从头尾向中间进行遍历处理：

- 路线 1 匹配，自增 newStartIdx 和 oldStartIdx
- 路线 2 匹配，自减 newEndIdx 和 oldEndIdx
- 路线 3 匹配，表示原本在头部的节点现在要移动到尾部，那么移动真实 DOM 的 oldStartIdx 对应节点到 oldEndIdx 节点之后
- 路线 4 匹配，表示原本在尾部的节点现在要移动到头部，那么移动真实 DOM 的 oldEndIdx 对应节点到 oldStartIdx 节点之前

::: 

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/10.1.2.png)

```js
function patchKeyedChildren(n1, n2, container) {
    const oldChildren = n1.children
    const newChildren = n2.children

    let oldStartIdx = 0
    let oldEndIdx = oldChildren.length - 1
    let newStartIdx = 0
    let newEndIdx = newChildren.length - 1

    let oldStartVNode = oldChildren[oldStartIdx]
    let oldEndVNode = oldChildren[oldEndIdx]
    let newStartVNode = newChildren[newStartIdx]
    let newEndVNode = newChildren[newEndIdx]

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (oldStartVNode.key === newStartVNode.key) {
            patch(oldStartVNode, newStartVNode, container)
            oldStartVNode = oldChildren[++oldStartIdx]
            newStartVNode = newChildren[++newStartIdx]
        } else if (oldEndVNode.key === newEndVNode.key) {
            patch(oldEndVNode, newEndVNode, container)
            oldEndVNode = oldChildren[--oldEndIdx]
            newEndVNode = newChildren[--newEndIdx]
        } else if (oldStartVNode.key === newEndVNode.key) {
            patch(oldStartVNode, newEndVNode, container)
            insert(oldStartVNode.el, container, newEndVNode.el.nextSibling)
            oldStartVNode = oldChildren[++oldStartIdx]
            newEndVNode = newChildren[--newEndIdx]
        } else if (oldEndVNode.key === newStartVNode.key) {
            patch(oldEndVNode, newStartVNode, container)
            insert(oldEndVNode.el, container, oldStartVNode.el)
            oldEndVNode = oldChildren[--oldEndIdx]
            newStartVNode = newChildren[++newStartIdx]
        }
    }
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/diff.png)

此时，真实 DOM 节点的顺序与新的一组子节点的顺序相同了：p-4、p-2、p-1、p-3。

另外，在这一轮更新完成之后，所有 newStartIdx 和所有 oldStartIdx 的值都小于 newEndIdx 和 oldEndIdx。循环终止，双端 Diff 执行完毕。
