# JavaScript 设计模式

设计模式大致可以分成三类：

> 创建型模式 （ Creational Patterns ）

这类设计模式提供了一种在创建对象的同时隐藏创建逻辑的方式， 而不是使用 new 运算符直接实例化对象。这使得程序在判断针对某个给定实例需要创建哪些对象时更加灵活， 典型的有工厂模式（Factory Pattern）、单例模式。

> 结构型模式（Structural Patterns）

这类设计模式关注类和对象的组合。继承的概念被用来组合接口和定义组合对象获得新功能的方式。 比如 装饰器模式（Decorator Pattern） 和 代理模式（Proxy Pattern）。

> 行为型模式（Behavioral Patterns）

这类设计模式特别关注对象之间的通信。 比如 观察者模式（Observer Pattern）。

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

## 发布订阅模式

::: tip 发布订阅

- 发布—订阅模式可以广泛应用于**异步编程**中，这是一种替代传递回调函数的方案。比如，我们可以订阅ajax请求的error、succ等事件。或者如果想在动画的每一帧完成之后做一些事情，那我们可以订阅一个事件，然后在动画的每一帧完成之后发布这个事件。在异步编程中使用发布—订阅模式，我们就无需过多关注对象在异步运行期间的内部状态，而只需要订阅感兴趣的事件发生点。
- 发布—订阅模式可以取代对象之间硬编码的通知机制，一个对象不用再显式地调用另外一个对象的某个接口。发布—订阅模式让两个对象**松耦合**地联系在一起，虽然不太清楚彼此的细节，但这不影响它们之间相互通信。当有新的订阅者出现时，发布者的代码不需要任何修改；同样发布者需要改变时，也不会影响到之前的订阅者。只要之前约定的事件名没有变化，就可以自由地改变它们。

:::

::: details 发布订阅与观察者模式的区别

1. 发布订阅模式里有三个角色，事件订阅和事件发布都需要消息中心来处理，这种消息范式适合于消息发布者与订阅者允许事件暴露给第三方，两者关系是松耦合的；
2. 而观察者模式里，事件的观察者自身维护着 `update` 事件处理程序，当被观察者触发更新时，会触发所有关联的观察者的事件处理程序。

:::

### DOM 事件

在这里需要监控用户点击 `document.body` 的动作，但是我们没办法预知用户将在什么时候点击。所以我们订阅 `document.body`上的 click 事件，当 body 节点被点击时，body 节点便会向订阅者发布这个消息。

```js
document.body.addEventListener( 'click', function(){
    alert(2);
}, false );

document.body.addEventListener( 'click', function(){
    alert(3);
}, false );

document.body.addEventListener( 'click', function(){
    alert(4);
}, false );

document.body.click();    // 模拟用户点击
```

> 注意，手动触发事件更好的做法是IE下用 fireEvent，标准浏览器下用 dispatchEvent 实现

### 通用实现

::: tip 实现

1. 事件订阅
2. 事件发布
3. 取消订阅

:::

:::: code-group
::: code-group-item 功能提取

```js
var event = {
    clientList: [],
    listen: function( key, fn ){
        if ( ! this.clientList[ key ] ){
            this.clientList[ key ] = [];
        }
        this.clientList[ key ].push( fn );  // 订阅的消息添加进缓存列表
    },
    trigger: function(){
        var key = Array.prototype.shift.call( arguments ),
            fns = this.clientList[ key ];

        if ( ! fns || fns.length === 0 ){  // 如果没有绑定对应的消息
            return false;
        }

        for( var i = 0, fn; fn = fns[ i++ ]; ){
            fn.apply( this, arguments );  // arguments是trigger时带上的参数
        }
    },
    remove: function( key, fn ){
        var fns = this.clientList[ key ];

        if ( ! fns ){    // 如果key对应的消息没有被人订阅，则直接返回
            return false;
        }
        if ( ! fn ){    // 如果没有传入具体的回调函数，表示需要取消key对应消息的所有订阅
            fns && ( fns.length = 0 );
        } else {
            for ( var l = fns.length -1; l >=0; l-- ){    // 反向遍历订阅的回调函数列表
                var _fn = fns[ l ];
                if ( _fn === fn ){
                    fns.splice( l, 1 );    // 删除订阅者的回调函数
                }
            }
        }
    };
};
```

