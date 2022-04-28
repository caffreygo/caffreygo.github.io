# Vuejs的设计与实现

## 权衡的艺术

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

🔥 Vue.js 是运行时 + 编译时架构，保证灵活性的基础上，通过分析，尽可能提升性能

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

1. 如果是浏览器直接脚本引入，可以打包为iife直接引用；

2. 如果是esm，浏览器通过设置 script 标签的 type 为 module 即可引入使用`vue.esm-browser.js`；

   同时考虑到打包工具使用的情况，提供了`vue.esm-bunder.js`，将`__DEV__`替换成了`process.env.NODE_ENV !== 'production'`，由webpack配置来决定构建资源的目标环境（最终效果都是一样的，这些代码都只会出现在开发环境）；

3. 如果是 CommonJS 的 Node.js 环境，针对于 SSR 的情况，则需要打包出 cjs 的模块形式；

🔥 无论是webpack还是rollup，在寻找资源时，如果package.json 中存在module字段，会优先使用module字段指向的资源来代替main字段指向的资源，Vue.js源码中的package/vue/package.json文件：

```json
{
  "main": "index.js",
  "module": "dist/vue.esm-bunder.js"
}
```

### 特性开关

1. 对于用户关闭的特性，利用Tree-Shaking排除这些代码在最终资源之外

2. 提升框架设计的灵活性，用户可以选择是否需要使用历史遗留的 API

   ```js
   // webpack.DefinePlugin 配置
   new webpack.DefinePlugin({
     __VUE_OPTIONS_API__: JSON.stringify(true)  // 开启特性
   })
   ```

   🔥 通过特性开关，最终作用到源码的`__VUE_OPTIONS_API__`，如果我们明确只需要composition API，不需要option API，可以减少最终的代码构建体积

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

🔥 这便是Vue.js错误处理的原理，用户可以选择忽略错误，也可以注册错误上报程序收集给监控系统

```js
import App from './App'
const app = createApp(App)
app.config.errorHandler = () => {/*...*/}
```

### 良好的TS类型支持

使用TS编写代码与TS类型支持友好是两回事，需要花大力气做类型推倒，还需要考虑TSX的支持

