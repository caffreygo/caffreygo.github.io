# 编译优化

**编译优化指的是编译器将模板编译为渲染函数的过程中，尽可能多地提取关键信息，并以此指导生成最优代码的过程**。编译优化的策略与具体实现是由框架的设计思路所决定的，不同的框架具有不同的设计思路，因此编泽优化的策略也不尽相同。

✅ 但优化的方向基本一致，即尽可能地区分动态内容利静态内容，并针对不同的内容采用不同的优化策略。

## 动态节点收集与补丁标志

::: tip 概述
编译优化的核心在于，区分动态节点与静态节点。vue.js 3 会为动态节点打上补丁标志，即 `patchFlag`。同时，Vue.js 3 还提出了 Block 的概念，一个 Block 本质上也是一个虚拟节点，但与普通虛拟节点相比，会多出一个 `dynamiChildren` 数组。该数组用来收集所有动态子代节点。这利用了 `createVNode` 函数和 `createBlock` 函数层层嵌套调用的特点，即以“由内向外”的力式执行。再配合一个用来临时存储动态节点的节点栈，即可完成动态子代节点的收集。

:::

> 补丁标志实现了动态节点的靶向更新；
>
> Block 是对所有动态子节点收集的一个特殊 VNode。

### 传统 Dif 算法的问题

之前共介绍了三种关于传统虚拟 DOM 的 Diff 算法。但无论哪一种 Diff 算法，当它在比对新旧两棵虚拟 DOM 树的时候，总是要按照虚拟 DOM的层级结构**一层一层**地遍历。举个例子，假设我们有如下模板：

```html
<div id="foo">
  <p class="bar">
    {{ text }}
  </p>
</div>
```

在上面这段模板中，唯一可能变化的就是 p 标签的文本子节点的内容。也就是说，当响应式数据 `text` 的值发生变化时，最高效的更新方式就是直接设置 p 标签的文本内容。但传统 Diff 算法显然做不到如此高效，当响应式数据 `text` 发生变化时，会产生一棵新的虚拟 DOM 树，

::: tip 传统 Diff 算法对比新旧两棵虚拟 DOM树的过程如下：

1. 对比 div 节点，以及该节点的属性和子节点。
2. 对比 p 节点，以及该节点的属性和子节点。
3. 对比 p 节点的文本子节点，如果文本子节点的内容变了，则更新之，否则什么都不做。

可以看到，与直接更新 p 标签的文本内容相比，传统 Diff 算法存在很多**无意义的比对操作**。如果能够跳过这此无意义的操作，性能将会大幅提升。而这就是 vue.js3 编译优化的思路来源。

:::

实际上，模板的结构非常稳定。通过编译手段，我们可以分析出很多关键信息，例如哪些节点是静态的，哪些节点是动态的。结合这些关键信息，编译器可以直接生成原生 DOM 操作的代码，这样甚至能够抛弃掉虚拟 DOM，从而避免虚拟 DOM 带来的性能开销。但是，考虑到渲染函数的灵活性，以及 Vue js 2 的兼容题，vue.js 3 最终还是选择了保留虚拟 DOM。这样一来，就必然要面临它所带来的额外性能开销。

✅ 那么，为什么虛拟 DOM 会产生额外的性能开销呢？根本原因在于，渲染器在运行时得不到足够的信息。传统 Diff 算法无法利用编译时提取到的任何关键信息，这导致渲染器在运行时不可能去做相关的优化。而 Vue.js 3 的编译器会将编译时得到的**关键信息“附着”在它生成的虚拟 DoM上**，这些信息会通过虚拟 DOM 传递给渲染器。最终，渲染器会根据这些关键信息执行“快捷路径”，从而提升运行时的性能。

### Block 与 PatchFlags

✅ 传统 Diff 算法无法避免新旧虚拟 DOM 树间无用的比较操作，是因为它在运行时得不到足够的关键信息，从而无法区分动态内容和静态内容。换句话说，只要运行时能够区分动态内容和静态内容，即可实现极致的优化策略。

::: tip Block 节点

