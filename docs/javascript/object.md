# 对象

## 基础知识

📗 对象是包括**属性**与**方法**的数据类型，JS中大部分类型都是对象如 `String/Number/Math/RegExp/Date` 等等。

**面向过程编程**

```js
let name = "Michael";
let grade = [
  { lesson: "js", score: 99 },
  { lesson: "mysql", score: 85 }
];
function average(grade, name) {
  const total = grade.reduce((t, a) => t + a.score, 0);
  return name + ":" + total / grade.length + "分";
}
console.log(average(grade, name));  // Michael:92分
```

**面向对象编程**

下面使用对象编程的代码结构清晰，也减少了函数的参数传递，也不用担心函数名的覆盖

```js
let user = {
  name: "Jerry",
  grade: [
    { lesson: "js", score: 99 },
    { lesson: "mysql", score: 85 }
  ],
  average() {
    const total = this.grade.reduce((t, a) => t + a.score, 0);  // 对象方法中this关键字指向当前对象
    return this.name + ":" + total / grade.length + "分";
  }
};
```

### OOP

::: tip Object-oriented programming

- 对象是属性和方法的集合即封装
- 将复杂功能隐藏在内部，只开放给外部少量方法，更改对象内部的复杂逻辑不会对外部调用造成影响即抽象
- 继承是通过代码复用减少冗余代码
- 根据不同形态的对象产生不同结果即多态

::: 

### 基本声明

使用字面量形式声明对象是最简单的方式

```js
let obj = {
  name: 'Jerry',
  get:function() {
  	return this.name;
  }
}
console.log(obj.get()); // Jerry
```

属性与方法简写

```js
let name = "Jerry";
let obj = {
  name,
  get() {
    return this.name;
  }
};
console.log(obj.get()); //Jerry
```

其实字面量形式在系统内部也是使用构造函数 `new Object`创建的，后面会详细介绍构造函数。

```js
let obj = {};
let ace = new Object();
console.log(obj, ace); // obj.__proto__.constructor == Object.prototype.constructor == Object
console.log(obj.constructor);  // ƒ Object() { [native code] }
console.log(ace.constructor);  // ƒ Object() { [native code] }
```

### 操作属性

使用点语法获取

```js
let user = {
  name: "Michael"
};
console.log(user.name);
```

使用`[]` 获取

```js
console.log(user["name"]);
```

可以看出使用`.`操作属性更简洁，`[]`主要用于通过变量定义属性的场景

```js
let user = {
  name: "Michael"
};
let property = "name";
console.log(user[property]);
```

如果属性名不是合法变量名就必须使用扩号的形式了

```js
let user = {};
user["my-age"] = 28;
console.log(user["my-age"]);  // 28
```

对象和方法的属性可以动态的添加或删除。

```js
const obj = {
  name: "Jerry"
};
obj.age = "25";
obj.show = function() {
  return `${this.name}已经${this.age}岁了`;
};
console.log(obj.show());  // Jerry已经25岁了
console.log(obj);  // {name: 'Jerry', age: '10', show: ƒ}

delete obj.show;  
delete obj.age;

console.log(obj);  // {name: 'Jerry'}
console.log(obj.age); //undefined
```

### 对象方法

📗 定义在对象中的函数我们称为方法。下面定义了学生对象，并提供了计算平均成绩的方法

```js
let lisi = {
  name: "李四",
  age: 22,
  grade: {
    math: 99,
    english: 67
  },
  //平均成绩
  avgGrade: function() {
    let total = 0;
    for (const key in this.grade) {
      total += this.grade[key];
    }
    return total / this.propertyCount("grade");
  },
  //获取属性数量
  propertyCount: function(property) {
    let count = 0;
    for (const key in this[property]) count++;
    return count;
  }
};
console.log(lisi.avgGrade());  // 83
```

> 一个学生需要手动创建一个对象，这显然不实际的，下面的构造函数就可以解决这个问题

### 引用特性

对象和函数、数组一样是引用类型，即复制只会复制引用地址。

```js
let obj = { name: "Jerry" };
let cms = obj;
cms.name = "obj name";
console.log(obj.name); // obj name
```

对象作为函数参数使用时也不会产生完全赋值，内外共用一个对象

```js
let user = { age: 22 };
function obj(user) {
  user.age += 10;
}
obj(user);
console.log(user.age); //32
```

对多的比较是对内存地址的比较所以使用 `==` 或 `===` 一样

```js
let a = {};
let b = a;
let c = {};
console.log(a == b); //true
console.log(b == c); //false
console.log(a == c); //false
```

### this

📗 `this` 指当前对象的引用，始终建议在代码内部使用`this` 而不要使用对象名，不同对象的this只指向当前对象。

下例是不使用 `this` 时发生的错误场景

- 删除了`model` 变量，但在函数体内还在使用`model`变量造成错误
- 使用 `this` 后始终指向到引用地址，就不会有这个问题

