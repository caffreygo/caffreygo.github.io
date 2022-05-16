# 非原始值的响应式方案

🔖 实现响应式数据不止是单纯地实现 get/set 的拦截操作。还需要考虑遍历、数组以及集合类型的支持。

## 理解 Proxy 和 Reflect

### Proxy

- Proxy：创建一个代理对象，它能够实现对**其他对象**的代理。也就是说，Proxy只能代理对象，无法代理非对象值，比如字符串、布尔值等等

- 代理：指对一个对象**基本语义**的代理。它允许我们**拦截**并**重新定义**一个对象的基本操作。

- 基本语义：对象属性值的读取、设置，函数的调用。


### 基本操作与复合操作

#### 基本操作

比如读取、设置对象属性值：

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

函数也是对象，所以调用函数也是对一个对象的基本操作：

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

🔥 实际上，调用对象下方法由**两个基本语义**组成。分别是属性的 get 和函数调用。（函数的调用是基本语义的操作，对象下方法的调用是复合操作）

### Reflect

🔖 Reflect 是一个全局对象，其下有很多方法。任何在 Proxy 的拦截器能找到的方法，都能够在 Reflect 中找到同名函数。

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

🐛 我们希望属性 foo 也能收集对应的副作用函数，但是实际上最终我们是用 obj.foo 即**原始对象**在副作用函数当中访问的 foo属性，所以说不会建立响应联系的。

🔥 如果我们把访问器属性 bar 的 getter 函数内的 this 值向代理对象 p，问题就解决了：

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

🔖 内部方法或内部槽：在 JavaScript 中，对象的实际语义是由对象的内部方法（internal method）指定的。所谓内部方法，指的是当我们对一个对象进行操作时在引擎内部调用的方法。

*比如访问对象属性时，引擎内部会调用 [[Get]] 这个内部方法来读取属性值。ECMAScript 使用 [[xxx]] 来代表内部方法或内部槽*

