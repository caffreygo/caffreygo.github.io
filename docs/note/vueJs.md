# Vuejs的设计与实现

## 权衡的艺术

::: tip Vue.js

- 性能与可维护性之间的取舍
- 运行时与编译时之间的取舍

::: 

### 命令式与声明式

视图层框架的范式通常分为**命令式**与**声明式**

- 命令式：关注过程，比如原生js的 DOM 操作、jQuery，按步操作

  ```js
  const div = document.querySelector("#app"); // 获取div
  div.innerText = 'hello world';  // 设置文本内容
  dic.addEventListener('click', () => alert('ok'));  // 绑定点击事件
  ```

- 声明式：关注结果，比如Vuejs，用户需要的最终视图结果

  ```html
  <div @click="() => alert('ok')">hello world</div>
  ```

🔥 Vue.js帮助我们封装了过程，它的内部实现一定是命令式的，但是暴露给用户的却更加声明式

### 性能与可维护性的权衡

::: tip 声明式代码的性能不优于命令式代码的性能

- 命令式代码的更新性能消耗：A
- 声明式代码的更新性能消耗：A + B

A: 直接修改的性能消耗；B: 找出差异的性能消耗

:::

🔥 虽然声明式代码的性能无法超越命令式代码，但是声明式代码具有更好的可维护性，无需用户参与整个过程的，只需要关心结果的视图。因此，在保持可维护性的同时让性能损失最小化。

### 虚拟DOM的性能

🔖 声明式代码的关键在于，如果我们能**最小化**找出差异的性能消耗，就可以让声明式代码的性能无限接近于命令式代码。虽然这很难，但是这也正是虚拟 DOM 想要解决的问题。

---

innerHTML于虚拟DOM在**创建页面**时的性能：

|                  | 虚拟DOM         | innerHTML       |
| ---------------- | --------------- | --------------- |
| 纯JavaScript运算 | 创建VNode       | 渲染HTML字符串  |
| DOM运算          | 新建所有DOM元素 | 新建所有DOM元素 |

📌 新建页面时，innerHTML和虚拟DOM性能差距不大，都是在新建DOM

---

innerHTML于虚拟DOM在**更新页面**时的性能：

|                  | 虚拟DOM          | innerHTML                     |
| ---------------- | ---------------- | ----------------------------- |
| 纯JavaScript运算 | 创建VNode + Diff | 渲染HTML字符串                |
| DOM运算          | 必要的DOM更新    | 销毁所有旧DOM + 创建所有新DOM |
| 性能因素         | 与数据变化量有关 | 与模板大小有关                |

📌 虚拟 DOM 只更新必要的 DOM，和页面大小无关；innerHTML 性能差的原因：在更新页面时，需要销毁所有旧 DOM，重新创建新 DOM，页面越大，性能越差

---

| innerHTML    | 虚拟 DOM   | 原生       |
| ------------ | ---------- | ---------- |
| 性能差       | 性能不错   | 性能高     |
|              | 可维护性强 | 可维护性差 |
| 心智负担中等 | 心智负担小 | 心智负担大 |

### 运行时和编译时

#### 运行时

代码直接可以运行，没有编译的过程。缺点是不能分析提供的代码内容，进行对应的性能优化操作

```js
function Render(obj, root) {
    const el = document.createElement(obj.tag)
    if(typeof obj.children === 'string') {
        const text = document.createTextNode(obj.children)
        el.appendChild(text)
    }else if(obj.children) {
        obj.children.forEach(child=> Render(child, el))
    }
    root.appendChild(el)
}

const obj = {
    tag: 'div',
    children: [
        { tag: 'span', children: 'hello world' }
    ]
}

Render(obj, document.body)
```

#### 编译时

将代码进行分析转换为可执行的代码，可以分析用户内容。缺点是灵活性较差，必须编译后使用

```html
<div>
    <span>hello world</span>
</div>
```

如果是运行时+编译时，compiler将代码编译成：

```js
const obj = {
    tag: 'div',
    children: [
        { tag: 'span', children: 'hello world' }
    ]
}
// compiler + render
```

当然，也可以实现为纯编译时，compiler直接编译为：

```js
const div = document.createElement('div')
const span = document.createElement('span')
span.innerText = "hello world"
div.appendChild(span)
```

🔥 Vue.js 是运行时 + 编译时架构，保证灵活性的基础上，通过分析，尽可能提升性能。编译器提供了代码提前分析的可能，Vue.js 在编译器分析出动态数据，在渲染器更新时快速区分定位，相辅相成。

## 框架设计的核心要素

### 提升用户开发体验

对于开发者来说，精准的错误警告和 DevTools 可以节省很多问题定位时间

### 控制框架代码的体积

Vue.js 在源码通过区分 dev 开发与 prod 生产环境，从而将比如错误提示这类代码移除，从而降低代码体积

### 良好的Tree-Shaking

