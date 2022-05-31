# 组件的实现原理

渲染器主要负责将虚拟 DOM 渲染为真实 DOM，我们只需要使用虚拟 DOM 来描述最终要呈现的真实 DOM 即可。

但当我们编写比较复杂的页面时，用来描述页面结构的虚拟 DOM 的代码量会越来越多，或者说页面模板会变得越来越大。这时，我们就需要组件化的能力。

有了组件，我们就可以将一个大的页面拆分为多个部分，每个部分都可以作为单独的组件，这些组件共同组成完整的页面。组件化的实现同样需要渲染器的支持。

## 渲染组件

> - 使用虚拟节点的 `vnode.type` 属性来存储组件对象，渲染器根据虚拟节点的该属性的类型来判断它是否是组件。
> - 如果是组件，则渲染器会调用 `mountComponent` 和 `patchComponent` 来完成组件的挂载和更新。

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

```js{16-22}
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

> - 在组件的挂载阶段，会为组件创建一个用于渲染其内容的副作用函数。该副作用函数会与组件自身的响应式数据建立响应联系。当组件自身的响应式数据发生变化时，会触发渲染副作用函数重新执行，即重新渲染。
> - 默认情况下重新渲染是重新执行的，这导致无法去重，因此我们在创建渲染副作用函数时，制定了一个自定义的调用器。该调度器的作用是：当组件自身的响应式数据发生变化时，将渲染副作用函数缓冲到微任务队列中。
> - 有了缓冲队列，我们即可实现对渲染任务的去重，从而避免无用的重新渲染所导致的额外性能开销。

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

> - 组件实例本质上是一个对象，包含了组件运行过程中的状态（组件是否挂载、组件自身的响应式数据，以及组件所渲染的内容 `subTree` 等等）。
> - 渲染副作用函数可以根据组件实例的状态标识来决定是否应该进行权限的挂载，还是应该打补丁。

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

> - 副作用子更新所引起的子组件更新叫做子组件的被动更新。
> - 渲染上下文`renderContext` 实际上是组件实例的代理对象。在渲染函数内访问组件所暴露的数据都是通过该代理对象实现的。

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

### 被动更新

```html
<child-component :title="title" />
```

假设父组件内使用了子组件，并且传递了一个响应式数据 title。当 title 发生变化时，父组件的渲染函数会重新执行，也就是**自更新**。在更新过程中，渲染器发现父组件的 `subTree` 包含组件类型的虚拟节点，所以会调用 `patchComponent` 函数完成子组件的更新。

::: tip 被动更新: 由父组件自更新所引起的子组件更新

- 检测子组件是否真的需要更新，因为子组件的 props 可能是不变的；
- 如果需要更新，则更新子组件的 props、slots 等内容。

:::

:::: code-group
::: code-group-item patchComponent

```js
function patchComponent(n1, n2, anchor) {
    // 获取组件实例，即 n1 旧 vnode 的component，同时让新的组件虚拟节点 n2.component 也指向组件实例
    const instance = (n2.component = n1.component)
    // 获取当前的 props 数据
    const { props } = instance
    // 检测传递给子组件的 props 是否发生变化，有变化才更新
    if (hasPropsChanged(n1.props, n2.props)) {
        // 调用 resolveProps 重新获取 props 数据
        const [ nextProps, nextAttrs ] = resolveProps(n2.type.props, n2.props)
        // props 更新与删除
        for (const k in nextProps) {
            props[k] = nextProps[k]
        }
        for (const k in props) {
            if (!(k in nextProps)) delete props[k]
        }
    }
}
```

:::
::: code-group-item hasPropsChanged

```js
function hasPropsChanged(prevProps, nextProps) {
    const nextKeys = Object.keys(nextProps)
    if (nextKeys.length !== Object.keys(prevProps).length) {
        return true
    }
    for (let i = 0; i < nextKeys.length; i++) {
        const key = nextKeys[i]
        return nextProps[key] !== prevProps[key]
    }
    return false
}
```

:::
::::

- 需要把组件实例添加到新的组件 vnode 对象上，即 `n2.component = n1.component`，否则下次更新时将无法取得组件实例；
- `instance.props` 对象本身是浅响应的（shallowReactive）。因此，在更新组件 props 时，只需要设置 `instance.props` 对象下的属性值即可触发组件重新渲染。

### 渲染上下文对象

由于 props 数据与组件自身的状态数据都需要暴露到渲染函数中，并使得渲染函数能够通过 this 访问它们，因此我们需要封装一个渲染上下文对象。

```js
function mountComponent(vnode, container, anchor) {
    // ...
    const instance = {
        state,
        props: shallowReactive(props),
        isMounted: false,
        subTree: null,
    }

    vnode.component = instance
    // 创建渲染上下文对象，本质是组件实例的代理
    const renderContext = new Proxy(instance, {
        get(t, k, r) {
            const { state, props, slots } = t

            if (k === '$slots') return slots

            if (state && k in state) {
                return state[k]
            } else if (k in props) {
                return props[k]
            } else if (setupState && k in setupState) {
                return setupState[k]
            } else {
                console.error('不存在')
            }
        },
        set (t, k, v, r) {
            const { state, props } = t
            if (state && k in state) {
                state[k] = v
            } else if (k in props) {
                props[k] = v
            } else if (setupState && k in setupState) {
                setupState[k] = v
            } else {
                console.error('不存在')
            }
        }
    })

    // 声明周期函数调用时要绑定渲染上下文对象
    created && created.call(renderContext)
    // ...
}
```

✅  通过创建一个组件实例的**代理对象**，这个对象就是渲染上下文对象。每当渲染函数或者声明周期函数钩子中通过 this 来访问数据时，都会优先从组件自身状态中读取，如果组件本身没有对应的数据，则再从 props 数据中读取。然后我们将这个渲染上下文对象作为渲染函数和声明周期钩子函数的 this 即可。

> 除了组件自身的数据和 props 数据之外，完整的组件还包含 methods、computed 等组件选项中定义的方法，这些内容都应该在渲染上下文对象中处理。

## setup 函数的作用与实现

### setup 函数

::: tip setup 函数是 Vue.js 3 新增的组件选项，它主要是用于配合组件式 API，为用户提供一个地方，用于建立组合逻辑、创建响应式数据、创建通用函数、注册生命周期钩子等能力。

1. 在组件整个生命周期中，setup 函数只会执行一次，它的**返回值**可以是一个 render 函数，也可以是一个对象；
2. setup 函接接收两个**参数**，分别是 props 数据对象和一个 setupContext 对象。

:::

::: details setupContext

- slots：组件接收到的插槽。
- emit：一个函数，用来发射自定义事件。
- attrs：当为组件传递 props 时，那些没有显示地声明为 props 属性会存储到 attrs 中。
- expose：一个函数，用来显示定义组件对外暴露的数据。

:::

:::: code-group
::: code-group-item 返回 render 函数

```js
const comp = {
    // setup 函数可以返回一个函数，该函数将作为组件的渲染函数
    setup() {
        return () => {
            return { type: 'div', children: 'hello' }
        }
    }
}
```

:::
::: code-group-item 返回对象

```js
const comp = {
    // setup 函数对象，对象中的数据会暴露到渲染函数中
    setup() {
        const count = ref(0)
        return { count }
    },
    render() {
        return { type: 'div', children: `count is: ${this.count}` }
    }
}
```

:::
::: code-group-item 参数

```js
const comp = {
    prosp: {
        foo: String
    },
    setup(props, setupContext) {
        props.foo  // 访问传入的 props 数据
        const { slots, emit, attrs, expose } = setupContext
    },
}
```

:::

::::

### setup 实现

✅  通过检测 setup 函数的返回值来判断如何处理它。如果返回一个函数，那么组件的 render 选项将被忽略；如果返回一个对象，那么对象将作为组件的状态数据 `setupState`。

```js
function mountComponent(vnode, container, anchor) {
    let componentOptions = vnode.type
    let { render, data, setup } = componentOptions

    beforeCreate && beforeCreate()

    const state = data ? reactive(data()) : null
    const [props, attrs] = resolveProps(propsOption, vnode.props)

    const slots = vnode.children || {}

    const instance = {
        state,
        props: shallowReactive(props),
        isMounted: false,
        subTree: null,
    }

    const setupContext = { attrs }  // emit,slots,expose...
    // 调用 setup 函数，将只读版本的 props 传给 setup 作为第一个参数
    // setupContext 为第二个参数
    const setupResult = setup(shallowReadonly(instance.props), setupContext)
    let setupState = null
    if (typeof setupResult === 'function') {
        if (render) console.error('setup 函数返回渲染函数，render 选项将被忽略')
        render = setupResult
    } else {
        // 如果 setup 返回一个对象，则作为数据状态赋值给 setupState
        setupState = setupContext
    }

    vnode.component = instance

    const renderContext = new Proxy(instance, {
        get(t, k, r) {
            const { state, props } = t
            if (state && k in state) {
                return state[k]
            } else if (k in props) {
                return props[k]
            } else if (setupState && k in setupState) {
                // 渲染上下文需要增加对 setupState 的支持
                return setupState[k]
            } else {
                console.error('不存在')
            }
        },
        set (t, k, v, r) {
            const { state, props } = t
            if (state && k in state) {
                state[k] = v
            } else if (k in props) {
                props[k] = v
            } else if (setupState && k in setupState) {
                setupState[k] = v
            } else {
                console.error('不存在')
            }
        }
    })
    // ... created
}
```

## 组件事件与 emit 实现

- 组件内通过 emit 方法发射事件，组件可以监听由 emit 函数发射的自定义事件；
- emit 实际上就是根据名称 去 props 对象中寻找对应的事件处理函数并执行；
- 只需要实现 emit 函数并添加到 setupContext 对象中；
- 我们约定 on 开头的 props 属性要作为事件处理，所以这些属性要都放到 props 当中。

:::: code-group
::: code-group-item emit

```js
const MyComponen = {
    name: 'MyComponent'
    setup(props, { emit }) {
        // 发射 change 事件，并传递必要参数
        emit('change', 1, 2)
        return () => {
            return // ...
        }
    }
}
```

:::
::: code-group-item onchange

```html
<MyComponen @change="handler" />
```

:::
::: code-group-item 虚拟 DOM

```js
const CompVNode = {
    type: MyComponent,
    props: {
        onChange: handler
    }
}
```

:::

::: code-group-item 实现 emit

```js
function emit(event, ...payload) {
    const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
    const handler = instance.props[eventName]
    if (handler) {
        handler(...payload)
    } else {
        console.error('事件不存在')
    }
}
```

:::

::: code-group-item resolveProps 调整

```js
function resolveProps(options, propsData) {
    const props = {}
    const attrs = {}
    for (const key in propsData) {
        // 以字符串 on 开头的 props, 无论是否显示地声明使用，都添加到 props 而不是 attrs
        if ((options && key in options) || key.startsWith('on')) {
            props[key] = propsData[key]
        } else {
            attrs[key] = propsData[key]
        }
    }
    return [ props, attrs ]
}
```

:::

::::

> Vue.js 3 需要在 emits 属性中声明组件会 emit 的事件，那么 `resolveProps` 可以通过这个 emits 来判断属性是不是需要放到 props 里

## 插槽的工作原理及实现

> - 组件的插槽借鉴了 Web Component 中 `<slot>` 标签的概念。插槽内容会被编译成插槽函数，插槽函数的返回值就是向插槽中填充的内容。
> - `<slot>`  标签则会被编译为插槽函数的调用，通过执行对应的插槽函数，得到外部向槽位填充的内容（即虚拟 DOM），最后将该内容渲染到槽位中。

:::: code-group
::: code-group-item 组件模板

```html
<template>
    <header><slot name="header" /></header>
    <div>
        <slot name="body" />
    </div>
    <footer><slot name="footer" /></footer>
