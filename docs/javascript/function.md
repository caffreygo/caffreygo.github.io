# 函数进阶

## 基础知识

📗 函数是将复用的代码块封装起来的模块, 拥有自己的上下文

### 声明定义

📌 在JS中，函数也是**对象**，函数是`Function`类的创建的实例，下面的例子可以方便理解函数是对象。

```js
let abc = new Function("title", "console.log(title)");
abc('Jerry');
```

标准语法是使用**函数声明**来定义函数

```js
function abc(num) {
	return ++num;
}
console.log(abc(3));
```

对象字面量属性函数简写

```js
let user = {
  name: null,
  getName: function (name) {
  	return this.name;
  },
  //简写形式
  setName(value) {
  	this.name = value;
  }
}
user.setName('Jerry');
console.log(user.getName()); // Jerry
```

全局函数会声明在window对象中，这不正确建议使用后面章节的模块处理

```js
console.log(window.screenX); //2200
```

当我们定义了 `screenX` 函数后就覆盖了window.screenX方法

```js
function screenX() {
  return "Jerry";
}
console.log(screenX()); //Jerry
```

💡 使用`let/const`时不会压入window

```js
let abc = function() {
  console.log("Jerry");
};
window.abc(); //window.abc is not a function
```

### 匿名函数

📗 函数是**对象**，所以可以通过赋值来指向到函数对象的指针，当然指针也可以传递给其他变量，注意后面要以`;`结束。

下面使用**函数表达式**将 `匿名函数` 赋值给变量：

```js
let abc = function(num) {
  return ++num;
};

console.log(abc instanceof Object); //true

let cms = abc;
console.log(cms(3));
```

标准声明的函数优先级更高，解析器会优先提取函数并放在代码树顶端，所以标准声明函数位置不限制，所以下面的代码可以正常执行。

📌 函数声明的函数会提升，可提前调用

```js
console.log(abc(3));
function abc(num) {
	return ++num;
};
```

📌 函数表达式只有变量提升，不可以提前调用

```js
console.log(abc(3)); //4

function abc(num) {
  return ++num;
}

var abc = function() {
  return "abc";
};
```

程序中使用匿名函数的情况非常普遍

```js
function sum(...args) {
  return args.reduce((a, b) => a + b);
}
console.log(sum(1, 2, 3));
```

### 立即执行 💡

📗 立即执行函数指函数定义时立即执行

>  可以用来定义私有作用域防止污染全局作用域

```js
"use strict";
(function () {
    var web = 'houdunren';
})();
console.log(web); //web is not defined
```

💡 使用 `let/const` 有块作用域特性，所以使用以下方式也可以产生私有作用域

```js
{
	let web = 'houdunren';
}
console.log(web);   // ReferenceError: web is not defined
```

### 函数提升

函数也会提升到前面，优先级行于`var`变量提高（函数声明）

```js
console.log(abc()); //Jerry
function abc() {
	return 'Jerry';
}
```

变量函数定义不会被提升（函数表达式）

```js
console.log(abc()); //Jerry

function abc() {
	return 'Jerry';
}
var abc = function () {
	return 'hello.com';
}
console.log(abc()); //hello.com
```

### 形参实参

📗 形参(parameter)是在函数声明时设置的参数，实参(arguments)指在调用函数时传递的值。

- 形参数量大于实参时，没有传参的形参值为 undefined
- 实参数量大于形参时，多于的实参将忽略并不会报错

```js
// n1,n2 为形参
function sum(n1, n2) {
	return n1+n2;
}
// 参数 2,3 为实参
console.log(sum(2, 3)); //5
```

当没传递参数时值为undefined

```js
function sum(n1, n2) {
  return n1 + n2;
}
console.log(sum(2)); //NaN
```

### 默认参数

下面通过计算年平均销售额来体验以往默认参数的处理方式

```js
//total:总价 year:年数
function avg(total, year) {
  year = year || 1;
  return Math.round(total / year);
}
console.log(avg(2000, 3));
```

💡 使用新版本默认参数方式如下

```js
function avg(total, year = 1) {
  return Math.round(total / year);
}
console.log(avg(2000, 3));
```

下面通过排序来体验新版默认参数的处理方式，下例中当不传递 type 参数时使用默认值 asc。

```js
function sortArray(arr, type = 'asc') {
	return arr.sort((a, b) => type == 'asc' ? a - b : b - a);
}
console.log(sortArray([1, 3, 2, 6], 'desc'));
```

