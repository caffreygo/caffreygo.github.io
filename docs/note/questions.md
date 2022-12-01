# 题目解析

## JavaScript

### 闭包相关

```js
let a = 0,
    b = 0;
function fn(a) {
    fn = function fn2(b) {
        console.log(++a + b);
    };
    console.log(a++);
}
fn(1);  // 1
fn(2);  // 5
```

>- 第一次执行，fn 接收参数 a = 1，打印当前 a 为数值 1。同时 fn 内部声明了 fn 的新引用函数，除了参数 b 的接收，它还使用了闭包变量 a，在 fn 第一次执行后，`a++` 后 a 为 2。
>- 第二次执行，fn 接收参数 b = 2，a 当前值为 2，`++a + b` 结果即为 5。

### 块级函数

```js
var a;
console.log(a, b, c);  // undefined undefined [Function: c]

a = 123;
function c() {}
if (true) {
  console.log(a, b);  // [Function: a] [Function: b]

  a = 5;
  console.log(a, b);  // 5 [Function: b]

  function a() {}  // 外层 a 被赋值为当前执行的值 5
  function b() {}  // 外层 b 被赋值为当前执行的值 [Function: b]
  a = 0;  // 块级作用域的 a 被赋值为 5
  console.log(a, b);  // 0 [Function: b]
}

console.log(a, b);  // 5 [Function: b]
```

>1. 🐛 块级作用域内的函数声明会提升到顶部，但是提升后的值是 undefined
>2. 块级作用域内的函数声明会提升到块作用域顶部，表现为正常的函数声明提升 (ES6)
>3. 🐛 执行到块级作用域内的函数声明时，会对外层的变量进行赋值，值为块级作用域运行时的值
>4. 严格模式下，第二行代码报错：b is not defined

### 微任务