:::
::: code-group-item 注册发布订阅功能

```js
var installEvent = function( obj ){
    for ( var i in event ){
        obj[ i ] = event[ i ];
    }
};
```

:::
::: code-group-item 使用

```js
var salesOffices = {};
installEvent( salesOffices );

salesOffices.listen( 'squareMeter88', fn1 = function( price ){
    console.log( ’价格= ' + price );
});

salesOffices.listen( 'squareMeter88', fn2 = function( price ){
    console.log( ’价格= ' + price );
});

salesOffices.listen( 'squareMeter100', fn3 = function( price ){
    console.log( ’价格= ' + price );
});

salesOffices.trigger( 'squareMeter100', 3000000 );  // 输出：3000000
salesOffices.remove( 'squareMeter88', fn1 );  // 删除 fn1 的订阅
salesOffices.trigger( 'squareMeter88', 2000000 );   // 输出一次：2000000
```

:::
::::

### 全局的发布-订阅对象

::: warning

❏ 我们给每个发布者对象都添加了 listen 和 trigger 方法，以及一个缓存列表 clientList，这其实是一种资源浪费。

❏ 小明跟售楼处对象还是存在一定的耦合性，小明至少要知道售楼处对象的名字是 salesOffices，才能顺利的订阅到事件。

:::

```js
var Event = (function(){

    var clientList = {},
        listen,
        trigger,
        remove;

    listen = function( key, fn ){
        if ( ! clientList[ key ] ){
            clientList[ key ] = [];
        }
        clientList[ key ].push( fn );
    };

    trigger = function(){
        var key = Array.prototype.shift.call( arguments ),
            fns = clientList[ key ];
        if ( ! fns || fns.length === 0 ){
            return false;
        }
        for( var i = 0, fn; fn = fns[ i++ ]; ){
            fn.apply( this, arguments );
        }

    };

    remove = function( key, fn ){
        var fns = clientList[ key ];
        if ( ! fns ){
            return false;
        }
        if ( ! fn ){
            fns && ( fns.length = 0 );
        }else{
            for ( var l = fns.length -1; l >=0; l-- ){
                var _fn = fns[ l ];
                if ( _fn === fn ){
                    fns.splice( l, 1 );
                }
            }
        }
    };

    return {
        listen: listen,
        trigger: trigger,
        remove: remove
    }

})();

Event.listen( 'squareMeter88', function( price ){     // 小红订阅消息
    console.log( ’价格= ' + price );       // 输出：’价格=2000000'
});

Event.trigger( 'squareMeter88', 2000000 );    // 售楼处发布消息
```

### 先发布后订阅

::: details 关于发布-订阅模式的思考

我们所了解到的发布—订阅模式，都是订阅者必须先订阅一个消息，随后才能接收到发布者发布的消息。如果把顺序反过来，发布者先发布一条消息，而在此之前并没有对象来订阅它，这条消息无疑将消失在宇宙中。在某些情况下，我们需要先将这条消息保存下来，等到有对象来订阅它的时候，再重新把消息发布给订阅者。就如同QQ中的离线消息一样，离线消息被保存在服务器中，接收人下次登录上线之后，可以重新收到这条消息。

这种需求在实际项目中是存在的，比如在之前的商城网站中，获取到用户信息之后才能渲染用户导航模块，而获取用户信息的操作是一个ajax异步请求。当ajax请求成功返回之后会发布一个事件，在此之前订阅了此事件的用户导航模块可以接收到这些用户信息。但是这只是理想的状况，因为异步的原因，我们不能保证ajax请求返回的时间，有时候它返回得比较快，而此时用户导航模块的代码还没有加载好（还没有订阅相应事件），特别是在用了一些模块化惰性加载的技术后，这是很可能发生的事情。

