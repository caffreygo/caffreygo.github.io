# 内建组件和模块

## KeepAlive 组件的实现原理

### 组件的激活与失活

::: tip KeepAlive 

KeepAlive 一词借鉴于 HTTP 协议。在 HTTP 协议中，KeepAlive 又称 HTTP 持久连接（HTTP persistent connection），其作用是允许多个请求或响应共用一个 TCP 连接。在没有 KeepAlive 的情况下，一个 HTTP 连接会在每次请求/响应结束后关闭，当下一次请求发生时，会建立一个新的 HTTP 连接。频繁地销毁、创建 HTTP 连接会带来额外的性能开销，KeepAlive 就是为了解决这个问题而生的。

:::

✅ HTTP 中的 KeepAlive 可以避免连接频繁地销毁/创建，与 HTTP 中的 KeepAlive 相似，Vue.js 内建的 KeepAlive 组件可以**避免一个组件被频繁地销毁/重建**。

:::: code-group
::: code-group-item Tab 组件

```html
<template>
    <Tab v-if="currentTab === 1"></Tab>
    <Tab v-if="currentTab === 2"></Tab>
    <Tab v-if="currentTab === 3"></Tab>
</template>
```

模板内根据 `currentTab` 的值不同，会渲染不同的 `<Tab>` 组件。当用户频繁地切换 Tab 时，会导致不停地卸载并重建对应的 `<Tab>`  组件。为了避免因此产生的性能开销，可以使用 KeepAlive 组件来解决这个问题。

:::

::: code-group-item Transition

```html
<template>
    <KeepAlive>
        <Tab v-if="currentTab === 1"></Tab>
        <Tab v-if="currentTab === 2"></Tab>
        <Tab v-if="currentTab === 3"></Tab>
    </KeepAlive>
</template>
```

KeepAlive 能够避免频繁的创建和销毁，因而会极大地优化对用户的操作响应，有其是大组件场景下。

:::

::::

::: details 假卸载

KeepAlive 组件的实现需要**渲染器**层面的支持，它在卸载时，我们不能真的将其卸载，否则就无法维持组件当前的状态。而是将被 KeepAlive 的组件从原容器搬运到另外一个**隐藏容器**中。当被搬运到隐藏容器的组件再次被“挂载”时，我们也不能执行真正的挂载逻辑，而应该把该组件从隐藏容器中再搬运到原容器。这个过程对应的生命周期就是 `activated` 和 `deactivated`

> KeepAlive 的本质是缓存管理，再加上特殊的挂载/卸载逻辑

::: 

:::: code-group
::: code-group-item 基本实现

```js
const KeepAlive = {
    // KeepAlive 组件独有的属性标识
    __isKeepAlive: true,
    setup(props, { slots }) {
        // 缓存对象 Record<vnode.type, vnode>
        const cahche = new Map()
        // 当前 KeepAlive 的组件实例
        const instance = currentInstance
        // 对于 KeepAlive 组件来说，它的实例上存在特殊的 KeepAliveCtx 对象，该对象由渲染器注入
        // 该对象暴露了一些内部方法，move 实现 DOM 的移动到容器
        const { move, createElement } = instance.keepAliveCtx

        // 创建隐藏容器
        const storageContainer = createElement('div')

        // KeepAlive 组件的实例会被添加两个内部函数，在渲染器中被调用
        instance._deActivate = (vnode) => {
            move(vnode, storageContainer)
        }
        instance._activate = (vnode, container, anchor) => {
            move(vnode, container, anchor)
        }

        return () => {
            // KeepAlive 的默认插槽内容就是要被 KeepAlive 的组件
            let rawVNode = slots.default()
            // KeepAlive 只处理组件
            if (typeof rawVNode.type !== 'object') {
                return rawVNode
            }

            // 缓存处理
            const cachedVNode = cache.get(rawVNode.type)
            if (cachedVNode) {
                // 有缓存组件，不是挂载，走激活逻辑
                rawVNode.component = cachedVNode.component
                rawVNode.keptAlive = true
            } else {
                cache.set(rawVNode.type, rawVNode)
            }

            // 属性标记，避免渲染器将组件卸载
            rawVNode.shouldKeepAlive = true
            // 添加 KeepAlive 组件的实例到 vnode，方便渲染器的访问
            rawVNode.keepAliveInstance = instance
            // 返回被 KeepAlive 的组件本身
            return rawVNode
        }
    }
}
```