🌐 [JavaScript 对象必须部署的11个必要的和额外的内部方法 (opens new window)](https://tc39.es/ecma262/#sec-invariants-of-the-essential-internal-methods)

### 区分普通对象与函数

🔥 通过内部方法和内部槽来区分。例如函数对象会部署内部方法 [[Call]]，而普通对象则不会

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

如果在创建对象时没有指定对应的拦截函数，例如没有指定 get() 拦截函数，那么当我们通过代理对象访问属性值时，代理对象的内部方法 [[Get]] 会调用原始对象的内部方法 [[Get]] 来获取属性值，这其实就是**代理透明性质**。

🔥 所以，代理对象是用来定义**代理对象本身**的内部方法和行为，而不是用来指定被代理对象（原始对象）的内部方法和行为。

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

::: tip 一个普通对象可能存在的读取操作：

1. 访问属性：obj.foo

   通过 **get** 拦截函数实现

2. 判断对象或原型上是否存在给定的 key ：key in obj

   in 操作符的运算结果上通过调用一个叫做 **HasProperty** 的抽象方法得到的，[[HasProperty]] 对应的拦截函数名叫 has

3. 使用 for...in 循环遍历对象：for (const key in obj) {}

   在 generator 函数中，通过 **Reflect.ownkey**s 获取到对象自身拥有的键后，收集遍历，返回的是一个迭代器对象。

:::

### 响应式处理

🔥 当为对象添加或者删除属性时，**key 的数量**发生了变化，因此都要重新执行 for...in 对应的 ITERATE_KEY 所关联的副作用函数。

🐛 但是无论时增加还是设置对象属性的基本语义都是 [[Set]] ，所以需要在调用 trigger 函数时传递对应的操作类型进行区分。

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

首先是值如果为真正发生变化的情况，这个还需要考虑 NaN 不等于自身的问题

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

🔥 解决办法：判断 receiver 是否是 target 的代理对象即可，只有满足这个条件才触发更新，这样就能屏蔽由原型引起的更新。为此我们需要在代理对象中保存一份原始对象的数据，方便后续的判断：

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

## 浅响应与深响应

目前实现的reactive 只是浅响应，也就是对象的第一层属性是响应的，第二层及更深层次的属性则不是响应式的。

```js
const obj = reactive({ foo: {bar: 1 }})
effect(() => {console.log(obj.foo.bar)})

obj.foo.bar = 2  // 修改未触发响应
```

这里首先使用 Reflect.get 读取 obj.foo 的值，获取到的是普通对象 { bar: 1 }，因为这不是响应式对象，所以在副作用函数当中访问 obj.foo.bar 不会建立响应式联系。要解决这个问题，需要进行一层包装：

```js
function createReactive(obj, isShallow = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') {
        return target
      }
      track(target, key)
			// 浅响应直接返回原始值
      if (isShallow) {
        return res
      }
      // 深响应： 先得到原始值结果
      const res = Reflect.get(target, key, receiver)
      if (typeof res === 'object' && res !== null) {
        // 调用 reactive 将结果包装成响应式数据并返回
        return reactive(res)
      }
      return res
    },
  }
```

当然，也有需要浅响应效果的需求：

```js
const obj = shallowReactive({ foo: {bar: 1 }})
effect(() => {console.log(obj.foo.bar)})
// obj.foo 是响应的，可以触发副作用函数执行
obj.foo = { bar: 2 }
// obj.foo.bar 不是响应的，不能触发副作用函数重新执行
obj.foo.bar = 3
```

## 只读与浅只读

当用户尝试修改只读数据时，会收到一条警告信息。例如 props 对象就应该是一个只读数据。

- 只读的数据，既不能设置 set，也不能删除 deleteProperty
- 只读数据无法修改，所以也不需要为只读数据建立响应联系

```js
const bucket = new WeakMap()
const ITERATE_KEY = Symbol()
// 深响应
function reactive(obj) {
  return createReactive(obj)
}
// 浅响应
function shallowReactive(obj) {
  return createReactive(obj, true)
}
// 深只读
function readonly(obj) {
  return createReactive(obj, false, true)
}
// 浅只读
function shallowReadonly(obj) {
  return createReactive(obj, true, true)
}

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') {
        return target
      }
      // 只读不需要建立响应联系，因为不会被修改
      if (!isReadonly) {
        track(target, key)
      }
      
      const res = Reflect.get(target, key, receiver)
      if (isShallow) {
        return res
      }
      if (typeof res === 'object' && res !== null) {
        // 深只读/响应
        return isReadonly ? readonly(res) : reactive(res)
      }

      return res
    },
    set(target, key, newVal, receiver) {
      // 只读时对 set 操作拦截并警告
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`)
        return true
      }
      const oldVal = target[key]
      const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      const res = Reflect.set(target, key, newVal, receiver)
      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type)
        }
      }

      return res
    },
    has(target, key) { /*...*/ },
    ownKeys(target) { /*...*/ },
    deleteProperty(target, key) {
      // 只读属性不能删除，抛出警告
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`)
        return true
      }
      const hadKey = Object.prototype.hasOwnProperty.call(target, key)
      const res = Reflect.deleteProperty(target, key)
      if (res && hadKey) {
        trigger(target, key, 'DELETE')
      }

      return res
    }
  })
}

// =================================================================
const obj = readonly({ foo: { bar: 1 } })  // 深只读，无法修改删除，不会建立响应联系
effect(() => {
  console.log(obj.foo.bar)  // 1
})

obj.foo.bar = 2 // warn：属性 bar 是只读的，此时 obj.foo.bar 还是1
```

## 代理数组

数组是一个异质对象，数组对象的 [[DefineOwnProperty]] 内部方法与常规对象不同。

但其他内部方法的逻辑与常规对象是一样的，因此代理普通对象的大部分方法都是可以继续使用的。

```js
const arr = reactive(['foo'])
effect(() => {
  console.log(arr[0])  // foo
})

arr[0] = 'bar'  // 能够触发响应
```

::: tip 所有对数组元素或属性的“读取”操作：

- 通过索引访问数组元素值：arr[0]
- 访问数组长度：arr.length
- 把数组作为对象，使用 for...in 循环遍历
- 使用 for...of 迭代数组遍历
- 数组的原型方法，如concat/join/every/some/find/findIndex/includes等，以及其他所有不改变原数组的原型方法

::: 

::: tip 所有对数组元素或属性的“设置”操作：

- 通过索引修改数组元素值：arr[1] = 3
- 修改数组长度：arr.length = 0
- 数组的栈方法：push/pop/shift/unshift
- 修改原数组的原型方法：splice/fill/sort 等

::: 

### 数组的索引与 length

使用索引设置数组元素值和对象设置属性值是一样的，都是 [[Set]] ， [[Set]] 这个内部方法其实依赖于 [[DefineOwnProperty]] 。但是数组对象内部部署的 [[DefineOwnProperty]] 不同于常规对象。

#### 使用索引 set

当设置的索引值大于数组当前的长度时，会更新数组的 length 属性。这个隐式的修改需要我们触发与 length 属性关联的副作用函数重新执行。

```js
const arr = reactive(['bar'])
effect(() => {
  console.log(arr.length)
})
// length 属性收集了当前副作用函数，而这个修改使 length 属性发生了变化
arr[1] = 'foo'
```

🚀 所以我们需要在 set 拦截中区分当前操作类型是 SET 还是 ADD，以此判断 length 属性是否会受影响。

#### 索引被修改

```js
const arr = reactive(['bar'])
effect(() => {
  console.log(arr[0])
})
// length 修改之后，大于新索引值当旧属性已经被删除，需要对应触发响应
arr[.length = 0
```

🚀 这里当修改 length 属性时，只有那些索引值大于或等于新的 length 属性值当元素才需要触发响应。

#### 代码调整

```js
const bucket = new WeakMap()
const ITERATE_KEY = Symbol()

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    // 针对数组拦截设置操作的调整
    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`)
        return true
      }
      const oldVal = target[key]
      
      const type = Array.isArray(target)
      	// 区分数组当前的 set 操作是在 SET 还是 ADD
        ? Number(key) < target.length ? 'SET' : 'ADD'
      	// 如果属性不存在，则说明是在添加新的属性，否则是设置已存在的属性
        : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      
      const res = Reflect.set(target, key, newVal, receiver)
      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          // 将操作类型传递给 trigger 函数处理
          trigger(target, key, type, newVal)
        }
      }
      return res
    },
    /*...*/
  })
}

