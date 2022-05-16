# 原始值的响应式方案

🔖 原始值指的是 Boolean、Number、BigInt、String、Symbol、undefined 和 null 等类型的值。

1. 在 JavaScript 中，原始值是按值传递的，而非按引用传递。这意味着，如果一个函数接收原始值作为参数，那么形参与实参之间没有引用关系，它们是两个完全独立的值，对形参的修改不会影响实参。
2. 另外 JavaScript 中的 Proxy 无法提供对原始值的代理，因此想要将原始值变成响应式数据，就必须对其做一层包裹。

## 引入 ref 的概念

```js
const wrapper = {
	value: 'vue'
}

const name = reactive(wrapper)
effect(() => console.log(name.vlaue))
name.value = 'vue3'
```

::: warning 如果使用非原始值去“包裹”原始值，会导致一些问题：

- 用户为了创建一个响应式的原始值，不得不顺带创建一个包裹对象；
- 包裹对象由用户自定义，而这意味着不规范。用户可以随意命名，例如 wrapper.value， wrapper.val 都是可以的。

::: 

🚀  为了解决以上这两个问题，我们可以封装一个函数来处理。同时，为了区分 refVal 到底是原始值的包裹对象，还是一个非原始值的响应式数据，我们为其补充了一个属性：

```js
// 封装 ref 函数专门处理原始值的响应式处理1
function ref(val) {
  const wrapper = {
    value: val
  }
	// 使用 Object.defineProperty 在 wrapper 对象上定义一个不可枚举的属性 __v_isRef，并且值为 true
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })
  // 通过 value 属性访问原始值
  return reactive(wrapper)
}

function isRef(val) {
  return val.__v_isRef === true
}
// 原始值的包裹对象
const refVal1 = ref(1)
// 非原始值的响应式数据
const refVal2 = reactive({ value: 1 })

console.log(isRef(refVal1))  // true
console.log(isRef(refVal2))  // false

effect(() => {
  console.log(refVal1.value)
})

refVal1.value = 2
```

## 响应丢失问题

🐛 展开运算符（...）会导致数据的响应丢失，而这个操作我们在 setup 返回时是经常使用的，返回的新对象如果变成了普通对象，就失去了响应能力。

我们要实现：在副作用函数内，即使通过普通对象 newObj 来访问属性值，也能过建立响应式联系：

```js
// obj 是响应式数据
const obj = reactive({foo: 1, bar: 2})

// newObj 对象下具有与 obj 对象同名的属性，并且每个属性值都是一个对象
// 该对象具有一个访问器属性 value，当读取 value 的值时，其实读取的是 obj 对象相应属性的值
const newObj = {
  foo: {
    get value() {
      return obj.foo
    }
  },
  bar: {
    get value() {
      return obj.bar
    }
  }
}

effect(() => {
  // 在副作用函数内使用新对象 newObj 读取 foo 属性值
  console.log(newObj.foo)
})

// 这时能够触发响应
obj.foo = 100
```

在副作用函数内读取 newObj.foo 时，等价于间接读取了 obj.foo 的值，这样响应式数据自然能够与副作用函数建立响应联系。

### toRef

toRef 函数接收两个参数，第一个参数 obj 是一个响应式数据，第二个参数是 obj 对象的一个键。该函数会返回一个 wrapper 对象；

🚀 为了概念上的统一，我们会将通过 toRef 或 toRefs 转换后得到的结果视为真正的 ref 数据，因此我们通过为其增加了 __v_isRef 属性的定义。

```js
function toRef(obj, key) {
  // 每个属性都是一个对象，通过属性访问器获取，从而触发代理对象的 get 拦截
  const wrapper = {
    get value() {
      return obj[key]
    },
    // 允许设置值
    set value(val) {
      obj[key] = val
    }
  }
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })

  return wrapper
}

// const obj = reactive({ foo: 1, bar: 2 })
// const refFoo = toRef(obj, 'foo')
// console.log(refFoo.value)
```

::: tip toRef 

- 实现原始值的响应式方案
- 解决响应式丢失问题

:::

### toRefs

```js
function toRefs(obj) {
  const res = {}
  for (const key in obj) {
    ret[key] = toRef(obj, key)
  }
  return res
}

// const obj = reactive({ foo: 1, bar: 2 })
// const newObj = { ...toRefs(obj) }
// console.log(newObj.foo.value)
```

## 自动脱 ref

🔖 目前的 ref 数据需要通过 value 属性访问，增加了用户的心智负担。

所谓自动脱 ref ，指的是属性的访问行为，即如果读取的属性是一个 ref，则直接将该 ref 对应的 value 属性值返回。同样的，设置属性的值也应该有自动为 ref 设置值的能力。

🚀 要实现这个功能，需要使用 Proxy 为 newObj 创建一个代理对象，通过代理来实现最终目标：

```js
function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)
      // 自动脱 ref 的实现：如果读取的值是 ref，则返回它的 value 属性值
      return value.__v_isRef ? value.value : value
    },
    set(target, key, newValue, receiver) {
      // 通过 target 读取真实值
      const value = target[key]
      // 如果值是 Ref，则设置对应的 value 属性值
      if (value.__v_isRef) {
        value.value = newValue
        return true
      }
      return Reflect.set(target, key, newValue, receiver)
    }
  })
}

const newObj = proxyRefs({ ...toRefs(obj) })
```

在 Vue.js 中，reactive 也同样实现了 脱 ref 的能力：

```js
const count = ref(0)
const obj = reactive({ count })

obj.count // 0
```

