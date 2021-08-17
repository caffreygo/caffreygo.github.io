# 原型和原型链

JavaScript是一个基于原型继承的，ES6的class其实也是原型继承

- 对象具有`__proto__`属性，指向**原型对象**
- 函数具有`prototype`属性，指向**原型对象**; 同时函数作为对象，也有`__proto__`属性
- 原型对象具有constructor属性指向构造函数



- 原型对象上的属性和方法，将被实例对象共享

- 构造函数内的属性和方法，在实例化新对象的时候各自创建（占内存）

  ```js
  Person.prototype.__proto__ == Object.prototype    // true
  Object.prototype.__proto__ == null     // true
  
  function User(){}
  User.prototype.constructor == User
  ```

## 原型

![原型](./img/prototype/yuanxing.png)

## 原型链

  <img src="D:/learn-blog/docs/javascript/img/prototype.jpg" style="zoom: 20%;" />

![原型链](./img/prototype/yuanxinglian2.png)

## getPrototypeOf

- 早期`Object.create()`能够指定一个对象的原型，生成一个新的实例，但是我们通过对象获取其原型对象
- 浏览器厂商在实例上添加`__proto__`来实现对象访问原型的功能
- 后来`getPrototypeOf`、`setPrototypeOf`    API让我们实现获取和设置原型

```js
const User = function(name) {
    this.name = name
}

// 直接重写构造函数的prototype，记住要制定constructor属性
User.prototype ={
    constructor: User,
    show() {
        console.log(this.name)
    }
}

let x = new User('x man');    // x man
console.log(x)

function createByObject(obj, ...args){
    //获取对象的原型，得到其对应的构造函数
    const constructor = Object.getPrototypeOf(obj).constructor;
    //通过构造函数生成与obj对象相同原型的实例
    return new constructor(...args)
}

let y = createByObject(x, "y man");
console.log(y)      // y man
```

## 原型方法借用

- `function.call(this, Arg, arg1, arg2, ...)` 
- `func.apply(thisArg, [argsArray])` 
- call、bind、apply都是`Function.prototype`上方法

```html
<body>
    <div>
        <button>btn1</button>
        <button>btn2</button>
        <button class="red">btn3</button>
    </div>
    <script>
        let btns = document.querySelectorAll("button");
        btns = Array.prototype.filter.call(btns, item=> item.hasAttribute('class'))
        // btns =[].filter.call(btns, item=> item.hasAttribute('class'))
        // btns =[].filter.apply(btns, [item=> item.hasAttribute('class')])
        console.log(btns)              // [button.red]
    </script>
</body>
```

- filter方法内部需要用到`this`，我们需要通过call或者apply将context传入
- `Math.max`这种可以直接使用`Math.max(1,2,3,4,2)`，或者`Math.max.call(null,1,2,3,4)`

```html
<!--  不要这样干！！  -->
<body>
	<button onclick="this.hide()">
        Hide this btn
    </button>
</body>

<script>
	Object.prototype.hide = function() {
		this.style.display = "none"
    }
</script>
```

## `__proto__`

- 这是一个浏览器厂商实现的非标准属性

- 该属性只能被显示设置为对象，因为`Object.prototype`上是getter和setter，setter限制了这个操作

- 如果强制要把其设置为基本类型：

  ```js
  const obj = Object.create(null)
  // 此时obj.__proto__为undefined
  obj.__proto__ = 1
  ```

## constructor

```js
function User () {}
User.prototype.show = function(){ console.log("User show") }

function Admin () {}
Admin.prototype = Object.create(User.prototype)
Admin.prototype.role = "Admin"

User.prototype.constructor == User   // true
Admin.prototype.constructor == User  // true
```

- `Admin`构造函数的原型指向`User.prototype`, Admin继承了User

- `Admin`以`User.prototype`作为原型，Admin自身没有constructor属性，但是`Admin.prototype`能够拿到`User.prototype`的方法和属性，就包括了constructor

- 直接改变原型对象的继承会**丢失**constructor ,需要补充上这个属性，并且这是一个**不可枚举**的属性，否则将会出现在for in遍历中

  ```js
  for(let key in new Admin()) {
      console.log(key)  // role constructor show
  }
  
  Object.defineProperty(Admin.prototype,"constructor", {
      value: Admin,
      enumerable: false
  })
  
  for(let key in new Admin()) {
      console.log(key)  // role show
  }
  ```

## ES5的继承

继承是**原型**的继承，只要保留原来构造函数的原型，将构造函数的原型指向`Target.prototype`即可

1. 构造函数的原型是个对象`Teacher.prototype`，这个对象的原型就是`Object.prototype`。当我们显示**修改**这个便可以实现原型的继承

   ```js
   Teacher.prototype.__proto__ == Object.prototype  // true
   
   // Teacher继承Person,获得Person上的属性和方法
   Teacher.prototype.__proto__ = Person.prototype
   ```

2. ✅ 通过`Object.create`**新建**具有指定原型的**空对象**，需要指定constructor（最好define enumerable为false）

   这时候Teacher的原型方法需要再定义，因为原来的原型已经被替换了

   ```js
   Teacher.prototype = Object.create(Person.prototype)
   Teacher.prototype.constructor = Teacher
   Teacher.prototype.show = function () { 
   	// ...
   }
   ```

## in和instanceof

- `in`可以判断属性是否在对象或者其**原型**上  

  ```js
  let a= {name: 'hello'};
  Object.prototype.age = 24;
  
  console.log('name' in a) // true
  console.log('age' in a)  // true
  ```

- `Object.hasOwnProperty`指示对象**自身**属性中是否具有指定的属性

```js
let a= {name: 'hello'};
Object.prototype.age = 24;

for(const key in a) {
    console.log("in : " + key);
    if(Object.hasOwnProperty(key)){
        console.log("own : " + key)
    }
}

// in : name
// own : name
// in : age
```

## Tab构造函数

```js
//继承工厂
function extend(sub, sup) {
    sub.prototype = Object.create(sup.prototype);
    sub.prototype.constructor = sub;
}

//动作类
function Animation() { }
Animation.prototype.show = function () {
    this.style.display = "block";
};
//隐藏所有元素
Animation.prototype.hide = function () {
    this.style.display = "none";
};
//必变元素集合背景
Animation.prototype.background = function (color) {
    this.style.background = color;
};

//选项卡类
function Tab(tab) {
    this.tab = tab;
    this.links = null;
    this.sections = null;
}
extend(Tab, Animation);
Tab.prototype.run = function () {
    this.links = this.tab.querySelectorAll("a");
    this.sections = this.tab.querySelectorAll("section");
    this.bindEvent();
    this.action(0);
};
//绑定事件
Tab.prototype.bindEvent = function () {
    this.links.forEach((el, i) => {
        el.addEventListener("click", () => {
            this.reset();
            this.action(i);
        });
    });
};
//点击后触发动作
Tab.prototype.action = function (i) {
    this.background.call(this.links[i], "#e67e22");
    this.show.call(this.sections[i]);
};
//重置link与section
Tab.prototype.reset = function () {
    this.links.forEach((el, i) => {
        this.background.call(el, "#95a5a6");
        this.hide.call(this.sections[i]);
    });
};
```

## 