```js
let model = {
  name: "Michael",
  show() {
    return model.name;
  }
};
let obj = model;
model = null;
console.log(obj.show()); // Error
```

改用`this` 后一切正常

```js
let model = {
  name: "Michael",
  show() {
    return this.name;
  }
};
let obj = model;
model = null;
console.log(obj.show()); // Michael
```

### 展开语法

使用`...`可以展示对象的结构，下面是实现对象合并的示例

```js
let obj = { name: "Jerry", web: "google.com" };
let info = { ...obj, site: "www" };
console.log(info);  // {name: 'Jerry', web: 'google.com', site: 'www'}
```

下面是函数参数合并的示例 (后面的会覆盖前面的)

```js
function upload(params) {
  let config = {
    type: "*.jpeg,*.png",
    size: 10000
  };
  params = { ...config, ...params };
  console.log(params);  // {type: '*.jpeg,*.png', size: 999}
}
upload({ size: 999 });
```

## 对象转换

### 基础知识

📗 对象直接参与计算时，系统会根据计算的场景在 `string/number/default` 间转换。

- 如果声明需要字符串类型，调用顺序为 `toString > valueOf`
- 如果场景需要数值类型，调用顺序为 `valueOf > toString`
- 声明不确定时使用 `default` ，大部分对象的 `default` 会当数值使用

下面的数值对象会在数学运算时转换为 `number`

```js
let ace = new Number(1); 
console.log(ace + 3); // 4
```

如果参数字符串运长时会转换为 `string`

```js
let ace = new Number(1);
console.log(ace + "3"); //13
```

下面当不确定转换声明时使用 `default` ，大部分`default`转换使用 `number` 转换。

```js
let ace = new Number(1);
console.log(ace == "1"); //true
```

### Symbol.toPrimitive 💡

内部自定义`Symbol.toPrimitive`方法用来处理所有的转换场景

```js
let obj = {
  num: 1,
  [Symbol.toPrimitive]: function() {
    return this.num;
  }
};
console.log(obj + 3); //4
```

### valueOf/toString

可以自定义`valueOf` 与 `toString` 方法用来转换，转换并不限制返回类型。

```js
let obj = {
  name: "Jerry",
  num: 1,
  valueOf: function() {
    console.log("valueOf");
    return this.num;
  },
  toString: function() {
    console.log("toString");
    return this.name;
  }
};
console.log(obj + 3); // valueOf 4
console.log(`${obj} Michael`); // toString Jerry Michael
```

## 解构赋值

解构是一种更简洁的赋值特性，可以理解为分解一个数据的结构，在数组章节已经介绍过。

>  建议使用 `var/let/const` 声明，否则严格模式下会报错

### 基本使用

下面是基本使用语法

```js
//对象使用
let info = {name:'Jerry', url:'ace.com'};
let {name: n, url: u} = info
console.log(n); // Jerry

//如果属性名与变量相同可以省略属性定义
let {name,url} = {name:'Jerry',url:'ace.com'};
console.log(name); // Jerry
```

函数返回值直接解构到变量

```js
function obj() {
  return {
    name: 'Jerry',
    url: 'ace.com'
  };
}
let {name: n,url: u} = obj();
console.log(n);  // Jerry
```

函数传参

```js
"use strict";
function obj({ name, age }) {
  console.log(name, age); //Michael大叔 18
}
obj({ name: "Michael", age: 18 });
```

系统函数解构练习，这没有什么意义只是加深解构印象

```js
const {random} =Math;
console.log(random());
```

### 严格模式

📗 非严格模式可以不使用声明指令，严格模式下必须使用声明。所以建议使用 let 等声明。

```js
// "use strict";
({name,url} = {name:'Jerry',url:'ace.com'});
console.log(name, url); // Error
```

还是建议使用`let`等赋值声明

```js
"use strict";
let { name, url } = { name: "Jerry", url: "ace.com" };
console.log(name, url);  // Jerry ace.com
```

### 简洁定义

如果属性名与赋值的变量名相同可以更简洁

```js
let web = { name: "Jerry", url: "ace.com" };
let { name, url } = web;
console.log(name); //Jerry
```

只赋值部分变量

```js
let [,url]=['Jerry','ace.com'];
console.log(url);  // ace.com

let {name}= {name:'Jerry',url:'ace.com'};
console.log(name);  // Jerry
```

可以直接使用变量赋值对象属性

```js
let name = "Jerry",url = "ace.com";
//标准写法如下
let obj = { name: name, url: url };
console.log(obj);  //{name: "Jerry", url: "ace.com"}

//如果属性和值变量同名可以写成以下简写形式
let opt = { name, url };
console.log(opt); //{name: "Jerry", url: "ace.com"}
```

### 嵌套解构

可以操作多层复杂数据结构

