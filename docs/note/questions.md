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
