# 渲染器的设计

## 渲染器与响应系统结合

📝 渲染器是用来执行**渲染任务**的。在浏览器平台上，用它来渲染其中的真是 DOM 元素。渲染器不仅能够渲染真实 DOM 元素，它还是框架跨平台能力的关键。

在限定的 DOM 平台，渲染器能够渲染一个真实 DOM，那么下面这个 renderer 函数就是一个合格的渲染器。同时，@vue/reactivity 提供了 IIFE 模块格式，我们可以直接引用：

```html
<div id="app"></div>
<script src="https://unpkg.com/@vue/reactivity@3.0.5/dist/reactivity.global.js"></script>
<script>
    const { effect, ref } = VueReactivity
    // 渲染器
    function renderer(domString, container) {
        container.innerHTML = domString
    }
    // 利用响应系统声明一个原始值响应数据
    const count = ref(1)
    // 利用响应系统对 count 进行依赖收集
    effect(() => {
        renderer(`<h1>${count.value}</h1>`, document.getElementById('app'))
    })
    // 触发副作用函数执行
    setInterval(() => {
        count.value++
    }, 1000)
</script>
```

## 渲染器的基本概念

- 渲染器（renderer）：把虚拟 DOM 渲染为特定平台上的真实元素
- 渲染（render）：动词，渲染
- 虚拟 DOM（virtual DOM，vdom）：与真实 DOM 结构一样的，由节点组成的树形结构
- 虚拟节点（virtual node，vnode）：虚拟 DOM 树的节点，由一个 JavaScript 对象表示
- 挂载（mount）：渲染器把虚拟 DOM 节点渲染为真实 DOM 节点的过程
- 挂载点（container）：指定渲染器挂载的具体位置，渲染器会把该 DOM 元素作为容器元素

```js
// 这里通过 createRenderer 函数创建一个渲染器，这里没有直接定义 render 函数的原因是：
// 渲染器不同于渲染，它的概念更加宽泛，它不仅可以用来渲染（mount），还可以用来激活已有元素(hydrate)等等
function createRenderer() {
    // 打补丁：根据 n1 存在与否，走初始挂载或更新
    function patch(n1, n2, container) {

    }

    function render(vnode, container) {
        if (vnode) {
            // 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数进行打补丁
            patch(container._vnode, vnode, container)
        } else {
            if (container._vnode) {
                // 旧 vnode 存在，且新 vnode 不存在，说明是卸载(unmount)操作
                // 只需要将 container 内的 DOM 清空即可
                container.innerHTML = ''
            }
        }
        // 把 vnode 存储到 container._vnode 下，即后续渲染中的旧 vnode
        container._vnode = vnode
    }

    return {
        render
    }
}

const renderer = createRenderer()

// 首次渲染：挂载 patch(undefined, vnode, container)
renderer.render(vnode1, document.querySelector('#app'))
// 第二次渲染：更新 patch(_vnode, vnode, container)
renderer.render(vnode2, document.querySelector('#app'))
// 第三次渲染：卸载 patch(_vnode, null, container)
renderer.render(null, document.querySelector('#app'))
```

🔥 首次渲染时已经把 oldNode 渲染到 container 内了，所以当再次调用 renderer. Render 函数并尝试渲染 newNode 时，就不能简单地执行挂载动作了。在这种情况下，渲染器会使用 newNode 与上一次渲染的 oldNode 比较，试图找到并更新变更点。这个过程叫做“打补丁”（或更新），英文通常用 patch 来表达。

📝 挂载动作本身也可以看作一直特殊的打补丁，它的特殊之处在于旧的 VNode 不存在。

> patch 函数是整个渲染器的核心入口，它承载了最重要的渲染逻辑；
>
> patch 函数不仅可以用来完成打补丁，也可以用来执行挂载。

## 自定义渲染器

🔥 渲染器要实现跨平台能力，需要**抽象**出**不可复用部分**。

📝 对于浏览器作为渲染的目标平台时，将浏览器的特定 API 抽离，这样就可以使得渲染器的核心不依赖于浏览器。在此基础上，我们再为那些被抽离的 API 提供可配置的接口，即可实现渲染器的跨平台能力。

```js
// 把操作 DOM 的 API 封装为一个对象，当做参数传递
function createRenderer(options) {
    // 渲染器根据配置得到操作 DOM 的 API，实现通用的渲染器
    const {
        createElement,
        insert,
        setElementText
    } = options

    function mountElement(vnode, container) {
        const el = createElement(vnode.type)
        // 通过传入的 API 操作 DOM
        if (typeof vnode.children === 'string') {
            setElementText(el, vnode.children)
        }
        insert(el, container)
    }

    function patch(n1, n2, container) {
        if (!n1) {
            // 挂载
            mountElement(n2, container)
        } else {
            // 更新
        }
    }

    function render(vnode, container) {
        if (vnode) {
            patch(container._vnode, vnode, container)
        } else {
            if (container._vnode) {
                container.innerHTML = ''
            }
        }
        container._vnode = vnode
    }

    return {
        render
    }
}
```

### 浏览器渲染器

```js
const renderer = createRenderer({
    createElement(tag) {
        return document.createElement(tag)
    },
    setElementText(el, text) {
        el.textContent = text
    },
    insert(el, parent, anchor = null) {
        parent.insertBefore(el, anchor)
    }
})

const vnode = {
    type: 'h1',
    children: 'hello'
}

renderer.render(vnode, document.querySelector('#app'))
```

### 自定义渲染器

通过已有的通用渲染器，我们也可以创建一个用来打印渲染器操作流程的自定义渲染器：

```js
const renderer2 = createRenderer({
    createElement(tag) {
        console.log(`创建元素 ${tag}`)
        return { tag }
    },
    setElementText(el, text) {
        console.log(`设置 ${JSON.stringify(el)} 的文本内容：${text}`)
        el.text = text
    },
    insert(el, parent, anchor = null) {
        console.log(`将 ${JSON.stringify(el)} 添加到 ${JSON.stringify(parent)} 下`)
        parent.children = el
    }
})

const container = { type: 'root' }
renderer2.render(vnode, container)
```

## 总结

✅ 渲染器与响应系统之间的关系：利用响应系统的能力，我们可以做到，当响应式数据发生变化时自动完成页面更新（或重新渲染）。

✅ 渲染器会执行挂载和打补丁的操作，对于新的元素，渲染器会将它挂载到容器内；对于新旧 vnode 都存在的情况，渲染器则会执行打补丁操作，即对比新旧 vnode，只更新变化的内容。

✅ 通用渲染器将用来创建、修改和删除元素的操作**抽象**成可配置的对象。用户可以在创建渲染器的时候指定自定义的配置对象，从而实现自定义的行为。