也许我们还需要一个方案，使得我们的发布—订阅对象拥有先发布后订阅的能力。为了满足这个需求，我们要建立一个**存放离线事件的堆栈**，当事件发布的时候，如果此时还没有订阅者来订阅这个事件，我们暂时把发布事件的动作包裹在一个函数里，这些包装函数将被存入堆栈中，等到终于有对象来订阅此事件的时候，我们将遍历堆栈并且依次执行这些包装函数，也就是重新发布里面的事件。当然**离线事件的生命周期只有一次**，就像QQ的未读消息只会被重新阅读一次，所以刚才的操作我们只能进行一次。

:::

### 事件命名冲突处理

可以增加命名空间。

## 策略模式

策略模式（Strategy Pattern）指的是定义一系列的算法，把它们一个个封装起来，目的就是将算法的使用与算法的实现分离开来

一个基于策略模式的程序至少由两部分组成：

- 策略类，策略类封装了具体的算法，并负责具体的计算过程
- 环境类Context，Context 接受客户的请求，随后 把请求委托给某一个策略类

### 策略模式的应用

举个例子，公司的年终奖是根据员工的工资和绩效来考核的，绩效为A的人，年终奖为工资的4倍，绩效为B的人，年终奖为工资的3倍，绩效为C的人，年终奖为工资的2倍

若使用`if`来实现，代码则如下：

```js
var calculateBouns = function(salary,level) {
    if(level === 'A') {
        return salary * 4;
    }
    if(level === 'B') {
        return salary * 3;
    }
    if(level === 'C') {
        return salary * 2;
    }
};
// 调用如下：
console.log(calculateBouns(4000,'A')); // 16000
console.log(calculateBouns(2500,'B')); // 7500
```

从上述可有看到，函数内部包含过多`if...else`，并且后续改正的时候，需要在函数内部添加逻辑，**违反了开放封闭原则**。

而如果使用策略模式，就是先定义一系列算法，把它们一个个封装起来，**将不变的部分和变化的部分隔开**，如下：

```js
var obj = {
        "A": function(salary) {
            return salary * 4;
        },
        "B" : function(salary) {
            return salary * 3;
        },
        "C" : function(salary) {
            return salary * 2;
        }
};
var calculateBouns =function(level,salary) {
    return obj[level](salary);
};
console.log(calculateBouns('A',10000)); // 40000
```

上述代码中，`obj`对应的是策略类，而`calculateBouns`对应上下通信类

又比如实现一个表单校验的代码，常常会像如下写法：

```js
var registerForm = document.getElementById("registerForm");
registerForm.onsubmit = function(){
    if(registerForm.userName.value === '') {
        alert('用户名不能为空');
        return;
    }
    if(registerForm.password.value.length < 6) {
        alert("密码的长度不能小于6位");
        return;
    }
    if(!/(^1[3|5|8][0-9]{9}$)/.test(registerForm.phoneNumber.value)) {
        alert("手机号码格式不正确");
        return;
    }
}
```

上述代码包含多处`if`语句，并且违反了开放封闭原则，如果应用中还有其他的表单，需要重复编写代码。

此处也可以使用策略模式进行重构校验，第一步确定不变的内容，即策略规则对象，如下：

```js
var strategy = {
    isNotEmpty: function(value,errorMsg) {
        if(value === '') {
            return errorMsg;
        }
    },
    // 限制最小长度
    minLength: function(value,length,errorMsg) {
        if(value.length < length) {
            return errorMsg;
        }
    },
    // 手机号码格式
    mobileFormat: function(value,errorMsg) {
        if(!/(^1[3|5|8][0-9]{9}$)/.test(value)) {
            return errorMsg;
        }
    } 
};
```

然后找出变的地方，作为环境类`context`，负责接收用户的要求并委托给策略规则对象，如下`Validator`类：

```js
var Validator = function(){
        this.cache = [];  // 保存效验规则
};
Validator.prototype.add = function(dom,rule,errorMsg) {
    var str = rule.split(":");
    this.cache.push(function(){
        // str 返回的是 minLength:6 
        var strategy = str.shift();
        str.unshift(dom.value); // 把input的value添加进参数列表
        str.push(errorMsg);  // 把errorMsg添加进参数列表
        return strategys[strategy].apply(dom,str);
    });
};
Validator.prototype.start = function(){
    for(var i = 0, validatorFunc; validatorFunc = this.cache[i++]; ) {
        var msg = validatorFunc(); // 开始效验 并取得效验后的返回信息
        if(msg) {
            return msg;
        }
    }
};
```

