# 同构渲染

::: tip 同构渲染

- Vue.js 可以用于构建容户端应用程序，组件的代码在浏览器中运行，并输出 DOM 元素。
- Vue.js 还可以在Node.js 环境中运行，它可以将同样的组件渲染为字符串并发送给浏览器。

以上描述了 Vue.js 的两种渲染方式，即客户端渲染 (client-side rendering, CSR)，以及服务端渲染 (server-side rendering， SSR)。另外，Vue.js 作为现代前端框架，不仅能够独立地进行 CSR 或 SSR，还能够将两者结合，形成所谓的**同构渲染** (isomorphic rendering )。

:::

## CSR、SSR 以及同构渲染

### CSR 与 SSR

在Web 2.0之前，网站主要负责提供各种各样的内容，通常是一些新闻站点、个人博客、小说站点等。这些站点主要强调内容本身，而不强调与用户之间具有高强度的交互。当时的站点基本采用传统的服务端渲染技术来实现。例如，比较流行的 PHP/JSP 等技术。

![img](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/SSR.png)

::: tip SSR

1. 用户通过浏览器请求站点
2. 服务器请求 API 获取数据
3. 接口返回数据给服务器
4. 服务器根据模板和获取的数据拼接出最终的 HTML 字符串
5. 服务器将 HTML 字符串发送给浏览器，浏览器解析 HTML 内容并渲染

:::

当用户再次通过超链按进行页面跳转，会重复上述 5 个生骤。可以看到，传统的服务端這染的用户体验非常差，任何一个微小的操作都可能导致页面刷新。
后来以 AJAX 为代表，催生了 Web 2.0。 在这个阶段，大量的 SPA (single page application)诞生，也就是接下来我们要介绍的 CSR 技术。与 SSR 在服务端完成模板和数据的融合不同，**CSR是在浏览器中完成模板与数据的融合**，并渲染出最终的 HTML 页面。

![img](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/CSR.png)

- 客户端向服务器或 CDN 发送请求，获取静态的 HTML 页面。注意，此时获取的 HTML 页面通常是空页面。在 HTML 页面中，会包含`<style>`、`<link>`和`<script>`等标签。

  ```html
  <!DOCTYPE html>
  <html lang="">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width,initial-scale=1.0">
      <title>My App</title>
      <link rel="stylesheet" href="/dist/app.css">
    </head>
    <body>
      <div id="app"></div>
      
      <script src="/dist/app.js"></script>
    </body>
  </html>
  
  ```

  这是一个包含`<link rel="stylesheet">`与`<script>`标签的空 HTML 页面。浏览器在得到该页面后，不会渲染出任何内容，所以以用户的视角看，此时页面处于“白屏”阶段。

- 显然 HTML 页面是空的，但浏览器仍然会解析 HTML 内容。由于 HTML 页面中存在`<link>`和`<script>`标签，所以浏览器会加载 HTML 中引用的资源，例如 app.css 和 app.js。 接着，服务器或 CDN 会将相应的资源返回给浏览器，浏览器对 CSS 和 JavaScript 代码进行解释和执行。因为页面的渲染任务是由 JavaScript 来完成的，所以当 JavaScript 被解析和执行后，才会渲染出页面内容，即“白屏”结束。但初始渲染出来的内容通常是一个“骨架”，因为还没有请求 API 获取数据。
- 客户端再通过 AJAX 技术请求 API 获取数据，一旦接口返回数据，客户端就会完成动态内容的這染，并呈现完整的页面。

当用户再次通过点击“跳转”到其他页面时，浏览器并不会真正的进行跳转动作，即不会进行刷新，而是通过前端路由的方式动态地渲染页面，这对用户的交互体验会非常友好。但很明显的是，与 SSR 相比，CSR 会产生所谓的“白屏”问题。实际上，CSR 不仅仅会产生白屏问题， 它对 SEO（搜索引擎优化）也不友好。

|                | SSR  | CSR    |
| -------------- | ---- | ------ |
| SEO            | 友好 | 不友好 |
| 白屏问题       | 无   | 有     |
| 占用服务端资源 | 多   | 少     |
| 用户体验       | 差   | 好     |

> 如果你的项目非常需要 SEO，那么就应该采用 SSR。

### 同构渲染

同构渲染分为首次渲染（即首次访问或刷新页面）以及非首次渲染。

:::: code-group
::: code-group-item 真实 DOM

```html
<div id="app">
	<div>
    <span>foo</span>
    <span>baz</span>
  </div>
</div>
```

:::
::: code-group-item 虚拟 DOM

