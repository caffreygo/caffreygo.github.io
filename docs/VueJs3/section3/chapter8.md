# 挂载与更新

## 挂载子节点和元素的属性

子节点：vnode 的子节点有可能是文本字符串，当然也会是标签，并且子节点可以是很多个。为了描述元素的子节点，可以使用**数组**来表示；

属性：为了描述一个元素的属性，我们可以为 虚拟 DOM 添加一个 vnode.props 字段

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