通过`validator.add`方法添加校验规则和错误信息提示，使用如下：

```js
var validateFunc = function(){
    var validator = new Validator(); // 创建一个Validator对象
    /* 添加一些效验规则 */
    validator.add(registerForm.userName,'isNotEmpty','用户名不能为空');
    validator.add(registerForm.password,'minLength:6','密码长度不能小于6位');
    validator.add(registerForm.userName,'mobileFormat','手机号码格式不正确');

    var errorMsg = validator.start(); // 获得效验结果
    return errorMsg; // 返回效验结果
};
var registerForm = document.getElementById("registerForm");
registerForm.onsubmit = function(){
    var errorMsg = validateFunc();
    if(errorMsg){
        alert(errorMsg);
        return false;
    }
}
```

上述通过策略模式完成表单的验证，并且可以随时调用，在修改表单验证规则的时候，也非常方便，通过传递参数即可调用。

### 应用场景

从上面可以看到

::: tip 使用策略模式的优点有如下：

- 策略模式利用组合，委托等技术和思想，有效的避免很多if条件语句
- 策略模式提供了开放-封闭原则，使代码更容易理解和扩展
- 策略模式中的代码可以复用

:::

策略模式不仅仅用来封装算法，在实际开发中，通常会把算法的含义扩散开来，使策略模式也可以用来封装 一系列的“业务规则”

只要这些业务规则指向的目标一致，并且可以被替换使用，我们就可以用策略模式来封装它们。

## 迭代器模式

迭代器模式是指提供一种方法顺序访问一个聚合对象中的各个元素，而又不需要暴露该对象的内部表示。

迭代器模式可以把迭代的过程从业务逻辑中分离出来，在使用迭代器模式之后，即使不关心对象的内部构造，也可以按顺序访问其中的每个元素。

### 内部迭代器

内部迭代器在内部已经定义好了迭代规则，它完全接手整个迭代过程，外部只需要一次初始调用。

:::: code-group
::: code-group-item 内部迭代器

```js
var each = function( ary, callback ){
    for ( var i = 0, l = ary.length; i < l; i++ ){
        callback.call( ary[i], i, ary[ i ] );  // 把下标和元素当作参数传给callback函数
    }
};

each( [ 1, 2, 3 ], function( i, n ){
    alert ( [ i, n ] );
});
```

:::
::: code-group-item compare

```js
var compare = function( ary1, ary2 ){
    if ( ary1.length ! == ary2.length ){
        throw new Error ( 'ary1和ary2不相等’ );
    }
    each( ary1, function( i, n ){
        if ( n ! == ary2[ i ] ){
        	throw new Error ( 'ary1和ary2不相等’ );
        }
    });
    alert ( 'ary1和ary2相等’ );
};

compare( [ 1, 2, 3 ], [ 1, 2, 4 ] );   // throw new Error ( 'ary1和ary2不相等’ );
```

我们目前能够顺利完成需求，还要感谢在JavaScript里可以把函数当作参数传递的特性，但在其他语言中未必就能如此幸运。

在一些没有闭包的语言中，内部迭代器本身的实现也相当复杂。比如C语言中的内部迭代器是用函数指针来实现的，循环处理所需要的数据都要以参数的形式明确地从外面传递进去。

:::

::::

### 外部迭代器

外部迭代器必须显式地请求迭代下一个元素。外部迭代器增加了一些调用的复杂度，但相对也增强了迭代器的灵活性，我们可以手工控制迭代的过程或者顺序。

:::: code-group
::: code-group-item 内部迭代器

```js
var Iterator = function( obj ){
    var current = 0;

    var next = function(){
        current += 1;
    };

    var isDone = function(){
        return current >= obj.length;
    };

    var getCurrItem = function(){
        return obj[ current ];
    };

    return {
        next: next,
        isDone: isDone,
        getCurrItem: getCurrItem
        length: obj.length
    }
};
```

:::
::: code-group-item compare

