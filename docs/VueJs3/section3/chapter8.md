# 挂载与更新

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/patch.png)

## 挂载子节点和元素的属性

- 子节点：vnode 的子节点有可能是文本字符串，当然也会是标签，并且子节点可以是很多个。为了描述元素的子节点，可以使用**数组**来表示

- 属性：为了描述一个元素的属性，我们可以为虚拟 DOM 添加一个 vnode.props 字段


```js
const vnode = {
    type: 'div',
    props: {
        id: 'foo'
    },
    children: [
        {
            type: 'p',
            children: 'hello'
        }
    ]
}
```

为了渲染子节点和属性，同时也需要修改对应的 mountElement 函数：

```js
function mountElement(vnode, container) {
    const el = createElement(vnode.type)
    if (typeof vnode.children === 'string') {
        setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
        // 如果 children 是一个数组，则遍历每个子节点，并调用 patch 函数挂载它们
        vnode.children.forEach(child => {
            patch(null, child, el)
        })
    }
    // 如果 vnode.props 存在才处理它
    if (vnode.props) {
        // 遍历 vnode.props
        for (const key in vnode.props) {
            // 或 el[key] = vnode.props[key]
            el.setAttribute(key, vnode.props[key])
        }
    }

    insert(el, container)
}
```

在处理属性时，为元素设置属性无论是使用 setAttribute 函数，还是直接操作 DOM 对象，都存在缺陷。

## HTML Attributes 与 DOM Properties

从最基本的 HTML 为例：

```html
<input id="my-input" type="text" value="foo" />
```

HTML Attributes 指的就是定义在 HTML 标签上的属性，这里指的就是 id=“my-input”、type=“text” 和 value=“foo”。当浏览器解析这段 HTML 代码之后，可以得到该 DOM 对象：

```js
const el = document.querySelector("#my-input");
```

这个 DOM 对象会包含很多**属性**（properties），这些属性就是所谓的 DOM Properties。

::: details HTML Attributes 与 DOM Properties 的关联

- 很多 HTML Attributes 在 DOM 对象上有与之同名的 DOM Properties，如 id=“my-input” 与 el.id，type="text" 与 el.type...

- 但两者名字并不总是一模一样：class="foo" 与 el.className

- 并不是所有的 HTML Attributes 都有与之对应的 DOM Properties：aria-* 类的 HTML Attributes 

- 也并不是所有的 DOM Properties 都有与之对应的 HTML Attributes：el.textContent 可以设置文本内容，但没有对应的 HTML Attributes

- 直接映射：HTML Attributes 与 DOM Properties 具有相同名称的属性，例如 id="foo" 与 el.id


::: 

### 两者关系

🚀  **HTML Attributes 的作用是设置与之对应的 DOM Properties 的初始值**。

一旦值改变，那么 DOM Properties 始终存储着当前值，而通过 getAttribute 函数得到的仍然是初始值。

```html{8}
<input id="foo" value="foo" />

<script>
	const el = document.querySelector("#foo")
  // 用户在输入框修改内容为 bar 后
  // 文本框内容的修改并不会影响 el.getAttribute('value') 的返回值。
  console.log(el.value)  // 'bar'
  console.log(el.getAttribute('value'))  // 'foo'
  console.log(el.defaultValue)  // 'foo'
</script>
```

这里也说明，一个  HTML Attributes 可能关联多个 DOM Properties。

### 默认值校验

虽然我们可以认为 HTML Attributes 是用来设置与之对应的 DOM Properties 的初始值的，但有些值是受限制的，就好像浏览器内部做了默认值校验。如果你通过 HTML Attributes 提供的默认值不合法，那么浏览器会使用内建的合法值作为对应 DOM Properties 的默认值：

```html{5}
<input id="my-input" type="foo" />

<script>
  const el = document.querySelector("#my-input")
  console.log(el.type)  // 'text'
</script>
```

## 正确地设置元素属性

### 浏览器解析

浏览器本身会解析 HTML 代码，自动分析 HTML Attributes 并设置合适的 DOM Properties。但是 Vue.js 的单文件组件中的模板就需要自行编译。

以禁用的按钮为例：

```html
<button disabled>Button</button>
```

对于浏览器来说，当解析到这样一段 HTML，它会发现这个按钮存在 disabled 的 HTML Attributes，于是浏览器会把这个按钮设置为禁用状态，并把它的 el.disabled 这个 DOM Properties 的值设置为 true。