```js
const vnode = {
  type: 'div',
  children: [
    {
      type: 'span',
      children: str.value,
      props: {
        onClick: () => {
          str.value = 'bar'
        }
      }
    },
    { type: 'span', children: 'baz' }
  ]
}
```

:::
::::

实际上，同构渲染中的首次渲染与 SSR 的工作流程是一致的。也就是说，当首次访问或者刷新页面时，整个页面的内容是在服务端完成渲染的，浏览器最终得到的是渲染好的 HTML 页面。但是该页面是静态的，这意味着用户还不能与页面进行交互，因为整个应用程序的脚本还没加载和执行。另外，该静态的 HTML 页面中也会包含 `<link>`、`<script>`等标签。除此之外，同构渲染所产生的 HTML 页面与 SSR 所产生的HTML 页面有一点最大的不同，即前者会包含当前页面所需要的初始化数据。直白地说，服务器通过 API 请求的数据会被序列化为字符串，并拼接到静态的 HTML 字符串中，最后一并发送给浏览器。这么做实际上是为了后续的激活操作。

假设浏览器已经接收到初次渲染的静态 HTML 页面，接下来浏览器会解析并渲染该页面。在解析过程中，浏览器会发现 HTML 代码中存在`<link>`和`<script>`标签，于是会从 CDN 或服务器获取相应的资源，这一步与 CSR 一致。当 JavaScript资源加载完毕后，会进行激活操作，这里的激活就是我们在 Vue.js 中常说的
“hydration”。激活句含两部分工作内容。

- Vue.js 在当前页面已经渲染的 DOM 元素以及 vue.js 组件所渲染的虛拟 DOM 之间建立联系。

- Vue.js 从 HTML 页面中提取由服务端序列化后发送过来的数据，用以初始化整个 Vue.js

  应用程序。

激活完成后，整个应用程序已经完全被 Vue.js 接管为 CSR 应用程序了。后续操作都会按照 CSR 应用程序的流程来执行。当然，如果刷新页面，仍然会进行服务端渲染，然后再进行激活，如此往复。

|                | SSR  | CSR    | 同构渲染 |
| -------------- | ---- | ------ | -------- |
| SEO            | 友好 | 不友好 | 友好     |
| 白屏问题       | 无   | 有     | 无       |
| 占用服务端资源 | 多   | 少     | 中       |
| 用户体验       | 差   | 好     | 好       |

> 同构渲染并不能提升**可交互时间**（TTI）。同构渲染仍然需要像 CSR 那样等待 JavaScript 资源加载完成，并且客户端激活完成后，才能响应用户操作。因此，同构渲染理论上无法提升可交互时间。

同构渲染的“同构”一词的含义是，同样一套代码既可以在服务端运行，也可以在客户端运行。例如，我们用 Vue.js编写一个组件，该组件既可以在服务端运行，被渲染为 HTML 字符串；也可以在客户端运行，就像普通的 CSR 应用程序一样。

## 将虚拟 DOM 渲染为 HTML 字符串

:::: code-group
::: code-group-item ElementVNode

```js
const ElementVNode = {
  type: 'div',
  props: {
    id: 'foo',
  },
  children: [
    { type: 'p', children: 'hello' }
  ]
}
```

:::
::: code-group-item renderElementVNode

```js
function renderElementVNode(vnode) {
  const { type: tag, props, children } = vnode
  let ret = `<${tag}`
  if(props) {
    for(const k in props) {
      ret += ` ${k}="${props[k]}"`
    }
  }
  ret += `>`
  
  if(typeof children = "string") {
    ret += children
  } else if(Array.isArray(children)) {
    children.forEach(child => {
      ret += renderElementVNode(child)
    })
  }
  
  ret += `</${tag}>`
  
  return ret
}
```

:::
::::

```js
renderElementVNode(ElementVNode)  // <div id="foo"><p>hello</p></div>
```

实际上，将一个普通标签类型的虚拟节点渲染为 HTML 字符串，本质上是字符串的拼接。上面的`renderElementVNode`的实现仅仅是用来展示虚拟 DOM 渲染为 HTML 字符串的核心原理，并不满足生成要求。

::: tip ✅ 普通节点转字符串需要考虑

- `renderElementVNode` 函数在渲染标签类型的虚拟节点时，还需要考虑该节点是否是自闭合标签。
- 对于属性（props）的处理会比较复杂，要考虑属性名称是否合法，还要对属性值进行HTML 转义。
- 子节点的类型多种多样，可能是任意类型的虚拟节点，如 Fragment、组件、函数式组件、文本等，这些都需要处理。
- 标签的文本子节点也需要进行 HTML 转义。

:::

:::: code-group
::: code-group-item 自闭合标签

