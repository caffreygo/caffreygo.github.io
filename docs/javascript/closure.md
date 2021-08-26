# 作用域与闭包

## 作用域

::: tip 📗  全局作用域只有一个，每个函数又都有作用域（环境）

- 编译器运行时会将变量定义在所在作用域
- 使用变量时会从当前作用域开始向上查找变量
- 作用域就像攀亲亲一样，晚辈总是可以向上辈要些东西

::: 

### 使用规范

📗 作用域链只向上查找，找到全局window即终止，应该尽量不要在全局作用域中添加变量。

 函数被执行后其环境变量将从内存中删除。下面函数在每次执行后将删除函数内部的total变量。

```js
function count() {
  let total = 0;
}
count();
```

📌 函数每次调用都会创建一个新作用域

```js
let site = 'Jerry';

function a() {
  let abc = 'abc.com';

  function b() {
      let web = 'web.com';
      console.log(abc);   // abc.com
      console.log(site);  // Jerry
  }
  b();
}
a();
```

💡 💡 💡 如果子函数被使用时父级环境将被**保留**  💡 💡 💡

```js
function abc() {
  let n = 1;
  return function() {
    let b = 1;
    return function() {
      console.log(++n);
      console.log(++b);
    };
  };
}
let a = abc()();
a(); //2,2
a(); //3,3
```

构造函数也是很好的环境例子，子函数被外部使用父级环境将被保留

```js
function User() {
  let a = 1;
  this.show = function() {
    console.log(a++);
  };
}
let a = new User();   // user作用域 1
a.show(); //1
a.show(); //2

let b = new User();   // user作用域 2
b.show(); //1
```

### let/const

使用 `let/const` 可以将变量声明在块作用域中（放在新的环境中，而不是全局中）

```js
{
	let a = 9;
}
console.log(a); //ReferenceError: a is not defined
if (true) {
	var i = 1;
}
console.log(i);//1
```

在 `for` 循环中使用`let/const` 会在每一次迭代中重新生成不同的变量

```js
let arr = [];
for (let i = 0; i < 10; i++) {
	arr.push((() => i));
}
console.log(arr[3]()); //3 如果使用var声明将是10
```

📗 上面代码中，变量i是let声明的，当前的i只在本轮循环有效，所以每一次循环的i其实都是一个新的变量，所以最后输出的是3。

在没有`let/const` 的历史中使用以下方式产生作用域

```js
//自行构建闭包
var arr = [];
for (var i = 0; i < 10; i++) {
  (function (a) {
      arr.push(()=>a);
  })(i);
}
console.log(arr[3]()); //3
```

💡 理解

```js
{
    let i = 0;
    {
        let _i = i;
        a[_i] = function() {
            console.log(_i);
        };
    }
    i++;
}
```

## 闭包使用

📗 闭包指子函数可以访问外部作用域变量的函数特性，即使在子函数作用域外也可以访问。如果没有闭包那么在处理事件绑定，异步请求时都会变得困难。

- JS 中的所有函数都是闭包
- 闭包一般在子函数本身作用域以外执行，即延伸作用域

 📌上面说的是理论角度，站在技术实践角度来说，闭包无非满足以下两点：

- 闭包首先得是一个函数
- **闭包是指能使用其它作用域自由变量的函数，即使作用域已销毁**

*在JavaScript当中，及时函数外部执行上下文已经被释放，如果闭包函数被外界引用，那么闭包上层作用域将依旧存货在内存当中*

```js
let fn = function () {
    let num = 1; //自由变量
    return {
        a: function () {
            console.log(num);
        },
        b: function () {
            num++;
        }
    };
};

let closure = fn();  //到这里outer函数已执行完毕，执行上下文被释放

fn = null;  // 销毁外层函数上下文
closure.b();
closure.a(); // 2
```

### 基本示例

前面在讲作用域时已经在使用闭包特性了，下面再次重温一下闭包。

```js
function abc() {
  let name = 'Jerry';
  return function () {
  	return name;
  }
}
let abcweb = abc();
console.log(abcweb()); // Jerry
```

使用闭包返回数组区间元素

```js
let arr = [3, 2, 4, 1, 5, 6];
function between(a, b) {
  return function(v) {
    return v >= a && v <= b;
  };
}
console.log(arr.filter(between(3, 5)));
```

下面是在回调函数中使用闭包，当点击按钮时显示当前点击的是第几个按钮。

