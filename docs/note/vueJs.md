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

## 响应系统的作用与实现

Vue.js 3 采用 Proxy 实现响应式数据

### 响应式数据与副作用函数

#### 副作用函数

- 副作用函数指的是会产生副作用的函数；
- 当函数的执行直接或间接影响其他函数的执行，这时我们就说函数产生了副作用；
- 副作用很容易产生，例如一个函数修改了全局变量，这也是一个副作用。

```js
let val = 1

function effect() {
  val = 2 // 修改全局变量，产生副作用
  document.body.innerText = 'hello' // 修改了一个任何函数都可以读取或者设置的内容
}
```

#### 响应式数据

```js
const obj = { text: 'hello' }
function effect() {
	// effect 函数的执行会读取 obj.text
	document.body.innerText = obj.text
}

obj.text = 'new value' // 修改 obj.text 的值，同时希望副作用函数会重新执行
```

当数据的变化能够使对应的副作用函数自动重新执行，那么该数据 obj 对象就是响应式数据

### 响应式数据的基本实现

- 当副作用函数 effect 执行时，会触发字段 obj.text 的读取操作；
- 当修改 obj.text 当值时，会触发字段 obj.text 的设置操作；

```js
// 存储副作用函数的桶
const bucket = new Set()

// 原始数据
const data = { text: 'hello world' }
// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数 effect 添加到存储副作用函数的桶中
    bucket.add(effect)
    // 返回属性值
    return target[key]
  },
  // 拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal
    // 把副作用函数从桶里取出并执行
    bucket.forEach(fn => fn())
  }
})

// ---------------------------------

// 副作用函数
function effect() {
  document.body.innerText = obj.text
}
// 首次执行副作用函数，收集依赖
effect()
// 修改数据，自动执行副作用函数
setTimeout(() => {
  obj.text = 'new val'
})
```

> 当 setter 拦截设置并执行副作用函数时，会再次触发 getter，bucket Set 数据可以保证副作用函数的收集不重复

### 完善的响应系统

一个响应系统的工作流程如下

- 当读取操作发生时，将副作用函数收集到”桶“中；
- 当设置操作发生时，从”桶“中取出副作用函数并执行；

#### 副作用函数注册机制

基本实现硬编码了副作用函数当名字（effect），甚至还有可能为匿名函数，为了解决这个问题，需要提供一个用来注册副作用函数的机制：

1. 手动执行 effect 注册副作用函数
2. 先把副作用函数赋值到全局变量 activeEffect
3. 然后执行真正的副作用函数触发 Proxy 的 get
4. get 拦截器直接读取全局变量实现依赖收集：track(target, key)

#### WeakMap