```js
const obj = {
  name:'Jerry',
  lessons:{
    title:'JS'
  }
}
const {name,lessons:{title}}  = obj;
console.log(name,title); //Jerry JS
```

### 默认值 💡

为变量设置默认值

```js
let [name, site = 'objcms'] = ['Jerry'];
console.log(site); //objcms

let {name, url, user = 'Michael大叔'}= {name:'Jerry', url:'ace.com'};
console.log(name,user);  // Michael大叔
```

使用默认值特性可以方便的对参数预设

```js
function createElement(options) {
    let {
        width = '200px',
        height = '100px',
        backgroundColor = 'red'
    } = options;

    const h2 = document.createElement('h2');
    h2.style.width = width;
    h2.style.height = height;
    h2.style.backgroundColor = backgroundColor;
    document.body.appendChild(h2);
}
createElement({
    backgroundColor: 'green'
});
```

### 函数参数

数组参数的使用

```js
function obj([a, b]) {
    console.log(a, b);
}
obj(['Jerry', 'objcms']);
```

对象参数使用方法

```js
function obj({name,url,user='Michael大叔'}) {
    console.log(name,url,user);
}
obj({name:'Jerry','url':'ace.com'}); //Jerry ace.com Michael大叔
```

对象解构传参

```js
function user(name, { sex, age } = {}) {
    console.log(name, sex, age); //Michael大叔 男 18
}
user("Michael大叔", { sex: "男", age: 18 });
```

## 属性管理

### 添加属性

可以为对象添加属性

```js
let obj = {name: "Jerry"};
obj.site = "ace.com";
console.log(obj);
```

### 删除属性

使用`delete` 可以删除属性

```js
let obj = { name: "Jerry" };
delete obj.name;
console.log(obj.name); //undefined
```

### 检测属性

📗  `hasOwnProperty`检测对象自身是否包含指定的属性，不检测原型链上继承的属性。

```js
let obj = { name: 'Jerry'};
console.log(obj.hasOwnProperty('name')); // true
```

下面通过数组查看

```js
let arr = ["Jerry"];
console.log(arr);
console.log(arr.hasOwnProperty("length")); // true
console.log(arr.hasOwnProperty("concat")); // false
```

📌 使用 `in` 可以在原型对象上检测

```js
let a = {name: "Jerry"};
let b = {
    web: "ace.com"
};

//设置obj为obj的新原型
Object.setPrototypeOf(a, b);
console.log(a);  // { name: "Jerry" }

console.log("web" in a); // true 原型属性检测
console.log(a.hasOwnProperty("web")); // false 
```

### 获取属性名

使用 `Object.getOwnPropertyNames` 可以获取对象的属性名集合

```js
let obj = { name: 'Jerry', year: 2010 }
const names = Object.getOwnPropertyNames(obj)
console.log(names) // ["name", "year"]
```

### assign

以往我们使用类似`jQuery.extend` 等方法设置属性，现在可以使用 `Object.assign` 静态方法

从一个或多个对象复制属性

```js
"use strict";
let obj = { a: 1, b: 2 };
obj = Object.assign(obj, { f: 1 }, { m: 9 });
console.log(obj); //{a: 1, b: 2, f: 1, m: 9}
```

### 计算属性

对象属性可以通过表达式计算定义，这在动态设置属性或执行属性方法时很好用。

```js
let id = 0;
const user = {
  [`id-${id++}`]: id,
  [`id-${id++}`]: id,
  [`id-${id++}`]: id
};
```

使用计算属性为文章定义键名

```js
const lessons = [
  {
    title: "媒体查询响应式布局",
    category: "css"
  },
  {
    title: "FLEX 弹性盒模型",
    category: "css"
  },
  {
    title: "MYSQL多表查询随意操作",
    category: "mysql"
  }
];
let lessonObj = lessons.reduce((obj, cur, index) => {
  obj[`${cur["category"]}-${index}`] = cur;
  return obj;
}, {});
console.log(lessonObj); //{css-0: {…}, css-1: {…}, mysql-2: {…}}
console.log(lessonObj["css-0"]); //{title: "媒体查询响应式布局", category: "css"}
```

### 传值操作

对象是引用类型赋值是**传址**操作

```js
let user = {
	name: 'Jerry'
};
let obj = {
	stu: user
};
obj.stu.name = 'objcms';
console.log(user.name);//objcms
```

## 遍历对象

### 获取内容

使用系统提供的API可以方便获取对象属性与值

```js
const obj = {
  name: "Jerry",
  age: 10
};
console.log(Object.keys(obj)); //["name", "age"]
console.log(Object.values(obj)); //["Jerry", 10]
console.table(Object.entries(obj)); //[["name","Jerry"],["age",10]]
```

### for/in

使用`for/in`遍历对象属性

```js
const obj = {
    name: "Jerry",
    age: 10
};
for (let key in obj) {
    console.log(key, obj[key]);
}
```

### for/of 💡