📌 **默认参数**要放在**最后面** 

```js
//total:价格,discount:折扣,dis:折后折
function sum(total, discount = 0, dis = 0) {
  return total * (1 - discount) * (1 - dis);
}
console.log(sum(2000, undefined, 0.3));
```

### 函数参数

📌 函数可以做为参数传递，这也是大多数语言都支持的语法规则 （回调函数）

```html
<body>
    <button>订阅</button>
</body>
<script>
    document.querySelector('button').addEventListener('click', function () {
        alert('感谢订阅');
    })
</script>
```

函数可以做为参数传递

```js
function filterFun(item) {
	return item <= 3;
}
let abc = [1, 2, 3, 4, 5].filter(filterFun);
console.log(abc); //[1,2,3]
```

### arguments

📌 arguments 是函数获得到所有参数集合，下面是使用 `arguments` 求和的例子

```js
function sum() {
  return [...arguments].reduce((total, num) => {
    return (total += num);
  }, 0);
}
console.log(sum(2, 3, 4, 2, 6)); //17
```

更建议使用展示语法

```js
function sum(...args) {
 return args.reduce((a, b) => a + b);
}
console.log(sum(2, 3, 4, 2, 6)); //17
```

### 箭头函数

📌 箭头函数是函数声明的简写形式，在使用递归调用（访问自身）、构造函数、事件处理器时不建议使用箭头函数。

无参数时使用空扩号即可

```js
let sum = () => {
	return 1 + 3;
}
console.log(sum()); //4
```

函数体为单一表达式时不需要 `return` 返回处理，系统会自动返回表达式计算结果。

```js
let sum = () => 1 + 3;
console.log(sum()); //4
```

多参数传递与普通声明函数一样使用逗号分隔

```js
let abc = [1, 8, 3, 5].filter((item, index) => {
	return item <= 3;
});
console.log(abc);
```

只有一个参数时可以省略括号

```js
let abc = [1, 8, 3, 5].filter(item => item <= 3);
console.log(abc);
```

### 递归调用

::: tip 递归指函数内部**调用自身**的方式。

- 主要用于数量不确定的循环操作
- 要有**退出时机**否则会陷入死循环

:::

下面通过阶乘来体验递归调用

```js
function factorial(num = 3) {
	return num == 1 ? num : num * factorial(--num);
}
console.log(factorial(5)); //120 num==1时就是我们的退出时机
```

累加计算方法

```js
function sum(...num) {
	return num.length == 0 ? 0 : num.pop() + sum(...num);
}
console.log(sum(1, 2, 3, 4, 5, 7, 9)); //31 num.length==0时就是我们的退出时机
```

递归打印倒三角

```js
******
*****
****
***
**
*

function star(row = 5) {
  if (row == 0) return "";
  document.write("*".repeat(row) + "<br/>");
  star(--row);
}
```

使用递归修改课程点击数

```js
let lessons = [
  {
    title: "媒体查询响应式布局",
    click: 89
  },
  {
    title: "FLEX 弹性盒模型",
    click: 45
  },
  {
    title: "GRID 栅格系统",
    click: 19
  },
  {
    title: "盒子模型详解",
    click: 29
  }
];
function change(lessons, num, i = 0) {
  if (i == lessons.length) {
    return lessons;
  }
  lessons[i].click += num;
  return change(lessons, num, ++i);
}
console.table(change(lessons, 100));
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/javascript/function/1.png)

### 回调函数

📌 在某个时刻被其他函数调用的函数称为回调函数，比如处理键盘、鼠标事件的函数。

```js
<button id='abc'>button</button>
<script>
     document.getElementById('abc').addEventListener('click', () => alert('通过回调函数调用'));