- 有了 Block 这个概念之后，渲染器的更新操作将会以 Block 为维度。也就是说，渲染器在更新一个 Block 的时候，会直接找到该虚拟节点的`dynamicChildren`数组，并更新该数组中的动态节点。这样，在更新时就实现**跳过了静态内容**，只更新动态内容。
- 同时，由于动态节点当中存在对应的补丁标志，所以在更新动态节点的时候，也能够做到**靶向更新**。例如，当一个动态节点的 `patchFlat`的值为 1 时，我们知道它只存在动态的文本节点，所以只需要更新它的文本内容即可。
- 当我们编写模板代码的时候，所有模板的根节点都会是一个 Block 节点。同时，任何带有`v-for`、`v-if/v-else-if\v-else`等指令的节点都会被当做 Block 节点。

:::

:::: code-group
::: code-group-item 模板

```html{3}
<div>
	<div>foo</div>
    <p>{{ bar }}</p>
</div>
```

这段模板当中只有 bar 是动态内容，所以理想的情况下，当响应式数据更新时，只需要更改 p 标签的文本节点即可。

:::
::: code-group-item 传统虚拟 DOM

```js{5}
const vnode = {
	tag: 'div',
    children: [
        { tag: 'div', children: 'foo' },
        { tag: 'p', children: ctx.bar }
    ]
}
```

为了实现这个目标，我们需要从虚拟 DOM 的结构入手，补充内容标志体现出节点的动态性。

:::
::: code-group-item Block

```js{1-6,12,14-17}
const patchFlag = {
    TEXT: 1,  // 代表节点有动态的 textContent
    CLASS: 2,  // 代表节点有动态的 class
    STYLE: 3  // 代表节点有动态的 style
    // ...
}

const vnode = {
	tag: 'div',
    children: [
        { tag: 'div', children: 'foo' },
        { tag: 'p', children: ctx.bar, patchFlag: patchFlag.Text }
    ],
    dynamicChildren: [
        // p 标签具有 patchFlag 属性，因此它是动态节点
        { tag: 'p', children: ctx.bar, patchFlag: patchFlag.Text }
    ]
}
```

Block 本质上也是一个虚拟 DOM 节点，只不过它比普通的虚拟节点多出耦合用来存储动态子节点的`dynamicChildren`属性。同时，一个 Block 不仅能够收集它的直接动态子节点，还能收集**所有的动态子节点**。

:::
::: code-group-item 动态子节点收集

```html
<div>
	<div>
        <p>{{ bar }}</p>
   	</div>
</div>
```

Bock：

```js{6,9-12}
const vnode = {
    tag: 'div',
    children: [
        { tag: 'div', children: 'foo' },
        children: [
        	{ tag: 'p', children: ctx.bar, patchFlag: patchFlag.Text }
		]
	],
    dynamicChildren: [
        // Block 可以收集所有的动态子节点
        { tag: 'p', children: ctx.bar, patchFlag: patchFlag.Text }
    ]
}
```

:::
::: code-group-item Blocks

```html
<template>
    <!-- 这个 div 是一个 Block -->
    <div>
        <!-- 这个 p 不是是一个 Block，因为它不是根节点 -->
        <p>{{ bar }}</p>
    </div>
    <!-- 这个 h1 是一个 Block -->
    <h1>
        <!-- 这个 span 不是是一个 Block，因为它不是根节点 -->
        <span :id='dynamicId'></span>
    </h1>
</template>
```

:::
::::

### 收集动态节点

:::: code-group
::: code-group-item render

```js{2-3}
render() {
    return createNode('div', { id: 'foo' }, [
   		createNode('p', null, 'hello world')
    ])
}
```

编译器生成渲染函数时，并不会直接包含用来描述虚拟节点的数据结构，而是包含着用来创建虚拟 DOM 节点的辅助函数。

```js
function createVNode(tag, props, children) {
    const key = props && props.key
    props && delete props.key

    return {
        tag,
        props,
        children,
        key
    }
}
```

