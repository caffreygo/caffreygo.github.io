# 异步组件与函数式组件

**异步组件**：以异步的方式去加载并渲染一个组件；

**函数式组件**：无状态，编写简单且直观。

## 异步组件要解决的问题

✅ 异步组价在**页面性能**、**拆包**以及**服务端下发组件**等场景中尤为重要。

异步组件的实现实际上并不需要框架层面的支持，用户完全可以自行实现：

:::: code-group
::: code-group-item 同步App

```js
import App from 'App.vue'
createApp(App).mount('#app')
```

:::
::: code-group-item 异步App

```js
const loader = () => import('App.vue')
loader().then(App => {
    createApp(App).mount('#app')
})
```

:::

::: code-group-item 异步组件

```html
<template>
	<ComA />
    <component :is='asyncComp' />
</template>

<script>
import { shallowRef } from 'vue'
import ComA from 'CompA.vue'
    
export default {
    components: { ComA },
    setup() {
        const asyncComp = shallowRef(null)
        
        // 异步加载 ComB 组件
        import('CompB.vue').then(CompB => asyncComp.value = CompB)
        
        return { asyncComp }
    }
}
</script>
```

:::

::::

用户虽然可以自己实现组件的异步加载和渲染，但整体的实现还是比较复杂的。

::: warning 一个完善的异步组件还需要考虑以下几个方面：

- 如果组件加载失败或加载超时，是否要渲染 Error 组件？
- 组件加载时，是否要显示占位的内容？例如渲染一个 loading 组件。
- 组件加载的速度可能很快，也可能很慢，是否要设置一个延迟展示 Loading 组件的时间？如果组件在 200ms 内没有加载成功才展示 Loading 组件，这样可以避免由组件加载过快所导致的闪烁。
- 组件加载失败后，是否需要重试？

:::

::: tip 我们需要在框架层面为异步组件提供更好的封装支持，与之对应能力如下：

- 允许用户指定加载出错时要渲染的组件。
- 允许用户指定 Loading 组件，以及展示该组件的延迟时间。
- 允许用户设置加载组件的超时时长。
- 组件加载失败时，为用户提供重试的能力。

:::

## 异步组件的实现原理

### 封装 defineAsyncComponent 函数

异步组件本质上是通过封装手段来实现友好的用户接口，从而降低用户层面的使用复杂度。

:::: code-group
::: code-group-item 使用

```html
<template>
    <AsyncComp />
</template>

<script>
    export default {
        components: {
            // defineAsyncComponent 定义异步组件，它接收一个加载器作为参数
            AsyncComp: defineAsyncComponent(() => import('CompA'))
        }
    }
</script>
```

:::
::: code-group-item defineAsyncComponent

```js
// defineAsyncComponent 函数用于定义一个异步组件，它接收一个加载器作为参数
function defineAsyncComponent(loader) {
    // 一个存储异步组件的变量
    let InnerComp = null
    // 返回一个包装组件
    return {
        name: 'AsyncComponentWrapper',
        setup() {
            // 是否加载成功的标志
            const loaded = ref(false)
            // 执行加载器，返回一个 Promise 实例
            loader().then(c => {
                InnerComp = c
                loaded.value = true
            })
            // 如果异步组件加载成功，则渲染该组件，否则渲染一个占位内容
            return () => {
                return loaded.value 
                    ? { type: InnerComp } 
                : { type: Text, children: '...' }
            }
        }
    }
}
```

:::

::::

::: tip defineAsyncComponent

- defineAsyncComponent 函数本质上是一个**高阶组件**，它的返回值是一个**包装组件**。
- 包装组件会根据加载器的内容来决定渲染什么内容。如果加载器成功地加载了组件，则渲染被加载的组件，否则会渲染一个占位内容。
- 通常占位内容是一个注释节点。组件没有被加载成功时，页面中会渲染一个注释节点来占位。这里使用了一个空文本节点来占位。

:::

### 超时与 Error 组件

✅ 异步组件通常以**网络请求**的形式进行加载。前端发送一个 HTTP 请求，请求下载组件的 JavaScript 资源，或者从服务端直接获取组件数据。

网络请求可能会受网络环境的影响，由此我们需要为用户提供指定**请求超长**的能力，如果加载组件的时间超过了指定时长，会触发指定的错误。这时如果用户配置了 Error 组件，则会渲染该组件。

:::: code-group
::: code-group-item 用户接口

```js
const AsyncComp = defineAsyncComponent({
	loader: () => import('CompA.vue'),  // 指定异步组价的加载器
    timeout: 2000,  // 超时时长，单位为 ms
    errorComponent: MyErrorComp  // 指定出错时要渲染的组件
})
```

