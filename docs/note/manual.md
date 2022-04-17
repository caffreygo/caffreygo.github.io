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

```js
// 只考虑对象类型
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

基础版：只考虑普通对象属性，不考虑内置对象和函数。

```js
function deepClone(obj) {
    if (typeof obj !== 'object') return;
    var newObj = obj instanceof Array ? [] : {};
    for (var key in obj) {
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