```js{6,15}
const VOID_TAGS = 'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr'.split(',')

function renderElementVNode(vnode) {
  const { type: tag, props, children } = vnode
  // 判断是否是 void element
  const isVoidElement = VOID_TAGS.includes(tag)
  
  let ret = `<${tag}`
  if(props) {
    for(const k in props) {
      ret += ` ${k}="${props[k]}"`
    }
  }
  // 自闭合处理
  ret += isVoidElement ? `/>` : `>`
  return ret
  
  if(typeof children = "string") {
    ret += children
  } else if(Array.isArray(children)) {
    children.forEach(child => {
      ret += renderElementVNode(child)
    })
  }
  
  ret += `</${tag}>`
  
  return ret
}
```

自闭合标签没有子节点，可以跳过对 children 的处理。

:::
::: code-group-item 属性处理

```js
const VOID_TAGS = 'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr'.split(',')
const shouldIgnoreProp = ['key', 'ref']

function renderAttrs(props) {
  let ret = ''
  for(const key in props) {
    // 忽略可忽略属性或事件
    if(shouldIgnoreProp.includes(key) || /^on[^a-z]/.test(key)) {
      continue
    }
    const value = props[key]
    ret += = renderDynamicAttr(key, value)
  }
}

function renderElementVNode(vnode) {
  const { type: tag, props, children } = vnode
  // 判断是否是 void element
  const isVoidElement = VOID_TAGS.includes(tag)
  
  let ret = `<${tag}`
  if(props) {
    ret += renderAttrs(props)
  }
  // 自闭合处理
  ret += isVoidElement ? `/>` : `>`
  return ret
  
  if(typeof children = "string") {
    ret += children
  } else if(Array.isArray(children)) {
    children.forEach(child => {
      ret += renderElementVNode(child)
    })
  }
  
  ret += `</${tag}>`
  
  return ret
}
```

- 处理 boolean attribute。
- 属性名称安全检查。
- 排除组件运行时逻辑的相关属性。
- 处理属性值要转义，可防御 XSS 攻击。

:::

::: code-group-item 安全检查与boolean attributes

```js
// 判断属性是否是 boolean attribute
const isBooleanAttr = (key) => 
(`itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly` +
 `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,` +
 `loop,open,required,reversed,scoped,seamless,` +
 `checked,muted,multiple,selected`).split(',').includes(key)

// 判断属性名称是否安全且合法
const isSSRSafeAttrName = (key) => !/[>/="'\u0009\u000a\u000c\u0020]/.test(key)

function renderDynamicAttr(key, value) {
  if (isBooleanAttr(key)) {
    // boolean attr如果是false，则什么都不需要渲染，否则只要渲染 key 即可
    return value === false ? `` : ` ${key}`
  } else if (isSSRSafeAttrName(key)) {
    // 调用 escapeHtml 进行完整渲染
    return value === '' ? ` ${key}` : ` ${key}="${escapeHtml(value)}"`
  } else {
    // 跳过不安全属性，并打印警告信息
    console.warn(
      `[@vue/server-renderer] Skipped rendering unsafe attribute name: ${key}`
    )
    return ``
  }
}
```

:::

::: code-group-item escapeHtml 转义

```js
function escapeHtml(string) {
  const str = '' + string
  const match = escapeRE.exec(str)

  if (!match) {
    return str
  }

  let html = ''
  let escaped
  let index
  let lastIndex = 0
  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escaped = '&quot;'
        break
      case 38: // &
        escaped = '&amp;'
        break
      case 39: // '
        escaped = '&#39;'
        break
      case 60: // <
        escaped = '&lt;'
        break
      case 62: // >
        escaped = '&gt;'
        break
      default:
        continue
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index)
    }

    lastIndex = index + 1
    html += escaped
  }

  return lastIndex !== index ? html + str.substring(lastIndex, index) : html
}
```

:::
::::

::: tip ✅ HTML 转义指的是将特殊字符转换为对应的 HTML 实体。

- 如果该字符串作为普通内容被拼接，则应该对以下字符进行转义：
  - 将字符`&`转义为实体`$amp;`
  - 将字符`<`转义为实体`$lt;`
  - 将字符`>`转义为实体`$gt;`
- 如果该字符串作为属性值被拼接，那么除了上述三个字符应该被转义之外，还应该转义下面两个字符：
  - 将字符`"`转义为实体`$quot;`
  - 将字符`'`转义为实体`$#39;`

:::

## 将组件渲染为 HTML 字符串

::: tip 概述

在服务端渲染组件与渲染普通标签并没有本质区别。我们只需要通过执行组件的 render 函数，得到该组件所渲染的 SubTree 并将其渲染为 HTML 字符串即可。另外，在渲染组件时，需要考虑以下几点。