:::
::: code-group-item defineAsyncComponent

```js{17,25-30,32,42-44}
function defineAsyncComponent(options) {
    // options 可以是配置项，也可以是加载器
    if (typeof options === 'function') {
        options = {
            loader: options
        }
    }

    const { loader } = options
    let InnerComp = null

    return {
        name: 'AsyncComponentWrapper',
        setup() {
            const loaded = ref(false)
            // 代表是否超时
            const timeout = ref(false)

            load().then(c => {
                InnerComp = c
                loaded.value = true
            })

            let timer = null
            if (options.timeout) {
                // 如果指定了超时时长，则开启一个定时器
                timer = setTimeout(() => {
                    timeout.value = true
                }, options.timeout)
            }
            // 包装组件被卸载时清除定时器
            onMounted(() => clearTimeout(timer))

            const placeholder = { type: Text, children: '' }

            return () => {
                if (loaded.value) {
                    // 如果组件加载成功，则渲染被加载的组件
                    return { type: InnerComp }
                } else if (timeout.value) {
                    // 如果加载超时，并且用户指定了 Error 组件，则渲染该组件
                    return options.errorComponent
                    ? { type: options.errorComponent } 
                    : placeholder
                }
                return placeholder
            }
        }
    }
}
```

- 需要一个标志变量来标识异步组件的加载是否已经超时，即 `timeout.value`。
- 开始加载组件的同时，开启一个定时器进行计时。当加载超时之后，将 `timeout.value` 的值设置为 `true`，代表加载已经超时。这里需要注意的是，当包装组件被卸载时，需要清除定时器。
- 包租组件根据 `loaded` 变量的值以及 `timeout` 变量的值来决定具体的渲染内容。如果异步组件加载成功，则渲染被加载的组件；如果异步组件加载超时，并且用户指定了 Error 组件，则渲染 Error 组件。

:::

::: code-group-item 代码优化

```js{17,23,29-30,39-42}
function defineAsyncComponent(options) {
    // options 可以是配置项，也可以是加载器
    if (typeof options === 'function') {
        options = {
            loader: options
        }
    }

    const { loader } = options
    let InnerComp = null

    return {
        name: 'AsyncComponentWrapper',
        setup() {
            const loaded = ref(false)
            // 定义 error,当错误发生时，用来存储错误对象
            const error = shallowRef(null)

            loader().then(c => {
                InnerComp = c
                loaded.value = true
                // 添加 catch 语句来捕获加载过程中的错误
            }).catch(err => error.value = err)

            let timer = null
            if (options.timeout) {
                timer = setTimeout(() => {
                    // 创建一个超时 error 对象并赋值给 error.value
                    const err = new Error(`Async component timed out after ${options.timeout}ms.`)
                    error.value = err
                }, options.timeout)
            }

            const placeholder = { type: Text, children: '' }

            return () => {
                if (loaded.value) {
                    return { type: InnerComp }
                } else if (error.value && options.errorComponent) {
                    // 发生错误且用户配置了 errorComponent 时展示 Error 组件
                    // 同时将 error 作为 props 传递
                    return { type: options.errorComponent, props: { error: error.value } }
                } else {
                    return placeholder
                }
            }
        }
    }
}
```

:::

::::

### 延迟与 Loading 组件

✅ 异步组件的加载受**网络影响**较大，加载过程可能很快，也可能很慢。对于加载过程，我们可以引入 Loading 组件来提供更好的用户体验。同时，考虑到请求很快的情况会导致 Loading 组件闪烁，我们可以设置一个延迟展示的时间。

> 例如，当超过 200ms 没有完成加载，才展示 Loading 组件。这样，对于在 200ms 以内能够完成加载的情况来说，就避免了闪烁问题的出现。

:::: code-group
::: code-group-item 用户接口

```js
const AsyncComp = defineAsyncComponent({
  loader: () => new Promise(r => { /*...*/ }),
  // 延迟 200 ms 展示 Loading 组件
  delay: 200,
  // Loading 组件
  loadingComponent: {
    setup() {
      return () => {
        return { type: 'h2', children: 'Loading...' }
      }
    }
  }
})
```

:::

::: code-group-item 具体实现