</script>
```

使用回调函数递增计算

```js
let abc = ([1, 2, 3]).map(item => item + 10);
console.log(abc)
```

### 展开语法

📌 展示语法或称点语法体现的就是`收/放`特性，做为值时是`放`，做为接收变量时是`收`。

```js
let abc = [1, 2, 3];
let [a, b, c] = [...abc];
console.log(a); //1
console.log(b); //2
console.log(c); //3
[...abc] = [1, 2, 3];
console.log(abc); //[1, 2, 3]
```

使用展示语法可以替代 `arguments` 来接收任意数量的参数

```js
function abc(...args) {
  console.log(args);
}
abc(1, 2, 3, "Jerry"); //[1, 2, 3, "Jerry"]
```

也可以用于接收部分参数

```js
function abc(site, ...args) {
  console.log(site, args); //Jerry (3) [1, 2, 3]
}
abc("Jerry", 1, 2, 3);
```

使用 `...` 可以接受传入的多个参数合并为数组，下面是使用点语法进行求合计算。

```js
function sum(...params) {
	console.log(params);
	return params.reduce((pre, cur) => pre + cur);
}
console.log(sum(1, 3, 2, 4));  // 10
```

多个参数时`...参数`必须放后面，下面计算购物车商品折扣

```js
function sum(discount = 0, ...prices) {
  let total = prices.reduce((pre, cur) => pre + cur);
  return total * (1 - discount);
}
console.log(sum(0.1, 100, 300, 299));   // 629.1
```

### 标签函数

使用函数来解析标签字符串，第一个参数是字符串值的数组，其余的参数为标签变量。

```js
function abc(str, ...values) {
  console.log(str);   // Hello
  console.log(values);   // ["world", "Js"]
}
abc("Hello", "world", "Js");
```

## this

📌 调用函数时 `this` 会隐式传递给函数，指函数调用时的关联对象，也称之为函数的上下文。

<img src="http://ra15bg9hk.hn-bkt.clouddn.com/javascript/function/this.png" style="zoom:60%;" />

### 函数调用

全局环境下`this`就是window对象的引用

```js
console.log(this == window); //true
```

使用严格模式时在全局函数内`this`为`undefined`

```js
var abc = 'Jerry';
function get() {
  "use strict"
  return this.abc;
}
console.log(get());
//严格模式将产生错误 Cannot read property 'name' of undefined
```

### 方法调用 

💡 函数为对象的方法时`this` 指向该对象

可以使用多种方式创建对象，下面是使用构造函数创建对象

**构造函数**

函数当被 `new` 时即为构造函数，一般构造函数中包含属性与方法。函数中的上下文指向到实例对象。

- 构造函数主要用来生成对象，里面的this默认就是指当前对象

```js
function User() {
  this.name = "Jerry";
  this.say = function() {
    console.log(this); //User {name: "Jerry", say: ƒ}
    return this.name;
  };
}
let abc = new User();
console.log(abc.say()); //Jerry
```

**对象字面量**

- 下例中的abc函数不属于对象方法所以指向`window`
- show属于对象方法执向 `obj`对象

```js
let obj = {
  site: "Jerry",
  show() {
    console.log(this.site); //Jerry
    console.log(`this in show method: ${this}`); //this in show method: [object Object]
    function abc() {
      console.log(typeof this.site); //undefined
      console.log(`this in abc function: ${this}`); //this in abc function: [object Window]
    }
    abc();
  }
};
obj.show();
```

💡 在方法中使用函数时有些函数可以改变this如`forEach`，当然也可以使用后面介绍的`apply/call/bind`

```js
let Lesson = {
  site: "Jerry",
  lists: ["js", "css", "mysql"],
  show() {
    // show作为对象方法，this指向当前的Lession对象
    return this.lists.map(function(title) {
      // map的回调函数当中，this指向 Window
      return `${this.site}-${title}`;
    }, this);
  }
};
console.log(Lesson.show());
```

💡 也可以在父作用域中定义引用`this`的变量

```js
let Lesson = {
    site: "Jerry",
    lists: ["js", "css", "mysql"],
    show() {
      const self = this;
      return this.lists.map(function(title) {
        return `${self.site}-${title}`;
      });
    }
  };
  console.log(Lesson.show());
```

### 箭头函数 💡

📗 箭头函数没有`this`, 也可以理解为箭头函数中的`this` 会继承定义函数时的上下文，可以理解为和外层函数指向同一个this。

> 如果想使用函数定义时的上下文中的this，那就使用箭头函数

下例中的匿名函数的执行环境为全局所以 `this` 指向 `window`。

```js
var name = 'hello';
var obj = {
  name: 'Jerry',
  getName: function () {
    // this == obj
    return function () {
        // this == Window
    	return this.name;
    }
  }
}
console.log(obj.getName()()); // hello
```

以往解决办法会匿名函数调用处理定义变量，然后在匿名函数中使用。

```js
var name = 'hello';
var obj = {
  name: 'Jerry',
  getName: function () {
    var self = this;
		return function() {
    	return self.name;
    }
  }
}
console.log(obj.getName()()); // Jerry
```

使用箭头函数后 `this` 为定义该函数的上下文，也可以理解为定义时父作用域中的`this`

```js
var name = 'hello';
var obj = {
  name: 'Jerry',
  getName: function () {
    // 箭头函数的this指向定义时的父级作用域
    return () => {
    	return this.name;
    }
  }
}
console.log(obj.getName()()); // Jerry
```

::: tip 事件处理函数的this

事件中使用箭头函数结果不是我们想要的

- 事件函数可理解为对象`onclick`设置值，所以函数声明时`this`为当前对象
- 但使用箭头函数时`this`为声明函数上下文

:::

下面体验使用普通事件函数时`this`指向元素对象

使用普通函数时`this`为当前DOM对象

```html
<body>
  <button desc="hello">button</button>