📗 `for/of`用于遍历**迭代对象**，不能直接操作对象。但`Object`对象的`keys/`方法返回的是迭代对象。

```js
const obj = {
    name: "Jerry",
    age: 10
};
for (const key of Object.keys(obj)) {
    console.log(key);  // name age
}
```

获取所有对象属性

```js
const obj = {
    name: "Jerry",
    age: 10
};
for (const key of Object.values(obj)) {
    console.log(key); // Jerry 10
}
```

同时获取属性名与值

```js
for (const array of Object.entries(obj)) {
    console.log(array);
}
```

使用扩展语法同时获取属性名与值

```js
for (const [key, value] of Object.entries(obj)) {
    console.log(key, value);
}
```

添加元素DOM练习

```js
let lessons = [
    { name: "js", click: 23 },
    { name: "node", click: 192 }
];
let ul = document.createElement("ul");
for (const val of lessons) {   // for/of 遍历Object.values(obj)迭代对象
    let li = document.createElement("li");
    li.innerHTML = `课程:${val.name},点击数:${val.click}`;
    ul.appendChild(li);
}
document.body.appendChild(ul);
```

## 对象拷贝

📗 对象赋值时复制的**内存地址**，所以一个对象的改变直接影响另一个

```js
let obj = {
    name: 'Jerry',
    user: {
        name: 'objcms'
    }
}
let a = obj;
let b = obj;
a.name = 'lisi';
console.log(b.name); // lisi
```

### 浅拷贝

使用`for/in`执行对象拷贝

```js
let a = {name: "Jerry"};

let b = {};
for (const key in a) {
    b[key] = a[key];
}

b.name = "Michael";
console.log(a);  // {name: 'Jerry'}
console.log(b);  // {name: 'Michael'}
```

📗 `Object.assign` 函数可简单的实现浅拷贝，它是将两个对象的属性叠加后面对象属性会覆盖前面对象同名属性。

```js
let user = {
    name: 'Jerry'
};
let obj = {
    stu: Object.assign({}, user)
};
obj.stu.name = 'new';
console.log(user.name);  // Jerry
```

📌 使用展示语法也可以实现浅拷贝

```js
let b = {
    name: "Jerry"
};
let a = { ...b };
a.name = "new";
console.log(a);  // {name: 'new'}
console.log(b);  // {name: 'Jerry'}
```

### 深拷贝 💡

📌 浅拷贝不会将深层的数据复制

```js
let obj = {
    name: 'Jerry',
    user: {
        name: 'objcms'
    }
}
let a = obj;
let b = obj;

function copy(object) {
    let obj = {}
    for (const key in object) {
        obj[key] = object[key];
    }
    return obj;
}
```

💡💡是完全的复制一个对象，两个对象是完全独立的对象💡💡

```js
let obj = {
  name: "Jerry",
  user: {
    name: "objcms"
  },
  data: []
};

function copy(object) {
  let obj = object instanceof Array ? [] : {};
  for (const [k, v] of Object.entries(object)) {
    obj[k] = typeof v == "object" ? copy(v) : v;
  }
  return obj;
}

let obj = copy(obj);
obj.data.push("Michael");
console.log(JSON.stringify(obj, null, 2));
console.log(JSON.stringify(obj, null, 2));
```

## 构建函数

对象可以通过内置或自定义的构造函数创建。

### 工厂函数

::: tip 在函数中返回对象的函数称为工厂函数，工厂函数有以下优点

- 减少重复创建相同类型对象的代码
- 修改工厂函数的方法影响所有同类对象

::: 

使用字面量创建对象需要复制属性与方法结构

```js
const model = {
    name: "Michael",
    show() {
        console.log(this.name);
    }
};
const obj = {
    name: "Jerry",
    show() {
        console.log(this.name);
    }
};
```

使用工厂函数可以简化这个过程

```js
function stu(name) {
    return {
        name,
        show() {
            console.log(this.name);
        }
    };
}
const lisi = stu("李四");
lisi.show();
const model = stu("Michael");
model.show();
```

### 构造函数

::: tip 和工厂函数相似构造函数也用于创建对象，它的上下文为新的对象实例。

- 构造函数名每个单词首字母大写即`Pascal` 命名规范
- `this`指当前创建的对象
- 不需要返回`this`系统会自动完成
- 需要使用`new`关键词生成对象

::: 

```js
function Student(name) {
    this.name = name;
    this.show = function() {
        console.log(this.name);
    };
    //不需要返回，系统会自动返回
    // return this;
}
const lisi = new Student("李四");
lisi.show();
const model = new Student("Michael");
model.show();
```

📌 如果构造函数返回对象，实例化后的对象将是此对象

```js
function ArrayObject(...values) {
    const arr = new Array();
    arr.push.apply(arr, values);
    arr.string = function(sym = "|") {
        return this.join(sym);
    };
    return arr;
}
const array = new ArrayObject(1, 2, 3);
console.log(array);
console.log(array.string("-"));
```

