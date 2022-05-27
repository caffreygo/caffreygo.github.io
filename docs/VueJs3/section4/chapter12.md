# 组件的实现原理

渲染器主要负责将虚拟 DOM 渲染为真实 DOM，我们只需要使用虚拟 DOM 来描述最终要呈现的真实 DOM 即可。

但当我们编写比较复杂的页面时，用来描述页面结构的虚拟 DOM 的代码量会越来越多，或者说页面模板会变得越来越大。这时，我们就需要组件化的能力。

有了组件，我们就可以将一个大的页面拆分为多个部分，每个部分都可以作为单独的组件，这些组件共同组成完整的页面。组件化的实现同样需要渲染器的支持。

## 渲染组件

### 组件类型节点

从**用户角度**来看，一个**有状态组件**就是一个**选项对象**，如下面的代码所示：

```js
// MyComponent 是一个组件，它的值是一个选项对象
const MyComponent = {
    name: 'MyComponent',
    data() {
        return { foo: 1 }
    }
}
```

从**渲染器角度**来看，一个组件则是一个特殊类型的虚拟 DOM 节点：

```js{3}
const vnode = {
    // 'div' | Fragemnt | Text...
	type: MyComponent,
    // ...
}
```

### 渲染器处理组件

**渲染器**会使用虚拟节点的 type 属性来区分其类型。对于不同的节点，就需要采用不同的处理方法来完成挂载和更新。

```js{16-23}

function patch(n1, n2, container, anchor) {
    if (n1 && n1.type !== n2.type) {
        unmount(n1)
        n1 = null
    }

    const { type } = n2
    
    if (typeof type === 'string') {
        // 作为普通元素处理
    } else if (type === Text) {
        // 作为文本节点处理
    } else if (type === Fragment) {
        // 作为片段处理
    } else if (typeof type === 'object') {
        // component
        if (!n1) {
            mountComponent(n2, container, anchor)
        } else {
            patchComponent(n1, n2, anchor)
        }
    }
}
```

通过在 patch 函数中对组件类型逻辑分支的补充，渲染器因此有了处理组件的能力。

### 组件接口设计

::: tip 接下来，要设计组件在用户层面的接口

1. 用户应该如何编写组件？
2. 组件的选项对象必须包含哪些内容？
3. 组件拥有哪些能力？

:::

🚀 组件本身是对页面内容的封装，它用来描述页面内容的一部分。因此，一个组件**必须包含一个渲染函数**，即 render 函数，并且渲染函数的返回值应该是虚拟 DOM。

换句话说，**组件的渲染函数就是用来描述组件所渲染内容的接口**。

```js
// vnode.type
const MyComponent = {
    name: 'MyComponent',
    // 组件的渲染函数，其返回值必须为虚拟 DOM
    render() {
        return {
            type: 'div',
            children: '我是文本'
        }
    }
}
```

这是一个简单的组件实例。有了基本的组件结构之后，渲染器就可以完成组件的渲染：

```js
// 组件类型的 VNode
const CompVNode = {
    type: MyComponent,  // 上面声明的组件对象
}
// 调用渲染器来渲染组件
renderer.render(CompVNode, document.querySelector('#app'))
```

渲染器中真正完成组件渲染的是 mountComponent 函数，其具体实现如下：

```js
function mountComponent(vnode, container, anchor) {
	// 通过 vnode 获取组件的选项对象，即 vnode.type
    const componentOptions = vnode.type
    // 获取组件的 render 函数
    const { render } = componentOptions
    // 执行 render函数，得到组件要渲染内容的虚拟 DOM
    const subTree = render()
    // 挂载组件内容到父节点
    patch(null, subTree, container, anchor)
}
```

这样，我们就实现了最基本的组件化方案。

## 组件状态与自更新

### 组件状态设计

为组件设计自身的状态：为组件对象补充一个 data 函数，将其返回值作为组件的状态

```js
const MyComponent = {
    name: 'MyComponent',
    // 用 data 函数来定义组件自身的状态
    data() {
        return {
            foo: 'hello world'
        }
    }
    render() {
        return {
            type: 'div',
            children: `foo 的值是： ${this.foo}`  // 在render函数中使用组件状态
        }
    }
}
```

📝 以上代码约定用户必须使用 data 函数来定义组件自身的状态，同时可以在渲染函数中通过 this 访问由 data 函数返回的状态数据。

下面代码实现了组件自身**状态的初始化**：

```js
function mountComponent(vnode, container, anchor) {
    const componentOptions = vnode.type
    const { render, data } = componentOptions
    
    // 调用 data 函数获得组件状态，并将其包装为响应式数据
    const state = reactive(data())
    // 将 render 函数的 this 设置为组将状态对象
	const subTree = render.call(state, state)
    patch(null, subTree, container, anchor)
}
```

::: details 实现组件自身状态的初始化

