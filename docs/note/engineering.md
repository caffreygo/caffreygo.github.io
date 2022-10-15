# 前端工程化

## 配置项解读

::: tip 概述

- @babel/preset-env 就是要转换的 ES6 特性的一个合集，不需要 plugins 一个个添加。

  1. useBuiltIns 指定 babel 如何从 core-js 中提取合适的 ES6 新特性的实现 usage/entry；
  2. corejs 指定 core-js 的版本；

- browserslist 提供了一种项目**共享的目标环境配置**，整个项目的babel、eslint，ts等都可以读取到。

  有了 browserslist 的配置，我们就可以不用配置 @babel/preset-env 的 target了

- babel 只是用来将 ES6+ 的语法转为 ES5，它并不处理 ES6 新增的 API。core-js 处理 ES6 新增的 API。

> @babel/preset-env 提供了针对 browserslist 指定的老旧浏览器来转换 ES6 到 ES5
>
> 同时还能根据 browserslist 指定的环境从 core-js 中提取需要的 ES6 新增 API 的实现。

:::

### preset-env

从名称看有个env，这里就是包含“环境”之意。

在preset-env出来之前，我们需要自己知道要用什么es6的特性，然后自己去babel的配置文件中加进去，如：

```json
{
  "plugins": [
      "@babel/plugin-transform-arrow-functions",
      "@babel/plugin-transform-classes",
      "@babel/plugin-transform-spread",
      ...
  ]
}
```

这样做非常繁琐，开发体验也不好。再后来，后来就出现了@babel/preset-env。

@babel/preset-env 可以通过 target 属性配置一个**目标环境**，babel会根据环境来转换那些它不支持的语法，这样就不需要我们一个一个的去自己加入所要支持的es6特性。如

```json
{
    "presets": [
        ["@babel/preset-env", {
            "target": {
                "browsers": ["last 2 versions", "ie >= 7"]
            }
        }]
    ]
}
```

所以，@babel/preset-env 的作用就是将常用的ES6特性放到一起了，然后添加一个可以配置的目标环境，它自己决定要转换那些ES6特性，这样开发体验就好很多。

> 这样虽然不需要我们配置ES6特性，但需要我们自己配置目标环境，且这个环境只是babel自己知道，如果还有其他应用，如ESLint，TS等等，其他应用也需要读取目标环境来决定行为，还得配置……所以browserslist出现了。

### browserslist

browserslist提供了一种项目共享的目标环境配置，整个项目的babel、eslint，ts等都可以读取到。如：

```
# Browsers that we support

[modern]
Firefox >= 53
Edge >= 15
Chrome >= 58
iOS >= 10.1

[legacy]
> 1%
```

它有自己的配置语法，一看就会，它有多种具体文档：https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fbrowserslist%2Fbrowserslist

有了 browserslist 的配置，我们就可以不用配置 @babel/preset-env 的 target了。browserslist的配置可以写在package.json里面也可以用独立的.browserslistrc文件。

### core-js

我们已经有babel了，为何还要core-js呢？如果你这么想，那就是有个关键的概念没有搞清楚。一般babel只是用来将ES6+的语法转为ES5，它并不处理ES6新增的API，如

```js
const t = [1,2,3];
console.log(...t);
const x = t.includes(2);
console.log(x);
```

转换后

```js{5}
"use strict";
var _console;
var t = [1, 2, 3];
(_console = console).log.apply(_console, t);
var x = t.includes(2);
console.log(x);
```

上面的扩展运算符是属于语法的范畴，而数组的includes方法是属于ES6新增的API，所以babel只是转换了扩展运算符，而并没有处理includes方法。所以当我们在比较老旧的浏览器中运行时会报错，如何让这些老旧的浏览器也能认识ES6新增的这些API，这就是core-js要做的事情了。

### babel.config.json

```json
{
    "presets": [
        ["@babel/preset-env", {
            "useBuiltIns": "usage",
            "corejs": "3"
        }]
    ]
}
```

#### useBuiltIns

主要用于指定babel如何从core-js中提取合适的ES6新特性的实现，有两种模式：

- usage：我们不需要在入口处导入core-js，babel会根据代码中使用的ES6 API来决定提取哪些。
- entry：我们通过import在入口引入core-js，babel会根据引入的core-js模块来识别和拆分更细的导入