```js{17,19-28,35-36,54,56}
function defineAsyncComponent(options) {
  if (typeof options === 'function') {
    options = {
      loader: options
    }
  }

  const { loader } = options
  let InnerComp = null

  return {
    name: 'AsyncComponentWrapper',
    setup() {
      const loaded = ref(false)
      const error = shallowRef(null)
      // 一个标志，代表是否正在加载组件
      const loading = ref(false)

      let loadingTimer = null
      // 如果配置项中存在 delay，则开启一个定时器，到期把 loading 设置为 true
      if (options.delay) {
        loadingTimer = setTimeout(() => {
          loading.value = true
        }, options.delay);
      } else {
        // 否则立即开启 loading
        loading.value = true
      }

      loader().then(c => {
        InnerComp = c
        loaded.value = true
      }).catch(err => error.value = err).finally(() => {
        // 加载完成后，无论成功与否，关闭 loading 并清除定时器
        loading.value = false
        clearTimeout(loadingTimer)
      })

      let timer = null
      if (options.timeout) {
        timer = setTimeout(() => {
          const err = new Error(`Async component timed out after ${options.timeout}ms.`)
          error.value = err
        }, options.timeout)
      }

      const placeholder = { type: Text, children: '' }

      return () => {
        if (loaded.value) {
          return { type: InnerComp }
        } else if (error.value && options.errorComponent) {
          return { type: options.errorComponent, props: { error: error.value } }
        } else if (loading.value && options.loadingComponent) {
          // 如果异步组件正在加载且用户配置了 Loading 组件，则渲染该组件
          return { type: options.loadingComponent }
        }  else {
          return placeholder
        }
      }
    }
  }
}
```

::: tip 实现解析

- 需要一个标记变量 `loading` 来代表组件是否正在加载。
- 如果用户指定了延迟时间，则开启延迟定时器。定时器到时后，再将 `loading.value` 的值设置为 `true`。
- 无论组件是否加载成功，都要清除延迟定时器，否则会出现组件已经加载成功，但仍然展示 Loading 组件的问题。
- 在渲染函数中，如果组件正在加载，并且用户指定了 Loading 组件，则渲染该 Loading 组件。

> loading 是加载过程的中间状态，请求完成之后，无论成功还是失败，loading 都要结束。

:::

:::

::: code-group-item Loading 组件的卸载  🔥

```js
function unmount(vnode) {
  if (vnode.type === Fragment) {
    vnode.children.forEach(c => unmount(c))
    return
  } else if (typeof vnode.type === 'object') {
    // 对于组件的卸载，本质上是要卸载组件所渲染的内容，即 subTree
    unmount(vnode.component.subTree)
    return
  }
  const parent = vnode.el.parentNode
  if (parent) {
    parent.removeChild(vnode.el)
  }
}
```

当异步组件加载成功之后，会卸载 Loading 组件并渲染异步加载的组件或者 Error 组件。为了支持 Loading 组件的卸载，我们需要修改 `unmount` 函数。

✅ 组件的卸载本质上是要卸载组件所渲染的内容，即 `subTree`。通过 `vnode.component` 属性得到组件实例，再递归地调用 `unmout` 函数完成 `vnode.component.subTree` 的卸载。

> loading 是一个响应式数据，异步包装组件的 setup 返回值发生变化，副作用渲染函数就会重新执行。原本的 subTree 是 Loading 组件从 Loading 变成了 AsyncComp 或者 Error，渲染器内部就发生了组件的卸载和挂载动作。

:::

::::

### 重试机制 ✨

✅ **重试**指的是当加载出错时，有能力重新发起加载组件的请求。在加载组件的过程中，发生错误的情况非常常见，尤其是在网络不稳定的情况下。因此，提供开箱即用的重试机制，会提升用户的开发体验。

> 异步组件加载失败后的重试机制，与请求服务端接口失败后的重试机制一样。

:::: code-group
::: code-group-item fetch

```js
function fetch() {
  return new Promise((resolve, reject) => {
    // 请求会在 1 秒后失败
    setTimeout(() => {
      reject('err')
    }, 1000);
  })
}
```

:::

::: code-group-item load

```js
// load 函数接收一个 onError 回调函数
function load(onError) {
  // 请求接口，得到 Promise 实例
  const p = fetch()
  // 捕获错误
  return p.catch(err => {
    // 当错误发生时，返回一个新的 Promise 实例，并调用 onError 回调
    // 同时将 retry 函数作为 onError 回调的参数
    return new Promise((resolve, reject) => {
      // retry 函数的定义：用来执行重试的函数，执行 retry 会出现调用 load 发送请求
      const retry = () => resolve(load(onError))
      const fail = () => reject(err)
      onError(retry, fail)
    })
  })
}


// 调用 load 加载资源
load((retry) => {
  // 注册 onError 回调，参数为 retry、fail 函数
  retry()
  console.log(99)
}).then(res => {
  // 正常请求成功，处理请求结果
  console.log(res)
})
```

:::

::: code-group-item 异步组件的请求重试