🌐 [WeakMap (opens new window)](https://www.ijerrychen.com/javascript/map.html#weakmap)

WeakMap 对 key 是弱引用，不影响垃圾回收的工作。根据这个特性可知，一旦 key 被垃圾回收器回收，那么对应的键和值就访问不到了。

所以 WeakMap 经常用于存储那些只有当 key 所引用的对象存在时（没有被回收）才有价值的信息。

```js
// 存储副作用函数的桶
const bucket = new WeakMap()

// 原始数据
const data = { text: 'hello world' }
// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
    track(target, key)
    // 返回属性值
    return target[key]
  },
  // 拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal
    // 把副作用函数从桶里取出并执行
    trigger(target, key)
  }
})

function track(target, key) {
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  effects && effects.forEach(fn => fn())
}

// 用一个全局变量存储当前激活的 effect 函数
let activeEffect
function effect(fn) {
  // 当调用 effect 注册副作用函数时，将副作用函数复制给 activeEffect
  activeEffect = fn
  // 执行副作用函数
  fn()
}
```

> WeakMap => Map => Set

### 分支切换与cleanup

#### 分支切换

- 三元表达式首次真值会导致 data 的两个字段都把当前副作用函数收集为依赖，也就是说 data 任何一个字段的更改都会导致副作用函数的重新执行
- 但是，当 ok 改变为 false 后，实际上我们希望只有 text 字段保留着当前这个副作用函数依赖，产生遗留的副作用函数

```js
const data = { ok: true, text: 'hello' }
const obj = new Proxy(data, { /*...*/ })

effect(function effectFn() {
	document.body.innerText = obj.ok ? obj.text : 'not'
})
```

所以，我们需要重新建立联系，在副作用函数执行时，先把它与所有关联的依赖集合中删除，执行后便重新收集了新一轮的依赖。

🚀 增加 activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合

#### Set 循环问题

🐛 在调用 forEach 遍历 Set 集合时，如果一个值已经被访问过，但该值被删除并重新添加到集合，如果此时 forEach 遍历没有结束，那么该值会被重新访问。

🚀 这种情况下会出现死循环，可以构造一个额外的 Set 集合并遍历它

```js
const set = new Set([1,2,3])

const newSet = new Set(set)
newSet.forEach(item => {
  set.delete(1)
  set.add(1)
  console.log(item)
})
```

> chrome 调试目前好像没有复现这个问题

#### 最终代码

```js
// 存储副作用函数的桶
const bucket = new WeakMap()

// 原始数据
const data = { ok: true, text: 'hello world' }
// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
    track(target, key)
    // 返回属性值
    return target[key]
  },
  // 拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal
    // 把副作用函数从桶里取出并执行
    trigger(target, key)
  }
})

function track(target, key) {
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
	// 声明一个新 Set 进行遍历操作
  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => effectsToRun.add(effectFn))
  // effectFn() 的执行会重新触发依赖收集 track
  effectsToRun.forEach(effectFn => effectFn())
  // effects && effects.forEach(effectFn => effectFn())
}

// 用一个全局变量存储当前激活的 effect 函数
let activeEffect
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    // 当调用 effect 注册副作用函数时，将副作用函数复制给 activeEffect
    activeEffect = effectFn
    fn()
  }
  // activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
  effectFn.deps = []
  // 执行副作用函数
  effectFn()
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    // deps 即某个对象属性下的依赖桶
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}
```

### 嵌套的 effect 与 effect 栈

🐛 组件的嵌套就会出现 effect 的嵌套，全局变量 activeEffect 在这个过程中会被嵌套的 effect 覆盖，可以通过一个**函数栈**解决

```js
// 用一个全局变量存储当前激活的 effect 函数
let activeEffect
// effect 栈
const effectStack = []

function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    // 当调用 effect 注册副作用函数时，将副作用函数复制给 activeEffect
    activeEffect = effectFn
    // 在调用副作用函数之前将当前副作用函数压栈
    effectStack.push(effectFn)
    fn()
    // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并还原 activeEffect 为之前的值
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  // activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
  effectFn.deps = []
  // 执行副作用函数
  effectFn()
}
```

### 避免无限递归循环

```js
const data = { foo: 1 }
obj = new Proxy(data, {/*...*/})

effect(() => obj.foo++)
```

当副作用函数内同时发生了读和写，会导致 get 与 set 的死循环，我们需要为 trigger 的执行增加守卫条件：如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不执行：

```js
function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    // 守卫条件
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  effectsToRun.forEach(effectFn => effectFn())
}
```

### 调度执行

✅ 可调度就是值当 trigger 动作触发副作用函数的执行时，有能力决定副作用函数执行的时机、次数以及方式。

也就是要在执行 effect 函数的时候获得一些额外的配置信息，为 effectFn 增加一个额外的配置即可：

1. 在 effect 副作用函数注册的时候增加配置参数：options.scheduler
2. trigger 执行时，如果有 scheduler 则使用它调度执行

```js
// 存储副作用函数的桶
const bucket = new WeakMap()

// 原始数据
const data = { foo: 1, bar: 2 }
// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
    track(target, key)
    // 返回属性值
    return target[key]
  },
  // 拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal
    // 把副作用函数从桶里取出并执行
    trigger(target, key)
  }
})

function track(target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

// 用一个全局变量存储当前激活的 effect 函数
let activeEffect
// effect 栈
const effectStack = []

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    // 当调用 effect 注册副作用函数时，将副作用函数复制给 activeEffect
    activeEffect = effectFn
    // 在调用副作用函数之前将当前副作用函数压栈
    effectStack.push(effectFn)
    const res = fn()
    // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并还原 activeEffect 为之前的值
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]

    return res
  }
  // 将 options 挂在到 effectFn 上
  effectFn.options = options
  // activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
  effectFn.deps = []
  // 如果不是计算属性，立即执行副作用函数，进行依赖收集
  if (!options.lazy) {
    effectFn()
  }

  return effectFn
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

// =========================

const jobQueue = new Set()
const p = Promise.resolve()

let isFlushing = false
function flushJob() {
  if (isFlushing) return
  isFlushing = true
  p.then(() => {
    jobQueue.forEach(job => job())
  }).finally(() => {
    isFlushing = false
  })
}


effect(() => {
  console.log(obj.foo)  // 1
}, {
  scheduler(fn) {
    jobQueue.add(fn)
    flushJob()
  }
})

obj.foo++
obj.foo++  // 3
```

🚀 以上调度器实现：属性修改两次，中间的 2 过渡状态对应的依赖更新忽略不执行（两个副作用函数放到 Set 当中去重，两次数据更新后，在微任务当中一次执行）

### 计算属性 computed 与 lazy

::: tip 计算属性的实现：

1. 懒计算：计算属性不会立即执行，在需要的时候才执行。我们通过为 option 添加 lazy 属性来达到目的；同时，计算属性实际上就是副作用函数（getter）的执行结果，我们需要调整副作用函数的注册代码，返回真正副作用函数的结果。
2. 值缓存：计算属性在 getter 函数所依赖的响应式数据变化时才需要真正执行，而不是每次获取 computed 属性时都需要执行一次副作用函数。为计算属性添加 value 字段保存执行结果，同时添加 dirty 属性，在依赖的数据变化时更改 dirty 为 true。这样，下次读取计算属性的值时，我们会重新计算真正的值。
3. 响应式：计算属性也要能够更新对应的副作用函数。在其 value 读取时，手动调用 track 函数进行追踪，收集依赖；在计算属性依赖的响应式数据发生变化时，手动调用 trigger函数触发响应。

:::

```js
function computed(getter) {
  let value
  let dirty = true

  const effectFn = effect(getter, {
    lazy: true,
    // scheduler(effectFn)内部虽然能拿到 getter 关联数据的副作用函数，但不需要，它们有自己的更新逻辑
    // 计算属性只需要关注自己的effectFn进行更新即可，当关联数据更新时，dirty 设为 true，也就是要重新计算
    scheduler() {
      if (!dirty) {
        dirty = true
        trigger(obj, 'value')
      }
    }
  })
  
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      track(obj, 'value')
      return value
    }
  }

  return obj
}

const sumRes = computed(() => obj.foo + obj.bar)

console.log(sumRes.value)
console.log(sumRes.value)

obj.foo++

console.log(sumRes.value)

effect(() => {
  console.log(sumRes.value)
})

obj.foo++
```

### watch 的实现原理

1. watch 可以观测响应式数据或者一个 getter 函数：traverse函数
2. 回调函数中要能够拿到新值与旧值
3. immediate 决定是否需要立即执行回调，此时旧值时 undefined
4. flush 决定回调函数的执行时机：通过调度器和异步的微任务队列实现 post

✅ watch 的实现本质上利用了副作用函数重新执行时的可调度性。一个 watch 本身会创建一个 effect，当这个 effect 依赖的响应式数据发生变化时，会执行该 effect 的调度器函数，即 scheduler。这里的 scheduler 可以理解为“回调”，所以我们只需要在 scheduler 中执行用户通过 watch 函数注册的回调函数即可

```js
// 观测参数处理
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return
  seen.add(value)
  for (const k in value) {
    traverse(value[k], seen)
  }

  return value
}

function watch(source, cb, options = {}) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  let oldValue, newValue

  // 执行回调，传递新值与旧值
  const job = () => {
    newValue = effectFn()
    cb(oldValue, newValue)
    oldValue = newValue
  }

  const effectFn = effect(
    // 执行 getter
    () => getter(),
    {
      lazy: true,
      scheduler: () => {
        if (options.flush === 'post') {
          const p = Promise.resolve()
          p.then(job)
        } else {
          job()
        }
      }
    }
  )
  
  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}

watch(() => obj.foo, (newVal, oldVal) => {
  console.log(newVal, oldVal)
}, {
  immediate: true,
  flush: 'post'
})

setTimeout(() => {
  obj.foo++
}, 1000)
```

### 过期的副作用

**竞态问题**对应前端也有发生的场景，比如 watch 观测 响应式数据的变化：回调函数中执行异步数据请求操作，如果因为网络问题或其他导致前面的请求比后面的晚到，就会出现数据更新错乱。

归根结底，我们需要一个让副作用函数过期的手段：watch 内部每次检测到变更之后，在副作用函数重新执行之前，先调用自定义的过期回调即可

```js
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return
  seen.add(value)
  for (const k in value) {
    traverse(value[k], seen)
  }

  return value
}

function watch(source, cb, options = {}) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  let oldValue, newValue

  let cleanup
  function onInvalidate(fn) {
    cleanup = fn
  }

  const job = () => {
    newValue = effectFn()
    if (cleanup) {
      cleanup()
    }
    cb(oldValue, newValue, onInvalidate)
    oldValue = newValue
  }

  const effectFn = effect(
    // 执行 getter
    () => getter(),
    {
      lazy: true,
      scheduler: () => {
        if (options.flush === 'post') {
          const p = Promise.resolve()
          p.then(job)
        } else {
          job()
        }
      }
    }
  )
  
  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}

let count = 0
function fetch() {
  count++
  const res = count === 1 ? 'A' : 'B'
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(res)
    }, count === 1 ? 1000 : 100);
  })
}

let finallyData

watch(() => obj.foo, async (newVal, oldVal, onInvalidate) => {
  let valid = true
  onInvalidate(() => {
    valid = false
  })
  const res = await fetch()

  if (!valid) return

  finallyData = res
  console.log(finallyData)
})

obj.foo++
setTimeout(() => {
  obj.foo++
}, 200);
```