🌐 [JS 类型判断 (opens new window)](https://www.ijerrychen.com/javascript/task.html#%E9%A2%98%E7%9B%AE%E8%A7%A3%E6%9E%90)

```js
async function async1() {
    console.log("async1 start");
    await new Promise((resolve) => {
        console.log("promise1");
    });
    console.log("async1 success");
    return "async1 end";
}

console.log("srcipt start");
async1().then((res) => console.log(res));
console.log("srcipt end");

// srcipt start
// async1 start
// promise1
// srcipt end
// async1 success（没有resolve，后面两步不打印）
// sync1 end
```

### typeof 类型判断

```js
console.log(typeof 0);  // number
console.log(typeof "");  // string
console.log(typeof true);  // boolean
console.log(typeof Symbol());  // symbol
console.log(typeof BigInt(9007199254740991));  // bigint
console.log(typeof undefined);  // undefined
console.log(typeof null);  // object

console.log(typeof (() => 1));  // function
console.log(typeof {});  // object
```

🌐 [JS 类型判断 (opens new window)](https://juejin.cn/post/6947812516122591246)

> `Object.prototype.toString` 方法可以使用 `Symbol.toStringTag` 这个特殊的对象属性进行自定义输出。

### 执行时上下文

::: tip 建立执行上下文

1. 确定形参（a, b, c）
2. 确定函数声明 （c 同名覆盖）
3. 内部声明的变量，记录为 undefined (同名忽略不覆盖)

:::

```js
function method(a, b, c) {
    console.log(a, b, c);  // 1 2 [Function: c]
    var a = "a";
    var b = function b() {};
    (function a() {});
    (function b() {});
    function c() {}
    console.log(a, b, c);  // a [Function: b] [Function: c]
}

method(1, 2, 3);
```

> `var a = "a"` 的 `var` 如果改成 `let` 会抛出已声明报错
>
> `( )` 把函数 a/b 的声明变成了函数表达式 🌐 [函数声明与函数表达式(opens new window)](https://www.ijerrychen.com/note/daily.html#%E5%87%BD%E6%95%B0%E5%A3%B0%E6%98%8E%E4%B8%8E%E5%87%BD%E6%95%B0%E8%A1%A8%E8%BE%BE%E5%BC%8F)

### == 的隐式转换

```js
// ? 位置应该怎么写才能输出 true
var a = ?;

console.log(
	a == 1 &&
    a == 2 &&
    a == 3
)
```

这其实涉及 JavaScript 的 == 隐式转换规则：

![img](https://raw.githubusercontent.com/caffreygo/static/main/blog/daily/==.png)

实现：

```js
const a = {
    _val: 0,
    valueOf: function () {
        return ++this._val;
    },
};

console.log(a == 1 && a == 2 && a == 3);  // true
```

### 尾递归

`递归`：一个函数在内部调用自身本身，这个函数就是递归函数

> 其核心思想是把一个大型复杂的问题层层转化为一个与原问题相似的规模较小的问题来求解
>
> 一般来说，递归需要有**边界条件**、**递归前进阶段**和**递归返回阶段**。当边界条件不满足时，递归前进；当边界条件满足时，递归返回

:::: code-group
::: code-group-item 迭代

```js
function pow(x, n) {
    let result = 1;

    // 在循环中，用 x 乘以 result n 次
    for (let i = 0; i < n; i++) {
        result *= x;
    }

    return result;
}
```

:::
::: code-group-item 递归

```js
function pow(x, n) {
    if (n == 1) {
        return x;
    } else {
        return x * pow(x, n - 1);
    }
}
```

:::
::::

✅ **尾递归**，即在函数尾位置调用自身（或是一个尾调用本身的其他函数等等）。

::: tip 尾递归在普通尾调用的基础上，多出了2个特征：

- 在尾部调用的是函数自身
- 可通过优化，使得计算仅占用常量栈空间

尾递归也是递归的一种特殊情形。尾递归是一种特殊的尾调用，即在尾部直接调用自身的递归函数

:::

在递归调用的过程当中系统为每一层的返回点、局部量等开辟了栈来存储，递归次数过多容易造成栈溢出。

🚀 这时候，我们就可以使用尾递归。即一个函数中所有递归形式的调用都出现在函数的末尾，对于尾递归来说，由于**只存在一个调用记录**，所以永远不会发生"栈溢出"错误。

:::: code-group
::: code-group-item 尾递归

```js
function factorial(n, total) {
    if (n === 1) return total;
    return factorial(n - 1, n * total);
}

factorial(5, 1) // 120
```

:::
::: code-group-item 数组求和

```js
function sumArray(arr, total) {
    if(arr.length === 1) {
        return total
    }
    return sum(arr, total + arr.pop())
}
```

:::
::: code-group-item 斐波那契数列

```js
function factorial2 (n, start = 1, total = 1) {
    if(n <= 2){
        return total
    }
    return factorial2 (n -1, total, total + start)
}
```

:::
::: code-group-item 数组扁平化

```js
let a = [1,2,3, [1,2,3, [1,2,3]]]
// 变成
let a = [1,2,3,1,2,3,1,2,3]
// 具体实现
function flat(arr = [], result = []) {
    arr.forEach(v => {
        if(Array.isArray(v)) {
            result = result.concat(flat(v, []))
        }else {
            result.push(v)
        }
    })
    return result
}
```

:::
::: code-group-item 数组对象格式化

```js
let obj = {
    a: '1',
    b: {
        c: '2',
        D: {
            E: '3'
        }
    }
}
// 转化为如下：
let obj = {
    a: '1',
    b: {
        c: '2',
        d: {
            e: '3'
        }
    }
}

// 代码实现
function keysLower(obj) {
    let reg = new RegExp("([A-Z]+)", "g");
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            let temp = obj[key];
            if (reg.test(key.toString())) {
                // 将修改后的属性名重新赋值给temp，并在对象obj内添加一个转换后的属性
                temp = obj[key.replace(reg, function (result) {
                    return result.toLowerCase()
                })] = obj[key];
                // 将之前大写的键属性删除
                delete obj[key];
            }
            // 如果属性是对象或者数组，重新执行函数
            if (typeof temp === 'object' || Object.prototype.toString.call(temp) === '[object Array]') {
                keysLower(temp);
            }
        }
    }
    return obj;
};
```

:::
::::

### 如何理解 JS 的异步

🌐 [任务管理(opens new window)](https://www.ijerrychen.com/javascript/task.html)

⚡️ JS 是一门**单线程语言**，这是因为它运行在浏览器的 `渲染主线程` 中，而渲染主线程只有一个。而渲染主线程承担着诸多的工作，渲染页面、执行 JS 都在其中运行。

如果使用同步的方式，就极有可能导致主线程严重阻塞，从而导致任务队列中的其他任务无法得到执行。这样一来，一方面会导致主线程白白的消耗时间，另一方面导致页面无法及时更新（执行渲染），给用户造成卡死的现象。

✅ 所以浏览器采用异步的方式来避免。具体做法是当某些任务发生时，比如计时器、网络、事件监听，主线程将任务交给其他线程处理，自身立即结束任务的执行，转而执行后续代码。当其他线程完成时，将事先传递的**回调函数包装成任务**，加入到任务队列末尾排队，等待主线程调度执行。

在这种异步模式下，浏览器避免了阻塞，从而最大限度的保证了单线程的流畅运行。

### 阐述 Js 的事件循环

事件循环又叫做消息循环，是浏览器渲染主线程的工作方式。

在 Chrome 源码中，它开启一个不会结束的 for 循环，每次循环从消息队列中取出第一个任务执行，而其他线程只需要在合适的时候将任务加入到任务队列末尾即可。

⚡️ 过去简单把消息队列简单分为宏队列和微队列，这种说法已经无法满足目前复杂的的浏览器环境，取而代之的是一种更加灵活多变的处理方式。

✅ 根据 W3C 官方的解释，每个任务有不同的类型，同类型的任务必须在同一个队列，不同的任务可以属于不同的队列。不同任务队列有不同的优先级。在一次事件循环中，由浏览器自行决定取哪一个队列的任务。但浏览器必须有一页微队列，**微队列的任务具有最高的优先级**，必须优先调度执行。

```html
<button id="begin">开始</button>
<button id="interaction">添加交互任务</button>
<script>
    function delay(duration) {
        var start = Date.now();
        while (Date.now() - start < duration) {}
    }

    begin.onclick = function () {
        console.log("添加延时队列");
        setTimeout(() => {
            console.log("延时队列执行");
        }, 100);
        delay(2000);  // 保证回调函数已经添加到延迟队列

        console.log("添加交互队列");
        interaction.onclick = function () {
            console.log("交互队列执行");
        };
        delay(2000);

        console.log("============");
    };
    // 添加延时队列 添加交互队列 ============ 交互队列执行 延时队列执行
</script>
```

> 一般任务延时队列的优先级比交互队列低，用户交互应该立即响应，延迟可以推迟。

### Js 中计时器精确吗？为什么？

::: tip 不行，因为：

1. 计算机硬件没有原子钟，无法做到精确计时
2. 操作系统本身的计时函数就有少量偏差，由于 Js 的计时器最终调用的是操作系统的函数，也就携带了这些偏差
3. 按照 W3C 的标准，浏览器实现计时器时，如果嵌套层级超过 5 层，则会带有 4 毫秒的最少时间，这样在计时时间少于 4 毫秒时又带来了偏差
4. 收事件循环的影响，计时器的回调函数只能在主线程空闲时执行，因此又带来了偏差

:::

### class 转  function

::: tip class

- ES6 类语法的代码是在严格模式下的
- 类函数**只能**通过 `new` 调用
- 类方法**不能**通过 `new` 调用
- 原型上的方法不能被枚举

:::

:::: code-group
::: code-group-item Person 类

```js
class Person {
  constructor(name) {
    this.name = name;
  }

  alert() {
    console.log(this.name);
  }
}

const jc = new Person("Jerry");

// name
for (key in jc) {
  console.log(key);
}

// TypeError: Class constructor Person cannot be invoked without 'new'
// Person();  

// TypeError: jc.alert is not a constructor
// new jc.alert();
```

:::
::: code-group-item Person 函数

```js
"use strict";

function Person(name) {
  if (!(this instanceof Person)) {
    throw new TypeError(
      `Class constructor Person cannot be invoked without 'new'`
    );
  }
  this.name = name;
}

Object.defineProperty(Person.prototype, "alert", {
  value: function () {
    if (!(this instanceof Person)) {
      throw new TypeError(`alert is not a constructor`);
    }
    console.log(this.name);
  },
  enumerable: false,
});
```

:::
::::

## Vue

### 双向绑定的原理

🌐 [响应式数据基本实现(opens new window)](https://www.ijerrychen.com/VueJs3/section2/chapter4.html#%E5%93%8D%E5%BA%94%E5%BC%8F%E6%95%B0%E6%8D%AE%E7%9A%84%E5%9F%BA%E6%9C%AC%E5%AE%9E%E7%8E%B0)

Vue.js 数据双向绑定原理是通过**数据劫持**结合**发布订阅模式**的方式来实现的，首先是对数据进行监听，然后当监听的属性（响应式数据）发生变化时则告诉订阅者（副作用函数：render、computed）是否要更新，若更新就会执行对应的更新函数从而更新视图。

:::: code-group
::: code-group-item Object.defineProperty

```html
<script>
    function reactive(data) {
        const _data = {};
        Object.keys(data).forEach((key) => {
            _data[key] = data[key];
            Object.defineProperty(data, key, {
                get: function () {
                    console.log(`read ${key}`);
                    return _data[key];
                },
                set: function (newVal) {
                    console.log(`write ${key}: ${newVal}`);
                    _data[key] = newVal;
                },
            });
        });
        return data;
    }

    const reactiveData = reactive({ text: "hello", num: 123 });
    console.log([reactiveData.text, reactiveData.num]);
    reactiveData.text = "world";
    reactiveData.num = 456;
    console.log([reactiveData.text, reactiveData.num]);
</script>
```

控制台打印结果：

```shell
read text
read num
['hello', 123]
write text: world
write num: 456
read text
read num
['world', 456]
```

:::
::: code-group-item 双向绑定

```html
<div id="app">
    <p>
        <label>请输入内容：</label>
        <input type="text" id="input" />
    </p>
    <p>
        <label>显示的内容：</label>
        <span id="content"></span>
    </p>
</div>
<script>
    const data = { text: "" };

    Object.defineProperty(data, "text", {
        get: function () {
            return data;
        },
        set: function (newVal) {
            document.getElementById("input").value = newVal;
            document.getElementById("content").innerText = newVal;
        },
    });

    document.addEventListener("keyup", function (e) {
        data.text = e.target.value;
    });

    data.text = "hello";
</script>
```

:::
::: code-group-item Proxy

```html
<script>
    const data = { text: "hello" };

    function reactive(obj) {
        return new Proxy(obj, {
            get: function (target, key) {
                console.log(`read ${key}`);
                return target[key];
            },
            set: function (target, key, val) {
                console.log(`write ${key}: ${val}`);
                target[key] = val;
                return val;
            },
        });
    }

    const reactiveData = reactive(data);
    console.log(reactiveData.text);
    reactiveData.text = "world";
    console.log(reactiveData.text);
    console.log(data)
</script>
```

控制台打印结果：

```shell
read text
hello
write text: world
read text
world
{text: 'world'}
```

:::

::: code-group-item 双向绑定

```html
<div id="app">
    <p>
        <label>请输入内容：</label>
        <input type="text" id="input" />
    </p>
    <p>
        <label>显示的内容：</label>
        <span id="content"></span>
    </p>
</div>
<script>
    const data = { text: "" };

    function reactive(obj) {
        return new Proxy(obj, {
            get: function (target, key) {
                return target[key];
            },
            set: function (target, key, val) {
                document.getElementById("input").value = val;
                document.getElementById("content").innerText = val;
                target[key] = val;
                return val;
            },
        });
    }

    const reactiveData = reactive(data);
    reactiveData.text = "hello";

    document.addEventListener("keyup", function (e) {
        reactiveData.text = e.target.value;
    });
</script>
```

:::
::::

## CSS

### 垂直水平居中，高度为宽度一半

::: tip 概述

- padding-top/bottom 和 margin-top/bottom 都是相对于**父元素的宽度**来计算的；
- `width:100%`：不管是 content-box 还是 border-box 其 width 都是相对于父元素的 content 部分的 100%；
- 子元素的 position 是 absolute 绝对定位，则 `width:100%`是相对于一个 padding-box 的概念（此时并不是父元素 content 的 100%，而是 content+padding 部分的 100%）。

:::

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/test/1.png)

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
            * {
                margin: 0;
                padding: 0;
            }

            html,
            body {
                width: 100%;
                height: 100%;
            }

            body {
                background: #95a5a6;
            }

            .outer {
                width: 50vw;
                height: 100%;
                margin: 0 auto;
                background: #34495e;
                display: flex;
                align-items: center;
            }

            .inner {
                /* 高度以 padding-bottom 撑开，对照父元素宽度 */
                position: relative;
                width: 100%;
                height: 0;
                padding-bottom: 50%;
                background: #27ae60;
            }

            .box {
                /* 高度以 height: 100%，对照父元素 content + padding */
                position: absolute;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        </style>
    </head>
    <body>
        <div class="outer">
            <div class="inner">
                <div class="box">HELLO WORLD</div>
            </div>
        </div>
    </body>
</html>
```

### 大小为父元素宽度一半的正方形

> padding-top/bottom 和 margin-top/bottom 都是相对于**父元素的宽度**来计算的；



![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/test/2.png)

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
            * {
                margin: 0;
                padding: 0;
            }
            html,body {
                width: 100%;
                height: 100%;
            }
            .outer {
                width: 50vw;
                height: 100%;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: darkcyan;
            }

            .inner {
                /* 高度以 padding-bottom 撑开，参照父元素 content 宽度 */
                width: 50%;
                padding-bottom: 50%;
                background-color: aqua;
            }
        </style>
    </head>
    <body>
        <div class="outer">
            <div class="inner"></div>
        </div>
    </body>
</html>
```

### 自适应正方形、等宽高比矩形

:::: code-group
::: code-group-item padding 撑高

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
            * {
                padding: 0;
                margin: 0;
            }
            .outer {
                background-color: aqua;
                position: relative;
                margin: 0 auto;
                height: 0;
                width: 30%;
                padding-top: 30%;
            }
            .inner {
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                background-color: cadetblue;
            }
        </style>
    </head>
    <body>
        <div class="outer">
            <div class="inner"></div>
        </div>
    </body>
</html>
```

:::
::: code-group-item 伪元素

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
            * {
                margin: 0;
                padding: 0;
            }
             /* 利用子元素将父元素撑起来，利用margin-top，但是要注意margin塌陷的问题  */
            .box {
                width: 100px;
                margin: 0 auto;
                overflow: hidden;
                background-color: aqua;
            }
			/* 块级元素 block 才可以有垂直方向上的 margin */
            .box::after {
                content: "";
                margin-top: 100%;
                display: block;
            }
        </style>
    </head>
    <body>
        <div class="box"></div>
    </body>
</html>
```

- 块级元素 block 才可以有垂直方向上的 margin
- 子元素将父元素撑起来，利用margin-top，但是要注意margin塌陷的问题
- margin-top 的百分比参考父元素的 width

:::
::: code-group-item 相对视口 vw/vh

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
            * {
                padding: 0;
                margin: 0;
            }
            .outer {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .inner {
                width: 5vw;
                height: 5vw;
                background-color: cadetblue;
            }
        </style>
    </head>
    <body>
        <div class="outer">
            <div class="inner"></div>
        </div>
    </body>
</html>
```

:::
::::

## 浏览器

### 浏览器是如何渲染页面的？

![img](https://raw.githubusercontent.com/caffreygo/static/main/blog/browser/render.png)

当浏览器的网络线程收到 HTML 文档后，会产生一个渲染任务，并将其传递给**渲染主线程**的消息队列。

在事件循环机制的作用下，渲染主线程取出消息队列中的渲染任务，开启渲染流程。

-------

整个渲染流程分为多个阶段，分别是： HTML 解析、样式计算、布局、分层、绘制、分块、光栅化、画

每个阶段都有明确的输入输出，上一个阶段的输出会成为下一个阶段的输入。

这样，整个渲染流程就形成了一套组织严密的生产流水线。

-------

渲染的第一步是**解析 HTML**。

解析过程中遇到 CSS 解析 CSS，遇到 JS 执行 JS。为了提高解析效率，浏览器在开始解析前，会启动一个**预解析的线程，率先下载 HTML 中的外部 CSS 文件和 外部的 JS 文件**。

如果主线程解析到`link`位置，此时外部的 CSS 文件还没有下载解析好，主线程不会等待，继续解析后续的 HTML。这是因为下载和解析 CSS 的工作是在预解析线程中进行的。这就是 CSS 不会阻塞 HTML 解析的根本原因。

✅ 如果主线程解析到`script`位置，会停止解析 HTML，转而等待 JS 文件下载好，并将全局代码解析执行完成后，才能继续解析 HTML。这是因为 JS 代码的执行过程可能会修改当前的 DOM 树，所以 DOM 树的生成必须暂停。这就是 JS 会阻塞 HTML 解析的根本原因。

第一步完成后，会得到 DOM 树和 CSSOM 树，浏览器的默认样式、内部样式、外部样式、行内样式均会包含在 CSSOM 树中。

-------

渲染的下一步是**样式计算**。

主线程会遍历得到的 DOM 树，依次为树中的每个节点计算出它最终的样式，称之为 Computed Style。

在这一过程中，很多预设值会变成绝对值，比如`red`会变成`rgb(255,0,0)`；相对单位会变成绝对单位，比如`em`会变成`px`

这一步完成后，会得到一棵带有样式的 DOM 树。

--------

接下来是**布局**，布局完成后会得到布局树。

布局阶段会依次遍历 DOM 树的每一个节点，计算每个节点的几何信息。例如节点的宽高、相对包含块的位置。

大部分时候，DOM 树和布局树并非一一对应。

比如 `display:none` 的节点没有几何信息，因此不会生成到布局树；又比如使用了伪元素选择器，虽然 DOM 树中不存在这些伪元素节点，但它们拥有几何信息，所以会生成到布局树中。还有匿名行盒、匿名块盒等等都会导致 DOM 树和布局树无法一一对应。

-----------

下一步是**分层**

主线程会使用一套复杂的策略对整个布局树中进行分层。

分层的好处在于，将来某一个层改变后，仅会对该层进行后续处理，从而提升效率。

滚动条、堆叠上下文、transform、opacity 等样式都会或多或少的影响分层结果，也可以通过 `will-change` 属性更大程度的影响分层结果。

---------

再下一步是**绘制**

主线程会为每个层单独产生绘制指令集，用于描述这一层的内容该如何画出来。

------

完成绘制后，主线程将每个图层的绘制信息提交给合成线程，剩余工作将由合成线程完成。

合成线程首先对每个图层进行分块，将其划分为更多的小区域。

它会从线程池中拿取多个线程来完成分块工作。

----

分块完成后，进入**光栅化**阶段。

合成线程会将块信息交给 GPU 进程，以极高的速度完成光栅化。

GPU 进程会开启多个线程来完成光栅化，并且优先处理靠近视口区域的块。

光栅化的结果，就是一块一块的位图

---------

最后一个阶段就是**画**了

合成线程拿到每个层、每个块的位图后，生成一个个「指引（quad）」信息。

指引会标识出每个位图应该画到屏幕的哪个位置，以及会考虑到旋转、缩放等变形。

变形发生在合成线程，与渲染主线程无关，这就是`transform`效率高的本质原因。

合成线程会把 quad 提交给 GPU 进程，由 GPU 进程产生系统调用，提交给 GPU 硬件，完成最终的屏幕成像。

> 合成线程计算出每个位图在屏幕上的位置，交给 GPU 进⾏最终呈现

### 什么是 reflow？

![img](https://raw.githubusercontent.com/caffreygo/static/main/blog/browser/reflow.png)

reflow 的本质就是重新计算 layout 树。

当进行了会影响布局树的操作后，需要重新计算布局树，会引发 layout。

为了避免连续的多次操作导致布局树反复计算，浏览器会合并这些操作，当 JS 代码全部完成后再进行统一计算。所以，改动属性造成的 reflow 是异步完成的。

📝也同样因为如此，当 JS 获取布局属性时，就可能造成无法获取到最新的布局信息。

✅浏览器在反复权衡下，最终决定获取属性立即 reflow。

### 什么是 repaint？

![img](https://raw.githubusercontent.com/caffreygo/static/main/blog/browser/repaint.png)

repaint 的本质就是重新根据分层信息计算了绘制指令。

当改动了可见样式后，就需要重新计算，会引发 repaint。

由于元素的布局信息也属于可见样式，所以 reflow 一定会引起 repaint。

### 为什么 transform 的效率高？

![img](https://raw.githubusercontent.com/caffreygo/static/main/blog/browser/transform.png)

因为 transform 既不会影响布局也不会影响绘制指令，它影响的只是渲染流程的最后一个「draw」阶段

由于 draw 阶段在**合成线程**中，所以 transform 的变化几乎不会影响渲染主线程。反之，渲染主线程无论如何忙碌，也不会影响 transform 的变化。
