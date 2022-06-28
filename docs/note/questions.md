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

console.log(a == 1 && a == 2 && a == 3);
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
::: code-group-item 目标代码

```

```

:::
::::