KeepAlive 组件的实现与渲染器的结合较深。首先，KeepAlive 组件本身并不会渲染额外的内容，它的渲染函数最终只返回需要被 KeepAlive 的组件，这个需要被 KeepAlive 的组件称为“**内部组件**”。KeepAlive 组件会对“内部组件”进行操作，主要是在“内部组件”的 vnode 对象上添加一些**属性标记**，以便渲染器据此执行特定的逻辑。

> `mountComponent`在调用 `setup` 函数之前会 `setCurrentInstance`
>
> 组件的 `setup` 函数里通过 `currentInstance` 就能拿到当前组件的实例
>
> 它包括了当前组件的 state、props、subTree、slots、mounted等等信息

:::

::: code-group-item unmount 假卸载

```js
function unmount(vnode) {
    if (vnode.type === Fragment) {
        vnode.children.forEach(c => unmount(c))
        return
    } else if (typeof vnode.type === 'object') {
        // 对于需要被 KeepAlive 的组件，我们不能真的卸载它，而是调用其父组件
        // 即 KeepAlive 组件的 _deActivate 函数使其失活
        // keepAliveInstance 即 KeepAlive 组件实例
        if (vnode.shouldKeepAlive) {
            vnode.keepAliveInstance._deActivate(vnode)
        } else {
            unmount(vnode.component.subTree)
        }
        return
    }
    const parent = vnode.el.parentNode
    if (parent) {
        parent.removeChild(vnode.el)
    }
}
```

:::

::: code-group-item unmount 组件激活

```js{34-35}
function patch(n1, n2, container, anchor) {
    if (n1 && n1.type !== n2.type) {
        unmount(n1)
        n1 = null
    }

    const { type } = n2

    if (typeof type === 'string') {
        if (!n1) {
            mountElement(n2, container, anchor)
        } else {
            patchElement(n1, n2)
        }
    } else if (type === Text) {
        if (!n1) {
            const el = n2.el = createText(n2.children)
            insert(el, container)
        } else {
            const el = n2.el = n1.el
            if (n2.children !== n1.children) {
                setText(el, n2.children)
            }
        }
    } else if (type === Fragment) {
        if (!n1) {
            n2.children.forEach(c => patch(null, c, container))
        } else {
            patchChildren(n1, n2, container)
        }
    } else if (typeof type === 'object' || typeof type === 'function') {
        if (!n1) {
            // 如果该组件以及被 KeepAlive,则不会重新挂载，而是调用 _activate 来激活它
            if (n2.keptAlive) {
                n2.keepAliveInstance._activate(n2, container, anchor)
            } else {
                mountComponent(n2, container, anchor)
            }
        } else {
            patchComponent(n1, n2, anchor)
        }
    }
```

:::

::: code-group-item 渲染器注入移动函数

```js{11,14-22}
function mountComponent(vnode, container, anchor) {
    // ...

    const instance = {
        state,
        props: shallowReactive(props),
        isMounted: false,
        subTree: null,
        slots,
        mounted: [],
        keepAliveCtx: null
    }

    const isKeepAlive = vnode.type.__isKeepAlive
    if (isKeepAlive) {
        instance.keepAliveCtx = {
            move(vnode, container, anchor) {
                insert(vnode.component.subTree.el, container, anchor)
            },
            createElement
        }
    }

  // ...
}
```

:::

::::

::: tip 总结

- `shouldKeepAlive`: 该属性被添加到“内部组件”的 vnode 对象上，这样当渲染器卸载“内部组件”时，可以通过检查该属性得知“内部组件”需要被 KeepAlive。于是，渲染器就不会真的卸载“内部组件”，而是会调用 `_deActivate` 函数完成搬运工作。
- `keepAliveInstance`：“内部组件”的 vnode 对象会持有 **KeepAlive 组件实例**，在 `unmount` 函数中会通过 keepAliveInstance 来访问 `_deActivate` 函数。
- `KeptAlive`：“内部组件”如果已经被缓存，则还会为其添加一个 `KeptAlive`标记。这样当“内部组件”需要重新渲染时，渲染器并不会重新挂载它，而会将其激活。