```js
var compare = function( iterator1, iterator2 ){
    if(iterator1.length ! == iterator2.length){
        alert('iterator1和iterator2不相等’);
    }
    while( ! iterator1.isDone() && ! iterator2.isDone() ){
    	if ( iterator1.getCurrItem() ! == iterator2.getCurrItem() ){
        	throw new Error ( 'iterator1和iterator2不相等’ );
        }
        iterator1.next();
        iterator2.next();
	}

    alert ( 'iterator1和iterator2相等’ );
}
```

外部迭代器虽然**调用方式相对复杂**，但它的适用面更广，也能满足更多变的需求。内部迭代器和外部迭代器在实际生产中没有优劣之分，究竟使用哪个要根据需求场景而定。

:::

::::

### 迭代类数组对象和字面量对象

::: tip 可迭代

迭代器模式不仅可以迭代数组，还可以迭代一些**类数组**的对象。

比如 `arguments` 、`{"0":'a', "1":'b'}` 等。

> 通过上面的代码可以观察到，无论是内部迭代器还是外部迭代器，只要被迭代的聚合对象**拥有 length 属性**而且**可以用下标访问**，那它就可以被迭代。

:::

在 `JavaScript` 中，`for in` 语句可以用来迭代普通字面量对象的属性。jQuery中提供了$.each`函数来封装各种迭代行为：

```js
$.each = function( obj, callback ) {
    var value,
        i = 0,
        length = obj.length,
        isArray = isArraylike( obj );

    if ( isArray ) {    // 迭代类数组
        for ( ; i < length; i++ ) {
            value = callback.call( obj[ i ], i, obj[ i ] );
            if ( value === false ) {
                break;
            }
        }
    } else {
        for ( i in obj ) {    // 迭代object对象
            value = callback.call( obj[ i ], i, obj[ i ] );
            if ( value === false ) {
                break;
            }
        }
    }
    return obj;
};
```

### 倒序迭代器

```js
var reverseEach = function( ary, callback ){
    for ( var l = ary.length -1; l >= 0; l-- ){
        callback( l, ary[ l ] );
    }
};

reverseEach( [ 0, 1, 2 ], function( i, n ){
    console.log( n );  // 分别输出：2, 1 ,0
});
```

### 中止迭代器

```js
var each = function( ary, callback ){
    for ( var i = 0, l = ary.length; i < l; i++ ){
        // callback的执行结果返回false，提前终止迭代
        if ( callback( i, ary[ i ] ) === false ){
            break;
        }
    }
};

each( [ 1, 2, 3, 4, 5 ], function( i, n ){
    if ( n > 3 ){         // n大于3的时候终止循环
        return false;
    }
    console.log( n );    // 分别输出：1, 2, 3
});
```

## 代理模式

代理模式是为一个对象提供一个代用品或占位符，以便控制对它的访问。

代理模式是一种非常有意义的模式，在生活中可以找到很多代理模式的场景。比如，明星都有经纪人作为代理。如果想请明星来办一场商业演出，只能联系他的经纪人。经纪人会把商业演出的细节和报酬都谈好之后，再把合同交给明星签。

代理模式的关键是，当客户不方便直接访问一个对象或者不满足需要的时候，提供一个替身对象来控制对这个对象的访问，客户实际上访问的是替身对象。替身对象对请求做出一些处理之后，再把请求转交给本体对象。

### 保护代理与虚拟代理

代理模式包括许多小分类，在 JavaScript 开发中最常用的是**虚拟代理**和**缓存代理**。

虽然代理模式非常有用，但我们在编写业务代码的时候，往往不需要去预先猜测是否需要使用代理模式。当真正发现不方便直接访问某个对象的时候，再编写代理也不迟。

- 虚拟代理：虚拟代理是把一些开销很大的对象，延迟到真正需要它的时候才去创建执行
- 安全代理：控制真实对象的访问权限
- 远程代理（一个对象将不同空间的对象进行局部代理）
- 智能代理（调用对象代理处理另外一些事情如垃圾回收机制增加额外的服务）

### 虚拟代理实现图片预加载

在Web开发中，图片预加载是一种常用的技术，如果直接给某个 `img` 标签节点设置 `src` 属性，由于图片过大或者网络不佳，图片的位置往往有段时间会是一片空白。

常见的做法是先用一张 loading 图片占位，然后用异步的方式加载图片，等图片加载好了再把它填充到 `img` 节点里，这种场景就很适合使用虚拟代理。

```js
var myImage = (function(){
    var imgNode = document.createElement( 'img' );
    document.body.appendChild( imgNode );

    return {
        setSrc: function( src ){
            imgNode.src = src;
        }
    }
})();

