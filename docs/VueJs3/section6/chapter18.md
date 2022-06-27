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

实际上，将一个普通标签类型的虚拟节点渲染为 HTML 字符串，本质上是字符串的拼接。上面的`renderElementVNode`的实现仅仅是用来展示虚拟 DOM 渲染为 HTML 字符串的核心原理，并不满足生成要求，因为它存在一下缺陷：

- `renderElementVNode` 函数在渲染标签类型的虚拟节点时，还需要考虑该节点是否是自闭合标签。
- 对于属性（props）的处理会比较复杂，要考虑属性名称是否合法，还要对属性值进行HTML 转义。
- 子节点的类型多种多样，可能是任意类型的虚拟节点，如 Fragment、组件、函数式组件、文本等，这些都需要处理。
- 标签的文本子节点也需要进行 HTML 转义。

::: tip 处理属性

- 处理 boolean attribute。
- 属性名称安全检查。
- 排除组件运行时逻辑的相关属性。
- 处理属性值要转义，可防御 XSS 攻击。

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

HTML 转义指的是将特殊字符转换为对应的 HTML 实体。

- 如果该字符串作为普通内容被拼接，则应该对以下字符进行转义：
  - 将字符`&`转义为实体`$amp;`
  - 将字符`<`转义为实体`$lt;`
  - 将字符`>`转义为实体`$gt;`
- 如果该字符串作为属性值被拼接，那么除了上述三个字符应该被转义之外，还应该转义下面两个字符：
  - 将字符`"`转义为实体`$quot;`
  - 将字符`'`转义为实体`$#39;`

:::
::::

## 将组件渲染为 HTML 字符串

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