- 服务端渲染不存在数据变更后的重新渲染，所以无须调用 reactive 函数对 data 等数据进行包装，也无须使用 shallowReactive 函数对 props 数据进行包装。正因如此，我们也无须调用 beforeUpdate 和 updated 钩子。
- 服务端渲染时，由于不需要渲染真实 DOM 元素，所以无须调用组件的 beforeMount 和 mounted 钩子。

:::

```js
// 组件
const MyComponent = {
  setup() {
    return () => {
      return {
        type: 'div,
      	children: 'hello
      }
    }
  }
}

// 用来描述组件的 VNode
const CompVNode = {
  type: MyComponent
}
```

```js
const html = renderComponentVNode(CompVNode)
console.log(html)  // <div>hello</div>
```

实际上，把组件渲染为 HTML 字符串与把普通标签节点渲染为 HTTML 字符串并设有本质区别。我们知道，组件的渲染函数用来描述组件要渲染的内容，它的返回值是虚拟 DOM。所以，我们只需要执行组件的渲染函数取得对应的虚拟 DOM，再将该虚拟DOM 渲染为 HTML 字符串，并作为 `renderComponentVNode` 函数的返回值即可。最基本的实现如下：

```js
function renderComponentVNode(vnode) {
  // 获取 setup 选项
  let { type, { setup } } = vnode
	// 执行 set 函数得到渲染函数 render
  const render = setup()
  // 执行渲染函数得到 subTree，即组件要渲染的内容
  const subTree = render()
 	// 调用 renderElementVNode 完成渲染，并返回其结果
  return renderElementVNode(subTree)
}
```

上面这段代码的逻辑非常简单，它仅仅展示了渲染组件的最基本原理，仍然存在很多问题。

- `subTree` 本身可能是任意类型的虚拟节点，包括组件类型。因此，我们不能直接使用 `renderElementVNode` 来渲染它。
- 执行 `setup` 函数时，也应该提供 `setupContext` 对象。而执行渲染函数 `render` 时，也应该将其 this 指向 `renderContext` 对象。实际上，在组件的初始化和渲染方面，其完整流程与第 13 章讲解的客户端的渲染流程一致。例如，也需要初始化 `data`，也需要得到 `setup` 函数的执行结果，并检查 `setup` 函数的返回值是函数还是 `setupState` 等。

### 类型区分处理

```js
function renderVNode(vnode) {
  const type = typeof vnode.type
  if (type === 'string') {
    return renderElementVNode(vnode)
  } else if (type === 'object' || type === 'function') {
    return renderComponentVNode(vnode)
  } else if (vnode.type === Text) {
    // 处理文本...
  } else if (vnode.type === Fragment) {
    // 处理片段...
  } else {
    // 其他 VNode 类型
  }
}

function renderComponentVNode(vnode) {
  let { type, { setup } } = vnode
  const render = setup()
  const subTree = render()
  // 调用 renderVNode 完成渲染，并返回其结果
  return renderVNode(subTree)
}
```

### 上下文处理

在进行服务端渲染时，组件的初始化流程与客户端渲染时组件的初始化流程基本一致。

::: tip 但有两个重要的区别：

- 服务端渲染的是应用的当前快照，它不存在数据变更后重新渲染的情况。因此，所有数据在服务端都**无须是响应式**的。利用这一点，我们可以减少服务端渲染过程中创建响应式数据对象的开销。
- 服务端渲染只需要获取组件要渲染的 `subTree` 即可，无须调用渲染器完成真实 DOM 的创建。因此，在服务端渲染时，可以忽略“设置 render effect 完成渲染”这一步。

:::

![img](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/initSSRComp.png)

可以看到，只需要对客户端初始化组件的逻辑稍作调整，即可实现组件在服务端的渲染。另外，由于组件在服务端渲染时，不需要渲染真实 DOM 元素，所以无须创建并执行 `render effect` 。这意味着，组件的 beforeMount 以及 mounted 钩子不会被触发。而且，由于服务端渲染不存在数据变更后的重新渲染逻辑，所以 beforeUpdate 和 updated 钩子也不会在服务端执行。完整的实现如下：

