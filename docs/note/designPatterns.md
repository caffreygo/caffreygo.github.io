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

### 是什么

策略模式（Strategy Pattern）指的是定义一系列的算法，把它们一个个封装起来，目的就是将算法的使用与算法的实现分离开来

一个基于策略模式的程序至少由两部分组成：

- 策略类，策略类封装了具体的算法，并负责具体的计算过程
- 环境类Context，Context 接受客户的请求，随后 把请求委托给某一个策略类

### 使用

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