### 严格模式

在严格模式下方法中的`this`值为undefined，这是为了防止无意的修改window对象

```js
"use strict";
function User() {
    this.show = function() {
        console.log(this);
    };
}
let obj = new User();
obj.show(); // User 对象方法调用

let model = obj.show;
model(); // undefined
```

### 内置构造

JS中大部分数据类型都是通过构造函数创建的。

```js
const num = new Number(99);
console.log(num.valueOf());  // valueOf()获取值

const string = new String("Jerry");
console.log(string.valueOf());

const boolean = new Boolean(true);
console.log(boolean.valueOf());

const date = new Date();
console.log(date.valueOf() * 1);

const regexp = new RegExp("\\d+");
console.log(regexp.test(99));

let obj = new Object();
obj.name = "Jerry";
console.log(obj); // { name: "Jerry" }
```

字面量创建的对象，内部也是调用了`Object`构造函数

```js
const obj = {
    name: "Jerry"
};
console.log(obj.constructor); //ƒ Object() { [native code] }

//下面是使用构造函数创建对象
const sys = new Object();
sys.title = "系统"; 
console.log(sys);  // { title: "系统" } 
```

### 对象函数

在`JS`中函数也是一个对象

```js
function obj(name) {}

console.log(obj.toString());  // function obj(name) {}
console.log(obj.length);  // 1
```

函数是由系统内置的 `Function` 构造函数创建的

```js
function obj(name) {}   // obj.constructor == Function
```

下面是使用内置构造函数创建的函数

```js
const User = new Function(`name`,`
  this.name = name;
  this.show = function() {
    return this.name;
  };
`
);

const lisi = new User("李四");  // Uncaught EvalError
console.log(lisi.show());
```

## 抽象特性

📗  将复杂功能隐藏在内部，只开放给外部少量方法，更改对象内部的复杂逻辑不会对外部调用造成影响即抽象。

### 问题分析

下例将对象属性封装到构造函数内部

```js
function User(name, age) {
  this.name = name;
  this.age = age;
  this.info = function() {
    return this.age > 50 ? "中年人" : "年轻人";
  };
  this.about = function() {
    return `${this.name}是${this.info()}`;
  };
}
let lisi = new User("李四", 22);
console.log(lisi.about());  // 李四是年轻人
```

### 抽象封装

上例中的方法和属性**仍然可以在外部访问**到，比如 `info`方法只是在内部使用，不需要被外部访问到这会破坏程序的内部逻辑。

💡 下面使用**闭包特性**将对象进行抽象处理 (函数内返回了方法函数，data所处的上下文依然保存)

```js
function User(name, age) {
    let data = { name, age };
    let info = function() {
        return data.age > 50 ? "中年人" : "年轻人";
    };
    this.message = function() {
        return `${data.name}是${info()}`;
    };
}
let lisi = new User("Jerry", 22);
console.log(lisi.message()); // Jerry是年轻人
```

## 属性特征

JS中可以对属性的访问特性进行控制。

### 查看特征

📗 使用 `Object.getOwnPropertyDescriptor`查看对象属性的描述。

```js
"use strict";
const user = {
  name: "Michael",
  age: 18
};
let desc = Object.getOwnPropertyDescriptor(user, "name");
console.log(JSON.stringify(desc, null, 2));
```

```tex
{
    "value": "Michael",
    "writable": true,
    "enumerable": true,
    "configurable": true
}
```

📗 使用 `Object.getOwnPropertyDescriptors`查看对象所有属性的描述

```js
"use strict";
const user = {
  name: "Michael",
  age: 18
};
let desc = Object.getOwnPropertyDescriptors(user);
console.log(JSON.stringify(desc, null, 2));
```

```tex
{
  "name": {
    "value": "Michael",
    "writable": true,
    "enumerable": true,
    "configurable": true
  },
  "age": {
    "value": 18,
    "writable": true,
    "enumerable": true,
    "configurable": true
  }
}
```

💡💡属性包括以下四种特性💡💡

| 特性         | 说明                                                   | 默认值    |
| ------------ | ------------------------------------------------------ | --------- |
| configurable | 能否使用delete、能否修改属性特性、或能否修改访问器属性 | true      |
| enumerable   | 对象属性是否可通过for-in循环，或Object.keys() 读取     | true      |
| writable     | 对象属性是否可修改                                     | true      |
| value        | 对象属性的默认值                                       | undefined |

### 设置特征 💡

📗 使用`Object.defineProperty` 方法修改属性特性，通过下面的设置属性name将不能被遍历、删除、修改。（非严格模式下不会报错，但是更改不会生效）

```js
"use strict";
const user = {
    name: "Michael"
};
Object.defineProperty(user, "name", {
    value: "Jerry",
    writable: false,
    enumerable: false,
    configurable: false
});
```

通过执行以下代码对上面配置进行测试，请分别打开注释进行测试

