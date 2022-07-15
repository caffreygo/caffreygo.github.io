# JavaScript 设计模式

## 单例模式

::: tip 保证一个类仅有一个实例，并提供一个访问它的全局访问点。

单例模式是一种常用的模式，有一些对象我们往往只需要一个，比如线程池、全局缓存、浏览器中的window对象等。在JavaScript开发中，单例模式的用途同样非常广泛。试想一下，当我们单击登录按钮的时候，页面中会出现一个登录浮窗，而这个登录浮窗是唯一的，无论单击多少次登录按钮，这个浮窗都只会被创建一次，那么这个登录浮窗就适合用单例模式来创建。

:::

### 单例模式的实现

:::: code-group
::: code-group-item 基础单例模式 1

```js
var Singleton = function( name ){
    this.name = name;
    this.instance = null;
};

Singleton.prototype.getName = function(){
    alert ( this.name );
};

Singleton.getInstance = function( name ){
    if ( ! this.instance ){
        this.instance = new Singleton( name );
    }
    return this.instance;
};

var a = Singleton.getInstance( 'sven1' );
var b = Singleton.getInstance( 'sven2' );

alert ( a === b );    // true
```

`Singleton` 类的使用者必须知道这是一个单例类，跟以往通过`new XXX`的方式来获取对象不同，这里偏要使用 `Singleton.getInstance` 来获取对象。

:::
::: code-group-item 基础单例模式 2

```js
var Singleton = function( name ){
    this.name = name;
};

Singleton.prototype.getName = function(){
    alert ( this.name );
};

Singleton.getInstance = (function(){
    var instance = null;
    return function( name ){
        if ( ! instance ){
            instance = new Singleton( name );
        }
        return instance;
    }
})();
```

:::
::: code-group-item 透明单例模式

```js
const CreateDiv = (function () {
    let instance = null;
    const CreateDiv = function (html) {
        if (instance) {
            return instance;
        }
        this.html = html;
        this.init();
        return (instance = this);
    };

    CreateDiv.prototype.init = function () {
        const div = document.createElement("div");
        div.innerHTML = this.html;
        document.body.appendChild(div);
    };

    return CreateDiv;
})();

const a = new CreateDiv("hello");
const b = new CreateDiv("world");

console.log(a === b);
```

用户从这个类中创建对象的时候，可以**像使用其他任何普通类一样**。

`CreateDiv` 函数内既要保证实例的唯一，还要负责对象创建和执行 `init` ，这不符合“单一职责原则”的概念。

:::

::: code-group-item ✅ 引入代理类

```js{12-20}
const CreateDiv = function (html) {
    this.html = html;
    this.init();
};

CreateDiv.prototype.init = function () {
    const div = document.createElement("div");
    div.innerHTML = this.html;
    document.body.appendChild(div);
};

const ProxySingletonCreateDiv = (function () {
    let instance = null;
    return function (html) {
        if (!instance) {
            instance = new CreateDiv(html);
        }
        return instance;
    };
})();

const a = new ProxySingletonCreateDiv("hello");
const b = new ProxySingletonCreateDiv("world");

console.log(a === b);
```

`CreateDiv` 变成了一个普通的类，它跟 `proxySingletonCreateDiv` 组合起来可以达到单例模式的效果。

> 本例是缓存代理的应用之一

:::
::::

### JS 中的单例模式

::: tip 

-  JavaScript 其实是一门无类（class-free）语言，也正因为如此，生搬单例模式的概念并无意义。在 JavaScript 中创建对象的方法非常简单，既然我们只需要一个“唯一”的对象，为什么要为它先创建一个“类”呢？这无异于穿棉衣洗澡，传统的单例模式实现在 JavaScript中 并不适用。
- 全局变量只提供一个实例，并且提供全局访问。但是它并不是单例模式，全局变量存在很多问题，它很容易造成命名空间污染。在大中型项目中，如果不加以限制和管理，程序中可能存在很多这样的变量。JavaScript 中的变量也很容易被不小心覆盖。

:::

:::: code-group
::: code-group-item 使用命名空间

```js
var namespace1 = {
    a: function(){
        alert (1);
    },
    b: function(){
        alert (2);
    }
};
```

也可以动态地创建**命名空间**：

```js
var MyApp = {};

MyApp.namespace = function( name ){
    var parts = name.split( '.' );
    var current = MyApp;
    for ( var i in parts ){
        if ( ! current[ parts[ i ] ] ){
            current[ parts[ i ] ] = {};
        }
        current = current[ parts[ i ] ];
    }
};

MyApp.namespace( 'event' );
MyApp.namespace( 'dom.style' );

console.dir( MyApp );

// 上述代码等价于：

var MyApp = {
    event: {},
    dom: {
        style: {}
    }
};
```

:::
::: code-group-item 使用闭包封装私有变量

```js
var user = (function(){
    var __name = 'sven',
        __age = 29;

    return {
        getUserInfo: function(){
            return __name + '-' + __age;
        }
    }

})();
```

:::
::::

### 惰性单例

惰性单例指的是在需要的时候才创建对象实例。

:::: code-group
::: code-group-item 基于类的惰性单例

```js
Singleton.getInstance = (function(){
    var instance = null;
    return function( name ){
        if ( ! instance ){
            instance = new Singleton( name );
        }
        return instance;
    }
})();
```

:::
::: code-group-item JS 惰性单例

```js
var createLoginLayer = (function(){
    var div;
    return function(){
        if ( ! div ){
            div = document.createElement( 'div' );
            div.innerHTML = ’我是登录浮窗’;
            div.style.display = 'none';
            document.body.appendChild( div );
        }

        return div;
    }
})();

document.getElementById( 'loginBtn' ).onclick = function(){
    var loginLayer = createLoginLayer();
    loginLayer.style.display = 'block';
};
```

:::
::: code-group-item ✅ 单一职责惰性单例

```js{1-6}
var getSingle = function( fn ){
    var result;
    return function(){
        return result || ( result = fn .apply(this, arguments ) );
    }
};

var createLoginLayer = function(){
    var div = document.createElement( 'div' );
    div.innerHTML = ’我是登录浮窗’;
    div.style.display = 'none';
    document.body.appendChild( div );
    return div;
};

var createSingleLoginLayer = getSingle( createLoginLayer );

document.getElementById( 'loginBtn' ).onclick = function(){
    var loginLayer = createSingleLoginLayer();
    loginLayer.style.display = 'block';
};
```

:::
::::