🔥 基于ESM的静态代码分析实现了dead code的移除，对于明确没有副作用的代码，可以使用`/*#__PURE__/ `这种 webpack 、rollup 都支持的语法告诉构建工具可以放心得进行 Tree-Shaking

> Vue.js源码从大量使用了该注释，实现对顶级调用函数的Tree-Shaking

```js
foo()  // 顶级调用

function bar() {
	foo()  // 函数内调用
}

// eg.
export const isHTMLTag = /*#__PURE__/ makeMap(HTML_TAGS)
```

### 支持输出多种构建产物

1. 如果是浏览器直接脚本引入，可以打包为 iife 直接引用；

2. 如果是esm，浏览器通过设置 script 标签的 type 为 module 即可引入使用`vue.esm-browser.js`；

   同时考虑到打包工具使用的情况，提供了`vue.esm-bunder.js`，将`__DEV__`替换成了`process.env.NODE_ENV !== 'production'`，由 webpack 配置来决定构建资源的目标环境（最终效果都是一样的，这些代码都只会出现在开发环境）；

3. 如果是 CommonJS 的 Node.js 环境，针对于 SSR 的情况，则需要打包出 cjs 的模块形式；

📌 无论是 webpack 还是 rollup，在寻找资源时，如果 package.json 中存在 module 字段，会优先使用 module 字段指向的资源来代替 main 字段指向的资源：

```json
// Vue.js 源码中的package/vue/package.json文件
{
  "main": "index.js",
  "module": "dist/vue.esm-bunder.js"
}
```

### 特性开关

1. 对于用户关闭的特性，利用 Tree-Shaking 排除这些代码在最终资源之外

2. 提升框架设计的灵活性，用户可以选择是否需要使用历史遗留的 API

   ```js
   // webpack.DefinePlugin 配置
   new webpack.DefinePlugin({
     __VUE_OPTIONS_API__: JSON.stringify(true)  // 开启特性
   })
   ```

🔥 通过特性开关，最终作用到源码的`__VUE_OPTIONS_API__`，如果我们明确只需要composition API，不需要 option API，可以减少最终的代码构建体积

### 错误处理

```js
// utils
let handleError = null
export default {
  foo(fn) {
    callWithErrorHandler(fn)
  },
  registerErrorHandler(fn) {
    handlerError = fn
  }
}
function callWithErrorHandler(fn) {
	try {
    fn && fn()
  } catch(e) {
    // 将捕获到的错误传递给用户的错误处理程序
    handeError(e)
  }
}
```

这个函数调用，不仅对错误进行了处理，同时开放了错误处理程序的注册给用户

```js
import utils from 'utils.js'

utils.registerErrorHandler((e) => {
	console.log(e)
})

utils.foo(() => {/*...*/})
```

🔥 这便是 Vue.js 错误处理的原理，用户可以选择忽略错误，也可以注册错误上报程序收集给监控系统

```js
import App from './App'
const app = createApp(App)
app.config.errorHandler = () => {/*...*/}
```

### 良好的TS类型支持

使用 TS 编写代码与TS类型支持友好是两回事，需要花大力气做类型推导，还需要考虑 TSX 的支持。

## Vue.js 3 的设计思路

### 声明式地描述UI

Vue.js3 作为一个声明式的 UI 框架，提供了两种 UI 描述方式：

1. 模板：

   ```html
   <h1 @click="handler"><span></span></h1>
   ```

2. JavaScript 对象：

   ```js
   const title = {
     tag: 'h1',
     props: {
       onClick: handler
     },
     children: [
       { tag: 'span' }
     ]
   }
   ```

使用 JavaScript 对象描述 UI 更加灵活，而这就是所谓的**虚拟 DOM**，在 Vue.js3 当中，我们在组件当中手写的渲染函数就是使用虚拟 DOM 来描述 UI 的

```js
import { h } from 'vue'

export default {
  render() {
    return h('h1', { onClick: handler })  // h函数返回就是VNode
  }
}
```

### 渲染器

🔥 渲染器：将 JavaScript 对象即虚拟 DOM 渲染为真实的 DOM

1. 创建元素：把 vnode.tag 作为标签名来创建 DOM 元素
2. 为元素添加属性和事件：遍历 vnode.props 对象，如果 key 以 on 字符开头，说明它是一个事件通过 addEventListener 绑定事件处理函数
3. 处理children：如果 children 是一个数组，递归调用 renderer 继续渲染；如果是字符串，以文本节点处理。最终添加到新创建的元素内

> 渲染器的精髓在于后续的更新，通过 Diff 算法找出变更点，并且只会更新需要更新的内容。

