# 编译器核心技术概览

如果要实现诸如 C、JavaScript 这类通用用途语言 GPL（general purpose language），需要掌握较多的编译技术知识。前端应用编译技术的场景有限，难度会简单很多。Vue.js 的模板和 JSX 都属于领域特定语言 **DSL**，它们的实现难度属于中、低级别，只要掌握基本的编译技术理论即可实现这些功能。

::: details DSL (Domain Specific Language)

DSL 即「Domain Specific Language」，中文一般译为「领域特定语言」，在《领域特定语言》这本书中它有了一个定义：

> 一种为**特定领域**设计的，具有**受限表达性**的**编程语言**

前端常用的模板引擎如 mustache 以及 React、Vue 支持的 JSX 语法都属于外部 DSL。

🌐 [DSL (opens new window)](https://zhuanlan.zhihu.com/p/107947462)

:::

## 模板 DSL 的编译器

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

::: tip 将 Vue.js 模板编译为渲染函数的完整流程：

1. 用来将模板字符串解析为模板 AST 的解析器（parser）；
2. 用来将模板 AST转换为 JavaScript AST 的转换器（transformer）；
3. 用根据 JavaScript AST 生成渲染韩函数代码的生成器（generater）。

:::

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/vueCompilerA.png)

## parser 的实现原理与状态机

✅ 解析器 parser 的入参是模板字符串，解析器会逐个读取字符串模板中的值，并根据一定的规则将整个字符串切割为一个个 Token。这里的 Token 可以视作**词法记号**。

```html
<p>Vue</p>
```

解析器会把这段字符串模板切割为三个 Token：

- 开始标签：`<p>`
- 文本节点：`Vue`
- 结束标签：`</p>`

*parser：模板 == 词法分析 & 语法分析 ==> 模板 AST*

### 有限状态自动机

✅ parse 函数中利用**有限状态自动机**完成对模板的标记化（tokenized），最终我们将得到一系列 Token。

所谓“有限状态”，就是指有限个状态，而“自动机”意味着随着字符的输入，解析器会自动地在不同状态间迁移。以上面这个模板为例，当 parse 函数分析这段模板字符串时，它会逐个读取各个字符，状态机会有一个初始状态。经过这样一系列的**状态迁移**之后，我们最终就能够得到相应的 Token。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/finiteStateMachine.png)



图中有的圆圈是单线的，而有的圆圈是双线的。双线表示此时状态机是一个合法的 Token。

::: details 解析器中的状态机

图中给出的状态机并不严谨。实际上，解析 HTML 并构造 Token 的过程是有规范可循的，在 WHATWG 发布的关于浏览器解析 HTML 的规范中，详细阐述了状态迁移。

> 初始状态（Data State）下遇到 `<` 字符，状态机会迁移到 tag open state......

Vue.js 作为 DSL并非必须遵守该规范。但 Vue.js 的模板毕竟是类 HTML 的实现，因此，尽可能按照规范来做并不会有什么坏处。更重要的一点是，规范中已经定义了非常详细的状态迁移过程，这对于解析器的编写很有帮助。

:::

### tokenize 函数

`tokenize` 函数通过有限状态机将字符串模板切割为一个个词法记号 Token。

:::: code-group
::: code-group-item 接口调用

```js
const tokens = tokenize('<p>Vue</p>')

// [
//   { type: 'tag', name: 'p' },        // 开始标签
//   { type: 'text', content: 'Vue' },  // 文本节点
//   { type: 'tagEnd', name: 'p' },     // 结束标签
// ]
```

:::
::: code-group-item tokenize