function track(target, key) { /*...*/ }

function trigger(target, key, type, newVal) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  
  if (type === 'ADD' || type === 'DELETE') {
    const iterateEffects = depsMap.get(ITERATE_KEY)
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }
	// 数组在添加新元素，触发 length 相关的副作用函数重新执行
  if (type === 'ADD' && Array.isArray(target)) {
    const lengthEffects = depsMap.get('length')
    lengthEffects && lengthEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }
	// 数组设置了新 length ，触发被删除的 key 相关的副作用函数重新执行
  if (Array.isArray(target) && key === 'length') {
    depsMap.forEach((effects, key) => {
      if (key >= newVal) {
        effects.forEach(effectFn => {
          if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
          }
        })
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
```

### 遍历数组

#### for...in

对于普通对象来说，通过对 ownKeys 的拦截已经能够满足 for...in 遍历跟踪，我们使用了 ITERATE_KEY 存储着对应的副作用函数，只有当对象的属性添加或者删除时才需要触发它们重新执行。而对于数组来说，有以下两种情况会影响到它的 for...in 遍历。（*应尽量避免使用 for...in 遍历数组*）

- 添加新元素：arr[100] = 'bar'
- 修改数组长度： arr.length = 0

🚀 这些操作本质上都是修改了数组的长度，因此调整对应的 ownKeys 拦截函数即可：

```js
ownKeys(target) {
  // 如果操作目标是数组，则将当前副作用函数与数组的 length 数组建立响应联系
  track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
  return Reflect.ownKeys(target)
}
```

#### for...of

- for...of：遍历可迭代对象（iterable object）
- 可迭代对象：ES2015 为 JavaScript 定义了迭代**协议**（iteration protocol）

🔖 一个对象能否被迭代，取决于该对象的原型是否实现了 @@iterator 方法。这个的 @@[name] 标志在ECMAScript 规范里用来代指 JavaScript 内建的 symbols。例如 @@iterator 指的就是 Symbol.iterator 这个值。如果一个对象实现了 Symbol.iterator 方法，那么这个对象就是**可迭代的**：

```js
const obj = {
	val: 0,
	[Symbol.iterator]() {
    return {
			next() {
				return {
					value: obj.val++,
					done: obj.val > 10 ? true : false
				}
			}
    }
	}
}

for (const value of obj) {
  console.log(value) // 0 1 2 3 4 5 6 7 8 9
}
```

数组内建了 Symbol.iterator 方法的实现：

```js
const arr = [1, 2, 3]
// 获取并调用数组内建的迭代器方法，该方法返回一个迭代器
const itr = arr[Symbol.iterator]()

console.log(itr.next())  // {value: 1, done: false}
console.log(itr.next())  // {value: 2, done: false}
console.log(itr.next())  // {value: 3, done: false}
console.log(itr.next())  // {value: undefined, done: true}
```

模拟实现数组迭代器：

```js
const arr = [1, 2, 3]

arr[Symbol.iterator] = function() {
  const target = this;
  const len = target.length;
  let index = 0;
  return {
    next() {
      return {
        value: index < len ? target[index] : undefined,
        done: index ++ >= len
      }
    }
  }
}
```

🚀 可见，迭代数组时，只需要在副作用函数与数组的长度和索引直接建立响应联系，就能够实现响应式的 for...of 迭代。

我们不需要增加任何代码就能够使其正确工作，因为数组的长度和元素值发生改变，副作用函数自然会重新执行。

```js
const arr = reactive([1, 2, 3]);
effect(()=> {
  // for (const val of arr.values()) {...}
  for(const val of arr){
    console.log(val);
  }
})

arr[1] = 'bar';  // 能够触发响应
arr.length = 0;  // 能够触发响应
```

数组的 values 方法的返回值实际上就是数组内建的迭代器：

```js
console.log(Array.prototype.values === Array.prototype[Symbol.iterator])  // true
```

🔐 最后，无论是使用 values 方法函数，或者使用 for...of 直接循环数组，都会访问数组的 Symbol.iterator 属性。为了避免发生意外的错误，以及性能上的考虑，我们不应该在副作用函数与 Symbol.iterator 这类 symbol 值之间建立响应联系，因此修改修改一下 get 拦截函数：

```js
get(target, key, receiver) {
      if (key === 'raw') {
        return target
      }

      // 添加判断，如果 key 的类型是 symbol，则不进行追踪
      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key)
      }

      const res = Reflect.get(target, key, receiver)
      if (isShallow) {
        return res
      }
      // 如果元素值是可以被代理的，返回代理对象
      if (typeof res === 'object' && res !== null) {
        return isReadonly ? readonly(res) : reactive(res)
      }
      return res
    },
```

### 数组的查找方法

> includes / indexOf / lastIndexOf

```js
const arr = reactive([1, 2])
effect(() => {
    console.log(arr.incluides(1))  // 与 length/所有索引 建立响应联系
})
arr[0] = 3  // 触发副作用函数重新执行
```

数组的方法其实都依赖了对象的基本语义，比如 includes 方法会访问数组的 length 和索引进行查找，因此当我们修改某个索引下的值都能正确触发响应。

```js
const obj = {}
const arr = reactive([obj])

console.log(arr.includes(arr[0]))  // false 代理对象直接的比较
console.log(arr.includes(obj))  // false 代理对象与原始值的比较
```

::: tip 🚀 数组查找方法的分析

- includes 方法在查询值的时候，this 指向代理对象 arr；
- arr[0] 访问代理对象的元素值，这个值 obj 仍然是可以被代理的，这里返回一个代理对象而非原始对象；
- includes 方法内部也会取到 arr 代理对象下的元素值，从而得到一个新的代理对象；

1. 所以，我们需要把代理过的对象缓存起来保证多次代理后得到的对象是相同的；
2. 同时，对于与原始值比较的情况，要重写如 includes 这些根据给定值查找结果的方法。

::: 

```js
const arrayInstrumentations = {}

;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  const originMethod = Array.prototype[method]
  arrayInstrumentations[method] = function(...args) {
    // this 是代理对象，先在代理对象中查找，将结果存储到 res 中
    let res = originMethod.apply(this, args)

    if (res === false) {
      // res 为 false 说明没找到，在通过 this.raw 拿到原始数组，再去原始数组中查找，并更新 res 值
      res = originMethod.apply(this.raw, args)
    }
    // 返回最终的结果
    return res
  }
})

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    // 拦截读取操作
    get(target, key, receiver) {
      /*...*/
      // 使用重写后的数组方法
      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver)
      }
      /*...*/
      return res
    }
  })
}
```

### 隐式修改数组长度的原型方法

> 栈方法：push / pop / shift / unshift + splice

🔖  push 方法在执行过程中，会读取数组的 length 属性值，也会设置 length。我们虽然处理了 set 不会触发当前激活的副作用函数重新执行导致的栈溢出问题，但是以下这个情况仍然会出现栈溢出：

```js
const arr = reactive([])

