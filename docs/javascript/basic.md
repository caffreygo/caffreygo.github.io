# 起步

### 语言介绍

📗 JavaScript 官方名称是 `ECMAScript` 是一种属于网络的脚本语言,已经被广泛用于Web应用开发,常用来为网页添加各式各样的动态功能,为用户提供更流畅美观的浏览效果。

1995年2月Netscape的`布兰登.艾奇`开发了针对网景公司的 `Netscape Navigator`浏览器的脚本语言LiveScript。之后Netscape与Sun公司联盟后LiveScript更名为JavaScript。

微软在javascript发布后为了抢占市场推出了JScript。为了让脚本语言规范不在混乱，根据javascript 1.1版本推出了 ECMA-262的脚本语言标准。

ECMA是欧洲计算机制造商协会由Sum、微软、NetScape公司的程序员组成。

> 文档中会经常使用 `JS` 简写来代替 `JavaScript`

### 适用场景

::: tip 

- 浏览器网页端开发
- 做为服务器后台语言使用[Node.js(opens new window)](https://nodejs.org/en/)
- 移动端手机APP开发，如Facebook的 [React Native (opens new window)](https://facebook.github.io/react-native/)、`uniapp`、`PhoneGap`、`IONIC`
- 跨平台的桌面应用程序，如使用 [electronjs(opens new window)](https://electronjs.org/)

:::

> 所以JS是一专多能的语言，非常适合学习使用。

### 发展历史

- 1994年Netscape（网景）公司发布了 `Navigator` 浏览器1.0版本，市场占用率超过90%

- 1995年发布了`JavaScript` 语言

- 1996年 JS在 `Navigator`浏览器中使用

- 1996年微软发布`JScript`在IE3.0中使用

- 1996年11月网景公司将JS提交给ECMA(国际标准化组织)成为国际标准，用于对抗微软。

  由ECMA的第39号技术专家委员会（Technical Committee 39，简称TC39）负责制订ECMAScript标准，成员包括Microsoft、Mozilla、Google等大公司。

- 1997年 ECMA发布ECMA-262标准，推出浏览器标准语言 `ECMAScript 1.0`

  ECMAScript 是标准而Javascript是实现

- ...

- 2009年ECMAScript 5.0发布

- 2011年ECMAScript5.1发布，成为ISO国际标准，从而推动所有浏览器都支持

- ...

- 2015年ECMAScript6发布，更名为ECMAScript 2015。

- 2016年ECMAScript7发布，ECMAScript2016

- 2017年ECMAScript8发布，ECMAScript2017

- 2018年ECMAScript9发布，ECMAScript2018

- 2019年ECMAScript10，ECMAScript2019

- 2020年ECMAScript11，ECMAScript2020

- ....

从2015年开始 `tc39`委员会决定每年发布新的ECMAScript版本

### 运行流程

📗 所有内容需要在**特定的环境**中运行，就像PSD需要在类似PS的软件处理一样。浏览器内置了处理的JS的解析器，但不同浏览器的性能不同，所以JS一般都在浏览器中执行，当然也有可以在服务器后台执行的JS解析器。

JS请求处理步骤如下：

![](./img/basic/1.png)

### 脚本定义

**内嵌脚本**

像style标签一样，可以在html文档中使用`script`标签嵌入javascript代码。

```html
<script>
    alert('JavaScript');
</script>
```

**外部文件**

通过设置 `src` 属性引入外部js文件。

```html
<script src="more.js"></script>
```

引入外部文件在标签体内的脚本不会执行，下面的alert弹窗不会执行。

```html
<script src="more.js">
	alert('fuuuu');  // 忽略区域
</script>
```

### 避免延迟

📗 如果js放在 `<heade>` 标签中要等到js加载并解析后才会显示`<body>`标签中的内容。

**延迟体验**

下面是延迟加载的示例

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo</title>
    <script src="more.js">
    </script>
</head>

<body>
    <h1>Title</h1>
</body>
```

more.js 内容如下

```js
alert('more');
```

💡 h1会在more.js文件加载并解析后才会显示。(顺序执行，需要等待`alert`执行玩才往下走)

**推荐做法**

为了解决上面的问题，可以将js放在 标签前如下所示。

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demop</title>
</head>

<body>
    <h1>Title</h1>
    <script src="more.js">
    </script>
</body>
```

### 代码注释

和大部分语言使用的注释方式相仿，有单行和多行注释。

**单行注释**

```html
<script>
  // 这是单行注释
</script>
```

**多行注释**

```html
<script>
  /*
  这是多行注释体验
  Hi~
  */
</script>
```

### 自动分号

📗 使用分号表示一段指令的结束，当没有输入分号时如果有换行符JS会自动添加分号，减少错误的发生。

- 但推荐每个指令都以分号结束 💡
- 在使用构建工具时，不使用分号结束可能会造成异常

```js
let stat = true;
if (stat) {
  document.write('Nice');
}
```

## 变量声明

### 命名规则

📗  JS中的变量是**弱类型**可以保存所有类型的数据，即变量没有类型而值有类型。变量名以字母、$、_ 开始，后跟字母、数字、_。

下面都是合法的命名

```js
let name = 'jerry';
let $='choice';
```

📌 JS语言关键字不能用来做变量名，比如 `true、if、while、class` 等。（在js预解析的时候会报错，导致上下都无法执行）

```js
let class = 'hello';
```

### 变量声明

可以使用多种方式定义变量比如var、let等:

```js
let name = 'Michael;
```

以上代码是声明和赋值的结合

```js
let name ;
name = 'Michael'
```

使用`,` 可以同时声明多个变量

```js
let n = 2,f = 3;
console.log(f);  // 3
```

下面演示了变量可以**更换**不同类型的数据

```js
let abc = 'jerry';
console.log(typeof abc);  // string

abc = 18;
console.log(typeof abc);  // number
```

### 弱类型

在JS中变量类型由所引用的值决定

```js
var web = "google.com";
console.log(typeof web);  // string
web = 99;
console.log(typeof web);  // number
web = {};
console.log(typeof web);  // object
```

### 变量提升 

📗 解析器会先解析代码，然后把声明的变量的声明提升到最前，这就叫做变量提升。

💡 下面代码在解析过程中发现`while`不能做为变量名，没有到执行环节就出错了，这是一个很好的解析过程的体验。

```js
var web = 'jerry';
console.log(web);
let while = 'text'; //Uncaught SyntaxError: Unexpected token 'while'
```

使用 `var` 声明代码会被提升到前面

```js
console.log(a); //undefined
var a = 1;
console.log(a);  //1

//以上代码解析器执行过程如下
var a;
console.log(a); //1
a = 1;
console.log(a); //1
```

下面是 `if(false)` 中定义的var也会发生变量提升，注释掉`if` 结果会不同

```js
var web = "jerry";
function func() {
  if (false) {
    var web = "text";  // 虽然代码不会执行到这行，但变量的声明提升依然会发生
  }
  console.log(web);  // undefined
}
func();
```

使用 `var` 定义的代码，声明会被提升到前面，赋值还在原位置

```js
console.log(abc);
var abc = 'text';

//以上代码解析器执行过程如下
var abc;
console.log(abc); // undefined
abc = 'text';
```

### TDZ

📗 TDZ 又称**暂时性死区**，指变量在作用域内已经存在，但必须在`let/const`声明后才可以使用。

::: tip TDZ可以让程序保持先声明后使用的习惯，让程序更稳定。

- 变量要先声明后使用
- 建议使用let/const 而少使用var

:::

使用`let/const` 声明的变量在声明前存在临时性死区（TDZ）使用会发生错误

```js
console.log(x); // Cannot access 'x' before initialization
let x = 1;
```

📌 在`run`函数作用域中产生TDZ，不允许变量在未声明前使用。

```js
abc = "jerry";
function run() {
  console.log(abc);  // Cannot access 'abc' before initialization
  let abc = "abccms";
}
run();
```

📌 下面代码b没有声明赋值不允许直接使用

```js
function abc(a = b, b = 3) {}
abc(); // Cannot access 'b' before initialization
```

💡 因为a已经赋值，所以b可以使用a变量，下面代码访问正常

```js
function abc(a = 2, b = a) {}
abc(); 
```

## 块作用域

### 共同点

`var/let/const`共同点是全局作用域中定义的变量，可以在函数中使用

```js
var abc = 'text';
function show() {
	return abc;
}
console.log(show());  // text
```

函数中声明的变量，只能在函数及其子函数中使用

```js
function abc() {
  var web = "text";

  function show() {
    console.log(web);
  }
  show(); // 子函数结果: text
  console.log(web); //函数结果: text
}
abc();
console.log(web); //全局访问: web is not defined
```

函数中声明的变量就像声明了私有领地，外部无法访问

```js
var web = "google.com";
function abc() {
  var web = "jerry.com";
  console.log(web); //jerry.com
}
abc();
console.log(web); //google.com
```

### var

📗 使用 `var` 声明的变量存在于最近的**函数**或**全局作用域**中，没有块级作用域的机制。

没有块作用域很容易污染全局，下面函数中的变量污染了全局环境

```js
function run() {
  web = "jerry";
}
run();
console.log(web); //jerry
```

没有块作用域时, var也会污染全局

```js
for (var i = 0; i < 10; i++) {
  console.log(i);  // 0~9
}
console.log(i);  // 10
```

使用`let`有块作用域时则不会

```js
let i = 100;
for (let i = 0; i < 6; i++) {
  console.log(i);  // 0~5
}
console.log(i);  // 100
```

下例中体验到 `var` 没有块作用域概念， `do/while` 定义的变量可以在块外部访问到

```js
var num = 0;

function show() {
    var step = 10;
    do {
        var res = 0;
        console.log(num = step++);  // 10~19
        res = num;
    } while (step < 20);
    console.log(`结果是${res}`);  // 19 (do while外部访问)
}
show();
```

📌`var` 全局声明的变量也存在于 `window`对象中，这会严重污染全局环境

```js
var abc = "jerry";
console.log(window.abc); //jerry
```

以往没有块任用时使用立即执行函数模拟块作用域

```js
(function() {
    var $ = this.$ = {};  // $会是函数作用域内部的变量，不会影响到window
    $.web = "google.com";
}.bind(window)());
console.log($.web);  // google.com
```

有了块作用域后实现就变得简单多了

```js
{
    let $ = (window.$ = {});
    $.web = "google.com";
}
console.log($.web);  // google.com
```

### let

📗 与 `var` 声明的区别是 `let/const` 拥有块作用域，下面代码演示了块外部是无法访问到`let`声明的变量。

- 建议将`let`在代码块前声明
- 用逗号分隔定义多个

`let`存在块作用域特性，变量只在块域中有效

```js
if (true) {
    let web = 'google.com',url = 'jerry.com';
    console.log(web); //google.com
}
console.log(web); //web is not defined
```

块内部是可以访问到上层作用域的变量

```js
if (true) {
  let user = "Jenny";
  (function() {
    if (true) {
      console.log(`这是块内访问：${user}`);  // 这是块内访问：Jenny
    }
  })();
}
console.log(user);  // user is not defined
```

每一层都是独立作用域，里层作用域可以声明外层作用域同名变量，但不会改变外层变量

```js
function run() {
    abc = "jerry";
    if (true) {
        let abc = "abc";
        console.log(abc); //abc
    }
    console.log(abc); //jerry
}
run();
```

### const

::: tip 使用 `const` 用来声明常量，比如可以用来声明后台接口的URI地址。

- 常量名建议全部大写
- 只能声明一次变量
- 声明时必须同时赋值
- 不允许再次全新赋值
- 可以修改引用类型变量的值
- 拥有块、函数、全局作用域

::: 

常量不允许全新赋值举例

```js
try {
  const URL = "https://www.google.com";
  URL = "https://www.baidu.com"; //产生错误
} catch (error) {
  throw new Error(error);
}
```

改变常量的引用类型值

```js
const INFO = {
  url: 'https://www.google.com',
  port: '8080'
};
INFO.port = '443';
console.log(INFO);  // {url: 'https://www.google.com', port: '443'}
```

下面演示了在**不同作用域中**可以重名定义常量

```js
const NAME = 'Michael';

function show() {
  const NAME = 'Jane';
  return NAME;
}
console.log(show());  // Jane
console.log(NAME);  // Michael
```

### 重复定义

使用 var 可能造成不小心定义了同名变量

```js
//优惠价
var price = 90;
//商品价格
var price = 100;
console.log(`商品优惠价格是:${price}`);  // 商品优惠价格是:100
```

📌 使用`let` 可以避免上面的问题，因为let声明后的变量**不允许在同一作用域中重新声明**

```js
let web = 'google.com';
let web = 'hacker.com'; //Identifier 'web' has already been declared
```

不同作用域可以重新声明

```js
let web = 'google.com';
if (true) {
	let web = 'hacker.com';
}
```

但可以改变值这是与const不同点

```js
let price = 90;
price = 88;
console.log(`商品价格是:${price}`);  // 88
```

📌 `let` 全局声明的变量不存在于 `window`对象中，这与`var`声明不同

```js
let abc = "abc";
console.log(window.abc); //undefined
```

### Object.freeze

如果冻结变量后，变量也不可以修改了，使用严格模式会报出错误。

```js
"use strict"
const INFO = {
  url: 'https://www.google.com',
  port: '8080'
};
Object.freeze(INFO);
INFO.port = '443'; // Cannot assign to read only property
console.log(INFO);  // {url: 'https://www.google.com', port: '8080'}
```

### 传值与传址

📗 基本数据类型指数值、字符串等简单数据类型，引用类型指对象数据类型。

基本类型复制是值的复制，互相不受影响。下例中将a变量的值赋值给b变量后，因为基本类型变量是独立的所以a的改变不会影响b变量的值。

```js
let a = 100;
let b = a;
a = 200;
console.log(b);  // 100
```

对于引用类型来讲，变量保存的是引用对象的指针。变量间赋值时其实赋值是变量的指针，这样多个变量就引用的是同一个对象。

```js
let a = {
  web: "google.com"
};
let b = a;
a.web = "baidu,com";
console.log(b);  // {web: 'baidu,com'}
```

### undefined

📗 对**声明但未赋值**的变量返回类型为 `undefined` 表示值未定义。

```js
let abc;
console.log(typeof abc);  // undefined
```

📌 对**未声明**的变量使用会报错，但判断类型将显示 `undefined`。

```js
console.log(typeof jerry);  // undefined
console.log(jerry);  // jerry is not defined
```

我们发现未赋值与未定义的变量值都为 `undefined` ，建议声明变量设置初始值，这样就可以区分出变量状态了。

📌 函数参数或无返回值是为`undefined`

```js
function abc(web) {
  console.log(web); //u ndefined
  return web;
}
console.log(abc()); // undefined
```

### null

`null` 用于定义一个空对象，即如果变量要用来保存引用类型，可以在初始化时将其设置为null

```js
var abc = null;
console.log(typeof abc); // null
```

## 严格模式

严格模式可以让我们及早发现错误，使代码更安全规范，推荐在代码中一直保持严格模式运行。

> 主流框架都采用严格模式，严格模式也是未来JS标准，所以建议代码使用严格模式开发

### 基本差异

变量必须使用关键词声明，未声明的变量不允许赋值

```js
"use strict";
url = 'jerry.com'; //url is not defined
```

强制声明防止污染全局

```js
"use strict";
function run() {
  web = "jerry";  //  web is not defined
}
run();
```

关键词不允许做变量使用

```js
"use strict";
var public = 'jerry.com';
// Unexpected strict mode reserved word
```

变量参数不允许重复定义

```js
"use strict";
function abc(name, name) {} 
// Duplicate parameter name not allowed in this context
```

💡 单独为函数设置严格模式

```js
function strict(){  
  "use strict";  
  return "严格模式";  
}  
function notStrict() {  
  return "正常模式";  
}  
```

💡 为了在多文件合并时，防止全局设置严格模式对其他没使用严格模式文件的影响，将脚本放在一个执行函数中。

```js
(function () {
  "use strict";
  url = 'jerry.com';
})();
```

### 解构差异

非严格模式可以不使用声明指令，严格模式下必须使用声明。所以建议使用 let 等声明。

```js
"use strict";
({name,url} = {name:'jerry',url:'google.com'});
console.log(name, url); // url is not defined
```

> 使用严格模式编码总是推荐的

```js
"use strict";
let {
    name,
    url
} = {
    name: 'jerry',
    url: 'google.com'
};
console.log(name, url);  // jerry google.com
```

