# 内建组件和模块

## KeepAlive 组件的实现原理

### 组件的激活与失活

::: tip KeepAlive 

KeepAlive 一词借鉴于 HTTP 协议。在 HTTP 协议中，KeepAlive 又称 HTTP 持久连接（HTTP persistent connection），其作用是允许多个请求或响应共用一个 TCP 连接。在没有 KeepAlive 的情况下，一个 HTTP 连接会在每次请求/响应结束后关闭，当下一次请求发生时，会建立一个新的 HTTP 连接。频繁地销毁、创建 HTTP 连接会带来额外的性能开销，KeepAlive 就是为了解决这个问题而生的。

:::

HTTP 中的 KeepAlive 可以避免连接频繁地销毁/创建，与 HTTP 中的 KeepAlive 相似，Vue.js 内建的 KeepAlive 组件可以**避免一个组件被频繁地销毁/重建**。

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

目前通过正则匹配结果判断是否要对“内部组件”进行缓存。在此基础上，我们可以任意扩充匹配能力。例如，将 include 和 exclude 设计成多种类型值，允许用户指定字符串或函数，从而提供更加灵活的匹配机制。另外，在做匹配时，也可以不限于“内部组件”的名称，我们甚至可以让用户自行指定匹配要素。

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