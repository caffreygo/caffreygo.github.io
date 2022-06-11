# 编译器核心技术概览

如果要实现诸如 C、JavaScript 这类通用用途语言（general purpose language），需要掌握较多的编译技术知识。前端应用编译技术的场景有限，难度会简单很多。Vue.js 的模板和 JSX 都属于领域特定语言，它们的实现难度属于中、低级别，只要掌握基本的编译技术理论即可实现这些功能。

## 模板 DSL 的编译器

::: details DSL (Domain Specific Language)

DSL 即「Domain Specific Language」，中文一般译为「领域特定语言」，在《领域特定语言》这本书中它有了一个定义：

> 一种为**特定领域**设计的，具有**受限表达性**的**编程语言**

前端常用的模板引擎如 mustache 以及 React、Vue 支持的 JSX 语法都属于外部 DSL。

🌐 [DSL (opens new window)](https://zhuanlan.zhihu.com/p/107947462)

:::

### Vue.js 的编译器

✅ 编译器只是一段程序，它用来将 “一种语言 A” 翻译成 “另外一种语言 B” 。其中，语言 A 通常叫做**源代码**（source code），语言 B 通常叫做**目标代码**（object code 或 target code）。编译器将源代码翻译为目标代码的过程叫做**编译**（compile）。完整的编译过程通常包括词法分析、语法分析、语义分析、中间代码生成、优化、目标代码生成等步骤。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/compiler.png)

::: tip 整个编译过程分为编译前端和编译后端

**编译前端**包含词法分析、语法分析和语义分析，它通常与目标平台无关，仅负责分析源代码。

**编译后端**则通常与目标平台有关，编译后端涉及中间代码生成和优化以及目标代码生成。但是，编译后端并不一定会包含中间代码生成和优化这两个环节，这取决于具体的场景和实现。中间代码生成和优化这两个环节有时也叫 “中端”。

:::

作为 DSL 的 Vue.js，源代码就是组件的模板，而目标代码是能够在浏览器平台上运行的 JavaScript 代码，或其他拥有 JavaScript 运行时的平台代码。

:::: code-group
::: code-group-item 源代码

```html
<div>
	<h1 :id="dynamicId">Vue Template</h1>
</div>
```
:::
::: code-group-item 目标代码

```js
function render() {
  return h('div', [
    h('h1', { id: dynamicId }, 'Vue Template')
  ])
}
```
:::
::::

Vue.js 模板编译器的目标代码就是渲染函数。Vue.js 模板编译器会首先对模板就行词法分析和语法分析，得到模板 AST。接着，将模板 AST 转换（transform）成 JavaScript AST。最后，根据 JavaScript AST 生成 JavaScript 代码，即渲染函数代码。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/vueCompiler.png)

### parse 与 模板 AST

AST 是 abstract syntax tree 的首字母缩写，即抽象语法树。所谓 模板 AST，其实就是用来描述模板的抽象语法树。

::: tip 模板 AST

AST 其实就是一个具有层级结构的对象。模板 AST 具有与模板同构的嵌套结构。每一棵 AST 都有一个逻辑上的根节点，类型为 Root。模板中真正的根节点则作为 Root 节点的 children 存在：

- 不同类型的节点是通过节点的 type 属性进行区分的。例如标签节点的 type 值为 ’Element’。
- 标签节点的子节点存储在其 children 数组中。
- 标签节点的属性节点和指令节点会存储在 props 数组中。
- 不同类型的节点会使用不同的对象属性进行描述。例如指令节点拥有 name 属性，用来表达指令的名称，而表达式节点拥有 content 属性，用来描述表达书的内容。

:::

✅ 我们可以通过封装 parse 函数来完成对模板的词法分析和语法分析，得到模板 AST。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/parse.png)

:::: code-group
::: code-group-item 模板

```html
<div>
	<h1 v-if="ok">Vue Template</h1>
</div>
```

:::
::: code-group-item 模板 AST

```js
const ast = {
  type: 'Root',  // 逻辑根节点
  children: [
    {
      type: 'Element',  // div 标签节点
      tag: 'div',
      children: [
        {
          type: 'Element',  // h1 标签节点
          tag: 'h1',
          props: [
            {  // v-if 命令指令
              type: 'Directive',  // 类型为 Directive 代表指令
              name: 'if',  // 指令的具体名称为 if
              exp: {
                type: 'Expressiom',
                content: 'ok'
              }
            }
          ]
        }
      ]
    }
  ]
}
```

:::
::: code-group-item parse 函数

```js
const template = `
  <div>
    <h1 v-if="ok">Vue Template</h1>
  </div>	
`

const templateAST = parse(template)
```

:::
::::

### transform 与 JavaScript AST

✅ 有了模板 AST 之后，我们就可以对其进行**语义分析**，并对模板 AST 进行转换了。

::: tip 语义分析

- 检查 v-else 指令是否存在相符的 v-if 指令。
- 分析属性是否是静态的，是否是常量等。
- 插槽是否会引用上层作用域的变量。
- ......

:::

在语义分析的基础上，我们即可得到模板 AST 。接着，我们需要将模板 AST 转换成 JavaSript AST。因为 Vue.js 模板编译器的最终目标是生成渲染函数，而渲染函数本质上是 JavaScript 代码，所以我们需要将模板 AST 转化成用于描述渲染函数的 JavaScript AST。

我们可以封装 transform 函数来完成模板 AST 到 JavaScript AST的转换工作。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/transform.png)

```js
const templateAST = parse(template)
const jsAST = transform(templateAST)
```

### generate 与 渲染函数

✅ 有了 JavaScript AST 后，我们可以根据它生成渲染函数，这一步可以封装 generate 函数来完成。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/generate.png)

```js
const templateAST = parse(template)
const jsAST = transform(templateAST)
const code = generate(jsAST)
```

### 完整流程

将 Vue.js 模板编译为渲染函数的完整流程：

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/vueCompilerA.png)