```js
function renderComponentVNode(vnode) {
  const isFunctional = typeof vnode.type === 'function'
  let componentOptions = vnode.type
  if (isFunctional) {
    componentOptions = {
      render: vnode.type,
      props: vnode.type.props
    }
  }
  let { render, data, setup, beforeCreate, created, beforeMount, mounted, beforeUpdate, updated, props: propsOption } = componentOptions

  beforeCreate && beforeCreate()
	// 无须使用 reactive() 创建 data 的响应式版本
  const state = data ? data() : null
  const [props, attrs] = resolveProps(propsOption, vnode.props)

  const slots = vnode.children || {}

  const instance = {
    state,
    props,
    isMounted: false,
    subTree: null,
    slots,
    mounted: [],
    keepAliveCtx: null
  }

  function emit(event, ...payload) {
    const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
    const handler = instance.props[eventName]
    if (handler) {
      handler(...payload)
    } else {
      console.error('事件不存在')
    }
  }

  // setup
  let setupState = null
  if (setup) {
    const setupContext = { attrs, emit, slots }
    const prevInstance = setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), setupContext)
    setCurrentInstance(prevInstance)
    if (typeof setupResult === 'function') {
      if (render) console.error('setup 函数返回渲染函数，render 选项将被忽略')
      render = setupResult
    } else {
      setupState = setupContext
    }
  }

  vnode.component = instance

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

  // created
  created && created.call(renderContext)

  const subTree = render.call(renderContext, renderContext)

  return renderVNode(subTree)
}
```

服务端渲染时，无须使用 `reactive` 函数为 data 数据创建响应式版本，并且 props 数据也无须是浅响应的。

## 客户端激活的原理

什么是容户端激活呢？我们知道，对于同构渲染来说，组件的代码会在服务端和客户端分别执行一次。在服务端，组件会被渲染为静态的 HTML 字符串，然后发送给浏览器，浏览器再把这段纯静态的 HTML 渲染出来。这意味着，此时页面中已经存在对应的 DOM 元素。同时，该组件还会被打包到一个 JavaScript 文件中，并在客户端被下载到浏览器中解释并执行。这时问题来了，当组件的代码在客户端执行时，会再次创建 DOM 元素吗？答案是“不会”。由于浏览器在渲染了由服务端发送过来的 HTML 字符串之后，**页面中已经存在对应的 DOM 元素**了，所以组件代码在客户端运行时，不需要再次创建相应的 DOM 元素。

::: tip ✅ 组件代码在客户端运行时，需要做两件重要的事：

- 在页面中的 DOM 元素与虚拟节点对象之间建立联系；
- 为页面中的 DOM 元素添加事件绑定。

:::

一个虚拟节点被挂载之后，为了保证更新程序能正确运行，需要通过该虚拟节点的 `vnode.el` 属性存储对真实 DOM 对象的弓1用。而同构渲染也是一样，为了应用程序在后续更新过程中能够正确运行，我们需要在页面中已经存在的 DOM 对象与虚拟节点对象之间建立正确的联系。另外，在服务端渲染的过程中，会忽略虚拟节点中与事件相关的 props。所以，当组件代码在客户端运行时，我们需要将这些事件正确地绑定到元素上。其实，这两个步骤就体现了客户端激活的含义。

```js
// 渲染
renderer.render(vnode, container)
// 激活
renderer.hydrate(cnode, container)
```

服务端渲染到客户端激活的整个过程如下：

:::: code-group
::: code-group-item 激活过程

```js
// html 代表由服务端渲染的字符串
const html = renderComponentVNode(compVNode)

// 客户端获取挂载点
const container = document.querySelector('#app')
// 设置挂载点的 innerHTML，模拟由服务端渲染内容
container.innerHTML = html

// 调用 hydrate 函数完成激活
render.hydrate(compVNode, container)
```

:::

::: code-group-item CompVNode

```js
const MyComponent = {
  name: 'App',
  setup() {
    const str = ref('foo')

    return () => {
      return {
        type: 'div',
        children: [
          {
            type: 'span',
            children: str.value,
            props: {
              onClick: () => {
                str.value = 'bar'
              }
            }
          },
          { type: 'span', children: 'baz' }
        ]
      }
    }
  }
}

const compVNode = {
  type: MyComponent,
}
```

:::

::: code-group-item createRender

```js
function createRender() {
  function hydrate() { /*...*/ }
  function render() { /*...*/ }
  
  return {
    hydrate, render
  }
}
```

:::
::: code-group-item 真实 DOM

```html
<div id="app">
	<div>
    <span>foo</span>
    <span>baz</span>
  </div>
</div>
```

:::
::: code-group-item 虚拟 DOM

```js
const vnode = {
  type: 'div',
  children: [
    {
      type: 'span',
      children: str.value,
      props: {
        onClick: () => {
          str.value = 'bar'
        }
      }
    },
    { type: 'span', children: 'baz' }
  ]
}
```

:::

::::

