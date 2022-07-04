# 响应系统的作用与实现

Vue.js 3 采用 Proxy 实现响应式数据

## 响应式数据与副作用函数

### 副作用函数

- 副作用函数指的是会产生副作用的函数；
- 当函数的执行直接或间接影响其他函数的执行，这时我们就说函数产生了副作用；
- 副作用很容易产生，例如一个函数修改了全局变量，这也是一个副作用。

```js
let val = 1

function effect() {
  val = 2 // 修改全局变量，产生副作用
  document.body.innerText = 'hello' // 修改了一个任何函数都可以读取或者设置的内容
}
```

### 响应式数据

```js
const obj = { text: 'hello' }
function effect() {
	// effect 函数的执行会读取 obj.text
	document.body.innerText = obj.text
}

obj.text = 'new value' // 修改 obj.text 的值，同时希望副作用函数会重新执行
```

🔥 当数据的变化能够使对应的副作用函数自动重新执行，那么该数据 obj 对象就是响应式数据

## 响应式数据的基本实现

- 当副作用函数 effect 执行时，会触发字段 obj.text 的读取操作；
- 当修改 obj.text 当值时，会触发字段 obj.text 的设置操作；

```js
// 存储副作用函数的桶
const bucket = new Set()

// 原始数据
const data = { text: 'hello world' }
// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数 effect 添加到存储副作用函数的桶中
    bucket.add(effect)
    // 返回属性值
    return target[key]
  },
  // 拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal
    // 把副作用函数从桶里取出并执行
    bucket.forEach(fn => fn())
  }
})

// ---------------------------------

// 副作用函数
function effect() {
  document.body.innerText = obj.text
}
// 首次执行副作用函数，收集依赖
effect()
// 修改数据，自动执行副作用函数
setTimeout(() => {
  obj.text = 'new val'
})
```

> 当 setter 拦截设置并执行副作用函数时，会再次触发 getter，bucket Set 数据可以保证副作用函数的收集不重复

## 完善的响应系统

::: tip 一个响应系统的工作流程如下

- 当读取操作发生时，将副作用函数收集到”桶“中；
- 当设置操作发生时，从”桶“中取出副作用函数并执行；

:::

### 副作用函数注册机制

::: details 注册副作用函数

基本实现硬编码了副作用函数的名字（effect），它甚至还有可能为匿名函数，为了解决这个问题，需要提供一个用来注册副作用函数的机制：

1. **手动执行** effect 注册副作用函数
2. 先把副作用函数赋值到全局变量 activeEffect
3. 然后执行真正的副作用函数触发 Proxy 的 get
4. get 拦截器直接读取全局变量实现依赖收集：track(target, key)

:::

### WeakMap

