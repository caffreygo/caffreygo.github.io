# 同构渲染

::: tip 同构渲染

- Vue.js 可以用于构建容户端应用程序，组件的代码在浏览器中运行，并输出 DOM 元素。
- Vue.js 还可以在Node.js 环境中运行，它可以将同样的组件渲染为字符串并发送给浏览器。

以上描述了 Vue.js 的两种渲染方式，即客户端渲染 (client-side rendering, CSR)，以及服务端渲染 (server-side rendering， SSR)。另外，Vue.js 作为现代前端框架，不仅能够独立地进行 CSR 或 SSR，还能够将两者结合，形成所谓的**同构渲染** (isomorphic rendering )。

:::

## CSR、SSR 以及同构渲染

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