```js
// 不允许修改
// user.name = "Michael"; // Error

// 不能遍历
// console.log(Object.keys(user));

// 不允许删除
// delete user.name;
// console.log(user);

// 不允许再配置
// Object.defineProperty(user, "name", {
//   value: "Jerry",
//   writable: true,
//   enumerable: false,
//   configurable: false
// });
```

📗 使用 `Object.defineProperties` 可以一次设置多个属性，具体参数和上面介绍的一样。

```js
"use strict";
let user = {};
Object.defineProperties(user, {
  name: { value: "Michael", writable: false },
  age: { value: 18 }
});
console.log(user);  // {name: 'Michael', age: 18}
user.name = "Jerry"; // TypeError
```

### 禁止添加

`Object.preventExtensions` 禁止向对象添加属性 （禁止拓展）

```js
"use strict";
const user = {
  name: "Michael"
};
Object.preventExtensions(user);
user.age = 18; // Error
```

`Object.isExtensible` 判断是否能向对象中添加属性

```js
"use strict";
const user = {
  name: "Michael"
};
Object.preventExtensions(user);
console.log(Object.isExtensible(user)); // false
```

### 封闭对象

📗 `Object.seal()`方法封闭一个对象，阻止添加新属性并将**所有现有属性**标记为 `configurable: false`

```js
"use strict";
const user = {
  name: "Jerry",
  age: 18
};

Object.seal(user);
console.log(
  JSON.stringify(Object.getOwnPropertyDescriptors(user), null, 2)
);

Object.seal(user);
console.log(Object.isSealed(user));
delete user.name;  // Error
```

```tex
{
  "name": {
    "value": "Jerry",
    "writable": true,
    "enumerable": true,
    "configurable": false 💡
  },
  "age": {
    "value": 18,
    "writable": true,
    "enumerable": true,
    "configurable": false 💡
  }
}
```

`Object.isSealed` 如果对象是密封的则返回 `true`，属性**都具有** `configurable: false`。

```js
"use strict";
const user = {
  name: "Michael"
};
Object.seal(user);
console.log(Object.isSealed(user)); // true
```

### 冻结对象

📗 `Object.freeze` 冻结对象后不允许添加、删除、修改属性，writable、configurable都标记为`false`

```js
"use strict";
const user = {
  name: "Michael"
};
Object.freeze(user);
user.name = "Jerry"; // Error
```

`Object.isFrozen()`方法判断一个对象是否被冻结

```js
"use strict";
const user = {
  name: "Michael"
};
Object.freeze(user);
console.log(Object.isFrozen(user));  // true
```

## 属性访问器 💡

::: tip setter方法用于设置属性，这是JS提供的存取器特性即使用函数来管理属性。

- 用于避免错误的赋值
- 需要动态监测值的改变
- 属性只能在访问器和普通属性任选其一，不能共同存在

::: 

### getter/setter

对用户的年龄数据使用访问器监控控制

```js
"use strict";
const user = {
    data: { name: 'Jerry', age: null },
    set age(value) {
        if (typeof value != "number" || value > 100 || value < 10) {
            throw new Error("年龄格式错误");
        }
        this.data.age = value;
    },
    get age() {
        return `年龄是: ${this.data.age}`;
    }
};
user.age = 99;
user.age = 123; // Uncaught Error: 年龄格式错误
```

下面使用getter设置只读的课程总价

```js
let Lesson = {
    lists: [
        { name: "js", price: 100 },
        { name: "mysql", price: 212 },
        { name: "vue.js", price: 98 }
    ],
    get total() {
        return this.lists.reduce((t, b) => t + b.price, 0);
    }
};
console.log(Lesson.total); //410
Lesson.total = 30; //无效 因为没有对应的setter
console.log(Lesson.total); //410
```

下面通过设置站网站名称与网址体验`getter/setter`批量设置属性的使用

```js
const web = {
    name: "Jerry",
    url: "google.com",
    get site() {
        return `${this.name} ${this.url}`;
    },
    set site(value) {
        [this.name, this.url] = value.split(",");
    }
};
console.log(web.site);  // Jerry google.com
web.site = "Jerry,baidu.com";
console.log(web.site);  // Jerry baidu.com
```

下面是设置token储取的示例，将业务逻辑使用`getter/setter`处理更方便，也方便其他业务的复用。

```js
let Request = {
    get token() {
        let con = localStorage.getItem('token');
        if (!con) {
            alert('请登录后获取token')
        } else {
            return con;
        }
    },
    set token(con) {
        localStorage.setItem('token', con);
    }
};
// Request.token = 'ace'
console.log(Request.token);
```

定义内部私有属性

```js
"use strict";
const user = {
    get name() {
        return this._name;
    },
    set name(value) {
        if (value.length <= 3) {
            throw new Error("用户名不能小于三位");
        }
        this._name = value;
    }
};
user.name = "Jerry";
console.log(user.name);  // Jerry
user.name = "H";  // 用户名不能小于三位
```