```js
function renderer(vnode, container) {
  // 使用 vnode.tag 作为标签名称创建 DOM 元素
	const el = document.createElement(vnode.tag)
  // 遍历 vnode.props 将属性、事件添加到 DOM 元素
  for (const key in vnode.props) {
    if (/^on/.test(key)) {
      // 如果 key 以 on 开头，那么说明它是事件
      el.addEventListener(
        key.substr(2).toLowerCase(), // 事件名称 onClick ---> click
        vnode.props[key] // 事件处理函数
      )
    }
  }

  // 处理 children
  if (typeof vnode.children === 'string') {
    // 如果 children 是字符串，说明是元素的文本子节点
    el.appendChild(document.createTextNode(vnode.children))
  } else if (Array.isArray(vnode.children)) {
    // 递归地调用 renderer 函数渲染子节点，使用当前元素 el 作为挂载点
    vnode.children.forEach(child => renderer(child, el))
  }

  // 将元素添加到挂载点下
  container.appendChild(el)
}

const vnode = {
  tag: 'div',
  props: {
    onClick: () => alert('hello')
  },
  children: 'click me'
}

renderer(vnode, document.body)
```

---

📌 以上就是渲染器创建节点的一个思路，渲染器的精髓在于节点的更新，如果 vnode 的更改如下，渲染器的更新应该只更新当前这个元素的文本内容，而不是再走一遍完整的元素创建流程

```js
const vnode = {
  tag: 'div',
  props: {
    onClick: () => alert('hello jerry')
  },
  children: 'click again'  // 从 click me 改成 click again
}
```

### 组件的本质

🔥 组件就是一组 DOM 元素的封装

1. 这组 DOM 元素代可以使用一个函数来表示：

   ```js
   const MyComponent = function () {
     return {
       tag: 'div',
       props: {
         onClick: () => alert('hello')
       },
       children: 'click me'
     }
   }
   ```

2. 组件也不一定需要函数来表示，也可以使用 JavaScript 对象来表示：

   ```js
   const MyComponent = {
     render() {
       return {
         tag: 'div',
         props: {
           onClick: () => alert('hello')
         },
         children: 'click me'
       }
     }
   }
   
   const vnode = {
     tag: MyComponent
   }
   
   function renderer(vnode, container) {
     if (typeof vnode.tag === 'string') {
       // 说明 vnode 描述的是标签元素
       mountElement(vnode, container)
     } else if (typeof vnode.tag === 'object') {
       // 说明 vnode 描述的是组件
       mountComponent(vnode, container)
     }
   }
   
   function mountElement(vnode, container) {
     // 使用 vnode.tag 作为标签名称创建 DOM 元素
   	const el = document.createElement(vnode.tag)
     // 遍历 vnode.props 将属性、事件添加到 DOM 元素
     for (const key in vnode.props) {
       if (/^on/.test(key)) {
         // 如果 key 以 on 开头，那么说明它是事件
         el.addEventListener(
           key.substr(2).toLowerCase(), // 事件名称 onClick ---> click
           vnode.props[key] // 事件处理函数
         )
       }
     }
   
     // 处理 children
     if (typeof vnode.children === 'string') {
       // 如果 children 是字符串，说明是元素的文本子节点
       el.appendChild(document.createTextNode(vnode.children))
     } else if (Array.isArray(vnode.children)) {
       // 递归地调用 renderer 函数渲染子节点，使用当前元素 el 作为挂载点
       vnode.children.forEach(child => renderer(child, el))
     }
   
     // 将元素添加到挂载点下
     container.appendChild(el)
   }
   
   function mountComponent(vnode, container) {
     // 调用组件函数，获取组件要渲染的内容（虚拟 DOM）
     const subtree = vnode.tag.render()
     // 递归调用 renderer 渲染 subtree
     renderer(subtree, container)
   }
   
   renderer(vnode, document.body)
   ```

🔖 Vue.js 中的有状态组件就是使用对象结构来表达的

### 模板的工作原理

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/design.png)

🔥 声明式 UI 的描述方式有两种，模板和虚拟 DOM (渲染函数) ，编译器将模板这个字符串分析生成一个功能与之相同的渲染函数。

在单文件组件当中，我们写的模板最终会被编译成渲染函数并添加到 script 标签块的组件对象上：

```html
<template>
  <div @click="hander">
    click
  </div>
</template>

<script>
export default {
  data() {/*...*/},
  methods: {
    handler: () => {/*...*/}
  }
}
</script>
```

最终在浏览器里运行的代码：

```js
export default {
  data() {/*...*/},
  methods: {
    handler: () => {/*...*/}
  },
  render() {
    return h('div', { onClick: handler }, 'click me')
  }
}
```

### Vue.js是各个模块组成的有机整体

🔥 编译器与渲染器交流的媒介就是虚拟 DOM 对象

🚀 有了编译器和渲染器，巧妙利用编译器的**代码分析**能力，为渲染节省寻找变更点的工作量，实现性能的提升：

```html
<div id="foo" :class="cls"></div>
```

以上面这个模板为例，编译器在将其编译为渲染函数时，可以分析出哪些是动态内容，在编译阶段进行信息提取，然后直接提交给渲染器

```js
render() {
  return {
    tag: 'div',
    props: {
      id: 'foo',
      class: cls
    },
    patchFlags: 1  // 假设数字 1 代表 class 是动态的
  }
}
```

通过添加的信息说明只要 class 属性会发生改变

