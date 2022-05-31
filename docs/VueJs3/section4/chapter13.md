# 异步组件与函数式组件

异步组件：以异步的方式去加载并渲染一个组件；

函数式组件：无状态，编写简单且直观。

## 异步组件要解决的问题

异步组件的实现实际上并不需要框架层面的支持，用户完全可以自行实现

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

异步组件通常以**网络请求**的形式进行加载。前端发送一个 HTTP 请求，请求下载组件的 JavaScript 资源，或者从服务端直接获取组件数据。网络请求可能会受网络环境的影响，由此我们需要为用户提供指定**请求超长**的能力，如果加载组件的时间超过了指定时长，会触发指定的错误。这时如果用户配置了 Error 组件，则会渲染该组件。

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

            load().then(c => {
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