`createVNode`函数就是用来创建虚拟 DOM 节点的辅助函数，它的基本实现如上。它的返回值是一个虚拟 DOM 节点，内部对 props 和 children 还会做一些额外的处理工作。

:::
::: code-group-item 增加补丁标签

```html
<div id="foo">
    <p class="bar">{{ text }}</p>
</div>
```

假如我们有如上这个模板，编译器在对这段模板进行编译优化之后，会生成带有**补丁标志**（patch tag）的渲染函数：

```js{4}
render() {
    return createNode('div', { id: 'foo' }, [
        // PatchFlags 就是补丁标志
   		createNode('p', { class: 'bar' }, text, PatchFlags.TEXT )
    ])
}
```

用于创建 p 标签的`createVNode`函数补充了第四个参数，即`PatchFlags.TEXT`。

这个参数就是所谓的补丁标志，它代表当前虚拟节点是一个动态节点，并且动态因素是：具有动态文本节点。这样就实现了对动态节点的标志。

:::
::: code-group-item createVNode 由内向外

```js
render() {
    return createVNode('div', {}, [
        createVNode('div', {}, [
            createVNode('div', {}, [
                createVNode('div', {}, [
                    createVNode('div', {}, [
                        // ...
                    ])
                ])
            ])
        ])
    ])
}
```

如何将根节点变成一个 Block？如何将动态子节点收集到该 Block 当中？

在渲染函数里，对`createVNode`函数的调用是层层嵌套的结构，并且该函数的执行顺序是“**内层先执行，外层后执行**”。

:::
::: code-group-item 动态节点栈

```js
// 动态节点栈
const dynamicChildrenStack = []
// 当前动态节点集合
let currentDynamicChildren = null
// openBlock 用来创建一个新的动态节点集合，并将该集合压入栈中
function openBlock() {
    dynamicChildrenStack.push((currentDynamicChildren = []))
}
// closeBlock 用来将通过 openBlock 创建的动弹节点集合从栈中弹出
function closeBlock() {
    currentDynamicChildren = dynamicChildrenStack.pop()
}
```



:::
::: code-group-item createVNode 收集动态子节点

```js{15}
function createVNode(tag, props, children, flags) {
    const key = props && props.key
    props && delete props.key

    const vnode = {
        tag,
        props,
        children,
        key,
        patchFlags
    }

    if (typeof flags !== 'undefined' && currentDynamicChildren) {
        // 收集动态节点
        currentDynamicChildren.push(vnode)
    }

    return vnode
}
```

当外层的`createVNode`函数执行时，内层的函数已经执行完毕了。因此，外层 Block 节点能够收集到内层动态节点，就需要一个**栈结构**的数据来存储内层的动态节点。

:::
::: code-group-item 渲染函数

```js{14}
render() {
    // 1. 调用 openBlock 开启一个动态节点集合
    // 2. createBlock 参数执行 createVNode, 进行动态节点的收集
    // 3. 最后 createBlock 进行动态节点的赋值，以及栈元素的移除
    return (openBlock(), createBlock('div', null, [
        createVNode('p', { class: 'foo' }, null, 1),
        createVNode('p', { class: 'bar' }, null),
    ]))
}

function createBlock(tag, props, children) {
    // Block 本质上也是一个 VNode
    const block = createVNode(tag, props, children)
    block.dynamicChildren = currentDynamicChildren

    closeBlock()

    return block
}
```

`createVNode`会先执行，在这个过程中进行动态子节点的收集工作；

当`createBlock`执行时，便能拿到当前的所有动态子节点集合。

> 这里利用逗号运算符的性质来保证渲染函数的返回值仍然是 VNdode 对象。
>
> currentDynamicChidlren 数组所存储的就是属于当前 Block 的所有动态子节点。

:::
::::

### 渲染器的运行时支持

✅ 现在，我们已经有了动态节点集合`vnode.dynamicChildren`，以及附着其上的补丁标志。基于这两点，即可在渲染器中实现**靶向更新**。