</body>
<script>
  let Dom = {
    site: "Jerry",
    bind() {
      const button = document.querySelector("button");
      button.addEventListener("click", function() {
        // button.onclick = func...   这边this指向当前dom节点
        alert(this.getAttribute("desc"));
      });
    }
  };
  Dom.bind();
</script>
```

下面是使用箭头函数时this指向上下文对象

```html
<body>
  <button desc="hello">button</button>
</body>
<script>
  let Dom = {
    site: "Jerry",
    bind() {
      const button = document.querySelector("button");
      button.addEventListener("click", event => {
        // 箭头函数将this指向了父级bind函数作用域的this，也就是Dom对象
        alert(this.site + event.target.innerHTML);
      });
    }
  };
  Dom.bind();
</script>
```

使用`handleEvent`绑定事件处理器时，`this`指向当前对象而不是DOM元素。

```html
<body>
  <button desc="hello">button</button>
</body>
<script>
  let Dom = {
    site: "Jerry",
    handleEvent: function(event) {
      console.log(this);
    },
    bind() {
      const button = document.querySelector("button");
      // <button desc="hello">button</button>
      button.addEventListener("click", this);
    }
  };
  Dom.bind();
</script>
```

---

### 回顾

对象方法，this就是这个对象

```js
var name = "Window name"
var obj = {
	name: "Object name",
    showName: function() {
        console.log(this.name)  // Object name
    }
}
obj.showName()

// ======================================== 

let user = {
  firstName: "Ilya",
  sayHi() {
    let arrow = () => alert(this.firstName);
    arrow();
  }
};

user.sayHi(); // Ilya

// ======================================== 箭头函数的this由声明位置的外层决定

let a =  () => alert(this.firstName)
let user = {
  firstName: "Ilya",
  sayHi() {
    let arrow = a;
    arrow();
  }
};

user.sayHi(); // undefined
```

方法为箭头函数， window

```js
var name = "Window name"
var obj = {
	name: "Object name",
    showName: ()=> {
        console.log(this.name)  // Window name
    }
}
obj.showName()
```

构造函数的this始终指向当前实例对象

```js
var name = "global name"
function Abc(name) {
    this.name = name,
    this.show = ()=> {
        console.log(this.name)
    }
}
function Bcd(name) {
    this.name = name,
    this.show = function() {
        console.log(this.name)
    }
}
console.log(new Abc("Jerry").show())  // Jerry
console.log(new Bcd("Jerry").show())  // Jerry
```

## apply/call/bind

📗 改变this指针，也可以理解为对象借用方法，就现像生活中向邻居借东西一样的事情。

### 原理分析

构造函数中的`this`默认是一个空对象，然后构造函数处理后把这个空对象变得有值。

```js
function User(name) {
  // this => {}
  this.name = name;
}
let abc = new User("Jerry");
```

可以改变构造函数中的空对象，即让构造函数this指向到另一个对象。

```js
function User(name) {
  this.name = name;
}

let hello = {};
User.call(hello, "HDCMS");
console.log(hello.name); //HDCMS
```

### apply/call

📗 call与apply 用于显示的设置函数的上下文，两个方法作用一样都是将对象绑定到this，只是在传递参数上有所不同。

- apply 用数组传参
- call 需要分别传参
- 与 bind 不同 call/apply 会立即执行函数

语法使用介绍

```js
function show(title) {
    alert(`${title+this.name}`);
}
let lisi = {
    name: '李四'
};
let wangwu = {
    name: '王五'
};
show.call(lisi, 'Jerry');
show.apply(wangwu, ['HDCMS']);
```

使用 `call` 设置函数上下文

```html
<body>
    <button message="Jerry">button</button>
    <button message="hello">button</button>