#### var

```html
<body>
  <button message="Jerry">button</button>
  <button message="abcweb">button</button>
</body>
<script>
  var btns = document.querySelectorAll("button");
  for (var i = 0; i < btns.length; i++) {
    btns[i].onclick = function () {
      alert(`点击了第${i + 1}个按钮`);    // 3 3 3 ...
    };
  }
</script>
```

#### let

```html
<body>
  <button message="Jerry">button</button>
  <button message="abcweb">button</button>
</body>
<script>
  var btns = document.querySelectorAll("button");
  for (let i = 0; i < btns.length; i++) {
    // let将i对应的值形成一个块级作用域，并包裹着对应的onClick函数
    btns[i].onclick = function () {
      alert(`点击了第${i + 1}个按钮`);  // 1 / 2
    };
  }
</script>
```

#### 闭包

```html
<body>
  <button message="Jerry">button</button>
  <button message="abcweb">button</button>
</body>
<script>
  var btns = document.querySelectorAll("button");
  for (var i = 0; i < btns.length; i++) {
    // 通过IIFE形成一个函数作用域，传入对应的i值
    btns[i].onclick = (function(i) {
      return function() {
        alert(`点击了第${i + 1}个按钮`);
      };
    })(i);
  }
</script>
```

### 移动动画

计时器中使用闭包来获取独有变量

```html
<body>
  <style>
    button {
      position: absolute;
    }
  </style>
  <button message="Jerry">Jerry</button>
  <button message="Hello">Hello</button>
</body>

<script>
  let btns = document.querySelectorAll("button");
  btns.forEach(function(item) {
    let bind = false; // 开关 确保只创建一个定时器
    item.addEventListener("click", function() {
      if (!bind) {
        let left = 1;
        bind = setInterval(function() {
          item.style.left = left++ + "px";
        }, 100);
      }
    });
  });
</script>
```

### 闭包排序

下例使用闭包按指定字段排序

```js
let lessons = [
  {
    title: "媒体查询响应式布局",
    click: 89,
    price: 12
  },
  {
    title: "FLEX 弹性盒模型",
    click: 45,
    price: 120
  },
  {
    title: "GRID 栅格系统",
    click: 19,
    price: 67
  },
  {
    title: "盒子模型详解",
    click: 29,
    price: 300
  }
];
function order(field) {
  // 该作用域里有field的值，sort对此调用返回的函数，每次都能访问到这个值
  return (a, b) => (a[field] > b[field] ? 1 : -1);
}
console.table(lessons.sort(order("price")));
```

## 闭包问题 💡

#### **内存泄漏**

 📌 闭包特性中上级作用域会为函数保存数据，从而造成的如下所示的内存泄漏问题

```html
<body>
  <div desc="houdunren">在线学习</div>
  <div desc="abcweb">开源产品</div>
</body>

<script>
  let divs = document.querySelectorAll("div");
  divs.forEach(function(item) {
    // 这边上下文的item将会活跃在内存当中
    item.addEventListener("click", function() {
      console.log(item.getAttribute("desc"));
    });
  });
</script>
```

下面通过清除不需要的数据解决内存泄漏问题

```js
let divs = document.querySelectorAll("div");
divs.forEach(function(item) {
  // 只保留一个需要的属性，减少内存的占用
  let desc = item.getAttribute("desc");
  item.addEventListener("click", function() {
    console.log(desc);
  });
  item = null;
});
```

#### **this指向**

```js
let abc = {
  user: "Jerry",
  get: function() {
    let user = 'wawa'
    return function() {
      return user;
    };
  }
};
console.log(abc.get()()); //wawa 闭包
```

this 总是指向调用该函数的对象，即函数在搜索this时只会搜索到当前活动对象。

下面是函数因为是在全局环境下调用的，所以this指向window，这不是我们想要的。

```js
let abc = {
  user: "Jerry",
  get: function() {
    return function() {
      return this.user; // this指向window
    };
  }
};

console.log(abc.get()()); //undefined
// 1. var func = abc.get()   2. func()
```

使用箭头函数解决这个问题

```js
let abc = {
  user: "Jerry",
  get: function() {
    return () => this.user;
  }
};
abc.get()(); // Jerry
```

区别

```js
let abc = {
  user: "Jerry",
  get: () => this.user
};
abc.get()  // undefined
```