:::

### include 和 exclude

默认情况下，KeepAlive 组件会对所有“内部组件”进行缓存。但有时候用户期望只缓存特定组件，因此其支持了两个 props，分别是 `include` 和 `exclude`。

> `include`：显式配置应该被缓存的组件
>
> `exclude`：显式配置不应该被缓存的组件

:::: code-group
::: code-group-item props 定义

```js{4-5}
const KeepAlive = {
    __isKeepAlive: true,
    props: {
        include: RegExp,
        exclude: RegExp
    },
    setup(props, { slots }) {
        // ...
    }
}
```

这里为了简化问题，只允许为 `include` 和 `exclude` 设置正则类型的值。在 KeepAlive 组件被挂载时，它会根据“内部组件”的名称（即 name 选项）进行匹配。

:::

::: code-group-item 正则匹配

```js{14-28}
const KeepAlive = {
    __isKeepAlive: true,
    props: {
        include: RegExp,
        exclude: RegExp
    },
    setup(props, { slots }) {
        // ...
        return () => {
            let rawVNode = slots.default()
            if (typeof rawVNode.type !== 'object') {
                return rawVNode
            }
            // 获取内部组件的 name
            const name = rawVNode.type.name
            // 对 name 进行匹配
            if (
                name &&
                (
                    // 如果 name 无法被 include 匹配
                    (props.include && !props.include.test(name)) ||
                    // 或者被 exclude 匹配
                    (props.exclude && props.exclude.test(name))
                )
            ) {
                // 则直接渲染“内部组件”，不对其进行后续的缓存操作
                return rawVNode
            }

            // ,,,
        }
    }
}
```

:::

::::

✅ 目前通过正则匹配结果判断是否要对“内部组件”进行缓存。在此基础上，我们可以任意扩充匹配能力。例如，将 include 和 exclude 设计成多种类型值，允许用户指定字符串或函数，从而提供更加灵活的匹配机制。另外，在做匹配时，也可以不限于“内部组件”的名称，我们甚至可以让用户自行指定匹配要素。

但是无论如何，其原理都是不变的。

### 缓存管理

目前的缓存处理：

```js
const KeepAlive = {
    __isKeepAlive: true,
    setup(props, { slots }) {
        const cahche = new Map()
        return () => {
            const cachedVNode = cache.get(rawVNode.type)
            if (cachedVNode) {
                // 有缓存组件，不是挂载，走激活逻辑
                rawVNode.component = cachedVNode.component
                rawVNode.keptAlive = true
            } else {
                cache.set(rawVNode.type, rawVNode)
            }
			// ...
        }
    }
}
```

::: tip 缓存管理

- 这里的问题在于，当缓存不在时，总是会设置新的缓存。我们需要一个**阈值**防止缓存无限增加，当缓存数量超过指定阈值时对缓存进行修剪。

- Vue.js 当前所采用的修剪策略叫做“**最新一次访问**”，把当前访问（或渲染）的组件作为最新一次渲染的组价，并且该组件在缓存修剪过程中始终是安全的，即不会被修剪的。

  Tips: 可以维护一个缓存队列，访问或渲染时把组件位置放到队尾，超过阈值移除队首缓存

- 我们的关注点是缓存策略能否改变？甚至运行用户自定义缓存策略？为此，Vue.js 在用户接口层面新增了 `cache` 接口，运行用户**指定缓存策略**。

:::

:::: code-group
::: code-group-item 缓存阈值接口

```html
<KeepAlive :max="2">
    <component :is="dynamicComp" />
</KeepAlive>
```

:::

::: code-group-item 自定义缓存策略接口

```html
<KeepAlive :cache="cache">
    <Comp />
</KeepAlive>
```

:::

::: code-group-item 缓存实例

