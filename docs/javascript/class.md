# class

 📌 `class` 是语法糖，实际上的原理就是prototype

## constructor

```js
class User {
  constructor(name) {
    this.name = name;
    this.show = function() {};
  }
  getName() {
    return this.name;
  }
}
const u = new User("Jerry Chen");
console.log(u);
```

::: tip constructor

- 在构造函数constructor内部this赋值的部分为实例属性

- 除了constructor声明的方法为class的原型方法，实例原型共享

- 构造函数具有默认值，不是必须定义的

  ```js
  constructor(...args) {
    super(...args); 
  }
  ```

:::

### 原理分析

- 类其实是函数

  ```js
  class User {}
  console.log(typeof User); // function
  ```

- 与ES5构造函数相同，class原型的constructor就是class本身

  ```js
  class User {
    constructor(name) {
      this.name = name;
    }
    show() {}
  }
  console.log(User == User.prototype.constructor); //true
  
  //下面是对比的普通函数
  function Hd(name) {
    this.name = name;
  }
  console.log(Hd == Hd.prototype.constructor); //true
  ```

- 在类中定义的方法也保存在函数原型

  ```js
  class User {
    constructor(name) {
      this.name = name;
      this.show = function() {};
    }
    getName() {
      return this.name;
    }
  }
  const u = new User("Jerry Chen");
  console.log(Object.getOwnPropertyNames(User.prototype)); // ["constructor", "getName"]
  ```

  ![](./img/class/1.png)

  所以下面定义的类：

  ```js
  class User {
    constructor(name) {
      this.name = name;
    }
    show() {
      console.log(this.name);
    }
  }
  ```

  与下面使用函数的定义是一致的：

  ```js
  function User(name) {
    this.name = name;
  }
  User.prototype.show = function() {
    console.log(this.name);
  };
  ```


## 属性与方法

### 实例属性

属性可以在constructor内部添加，也可以在constructor外声明

```js
class User {
  site = "blog.caffreygo.com";
  constructor(name) {
    this.name = name;
  }
  show() {
    console.log(this.site + ":" + this.name);  
  }
}

let u = new User("Jerry Chen")
```

  ![](./img/class/2.png)

### 原型方法

于ES5构造函数不同，class的方法不可枚举

```js
class User {
    constructor(name) {
        this.name = name;
    }
    show() {
        console.log(this.name);
    }
}
let u = new User("Jerry Chen");
for (const key in u) {
    console.log(key);    // name
}

function Person(name) {
    this.name = name;
}
Person.prototype.show = function() {
    console.log(this.name);
};
let obj = new Person("caffreygo");
for (const key in obj) {
    console.log(key);     // name show
}
```

![](./img/class/3.png)

## 严格模式

`class` 默认使用`strict` 严格模式执行

```js
class User {
    constructor(name) {
        this.name = name;
    }
    show() {
        function test() {
            //严格模式下输出 undefined
            console.log(this);
        }
        test();
    }
}
let u = new User("Jerry Chen");
u.show();   // undefined

function Person(name) {
    this.name = name;
}
Person.prototype.show = function() {
    function test() {
        //非严格模式输出 Window
        console.log(this);
    }
    test();
};
let obj = new Person("caffreygo");
obj.show();  // window
```

## 静态访问

### 静态属性

静态属性就是把class看作对象，直接在class对象上添加对象的属性，也通过class直接访问

🔰 基于ES5构造函数的原理

```js
function User() {}
User.site = "baidu.com";

const u = new User();
console.log(u.site);    // undefiend
console.log(User.site); // baidu.com
```

🔰 通过static关键字声明静态属性

```js
class Request {
    static HOST = "https://www.baidu.com";

    query(api) {
        return Request.HOST + "/" + api;
    }
}

let request = new Request();
console.log(request)
console.dir(Request)
```

![](./img/class/4.png)

### 静态方法

 📌 一般来讲方法**不需要对象属性参与计算**就可以定义为静态方法

🔰 下面是静态方法**实现原理**

```js
function User() {
  this.show = function() {
    return "this is a object function";
  };
}
User.show = function() {
  return "welcome to houdunren";
};
const u = new User();
console.dir(u.show());    //this is a object function
console.dir(User.show()); // welcome to houdunren
```

🔰 在 `class` 内声明的方法前使用 `static` 定义的方法即是静态方法

```js
class User {
  constructor(name) {
    this.name = name;
  }
  static create(name) {
    return new User(name);    // return new this(name);
  }
}
```

🔰 下面使用静态方法在课程类中的使用

```js
const data = [
  { name: "js", price: 100 },
  { name: "mysql", price: 212 },
  { name: "vue.js", price: 98 }
];
class Lesson {
  constructor(data) {
    this.model = data;
  }
  get price() {
    return this.model.price;
  }
  get name() {
    return this.model.name;
  }
  //批量生成对象
  static createBatch(data) {
    return data.map(item => new Lesson(item));
  }
  //最贵的课程
  static MaxPrice(collection) {
    return collection.sort((a, b) => b.price - a.price)[0];
  }
}
const lessons = Lesson.createBatch(data);
console.log(lessons);
console.log(Lesson.MaxPrice(lessons).name);   // mysql
```

