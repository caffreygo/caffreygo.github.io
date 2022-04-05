# Vue

## 数据驱动

![](./img/new-vue.png)

1. Vue构造函数，在原型和实例中添加全局API，初始化各部分功能

2. new Vue之后通过init方法处理各类数据，$options

3. 实例挂载，通过 `$mount` 实例方法挂载 `vm` 

      `mountComponent` 核心就是先实例化一个渲染`Watcher`，在它的回调函数中会调用 `updateComponent` 方法，在此方法中调用 `vm._render` 方法先生成虚拟 Node

      ```javascript
      updateComponent = () => {
        vm._update(vm._render(), hydrating)
      }  
      ```

3. 如果使用了模板template或者SFC，需要通过compiler编译成render函数

4. render函数，内部使用createElement方法返回vnode
   
6. 更新 DOM

   `_update` 是实例的一个私有方法，它被调用的时机有 2 个，一个是首次渲染，一个是数据更新的时候。该方法内部最终调用了patch方法进行节点的更新：
   
   ```javascript
   if (!prevVnode) {
     // initial render
     vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
   } else {
     // updates  diff...
     vm.$el = vm.__patch__(prevVnode, vnode)
   }
   ```

## 组件化

### createComponent

render函数的createElement的，碰到组件会走`createComponent`，这个函数的作用:

1. 构造子类构造函数：Ctor,通过Vue.extend(组件配置对象)，中间会做一些配置的合并，最终生成一个构造函数即Vue的子类
2. 安装组件钩子函数：将钩子函数进行处理合并，放到vnodeData参数中
3. 实例化：vnode = new VNode(name, vnodeData, …, { Ctro, propsData, listeners, tag, children }, …)
最终生成的组件**vnode**的children是空的，同时vnodeData携带着钩子函数，还有组件构造函数，组件信息等等

## 响应式数据原理

### 构造函数

传入的参数就是一个对象: **options**

```js
new Vue({
  el: "#app",
  router,
  store,
  render: (h) => h(App),
});
```

- 挂载init方法

  ```js
  // src/index.js
  import { initMixin } from "./init.js";
  
  // Vue就是一个构造函数 通过new关键字进行实例化
  function Vue(options) {
    // 这里开始进行Vue初始化工作
    this._init(options);
  }
  // _init方法是挂载在Vue原型的方法 通过引入文件的方式进行原型挂载需要传入Vue
  // 此做法有利于代码分割
  initMixin(Vue);
  
  export default Vue;
  ```

- initMixin实现：在Vue构造函数的原型对象上声明**_init**方法，供 Vue 实例调用

  ```js
  // src/init.js
  import { initState } from "./state";
  export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      const vm = this;
      // 这里的this代表调用_init方法的对象(实例对象)
      // this.$options就是用户new Vue的时候传入的属性
      vm.$options = options;
      // 初始化状态
      initState(vm);
    };
  }
  ```

### initState初始化状态

顺序：**prop > methods > data > computed > watch**

```javascript
export function initState(vm) {
  // 获取传入的数据对象
  const opts = vm.$options;
  if (opts.props) {
    initProps(vm);
  }
  if (opts.methods) {
    initMethod(vm);
  }
  if (opts.data) {
    // 初始化data
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm);
  }
}
```

### Observer 数据劫持

模板使用数据等同于组件使用数据，所以当数据发生变化时，会将通知发送到组件，然后组件内部再通过虚拟DOM重新渲染

```js
// src/obserber/index.js
class Observer {
  // 观测值
  constructor(value) {
    this.walk(value);
  }
  walk(data) {
    // 对象上的所有属性依次进行观测
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = data[key];
      defineReactive(data, key, value);
    }
  }
}
// Object.defineProperty数据劫持核心 兼容性在ie9以及以上
function defineReactive(data, key, value) {
  observe(value); // 递归关键
  // --如果value还是一个对象会继续走一遍odefineReactive 层层遍历一直到value不是对象才停止
  //   思考？如果Vue数据嵌套层级过深 >>性能会受影响
  Object.defineProperty(data, key, {
    get() {
      console.log("获取值");
      return value;
    },
    set(newValue) {
      if (newValue === value) return;
      console.log("设置值");
      // 此处可以进行对应的视图更新通知
      value = newValue;
    },
  });
}
export function observe(value) {
  // 如果传过来的是对象或者数组 进行属性劫持
  if (
    Object.prototype.toString.call(value) === "[object Object]" ||
    Array.isArray(value)
  ) {
    return new Observer(value);
  }
}
```