真实 DOM 元素与虚拟 DOM 对象都是树形结构，并且节点之间存在一一对应的关系。因此，我们可以认为它们是**同构**的。而激活的原理就是基于这一事实，递归地在真实 DOM 元素与虚拟 DOM 节点之间建立关系。另外，在虚拟 DOM 中并不存在于容器元素（或挂载点）对应的节点。因此，在激活的时候，应该从容器元素的第一个子节点开始：

:::: code-group
::: code-group-item hydrate

```js
function hydrate(vnode, container) {
  hydrateNode(container.firstChild, vnode)
}
```

:::

::: code-group-item hydrateNode

```js
function hydrateNode(node, vnode) {
  const { type } = vnode
  // 1. 让 vnode.el 引用真实的 DOM
  vnode.el = node

  // 2. 检查虚拟 DOM 的类型，按类型处理
  if (typeof type === 'object') {
    mountComponent(vnode, container, null)
  } else if (typeof type === 'string') {
    // 3. 检查真实 DOM 的类型与虚拟 DOM 的类型是否匹配
    if(node.nodeType !== 1) {
      console.log('mismatch')
    }else {
      // 4. 激活普通元素
      hydrateElement(node, vnode)}
  }
	// hydrateNode 需要返回当前节点的下一个兄弟节点，以便继续后续的激活操作
  return node.nextSibling
}
```

:::

::: code-group-item hydrateElement

```js
// 用来激活普通元素类型的节点
function hydrateElement(el, vnode) {
  // 1. 为 DOM 元素添加事件
  if (vnode.props) {
    for (const key in vnode.props) {
      if (/^on/.test(key)) {
        patchProps(el, key, null, vnode.props[key])
      }
    }
  }
  // 递归激活子节点
  if (Array.isArray(vnode.children)) {
    // 从第一个子节点来说
    let nextNode = el.firstChild
    const len = vnode.children.length
    for (let i = 0; i < len; i++) {
      // hydrateNode 会返回当前节点的下一个兄弟节点
      nextNode = hydrateNode(nextNode, vnode.children[i])
    }
  }
}
```

::: tip hydrateElement 两数有两个关键点。

- 因为服务端渲染是忽略事件的，浏览器只是渲染了静态的 HTML 而己，所以激活 DOM元素的操作之一就是为其添加事件处理程序

- 递归地激活当前元素的子节点，从第一个子节点 `el.firstchild` 开始，递归地调用 `hydrateNode`函数完成激活。注意这里的小技巧，`hydrateNode` 函数会返回当前节点的下一个兄弟节点，利用这个特点即可完成所有子节点的处理。对于组件的激活，我们还需要针对性地处理 `mountComponent` 两数。**由于服务端渲染的页面中己经存在真实 DOM 元素，所以当调用`mountComponent` 函数进行组件的挂载时，无须再次创建真实 DOM 元素**。

> 基于此，我们需要对`mountComponent` 函数做一些调整。

:::

:::

::: code-group-item mountComponent

```js
function mountComponent(vnode, container, anchor) {
  // 省略部分代码 ...

  instance.update = effect(() => {
    const subTree = render.call(renderContext, renderContext)
    if (!instance.isMounted) {
      beforeMount && beforeMount.call(renderContext)
      // 如果 vnode.el 存在，则执行激活
      if (vnode.el) {
        // 直接调用 hydrateNode 完成激活
        hydrateNode(vnode.el, subTree)
      } else {
        // 正常挂载
        patch(null, subTree, container, anchor)
      }
      instance.isMounted = true
      mounted && mounted.call(renderContext)
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

可以看到，唯一需要调整的地方就是组件的渲染副作用，即render effect。`hydrateNode` 函数所做的第一件事就是在真实 DOM 与虚拟 DOM之间建立联系，即 `vnode.el=node`。所以，当渲染副作用执行挂载操作时，我们优先检查虚拟节点的 vnode.el 属性是否已经存在。如果存在，则意味着无须进行全新的挂载，只需要进行激活操作即可，否则仍然按照之前的逻辑进行全新的挂载。最后一个关键点是，组件的激活操作需要在真实 DOM 与 subTree 之间进行。

:::

::::

## 编写同构代码

### 组件的生命周期

组件代码在服务端运行时，没有真正的挂载操作（beforeMount和mounted）；服务端渲染的是应用的快照，所以不存在数据变化后的重新渲染（beforeUpdate和updated）；也没有组件被卸载的情况（beforeUnmount和unmounted）。

只有 beforeCreate 和 created 这两个钩子会在服务端执行。

```html
<script>
  export default {
    created() {
      this.timer = setInterval(() => {
        // ...
      }, 1000)
    },
    beforeUnmount() {
      // 客服端 Ok；服务端 No
      clearInterval(this.timer)
    }
  }
