# Map

::: tip Map是一组键值对的结构，用于解决以往不能用对象做为键的问题

- 具有极快的查找速度
- 函数、对象、基本类型都可以作为键或值

:::

## 基本概念

### 声明定义

📗 可以接受一个数组作为参数，该数组的成员是一个表示键值对的数组。

```js
let m = new Map([
  ['world', 'Jerry'],
  ['abccms', '开源系统']
]);

console.log(m.get('world')); // Jerry
```

💡 使用`set` 方法添加元素，支持**链式操作**

```js
let map = new Map();
let obj = {
  name: "Jerry"
};

map.set(obj, "world.com").set("name", "abccms");

console.log(map.entries()); //MapIterator {{…} => "world.com", "name" => "abccms"}
```

📗 使用构造函数`new Map`创建的原理如下

```js
const abc = new Map();
const arr = [["world", "Jerry"], ["abccms", "开源系统"]];

arr.forEach(([key, value]) => {
  abc.set(key, value);
});
console.log(abc);
```

📌 对于键是对象的`Map`， 键保存的是**内存地址**，值相同但内存地址不同的视为两个键。

```js
let arr = ["Jerry"];
const abc = new Map();
abc.set(arr, "world.com");
console.log(abc.get(arr)); //world.com
console.log(abc.get(["Jerry"])); // undefined
```

### 获取数量

获取数据数量`size`

```js
console.log(map.size);
```

### 元素检测

检测元素是否存在`has`

```js
console.log(map.has(obj1));
```

### 读取元素

```js
let map = new Map();

let obj = {
	name: 'Jerry'
}

map.set(obj, 'world.com');
console.log(map.get(obj));
```

### 删除元素

使用 `delete()` 方法删除单个元素

```js
let map = new Map();
let obj = {
	name: 'Jerry'
}

map.set(obj, 'world.com');
console.log(map.get(obj));

map.delete(obj);
console.log(map.get(obj));
```

使用`clear`方法清除Map所有元素

```js
let map = new Map();
let obj1 = {
	name: 'abccms.com'
}

let obj2 = {
	name: 'world.com'
}

map.set(obj1, {
	title: '内容管理系统'
});

map.set(obj2, {
	title: 'Jerry'
});

console.log(map.size);  // 2
map.clear();
console.log(map.size);  // 0
```

### 遍历数据

📗 使用 `keys()/values()/entries()` 都可以返回可遍历的迭代对象。

```js
let abc = new Map([["world", "Jerry"], ["abccms", "开源系统"]]);
console.log(abc.keys()); //MapIterator {"world", "abccms"}
console.log(abc.values()); //MapIterator {"Jerry", "开源系统"}
console.log(abc.entries()); //MapIterator {"world" => "Jerry", "abccms" => "开源系统"}
```

可以使用`keys/values` 函数遍历键与值

```js
let abc = new Map([["world", "Jerry"], ["abccms", "开源系统"]]);

for (const key of abc.keys()) {
  console.log(key);
}
for (const value of abc.values()) {
  console.log(value);
}
```

使用`for/of`遍历操作，直播遍历Map 等同于使用`entries()` 函数

```js
let abc = new Map([["world", "Jerry"], ["abccms", "开源系统"]]);
for (const [key, value] of abc) {
  console.log(`${key}=>${value}`);
}
```

📌 使用`forEach`遍历操作

```js
let abc = new Map([["world", "Jerry"], ["abccms", "开源系统"]]);
abc.forEach((value, key) => {
  console.log(`${key}=>${value}`);   // world=>Jerry   abccms=>开源系统
});
```

### 数组转换

可以使用`展开语法` 或 `Array.form` 静态方法将Set类型转为数组，这样就可以使用数组处理函数了

```js
let abc = new Map([["world", "Jerry"], ["abccms", "开源系统"]]);

console.log(...abc); //(2) ["world", "Jerry"] (2) ["abccms", "开源系统"]
console.log(...abc.entries()); //(2) ["world", "Jerry"] (2) ["abccms", "开源系统"]
console.log(...abc.values()); //Jerry 开源系统
console.log(...abc.keys()); //world abccms
```

检索包含`Jerry`的值组成新Map

```js
let abc = new Map([["world", "Jerry"], ["abccms", "开源系统"]]);

let newArr = [...abc].filter(function(item) {
  return item[1].includes("Jerry");
});

abc = new Map(newArr);  // Map(1) {"world" => "Jerry"}
console.log(...abc.keys());  // world
```

### 节点集合

📗 map的key可以为**任意类型**，下面使用DOM节点做为键来记录数据。

*为DOM节点在不添加属性的情况下保存更多的信息*

```html
<body>
  <div desc="Jerry">world</div>
  <div desc="开源系统">abccms</div>
</body>

<script>
  const divMap = new Map();
  const divs = document.querySelectorAll("div");

  divs.forEach(div => {
    divMap.set(div, {
      content: div.getAttribute("desc")
    });
  });
  divMap.forEach((config, elem) => {
    elem.addEventListener("click", function() {
      alert(divMap.get(this).content);
    });
  });
</script>
```