#### 缺点

`Object.defineProperty`

- 对象新增或者删除的属性无法被 set 监听到
- 只有对象本身存在的属性修改才会被劫持

#### 数组数据劫持

1. 这样递归的方式其实无论是对象还是数组都进行了观测 
2. 但是我们想一下此时如果 data 包含数组比如 a:[1,2,3,4,5] 那么我们根据下标可以直接修改数据也能触发 set 
3. 但是如果一个数组里面有上千上万个元素 每一个元素下标都添加 get 和 set 方法 这样对于**性能**来说是承担不起的
4. 所以此方法只用来劫持对象

```js
// src/obserber/index.js
import { arrayMethods } from "./array";
class Observer {
  constructor(value) {
    if (Array.isArray(value)) {
      // 这里对数组做了额外判断
      // 通过重写数组原型方法来对数组的七种方法进行拦截   value.__proto__ === Array.prototype
      value.__proto__ = arrayMethods; 
      // 如果数组里面还包含数组 需要递归判断
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
  observeArray(items) {
    for (let i = 0; i < items.length; i++) {
      observe(items[i]);
    }
  }
}
```

因为对数组下标的拦截太**浪费性能** 对 Observer 构造函数传入的数据参数增加了数组的判断

```javascript
// src/obserber/index.js
class Observer {
  // 观测值
  constructor(value) {
    Object.defineProperty(value, "__ob__", {
      //  值指代的就是Observer的实例
      value: this,
      //  不可枚举
      enumerable: false,
      writable: true,
      configurable: true,
    });
  }
}
```

对数组原型重写之前咱们先要理解这段代码：

1. 这段代码的意思就是给每个响应式数据增加了一个不可枚举的__ob__属性
2. 并且指向了 Observer 实例 （指向自身value）
3. 那么我们首先可以根据这个属性来防止已经被响应式观察的数据反复被观测 (响应式标记)
4. 其次 响应式数据可以使用__ob__来获取 Observer 实例的相关方法 这对数组很关键

```javascript
// src/obserber/array.js
// 先保留数组原型
const arrayProto = Array.prototype;
// 然后将arrayMethods继承自数组原型
// 这里是面向切片编程思想（AOP）--不破坏封装的前提下，动态的扩展功能
export const arrayMethods = Object.create(arrayProto);
let methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "reverse",
  "sort",
];
methodsToPatch.forEach((method) => {
  arrayMethods[method] = function (...args) {
    //   这里保留原型方法的执行结果
    const result = arrayProto[method].apply(this, args);
    // 这句话是关键
    // this代表的就是数据本身 比如数据是{a:[1,2,3]} 那么我们使用a.push(4)  this就是a  ob就是a.__ob__ 这个属性就是上段代码增加的 代表的是该数据已经被响应式观察过了指向Observer实例
    const ob = this.__ob__;

    // 这里的标志就是代表数组有新增操作
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
      default:
        break;
    }
    // 如果有新增的元素 inserted是一个数组 调用Observer实例的observeArray对数组每一项进行观测
    if (inserted) ob.observeArray(inserted);
    // 之后咱们还可以在这里检测到数组改变了之后从而触发视图更新的操作--后续源码会揭晓
    return result;
  };
});
```

### 总结

![](./img/initData.png)

## props处理

### props规范化

::: tip

- props规范化：把各种不是规范格式的形式，规范化为规范格式，方便`Vue.js`在后续的过程中处理`props`
- `props`规范化的过程发生在`this._init()`方法中的`mergeOptions`合并配置中，调用normalizeProps，针对数组和对象进行不同的处理

:::

```javascript
function normalizeProps (options: Object, vm: ?Component) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        // 如果prop不是字符串表示的键名，报错
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}
```

- 数组：类型检测、驼峰处理、生成固定键值对的对象

  ```js
  // 规范化前
  export default {
    props: ['age', 'nick-name']
  }
  
  // 规范化后
  export default {
    props: {
      age: {
        type: null
      },
      nickName: {
        type: null
      }
    }
  }
  ```

- 对象：遍历驼峰处理、直接使用普通对象值或者创建`{ type: Type }`格式的对象

  ```js
  // 规范化前
  export default {
    props: {
      name: String,
      age: Number
    }
  }
  
  // 规范化后
  export default {
    props: {
      name: {
        type: String
      },
      age: {
        type: Number
      }
    }
  }
  ```