effect(() => arr.push(0))
effect(() => arr.push(1))
```

- 第一个副作用函数执行，执行完毕之后数组的 length 数组会与 副作用函数建立响应联系

- 第二个副作用函数执行，同样建立了响应式联系，但是 push 还会设置 length

- 第二个函数的 length 设置触发响应，把两个副作用函数都取出重新执行。

  此时第二个副作用函数还没执行完，就要再执行第一个副作用函数了。

- 同样第一个副作用函数还在设置 length 的时候，又开始了依赖触发更新

- 如此循环往复，最终导致调动栈溢出

🚀 因为 push 内对 length 的读取操作是这个问题的原因，所以我们应该屏蔽这个过程对 length 建立响应式联系。push 的语义是修改操作，而不是读取操作。因此我们需要重写 push 方法：

```js
let shouldTrack = true
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  const originMethod = Array.prototype[method]
  arrayInstrumentations[method] = function(...args) {
    shouldTrack = false
    // 取得原始方法
    let res = originMethod.apply(this, args)
    // 调用后恢复原来的行为，即允许追踪
    shouldTrack = true
    return res
  }
})

/*...*/

function track(target, key) {
  // 当标记变量不允许追踪时，return
  if (!activeEffect || !shouldTrack) return
  /*...*/
}
```

## 代理 Set 和 Map

> 集合类型数据：Map / Set, WeakSet / WeakMap

🔥 Map 和 Set 两个数据类型的操作方法类似。它们之间最大的不同体现在，Set 数据类型使用 add(value) 方法添加元素，而 Map 类似使用 set(key, value) 方法设置键值对，并且 Map 类似可以使用 get(key) 方法读取响应的值。

### 如何代理 Set 和 Map

::: tip Set 数据类型的代理

- 虽然操作方法和普通对象不一致，但是整体的思路是不变的，即在读取操作发生时调用 track 函数建立响应式联系；当设置操作发生时，调用 trigger 函数触发响应；
- Set.prototype.size 是一个**访问器属性**，内部通过 this 的抽象方法 RequireInternalSlot(s, [[SetData]]) 来检查 s 是否存在内部槽 [[SetData]]，这是代理之后的对象没有的，需要通过 Reflect 指定；
- 使用 delete **方法**时，先访问 p.delete ，再执行 p.delete(val) 方法。无论怎么修改 receicer，delete 方法执行时的 this 都会指向代理对象 p，而不会指向 Set 对象，因此需要把 delete 方法与原始数据对象绑定；

::: 

```js
const s = new Set([1, 2, 3])
const p = new Proxy(s, {
    get(target, key, receiver) {
      if (key === 'size') {
        // 属性访问器的上下文绑定，获取到正确的抽象方法
        return Reflect.get(target, key, target)
      }
			// 将方法与原始数据对象 target 对象绑定后返回
      return target[key].bind(target)
    }
  }
)