![](./img/class/5.png)

## 访问器

📌 使用访问器可以对对象的属性进行访问控制

- 使用访问器可以管控属性，有效的防止属性随意修改
- 访问器就是在函数前加上 `get/set`修饰，操作属性时不需要加函数的扩号，直接用函数名

```js
class User {
  constructor(name) {
    this.data = { name };
  }
  get name() {        // getter
    return this.data.name;
  }
  set name(value) {   // setter
    if (value.trim() == "") throw new Error("invalid params");
    this.data.name = value;
  }
}
let u = new User("Jerry Chen");
u.name = "caffreygo";
console.log(u.name);  // caffreygo
```

## 访问控制

### public

📌 `public` 指不受保护的属性，在类的内部与外部都可以访问到

```js
class User {
  url = "baidu.com";
  constructor(name) {
    this.name = name;
  }
}
let u = new User("Jerry Chen");
console.log(u.name, u.url);  // Jerry Chen baidu.com
```

### protected

📌 protected是受保护的属性修释，不允许外部直接操作，但可以继承后在类内部访问，有以下几种方式定义

#### 命名保护

📌 将属性定义为以 `_` 开始，来告诉使用者这是一个**私有属性**，请不要在外部使用。

- 外部修改私有属性时可以使用访问器 `setter` 操作
- 但这只是提示，用户如果要改也没办法，我们可以为setter加上校验规则
- 继承时可以使用

```js
class Common {
    _host = "https://baidu.com";
	set host(url) {
        if (!/^https:\/\//i.test(url)) {
            throw new Error("网址错误");
        }
        this._host = url;
    }
}
class Article extends Common {
    lists() {
        return `${this._host}/article`;
    }
}
let article = new Article();
console.log(article.lists()); //https://baidu.com/article
article.host = "https://google.com";
console.log(article.lists()); //https://google.com/article
```

#### Symbol

下面是使用 `Symbol`定义私有访问属性，即在外部通过查看对象结构无法获取的属性

```js
const protecteds = Symbol();
class Common {
  constructor() {
    this[protecteds] = {};
    this[protecteds].host = "https://baidu.com";
  }
  set host(url) {
    if (!/^https?:/i.test(url)) {
      throw new Error("非常网址");
    }
    this[protecteds].host = url;
  }
  get host() {
    return this[protecteds].host;
  }
}
class User extends Common {
  constructor(name) {
    super();
    this[protecteds].name = name;
  }
  get name() {
    return this[protecteds].name;
  }
}
let u = new User("Jerry Chen");
u.host = "https://google.com";

console.log(u.name);   // Jerry Chen
console.log(u.host);   // https://google.com
```

#### WeakMap

**WeakMap** 是一组 对象键/值 对的集，下面利用`WeakMap`类型特性定义私有属性

```js
const protecteds = new WeakMap();
class Common {
  constructor() {
    protecteds.set(this, {
      host: "https://baidu.com",
      port: "80"
    });
  }
  set host(url) {
    if (!/^https:\/\//i.test(url)) {
      throw new Error("网址错误");
    }
    protecteds.set(this, { ...protecteds.get(this), host: url });
  }
}
class Article extends Common {
  constructor() {
    super();
  }
  lists() {
    return `${protecteds.get(this).host}/article`;
  }
}
let article = new Article();
console.log(article.lists()); // https://baidu.com/article
article.host = "https://google.com";
console.log(article.lists()); // https://google.com/article
```

## 继承

### 属性继承

::: tip 属性继承的原型如下

1. 初始化一个空对象
2. 将空对象指向User的this
3. 将User和Admin的属性分别添加到对象当中

::: 

```js
function User(name) {
  this.name = name;
}
function Admin(name) {
  User.call(this, name);
}
let u = new Admin("Jerry Chen");
console.log(u);  // { name: "Jerry Chen" }
```

这就解释了为什么在子类构造函数中要先执行`super`

```js
class User {
  constructor(name) {
    this.name = name;
  }
}
class Admin extends User {
  constructor(name) {
    super(name);
  }
}
```

### 继承原理

```js
class User {
  show() {
    console.log("user.show");
  }
}
class Admin extends User {
  info() {
    this.show();
  }
}
let a = new Admin();
```

![](./img/class/6.png)

### 方法继承

📌 原生的继承主要是操作原型链，实现起来比较麻烦，使用 `class` 就要简单的多了。

- 继承时必须在子类构造函数中调用 super() 执行父类构造函数
- super.show() 执行父类方法

下面是子类继承了父类的方法`show`

```js
class Person {
  constructor(name) {
    this.name = name;
  }
  show() {
    return `你好: ${this.name}`;
  }
}
class User extends Person {
  constructor(name) {
    super(name);
  }
  run() {
    return super.show();
  }
}
const u = new User("Jerry Chen");
u.run();   // "你好: Jerry Chen"
```

✔️ 可以使用 `extends` 继承表达式返回的类

```js
function controller() {
  return class {
    show() {
      console.log("user.show");
    }
  };
}
class Admin extends controller() {
  info() {
    this.show();
  }
}
```