</script>
```

观察上面这段组件代码，我们在created 钩子阿数中设置了一个定时器，并尝试在组件被卸载之前将其清除，即在 beforeUnmount 钩子函数执行时将其清除。如果在客户端运行这段代码并不会产生任何问题；但如果在服务端运行，则会造成内存泄漏。因为 beforeUnmount 钩子函数不会在服务端运行，所以这个定时器将永远不会被清除。
实际上，在 created 钩子函数中设置定时器对于服务端渲染没有任何意义。这是因为服务端渲染的是应用程序的快照，所谓快照，指的是在当前数据状态下页面应该呈现的内容。所以，在定时器到时，修改数据状态之前，应用程序的快照已经渲染完毕了。所以我们说，在服务端渲染时，定时器内的代码没有任何意义。遇到这类问题时，我们通常有两个解决方案：

- 方案一：将创建定时器的代码移动到 mounted 钩子中，即只在客户端执行定时器；
- 方案二：使用环境变量包裹这段代码，让其不在服务端运行。

方案一应该很好理解，而方案二依赖项目的环境变量。例如，在通过 webpack 或 Vite 等构建工具搭建的同构项目中，通常带有这种环境变量。以 Vite 为例，我们可以使用 `import.meta.env.SSR`来判断当前代码的运行环境：

```html
<script>
  export default {
    created() {
      if(!import.meta.env.SSR) {
        this.timer = setInterval(() => {
          // ...
        }, 1000)
      }
    },
    beforeUnmount() {
      // 客服端 Ok；服务端 No
      clearInterval(this.timer)
    }
  }
</script>
```

可以看到，我们通过 `import.meta.env.SSR` 来使代码只在特定环境中运行。实际上，构建工具会分别为客户端和服务端输出**两个独立的包**。构建工具在为客户端打包资源的时候，会在资源中排除被 `import.meta.env.SSR` 包裹的代码。换句话说，上面的代码中被  `!import.meta.env.SSR` 包裏的代码只会在客户端包中存在。

### 使用跨平台的 API

编写同构代码的另一个关键点是使用跨平台的 APl。由于组件的代码既运行于浏览器，又运行于服务器，所以在编写代码的时候要避免使用平台特有的AP。例如，仅在浏览器环境中才存在的 window、document 等对象。然而，有时你不得不使用这些平台特有的 API。这时你可以使用诸如 `import.meta.env.SSR` 这样的环境变量来做代码守卫：

```html
<script>
  if(!import.meta.env.SSR) {
    // ...
    window.xxx
  }

  export default {
		// ...
  }
</script>
```

类似地，Node.js 中特有的 API 也无法在浏览器中运行。因此，为了减轻开发时的心智负担我们可以选择跨平台的第三方库。例如，使用 Axios 作为网络请求库。

### 只在某一端引入模块

通常情况下，我们自己编写的组件的代码是可控的，这时我们可以使用跨平台的 API来保证代码“同构”。然而，第三方模块的代码非常不可控。假设我们有如下组件：

```html
<script>
  import storage from "./storage.js"

  export default {
		// ...
  }
</script>
```

上面这段组件代码本身没有任何问题，但它依赖丁 `./storage.js` 模块。如果该模块中存在非同构的代码，则仍然会发生错误。假设 `./storage. js` 模块的代码如下：

```js
// storage.js
export const storage = window. localStorage
```

可以看到，`./storage.js` 模块中依赖了浏览器环境下特有的 API，即`window.localStorages`因此，当进行服务端渲染时会发生错误。对于这个问题，有两种解决方案，方案一是使用 `import.meta.env.SSR` 来做代码守卫：

```js
// storage.js
export const storage = !import.meta.env.SSR ? window. localStorage : {}
```

这样做虽然能解决问题，但是在大多数情况下我们无法修政第三方模块的代码。因此，更多时候我们会采用接下来介绍的方案二来解快问题，即条件引人：

```html
<script>
  let storage
  // 只有在非 SSR 下才引入 ./storage.js 模块
  if (!import.meta.env.SSR){
    storage = import('./storage. js')
  }

  export default {
    // ...
  }
</script>
```

上面这段代码是修改后的组件代码。可以看到，我们通过 `import.meta.env.SSR` 做了代码守卫，实现了特定环境下的模块加载。但是，仅在特定环境下加载模板，就意味着该模板的功能仅在该环境下生效。例如在上面的代码中，`./storage.js` 模板的代码仅会在客户端生效。也就是说，服务端将会缺失该模块的功能。为了弥补这个缺陷，我们通常需要根据实际情况，再实现一个具有同样功能并且可运行于服务端的模块，如下面的代码所示：

```html
<script>
  let storage
  if (!import.meta.env.SSR){
    // 客户端
    storage = import('./storage. js')
  }else {
    // 服务端
    storage = import('./storage-server.js')
  }

  export default {
    // ...
  }