```js
const _cache = new Map()
const cache: KeepAliveCache = {
	get(key) {
        _cache.get(key)
    },
    set(key, value) {
        _cache.set(key, value)
    },
    delete(key) {
        _cache.delete(key)
    },
    forEach(fn) {
        _cache.forEach(fn)
    }
}
```

:::

::::

在 KeepAlive 组件的内部实现中，如果用户提供了自定义的缓存实例，则直接使用该缓存实例来管理缓存。从本质上来说，这等价于将缓存的管理权限从 KeepAlive 组件转交给用户了。

## Teleport 组件的实现原理

### Teleport 组件要解决的问题

通常情况下，在将虚拟 DOM 渲染为真实 DOM 时，最终渲染出来的真是 DOM 的层级结构与虚拟 DOM 的层级结构一致。

```html
<template>
    <div id="box" style="z-index: -1">
        <Overlay />
    </div>
</template>
```

在目前情况下，假设`<Overlay>`是个“蒙层”组件，它会被渲染到 id 为 box 的 div 标签下。但是由于 div 的 z-index 设置，这导致即使我们将 `<Overlay>`组件所渲染的内容的 z-inde 值设置为无穷大，也无法实现遮挡功能。

> 🌐 [Vue.js 2 实现简易传送门组件 (opens new window)](http://localhost:3000/note/daily.html#%E7%AE%80%E6%98%93%E4%BC%A0%E9%80%81%E9%97%A8%E7%BB%84%E4%BB%B6)
>
> 通常，我们在上述场景下，会选择直接在 body 标签下渲染“蒙层”内容。
>
> 在Vue.js 2 中我们只能通过原生 DOM API 来手动搬运 DOM 元素实现需求。这么做的缺点在于，手动操作 DOM 元素会使得元素的徐渲染与 Vue.js 的渲染机制脱节，并导致各种可预见或不可预见的问题。

✅ Teleport 组件可以将指定内容渲染到特定容器中，而不受 DOM 层级的限制。

```html
<template>
    <Teleport to="body">
        <div class="overlay"></div>
    </Teleport>
</template>

<style>
    .overlay {
        z-index: 999
    }
</style>
```

可见，Teleport 组件要渲染的内容都包含在 Teleport 组件内，即作为 Teleport 组件的插槽。通过为 Teleport 组件指定渲染目标 body，即 to 属性的值，该组件就会直接把它的插槽内容渲染到 body 下，而不会按照模板的 DOM 层级来渲染，于是就**实现了跨 DOM 层级的渲染**。

### 实现 Teleport 组件

Teleport 组件的实现也需要渲染器的底层支持。

:::: code-group
::: code-group-item patch 函数修改

```js{13,17-23}
function patch(n1, n2, container, anchor) {
    if (n1 && n1.type !== n2.type) {
        unmount(n1)
        n1 = null
    }
    const { type } = n2
    if (typeof type === 'string') {
        // ...
    } else if (type === Text) {
        // ...
    } else if (type === Fragment) {
        // ...
    } else if (typeof type === 'object' && type.__isTeleport) {
        // 组件选项中如果存在 __isTeleport 标识，则它是 Teleport 组件
        // 调用 Teleport 组件选项中的 process 函数将控制器交出去
        // 传递给 process 函数的第五个参数是渲染器的一些内部方法
        type.process(n1, n2, container, anchor, {
            patch,
            patchChildren,
            move(vnode, container, anchor) {
                insert(vnode.component ? vnode.component.subTree.el : vnode.el, container, anchor)
            }
        })
    } else if (typeof type === 'object' || typeof type === 'function') {
        // component ...
    }
}
```

🚀 首先要把 Teleport 组件的渲染逻辑从渲染器中分离出来：

- 可以避免渲染器逻辑代码“膨胀”；
- 当用户没有使用 Teleport 组件时，由于 Teleport 的渲染逻辑被分离，因此可以利用 Tree-Shaking 机制在最终的 bundle 中删除 Teleport 相关的代码，使得最终构建包的体积变小。

🌐 [良好的tree-shaking (opens new window)](http://localhost:3000/VueJs3/section1/chapter2.html#%E8%89%AF%E5%A5%BD%E7%9A%84tree-shaking)

> 通过`__isTeleport`标识判断是否是 Teleport 组件，然后调用组件选项中的 process 函数将渲染控制权完全交接出去，这样就实现了渲染逻辑的分离。

:::

::: code-group-item Teleport 组件定义

```js
const Teleport = {
    __isTeleport: true,

    process(n1, n2, container, anchor, internals) {
        // 在这里处理渲染逻辑
    }
}
```

Teleport 和普通组件不同，它有特殊的选项`__isTeleport`和`process`。

:::

::: code-group-item 用户模板

```html
<Teleport to="body">
    <h1>title</h1>
    <p>content</p>
</Teleport>
```

假设用户编写的一个模板如上

:::

::: code-group-item 编译结果设计

```js
function render() {
    return {
        type: Teleport,
        // 以普通 children 的形式代表被 Teleport 的内容
        children: [
            {type: 'h1', children: 'title'},
            {type: 'p', children: 'content' }
        ]
    }
}
```

通常一个组件的子节点会被编译为插槽内容，不过对于 Teleport 组件来说，直接将其子节点编译为一个数组即可。

:::

::: code-group-item Teleport 组件实现

```js
const Teleport = {
    __isTeleport: true,
    process(n1, n2, container, anchor, internals) {
        // 通过 internals 参数取得渲染器的内部方法
        const { patch, patchChildren, move } = internals
        if (!n1) {
            // 挂载，获取容器，即挂载点
            const target = typeof n2.props.to === 'string'
            ? document.querySelector(n2.props.to)
            : n2.props.to
            n2.children.forEach(c => patch(null, c, target, anchor))
        } else {
            // 更新
            patchChildren(n1, n2, container)
            if (n2.props.to !== n1.props.to) {
                const newTarget = typeof n2.props.to === 'string'
                ? document.querySelector(n2.props.to)
                : n2.props.to
                n2.children.forEach(c => move(c, newTarget))
            }
        }
    }
}
```

:::

::: code-group-item move 函数

```js
if (typeof type === 'object' && type.__isTeleport) {
    type.process(n1, n2, container, anchor, {
        patch,
        patchChildren,
        move(vnode, container, anchor) {
            insert(vnode.component ? vnode.component.subTree.el : vnode.el, container, anchor)
        }
    })
}
```

💡 目前代码只考虑了移动组件和普通元素。虚拟节点实际上有很多种，例如文本、片段类型等。一个完善的实现应该考虑所有这些虚拟节点的类型。

:::

::::

::: tip Teleport 组件实现

✅ 可见，即使 Teleport 的渲染逻辑被单独分离出来，它的渲染思路仍然和渲染器本身的渲染思路保持一致。

通过判断旧的虚拟节点（n1） 是否存在，来决定是执行挂载还是执行更新。如果是挂载 `patch`，遍历 Teleport 组件的 children 属性执行固定父节点为 props.to 的挂载。更新则调用 `patchChildren` 函数。同时，考虑到 Teleport 组件的更新可能是 to 参数的不同引起的，补充了获取新容器进行移动的逻辑。

:::

## Transition 组件的实现原理

::: tip Transition 组件的核心原理

- 当 DOM 元素被挂载时，将动效附加到该 DOM 元素上；
- 当 DOM 元素被卸载时，不要立即卸载 DOM 元素，而是等到附加到该 DOM 元素上的动效执行完成后再卸载它。

:::

### 原生 DOM 的过渡

过渡效果的本质是一个 DOM 元素再两种状态间的切换，浏览器会根据过渡效果自行完成 DOM 元素的过渡。这里的过渡效果指的是持续时长、运动曲线、要过渡的属性等。

:::: code-group
::: code-group-item 样式

```css
.box {
    width: 100px;
    height: 100px;
    background-color: red;
}
.enter-active, .leave-active {
    transition: transform 1s ease-in-out;
}
.enter-from, .leave-to {
    transform: translateX(200px);
}
.enter-to, .leave-from {
    transform: translateX(0);
}
```

:::

::: code-group-item 模板和脚本

```html
<body>
    <div id="app"></div>
    <script>
        // 元素创建
        const container = document.querySelector('#app')
        const el = document.createElement('div')
        el.classList.add('box')

        // before enter 在元素被添加到页面之前，把初始状态和运动过程定义到元素上
        el.classList.add('enter-from')
        el.classList.add('enter-active')
        // 添加元素
        container.appendChild(el)
        
        // enter 在下一帧切换元素状态
        nextFrame(() => {
            el.classList.remove('enter-from')
            el.classList.add('enter-to')
			// 监听 transitionend 事件完成收尾工作
            el.addEventListener('transitionend', () => {
                el.classList.remove('enter-to')
                el.classList.remove('enter-active')
            })
        })

        // requesetAnimationFrame 浏览器 bug
        // 其注册的函数回调会在当前帧执行，除非其他代码以及调用了一次该函数
        // requesetAnimationFrame(() => { requesetAnimationFrame(() => { /*...*/ }) })
        function nextFrame(cb) {
            requestAnimationFrame(() => {
                requestAnimationFrame(cb)
            })
        }

        el.addEventListener('click', () => {
            // 将卸载动作封装到 performRemove 函数中
            const performRemove = () => el.parentNode.removeChild(el)
            // remove 动作的初始状态
            el.classList.add('leave-from')
            el.classList.add('leave-active')

            // 强制 reflow，使初始状态生效
            // document.body.offsetHeight 

            // 在初始状态的下一帧切换状态
            nextFrame(() => {
                // 切换到结束状态
                el.classList.remove('leave-from')
                el.classList.add('leave-to')
                // 监听 transitionend 事件完成收尾工作
                el.addEventListener('transitionend', () => {
                    el.classList.remove('leave-to')
                    el.classList.remove('leave-active')
                    // 过渡完成之后移除 DOM 元素
                    performRemove()
                })
            })
        })

    </script>
</body>
```

:::

::::

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/transition.gif)

::: tip 过渡状态过程

1. 初始状态 from + active
2. 下一帧切换到 active + to
3. 监听动画结束后收尾 ""

:::

### 实现 Transition 组件

Transition 组件的实现原理与原生是一致的，只不过它是基于虚拟 DOM 实现。

✅ 整个过渡过程可以抽象为几个阶段，这些阶段可以抽象为特定的回调函数：`beforeEnter`、`enter`、`leave`等。基于虚拟 DOM 的实现也需要将 DOM 元素的生命周期分割为这样几个阶段，并在特定阶段执行对应的回调函数。 

:::: code-group
::: code-group-item 组件模板

```html
<template>
    <Transition>
        <div>我是需要过渡的元素</div>
    </Transition>
</template>
```

:::

::: code-group-item 编译后的虚拟 DOM

```js
function render() {
    return {
        type: Transition,
        children: {
            default() {
                return { type: 'div', children: '我是需要过渡的元素' }
            }
        }
    }
}
```

Transition 组件的子节点被编译为**默认插槽**，与普通组件的行为一致。

:::

::: code-group-item Transition 组件

```js
const Transition = {
    name: 'Transition',
    setup(props, { slots }) {
        return () => {
            // 通过默认插槽取得需要过渡的元素
            const innerVNode = slots.default()
			// 在过渡元素的 VNode 对象上添加 transtion 响应的钩子函数
            innerVNode.transition = {
                beforeEnter(el) {
					// ...
                },
                enter(el) {
					// ...
                },
                leave(el, performRemove) {
                    // ...
                }
            }
			// 渲染需要过渡的元素
            return innerVNode
        }
    }
}
```

经过 Transition 组件的包装之后，内部需要过渡的虚拟节点对象会被添加一个 vnode.transition 对象。其下存在一些与 DOM 元素过渡相关的钩子函数。

✅  渲染器在渲染需要过渡的虚拟节点时，会在合适的时机调用附加到该虚拟节点上的过渡相关的生命周期钩子函数，具体体现在 `mountElement` 函数以及 `unmount` 函数中

:::

::: code-group-item mountElement

```js
function mountElement(vnode, container, anchor) {
    const el = vnode.el = createElement(vnode.type)

    if (typeof vnode.children === 'string') {
        setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
        vnode.children.forEach(child => {
            patch(null, child, el)
        })
    }

    if (vnode.props) {
        for (const key in vnode.props) {
            patchProps(el, key, null, vnode.props[key])
        }
    }
    // 判断一个 VNode 是否需要过渡
    const needTransition = vnode.transition
    if (needTransition) {
        vnode.transition.beforeEnter(el)
    }

    insert(el, container, anchor)
    if (needTransition) {
        // 调用 transition.enter 钩子，并将 DOM 元素作为参数传递
        vnode.transition.enter(el)
    }
}
```

1. 在挂载元素之前，会调用 `transition.beforeEnter` 钩子
2. 在挂载元素之后，会调用`transition.enter`钩子

:::

::: code-group-item unmount

```js
function unmount(vnode) {
    // 判断 VNode 是否需要过渡
    const needTransition = vnode.transition
    if (vnode.type === Fragment) {
        vnode.children.forEach(c => unmount(c))
        return
    } else if (typeof vnode.type === 'object') {
        if (vnode.shouldKeepAlive) {
            vnode.keepAliveInstance._deActivate(vnode)
        } else {
            unmount(vnode.component.subTree)
        }
        return
    }
    const parent = vnode.el.parentNode
    if (parent) {
        // 将卸载动作封装到 performRemove 函数中
        const performRemove = () => parent.removeChild(vnode.el)
        if (needTransition) {
            // 如果需要过渡处理，则调用 transition.leave 钩子
            // 同时将 DOM 元素和 performRemove 函数作为参数传递
            vnode.transition.leave(vnode.el, performRemove)
        } else {
            // 如果不需要过渡，则直接卸载元素
            performRemove()
        }
    }
}
```

在卸载元素时，如果是需要过渡的元素，则调用`transition.leave`，并且把元素 `el` 和 `performRemove` 函数作为参数传递。

:::

::: code-group-item Transition 组件实现

```js
const Transition = {
    name: 'Transition',
    setup(props, { slots }) {
        return () => {
            const innerVNode = slots.default()

            innerVNode.transition = {
                // 设置初始状态：enter-from + enter-active
                beforeEnter(el) {
                    el.classList.add('enter-from')
                    el.classList.add('enter-active')
                },
                enter(el) {
                    // 在下一帧切换到结束状态 enter-active + enter-to
                    nextFrame(() => {
                        el.classList.remove('enter-from')
                        el.classList.add('enter-to')
                        // 监听 transitionend 事件完成收尾工作
                        el.addEventListener('transitionend', () => {
                            el.classList.remove('enter-to')
                            el.classList.remove('enter-active')
                        })
                    })
                },
                leave(el, performRemove) {
                    // 设置初始状态：leave-from + leave-active
                    el.classList.add('leave-from')
                    el.classList.add('leave-active')

                    // document.body.offsetHeight

                    nextFrame(() => {
                        // 在下一帧切换到结束状态 leave-active + leave-to
                        el.classList.remove('leave-from')
                        el.classList.add('leave-to')
                        // 监听 transitionend 事件完成收尾工作
                        el.addEventListener('transitionend', () => {
                            el.classList.remove('leave-to')
                            el.classList.remove('leave-active')
                            // 
                            performRemove()
                        })
                    })
                }
            }
			// 渲染需要过渡的元素
            return innerVNode
        }
    }
}
```

:::

::::

::: tip Transition 组件

- Transition 组件本身不会渲染任何额外的内容，它只是通过默认插槽读取过渡元素，并渲染需要过渡的元素；
- Transition 组件的作用，就是在过渡元素的虚拟节点上添加 transition 相关的钩子函数。

:::

目前，代码硬编码了过渡状态的类名，例如`enter-from`、`enter-active`、`enter-to`等。实际上，我们可以轻松通过 props 来实现允许用户自定义类名的能力，从而实现一个更加灵活的 Transition 组件。

另外，我们没有实现“模式”的概念，即先进后出（in-out）和后进先出（out-in）。模式的概念实际上只是增加了对节点过渡时机的控制，原理上与将卸载动作封装到 `performRemove` 函数中一样，只需要在具体的时机以回调的形式将控制权交接出去即可。