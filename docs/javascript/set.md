# Set

::: tip 用于存储任何类型的唯一值，无论是基本类型还是对象引用。

- 只能保存值没有键名
- 严格类型检测如字符串数字不等于数值型数字
- 值是唯一的
- 遍历顺序是添加的顺序，方便保存回调函数

::: 

## 基本使用

📗 对象的属性最终都会转为字符串

```js
let obj = { 1: "hello", "1": "world" };
console.table(obj); //{1:"world"}
```

使用对象做为键名时，会将对象转为字符串后使用

```js
let obj = { 1: "hello", "1": "world" 
let abc = { [obj]: "Jerry" };

console.log(abc[obj.toString()]);   // Jerry
console.log(abc["[object Object]"]);  // Jerry
```

📗 使用数组做初始数据

```js
let abc = new Set(['Jerry', 'hello']);
console.log(abc.values()); //{"Jerry", "hello"}
```

Set 中是**严格类型约束**的，下面的数值`1`与字符串`1`属于两个不同的值

```js
let set = new Set();
set.add(1);
set.add("1");
console.log(set); //Set(2) {1, "1"}
```

使用 `add` 添加元素，**不允许重复添加**`hello`值

```js
let abc = new Set();

abc.add('world');
abc.add('hello');
abc.add('hello')

console.log(abc.values());  //SetIterator {"world", "hello"}
```

## 获取数量

`size`获取元素数量

```js
let abc = new Set(['Jerry', 'hello']);
console.log(abc.size); //2
```

## 元素检测

检测元素是否存在

```js
let abc = new Set();
abc.add('hello');
console.log(abc.has('hello')); //true
```

## 删除元素

使用 `delete` 方法删除单个元素，返回值为`boolean`类型

```js
let abc = new Set();
abc.add("hello");
abc.add("world");

console.log(abc.delete("hello")); // true

console.log(abc.values());  //SetIterator {"world"}
console.log(abc.has("hello")); // false
```

使用 `clear` 删除所有元素

```js
let abc = new Set();
abc.add('hello');
abc.add('world');
abc.clear();
console.log(abc.values());
```

## 数组转换

可以使用`点语法` 或 `Array.form` 静态方法将Set类型转为数组，这样就可以使用数组处理函数了

```js
const set = new Set(["hello", "world"]);
console.log([...set]); //["hello", "world"]
console.log(Array.from(set)); //["hello", "world"]
```

移除Set中大于5的数值

```js
let abc = new Set("123456789");
abc = new Set([...abc].filter(item => item < 5));
console.log(abc);  // Set(4) {"1", "2", "3", "4"}
```

## 去除重复

去除字符串重复

```js
console.log([...new Set("abbcddd")].join(""));  //"abcd"
```

去除数组重复

```js
const arr = [1, 2, 3, 5, 2, 3];
console.log(...new Set(arr)); // 1,2,4,5
```

## 遍历数据

使用 `keys()/values()/entries()` 都可以返回迭代对象，因为`set`类型只有值所以 `keys与values` 方法结果一致。

```js
const abc = new Set(["hello", "world"]);

console.log(abc.values()); //SetIterator {"hello", "world"}
console.log(abc.keys()); //SetIterator {"hello", "world"}
console.log(abc.entries()); //SetIterator {"hello" => "hello", "world" => "world"}
```

可以使用 `forEach` 遍历Set数据，默认使用 `values` 方法创建迭代器。

为了保持和遍历数组参数统一，函数中的value与key是一样的。

```js
let arr = [7, 6, 2, 8, 2, 6];
let set = new Set(arr);
//使用forEach遍历
set.forEach((item,key) => console.log(item,key));
```

也可以使用 `forof` 遍历Set数据，默认使用 `values` 方法创建迭代器

```js
//使用for/of遍历
let set = new Set([7, 6, 2, 8, 2, 6]);

for (const iterator of set) {
	console.log(iterator);  // 7 6 2 8
}
```

## 搜索实例

下面通过历史搜索的示例体验`Set` 类型

```js
let obj = {
    words: new Set(),
    set keyword(word) {
        // keyword添加的时候作为Set类型数据已经被去重了
        this.words.add(word);
    },
    show() {
        let ul = document.querySelector('ul');
        ul.innerHTML = '';
        this.words.forEach((item) => {
            ul.innerHTML += ('<li>' + item + '</li>');
        })
    }
}

document.querySelector('input').addEventListener('blur', function () {
    obj.keyword = this.value;
    obj.show();
});
```

## 交集

获取两个集合中共同存在的元素