</body>
<script>
    function show() {
        alert(this.getAttribute('message'));
    }
    let bts = document.getElementsByTagName('button');
    for (let i = 0; i < bts.length; i++) {
        bts[i].addEventListener('click', () => show.call(bts[i]));
    }
</script>
```

找数组中的数值最大值

```js
let arr = [1, 3, 2, 8];
console.log(Math.max(arr)); //NaN
console.log(Math.max.apply(Math, arr)); //8     Math.max.apply(null, arr) max方法不需要指定上下文
console.log(Math.max(...arr)); //8
```

实现构造函数属性继承

```js
"use strict";
function Request() {
  this.get = function(params = {}) {
    //组合请求参数
    let option = Object.keys(params)
      .map(i => i + "=" + params[i])
      .join("&");

    return `获取数据 API:${this.url}?${option}`;
  };
}
//文章控制器
function Article() {
  this.url = "article/index";
  // 在Article实例上添加get方法
  Request.apply(this, []);
}
let abc = new Article();
console.log(
  abc.get({
    row: 10,
    start: 3
  })
);
//课程控制器
function Lesson() {
  this.url = "lesson/index";
   // 在Lesson实例上添加get方法
  Request.call(this);
}
let js = new Lesson();
console.log(
  js.get({
    row: 20
  })
);
```

制作显示隐藏面板

![](http://ra15bg9hk.hn-bkt.clouddn.com/javascript/function/call.gif)

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    * {
      padding: 0;
      margin: 0;
    }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100vw;
      height: 100vh;
    }
    dl {
      width: 400px;
      display: flex;
      flex-direction: column;
    }
    dt {
      background: #e67e22;
      border-bottom: solid 2px #333;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
    dd {
      height: 200px;
      background: #bdc3c7;
      font-size: 5em;
      text-align: center;
      line-height: 200px;
    }
  </style>
</head>
<body>
  <dl>
    <dt>Jerry</dt>
    <dd>1</dd>
    <dt>hello</dt>
    <dd hidden="hidden">2</dd>
  </dl>
</body>
<script>
  function panel(i) {
    let dds = document.querySelectorAll("dd");
    dds.forEach(item => item.setAttribute("hidden", "hidden"));
    dds[i].removeAttribute("hidden");
  }
  document.querySelectorAll("dt").forEach((dt, i) => {
    dt.addEventListener("click", () => panel.call(null, i));
  });
</script>

</html>
```

### bind

📗  `bind()`是将函数绑定到某个对象，比如` a.bind(abc) `可以理解为将a函数绑定到abc对象上即 abc.a()。

- 与 call/apply 不同bind不会立即执行
- bind 是复制函数形为会返回**新函数**

bind是复制函数行为

```js
let a = function() {};
let b = a;
console.log(a === b); //true
//bind是新复制函数
let c = a.bind();
console.log(a == c); //false
```

绑定参数注意事项

```js
function abc(a, b) {
  return this.f + a + b;
}

//使用bind会生成新函数
let newFunc = abc.bind({ f: 1 }, 3);

//1+3+2 参数2赋值给b即 a=3,b=2
console.log(newFunc(2));
```

在事件中使用`bind`

```js
<body>
  <button>Jerry</button>
</body>
<script>
  document.querySelector("button").addEventListener(
    "click",
    function(event) {
      console.log(event.target.innerHTML + this.url);
    }.bind({ url: "blog.caffreygo.com" })
  );
</script>
```

动态改变元素背景颜色，当然下面的例子也可以使用箭头函数处理

![](http://ra15bg9hk.hn-bkt.clouddn.com/javascript/function/bind.gif)

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    * {
      padding: 0;
      margin: 0;
    }

    body {
      width: 100vw;
      height: 100vh;
      font-size: 3em;
      padding: 30px;
      transition: 2s;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #34495e;
      color: #34495e;
    }
  </style>
</head>

<body>
  blog.caffreygo.com
</body>
<script>
  function Color(elem) {
    this.elem = elem;
    this.colors = ["#74b9ff", "#ffeaa7", "#fab1a0", "#fd79a8"];
    this.run = function () {
      setInterval(
        function () {
          let pos = Math.floor(Math.random() * this.colors.length);
          this.elem.style.background = this.colors[pos];
        }.bind(this),
        1000
      );
    };
  }
  let obj = new Color(document.body);
  obj.run();
</script>

</html>
```