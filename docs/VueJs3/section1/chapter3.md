# Vue.js 3 的设计思路

## 声明式地描述UI

Vue.js3 作为一个声明式的 UI 框架，提供了两种 UI 描述方式：

1. 模板：

   ```html
   <h1 @click="handler"><span></span></h1>
   ```

2. JavaScript 对象：

   ```js
   const title = {
     tag: 'h1',
     props: {
       onClick: handler
     },
     children: [
       { tag: 'span' }
     ]
   }
   ```

使用 JavaScript 对象描述 UI 更加灵活，而这就是所谓的**虚拟 DOM**，在 Vue.js3 当中，我们在组件当中手写的渲染函数就是使用虚拟 DOM 来描述 UI 的

```js
import { h } from 'vue'

export default {
  render() {
    return h('h1', { onClick: handler })  // h函数返回就是VNode
  }
}
```

## 渲染器

🔥 渲染器：将 JavaScript 对象即虚拟 DOM 渲染为真实的 DOM

1. 创建元素：把 vnode.tag 作为标签名来创建 DOM 元素
2. 为元素添加属性和事件：遍历 vnode.props 对象，如果 key 以 on 字符开头，说明它是一个事件通过 addEventListener 绑定事件处理函数
3. 处理children：如果 children 是一个数组，递归调用 renderer 继续渲染；如果是字符串，以文本节点处理。最终添加到新创建的元素内

> 渲染器的精髓在于后续的更新，通过 Diff 算法找出变更点，并且只会更新需要更新的内容。

```js
function renderer(vnode, container) {
  // 使用 vnode.tag 作为标签名称创建 DOM 元素
	const el = document.createElement(vnode.tag)
  // 遍历 vnode.props 将属性、事件添加到 DOM 元素
  for (const key in vnode.props) {
    if (/^on/.test(key)) {
      // 如果 key 以 on 开头，那么说明它是事件
      el.addEventListener(
        key.substr(2).toLowerCase(), // 事件名称 onClick ---> click
        vnode.props[key] // 事件处理函数
      )
    }
  }

  // 处理 children
  if (typeof vnode.children === 'string') {
    // 如果 children 是字符串，说明是元素的文本子节点
    el.appendChild(document.createTextNode(vnode.children))
  } else if (Array.isArray(vnode.children)) {
    // 递归地调用 renderer 函数渲染子节点，使用当前元素 el 作为挂载点
    vnode.children.forEach(child => renderer(child, el))
  }

  // 将元素添加到挂载点下
  container.appendChild(el)
}

const vnode = {
  tag: 'div',
  props: {
    onClick: () => alert('hello')
  },
  children: 'click me'
}

renderer(vnode, document.body)
```

---

📌 以上就是渲染器创建节点的一个思路，渲染器的精髓在于节点的更新，如果 vnode 的更改如下，渲染器的更新应该只更新当前这个元素的文本内容，而不是再走一遍完整的元素创建流程

```js
const vnode = {
  tag: 'div',
  props: {
    onClick: () => alert('hello jerry')
  },
  children: 'click again'  // 从 click me 改成 click again
}
```

## 组件的本质

🔥 组件就是一组 DOM 元素的封装

1. 这组 DOM 元素代可以使用一个函数来表示：

   ```js
   const MyComponent = function () {
     return {
       tag: 'div',
       props: {
         onClick: () => alert('hello')
       },
       children: 'click me'
     }
   }
   ```

2. 组件也不一定需要函数来表示，也可以使用 JavaScript 对象来表示：

   ```js
   const MyComponent = {
     render() {
       return {
         tag: 'div',
         props: {
           onClick: () => alert('hello')
         },
         children: 'click me'
       }
     }
   }
   
   const vnode = {
     tag: MyComponent
   }
   
   function renderer(vnode, container) {
     if (typeof vnode.tag === 'string') {
       // 说明 vnode 描述的是标签元素
       mountElement(vnode, container)
     } else if (typeof vnode.tag === 'object') {
       // 说明 vnode 描述的是组件
       mountComponent(vnode, container)
     }
   }
   
   function mountElement(vnode, container) {
     // 使用 vnode.tag 作为标签名称创建 DOM 元素
   	const el = document.createElement(vnode.tag)
     // 遍历 vnode.props 将属性、事件添加到 DOM 元素
     for (const key in vnode.props) {
       if (/^on/.test(key)) {
         // 如果 key 以 on 开头，那么说明它是事件
         el.addEventListener(
           key.substr(2).toLowerCase(), // 事件名称 onClick ---> click
           vnode.props[key] // 事件处理函数
         )
       }
     }
   
     // 处理 children
     if (typeof vnode.children === 'string') {
       // 如果 children 是字符串，说明是元素的文本子节点
       el.appendChild(document.createTextNode(vnode.children))
     } else if (Array.isArray(vnode.children)) {
       // 递归地调用 renderer 函数渲染子节点，使用当前元素 el 作为挂载点
       vnode.children.forEach(child => renderer(child, el))
     }
   
     // 将元素添加到挂载点下
     container.appendChild(el)
   }
   
   function mountComponent(vnode, container) {
     // 调用组件函数，获取组件要渲染的内容（虚拟 DOM）
     const subtree = vnode.tag.render()
     // 递归调用 renderer 渲染 subtree
     renderer(subtree, container)
   }
   
   renderer(vnode, document.body)
   ```

🔖 Vue.js 中的有状态组件就是使用对象结构来表达的

## 模板的工作原理

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/design.png)

🔥 声明式 UI 的描述方式有两种，模板和虚拟 DOM (渲染函数) ，编译器将模板这个字符串分析生成一个功能与之相同的渲染函数。

在单文件组件当中，我们写的模板最终会被编译成渲染函数并添加到 script 标签块的组件对象上：

```html
<template>
  <div @click="hander">
    click
  </div>
</template>

<script>
export default {
  data() {/*...*/},
  methods: {
    handler: () => {/*...*/}
  }
}
</script>
```

最终在浏览器里运行的代码：

```js
export default {
  data() {/*...*/},
  methods: {
    handler: () => {/*...*/}
  },
  render() {
    return h('div', { onClick: handler }, 'click me')
  }
}
```

## Vue.js是各个模块组成的有机整体

🔥 编译器与渲染器交流的媒介就是虚拟 DOM 对象

🚀 有了编译器和渲染器，巧妙利用编译器的**代码分析**能力，为渲染节省寻找变更点的工作量，实现性能的提升：

```html
<div id="foo" :class="cls"></div>
```

以上面这个模板为例，编译器在将其编译为渲染函数时，可以分析出哪些是动态内容，在编译阶段进行信息提取，然后直接提交给渲染器

```js
render() {
  return {
    tag: 'div',
    props: {
      id: 'foo',
      class: cls
    },
    patchFlags: 1  // 假设数字 1 代表 class 是动态的
  }
}
```

通过添加的信息说明只有 class 属性会发生改变