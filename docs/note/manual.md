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

### 双层for循环

```js
function distinct(arr) {
  for (let i = 0, len = arr.length; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      if (arr[i] == arr[j]) {
        arr.splice(j, 1)
        // splice 会改变数组长度，所以要将数组长度 len 和下标 j 减一
        len--
        j--
      }
    }
  }
  return arr
}
```

分析：双重 for 循环是比较笨拙的方法，它实现的原理很简单：先定义一个包含原始数组第一个元素的数组，然后遍历原始数组，将原始数组中的每个元素与新数组中的每个元素进行比对，如果不重复则添加到新数组中，最后返回新数组；因为它的时间复杂度是`O(n^2)`，如果数组长度很大，`效率会很低`

### Array.filter() 加 indexOf

ES5 利用indexOf方法返回寻第一个匹配下标的特性

```js
const unique2 = (arr) => arr.filter((item, index, array)=> array.indexOf(item) === index);
```

### ES6 中的 Set 去重

> 🌐 [ES6 Set (opens new window)](https://www.ijerrychen.com/javascript/set.html)

```js
const unique1 = (arr) => [...new Set(arr)];
```

### Object 键值对

> 时间复杂度最小，但是空间复杂度较大

```javascript
function distinct(array) {
  var obj = {}
  return array.filter(function(item, index, array) {
    return obj.hasOwnProperty(typeof item + item)
      ? false
      : (obj[typeof item + item] = true)
  })
}
```

这种方法是利用一个空的 Object 对象，我们把数组的值存成 Object 的 key 值，比如 `Object[value1] = true`，在判断另一个值的时候，如果 Object[value2]存在的话，就说明该值是重复的,但是最后请注意这里`obj[typeof item + item] = true`没有直接使用`obj[item]`,是因为 因为 123 和 '123' 是不同的，直接使用前面的方法会判断为同一个值，因为`对象的键值只能是字符串`，所以我们可以使用 `typeof item + item` 拼成字符串作为 key 值来避免这个问题。

## 数组扁平化

🔖 数组扁平化就是将 [1, [2, [3]]] 这种多层的数组拍平成一层 [1, 2, 3]。`Array.prototype.flat` 可以直接将多层数组拍平成一层：

```js
[1, [2, [3]]].flat(2);  // [1, 2, 3] 参数2表示铺平的层级
```

ES5 实现：递归即可

```js
function flat(arr) {
    let result = []
    for(let i = 0; i<arr.length; i++) {
        const item = arr[i]
        if(Array.isArray(item)) {
            result = result.concat(flat(item))
        }else {
            result.push(item)
        }
    }
    return result
}

// ----------Testing----------
flat([1,2,[3,4, [5]]])  // [1, 2, 3, 4, 5]
```

ES6 实现

```js
// [].concat(1,2,3,[4,5])   [1, 2, 3, 4, 5]
// concat的参数是以逗号分分隔的任何数据类型，一维数组会直接被解构推入到新数组当中
function flat(arr) {
    while(arr.some(i=> Array.isArray(i))) {
        arr = [].concat(...arr)
    }
    return arr
}
}

// ----------Testing----------
flat([1,2,[3,4, [5]]])  // [1, 2, 3, 4, 5]
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

## 字符串模板

```js
function render(template, data) {
    const reg = /\{\{(\w+)\}\}/; // 模板字符串正则
    if (reg.test(template)) { // 判断模板里是否有模板字符串
        const name = reg.exec(template)[1]; // 查找当前模板里第一个模板字符串的字段
        template = template.replace(reg, data[name]); // 将第一个模板字符串渲染
        return render(template, data); // 递归的渲染并返回渲染后的结构
    }
    return template; // 如果模板没有模板字符串直接返回
}
```

测试：

```js
let template = '我是{{name}}，年龄{{age}}，性别{{sex}}';
let person = {
    name: '布兰',
    age: 12
}
render(template, person); // 我是布兰，年龄12，性别undefined
```

## 图片懒加载

与普通的图片懒加载不同，如下这个多做了 2 个精心处理：

- 图片全部加载完成后移除事件监听；
- 加载完的图片，从 imgList 移除；

```diff
let imgList = [...document.querySelectorAll('img')]
let length = imgList.length

// 修正错误，需要加上自执行
- const imgLazyLoad = function() {
+ const imgLazyLoad = (function() {
    let count = 0
    
   return function() {
        let deleteIndexList = []
        imgList.forEach((img, index) => {
            let rect = img.getBoundingClientRect()
            if (rect.top < window.innerHeight) {
                img.src = img.dataset.src
                deleteIndexList.push(index)
                count++
                if (count === length) {
                    document.removeEventListener('scroll', imgLazyLoad)
                }
            }
        })
        imgList = imgList.filter((img, index) => !deleteIndexList.includes(index))
   }
- }
+ })()

// 这里最好加上防抖处理
document.addEventListener('scroll', imgLazyLoad)；
```

参考：[图片懒加载](https://juejin.cn/post/6844903856489365518#heading-19)

## 函数防抖

触发高频事件 N 秒后只会执行一次，如果 N 秒内事件再次触发，则会重新计时。

简单版：函数内部支持使用 this 和 event 对象；

```js
function debounce(func, wait) {
    var timeout;
    return function () {
        var context = this;
        var args = arguments;
        clearTimeout(timeout)
        timeout = setTimeout(function(){
            func.apply(context, args)
        }, wait);
    }
}
```

使用：

```js
var node = document.getElementById('layout')
function getUserAction(e) {
    console.log(this, e)  // 分别打印：node 这个节点 和 MouseEvent
    node.innerHTML = count++;
};
node.onmousemove = debounce(getUserAction, 1000)
```

最终版：除了支持 this 和 event 外，还支持以下功能：

- 支持立即执行；
- 函数可能有返回值；
- 支持取消功能；

```js
function debounce(func, wait, immediate) {
    var timeout, result;
    
    var debounced = function () {
        var context = this;
        var args = arguments;
        
        if (timeout) clearTimeout(timeout);
        if (immediate) {
            // 如果已经执行过，不再执行
            var callNow = !timeout;
            timeout = setTimeout(function(){
                timeout = null;
            }, wait)
            if (callNow) result = func.apply(context, args)
        } else {
            timeout = setTimeout(function(){
                func.apply(context, args)
            }, wait);
        }
        return result;
    };

    debounced.cancel = function() {
        clearTimeout(timeout);
        timeout = null;
    };

    return debounced;
}
```

使用：

```js
var setUseAction = debounce(getUserAction, 10000, true);
// 使用防抖
node.onmousemove = setUseAction

// 取消防抖
setUseAction.cancel()
```

参考：[JavaScript专题之跟着underscore学防抖](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fmqyqingfeng%2FBlog%2Fissues%2F22)

## 函数节流

触发高频事件，且 N 秒内只执行一次。

简单版：使用时间戳来实现，立即执行一次，然后每 N 秒执行一次。

```js
function throttle(func, wait) {
    var context, args;
    var previous = 0;

    return function() {
        var now = +new Date();
        context = this;
        args = arguments;
        if (now - previous > wait) {
            func.apply(context, args);
            previous = now;
        }
    }
}
```

最终版：支持取消节流；另外通过传入第三个参数，options.leading 来表示是否可以立即执行一次，opitons.trailing 表示结束调用的时候是否还要执行一次，默认都是 true。 注意设置的时候不能同时将 leading 或 trailing 设置为 false。

```js
function throttle(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
        previous = options.leading === false ? 0 : new Date().getTime();
        timeout = null;
        func.apply(context, args);
        if (!timeout) context = args = null;
    };

    var throttled = function() {
        var now = new Date().getTime();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
    };
    
    throttled.cancel = function() {
        clearTimeout(timeout);
        previous = 0;
        timeout = null;
    }
    return throttled;
}
```