console.log(p.size)
p.delete(1)
```

### 建立响应联系

- add / delete 方法会间接修改 size 属性，需要触发对应的副作用函数执行
- add 方法添加的元素如果已经存在于 Set 集合当中，就不再需要触发响应了

```js
const mutableInstrumentations = {
  add(key) {
    const target = this.raw
    const hadKey = target.has(key)
    const res = target.add(key)
    // 值是否已经存在的判断，提升性能
    if (!hadKey) {
      trigger(target, key, 'ADD')
    }
    return res
  },
  delete(key) {
    const target = this.raw
    const hadKey = target.has(key)
    const res = target.delete(key)
    if (hadKey) {
      trigger(target, key, 'DELETE')
    }
    return res
  }
}

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') return target
      if (key === 'size') {
        // 读取 size 的副作用函数被收集到 ITERATE_KEY 的关联桶中
        track(target, ITERATE_KEY)
        return Reflect.get(target, key, target)
      }
      return mutableInstrumentations[key]
    }
  })
}

function trigger(target, key, type, newVal) {
  // 添加、删除这些影响 size 的方法都会触发对应的副作用函数执行
  if (type === 'ADD' || type === 'DELETE') {
    const iterateEffects = depsMap.get(ITERATE_KEY)
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }
	/*...*/
}