var proxyImage = (function(){
    var img = new Image;
    // 当所需图片加载完毕之后，替换当前的占位图片
    img.onload = function(){
        myImage.setSrc( this.src );
    }
    return {
        setSrc: function( src ){
            myImage.setSrc( 'file:// /C:/Users/svenzeng/Desktop/loading.gif' );
            img.src = src;
        }
    }
})();

proxyImage.setSrc( 'http://imgcache.qq.com/music/photo/k/000GGDys0yA0Nk.jpg' );
```

现在我们通过 `proxyImage` 间接地访问 MyImage。`proxyImage` 控制了客户对 MyImage 的访问，并且在此过程中加入一些额外的操作，比如在真正的图片加载好之前，先把 `img` 节点的 `src` 设置为一张本地的loading图片。

### 代理的意义

不用代理的预加载图片函数实现如下：

```js
var MyImage = (function(){
    var imgNode = document.createElement( 'img' );
    document.body.appendChild( imgNode );
    var img = new Image;

    img.onload = function(){
        imgNode.src = img.src;
    };

    return {
        setSrc: function( src ){
            imgNode.src = 'file:// /C:/Users/svenzeng/Desktop/loading.gif';
            img.src = src;
        }
    }
})();

MyImage.setSrc( 'http://imgcache.qq.com/music/photo/k/000GGDys0yA0Nk.jpg' );
```

> 单一职责原则指的是，就一个类（通常也包括对象和函数等）而言，应该仅有一个引起它变化的原因。如果一个对象承担了多项职责，就意味着这个对象将变得巨大，引起它变化的原因可能会有多个。面向对象设计鼓励将行为分布到细粒度的对象之中，如果一个对象承担的职责过多，等于把这些职责耦合到了一起，这种耦合会导致脆弱和低内聚的设计。当变化发生时，设计可能会遭到意外的破坏。

::: warning

- 职责被定义为“引起变化的原因”。上段代码中的 MyImage 对象除了负责给 img 节点设置 src 外，还要负责预加载图片。我们在处理其中一个职责时，有可能因为其强耦合性影响另外一个职责的实现。
- 另外，在面向对象的程序设计中，大多数情况下，若违反其他任何原则，同时将违反开放—封闭原则。如果我们只是从网络上获取一些体积很小的图片，或者5年后的网速快到根本不再需要预加载，我们可能希望把预加载图片的这段代码从 MyImage 对象里删掉。这时候就不得不改动 MyImage 对象了。

:::

实际上，我们需要的只是给 img 节点设置 src，预加载图片只是一个锦上添花的功能。如果能把这个操作放在另一个对象里面，自然是一个非常好的方法。于是代理的作用在这里就体现出来了，代理负责预加载图片，预加载的操作完成之后，把请求重新交给本体MyImage。

纵观整个程序，我们并**没有改变或者增加 MyImage 的接口**，但是通过代理对象，实际上给系统添加了新的行为。这是符合**开放—封闭原则**的。给 img 节点设置 src 和图片预加载这两个功能，被隔离在两个对象里，它们可以各自变化而不影响对方。何况就算有一天我们不再需要预加载，那么只需要改成请求本体而不是请求代理对象即可。

### 代理和本体接口的一致性

::: tip 代理接口一致的好处

❏ 用户可以放心地请求代理，他只关心是否能得到想要的结果。

❏ 在任何使用本体的地方都可以替换成使用代理。

:::

如果代理对象和本体对象都为一个函数（函数也是对象），函数必然都能被执行，则可以认为它们也具有一致的“接口”。

```js
var myImage = (function(){
    var imgNode = document.createElement( 'img' );
    document.body.appendChild( imgNode );

    return function( src ){
        imgNode.src = src;
    }
})();

