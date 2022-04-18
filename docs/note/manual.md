# 手写常用方法

## 数据类型判断

🔥 typeof 可以正确识别：Undefined、Boolean、Number、String、Symbol、Function 等类型的数据，但是对于其他的都会认为是 object，比如 Null、Date 等，所以通过 typeof 来判断数据类型会不准确。

```js
typeof undefined  // 'undefined'
typeof Symbol.for("a")  // 'symbol'
typeof (()=> 1)  // 'function'
typeof null  // 'object'
typeof {}  // 'object'

Object.prototype.toString.call(1)  // '[object Number]'
```

🚀 实现一个类型判断方法：

```js
function typeOf(param) {
  return Object.prototype.toString.call(param).slice(8, -1);
}

typeOf("")  // 'String'
typeOf(Symbol())  // 'Symbol'
typeOf(()=> 1)  // 'Function'
typeOf({})  // 'Object'
typeOf(null)  // 'Null'
typeOf(undefined)  // 'Undefined'
typeOf(new Date())  // 'Date'
```

## 继承

> 🌐 [原型和原型链 (opens new window)](https://www.ijerrychen.com/javascript/prototype.html)

### 原型链继承

> 通过构造函数的prototype指向原型对象

```js
function Person() {
  this.colors = ['yellow', 'white']
}
Person.prototype.getColors = function() {
  return this.color;
}

function Doctor() {};
Doctor.prototype = new Person();

// ----------Testing----------
const doc = new Doctor();
doc.colors.push('blue');
const doc1 = new Doctor();

console.log(doc1.colors);  // ['yellow', 'white', 'black']
doc instanceof(Doctor);  // true
doc instanceof(Person);  // true
```

::: tip 原型链继承：

- 🚨 原型中包含的引用类型属性将被所有实例共享；
- 🚨 子类在实例化的时候不能给父类构造函数传参；

::: 

### 借用构造函数实现继承

```js
function Person(name) {
    this.name = name;
    this.getName = function() {
        return this.name;
    }
}
function Lawyer(name) {
    // 为Lawyer实例对象添加Person的属性
    Person.call(this, name);
}
Lawyer.prototype = new Person();

// ----------Testing----------
const ll = new Lawyer("Michael")
```

::: tip 借用构造函数实现继承：

- 🎉 由于每次实例化子类都重新创建了一次属性，所以不再存在引用类型共享的问题
- 🎉 通过`call`方法调用父类构造器，允许在实例化的时候往父类传参

- 🚨 子类实例每次都要创建一次方法，内存开销大

::: 

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/manual/constructor.png)

### 组合继承

🚀 组合继承结合了原型链和盗用构造函数，将两者的优点集中了起来。基本的思路是使用原型链继承原型上的属性和方法，而通过盗用构造函数继承实例属性。这样既可以把方法定义在原型上以实现重用，又可以让每个实例都有自己的属性。

```js
function Animal(name) {
    this.name = name;
    this.colors = ['black', 'white'];
}
Animal.prototype.getName = function() {
    return this.name;
}
function Dog(name, age) {
    // 子类实例上声明父类实例的属性
    Animal.call(this, name);
    this.age = age;
}
// 原型继承，获得父类原型对象方法的访问能力
Dog.prototype = new Animal();
Dog.prototype.constructor = Dog;

// ----------Testing----------
let dog1 = new Dog('奶昔', 2);
dog1.colors.push('brown');
// { name: "哈赤", colors: ["black", "white", "brown"], age: 1 }

let dog2 = new Dog('哈赤', 1);
// { name: "哈赤", colors: ["black", "white"], age: 1 }
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/manual/composition.png)

### ✅ 寄生式组合继承

🔥 组合继承已经相对完善了，但还是存在问题，它的问题就是调用了 2 次父类构造函数，第一次是在 new Animal()，第二次是在 Animal.call() 这里。

🚀 所以解决方案就是不直接调用父类构造函数给子类原型赋值，而是通过创建空函数 F 获取父类原型的副本，区别如下：

```diff
- Dog.prototype =  new Animal()
- Dog.prototype.constructor = Dog

+ function F() {}
+ F.prototype = Animal.prototype
+ let f = new F()
+ f.constructor = Dog
+ Dog.prototype = f
```

稍微封装下上面添加的代码后：

```js
function object(o) {
    function F() {}
    F.prototype = o
    return new F()
}
function inheritPrototype(child, parent) {
    let prototype = object(parent.prototype)
    prototype.constructor = child
    child.prototype = prototype
}
inheritPrototype(Dog, Animal)
```

🎉 其实这就是`Object.create`方法的实现，可以基于组合继承的代码改成最简单的寄生式组合继承：

```diff
- Dog.prototype =  new Animal()
- Dog.prototype.constructor = Dog

+ Dog.prototype =  Object.create(Animal.prototype)
+ Dog.prototype.constructor = Dog
```

最终代码

```js
function Animal(name) {
    this.name = name;
    this.colors = ['black', 'white'];
}
Animal.prototype.getName = function() {
    return this.name;
}
function Dog(name, age) {
    // 子类实例上声明父类实例的属性
    Animal.call(this, name);
    this.age = age;
}
// 原型继承，获得父类原型对象方法的访问能力
Dog.prototype = Object.create(Animal.prototype)；
Dog.prototype.constructor = Dog;

let dog1 = new Dog('奶昔', 2);
dog1.colors.push('brown');
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/manual/parasiticCombination.png)

### ✅ class 实现继承 