### Vue.js 的解析

相同的模板，它会先被编译成 vnode，它等价于：

```js
const button = {
	type: 'button',
	props: {
		disabled: ''
	}
}
```

这里 disabled 的值为空字符串，如果在渲染器中调用 setAttribute 函数设置属性，相当于：

```js
el.setAttribute('disabled', '')
```

这么做是没有问题的，浏览器将会将按钮禁用。但是对于 Vue.js 来说，要考虑如下模板：

```html
<button :disabled="false">Button</button>
```

它对应的 vnode 为：

```js
const button = {
	type: 'button',
	props: {
		disabled: false
	}
}
```

这里的本意是“不禁用”按钮，但是由于 setAttribute 函数设置的值总是会被字符串化，等价于

```js
// el.setAttribute('disabled', false)
el.setAttribute('disabled', 'false')
```

🔥 对于按钮来说，它的 el.disabled 属性值是布尔类型的，并且它不关心具体的 HTML Attributes 的值是什么，只要 disabled 属性存在，按钮就会被禁用。所以渲染器不能用 setAttribute 函数将 vnode.props 对象中的属性设置到元素上。

### 通用的属性设置

🚀 我们可以优先设置 DOM Properties

```js
// ✅ <button :disabled="true">Button</button>
el.disabled = true

// ✅ <button :disabled="false">Button</button>
el.disabled = false

// 🙈 <button disabled>Button</button>
el.disabled = ''  
```

🚀 但是对于 HTML Properties 是布尔值，prop 是空字符串需要特殊处理，要手动将值矫正为true。

---

```html
<form id="form1"></form>
<input form="form1" />
```

在这段代码中，我们为 input 标签设置了 form 属性（HTML Properties），但是这个属性 el.form 是只读的，只能使用 setAttribute 函数设置，因此对于这些情况我们也需要特殊处理，类似的表单元素都是如此。

🚀 处理思路：可以提取一个 shouldSetAsProps 函数判断属性是否应该作为 DOM Properties 处理。

```js{14,16}
function shouldSetAsProps(el, key, value) {
  // 特殊处理
  if (key === 'form' && el.tagName === 'INPUT') return false
  // 兜底
  return key in el
}

function mountElement(vnode, container) {
  const el = createElement(vnode.type)
  // 省略 children 的处理

  if (vnode.props) {
    for (const key in vnode.props) {
      if (shouldSetAsProps(el, key, nextValue)) {
        const type = typeof el[key]
        if (type === 'boolean' && nextValue === '') {
          el[key] = true
        } else {
          el[key] = nextValue
        }
      } else {
        el.setAttribute(key, nextValue)
      }
    }
  }

  insert(el, container)
}
```

---
最后，我们需要把属性设置的也变成与平台无关，因此需要把属性设置的相关操作也提取到渲染选项中：

```js{12-22}
const renderer = createRenderer({
  createElement(tag) {
    return document.createElement(tag)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  },
  // 将属性设置相关操作封装到 pathProps 函数中，并作为渲染器选项传递
  patchProps(el, key, preValue, nextValue) {
    if (shouldSetAsProps(el, key, nextValue)) {
      const type = typeof el[key]
      if (type === 'boolean' && nextValue === '') {
        el[key] = true
      } else {
        el[key] = nextValue
      }
    } else {
      el.setAttribute(key, nextValue)
    }
  }
})
```

而在 mountElement 函数中，只需要调用 patchProps 函数，并传递相关参数即可：

```js{13}
function mountElement(vnode, container) {
  const el = createElement(vnode.type)
  if (typeof vnode.children === 'string') {
    setElementText(el, vnode.children)
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach(child => {
      patch(null, child, el)
    })
  }

  if (vnode.props) {
    for (const key in vnode.props) {
      patchProps(el, key, null, vnode.props[key])
    }
  }

  insert(el, container)
}
```

## class 的处理

### class 值处理

Vue.js 允许通过多种方式设置元素类名：

```html
<template>
  <p class="foo bar"></p>
  <p :class="{ foo: true, bar:false}"></p>
  <p :class="arr"></p>
</template>

<script>
const arr = [
  'foo bar',
  {
    baz: true
  }
]
</script>
```

第三个 p 标签对应的 vnode 如下，我们可以封装一个 normalizeClass 函数将其处理为正常的字符串：

