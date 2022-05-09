# 非原始值的响应式方案

实现响应式数据不止是单纯地实现 get/set 的拦截操作。还需要考虑遍历、数组以及集合类型的支持。

## 理解 Proxy 和 Reflect

### Proxy

Proxy：创建一个代理对象，它能够实现对**其他对象**的代理。也就是说，Proxy只能代理对象，无法代理非对象值，比如字符串、布尔值等等

代理：指对一个对象**基本语义**的代理。它允许我们**拦截**并**重新定义**一个对象的基本操作。

基本语义：对象属性值的读取、设置，函数的调用。

### 基本操作与复合操作

#### 基本操作

- 比如读取、设置对象属性值：

```js
const obj = { foo: 1 }

const p = new Proxy(obj, {
  get() { return obj.foo },
  set(target, key, value) {
    obj[key] = value
  }
})

// ⚠️注意：我们这里操作的是代理对象
console.log(p.foo)  // 1
p.foo++
console.log(p.foo)  // 2
```

- 函数也是对象，所以调用函数也是对一个对象的基本操作：

```js
const fn = (name) => {
  console.log('我是：', name)
}

const p2 = new Proxy(fn, {
  apply(target, thisArg, argArray) {
    target.call(thisArg, ...argArray)  // 我是Jerry
  }
})

p2('Jerry')
```

#### 复合操作

调用对象下的方法就是典型的非基本操作，即复合操作：

```js
obj.fn()
```

实际上，调用对象下方法由两个基本语义组成。分别是属性的 get 和函数调用。（函数的调用是基本语义的操作，对象下方法的调用是复合操作）

### Reflect

Reflect 是一个全局对象，其下有很多方法。任何在 Proxy 的拦截器能找到的方法，都能够在 Reflect 中找到同名函数。

不同的是，比如 Reflect 的 get 方法能够接收第三个参数，thisArg即上下文。

```js
const obj = {
	foo: 1,
	get bar() {
    // 因为 get 拦截：return target[key]
    // 这里 this 指向原始对象 obj
		return this.foo
	}
}

const p = new Proxy(obj, {
  get(target, key) {
    track(target, key)
    // 这里是使用 target 也就是原始对象获取属性，即 obj[key]
    return target[key]
  }
  /*...*/
})
effect(() => {
  // 普通属性 p[prop] 通过代理对象访问，触发 get 拦截，收集依赖
  // getter obj[prop] 通过原始对象访问，无法建立响应联系
  console.log(p.bar)  // obj getter[foo]
})

p.foo++ // 副作用函数不会重新执行
```

bar 属性作为访问器属性，当我们通过 p.bar 读取时，obj getter 的执行获取了 foo 属性。

我们希望属性 foo 也能收集对应的副作用函数，但是实际上最终我们是用 obj.foo 即**原始对象**在副作用函数当中访问的 foo属性，所以说不会建立响应联系的。

如果我们把访问器属性 bar 的 getter 函数内的 this 值向代理对象 p，问题就解决了：

```js
const p = new Proxy(obj, {
  // 拦截读取操作，添加第三个参数 receiver，即代理对象
  get(target, key, receiver) {
    track(target, key)
    return Reflect.get(target, key, receiver)
  }
  /*...*/
})
```

基于这个原因，我们需要使用 Reflect.* 方法来传递 thisArg。

## JavaScript 对象及 Proxy 的工作原理

### JavaScript 对象

JavaScript 中一切皆对象，分别是常规对象（ordinary object）和异质对象（exotic object）。

内部方法或内部槽：在 JavaScript 中，对象的实际语义是由对象的内部方法（internal method）指定的。所谓内部方法，指的是当我们对一个对象进行操作时在引擎内部调用的方法。

*比如访问对象属性时，引擎内部会调用 [[Get]] 这个内部方法来读取属性值。ECMAScript 使用 [[xxx]] 来代表内部方法或内部槽*

