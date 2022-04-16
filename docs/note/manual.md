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

> [原型和原型链 (opens new window)](https://www.ijerrychen.com/javascript/prototype.html)

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

![](/Users/chenjinrui/code/personal/static/blog/manual/contructorInherit.png)

### 组合继承

组合继承结合了原型链和盗用构造函数，将两者的优点集中了起来。基本的思路是使用原型链继承原型上的属性和方法，而通过盗用构造函数继承实例属性。这样既可以把方法定义在原型上以实现重用，又可以让每个实例都有自己的属性。

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

![](/Users/chenjinrui/code/personal/static/blog/manual/inherit.png)