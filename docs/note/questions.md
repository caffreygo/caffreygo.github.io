# 题目解析

## JavaScript

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

:::: code-group
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