</template>
```

顾名思义，组件的插槽指组件会预留一个槽位，该槽位具体要渲染的内容由用户插入

:::
::: code-group-item 父组件

```html
<MyComponent>
    <template #header>
		<h1>我是标题</h1>
    </template>
    <template #body>
		<section>我是内容</section>
    </template>
    <template #footer>
		<p>我是脚注</p>
    </template>
</MyComponent>
```

当父组件使用`<MyComponen>` 组件时，可以根据插槽的名字来插入自定义的内容

:::
::: code-group-item 父组件 render 函数

```js
// 父组件的渲染函数
function render() {
    return {
        type: MyComponent,
        // 组件的 children 会被编译成一个对象
        children: {
            header() {
                return { type: 'h1', children: '我是标题' }
            },
            body() {
                return { type: 'section', children: '我是内容' }
            },
            footer() {
                return { type: 'p', children: '我是猪脚' }
            }
        }
    }
}
```

✅ 组件模板中的插槽内容会被编译为**插槽函数**，而插槽函数的返回值就是具体的插槽内容。

:::

::: code-group-item MyComponent render 函数

```js
//  MyComponent 组件的渲染函数
function render() {
    return [
        {
            type: 'header',
            children: [this.$slots.header()]
        },
        {
            type: 'body',
            children: [this.$slots.body()]
        },
        {
            type: 'footer',
            children: [this.$slots.footer()]
        },
    ]
}
```

✅ 渲染插槽的过程，就是调用插槽函数并渲染有其返回的内容的过程

:::

::: code-group-item slots 处理

```js
function mountComponent(vnode, container, anchor) {
    // ...

    // 直接使用编译好的 vnode.children 对象作为 slots 对象即可
    const slots = vnode.children || []
    
    // 将 slots 对象添加到 setupContext 对象中
    const setupContext =  { attrs, emit. slots }
}
```

在运行时的实现上，插槽则依赖于 setupContext 中的 slots 对象

:::

::: code-group-item 最小实现

```js
function mountComponent(vnode, container, anchor) {
    // ...
    const slots = vnode.children || {}

    const instance = {
        state,
        props: shallowReactive(props),
        isMounted: false,
        subTree: null,
        slots,  // 将插槽添加到组件实例上
    }

    // ...

    const renderContext = new Proxy(instance, {
        get(t, k, r) {
            const { state, props, slots } = t
            // 当 k 的值为 $slots 时，直接返回组件实例上的 slots
            if (k === '$slots') return slots
            
            // ...
        },
        set (t, k, v, r) {
            // ...
        }
    })
}
```

我们对 渲染上下文 `renderContext` 代理对象的 get 拦截函数做了特殊处理，当读取的键是 $slots 时，直接返回组件实例上的 slots 对象，这样用户就可以通过 this.$slots 来访问插槽内容了。

:::

::::

> 组件插槽函数的调用是一定的，外部是否传入插槽函数是不确定的。

## 注册生命周期

在 Vue.js 3中，一部分组合式 API 是用来注册生命周期钩子函数（onMounted、onUpdated等等）。它们可以被**多次**调用注册。

✅  在不同的组件中调用生命周期钩子注册函数会将其注册到当前组件上，这个可以由一个变量`currentInstance` 存储当前组件实例实现。这个思路和`activeEffect`一致。通过它获取当前正在被初始化的组件实例，从而将那些通过 `onMounted` 函数注册的钩子函数与组件实例进行关联。

:::: code-group
::: code-group-item currentInstance

```js
// 全局变量，存储当前正在被初始化的组件实例
let currentInstance = null