:::: code-group
::: code-group-item 原始 vnode

```js
const vnode = {
  type: 'p',
  props: {
    class: [
      'bar foo',
      { baz: true }
    ]
  }
}
```
:::
::: code-group-item normalizeClass

```js
const vnode = {
  type: 'p',
  props: {
    class: normalizeClass([
      'bar foo',
      { baz: true }
    ])
  }
}
```
:::

::: code-group-item 结果

```js
const vnode = {
  type: 'p',
  props: {
    // 序列化后的结果
    class: 'foo bar baz'
  }
}
```

:::

::::

### 元素设置 class

在将 vnode 的 class 值正常化之后，还要通过高效的方式把 class 设置到元素上：

| Text name    | Execution per second |
| ------------ | -------------------- |
| el.className | 9637.7 Ops/sec       |
| el.classList | 5969.5 Ops/sec       |
| setAttribute | 4761.1 Ops/sec       |

🔥 可以发现，className 每秒设置的做多次，性能最优。因此我们需要调整 patchProps 函数的实现：

```js

const renderer = createRenderer({
  // 省略其他平台操作 API
  
  patchProps(el, key, preValue, nextValue) {
    if (key === 'class') {
      el.className = nextValue || ''
    } else if (shouldSetAsProps(el, key, nextValue)) {
      const type = typeof el[key]
      if (type === 'boolean' && nextValue === '') {
        el[key] = true
      } else {
        el[key] = nextValue
      }
    } else {
      el.setAttribute(key, nextValue)
    }
  }
})
```

📝 可见， vnode.props 对象中定义的属性值类型并不总是与 DOM 元素属性的数据结构保持一致，这取决于上层设计。Vue.js 允许对象类型的值作为 class 是为了方便开发者，在底层实现上，必然需要对值进行正常化后再使用。另外，正常化值的过程是有代价的，如果需要大量的正常化操作，则会消耗更多的性能。

## 卸载操作

::: warning 操作表示判断 newVNode 为空，需要把之前渲染的内容卸载，目前 render 函数直接把 innerHTML 清空。这么做是不严谨的：

- 容器的内容可能是由某个或多个组件渲染的，当卸载操作发生时，应该正确地调用这些组件的 beforeUnmount、unmounted 等声明周期函数
- 即使内容不是由组件渲染的，有的元素存在自定义指令，我们应该在卸载操作发生时正确执行对应的值令钩子函数
- 使用 innerHTML 清空容器元素内容的另外一个缺陷是，它不会移除绑定在 DOM 元素上的事件处理函数

:::

正确的卸载方式是，根据 vnode 对象获取与其相关的真实 DOM 元素，然后使用原生 DOM 操作方法将该 DOM 元素移除。为此，我们需要在 vnode 与真实 DOM 元素之间建立联系，修改 mountElement 函数：

:::: code-group
::: code-group-item mountElement 处理

```js{3}
function mountElement(vnode, container) {
  // 让 vnode.el 引用真实 DOM 元素
  const el = vnode.el = createElement(vnode.type)
  if (typeof vnode.children === 'string') {
    setElementText(el, vnode.children)
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach(child => {
      patch(null, child, el)
    })
  }

  if (vnode.props) {
    for (const key in vnode.props) {
      patchProps(el, key, null, vnode.props[key])
    }
  }

  insert(el, container)
}
```

:::
::: code-group-item unmount 封装

```js
function unmount(vnode) {
  const parent = vnode.el.parentNode
  if (parent) {
    parent.removeChild(vnode.el)
  }
}
```

:::

::: code-group-item render 调用

```js{6-9}
function render(vnode, container) {
  if (vnode) {
    // 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数进行打补丁
    patch(container._vnode, vnode, container)
  } else {
    if (container._vnode) {
      // 调用 unmount 函数卸载 
      unmount(container._vnode)
    }
  }
  // 把 vnode 存储到 container._vnode
  container._vnode = vnode
}
```

:::

::::

::: tip 将卸载操作封装到 unmount 中，还能够带来两点额外的好处：

- 在 unmount 函数内，我们有机会调用绑定在 DOM 元素上的指令钩子函数，例如 beforeUnmount、unmounted 等
- 当 unmount 函数执行时，我们有机会检测虚拟节点 vnode 的类型。如果该虚拟节点描述的是组件，则我们有机会调用组件相关的生命周期函数

:::