### props初始化

![](./img/initProps.png)

::: tip props响应式

​		在开发环境下，props的响应式劫持了setter方法
​		这样做是为了保证props为**单项数据流：**既我们不能在子组件中直接修改父组件传递的props值

::: 

#### props校验

```js
export function validateProp (
  key: string,
  propOptions: Object,
  propsData: Object,
  vm?: Component
): any {
  const prop = propOptions[key]
  const absent = !hasOwn(propsData, key)  // 父组件没有传入prop
  let value = propsData[key]
  // boolean处理
  const booleanIndex = getTypeIndex(Boolean, prop.type)
  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      // Boolean没有传入并且没有默认值 => false
      value = false
    } else if (value === '' || value === hyphenate(key)) {
      // 传入为空字符串或者为fixed="fixed"的情况
      // 根据Type类型和优先级确定是否要设置为true
      const stringIndex = getTypeIndex(String, prop.type)
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true
      }
    }
  }
  // 默认值赋值，响应式
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key)
    // since the default value is a fresh copy,
    // make sure to observe it.
    const prevShouldObserve = shouldObserve
    toggleObserving(true)
    observe(value)
    toggleObserving(prevShouldObserve)
  }
  if (
    process.env.NODE_ENV !== 'production' &&
    // skip validation for weex recycle-list child component props
    !(__WEEX__ && isObject(value) && ('@binding' in value))
  ) {
    // 断言，校验
    assertProp(prop, key, value, vm, absent)
  }
  return value
}
```

### props更新

当父组件值更新时，子组件的值也会发生改变，同时触发子组件的**重新渲染**。

我们先跳过父组件的具体编译逻辑，直接看父组件的值更新，改变子组件`props`值的步骤：

```js
export function updateChildComponent (
  vm: Component,
  propsData: ?Object,
  listeners: ?Object,
  parentVnode: MountedComponentVNode,
  renderChildren: ?Array<VNode>
) {
  // 省略代码
  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false)
    const props = vm._props
    const propKeys = vm.$options._propKeys || []
    // 遍历`propsKey`来重新对子组件`props`进行校验求值，最后赋值
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i]
      const propOptions: any = vm.$options.props
      // 检验最终会返回value，该赋值操作触发setter，触发子组件的重新渲染
      props[key] = validateProp(key, propOptions, propsData, vm)
    }
    toggleObserving(true)
    // keep a copy of raw propsData
    vm.$options.propsData = propsData
  }
}
```

代码分析：

1. 以上`vm`实例为子组件，`propsData`为父组件中传递的`props`的值，而`_propKeys`是之前`props`初始化过程中缓存起来的所有的`props`的key。
2. 在父组件值更新后，会通过遍历`propsKey`来重新对子组件`props`进行**校验求值**，最后赋值。

以上代码就是子组件`props`更新的过程，在`props`更新后会进行子组件的重新渲染，这个重新渲染的过程分两种情况：

- 普通`props`值被修改：当`props`值被修改后，其中有段代码`props[key] = validateProp(key, propOptions, propsData, vm)`根据响应式原理，会触发属性的`setter`，进而子组件可以重新渲染。
- 对象`props`内部属性变化：当这种情况发生时，并没有触发子组件`prop`的更新，但是在子组件渲染的时候读取到了`props`，因此会收集到这个`props`的`render watcher`，当对象`props`内部属性变化的时候，根据响应式原理依然会触发`setter`，进而子组件可以重新进行渲染

### toggleObserving作用

`toggleObserving`是定义在`src/core/observer/index.js`文件中的一个函数，其代码很简单：

```js
export let shouldObserve: boolean = true
export function toggleObserving (value: boolean) {
  shouldObserve = value
}
```

它的作用就是修改当前模块的`shouldObserve`变量，用来控制在`observe`的过程中是否需要把当前值变成一个`observer`对象。

```js
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```

接下来我们来分析，在处理`props`的过程中，什么时候`toggleObserving(true)`，什么时候`toggleObserving(false)`以及为什么需要这样处理？

```js
function initProps (vm: Component, propsOptions: Object) {
  if (!isRoot) {
    toggleObserving(false)
  }
  // 省略defineReactive的过程
  toggleObserving(true)
}
```