var proxyImage = (function(){
    var img = new Image;

    img.onload = function(){
        myImage( this.src );
    }

    return function( src ){
        myImage( 'file:// /C:/Users/svenzeng/Desktop/loading.gif' );
        img.src = src;
    }
})();

proxyImage( 'http://imgcache.qq.com/music// N/k/000GGDys0yA0Nk.jpg' );
```

### 虚拟代理合并 HTTP 请求

代理函数 `proxySynchronousFile` 收集一段时间之内的请求，最后一次性发送给服务器。

比如我们等待2秒之后才把这2秒之内需要同步的文件ID打包发给服务器，如果不是对实时性要求非常高的系统，2秒的延迟不会带来太大副作用，却能大大减轻服务器的压力。代码如下：

```js
var synchronousFile = function( id ){
    console.log( ’开始同步文件，id为： ' + id );
                };

var proxySynchronousFile = (function(){
    var cache = [],    // 保存一段时间内需要同步的ID
        timer;    // 定时器

    return function( id ){
        cache.push( id );
        if ( timer ){    // 保证不会覆盖已经启动的定时器
            return;
        }

        timer = setTimeout(function(){
            synchronousFile( cache.join( ', ' ) );    // 2秒后向本体发送需要同步的ID集合
            clearTimeout( timer );    // 清空定时器
            timer = null;
            cache.length = 0; // 清空ID集合
        }, 2000 );
    }
})();

var checkbox = document.getElementsByTagName( 'input' );

for ( var i = 0, c; c = checkbox[ i++ ]; ){
    c.onclick = function(){
        if ( this.checked === true ){
            proxySynchronousFile( this.id );
        }
    }
};
```

### 缓存代理

缓存代理可以为一些开销大的运算结果提供暂时的存储，在下次运算时，如果传递进来的参数跟之前一致，则可以直接返回前面存储的运算结果。

:::: code-group
::: code-group-item 计算乘机

```js
var mult = function(){
    console.log('开始计算乘积');
    var a = 1;
    for ( var i = 0, l = arguments.length; i < l; i++ ){
        a = a * arguments[i];
    }
    return a;
};

mult( 2, 3 );    // 输出：6
mult( 2, 3, 4 );    // 输出：24
```

:::
::: code-group-item 缓存代理函数

```js
var proxyMult = (function(){
    var cache = {};
    return function(){
        var args = Array.prototype.join.call( arguments, ', ' );
        if ( args in cache ){
            return cache[ args ];
        }
        return cache[ args ] = mult.apply( this, arguments );
    }
})();

proxyMult( 1, 2, 3, 4 );    // 输出：24
proxyMult( 1, 2, 3, 4 );    // 输出：24
```

:::
::::

### 高阶函数动态创建代理

>  代理函数作为函数返回值返回

```js
/**************** 计算乘积 *****************/
var mult = function(){
    var a = 1;
    for ( var i = 0, l = arguments.length; i < l; i++ ){
        a = a * arguments[i];
    }
    return a;
};

/**************** 计算加和 *****************/
var plus = function(){
    var a = 0;
    for ( var i = 0, l = arguments.length; i < l; i++ ){
        a = a + arguments[i];
    }
    return a;
};

/**************** 创建缓存代理的工厂 *****************/
var createProxyFactory = function( fn ){
    var cache = {};
    return function(){
        var args = Array.prototype.join.call( arguments, ', ' );
        if ( args in cache ){
            return cache[ args ];
        }
        return  cache[ args ] = fn.apply( this, arguments );
    }
};

var proxyMult = createProxyFactory( mult ),
    proxyPlus = createProxyFactory( plus );

alert ( proxyMult( 1, 2, 3, 4 ) );    // 输出：24
alert ( proxyMult( 1, 2, 3, 4 ) );    // 输出：24
alert ( proxyPlus( 1, 2, 3, 4 ) );    // 输出：10
alert ( proxyPlus( 1, 2, 3, 4 ) );    // 输出：10
```



## 工厂模式

参考：

- [工厂模式](https://juejin.cn/post/6844903653774458888)
- [工厂模式](https://juejin.cn/post/7023573813199634469)

### 简单工厂模式

### 工厂方法模式

### 抽象工厂模式