### 实例操作

当不接受协议时无法提交表单，并根据自定义信息提示用户。

```html
<form action="" onsubmit="return post()">
    接受协议:
    <input type="checkbox" name="agreement" message="请接受接受协议" />
    我是学生:
    <input type="checkbox" name="student" message="网站只对学生开放" />
    <input type="submit" />
  </form>
</body>

<script>
  function post() {
    let map = new Map();

    let inputs = document.querySelectorAll("[message]");
    //使用set设置数据
    inputs.forEach(item =>
      map.set(item, {
        message: item.getAttribute("message"),
        status: item.checked
      })
    );

    //遍历Map数据
    return [...map].every(([item, config]) => {
      config.status || alert(config.message);
      return config.status;
    });
  }
</script>
```

## WeakMap

::: tip WeakMap对象是一组键/值对的集

- 键名必须是**对象**
- WeaMap对键名是弱引用的，键值是正常引用
- 垃圾回收不考虑WeaMap的键名，不会改变引用计数器，键在其他地方不被引用时即删除
- 因为WeakMap 是弱引用，由于其他地方操作成员可能会不存在，所以不可以进行`forEach( )`遍历等操作
- 也是因为弱引用，WeaMap 结构没有keys( )，values( )，entries( )等方法和 size 属性
- 当键的外部引用删除时，希望自动删除数据时使用 `WeakMap`

:::

### 声明定义

📌 以下操作由于键不是对象类型将产生错误

```js
new WeakSet("abccms"); //TypeError: Invalid value used in weak set
```

将DOM节点保存到`WeakSet`

```html
<body>
  <div>world</div>
  <div>abccms</div>
</body>
<script>
  const abc = new WeakMap();
  document
    .querySelectorAll("div")
    .forEach(item => abc.set(item, item.innerHTML));
  console.log(abc); //WeakMap {div => "abccms", div => "world"}
</script>
```

### 基本操作

下面是WeakSet的常用指令

```js
const abc = new WeakMap();
const arr = ["abccms"];
//添加操作
abc.set(arr, "world");
console.log(abc.has(arr)); //true

//删除操作
abc.delete(arr);

//检索判断
console.log(abc.has(arr)); //false
```

### 垃圾回收

WakeMap的键名对象不会增加引用计数器，如果一个对象不被引用了会自动删除。

- 下例当`abc`删除时内存即清除，因为WeakMap是弱引用不会产生引用计数
- 当垃圾回收时因为对象被删除，这时WakeMap也就没有记录了

```js
let map = new WeakMap();
let abc = {};
map.set(abc, "abccms");
abc = null;
console.log(map);

setTimeout(() => {
  console.log(map);
}, 1000);
```

### 选课案例

![](http://ra15bg9hk.hn-bkt.clouddn.com/javascript/map/map.gif)

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
      padding: 20px;
      width: 100vw;
      display: flex;
      box-sizing: border-box;
    }
    div {
      border: solid 2px #ddd;
      padding: 10px;
      flex: 1;
    }
    div:last-of-type {
      margin-left: -2px;
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
    p {
      margin-top: 20px;
    }
    p span {
      display: inline-block;
      background: #16a085;
      padding: 5px;
      color: white;
      margin-right: 10px;
      border-radius: 5px;
      margin-bottom: 10px;
    }
  </style>

  <body>
    <div>
      <ul>
        <li><span>js</span> <a href="javascript:;">+</a></li>
        <li><span>ts</span> <a href="javascript:;">+</a></li>
        <li><span>css</span><a href="javascript:;">+</a></li>
      </ul>
    </div>
    <div>
      <strong id="count">共选了2门课</strong>
      <p id="lists"></p>
    </div>
  </body>

  <script>
    class Lesson {
      constructor() {
        this.lis = document.querySelectorAll("ul>li");
        this.countELem = document.getElementById("count");
        this.listElem = document.getElementById("lists");
        this.map = new WeakMap();
      }
      run() {
        this.lis.forEach((item) => {
          item.querySelector("a").addEventListener("click", (event) => {
            const elem = event.target;
            const state = elem.getAttribute("select");
            if (state) {
              elem.removeAttribute("select");
              this.map.delete(elem.parentElement);
              elem.innerHTML = "+";
              elem.style.backgroundColor = "green";
            } else {
              elem.setAttribute("select", true);
              this.map.set(elem.parentElement, true);
              elem.innerHTML = "-";
              elem.style.backgroundColor = "red";
            }
            this.render();
          });
        });
      }
      count() {
        return [...this.lis].reduce((count, item) => {
          return (count += this.map.has(item) ? 1 : 0);
        }, 0);
      }
      lists() {
        return [...this.lis]
          .filter((item) => {
            return this.map.has(item);
          })
          .map((item) => {
            return `<span>${item.querySelector("span").innerHTML}</span>`;
          });
      }
      render() {
        this.countELem.innerHTML = `共选了${this.count()}课`;
        this.listElem.innerHTML = this.lists().join("");
      }
    }
    new Lesson().run();
  </script>
</html>
```