/*...*/
```

### 避免污染原始数据

🚀 要保证原始数据不具有响应式数据的能力，否则就意味着用户可以同时操作两种数据，这样代码就乱套了

```js
const m = new Map()
const p1 = reactive(m)
const p2 = reactive(new Set())
p1.set('p2', p2)

effect(()=> {
  // 这里通过原始数据 m 访问 p2
	console.log(m.get('p2').size)
})
// 这里使用原始数据 m 调用 set 方法，这里会触发副作用函数重新执行，不符合期望
m.get('p2').set('foo', 1)
```

🔖 原来的 set 方法内，把 value 原样设置到了原始数据 target 上。如果 value 是响应式数据，就意味着设置到原始对象上的也是响应式数据，我们把**响应式数据设置到原始数据上的行为称为数据污染**。

```js
set(key, value) {
  const target = this.raw
  const had = target.has(key)

  const oldValue = target.get(key)
  // target.set(key, value) 
  // 获取原始数据，由于 value 本身可能已经上响应式数据，所以此时 value.raw 不存在，则直接使用 value
  const rawValue = value.raw || value
  target.set(key, rawValue)

  if (!had) {
    trigger(target, key, 'ADD')
  } else if (oldValue !== value || (oldValue === oldValue && value === value)) {
    trigger(target, key, 'SET')
  }
}
```

*使用 raw 访问可能与用户自定义的 raw 属性冲突，可以考虑使用 Symbol 类型来代替*

### 处理 forEach

```js
const m = new Map([[{key: 1}, {value: 1}]])

effect(() => {
  m.forEach(function (value, key, m) {
  	console.log(key)  // {key: 1}
    console.log(value)  // {value: 1}
  })
})
```

::: tip 集合类型的 forEach 代理

- 遍历操作只与键值对的数量有关，因此任何会修改 Map 对象键值对数量(size)的操作都应该触发副作用函数重新执行。

- forEach 回调函数内的数据也要是响应式的，才能正常收集依赖
- forEach 回调函数能够接受 thisArg 作为执行时的 this 值
- forEach 与 for...in 的响应式联系都建立在 ITERATE_KEY 与副作用函数之间
- 使用 for...in 遍历集合类型，它只关心对象的键，只有增减对象的 key 才需要触发副作用函数重新执行；Map 类型 forEach 遍历时，回调函数能够取到**键和值**，所以即使是 SET 操作，也要能触发响应

:::

```js
function trigger(target, key, type, newVal) {
  /*...*/
  if (
    type === 'ADD' ||
    type === 'DELETE' ||
    // 如果操作类型是 SET，并且目标对象是 Map 类型的数据
    // 也应该触发那些与 ITERATE_KEY 相关联的副作用函数重新执行
    (
      type === 'SET' &&
      Object.prototype.toString.call(target) === '[object Map]'
    )
  ) {
    const iterateEffects = depsMap.get(ITERATE_KEY)
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }
  /*...*/
}

const mutableInstrumentations = {
  /*...*/
  forEach(callback, thisArg) {
    const wrap = (val) => typeof val === 'object' ? reactive(val) : val
    const target = this.raw
    track(target, ITERATE_KEY)
    // 传递给回调函数的参数也要是响应式的，才能收集依赖
    target.forEach((v, k) => {
      // forEach 方法能够指定执行时的 this
      callback.call(thisArg, wrap(v), wrap(k), this)
    })
  }
}

/*...*/
```

### 迭代器方法

```js
const m = new Map([
	['key1', 'value1'],
	['key2', 'value2']
])

for (const [key, value] of m.entries()) { console.log(key, value) }
for (const [key, value] of m) { console.log(key, value) }