</script>
```

可以看到，我们根据环境的不同，引人不用的模块实现。

### 避免交叉请求引起的状态污染

编写同构代码时，额外需要注意的是，避免交叉请求引起的状态污染。在服务端渲染时，我们会**为每一个请求创建一个全新的应用实例**，例如：

```js
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import App from 'App. vue
// 每个请求到来，都会执行一次render 函数
async function render(url, manifest) {
  // 为当前请求创建应用实例
  const app = createSSRApp(App)

  const ctx = {}
  const html = await renderToString (app, ctx)

  return html
}
```

可以看到，每次调用 render 函数进行服务端渲染时，都会为当前请求调用 `createSSRApp` 函数来创建一个新的应用实例。这是为了避免不同请求共用同一个应用实例所导致的状态污染

除了要为每一个请求创建独立的应用实例之外，状态污染的情况还可能发生在单个组件的代码中，如下所示：

```html
<script>
  // 模块级别的全局变量
  let count = 0

  export default {
    create() {
      count++
    }
  }
</script>
```

如果上面这段组件的代码在浏览器中运行，则不会产生任何问题，因为浏览器与用户是一对一的关系，每一个浏览器都是独立的。但如果这段代码在服务器中运行，情况会有所不同，因为服务器与用户是一对多的关系。当用户 A 发送请求到服务器时，服务器会执行上面这段组件的代码，即执行 `count++`。接着，用户 B也发送请求到服务器，服务器再次执行上面这段组件的代码，此时的 count 已经因用户 A 的请求自增了一次，因此对于用户 B而言，用户 A的请求会影响到他，于是就会造成请求问的交叉污染。所以，在编写组件代码时，要额外**注意组件中出现的全局变量**。

### `<ClientOnly>`组件

最后介绍一个对编写同构代码非常有帮助的组件，即 `ClientOnly` 组件。在日常开发中，我们经常会使用第三方模块。而它们不一定对 SSR 友好，例如：

```html
<template>
  <SsrIncompatibleComp/>
</template>
```

假设 ` <SsrIncompatibleComp/>` 是一个不兼容 SSR 的第三方组件，我们没有办法修改它的源代码，这时应该怎么办呢？这时我们会想，既然这个组件不兼容 SRR，那么能否只在客户端渲染该组件呢？其实是可以的，我们可以自行实现一个`<ClientOnly>`的组件，该组件可以让模板的一部分内容仅在客户端渲染，如下面这段模板所示：

```html
<template>
  <ClientOnly>
    <SsrIncompatibleComp/>
  </ClientOnly>
</template>
```

可以看到，我们使用 `<ClientOnly>` 组件包裹了不兼容 SSR的 ` <SsrIncompatibleComp/>` 组件。这样，在服务端渲染时就会忽略该组件，且该组件仅会在客户端被渲染。那么，`<ClientOnly>` 组件是如何做到这一点的呢？这其实是利用了 CSR 与 SSR 的差异。如下是 `<ClientOnly>` 组件的实现：

```js
import { ref, onMounted, defineComponent ] from 'vue'
        
export cost ClientOnly = defineComponent({
	setup(_, { slots }) {
    // 标记变量，仅在客户端渲染时为 true
    const show = ref(false)
    // onMounted 钧子只会在客户端执行
    onMounted(() =>{
      show.value = true
    })
    // 在服务端什么都不泣染，在客户端才会渲染 <Clientonly＞组件的插槽内容
    return () => (show. valve && slots.default ? slots.default() : nu11)
  })
```

可以看到，整体实现非常简单。其原理是利用了 **onMounted 钩子只会在客户端执行的特性**。我们创建了一个标记变量 show，初始值为 false，并且仅在客户端渲染时将其设置为 true。 这意味着，在服务端渲染的时候，`<ClientOnly>` 组件的插槽内容不会被渲染。而在客户端渲染时，只有等到 mounted 钩子触发后才会渲染 `<ClientOnly>` 组件的插槽内容。这样就实现了被 `<ClientOnly>` 组件包裹的内容仅会在客户端被渲染。

另外， `<ClientOnly>` 组件并不会导致容户端激活失败。因为在客户端激活的时候，mounted 钩子还没有触发，所以服务端与客户端渲染的内容一致，即什么都不渲染。等到激活完成，且 mounted 钩子触发执行之后，才会在客户端将 `<ClientOnly>` 组件的插槽内容渲染出来。