🌐 [JavaScript 对象必须部署的11个必要的和额外的内部方法 (opens new window)](https://tc39.es/ecma262/#sec-invariants-of-the-essential-internal-methods)

### 区分普通对象与函数

通过内部方法和内部槽来区分。例如函数对象会部署内部方法 [[Call]]，而普通对象则不会

```js
const a = (() => 1)
const b = {}
a.call // ƒ call() { [native code] }
b.call // undefined
```

### 普通的对象与异质对象

内部方法具有多态性，例如普通对象和 Proxy 对象都部署了 [[Get]] 这个方法，但是它们的逻辑是不同的

::: tip 普通对象

- 对于11个必要的内部方法，必须使用 ECMA 规范 10.1.x 节给出的定义实现；
- 对于内部方法 [[Call]]，必须使用 ECMA 规范 10.2.1 节给出的定义实现；
- 对于内部方法 [[Construct]]，必须使用 ECMA 规范10.2.2 节给出的定义实现；

::: 

所有不符合这三点要求的对象都是异质对象。例如 Proxy 对象的内部方法 [[Get]] 没有使用 ECMA 规范的 10.1.8 节给出的定义实现，所以 Proxy 是一个异质对象。

如果在创建对象时没有指定对应的拦截函数，例如没有指定 get() 拦截函数，那么当我们通过代理对象访问属性值时，代理对象的内部方法 [[Get]] 会调用原始对象的内部方法 [[Get]] 来获取属性值，这其实就是代理透明性质。

所以，代理对象时用来定义代理对象本身的内部方法和行为，而不是用来指定被代理对象（原始对象）的内部方法和行为。

```js
const obj = { foo: 1 }
const p = new Proxy(obj, {
  deleteProperty(target, key) {
    return Reflect.deleteProperty(target, key)
  }
})

console.log(p.foo)  // 1
delete p.foo
console.log(p.foo)  // undefined
```

## 如何代理 Object

### 代理的本质

- 代理对象的本质，就是查阅规范对应的可拦截的基本方法；
- 还要分析复合操作所依赖的基本操作，通过基本操作的拦截方法间接地处理复合操作。

### 对象的所有读取操作

一个普通对象可能存在的读取操作：

1️⃣ 访问属性：obj.foo

通过 **get** 拦截函数实现

2️⃣ 判断对象或原型上是否存在给定的 key ：key in obj

in 操作符的运算结果上通过调用一个叫做 **HasProperty** 的抽象方法得到的，[[HasProperty]] 对应的拦截函数名叫 has

3️⃣ 使用 for...in 循环遍历对象：for (const key in obj) {}

在 generator 函数中，通过 **Reflect.ownkey**s 获取到对象自身拥有的键后，收集遍历，返回的是一个迭代器对象。

### 响应式处理

当为对象添加或者删除属性时，key 的数量发生了变化，因此都要重新执行 for...in 对应的 ITERATE_KEY 所关联的副作用函数，但是无论时增加还是设置对象属性的基本语义都是 [[Set]]，所以需要在调用 trigger 函数时传递对应的操作类型进行区分。

```js
// 存储副作用函数的桶
const bucket = new WeakMap()
const ITERATE_KEY = Symbol()

const obj = { foo: 1 }
const p = new Proxy(obj, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, newVal, receiver) {
    // 如果属性不存在，则说明是在添加新的属性，否则是设置已存在的属性
    const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
    const res = Reflect.set(target, key, newVal, receiver)
    // 将 type 作为第三个参数传递给 trigger 函数
    trigger(target, key, type)
    return res
  },
  has(target, key) {
    // key in obj 的依赖收集
    track(target, key)
    return Reflect.has(target, key)
  },
  ownKeys(target) {
    // for...in 循环的依赖收集
    track(target, ITERATE_KEY)
    return Reflect.ownKeys(target)
  },
  deleteProperty(target, key) {
    // 删除对象键的拦截，触发循环关联的副作用函数
    const hadKey = Object.prototype.hasOwnProperty.call(target, key)
    const res = Reflect.deleteProperty(target, key)
    if (res && hadKey) {
      trigger(target, key, 'DELETE')
    }
    return res
  }
})

function track(target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

function trigger(target, key, type) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  // 添加或删除影响了 key, 发循环关联的副作用函数
  console.log(type, key)
  if (type === 'ADD' || type === 'DELETE') {
    const iterateEffects = depsMap.get(ITERATE_KEY)
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }

  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

let activeEffect
const effectStack = []

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]

    return res
  }
  effectFn.options = options
  effectFn.deps = []
  if (!options.lazy) {
    effectFn()
  }

  return effectFn
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

// =================================================================

effect(() => {
  for (const key in p) {
    console.log('key: ', key)  // key: foo
  }
})

p.bar = 123  // ADD bar，触发副作用函数，key: foo, key: bar
delete p.foo  // DELETE foo，触发副作用函数，key: bar
console.log(bucket.get(obj))
```

## 合理地触发响应

副作用函数的执行是需要优化的。

### 值变化判断

首先是值如果为真正发生变化的情况，这个还需要考虑NaN不等于自身的问题

```js
NaN === NaN  // false
NaN !== NaN  // true

set(target, key, newVal, receiver) {
  const oldVal = target[key]
  const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
  const res = Reflect.set(target, key, newVal, receiver)
  // 比较新值和旧值，只有它们不全等，并且都不是NaN的时候才触发响应
  if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
    trigger(target, key, type)
  }

  return res
},
```

### 原型链属性访问

以及访问原型链上的属性导致副作用函数重新执行两次的问题。（使用代理对象作为原型）

```js
const obj = {}
const proto = { bar: 1 }
const child = reactive(obj)
const parent = reactive(proto)
Object.setPrototypeOf(child, parent)

effect(() => {
  // Reflect.get(obj, 'bar', receiver)
  // child 代理的对象 obj 本身没有该属性，会找原型 parent，parent本身也是代理对象
  // 最终，child.bar 和 paren.bar 都与副作用函数建立了响应式联系
  console.log(child.bar)  // 1
})
// Reflect.set(obj, 'bar', 2, receiver）
// 设置的 bar 属性不存于对象上，会在原型调用其parent [[Set]]，parent是代理对象，拦截触发trigger
child.bar = 2 //会导致副作用函数重新执行两次 child.bar + parent.bar
```

当代理对象的 set 拦截对象触发时：

```js
// 在 child 进行 set 
set(target, key, value, receiver) {
  // target 原始对象 obj
  // receiver 是代理对象 child
}

// child 没有该属性，在原型链的 parent 上进行 set
set(target, key, value, receiver) {
  // target 原始对象 proto
  // receiver 仍然是代理对象 child
}
```

解决办法：判断 receiver 是否是 target 的代理对象即可，只有满足这个条件才触发更新，这样就能屏蔽由原型引起的更新。为此我们需要在代理对象中保存一份原始对象的数据，方便后续的判断：

```js
const bucket = new WeakMap()
const ITERATE_KEY = Symbol()

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      // 补充 raw 属性获得原始对象
      if (key === 'raw') {
        return target
      }
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, newVal, receiver) {
      const oldVal = target[key]
      const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      const res = Reflect.set(target, key, newVal, receiver)
      // 判断 receiver 是否为 target 的代理对象，满足才触发更新
      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type)
        }
      }

      return res
    },
    /*...*/
  })
}

// ==============================================================
const obj = { foo: 1 }
const child = reactive(obj)
const parent = reactive({ bar: 2 })
Object.setPrototypeOf(child, parent)

console.log(Object.getPrototypeOf(obj) === parent)  // true

effect(() => {
  console.log(child.bar)  // 2 child 和 parent 都会收集当前副作用函数
})

child.bar = 3  // 触发一次 child 的依赖更新
obj.bar = 3  // 不是操作响应式对象，不会触发 set
```