const itr = m[Symbol.iterator]()
console.log(itr.next())  // { value: ['key1', 'value1'], done: false}
console.log(itr.next())  // { value: ['key2', 'value2'], done: false}
console.log(itr.next())  // { value: undefined, done: true}
```

::: tip 集合类型的迭代器方法代理

- 集合类型有三个迭代器**方法**：entries、keys、value
- Map 或 Set 类型本身部署了 Symbol.iterator 方法，可以使用 for...of 进行迭代，也可以直接调用该方法生成迭代器
- 为了使用代理对象能够正常迭代，要拦截 Symbol.iterator 属性返回原迭代器方法（满足迭代协议才能迭代）
- 迭代产生的值如果是可代理的，也要将其封装成响应式数据
- 为了追踪 for...of 对数据的迭代操作，需要调用 track 函数，让副作用函数也 ITERATE_KEY 建立联系
- 因为 p.entries 与 p[Symbol.iterator] 等价，可以使用一样的方式处理
- 可迭代指的是一个对象实现了 Symbol.iterator 方法，而迭代器协议指的是一个对象实现了 next 方法。一个对象可以同时实现可迭代协议和迭代器协议

:::

```js
const mutableInstrumentations = {
  [Symbol.iterator]: iterationMethod,
  entries: iterationMethod,
}

function iterationMethod() {
  // 获取原始数据对象 target
  const target = this.raw
  // 获取到原始迭代器方法
  const itr = target[Symbol.iterator]()

  const wrap = (val) => typeof val === 'object' ? reactive(val) : val
	// 对于迭代操作的依赖收集
  track(target, ITERATE_KEY)

  // 将其返回
  return {
    // 迭代器协议：对象实现 next 方法
    next() {
      const { value, done } = itr.next()
      return {
        // callback 参数响应处理
        value: value ? [wrap(value[0]), wrap(value[1])] : value,
        done
      }
    },
    // 可迭代协议：对象实现了 Symbol.iterator 方法
    [Symbol.iterator]() {
      return this
    }
  }
}
```

### values 与 keys 方法

::: tip 集合类型 values、keys 迭代器方法代理

-  values 和 keys 方法是类似的，不同在于处理的是键还是值
- Map数据类型下，SET 操作会触发与 ITERATE_KEY 关联的副作用函数。对于 values 或 entries 方法是必需的，但是对于  keys 方法来说是没有必要的。 SET 操作不会使 keys 方法有任何副作用发生。（使用 MAP_KEY_ITERATE_KEY 建立 keys 的响应式关联）

:::

```js
const bucket = new WeakMap()
const ITERATE_KEY = Symbol()
const MAP_KEY_ITERATE_KEY = Symbol()

function trigger(target, key, type, newVal) {
  // ...
  
  if ((
    // 操作类型为 ADD 或 DELETE
    type === 'ADD' || type === 'DELETE') &&
      // 并且是 Map 类型的数据
    Object.prototype.toString.call(target) === '[object Map]'
  ) {
    // 取出那些与 MAP_KEY_ITERATE_KEY 相关联的副作用函数并执行
    const iterateEffects = depsMap.get(MAP_KEY_ITERATE_KEY)
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }
  
  // ...
}

const mutableInstrumentations = {
  // ...
  keys: keysIterationMethod,
  values: valuesIterationMethod,
}

function valuesIterationMethod() {
  const target = this.raw
  // 获取原始的 values 方法返回的迭代器
  const itr = target.values()
  const wrap = (val) => typeof val === 'object' ? reactive(val) : val
  // entries、values 方法依旧与 ITERATE_KEY 建立响应联系
  track(target, ITERATE_KEY)
  return {
    next() {
      const { value, done } = itr.next()
      return {
        value: wrap(value),
        done
      }
    },
    [Symbol.iterator]() {
      return this
    }
  }
}

function keysIterationMethod() {
  const target = this.raw
  // 获取原始的 keys 方法返回的迭代器
  const itr = target.keys()
  const wrap = (val) => typeof val === 'object' ? reactive(val) : val
  // keys 方法与 MAP_KEY_ITERATE_KEY 建立响应联系
  track(target, MAP_KEY_ITERATE_KEY)
  return {
    next() {
      const { value, done } = itr.next()
      return {
        value: wrap(value),
        done
      }
    },
    [Symbol.iterator]() {
      return this
    }
  }
}

/*...*/
```