function setCurrentInstance(instance) {
    currentInstance = instance
}
```

:::

::: code-group-item mountComponent

```js
function mountComponent(vnode, container, anchor) {
    // ...
    const instance = {
        state,
        props: shallowReactive(props),
        isMounted: false,
        subTree: null,
        slots,
        // 存储 onMounted 注册的生命周期钩子函数
        mounted: []
    }

    const setupContext = { attrs, emit, slots }

    // 在调用 setup 之前，设置当前组件实例
    setCurrentInstance(prevInstance)
    // 执行 setup 函数
    const setupResult = setup(shallowReadonly(instance.props), setupContext)
    // 在 setup 函数执行完毕之后，重置当前组件实例
    setCurrentInstance(null)
    
    // ...
}
```

以上代码以 onMounted 函数为例。在 instance.mounted 数组存储注册的生命周期钩子。

:::

::: code-group-item onMounted

```js
function onMounted(fn) {
    if (currentInstance) {
        currentInstance.mounted.push(fn)
    } else {
        console.error('onMounted 函数只能在 setup中调用')
    }
}
```

可见整体的实现非常直观。只需要通过 currentInstance 获取当前组件实例的生命周期钩子数组，然后添加即可。

:::

::: code-group-item 执行生命周期钩子

```js
function mountComponent(vnode, container, anchor) {
    // ...
    
    effect(() => {
        const subTree = render.call(renderContext, renderContext)
        if (!instance.isMounted) {
            beforeMount && beforeMount.call(renderContext)
            patch(null, subTree, container, anchor)
            instance.isMounted = true
            mounted && mounted.call(renderContext)
            // 遍历 instance.mounted 数组并逐个执行即可
            instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext))
        } else {
            beforeUpdate && beforeUpdate.call(renderContext)
            patch(instance.subTree, subTree, container, anchor)
            updated && updated.call(renderContext)
        }
        instance.subTree = subTree
    }, {
        scheduler: queueJob
    })
}
```

:::

::::

> 对于除 mounted 以外的生命周期钩子函数，其原理同上。