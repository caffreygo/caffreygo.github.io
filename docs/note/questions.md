# 题目解析

## JavaScript

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
