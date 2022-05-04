# 框架设计的核心要素

## 提升用户开发体验

对于开发者来说，精准的错误警告和 DevTools 可以节省很多问题定位时间

## 控制框架代码的体积

Vue.js 在源码通过区分 dev 开发与 prod 生产环境，从而将比如错误提示这类代码移除，从而降低代码体积

## 良好的Tree-Shaking

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

## 支持输出多种构建产物

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

## 特性开关

1. 对于用户关闭的特性，利用 Tree-Shaking 排除这些代码在最终资源之外

2. 提升框架设计的灵活性，用户可以选择是否需要使用历史遗留的 API

   ```js
   // webpack.DefinePlugin 配置
   new webpack.DefinePlugin({
     __VUE_OPTIONS_API__: JSON.stringify(true)  // 开启特性
   })
   ```

🔥 通过特性开关，最终作用到源码的`__VUE_OPTIONS_API__`，如果我们明确只需要composition API，不需要 option API，可以减少最终的代码构建体积

## 错误处理

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

## 良好的TS类型支持

使用 TS 编写代码与TS类型支持友好是两回事，需要花大力气做类型推导，还需要考虑 TSX 的支持。