1. 通过组件的选项对象取得 data 函数并执行，然后调用 reactive 函数将 data 函数返回的状态包装为响应式数据；
2. 在调用 render 函数时，将其 this 的指向设置为响应式数据 state，同时将 state  作为 render 函数调用的第一个参数传递。

:::

✅ 经过这两个步骤之后，我们就实现了对组件自身**状态**的支持，以及在渲染函数内**访问**组件自身状态的能力。

### 组件的自更新

当组件状态发生变化的时候，我们还需要有能力触发组件更新，即组件的自更新。为此，我们需要把整个渲染任务包装到一个 effect 中：

```js
function mountComponent(vnode, container, anchor) {
    const componentOptions = vnode.type
    const { render, data } = componentOptions

    const state = reactive(data())

    effect(()=>{
        const subTree = render.call(state, state)
        patch(null, subTree, container, anchor)
    })
}
```

这样，数据一旦变化，那么渲染任务便会自动执行。但是，如果多次改变响应式数据的值，会导致渲染函数执行多次，这实际上是没有必要的。

我们需要一个机制是的无论响应式数据进行多少次修改，副作用函数都只会执行一次。这个借助之前的**调度器**即可实现：

🌐 [调度器 (opens new window)](https://www.ijerrychen.com/VueJs3/section2/chapter4.html#%E8%B0%83%E5%BA%A6%E6%89%A7%E8%A1%8C)

```js
// 任务缓存队列，Set 可自动去重
const queue = new Set()
// 一个标志，代表是否正在刷新任务队列
let isFlushing = false
// 创建一个立即 resolve 的 Promise 实例
const p = Promise.resolve()

// 调度器的主要函数，用来将一个任务添加到缓冲队列中，并开始刷新队列
function queueJob(job) {
    // 将 job 添加到任务队列 queue 中
    queue.add(job)
    // 如果还没有开始刷新队列，则刷新之
    if(!isFlushing) {
        // 将该标志设置为 true 以避免重复刷新
       isFlushing = true
        // 在该任务队列中刷新任务
        p.then(()=>{
            try {
                // 执行任务队列中的任务
                queue.forEach(job => job())
            } finally {
                // 重置任务
                isFlushing = false
                queue.clear()
            }
        })
    }
}
```

上面为调度器的最小实现，本质上利用了**微任务的异步执行机制**，实现对副作用函数的缓冲。有了调度器函数，我们可以在创建渲染副作用时使用它：

```js{12}
function mountComponent(vnode, container, anchor) {
    const componentOptions = vnode.type
    const { render, data } = componentOptions

    const state = reactive(data())

    effect(()=>{
        const subTree = render.call(state, state)
        patch(null, subTree, container, anchor)
    }, {
        // 指定该副作用函数的调度器
        scheduler: queueJob
    })
}
```

✅ 这样，当响应式数据发生变化时，副作用函数不会立即执行，而是会被 queueJob 函数调度，最后在一个微任务中执行。

目前，patch 的第一个参数总是 null，也就是说我们每次渲染都是全新的挂载，而不会打补丁。我们需要对此进行处理，更新时可以进行打补丁。为此，我们需要实现组件实例，用它来维护组件整个生命周期的状态，这样渲染器才能够在正确的时机执行合适的操作。

## 组件的实例与生命周期

### 组件实例

组件实例本质上就是一个状态集合（或一个对象），它维护着组件运行过程中的所有信息，例如注册到组件的生命周期函数、组件渲染的子树（subTree）、组件是否已经挂载、组件自身的状态（data）等等。为了解决目前组件更新的问题，我们需要引入组件实例的概念，以及与之相关的状态信息：

```js
function mountComponent(vnode, container, anchor) {
    let componentOptions = vnode.type
    let { render, data } = componentOptions

    const state = data ? reactive(data())
    // 定义组件实例，一个包含着组件状态信息的对象
    const instance = {
        state,  // 组件自身状态数据，即 data
        isMounted: false,  // 组件是否已经挂载
        subTree: null,  // 组件所渲染的内容，即子树（subTree）
    }
    // 将组件实例设置到 vnode 上，用于后续更新
    vnode.component = instance

    effect(() => {
        // 调用组件的渲染函数，获得要渲染的内容
        const subTree = render.call(state, state)
        if (!instance.isMounted) {  // 初次挂载
            patch(null, subTree, container, anchor) 
            instance.isMounted = true
        } else {  // 更新 => 打补丁
            patch(instance.subTree, subTree, container, anchor)
        }
        // 更新组件实例的子树，方便后续打补丁的比较
        instance.subTree = subTree
    }, {
        scheduler: queueJob
    })
}
```

::: details 组件实例对象

- state：组件自身的状态数据，即 data
- isMounted：一个布尔值，用来表示组件是否已经被挂载
- subTree：存储组件的渲染函数所返回的虚拟 DOM，即组件的子树（subTree）

✅ 这样，我们可以根据需要，任意得在组件实例 instance 上添加需要的属性。但需要注意的是，我们应该尽可能保持组件实例轻量，以减少内存占用

:::

### 声明周期函数

目前组件实例的 isMounted 属性可以用来区分组件的挂载和更新。因此，我们可以在合适的时机**调用**组件的**声明周期钩子**：

```js{3,5,17,22,25,27,29}
function mountComponent(vnode, container, anchor) {
    let componentOptions = vnode.type
    let { render, data, beforeCreate, created, beforeMount, mounted, beforeUpdate, updated } = componentOptions

    beforeCreate && beforeCreate()

    const state = data ? reactive(data()

    const instance = {
        state,
        isMounted: false,
        subTree: null,
    }

    vnode.component = instance

    created && created.call(state)

    effect(() => {
        const subTree = render.call(state, state)
        if (!instance.isMounted) {
            beforeMount && beforeMount.call(state)
            patch(null, subTree, container, anchor)
            instance.isMounted = true
            mounted && mounted.call(state)
        } else {
            beforeUpdate && beforeUpdate.call(state)
            patch(instance.subTree, subTree, container, anchor)
            updated && updated.call(state)
        }
        instance.subTree = subTree
    }, {
        scheduler: queueJob
    })
}
```

✅ 在上面这段代码中，我们首先从组件的选项对象中取得注册到组件上的声明周期函数，然后在合适的时机调用它们，这其实就是组件生命周期的实现原理。

> 实际上，一个组件可以存在多个同样的生命周期钩子，例如 mixins。因此我们通常需要将组件的声明周期钩子序列化为一个数组，但核心原理不变。

## props 与组件的被动更新

### props 与 attrs

在虚拟 DOM 层面，组件的 props 与普通 HTML 标签的属性差别不大。假设我们有模板如下：

```html
<MyComponent title="A Big Title" :other="val" />
```

这段模板对应的虚拟 DOM 是：

```js
const vnode = {
	type: MyComponent,
    props: {
        title: 'A Big Title',
        other: this.val
    }
}
```

可以看到，模板与虚拟 DOM 几乎是“同构”的。同时，在编写组件时，我们需要显示地指定组件要接收哪些数据：

```js
const MyComponent = {
    name: 'MyComponent',
    // 组件接收一个 String 类型的 title 属性
    props: {
        title: String
    }
    render() {
        return {
            type: 'div',
            children: `foo 的值是： ${this.title}`
        }
    }
}
```

::: tip 所以对于一个组件来说，有两部分关于 props 的内容我们需要关心：

- 为组件传递的 props 数据，即组件的 vnode.props 对象。（组件都接收到了什么）
- 组件选项对象中定义的 props 选项，即 MyComponent.props 对象。（组件要什么）

:::

我们需要结合这两个选项解析出组件在渲染时需要用到的 props 数据：

:::: code-group
::: code-group-item resolveProps

```js
/**
   * @description: 
   * @param {Object} options：组件props声明要接收的属性
   * @param {Object} propsData：vnode节点接收到的全部属性
   * @return {[Props, Attrs]}
   */
function resolveProps(options, propsData) {
    const props = {}
    const attrs = {}
    for (const key in propsData) {
        // 如果属性被组件声明在 props 对象中，则为 props
        if (options && key in options) {
            props[key] = propsData[key]
        } else {
            // 否则就是 attrs
            attrs[key] = propsData[key]
        }
    }

    return [ props, attrs ]
}
```
:::
::: code-group-item props 与 attrs 解析

```js
function mountComponent(vnode, container, anchor) {
    let componentOptions = vnode.type
    let { render, data, props: propsOption /* 其它省略 */ } = componentOptions

    beforeCreate && beforeCreate()

    const state = data ? reactive(data()
                                  
    // 调用 resolveProps 函数解析出最终的 props 数据与 attrs 数据
    const [props, attrs] = resolveProps(propsOption, vnode.props)

    const instance = {
        state,
        // 将解析出的 props 数据保包装为 shallowReactive 并定义到组件实例上
        props: shallowReactive(props),
        isMounted: false,
        subTree: null,
    }

    vnode.component = instance

    created && created.call(state)

    effect(() => {
        const subTree = render.call(state, state)
        if (!instance.isMounted) {
            beforeMount && beforeMount.call(state)
            patch(null, subTree, container, anchor)
            instance.isMounted = true
            mounted && mounted.call(state)
        } else {
            beforeUpdate && beforeUpdate.call(state)
            patch(instance.subTree, subTree, container, anchor)
            updated && updated.call(state)
        }
        instance.subTree = subTree
    }, {
        scheduler: queueJob
    })
}
```
:::
::::

> 在 Vue.js3 中，没有定义在 MyComponent.props 选项中的 props 数据将存储到 attrs 对象中。
>
> 上述实现没有包含默认值、类型校验等内容的处理。实际上，这些内容也都是围绕 MyComponent.props 和 vnode.props 这两个对象展开的。