:::: code-group
::: code-group-item usage

```js
"use strict";
require("core-js/modules/es.symbol.js");
require("core-js/modules/es.symbol.description.js");
require("core-js/modules/es.symbol.iterator.js");
require("core-js/modules/es.array.from.js");
require("core-js/modules/es.array.slice.js");
require("core-js/modules/es.function.name.js");
require("core-js/modules/es.regexp.exec.js");
require("regenerator-runtime/runtime.js");
// ...
```
:::
::: code-group-item entry

```js
// 源文件
import "core-js/es/array";
import "core-js/proposals/math-extensions";

// 输出
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/esnext.math.clamp";
import "core-js/modules/esnext.math.deg-per-rad";
import "core-js/modules/esnext.math.degrees";
import "core-js/modules/esnext.math.fscale";
import "core-js/modules/esnext.math.rad-per-deg";
import "core-js/modules/esnext.math.radians";
import "core-js/modules/esnext.math.scale";
```
:::
::::

#### corejs

用于指定core-js的版本，因为core-js有2和3的版本，这里babel默认会使用2的版本，这里建议用3的版本。babel还建议指定core-js的minor版本，这样能将最新实现的API包含进来。默认情况下，babel只会提取稳定的API实现，如果你想将还在提案阶段的API也包含进来，可以这样配置：

```json
{
    "corejs": { version: "3.8", proposals: true }
}
```

总的来说，useBuiltIns配置为usage，corejs配置为{ version: "3.8", proposals: true }会是大部分场景的选择。

## CSS 工程化

原生 CSS 存在的问题：

1. **开发体验**欠佳。比如原生 CSS 不支持选择器的嵌套:

```css
// 选择器只能平铺，不能嵌套
.container .header .nav .title .text {
  color: blue;
}

.container .header .nav .box {
  color: blue;
  border: 1px solid grey;
}
```

1. **样式污染**问题。如果出现同样的类名，很容易造成不同的样式互相覆盖和污染。

```ts
// a.css
.container {
  color: red;
}

// b.css
// 很有可能覆盖 a.css 的样式！
.container {
  color: blue;
}
```

1. **浏览器兼容**问题。为了兼容不同的浏览器，我们需要对一些属性(如`transition`)加上不同的浏览器前缀，比如 `-webkit-`、`-moz-`、`-ms-`、`-o-`，意味着开发者要针对同一个样式属性写很多的冗余代码。
2. 打包后的**代码体积**问题。如果不用任何的 CSS 工程化方案，所有的 CSS 代码都将打包到产物中，即使有部分样式并没有在代码中使用，导致产物体积过大。

针对如上原生 CSS 的痛点，社区中诞生了不少解决方案，常见的有 5 类。

1. `CSS 预处理器`：主流的包括`Sass/Scss`、`Less`和`Stylus`。这些方案各自定义了一套语法，让 CSS 也能使用嵌套规则，甚至能像编程语言一样定义变量、写条件判断和循环语句，大大增强了样式语言的灵活性，解决原生 CSS 的**开发体验问题**。
2. `CSS Modules`：能将 CSS 类名处理成哈希值，这样就可以避免同名的情况下**样式污染**的问题。
3. CSS 后处理器`PostCSS`，用来解析和处理 CSS 代码，可以实现的功能非常丰富，比如将 `px` 转换为 `rem`、根据目标浏览器情况自动加上类似于`--moz--`、`-o-`的属性前缀等等。
4. `CSS in JS` 方案，主流的包括`emotion`、`styled-components`等等，顾名思义，这类方案可以实现直接在 JS 中写样式代码，基本包含`CSS 预处理器`和 `CSS Modules` 的各项优点，非常灵活，解决了开发体验和全局样式污染的问题。
5. CSS 原子化框架，如`Tailwind CSS`、`Windi CSS`，通过类名来指定样式，大大简化了样式写法，提高了样式开发的效率，主要解决了原生 CSS **开发体验**的问题。

不过，各种方案没有孰优孰劣，各自解决的方案有重叠的部分，但也有一定的差异，大家可以根据自己项目的痛点来引入。接下来，我们进入实战阶段，在 Vite 中应用上述常见的 CSS 方案。