```js{11-35,53}
function defineAsyncComponent(options) {
  if (typeof options === 'function') {
    options = {
      loader: options
    }
  }

  const { loader } = options

  let InnerComp = null
  // 记录重试次数
  let retries = 0
  function load() {
    return loader()
      // 捕获加载器的错误
      .catch((err) => {
      // 如果用户指定了 onError 回调，则将控制权交给用户
      if (options.onError) {
        // 返回一个新的 Promise 实例
        return new Promise((resolve, reject) => {
          // 重试
          const retry = () => {
            resolve(load())
            retries++
          }
          // 失败
          const fail = () => reject(err)
          // 作为 onError 回调函数的参数，让用户决定下一步怎么做
          options.onError(retry, fail, retries)
        })
      } else {
        throw error
      }
    })
  }

  return {
    name: 'AsyncComponentWrapper',
    setup() {
      const loaded = ref(false)
      const error = shallowRef(null)
      const loading = ref(false)

      let loadingTimer = null
      if (options.delay) {
        loadingTimer = setTimeout(() => {
          loading.value = true
        }, options.delay);
      } else {
        loading.value = true
      }
      // 调用 load 函数加载组件
      load()
        .then(c => {
        InnerComp = c
        loaded.value = true
      })
        .catch((err) => {
        console.log(err)
        error.value = err
      })
        .finally(() => {
        loading.value = false
        clearTimeout(loadingTimer)
      })



      let timer = null
      if (options.timeout) {
        timer = setTimeout(() => {
          const err = new Error(`Async component timed out after ${options.timeout}ms.`)
          error.value = err
        }, options.timeout)
      }

      const placeholder = { type: Text, children: '' }

      return () => {
        if (loaded.value) {
          return { type: InnerComp }
        } else if (error.value && options.errorComponent) {
          return { type: options.errorComponent, props: { error: error.value } }
        } else if (loading.value && options.loadingComponent) {
          return { type: options.loadingComponent }
        } else {
          return placeholder
        }
      }
    }
  }
}
```

:::

::::

## 函数式组件

函数式组件本质上就是一个普通函数，该函数的返回值是虚拟 DOM。

> 在 Vue.js 3 中使用函数式组件，主要是因为它的简单性，而不是因为它性能好。
>
> 在 Vue.js 3 中，即使是有状态组件，其初始化性能消耗也非常小。

:::: code-group
::: code-group-item 用户接口

```js
function MyFuncComp(props) {
  return { type: 'h1', children: props.title }
}
// 定义 props，在函数式组件的静态属性 props 上定义
MyFuncComp.props = {
  title: String
}
```

函数式组件没有自身状态，但它仍然可以接收由外部传入的 props。

:::

::: code-group-item patch 函数支持

```js{31}
function patch(n1, n2, container, anchor) {
  if (n1 && n1.type !== n2.type) {
    unmount(n1)
    n1 = null
  }

  const { type } = n2

  if (typeof type === 'string') {
    if (!n1) {
      mountElement(n2, container, anchor)
    } else {
      patchElement(n1, n2)
    }
  } else if (type === Text) {
    if (!n1) {
      const el = n2.el = createText(n2.children)
      insert(el, container)
    } else {
      const el = n2.el = n1.el
      if (n2.children !== n1.children) {
        setText(el, n2.children)
      }
    }
  } else if (type === Fragment) {
    if (!n1) {
      n2.children.forEach(c => patch(null, c, container))
    } else {
      patchChildren(n1, n2, container)
    }
  } else if (typeof type === 'object' || typeof type === 'function') {
    // component
    if (!n1) {
      mountComponent(n2, container, anchor)
    } else {
      patchComponent(n1, n2, anchor)
    }
  }
}
```

在 patch 函数内部，通过检测vnode.props 的类型来判断组件的类型：

- 如果 vnode.type 是一个对象，则它是一个有状态组件，并且 vnode.type 是组件选项对象。
- 如果 vnode.type 是一个函数，则它是一个函数式组件。

:::

::: code-group-item mountComponent 函数支持

```js
function mountComponent(vnode, container, anchor) {
  // 检查函数是否是函数式组件
  const isFunctional = typeof vnode.type === 'function'
  
  let componentOptions = vnode.type
  if (isFunctional) {
    componentOptions = {
      // 如果是函数式组件，将 vnode.type 作为渲染函数
      // 将 vnode.type.props 作为 props 选项定义
      render: vnode.type,
      props: vnode.type.props
    }
  }
  // ...
}
```

:::

::::

✅ 除了`mountComponent` 的处理，出于更加严谨的考虑，需要通过`isFunctional`变量实现选择性地执行初始化逻辑。因为对于函数式组件来说，它无须初始化 data 以及声明周期钩子。

从这点可以看出，**函数式组件的初始化性能消耗小于有状态组件**。