🌐 [WeakMap (opens new window)](https://www.ijerrychen.com/javascript/map.html#weakmap)

WeakMap 对 key 是弱引用，不影响垃圾回收的工作。根据这个特性可知，一旦 key 被垃圾回收器回收，那么对应的键和值就访问不到了。

所以 WeakMap 经常用于存储那些只有当 key 所引用的对象存在时（没有被回收）才有价值的信息。

```js
// 存储副作用函数的桶
const bucket = new WeakMap()

// 原始数据
const data = { text: 'hello world' }
// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
    track(target, key)
    // 返回属性值
    return target[key]
  },
  // 拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal
    // 把副作用函数从桶里取出并执行
    trigger(target, key)
  }
})

function track(target, key) {
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  effects && effects.forEach(fn => fn())
}

// 用一个全局变量存储当前激活的 effect 函数
let activeEffect
function effect(fn) {
  // 当调用 effect 注册副作用函数时，将副作用函数复制给 activeEffect
  activeEffect = fn
  // 执行副作用函数
  fn()
}
```

> WeakMap => Map => Set

## 分支切换与cleanup

### 分支切换

- 三元表达式首次真值会导致 data 的两个字段都把当前副作用函数收集为依赖，也就是说 data 任何一个字段的更改都会导致副作用函数的重新执行
- 但是，当 ok 改变为 false ，这里产生了遗留的副作用函数。实际上我们希望只有 text 字段保留着当前这个副作用函数依赖。

```js
const data = { ok: true, text: 'hello' }
const obj = new Proxy(data, { /*...*/ })

effect(function effectFn() {
	document.body.innerText = obj.ok ? obj.text : 'not'
})
```

所以，我们需要**重新建立联系**，在副作用函数执行时，先把它与所有关联的依赖集合中删除，执行后便重新收集了新一轮的依赖。

✅增加 activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合

### Set 循环问题

在调用 forEach 遍历 Set 集合时，如果一个值已经被访问过，但该值被删除并重新添加到集合，如果此时 forEach 遍历没有结束，那么该值会被重新访问。

✅这种情况下会出现死循环，可以构造一个额外的 Set 集合并遍历它

```js
const set = new Set([1,2,3])

const newSet = new Set(set)
newSet.forEach(item => {
  set.delete(1)
  set.add(1)
  console.log(item)
})
```

> chrome 调试目前好像没有复现这个问题

### 最终代码

```js
// 存储副作用函数的桶
const bucket = new WeakMap()

// 原始数据
const data = { ok: true, text: 'hello world' }
// 对原始数据的代理
const obj = new Proxy(data, {
    // 拦截读取操作
    get(target, key) {
        // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
        track(target, key)
        // 返回属性值
        return target[key]
    },
    // 拦截设置操作
    set(target, key, newVal) {
        // 设置属性值
        target[key] = newVal
        // 把副作用函数从桶里取出并执行
        trigger(target, key)
    }
})

function track(target, key) {
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

function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const effects = depsMap.get(key)
    // 声明一个新 Set 进行遍历操作
    const effectsToRun = new Set()
    effects && effects.forEach(effectFn => effectsToRun.add(effectFn))
    // effectFn() 的执行会重新触发依赖收集 track
    effectsToRun.forEach(effectFn => effectFn())
    // effects && effects.forEach(effectFn => effectFn())
}

// 用一个全局变量存储当前激活的 effect 函数
let activeEffect
function effect(fn) {
    const effectFn = () => {
        // 执行副作用函数进行依赖收集之前，先清空历史依赖数据
        cleanup(effectFn)
        // 当调用 effect 注册副作用函数时，将副作用函数复制给 activeEffect
        activeEffect = effectFn
        fn()  // 依赖收集
    }
    // activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
    effectFn.deps = []
    // 执行副作用函数，初始的依赖集合声明与依赖收集
    effectFn()
}

function cleanup(effectFn) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        // deps 即某个对象属性下的依赖桶
        const deps = effectFn.deps[i]
        deps.delete(effectFn)
    }
    effectFn.deps.length = 0  // 最后需要重置 effectFn.deps 数组
}
```

## 嵌套的 effect 与 effect 栈

组件嵌套就会出现 effect 的嵌套，全局变量 activeEffect 在这个过程中会被嵌套的 effect 覆盖，可以通过一个**函数栈**解决

```js{4,12,15-16}
// 用一个全局变量存储当前激活的 effect 函数
let activeEffect
// effect 栈
const effectStack = []

function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    // 当调用 effect 注册副作用函数时，将副作用函数复制给 activeEffect
    activeEffect = effectFn
    // 在调用副作用函数之前将当前副作用函数压栈
    effectStack.push(effectFn)
    fn()
    // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并还原 activeEffect 为之前的值
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  // activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
  effectFn.deps = []
  // 执行副作用函数
  effectFn()
}
```

## 避免无限递归循环

```js
const data = { foo: 1 }
obj = new Proxy(data, {/*...*/})

effect(() => obj.foo++)
```

✅ 当副作用函数内**同时**发生了**读和写**，会导致 get 与 set 的死循环，我们需要为 trigger 的执行增加守卫条件：如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不执行：

```js{9-11}
function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    // 守卫条件
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  effectsToRun.forEach(effectFn => effectFn())
}
```

## 调度执行

✅ **可调度**就是指当 trigger 动作触发副作用函数的执行时，有能力决定副作用函数执行的**时机**、**次数**以及**方式**。

::: details 调度器的实现

在执行 effect 函数的时候获得一些额外的配置信息，为 effectFn 增加一个额外的配置即可：

1. 在 effect 副作用函数注册的时候增加配置参数：options.scheduler
2. trigger 执行时，如果有 scheduler 则使用它调度执行

:::

```js{41-43,64}
const bucket = new WeakMap()

const data = { foo: 1, bar: 2 }
const obj = new Proxy(data, {
    get(target, key) {
        track(target, key)
        return target[key]
    },
    set(target, key, newVal) {
        target[key] = newVal
        trigger(target, key)
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

function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const effects = depsMap.get(key)

    const effectsToRun = new Set()
    effects && effects.forEach(effectFn => {
        if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
        }
    })
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
```

### 缓冲队列

```js
const jobQueue = new Set()
const p = Promise.resolve()

let isFlushing = false
function flushJob() {
    if (isFlushing) return
    isFlushing = true
    p.then(() => {
        // 将任务放到微任务队列中执行
        jobQueue.forEach(job => job())
    }).finally(() => {
        isFlushing = false
    })
}


effect(() => {
    console.log(obj.foo)
}, {
    scheduler(fn) {
        jobQueue.add(fn)
        flushJob()
    }
})

obj.foo++
obj.foo++  // 3
```

> 以上调度器实现：属性修改两次，中间的 2 过渡状态对应的依赖更新忽略不执行
>
> 两个副作用函数放到缓冲队列中，两次数据更新后，在微任务当中一次执行

## 计算属性 computed 与 lazy

::: details 计算属性的实现：

1. **懒计算**：计算属性不会立即执行，在需要的时候才执行。我们通过为 option 添加 lazy 属性来达到目的；同时，计算属性实际上就是副作用函数（getter）的执行结果，我们需要调整副作用函数的注册代码，返回真正副作用函数的结果。
2. **值缓存**：计算属性在 getter 函数所依赖的响应式数据变化时才需要真正执行，而不是每次获取 computed 属性时都需要执行一次副作用函数。为计算属性添加 value 字段保存执行结果，同时添加 dirty 属性，在依赖的数据变化时更改 dirty 为 true。这样，下次读取计算属性的值时，我们会重新计算真正的值。
3. **响应式**：计算属性也要能够更新对应的副作用函数。在其 value 读取时，手动调用 track 函数进行追踪，收集依赖；在计算属性依赖的响应式数据发生变化时，手动调用 trigger函数触发响应。

:::

```js
function computed(getter) {
  let value
  let dirty = true

  const effectFn = effect(getter, {
    lazy: true,
    // scheduler(effectFn)内部虽然能拿到 getter 关联数据的副作用函数，但不需要，它们有自己的更新逻辑
    // 计算属性只需要关注自己的effectFn进行更新即可，当关联数据更新时，dirty 设为 true，也就是要重新计算
    scheduler() {
      if (!dirty) {
        dirty = true
        trigger(obj, 'value')
      }
    }
  })
  
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      track(obj, 'value')
      return value
    }
  }

  return obj
}

const sumRes = computed(() => obj.foo + obj.bar)

console.log(sumRes.value)
console.log(sumRes.value)

obj.foo++

console.log(sumRes.value)

effect(() => {
  console.log(sumRes.value)
})

obj.foo++
```

## watch 的实现原理

::: details watch 的实现

1. watch 可以观测响应式数据或者一个 getter 函数：traverse函数
2. 回调函数中要能够拿到新值与旧值
3. immediate 决定是否需要立即执行回调，此时旧值时 undefined
4. flush 决定回调函数的执行时机：通过调度器和异步的微任务队列实现 post

✅ watch 的实现本质上利用了副作用函数重新执行时的**可调度性**。一个 watch 本身会创建一个 effect，当这个 effect 依赖的响应式数据发生变化时，会执行该 effect 的调度器函数，即 scheduler。这里的 scheduler 可以理解为“回调”，所以我们只需要在 scheduler 中执行用户通过 watch 函数注册的回调函数即可

:::

```js
// 观测参数处理
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return
  seen.add(value)
  for (const k in value) {
    traverse(value[k], seen)
  }

  return value
}

function watch(source, cb, options = {}) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  let oldValue, newValue

  // 执行回调，传递新值与旧值
  const job = () => {
    newValue = effectFn()
    cb(oldValue, newValue)
    oldValue = newValue
  }

  const effectFn = effect(
    // 执行 getter
    () => getter(),
    {
      lazy: true,
      scheduler: () => {
        if (options.flush === 'post') {
          const p = Promise.resolve()
          p.then(job)
        } else {
          job()
        }
      }
    }
  )
  
  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}

watch(() => obj.foo, (newVal, oldVal) => {
  console.log(newVal, oldVal)
}, {
  immediate: true,
  flush: 'post'
})

setTimeout(() => {
  obj.foo++
}, 1000)
```

## 过期的副作用

**竞态问题**对应前端也有发生的场景，比如 watch 观测 响应式数据的变化：回调函数中执行异步数据请求操作，如果因为网络问题或其他导致前面的请求比后面的晚到，就会出现数据更新错乱。

✅ 归根结底，我们需要一个让副作用函数过期的手段：watch 内部每次检测到变更之后，在副作用函数重新执行之前，先调用自定义的过期回调即可

```js{71-82}
function traverse(value, seen = new Set()) {
    if (typeof value !== 'object' || value === null || seen.has(value)) return
    seen.add(value)
    for (const k in value) {
        traverse(value[k], seen)
    }

    return value
}

function watch(source, cb, options = {}) {
    let getter
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }

    let oldValue, newValue

    let cleanup
    function onInvalidate(fn) {
        cleanup = fn
    }

    const job = () => {
        newValue = effectFn()
        if (cleanup) {
            cleanup()
        }
        cb(oldValue, newValue, onInvalidate)
        oldValue = newValue
    }

    const effectFn = effect(
        // 执行 getter
        () => getter(),
        {
            lazy: true,
            scheduler: () => {
                if (options.flush === 'post') {
                    const p = Promise.resolve()
                    p.then(job)
                } else {
                    job()
                }
            }
        }
    )

    if (options.immediate) {
        job()
    } else {
        oldValue = effectFn()
    }
}

let count = 0
function fetch() {
    count++
    const res = count === 1 ? 'A' : 'B'
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(res)
        }, count === 1 ? 1000 : 100);
    })
}

let finallyData

watch(() => obj.foo, async (newVal, oldVal, onInvalidate) => {
    let valid = true
    onInvalidate(() => {
        valid = false
    })
    const res = await fetch()

    if (!valid) return

    finallyData = res
    console.log(finallyData)
})

obj.foo++
setTimeout(() => {
    obj.foo++
}, 200);
```