🌐 [patchElement & patchChildren (opens new window)](https://www.ijerrychen.com/VueJs3/section3/chapter8.html#%E6%9B%B4%E6%96%B0%E5%AD%90%E8%8A%82%E7%82%B9)

:::: code-group
::: code-group-item Block 靶向更新

```js
function patchElement(n1, n2) {
    const el = n2.el = n1.el
    const oldProps = n1.props
    const newProps = n2.props
    // 省略部分代码

    if(n2.dynamicChidlren) {
        patchBlockChildren(n1, n2)
    }else {
        patchChildren(n1, n2, el)
    }

}

function patchBlockChildren(n1, n2) {
    // 只更新动态子节点即可
    for(let i = 0; i < n2.dynamicChildren.length; i++) {
        patchElement(n1.dynamicChildren[i], n2.dynamicChildren[i])
    }
}
```

渲染器在更新节点时，使用`patchChildren`函数来更新标签的子节点。该函数会使用传统的 Diff 算法进行更新，这样做效率比较低。有了`dynamicChildren`之后，我们可以**直接对比动态子节点**。

✅ 我们优先检测虚拟 DOM 是否存在动态节点集合，即`dynamicChildren`数组。如果存在，则直接调用`patchChildren`函数完成更新。这样，渲染函数只会对动态节点进行更新，而跳过所有静态节点。

:::
::: code-group-item 节点靶向更新

```js
function patchElement(n1, n2) {
    const el = n2.el = n1.el
    const oldProps = n1.props
    const newProps = n2.props

    if(n2.PatchFlags) {
        if (n2.PatchFlags === 1) {
			// 只需要更新文本子节点
        } else if (n2.PatchFlags === 2) {
            // 只需要更新 class
        } else if(...) {
            // ...
        }
    } else {
        // 全量更新
        // 第一步：更新 props，属性打补丁+属性卸载
        for (const key in newProps) {
            if (newProps[key] !== oldProps[key]) {
                patchProps(el, key, oldProps[key], newProps[key])
            }
        }
        for (const key in oldProps) {
            if (!(key in newProps)) {
                patchProps(el, key, oldProps[key], null)
            }
        }
        // 第二步：更新 children
        patchChildren(n1, n2, el)
    }

}
```

✅ 动态节点集合能够使得渲染器在执行更新时跳过静态节点，而对于**单个动态节点**的更新来说，由于它存在对应的补丁标志，因此我们可以针对性完成靶向更新：

:::

::::

## Block 树

::: tip 概述

由于 Block 会收集所有动态子代节点，所以对动态节点的比对操作是忽略 DOM 层级结构的。这会带来额外的问题，即 `v-if` 、`v-for` 等结构化指令会影响 DOM 层级结构，使之不稳定。这会间接导致基于 Block 树的比对算法失效。而解决的方式很简单，只需要让带有 `v-if` 、`v-for` 等指令的节点也作为 Block 角色即可。

:::

> 除了根节点会被当中 Block 之外，带有`v-for`、`v-if v-else-if v-else`等指令的节点也会被当做 Block 节点。这就形成了 Block 树。

### 带有 v-if 指令的节点

:::: code-group
::: code-group-item 问题模板 1

```html
<div>
    <section v-if="foo">
        <p>{{ a }}</p>
    </section>
    <div v-else>
        <p>{{ a }}</p>
    </div>
</div>
```

foo 的值改变，block 收集的动态节点是不变的，这意味着在 Diff 阶段不会做任何更新。但是，实际上这两个 p 标签的父元素是不同的。更新前后的**标签不同**，如果不做更新，将产生 Bug。

:::
::: code-group-item 问题模板 2

```html
<div>
    <section v-if="foo">
        <p>{{ a }}</p>
    </section>
    <section v-else>
        <div>
            <p>{{ a }}</p>
        </div>
    </section>
</div>
```

上面这段模板的 **DOM 数结构**根据 foo 值改变是不同的，然而 block 收集到的动态子节点确是一样的，同样会产生 Bug。

:::
::: code-group-item Block

```js
const block = {
    tag: 'div',
    dynamicChildren: [
        { tag: 'p', children: ctx.a, patchFlags: 1 }
    ]
    // ...
}
```

:::

::::

---

根本原因在于，`dynamicChildren`数组中收集的动态节点是忽略虚拟 DOM 数层级的。换句话说，结构化指令会导致更新前后模板的结构发生变化，即模板结构不稳定。

✅ 为了解决这个问题，让虚拟 DOM 树的结构变稳定，只需要让这些**带有结构化指令的节点也作为 Block 角色**即可。

以之前的问题模板 2 为例，如果我们把`v-if`、`v-else`指令所在的标签也作为 Block 处理，那么将构成一棵 Block 树：

```
Block(div)
	- Block(Section v-if)
	- Block(Section v-else)
```

父级 Block 除了会手机动态子节点之外，也会收集子 Block。因此，两个字 Block 将会被父级 Block 收集到其`dynamicChildren`数组中：

```js{6}
const block = {
    tag: 'div',
    dynamicChildren: [
        // Block(Section v-if) 或者 Block(Section v-else)
        // key 值会根据不同的 Block 而发生变化
        { tag: 'section', { key: 0 }, dynamicChildren: [...] }
    ]
}
```

这样，根据`v-if\v-else`的条件不同，父级 Block 收集到的子 Block 也会不同。在 Diff 过程中，渲染器能够根据 Block 的 key 值区分出更新前后的两个 Block 是不同的，并使用新的 Block 替换旧的 Block。这样就解决了 DOM 结构不稳定引起的更新问题。

### 带有 v-for 指令的节点

:::: code-group
::: code-group-item 模板

```html
<div>
    <p v-for="item in list">{{ item }}</p>
    <i>{{ foo }}</i>
    <i>{{ bar }}</i>
</div>
```

:::
::: code-group-item list 更新前后的 Block

```js
// 更新前 [1, 2]
const preBlock = {
    tag: 'div',
    dynamicChildren: [
        { tag: 'p', children: 1, 1 },
        { tag: 'p', children: 2, 1 },
        { tag: 'i', children: ctx.foo, 1 },
        { tag: 'i', children: ctx.abar, 1 },
    ]
}

// 更新后 [1]
const nextBlock = {
    tag: 'div',
    dynamicChildren: [
        { tag: 'p', children: 1, 1 },
        { tag: 'i', children: ctx.foo, 1 },
        { tag: 'i', children: ctx.abar, 1 },
    ]
}
```

:::

::::

✅ 这里 list 更新前后会使得 Block 有不同数量的动态子节点，不能使用传统的 Diff 算法对`dynamicChildren`进行更新。因为进行 Diff 操作的节点必须是同层级节点，而`dynamicChildren`内的节点未必是同层级的。所以我们同样需要把`v-for`所在的标签也作为 Block 角色处理。

```js{4}
const block = {
    tag: 'div',
    dynamicChildren: [
        { tag: Fragment, dynamicChildren: [ /* v-for 的节点 */ ] },
        { tag: 'i', children: ctx.foo, 1 },
        { tag: 'i', children: ctx.abar, 1 },
    ]
}
```

由于`v-for`指令渲染的是一个片段，所以我们需要使用类型为`Fragment`的节点来表达`v-for`指令的渲染结果，并作为 Block 角色。

## Fragment 的稳定性

>1. Fragment 的作为`v-for`的表达方式，其动态子节点的结构如果是不稳定的，要回退到传统的 Diff 操作，而不是使用 dynamicChildren；
>2. Fragment 的子节点（children）仍然可以是由 Block 组成的数组；
>3. 也存在稳定的 Fragment，可以作为 Block 处理。

:::: code-group
::: code-group-item 不稳定结构

```html
<p v-for="item in list">{{ item }}</p>
```

其更新前后的模板如下：

```js
// 更新前 [1, 2]
const preBlock = {
    tag: Fragment,
    dynamicChildren: [
        { tag: 'p', children: item, 1 },
        { tag: 'p', children: item, 1 },
    ]
}

// 更新后 [1]
const preBlock = {
    tag: Fragment,
    dynamicChildren: [
        { tag: 'p', children: item, 1 },
    ]
}
```

Fragment 本身收集的动态节点仍然面临结构不稳定的情况。所谓结构不稳定，从结果上看，**指的是更新前后一个 block 的 dynamicChildren 数组中收集的动态节点的数量或顺序不一致**。这种不一致会导致我们无法直接进行靶向更新，这种情况下我们只能回退到传统虚拟 DOM 的 Diff 手段，即直接使用 Fragment 的 children 而非 dynamicChidlren 来进行 Diff 操作。

:::
::: code-group-item Block 数组

```js
const block = {
    tag: Fragment,
    dynamicChildren: [
        { tag: 'p', children: item, dynamicChildren: [...] },
        { tag: 'p', children: item, dynamicChildren: [...] },
    ]
}
```

:::
::: code-group-item 稳定结构

```html
<p v-for="item in 10">{{ item }}</p>
<p v-for="item in 'abc'">{{ item }}</p>
```

或

```html
<template>
  <div></div>
  <p></p>
</template>
```

- `v-for`指令的表达式是常量
- 模板中有多个根节点。

:::

::::

## 静态提升

✅  静态提升就是把纯静态的**子节点树**或者**属性**提升到渲染函数之外，避免这些节点在更新时被再次创建为虚拟 DOM 所带来的性能开销。

> hoist：提升

:::: code-group
::: code-group-item 静态提升后的渲染函数

```js{2,6}
// 把静态节点提升到渲染函数之外
const hoist1 = createVNode('p', null, 'Static text')

function render() {
  return (openBlock(), createBlock('div', null, [
    hoist1,  // 静态节点引用
    createVNode('p', null, ctx.title, 1)
  ]))
}
```

:::
::: code-group-item 模板

```html
<div>
  <p>Static text</p>
  <p>{{ title }}</p>
</div>
```

:::
::: code-group-item 之前的渲染函数

```js
function render() {
  return (openBlock(), createBlock('div', null, [
    createVNode('p', null, 'Static text'),
    createVNode('p', null, ctx.title, 1)
  ]))
}
```

:::

::::

需要注意的是，静态提升是以树为单位的，以下面的模板为例：

```html
<div>
  <section>
    <p>
      <span>abc</span>
    </p>
  </section>
</div>
```

在上面这段模板中，除了根节点的 div 标签会作为 Block 角色而不可被提升之外，整个`<section>`元素及其子代节点都会被提升。如果我们把上面模板中的静态字符串 abc 替换成动态绑定的响应式数据，那么整棵树都不会被提升。

虽然包含动态绑定的节点本身不会被提升，但是该动态节点上仍然可能存在纯静态的属性，如下面的模板所示：

```html
<div>
  <p foo="bar" a=b>{{ text }}</p>
</div>
```

因为` p `标签存在动态绑定的文本内容，因此整个节点都不会被静态提升。该节点所有的 `props` 都是静态的，因此在最终生成渲染函数时，我们可以将纯静态的 `props` 提升到渲染函数之外，如下面的代码所示：

```js{1,5}
const hoistProp = { foo: 'bar', a: 'b'}

function render() {
  return (openBlock(), createBlock('div', null, [
    createVNode('p', hoistProp, ctx.title, 1)
  ]))
}
```

## 预字符串化

基于静态提升，我们还可以进一步采用预字符串化的优化手段。预字符串化是基于静态提升的一种优化策略。静态提升的虚拟接地那或虚拟节点树本身是静态的：

```html
<div>
  <p></p>
  <p></p>
  <!-- 20 个 p 标签 ... -->
  <p></p>
</div>
```

假设上面的模板中包含大量连续存静态的标签节点，当采用了静态提升优化策略时，其编译后的代码如下：

```js
const hoist1 = createVNode('p', null, null, PatchFlags,HOISTED)
const hoist2 = createVNode('p', null, null, PatchFlags,HOISTED)
// ...
const hoist20 = createVNode('p', null, null, PatchFlags,HOISTED)

function render() {
  return (openBlock(), createBlock('div', null, [
    hoist1, hoist2, ..., hoist20
  ]))
}
```

预字符串化能将这些静态节点序列化为字符串，并生成一个 Static 类型的 VNode：

```js{1,5}
const hoistStatic = createStaticVNode('<p></p><p></p>...<p></p>')

function render() {
  return (openBlock(), createBlock('div', null, [
    hoistStatic
  ]))
}
```

::: tip ✅  这么做有几个明显的优势：

- 大块的静态内容可以通过 innerHTML 进行设置，在性能上具有一定优势。
- 减少创建虚拟节点产生的性能开销。
- 减少内存占用。

:::

## 缓存内联事件处理函数

✅  每次重新渲染时（即 `render` 函数重新执行时），都会为`Comp`组将创建一个全新的 `props` 对象。同时， `props` 对象中`onChange`属性的值也会是全新的函数。这会导致渲染器对`Comp`组件进行更新，造成额外的性能开销。为了避免这类无用的更新，我们需要对内联事件处理函数进行缓存。

> 缓存内联事件处理函数可以避免不必要的更新。

:::: code-group
::: code-group-item 缓存内联事件处理函数

```js
function render(ctx, cache) {
  return h(Comp, {
    // 将内联事件处理函数缓存到 cache 数组中
    onChange: cache[0] || (cache[0] = ($event) => (ctx.a + ctx.b))
  })
}
```

:::
::: code-group-item 模板

```html
<Comp @change="a + b" />
```

:::
::: code-group-item 之前的渲染函数

```js
function render(ctx,) {
  return h(Comp, {
    onChange: () => (ctx.a + ctx.b))
  })
}
```

:::

::::

渲染函数的第二个参数是一个数组`cache`，该数组来自于数组实例，我们可以把内联事件处理函数添加到`cache`数组中。这样，当渲染函数重新执行并创建新的虚拟 DOM 树时，会优先读取缓存中的事件处理函数。这样，无论执行多少次渲染函数，`props` 对象中`onChange`属性的值始终不变，于是就不会触发`Comp`组件更新了。

## v-once

::: tip ✅ v-once 的性能提升

- 避免组件更新时重新创建虚拟 DOM 带来的性能开销。因为虚拟 DOM 被缓存了，所以更新时无需重新创建。
- 避免无用的 Diff 开销。这时因为被 `v-once` 编辑的虚拟 DOM 树不会被父级 Block 接待收集。

:::

```html
<section>
  <div v-once>{{ foo }}</div>
</section>
```

上面这段模板中，`div`标签存在动态绑定的文本内容。但是它被`v-once`指令标记，所以这段模板会被编译为：

```js
function render(ctx, cache) {
  return (openBlock(), createBlock('div', null, [
    cache[1] || (cache[1] = createVNode('div', null, ctx.foo, 1))
  ]))
}
```

`div`标签对应的虚拟节点被缓存到了`cache`数组中。后续更新导致渲染函数重新执行时，会优先读取缓存内容，而不会重新创建虚拟节点。

既然虚拟节点被缓存，这就意味着更新前后的虚拟节点不会发生变化，因此也就**不需要这些被缓存的虚拟节点参与 Diff 操作**了。所以在实际编译后的代码会出现下面这段内容：

```js
function render(ctx, cache) {
  return (openBlock(), createBlock('div', null, [
    cache[1] || (
    	setBlockTracking(-1),  // 阻止这段 VNode 被 Block 收集
      cache[1] = createVNode('div', null, ctx.foo, 1),
      setBlockTracking(1),  // 恢复收集
      cache[1]  // 整个表达式的值
    )
  ]))
}
```

使用`v-once`包裹的动态节点不会被父级  Block 收集。因此，被`v-once`包裹的动态节点在组件更新时，自然不会参与 Diff 操作。

`v-once`指令通常用于不会发生改变的动态绑定中（例如绑定一个常量），这样可以避免虚拟节点的重新创建和参与 Diff 过程，提升性能：

```html
<!-- <div>{{ SOME_CONSTANT }}</div> -->

<div v-once>{{ SOME_CONSTANT }}</div>
```