### 访问器描述符 💡

使用 `defineProperty` 可以模拟定义私有属性，从而使用面向对象的抽象特性。

```js
function User(name, age) {
    let data = { name, age };
    Object.defineProperties(this, {
        name: {
            get() {
                return data.name;
            },
            set(value) {
                if (value.trim() == "") throw new Error("无效的用户名");
                data.name = value;
            }
        },
        age: {
            get() {
                return data.name;
            },
            set(value) {
                if (value.trim() == "") throw new Error("无效的用户名");
                data.name = value;
            }
        }
    });
}
let obj = new User("Jerry", 33);
console.log(obj.name);  // Jerry
obj.name = "Michael";
console.log(obj.name);  // Michael
```

上面的代码也可以使用语法糖 `class`定义

```js
"use strict";
const DATA = Symbol();
class User {
    constructor(name, age) {
        this[DATA] = { name, age };
    }
    get name() {
        return this[DATA].name;
    }
    set name(value) {
        if (value.trim() == "") throw new Error("无效的用户名");
        this[DATA].name = value;
    }
    get age() {
        return this[DATA].name;
    }
    set age(value) {
        if (value.trim() == "") throw new Error("无效的用户名");
        this[DATA].name = value;
    }
}
let obj = new User("Jerry", 33);
console.log(obj.name);  // Jerry
obj.name = "Michael";
console.log(obj.name);  // Michael
console.log(obj);  // User {Symbol(): {…}}
```

### 闭包访问器

下面结合闭包特性对属性进行访问控制

- 下例中访问器定义在函数中，并接收参数v
- 在`get()` 中通过闭包返回 v
- 在`set() `中修改了v，这会影响`get()`访问的闭包数据v

```js
let data = {
    name: 'ace.com',
}
for (const [key, value] of Object.entries(data)) {
    observer(data, key, value)
}

function observer(data, key, v) {
    Object.defineProperty(data, key, {
        get() {
            return v
        },
        set(newValue) {
            v = newValue
        },
    })
}
data.name = 'Jerry'
console.dir(data.name) // Jerry
```

## Proxy 💡 

::: tip 代理（拦截器）是对象的访问控制，`setter/getter` 是对单个对象属性的控制，而代理是对整个对象的控制。

- 读写属性时代码更简洁
- 对象的多个属性控制统一交给代理完成
- 严格模式下 `set` 必须返回布尔值

::: 

### 使用方法

代理普通**对象**

```js
"use strict";
const obj = { name: "Jerry" };
// Proxy返回一个新对象，通过新对象操作代理的原始数据
const proxy = new Proxy(obj, {
  get(obj, property) {
    return obj[property];
  },
  set(obj, property, value) {
    obj[property] = value;
    return true;
  }
});
proxy.age = 10;
console.log(obj);  // {name: 'Jerry', age: 10}
```

### 代理函数

如果代理以**函数**方式执行时，会执行代理中定义 `apply` 方法。

> 参数说明：函数，上下文对象，参数

下面使用 `apply` 计算函数执行时间

```js
function factorial(num) {
    return num == 1 ? 1 : num * factorial(num - 1);
}
let proxy = new Proxy(factorial, {
    apply(func, obj, args) {
        console.time("run");
        func.apply(obj, args);  // 通过apply绑定上下文
        console.timeEnd("run");
    }
});
// 这里是正常通过apply传递上下文
proxy.apply(this, [1, 2, 3]);  
```

### 截取字符

下例中对**数组**进行代理，用于截取标题操作

```js
const stringDot = {
    get(target, key) {
        const title = target[key].title;
        const len = 5;
        return title.length > len
            ? title.substr(0, len) + ".".repeat(3)
        : title;
    }
};
const lessons = [
    {
        title: "媒体查询响应式布局",
        category: "css"
    },
    {
        title: "FLEX 弹性盒模型",
        category: "css"
    },
    {
        title: "MYSQL多表查询随意操作",
        category: "mysql"
    }
];
const stringDotProxy = new Proxy(lessons, stringDot);
console.log(stringDotProxy[0]);  // 媒体查询响...
```

### 双向绑定

下面通过代理实现`vue` 等前端框架的数据绑定特性特性。

```html
<body>
    <input type="text" v-model="title" />
    <input type="text" v-model="title" />
    <div v-bind="title"></div>
</body>

<script>
function View() {
	//设置代理拦截
  let proxy = new Proxy(
    {},
    {
      get(obj, property) {},
      set(obj, property, value) {
        obj[property] = value;
        document
          .querySelectorAll(
            `[v-model="${property}"],[v-bind="${property}"]`
          )
          .forEach(el => {
            el.innerHTML = value;
            el.value = value;
          });
      }
    }
  );
  //初始化绑定元素事件
  this.run = function() {
    const els = document.querySelectorAll("[v-model]");
    els.forEach(item => {
      item.addEventListener("keyup", function() {
        proxy[this.getAttribute("v-model")] = this.value;
      });
    });
  };
}
let view = new View().run();
```

