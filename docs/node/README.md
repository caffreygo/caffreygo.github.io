## Node引入模块

1. 路径分析
2. 文件定位
3. 编译执行

::: tip 

​		在node中，模块分为两类：核心模块（Node提供的模块）; 文件模块（用户编写的模块）

​		核心模块在Node源代码的编译中已经编译进了二进制执行文件。在node进程启动时，部分核心模块就被直接加载进内存中，这部分模块的引入省略了文件定位和编译执行的步骤。且在路径分析中是优先判断，加载速度最快。

​		文件模块是在运行时动态加载，需要完整的模块引入步骤。

:::



## CommonJs,AMD和CMD

::: tip 对比

- Node提出了commonJs的规范，基于此组织了自身的原生模块。

- CommonJs规范主要服务器端，NPM是对此规范的支持产物。
- AMD和CMD在浏览器环境

:::

模块写成对象，同时**立即执行函数**保证了外部无法访问内部私有变量

```js
var module = (function(){
    var star = 0;
    var f1 = function (){
        console.log('ok');
    };
    // IIFE只返回一个包含f1方法的对象
    return {
        f1
    };
})();
module.f1();  // ok
console.log(module.star)  // undefined 无法访问私有变量
```

以下参考阅读：https://www.jianshu.com/p/d67bc79976e6

### commonJs

::: tip commonJs

- 一个单独的文件就是一个模块。每一个模块都是一个单独的作用域，也就是说，在该模块内部定义的变量，无法被其他模块读取，除非定义为`global`对象的属性。
- 输出模块变量的最好方法是使用`module.exports`对象。
- 加载模块使用`require`方法，该方法读取一个文件并执行，返回文件内部的`module.exports`对象

::: 

```js
//   math.js
exports.add = function() {
    var sum = 0, i = 0, args = arguments, l = args.length;
    while (i < l) {
        sum += args[i++];
    }
    return sum;
};

//  increment.js
var add = require('math').add;
exports.increment = function(val) {
    return add(val, 1);
};

//  index.js
var increment = require('increment').increment;
var a = increment(1); //2
```

::: warning 浏览器端异步问题

-  `require` 是**同步**的。模块系统需要同步读取模块文件内容，并编译执行以得到模块接口。
   然而， 这在浏览器端问题多多。
- 浏览器端，加载 JavaScript 最佳、最容易的方式是在 `document` 中插入`script`标签。但脚本标签天生异步，传统 CommonJS 模块在浏览器环境中无法正常加载。
- 解决思路之一是，开发一个服务器端组件，对模块代码作静态分析，将模块与它的依赖列表一起返回给浏览器端。 这很好使，但需要服务器安装额外的组件，并因此要调整一系列底层架构。

:::

另一种解决思路是，用一套**标准模板**来封装模块定义：

```js
define(function(require, exports, module) {

  // The module code goes here

});
```

这套模板代码为模块加载器提供了机会，使其能在模块代码执行之前，对模块代码进行静态分析，并动态生成依赖列表。

```js
//  math.js
define(function(require, exports, module) {
  exports.add = function() {
    var sum = 0, i = 0, args = arguments, l = args.length;
    while (i < l) {
      sum += args[i++];
    }
    return sum;
  };
});

//  increment.js
define(function(require, exports, module) {
  var add = require('math').add;
  exports.increment = function(val) {
    return add(val, 1);
  };
});

//  index.js
define(function(require, exports, module) {
  var inc = require('increment').increment;
  inc(1); // 2
});
```

### AMD

::: tip AMD

1. AMD是`"Asynchronous Module Definition"`的缩写，意思就是"异步模块定义"。由于不是JavaScript原生支持，使用AMD规范进行页面开发需要用到对应的库函数，也就是大名鼎鼎`RequireJS`，实际上AMD 是 `RequireJS` 在推广过程中对模块定义的规范化的产出
2. 它采用异步方式加载模块，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。
3. `RequireJS`主要解决**两个问题**

- 多个js文件可能有依赖关系，被依赖的文件需要早于依赖它的文件加载到浏览器
- js加载的时候浏览器会停止页面渲染，加载文件越多，页面失去响应时间越长

:::

::: tip RequireJs

**RequireJs**也采用require()语句加载模块，但是不同于CommonJS，它要求两个参数:

1. 第一个参数[module]，是一个数组，里面的成员就是要加载的模块；
2. 第二个参数callback，则是加载成功之后的回调函数。math.add()与math模块加载不是同步的，浏览器不会发生假死。

:::

```ruby
require([module], callback);

require([increment'], function (increment) {
　   increment.add(1);
});
```

#### define()函数

​		`RequireJS`定义了一个函数 `define`，它是全局变量，用来定义模块:
 `define(id?, dependencies?, factory);`
::: tip  参数说明：

- id：指定义中模块的名字，可选；如果没有提供该参数，模块的名字应该默认为模块加载器请求的指定脚本的名字。如果提供了该参数，模块名必须是“顶级”的和绝对的（不允许相对名字）。
- 依赖dependencies：是一个当前模块依赖的，已被模块定义的模块标识的数组字面量。
   依赖参数是可选的，如果忽略此参数，它应该默认为["require", "exports", "module"]。然而，如果工厂方法的长度属性小于3，加载器会选择以函数的长度属性指定的参数个数调用工厂方法。
- 工厂方法factory，模块初始化要执行的函数或对象。如果为函数，它应该只被执行一次。如果是对象，此对象应该为模块的输出值。

:::

来举个🌰看看：

```js
define("alpha", ["require", "exports", "beta"], function (require, exports, beta) {
    exports.verb = function() {
        return beta.verb();
        //Or:
        return require("beta").verb();
    }
});
```

#### RequireJs使用例子

​		`require.config`是用来定义别名的，在paths属性下配置别名。然后通过`requirejs`(参数一，参数二)；参数一是数组，传入我们需要引用的模块名，第二个参数是个回调函数，回调函数传入一个变量，代替刚才所引入的模块。

```jsx
main.js
//别名配置
requirejs.config({
    paths: {
        jquery: 'jquery.min' //可以省略.js
    }
});
//引入模块，用变量$表示jquery模块
requirejs(['jquery'], function ($) {
    $('body').css('background-color','red');
});
```

​		引入模块也可以只写`require()`。`requirejs`通过`define()`定义模块，定义的参数上同。在此模块内的方法和变量外部是无法访问的，只有通过`return`返回才行.

```jsx
//  math.js
define('math',['jquery'], function ($) {//引入jQuery模块
    return {
        add: function(x,y){
            return x + y;
        }
    };
});
```

​		将该模块命名为math.js保存

```jsx
require(['jquery','math'], function ($,math) {
    console.log(math.add(10,100));//110
});
```

​		main.js引入模块方法

### CMD

::: tip CMD

​		CMD 即`Common Module Definition`通用模块定义，CMD规范是国内发展出来的，就像AMD有个`requireJS`，CMD有个浏览器的实现`SeaJS`，`SeaJS`要解决的问题和`requireJS`一样，只不过在模块定义方式和模块加载（可以说运行、解析）时机上有所不同。

::: 

在 CMD 规范中，一个模块就是一个文件。代码的书写格式如下:

```tsx
define(function(require, exports, module) {

  // 模块代码

});
```

​		`require`是可以把其他模块导入进来的一个参数;而`exports`是可以把模块内的一些属性和方法导出的;`module` 是一个对象，上面存储了与当前模块相关联的一些属性和方法。

- AMD是依赖关系前置,在定义模块的时候就要声明其依赖的模块;
- CMD是按需加载依赖就近,只有在用到某个模块的时候再去require：

```jsx
// CMD
define(function(require, exports, module) {
  var a = require('./a')
  a.doSomething()
  // 此处略去 100 行
  var b = require('./b') // 依赖可以就近书写
  b.doSomething()
  // ... 
})

// AMD 默认推荐的是
define(['./a', './b'], function(a, b) { // 依赖必须一开始就写好
  a.doSomething()
  // 此处略去 100 行
  b.doSomething()
  ...
}) 
```

#### seajs使用例子

```jsx
// 定义模块  myModule.js
define(function(require, exports, module) {
  var $ = require('jquery.js')
  $('div').addClass('active');
  exports.data = 1;
});

// 加载模块
seajs.use(['myModule.js'], function(my){
    var star= my.data;
    console.log(star);  //1
});
```