```js{50-53,66-69,89-92}
// 定义状态机的状态
const State = {
  initial: 1,
  tagOpen: 2,
  tagName: 3,
  text: 4,
  tagEnd: 5,
  tagEndName: 6
}
// 判断 是否是字母 的辅助函数
function isAlpha(char) {
  return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z'
}
// 参数为模板字符串，将其切割为 Token 返回
function tokenize(str) {
  let currentState = State.initial  // 初始状态
  const chars = []  // 缓存字符
  const tokens = []  // 生成的 Token 数组
  while(str) {  // while 开启自动机，当字符串消费尽才会停止
    const char = str[0]  // 查看第一个字符
    switch (currentState) {  // switch 状态匹配
      case State.initial:  // 状态机当前为「初始状态」
        if (char === '<') {
          currentState = State.tagOpen  // 遇到 < ，状态机切换到「标签开始状态」
          str = str.slice(1)  // 消费当前字符
        } else if (isAlpha(char)) {
          currentState = State.text  // 遇到字母，状态机切换到「文本状态」
          chars.push(char)  // 当前字符缓存到 chars 数组
          str = str.slice(1)  // 消费当前字符
        }
        break
      case State.tagOpen:  // 状态机当前为「标签开始状态」
        if (isAlpha(char)) {
          currentState = State.tagName  // 遇到字母，状态机切换到「标签名称状态」
          chars.push(char)  // 当前字符缓存到 chars 数组
          str = str.slice(1)  // 消费当前字符
        } else if (char === '/') {
          currentState = State.tagEnd  // 遇到 / ，状态机切换到「标签结束状态」
          str = str.slice(1)  // 消费当前字符
        }
        break
      case State.tagName:  // 状态机当前为「标签名称状态」
        if (isAlpha(char)) {
          chars.push(char)  // 遇到字母，当前为标签名称状态，只要把字符缓存到 chars 数组
          str = str.slice(1)  // 消费当前字符
        } else if (char === '>') {
          currentState = State.initial  // 遇到 > ，状态机切换到「初始状态」
          // 同时创建一个标签 Token，添加到 tokens 数组中
          // 此时 chars 数组中缓存的字符就是标签名
          tokens.push({
            type: 'tag',
            name: chars.join('')
          })
          chars.length = 0  // chars 已设为标签名，清空它
          str = str.slice(1)  // 消费当前字符
        }
        break
      case State.text:  // 状态机当前为「文本状态」
        if (isAlpha(char)) {
          chars.push(char)  // 遇到字母，当前字符缓存到 chars 数组
          str = str.slice(1)  // 消费当前字符
        } else if (char === '<') {
          currentState = State.tagOpen  // 状态机切换到「标签开始状态」
          // 同时创建一个文本 Token，添加到 tokens 数组中
          // 此时 chars 数组中缓存的字符就是文本内容
          tokens.push({
            type: 'text',
            content: chars.join('')
          })
          chars.length = 0  // chars 已设为文本内容，清空它
          str = str.slice(1)  // 消费当前字符
        }
        break
      case State.tagEnd:  // 状态机当前为「标签结束状态」
        if (isAlpha(char)) {
          currentState = State.tagEndName  // 遇到字母，状态机切换到「结束标签名称状态」
          chars.push(char)  // 当前字符缓存到 chars 数组
          str = str.slice(1) // 消费当前字符
        }
        break
      case State.tagEndName:  // 状态机当前为「结束标签名称状态」
        if (isAlpha(char)) {
          chars.push(char)  // 遇到字母，当前字符缓存到 chars 数组
          str = str.slice(1)  // 消费当前字符
        } else if (char === '>') {
          currentState = State.initial  // 状态机切换到「初始状态」
          // 同时创建一个结束标签名称 Token，添加到 tokens 数组中
          // 此时 chars 数组中缓存的字符就是标签名称
          tokens.push({
            type: 'tagEnd',
            name: chars.join('')
          })
          chars.length = 0  // chars 已设为标签名，清空它
          str = str.slice(1)  // 消费当前字符
        }
        break
    }
  }
	// 最后，返回全部词法记号 tokens
  return tokens
}
```

:::
::::

✅ 通过有限自动机，我们能够将模板解析为一个个 Token，进而可以用它们构建一棵模板 AST。在具体构建 AST 之前，我们需要思考能否简化当前的 `tokenize`函数代码。实际上，我们可以通过正则表达式来精简tokenize 函数的代码。上文之所以没有从最开始就采用正则表达式来实现，是因为**正则表达式的本质就是有限自动机**。当你编写正则表达式的时候在编写有限自动机。

> - 把模板字符串解析为模板AST的过程，就是在做词法分析和语法分析。那么这个过程的第一步就是要把模板字符串进行词法记号的分割。
> - 由于 Vue.js 是类 HTML 的实现，HTML 已经有规范定义了其有限状态机的状态迁移过程，这个对于我们解析器的实现很有帮助。
> - s我们通过有限状态自动机同样来实现 Vue.js 模板的解析。