### 表单验证

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      padding: 50px;
      background: #34495e;
    }

    input {
      border: solid 10px #ddd;
      height: 30px;
    }

    .error {
      border: solid 10px red;
    }
  </style>
</head>

<body>
  <input type="text" validate rule="max:12,min:3" />
  <input type="text" validate rule="max:3,isNumber" />
</body>

<script>
  "use strict";
  //验证处理类
  class Validate {
    max(value, len) {
      return value.length <= len;
    }
    min(value, len) {
      return value.length >= len;
    }
    isNumber(value) {
      return /^\d+$/.test(value);
    }
  }

  //代理工厂
  function makeProxy(target) {
    return new Proxy(target, {
      get(target, key) {
        return target[key];
      },
      set(target, key, el) {
        // 获取检验项 every所有检验
        const rule = el.getAttribute("rule");
        const validate = new Validate();
        let state = rule.split(",").every(rule => {
          const info = rule.split(":");
          return validate[info[0]](el.value, info[1]);
        });
        // 根据state状态调用remove或者add方法 
        el.classList[state ? "remove" : "add"]("error");
        return true;
      }
    });
  }

  // 只获取有validate属性的表单
  const nodes = makeProxy(document.querySelectorAll("[validate]"));
  nodes.forEach((item, i) => {
    item.addEventListener("keyup", function () {
      nodes[i] = this;
    });
  });
</script>
</html>
```

![](./img/object/proxy.gif)

## JSON

::: tip JSON

- json 是一种轻量级的数据交换格式，易于人阅读和编写。
- 使用`json` 数据格式是替换 `xml` 的最佳方式，主流语言都很好的支持`json` 格式。所以 `json` 也是前后台传输数据的主要格式。
- `json` 标准中要求使用双引号包裹属性，虽然有些语言不强制，但使用双引号可避免多程序间传输发生错误语言错误的发生。

::: 

### 声明定义

**基本结构**

```js
let obj = {
    "title": "Jerry",
    "url": "google.com",
    "teacher": {
        "name": "Michael",
    }
}
console.log(obj.teacher.name);  // Michael
```

**数组结构**

```js
let lessons = [
    {
        "title": '媒体查询响应式布局',
        "category": 'css',
        "click": 199
    },
    {
        "title": 'FLEX 弹性盒模型',
        "category": 'css',
        "click": 12
    },
    {
        "title": 'MYSQL多表查询随意操作',
        "category": 'mysql',
        "click": 89
    }
];

console.log(lessons[0].title);  // 媒体查询响应式布局
```

### 序列化 💡

序列化是将 `json` 转换为字符串，一般用来向其他语言传输使用。

```js
let obj = {
    "title": "Jerry",
    "url": "ace.com",
    "teacher": {
        "name": "Michael",
    }
}
console.log(JSON.stringify(obj)); 
// {"title":"Jerry","url":"ace.com","teacher":{"name":"Michael"}}
```

💡 根据第二个参数指定保存的属性

```js
console.log(JSON.stringify(obj, ['title', 'url']));
// {"title":"Jerry","url":"ace.com"}
```

💡 第三个是参数用来控制TAB数量，如果字符串则为前导字符。

```js
let obj = {
    "title": "Jerry",
    "url": "ace.com",
    "teacher": {
        "name": "Michael",
    }
}
console.log(JSON.stringify(obj, null, 4));
```

📌 为数据添加 `toJSON` 方法来自定义返回格式

```js
let obj = {
    "title": "Jerry",
    "url": "ace.com",
    "teacher": {
        "name": "Michael大叔",
    },
    "toJSON": function () {
        return {
            "title": this.url,
            "name": this.teacher.name
        };
    }
}
console.log(JSON.stringify(obj));
//{"title":"ace.com","name":"Michael"}
```

### 反序列化

使用 `JSON.parse` 将字符串 `json` 解析成对象

```js
let obj = {
  "title": "Jerry",
  "url": "ace.com",
  "teacher": {
  	"name": "Michael",
  }
}
let jsonStr = JSON.stringify(obj);
console.log(JSON.parse(jsonStr)); 
// {title: 'Jerry', url: 'ace.com', teacher: {…}}
```

使用第二个参数函数来对返回的数据二次处理

```js
let obj = {
    title: "Jerry",
    url: "ace.com",
    teacher: {
        name: "Michael"
    }
};
let jsonStr = JSON.stringify(obj);
console.log(
    JSON.parse(jsonStr, (key, value) => {
        if (key == "title") {
            return `[推荐] ${value}`;
        }
        return value;
    })
);
// {title: '[推荐] Jerry', url: 'ace.com', teacher: {…}}
```