> 🌐 [ES6 class的继承原理 (opens new window)](https://www.ijerrychen.com/javascript/class.html#%E5%B1%9E%E6%80%A7%E7%BB%A7%E6%89%BF)

```js
class Animal {
    constructor(name) {
        this.name = name
    }
    getName() {
        return this.name
    }
}
class Dog extends Animal {
    constructor(name, age) {
        super(name)
        this.age = age
    }
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/manual/class.png)

## 数组去重

ES5 利用indexOf方法返回寻第一个匹配下标的特性

```js
const unique2 = (arr) => arr.filter((item, index, array)=> array.indexOf(item) === index);
```

> 🌐 [ES6 Set (opens new window)](https://www.ijerrychen.com/javascript/set.html)

```js
const unique1 = (arr) => [...new Set(arr)];
```

## 数组扁平化

🔖 数组扁平化就是将 [1, [2, [3]]] 这种多层的数组拍平成一层 [1, 2, 3]。`Array.prototype.flat` 可以直接将多层数组拍平成一层：

```js
[1, [2, [3]]].flat(2);  // [1, 2, 3] 参数2表示铺平的层级
```

ES5 实现：递归

```js
function flatten(arr) {
    var result = [];
    for (var i = 0, len = arr.length; i < len; i++) {
        if (Array.isArray(arr[i])) {
            result = result.concat(flatten(arr[i]))
        } else {
            result.push(arr[i])
        }
    }
    return result;
}

// ----------Testing----------
flatten([1,2,[3,4, [5]]])  // [1, 2, 3, 4, 5]
```

ES6 实现：

```js
function flatten(arr) {
    while (arr.some(item => Array.isArray(item))) {
        arr = [].concat(...arr);
    }
    return arr;
}

// ----------Testing----------
flatten([1,2,[3,4, [5]]])  // [1, 2, 3, 4, 5]
```

## 深浅拷贝

### 浅拷贝

> 只处理第一层数据，对对象类型数据进行拷贝
>
> 🌐 [hasOwnProperty (opens new window)](https://www.ijerrychen.com/javascript/object.html#%E6%A3%80%E6%B5%8B%E5%B1%9E%E6%80%A7)

```js
function shallowCopy(obj) {
    if (typeof obj !== 'object') return
    
    let newObj = obj instanceof Array ? [] : {}
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key] = obj[key]
        }
    }
    return newObj
}
```

### 深拷贝

基础版：只考虑普通对象属性，不考虑内置对象和函数。(递归浅拷贝)

```js
function deepClone(obj) {
    if (typeof obj !== 'object') return;
    const newObj = obj instanceof Array ? [] : {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key];
        }
    }
    return newObj;
}
```

复杂版深拷贝：基于简单版的基础上，还考虑了内置对象比如 Date、RegExp 等对象和函数以及解决了循环引用的问题。

```js
const isObject = (target) => (typeof target === "object" || typeof target === "function") && target !== null;

function deepClone(target, map = new WeakMap()) {
    if (map.get(target)) {
        return target;
    }
    // 获取当前值的构造函数：获取它的类型
    let constructor = target.constructor;
    // 检测当前对象target是否与正则、日期格式对象匹配
    if (/^(RegExp|Date)$/i.test(constructor.name)) {
        // 创建一个新的特殊对象(正则类/日期类)的实例
        return new constructor(target);  
    }
    if (isObject(target)) {
        map.set(target, true);  // 为循环引用的对象做标记
        const cloneTarget = Array.isArray(target) ? [] : {};
        for (let prop in target) {
            if (target.hasOwnProperty(prop)) {
                cloneTarget[prop] = deepClone(target[prop], map);
            }
        }
        return cloneTarget;
    } else {
        return target;
    }
}
```

## 事件总线(发布订阅模式)

```js
class EventEmitter {
  constructor() {
    this.cache = {}
  }
  on(name, fn) {
    if (this.cache[name]) {
      this.cache[name].push(fn)
    } else {
      this.cache[name] = [fn]
    }
  }
  off(name, fn) {
    let tasks = this.cache[name]
    if (tasks) {
      const index = tasks.findIndex(f => f === fn || f.callback === fn)
      if (index >= 0) {
        tasks.splice(index, 1)
      }
    }
  }
  emit(name, once = false, ...args) {
    if (this.cache[name]) {
      // 创建副本，如果回调函数内继续注册相同事件，会造成死循环
      let tasks = this.cache[name].slice()
      for (let fn of tasks) {
        fn(...args)
      }
      if (once) {
        delete this.cache[name]
      }
    }
  }
}

// 测试
let eventBus = new EventEmitter()
let fn1 = function(name, age) {
  console.log(`${name} ${age}`)
}
let fn2 = function(name, age) {
  console.log(`hello, ${name} ${age}`)
}
eventBus.on('aaa', fn1)
eventBus.on('aaa', fn2)
eventBus.emit('aaa', false, '布兰', 12)
// '布兰 12'
// 'hello, 布兰 12'
```

## 解析 URL 参数为对象

```js
function parseParam(url) {
  const paramsStr = /.+\?(.+)$/.exec(url)[1]; // 将 ? 后面的字符串取出来
  const paramsArr = paramsStr.split('&'); // 将字符串以 & 分割后存到数组中
  let paramsObj = {};
  // 将 params 存到对象中
  paramsArr.forEach(param => {
    if (/=/.test(param)) { // 处理有 value 的参数
      let [key, val] = param.split('='); // 分割 key 和 value
      val = decodeURIComponent(val); // 解码
      val = /^\d+$/.test(val) ? parseFloat(val) : val; // 判断是否转为数字

      if (paramsObj.hasOwnProperty(key)) { // 如果对象有 key，则添加一个值
        paramsObj[key] = [].concat(paramsObj[key], val);
      } else { // 如果对象没有这个 key，创建 key 并设置值
        paramsObj[key] = val;
      }
    } else { // 处理没有 value 的参数
      paramsObj[param] = true;
    }
  })

  return paramsObj;
}
```