```js
let abc = new Set(['hello', 'world']);
let cms = new Set(['Jerry', 'hello']);
let newSet = new Set(
	[...abc].filter(item => cms.has(item))
);
console.log(newSet); //{"hello"}
```

## 差集

在集合a中出现但不在集合b中出现元素集合

```js
let abc = new Set(['hello', 'world']);
let cms = new Set(['Jerry', 'hello']);
let newSet = new Set(
	[...abc].filter(item => !cms.has(item))
);
console.log(newSet); //{"world"}
```

## 并集

将两个集合合并成一个新的集合，由于Set特性当然也不会产生重复元素。

```js
let abc = new Set(['hello', 'world']);
let cms = new Set(['Jerry', 'hello']);
let newSet = [...abc, ...cms];
console.log(newSet);
```

## WeakSet

::: tip WeakSet结构同样不会存储重复的值，它的成员必须只能是对象类型的值。

- 垃圾回收不考虑WeakSet，即被WeakSet引用时引用计数器不加一，所以对象不被引用时不管WeakSet是否在使用都将删除
- 因为WeakSet 是**弱引用**，由于其他地方操作成员可能会不存在，所以不可以进行`forEach( )`遍历等操作
- 也是因为弱引用，WeakSet 结构没有keys( )，values( )，entries( )等方法和size属性
- 因为是弱引用所以当外部引用删除时，希望自动删除数据时使用 `WeakMap`

::: 

### 声明定义

以下操作由于数据不是对象类型将产生错误

```js
new WeakSet(["hello", "world"]); //Invalid value used in weak set

new WeakSet("hello"); //Invalid value used in weak set
```

WeakSet的值必须为**对象类型**

```js
new WeakSet([["hello"], ["world"]]);
```

将DOM节点保存到`WeakSet`

```js
document.querySelectorAll("button").forEach(item => Wset.add(item));
```

### 基本操作

下面是WeakSet的常用指令

```js
const abc = new WeakSet();
const arr = ["hello"];
//添加操作
abc.add(arr);
console.log(abc.has(arr));

//删除操作
abc.delete(arr);

//检索判断
console.log(abc.has(arr));
```

### 垃圾回收

WeaSet保存的对象不会增加引用计数器，如果一个对象不被引用了会自动删除。

- 下例中的数组被 `arr` 引用了，引用计数器+1
- 数据又添加到了 abc 的WeaSet中，引用计数还是1
- 当 `arr` 设置为null时，引用计数-1 此时对象引用为0
- 当垃圾回收时对象被删除，这时WakeSet也就没有记录了

```js
const abc = new WeakSet();
let arr = ["hello"];
abc.add(arr);
console.log(abc.has(arr));

arr = null;
console.log(abc); //WeakSet {Array(1)}

setTimeout(() => {
  console.log(abc); //WeakSet {}
}, 1000);
```

### 案例操作

![](http://ra15bg9hk.hn-bkt.clouddn.com/javascript/set/set.gif)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <style>
    * {
      padding: 0;
      margin: 0;
    }
    body {
      padding: 200px;
    }
    ul {
      list-style: none;
      display: flex;
      width: 200px;
      flex-direction: column;
    }
    li {
      height: 30px;
      border: solid 2px #e67e22;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-left: 10px;
      color: #333;
      transition: 1s;
    }
    a {
      border-radius: 3px;
      width: 20px;
      height: 20px;
      text-decoration: none;
      text-align: center;
      background: #16a085;
      color: white;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 5px;
    }
    .remove {
      border: solid 2px #eee;
      opacity: 0.8;
      color: #eee;
    }
    .remove a {
      background: #eee;
    }
  </style>

  <body>
    <ul>
      <li>world.com <a href="javascript:;">x</a></li>
      <li>hello.com <a href="javascript:;">x</a></li>
      <li>jerry.com <a href="javascript:;">x</a></li>
    </ul>
  </body>

  <script>
    class Todos {
      constructor() {}
      run() {
        this.items = document.querySelectorAll("ul>li");
        this.lists = new WeakSet();
        this.record();
        this.addEvent();
      }
      addEvent() {
        this.items.forEach((item) => {
          item.querySelector("a").addEventListener("click", (event) => {
            //检测WakeSet中是否存在Li元素
            const parentElement = event.target.parentElement;
            if (!this.lists.has(parentElement)) {
              parentElement.classList.remove("remove");
              this.lists.add(parentElement);
            } else {
              //删除后从记录的WakeSet中移除
              parentElement.classList.add("remove");
              this.lists.delete(parentElement);
            }
          });
        });
      }
      record() {
        this.items.forEach((item) => this.lists.add(item));
      }
    }
    new Todos().run();
  </script>
</html>
```