`props`初始化的时候：
我们可以看到在最开始判断了当为**非根实例**(子组件)的时候，进行了`toggleObserving(false)`的操作，这样做的目的是因为：当非根实例的时候，组件的`props`来自于父组件。当`props`为对象或者数组时，根据响应式原理，我们会递归遍历子属性然后进行`observe(val)`，而正是因为`props`来源于父组件，这个过程其实已经在父组件执行过了，如果不做任何限制，那么会在子组件中又重复一次这样的过程，因此这里需要`toggleObserving(false)`，用来避免递归`props`子属性的情况，这属于响应式优化的一种手段。在代码最后，又调用了`toggleObserving(true)`，把`shouldObserve`的值还原。

`props`校验的时候：
我们先来看`props`提供了`default`默认值，且默认值返回了对象或者数组。

```js
export default {
  props: {
    point: {
      type: Object,
      default () {
        return {
          x: 0,
          y: 0
        }
      }
    },
    list: {
      type: Array,
      default () {
        return []
      }
    }
  }
}
```

对于以上`point`和`list`**取默认值**的情况，这个时候的`props`值与父组件没有关系，那么这个时候我们**需要**`toggleObserving(true)`，在`observe`后再把`shouldObserve`变量设置为原来的值。

```js
export function validateProp () {
  // 省略代码
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key)
    const prevShouldObserve = shouldObserve 
    toggleObserving(true)
    observe(value)
    toggleObserving(prevShouldObserve)
  }
}
```

在`props`更新的时候：
当父组件更新的时候，会调用`updateChildComponent()`方法，用来更新子组件的`props`值，这个时候其实和`props`初始化的逻辑一样，我们同样不需要对指向父组件的对象或数组`props`进行递归子属性`observe`的过程，因此这里需要执行`toggleObserving(false)`。

```js
export function updateChildComponent () {
  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false)
    const props = vm._props
    const propKeys = vm.$options._propKeys || []
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i]
      const propOptions: any = vm.$options.props // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm)
    }
    toggleObserving(true)
    vm.$options.propsData = propsData
  }
}
```

### 整体处理流程

![](./img/props.png)

## methods处理

对于method的处理处在props之后

```js
export function initState (vm: Component) {
  // 省略代码
  const opts = vm.$options
  if (opts.methods) initMethods(vm, opts.methods)
}
```

```js
function initMethods (vm: Component, methods: Object) {
  const props = vm.$options.props
  for (const key in methods) {
    // 开发环境下的一些判断
    if (process.env.NODE_ENV !== 'production') {
      // method不是函数类型
      if (typeof methods[key] !== 'function') {
        warn(
          `Method "${key}" has type "${typeof methods[key]}" in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        )
      }
      // 相同名字已经在props声明使用到
      if (props && hasOwn(props, key)) {
        warn(
          `Method "${key}" has already been defined as a prop.`,
          vm
        )
      }
      // 命名和已有的实例方法冲突
      if ((key in vm) && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        )
      }
    }
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)
  }
}
```

initMethods在进行一些检查后核心代码是将方法的this绑定到vm组件实例上，这样在method函数内部可以很方便访问当前实例的其他属性。

```js
// function noop() {}  空函数

vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)
```

## data处理

data的前置处理，区分是根实例还是子组件

```js
export function initState (vm: Component) {
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
}
```

```js
function initData (vm: Component) {
  let data = vm.$options.data
  // data为函数，则调用返回对象
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    // 命名不能和method冲突
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    // 命名不能和props冲突
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    // 不能以$和_开头
    } else if (!isReserved(key)) {
      // _data访问代理
      proxy(vm, `_data`, key)
    }
  }
  // 数据响应式
  observe(data, true /* asRootData */)
}
```

initData的步骤主要如下

- 类型判断取值 `Function.call(vm,vm)`
- 命名冲突判断
- proxy访问代理
- 数据响应式

## computed处理

### computed初始化

```js
  // _computedWatchers缓存当前实例的所有computed对应的watcher
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()

  for (const key in computed) {
    const userDef = computed[key]
    // 函数直接取，否则取对象的get函数
    const getter = typeof userDef === 'function' ? userDef : userDef.get
   	// 开发环境下的null判断和报错
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // 创建对应的Watcher实例
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      // 如果命名不存在vm上则声明computed
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      // 如果已经存在于实例上，判断是否和data/props冲突
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
```

