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
::: code-group-item 接口

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
> - 通过有限状态自动机来实现 Vue.js 模板的解析的第一步，即词法记号分割，为后续构建模板 AST 做准备。

## 构造 AST

GPL 是图灵完备的，可以使用通用用途语言（GPL）来实现领域特定语言（DPL）。构建类似 JavaScript 这样的 GPL 来说，为其构造 AST，较常用的一种算法叫做**递归下降算法**。对于 Vue.js 模板这样的 DPL，它首先可以确定没有运算符，所以不需要考虑运算符的优先问题。

HTML 是一种标记语言，它的格式非常固定，标签元素之间天然嵌套，形成父子关系。因此，一棵用于描述 HTML 的 AST 将拥有与 HTML 标签非常相似的树形结构。

:::: code-group
::: code-group-item 模板

```html
<div><p>Vue</p><p>Template</p></div>
```

:::
::: code-group-item AST

```js
const ast = {
  type: 'Root',  // AST 的逻辑根节点
  children: [
    {
      type: 'Element',  // 模板的 div 根节点
      tag: 'div',
      children: [
        {
          type: 'Element',  // div 的第一个子节点 p
          tag: 'p',
          children: [  // p 节点的文本子节点
            {
              type: 'Text',
              content: 'Vue'
            }
          ]
        },
        {
          type: 'Element',  // div 的第二个子节点 p
          tag: 'p',
          children: [  // p 节点的文本子节点
            {
              type: 'Text',
              content: 'Template'
            }
          ]
        }
      ]
    }
  ]
}
```

:::
::::

我们需要使用程序根据模板解析后生成的 Token 构造出这样一棵 AST。先用 `tokenize` 函数将模板进行标记化，也就是词法记号的分割。

:::: code-group
::: code-group-item tokenize

```js
const tokens = tokenize(`<div><p>Vue</p><p>Template</p></div>`)
```

:::
::: code-group-item tokens

```js
const tokens = [
  {type: 'tag', name: 'div'},
  {type: 'tag', name: 'p'},
  {type: 'text', content: 'Vue'},
  {type: 'tagEnd', name: 'p'},
  {type: 'tag', name: 'p'},
  {type: 'text', content: 'Template'},
  {type: 'tagEnd', name: 'p'},
  {type: 'tagEnd', name: 'div'},
]
```

:::
::::

✅ 根据 Token 列表构建 AST 的过程，其实就是对 Token 列表进行扫描的过程。我们需要维护一个栈 `elementStack`，这个栈将用于维护元素之间的**父子关系**。s当遇到开始标签节点就构造一个 `Element` 类型的节点，并将其压入栈。当遇到一个结束标签节点，就将当前栈顶的节点弹出。这样，栈顶的节点将始终充当父节点的角色。扫描过程中遇到的所有节点，都会作为当中栈顶节点的子节点，并添加到栈顶节点的 `children` 属性下。

:::: code-group
::: code-group-item 接口

```js
const ast = parse(`<div><p>Vue</p><p>Template</p></div>`)
```

:::
::: code-group-item parse 实现

```js
function parse(str) {
  // 首先对模板进行苗计划，得到 tokens
  const tokens = tokenize(str)
  // 创建 Root 根节点，并入栈
  const root = {
    type: 'Root',
    children: []
  }
  const elementStack = [root]
  // 扫描所有的 tokens
  while (tokens.length) {
    const parent = elementStack[elementStack.length - 1]
    const t = tokens[0]  // 当前扫描的 Token
    switch (t.type) {
      case 'tag':
        // 创建 Element 类型的 AST 节点
        const elementNode = {
          type: 'Element',
          tag: t.name,
          children: []
        }
        // 将其添加到父节点的 children 中，入栈
        parent.children.push(elementNode)
        elementStack.push(elementNode)
        break
      case 'text':
        // 创建 Text 类型的 AST 节点
        const textNode = {
          type: 'Text',
          content: t.content
        }
        // 将文本添加到父节点的 children 中
        parent.children.push(textNode)
        break
      case 'tagEnd':
        // 遇到结束标签，将栈顶节点弹出
        elementStack.pop()
        break
    }
    tokens.shift()  // 消费已经扫描过的 Token
  }
	// 最后返回 AST
  return root
}
```

:::
::::

*当前的实现仍然存在诸多问题，例如无法处理自闭和标签等。*

## AST 的转换与插件化结构

AST 的转换，指的是对 AST 进行一系列操作，将其转换为新的 AST 的过程。新的 AST 可以是原语言或原 DSL 的描述，也可以是其他语言或其他 DSL 的描述。

✅ 我们可以对模板 AST 进行操作，将其转换为 JavaScript AST。转换后的 AST 可以用于代码生成。这其实就是 Vue.js 的模板编译器将模板编译为渲染函数的过程。

### 节点的访问

为了对 AST进行转换，我们需要能**访问** AST 的每一个节点，这样才有机会对特定节点进行修改、替换、删除等操作。

:::: code-group
::: code-group-item dump 打点

```js
function dump(node, indent = 0) {
  const type = node.type
  const desc = node.type === 'Root'
  ? ''
  : node.type === 'Element'
  ? node.tag
  : node.content
  // 打印节点的类型和描述信息
  console.log(`${'-'.repeat(indent)}${type}: ${desc}`)
	// 递归地打印子节点
  if (node.children) {
    node.children.forEach(n => dump(n, indent + 2))
  }
}
```

`dump`工具函数用来打印当前 AST 节点中的信息。

```js
const ast = parse(`<div><p>Vue</p><p>Template</p></div>`)
console.log(dump(ast))
```

上面代码运行后输出结果如下：

```shell
Root: 
--Element: div
----Element: p
------Text: Vue
----Element: p
------Text: Template
```

:::
::: code-group-item travereseNode 遍历

```js{5-9}
function traverseNode(ast, context) {
  // 当前节点，ast 本身就是 Root 节点
  const currentNode = ast
  // nodeTransforms 是一个数组，每个元素都是一个函数
  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    // 将当前节点信息和 context 都传递给回调函数
    transforms[i](currentNode, context)
  }

  // 如果有子节点，则递归地调用 traverseNode 函数进行遍历
  const children = currentNode.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      traverseNode(children[i])
    }
  }
}
```

1. `traverseNode`函数从根节点开始，进行深度遍历，实现对 AST 节点的访问
2. 为了实现对节点的处理，并且避免函数变得"臃肿"。对节点的操作和访问时，使用**回调函数**的机制来实现解耦
3. `traverseNode`函数接收第二个参数 `context`。回调函数存储在 `transform` 数组中，然后遍历数组，并逐个调用注册在其中的回调函数
4. 当前节点的 `currentNode` 和 `context` 对象作为参数传递给回调函数

> traverse: 遍历，通过；阻碍物

:::
::: code-group-item transform 实现

```js
function transform(ast) {
  const context = {
    nodeTransforms: [
      transformElement,
      transformText
    ]
  }
  // 调用 traverseNode 完成转换
  traverseNode(ast, context)
  // 打印 AST 信息
  console.log(dump(ast))
}

function transformElement(node) {
  if (node.type === 'Element' && node.tag === 'p') {
    node.tag = 'h1'
  }
}

function transformText(node) {
  if (node.type === 'Text') {
    node.content = node.content.repeat(2)
  }
}
```

节点的操作封装在`transformElement`和`transformText`这些独立的函数中实现解耦。一切我们需要的转换函数都只需要注册给`context.nodeTransforms`即可。

:::
::::

### 转换上下文与节点操作

::: tip 上下文

`Context`（上下文）对象就是程序在某个范围内的“全局变量”。换句话说，我们也可以把全局变量看作全局上下文。

:::

:::: code-group
::: code-group-item 扩展转换上下文

```js
function transform(ast) {
  const context = {
    // currentNode 存储当前正在转换的节点
    currentNode: null，
    // currentIndex 存储当前节点在父节点 children 中的索引
    currentIndex: 0,
    // parent 存储当前转换节点的父节点
    parent: null,
    nodeTransforms: [
      transformElement,
      transformText
    ]
  }
  // 调用 traverseNode 完成转换
  traverseNode(ast, context)
  // 打印 AST 信息
  console.log(dump(ast))
}
```

- `currentNode`: 存储当前正在转换的节点
- `currentIndex`: 存储当前节点在父节点 children 中的索引
- `parent`: 存储当前转换节点的父节点

:::

::: code-group-item traverseNode

```js
function traverseNode(ast, context) {
  // 设置当前转换的节点信息 context.currentNode
  context.currentNode = ast

  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    transforms[i](context.currentNode, context)
  }

  const children = context.currentNode.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      // 递归调用 traverseNode 转换子节点之前，将当前节点设置为父节点
      context.parent = context.currentNode
      // 设置位置索引
      context.childIndex = i
      // 递归时传递 context
      traverseNode(children[i], context)
    }
  }
}
```

:::

::: code-group-item 节点替换实现

```js
function transform(ast) {
  const context = {
    currentNode: null,
    parent: null,
    replaceNode(node) {
      // 通过修改 AST 替换节点，找到位置索引后使用新节点替换它
      context.parent.children[context.childIndex] = node
      // 当前节点已经被替换，更新 currentNode
      context.currentNode = node
    },
    nodeTransforms: [
      transformElement,
      transformText
    ]
  }
  traverseNode(ast, context)
  console.log(dump(ast))
}
```

接下来，我们就可以在转换函数中使用`replaceNode` 函数对 AST 中的节点进行替换了：

```js
function transformText(node, context) {
  if (node.type === 'Text') {
    // 将文本节点替换为 span 节点
    context.replaceNode({
      type: 'Element',
      tag: 'span'
    })
  }
}
```

代码验证：

```js
const ast = parse(`<div><p>Vue</p><p>Template</p></div>`)
transform(ast)
```

```shell
// 转换前
Root: 
--Element: div
----Element: p
------Text: Vue
----Element: p
------Text: Template

// 转换后
Root: 
--Element: div
----Element: p
------Element: span
----Element: p
------Element: span
```

:::

::: code-group-item 节点移除实现

```js
function transform(ast) {
  const context = {
    currentNode: null,
    parent: null,
    removeNode() {
      if (context.parent) {
        // 根据节点索引删除当前节点
        context.parent.children.splice(context.childIndex, 1)
        context.currentNode = null
      }
    },
    nodeTransforms: [
      transformElement,
      transformText
    ]
  }
  traverseNode(ast, context)
  console.log(dump(ast))
}
```

当节点被移除之后，后续的转换函数将不再需要处理该节点：

```js{7}
function traverseNode(ast, context) {
  context.currentNode = ast

  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    transforms[i](context.currentNode, context)
    if (!context.currentNode) return
  }

  const children = context.currentNode.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      context.parent = context.currentNode
      context.childIndex = i
      traverseNode(children[i], context)
    }
  }
}
```

接下来，我们就可以在转换函数中使用`removeNode` 函数对 AST 中的节点进行移除了：

```js{3}
function transformText(node, context) {
  if (node.type === 'Text') {
    context.removeNode()
  }
}
```

代码验证：

```js
const ast = parse(`<div><p>Vue</p><p>Template</p></div>`)
transform(ast)
```

```shell
// 转换前
Root: 
--Element: div
----Element: p
------Text: Vue
----Element: p
------Text: Template

// 转换后
Root: 
--Element: div
----Element: p
----Element: p
```

:::

::: code-group-item 完整代码

```js
const State = {
  initial: 1,
  tagOpen: 2,
  tagName: 3,
  text: 4,
  tagEnd: 5,
  tagEndName: 6
}

function isAlpha(char) {
  return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z'
}

function tokenize(str) {
  let currentState = State.initial
  const chars = []
  const tokens = []
  while(str) {
    const char = str[0]
    switch (currentState) {
      case State.initial:
        if (char === '<') {
          currentState = State.tagOpen
          str = str.slice(1)
        } else if (isAlpha(char)) {
          currentState = State.text
          chars.push(char)
          str = str.slice(1)
        }
        break
      case State.tagOpen:
        if (isAlpha(char)) {
          currentState = State.tagName
          chars.push(char)
          str = str.slice(1)
        } else if (char === '/') {
          currentState = State.tagEnd
          str = str.slice(1)
        }
        break
      case State.tagName:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '>') {
          currentState = State.initial
          tokens.push({
            type: 'tag',
            name: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
      case State.text:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '<') {
          currentState = State.tagOpen
          tokens.push({
            type: 'text',
            content: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
      case State.tagEnd:
        if (isAlpha(char)) {
          currentState = State.tagEndName
          chars.push(char)
          str = str.slice(1)
        }
        break
      case State.tagEndName:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '>') {
          currentState = State.initial
          tokens.push({
            type: 'tagEnd',
            name: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
    }
  }

  return tokens
}

function parse(str) {
  const tokens = tokenize(str)

  const root = {
    type: 'Root',
    children: []
  }
  const elementStack = [root]

  while (tokens.length) {
    const parent = elementStack[elementStack.length - 1]
    const t = tokens[0]
    switch (t.type) {
      case 'tag':
        const elementNode = {
          type: 'Element',
          tag: t.name,
          children: []
        }
        parent.children.push(elementNode)
        elementStack.push(elementNode)
        break
      case 'text':
        const textNode = {
          type: 'Text',
          content: t.content
        }
        parent.children.push(textNode)
        break
      case 'tagEnd':
        elementStack.pop()
        break
    }
    tokens.shift()
  }

  return root
}

function dump(node, indent = 0) {
  const type = node.type
  const desc = node.type === 'Root'
  ? ''
  : node.type === 'Element'
  ? node.tag
  : node.content

  console.log(`${'-'.repeat(indent)}${type}: ${desc}`)

  if (node.children) {
    node.children.forEach(n => dump(n, indent + 2))
  }
}

function transformElement(node) {
  if (node.type === 'Element' && node.tag === 'p') {
    node.tag = 'h1'
  }
}

function transformText(node, context) {
  if (node.type === 'Text') {
    context.removeNode()
  }
}


function traverseNode(ast, context) {
  context.currentNode = ast

  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    transforms[i](context.currentNode, context)
    if (!context.currentNode) return
  }

  const children = context.currentNode.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      context.parent = context.currentNode
      context.childIndex = i
      traverseNode(children[i], context)
    }
  }
}


function transform(ast) {
  const context = {
    currentNode: null,
    parent: null,
    replaceNode(node) {
      context.currentNode = node
      context.parent.children[context.childIndex] = node
    },
    removeNode() {
      if (context.parent) {
        context.parent.children.splice(context.childIndex, 1)
        context.currentNode = null
      }
    },
    nodeTransforms: [
      transformElement,
      transformText
    ]
  }
  // 调用 traverseNode 完成转换
  traverseNode(ast, context)
  // 打印 AST 信息
  console.log(dump(ast))
}

const ast = parse(`<div><p>Vue</p><p>Template</p></div>`)
transform(ast)
```

:::

::::

### 进入与退出

在转换 AST 节点的过程中，往往需要根据其子节点的情况来决定如何对当前节点进行转换。这就要求父节点的转换操作必须等待其所有子节点全部转换完毕后再执行。

对节点的访问分为两个节点，即进入阶段和退出阶段。当转换函数出于进入阶段时，它会先处理父节点，再处理子节点。而当转换函数出于退出阶段时，则会先退出子节点，再退出父节点。

:::: code-group
::: code-group-item traverseNode

```js
function traverseNode(ast, context) {
  context.currentNode = ast
  // 增加退出阶段的回调函数数组
  const exitFns = []
  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    // 转换函数可以返回另外一个函数，该函数作为退出阶段的回调函数
    const onExit = transforms[i](context.currentNode, context)
    if (onExit) {
      // 将退出阶段的回调函数添加到 exitFns 数组中
      exitFns.push(onExit)
    }
    if (!context.currentNode) return
  }

  const children = context.currentNode.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      context.parent = context.currentNode
      context.childIndex = i
      traverseNode(children[i], context)
    }
  }
  // 在节点处理的最后阶段执行缓存到 exitFns 数组中的回调函数
  let i = exitFns.length
  // 反序执行
  while (i--) {
    exitFns[i]()
  }
}
```

✅ `exitFns`用来存储转换函数返回的回调函数，我们在`traverseNode`函数的最后执行这些缓存在`exitFns`数组中的回调函数。这样保证了，**当退出节点的回调函数执行时，当前访问的节点的子节点已经全部处理过了**。

退出节点的回调函数是反序执行的。这意味着，如果注册了多个转换函数，则它们的注册顺序将决定代码的执行结果。假设我们注册的两个转换函数如下：

```js
function transform(ast) {
  // ...
  const context = {
    nodeTransforms: [ transformA, transformB ]
  }
  
  traverseNode(ast, context)
  console.log(dump(ast))
}
```

✅ 由于`transformA`会先于`transformB`在进入阶段注册，那么在退出阶段，`transformB`会先于`transformB`执行。

:::

::: code-group-item 转换函数调整

```js
function transformElement(node, context) {
	// 进入节点
  
  // 返回一个会在退出节点时执行的回调函数
  return () => {
    // 在这里编写退出节点时的逻辑，此时子节点已经处理完毕了
  }
}
```

:::

::::

至此，我们讨论了如何对 AST 进行转换，并实现了一个基本的**插件架构**，即通过自定义的转换函数实现对 AST 的操作。

### 模板 AST 转 JavaScript AST

我们需要将模板编译为渲染函数。而渲染函数是由 JavaScript 代码来描述的，因此，我们需要将模板 AST转换为用于描述渲染函数的 JavaScript AST。

```js
// <div><p>Vue</p><p>Template</p></div>
function render() {
  return h('div', [
    h('p', 'Vue'),
    h('p', 'Template')
  ])
}
```

上面这段渲染函数就是的 JavaScript 代码所**对应的 JavaScript AST** 就是我们的转换目标。

:::: code-group
::: code-group-item 函数声明语句

```js
const FunctionDeclNode = {
  type: 'FunctionDecl',  // 代表该节点是函数声明
  // 函数的名称是一个标识符，标识符本身也是一个节点
  id: {
    type: 'Identifier',
    name: 'render'  // 用来存储标识符的名称，这里即为渲染函数的函数名
  },
  params: [],
  // 渲染函数的函数体只有一个 return 语句
  body: [
    {
      type: 'ReturnStatement',
      return: null  // 暂时留空
    }
  ]
}
```

与模板 AST 一样，我们需要设计一些**数据结构**来描述渲染函数的代码。

渲染函数是一个函数声明，我们首先要描述 JavaScript 中的函数声明语句。

::: tip 函数声明语句的组成

- `id`：函数名称，它是一个标识符 Identifier
- `params`：函数的参数，它是一个数组
- `body`：函数体，由于函数体可以包含多个语句，因此它也是一个数组

*为了简化问题，这里我们不考虑箭头函数、生成器函数、async 函数等情况*

:::

:::

::: code-group-item CallExpression

```js
const CallExp = {
	type: 'CallExpression',
  // 被调用函数的名称，它是一个标识符
  callee: {
    type: 'Identifier',
    name: 'h'
  },
  // 参数
  arguments: []
}
```

渲染函数的返回值是虚拟 DOM 节点，具体体现在`h`函数的调用。我们可以使用`CallExpression`类型的节点来描述函数调用语句。

::: tip CallExpression

- `callee`：用来描述被调用函数的名称，它本身是一个标识符
- `arguments`：被调用函数的形式参数，多个参数的话用数组来描述

:::

:::

::: code-group-item StringLiteral & ArrayExepression

```js
function render() {
  // h 函数的第一个参数是一个字符串字面量
  // h 函数的第二个参数是一个数组
  return h('div', [/*...*/])
}
```

我们可以分别使用`StringLiteral`和`ArrayExepression`来表示字符串字面量和数组：

```js
const Str = {
	type: 'StringLiteral',
	value: 'div'
}

const Arr = {
	type: 'ArrayExepression',
  // 数组中的元素
	elements: []
}
```

:::

::: code-group-item FunctionDeclNode

```js
const FunctionDeclNode = {
  type: 'FunctionDecl',  // 代表该节点是函数声明
  // 函数的名称是一个标识符，标识符本身也是一个节点
  id: {
    type: 'Identifier',
    name: 'render'  // name 用来存储标识符的名称，这里即为渲染函数的函数名
  },
  params: [],
  // 渲染函数的函数体只有一个 return 语句
  body: [
    {
      type: 'ReturnStatement',
      return: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'h' },
        arguments: [
          {
            type: 'StringLiteral',
            value: 'div'
          },
          {
            type: 'ArrayExepression',
            elements: [
              {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'h' },
                arguments: [
                  { type: 'StringLiteral', value: 'p' },
                  { type: 'StringLiteral', value: 'Vue' },
                ]
              },
              {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'h' },
                arguments: [
                  { type: 'StringLiteral', value: 'p' },
                  { type: 'StringLiteral', value: 'Template' },
                ]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

:::

::::

上面的`FunctionDeclNode`这段 JavaScript AST 是对渲染含糊代码的完整描述。现在，我们需要一个转换函数，将模板 AST 转换为上述 JavaScript AST。

:::: code-group
::: code-group-item AST 辅助函数

```js
function createStringLiteral(value) {
  return {
    type: 'StringLiteral',
    value
  }
}

function createIdentifier(name) {
  return {
    type: 'Identifier',
    name
  }
}

function createArrayExpression(elements) {
  return {
    type: 'ArrayExpression',
    elements
  }
}

function createCallExpression(callee, arguments) {
  return {
    type: 'CallExpression',
    callee: createIdentifier(callee),
    arguments
  }
}
```

:::

::: code-group-item transformElement & transformText

```js
// 转换文本节点
function transformText(node) {
  // 如果不是文本节点，什么都不做
  if (node.type !== 'Text') {
    return
  }
	// 文本节点对应的 JavaScript AST 节点其实就是一个字符串字面量
  // 因此只需要使用 node.content 创建一个 StringLiteral 类型的节点即可
  // 最后将文本节点对应的 JavaScript AST 节点添加到 node.jsNode 属性下
  node.jsNode = createStringLiteral(node.content)
}

// 转换标签节点
function transformElement(node) {
	// 将转换代码编写在退出阶段的回调函数中
  // 这样可以保证该标签节点的子节点全部被处理完毕
  return () => {
    // 如果不是元素节点，什么都不做
    if (node.type !== 'Element') {
      return
    }
    
		// 1. 创建 h 函数调用语句
    // h 函数的第一个参数是标签名称
    // 因此我们以 node.tag 来创建一个字符串字面量作为第一个参数
    const callExp = createCallExpression('h', [
      createStringLiteral(node.tag)
    ])
    
    // 2. 处理 h 函数调用的参数
    node.children.length === 1
    	// 如果当前标签节点只有一个子节点，则直接使用子节点的 jsNode 作为参数
      ? callExp.arguments.push(node.children[0].jsNode)
    	// 如果当前标签节点有多个子节点，则创建一个 ArrayExpression 节点作为参数
    	: callExp.arguments.push(
      	// 数组的每个元素都是子节点的 jsNode
      	createArrayExpression(node.children.map(c => c.jsNode))
    	)
    // 将当前标签节点对于的 JavaScript AST 添加到 jsNode 属性下
    node.jsNode = callExp
  }
}
```

为了把模板 AST转换为 JavaScript AST，需要两个转换函数`transformElement`和`transformText`来处理标签节点和文本节点。

::: tip 注意

- 在转换标签节点时，我们需要将转换逻辑编写在退出阶段的回调函数内，这样才能保证其子节点全部被处理完毕；
- 无论是文本节点还是标签节点，它们转换后的 JavaScript AST 节点都存储在节点的 `node.jsNode` 属性下

:::

:::

::: code-group-item transformRoot

```js
// 转换 Root 根节点
function transformRoot(node) {
  // 将逻辑编写在退出阶段的回调函数中，保证子节点全部被处理完毕
  return () => {
    if (node.type !== 'Root') {
      return
    }
		// node 是根节点，根节点的第一个子节点就是模板的根节点
    // 这里暂不考虑多个根节点的情况
    const vnodeJSAST = node.children[0].jsNode

    node.jsNode = {
      type: 'FunctionDecl',
      id: { type: 'Identifier', name: 'render' },
      params: [],
      body: [
        {
          type: 'ReturnStatement',
          return: vnodeJSAST
        }
      ]
    }
  }
}
```

之前转换后的 AST 只是用来描述渲染函数的返回值的，所以我们最后一步需要补全 JavaScript AST，即把用来描述渲染` render` 函数本身的函数声明语句附加到 JavaScript AST 中。这需要编写 `transformRoot` 函数来实现对 Root 根节点的转换。

:::

::: code-group-item transform

```js
function transform(ast) {
  const context = {
    currentNode: null,
    parent: null,
    replaceNode(node) {
      context.currentNode = node
      context.parent.children[context.childIndex] = node
    },
    removeNode() {
      if (context.parent) {
        context.parent.children.splice(context.childIndex, 1)
        context.currentNode = null
      }
    },
    nodeTransforms: [
      transformRoot,  // 最后转换根节点
      transformElement,
      transformText
    ]
  }
  // 调用 traverseNode 完成转换
  traverseNode(ast, context)
}
```

:::

::: code-group-item 完整代码

```js
const State = {
  initial: 1,
  tagOpen: 2,
  tagName: 3,
  text: 4,
  tagEnd: 5,
  tagEndName: 6
}

function isAlpha(char) {
  return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z'
}

function tokenize(str) {
  let currentState = State.initial
  const chars = []
  const tokens = []
  while(str) {
    const char = str[0]
    switch (currentState) {
      case State.initial:
        if (char === '<') {
          currentState = State.tagOpen
          str = str.slice(1)
        } else if (isAlpha(char)) {
          currentState = State.text
          chars.push(char)
          str = str.slice(1)
        }
        break
      case State.tagOpen:
        if (isAlpha(char)) {
          currentState = State.tagName
          chars.push(char)
          str = str.slice(1)
        } else if (char === '/') {
          currentState = State.tagEnd
          str = str.slice(1)
        }
        break
      case State.tagName:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '>') {
          currentState = State.initial
          tokens.push({
            type: 'tag',
            name: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
      case State.text:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '<') {
          currentState = State.tagOpen
          tokens.push({
            type: 'text',
            content: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
      case State.tagEnd:
        if (isAlpha(char)) {
          currentState = State.tagEndName
          chars.push(char)
          str = str.slice(1)
        }
        break
      case State.tagEndName:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '>') {
          currentState = State.initial
          tokens.push({
            type: 'tagEnd',
            name: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
    }
  }

  return tokens
}

function parse(str) {
  const tokens = tokenize(str)

  const root = {
    type: 'Root',
    children: []
  }
  const elementStack = [root]

  while (tokens.length) {
    const parent = elementStack[elementStack.length - 1]
    const t = tokens[0]
    switch (t.type) {
      case 'tag':
        const elementNode = {
          type: 'Element',
          tag: t.name,
          children: []
        }
        parent.children.push(elementNode)
        elementStack.push(elementNode)
        break
      case 'text':
        const textNode = {
          type: 'Text',
          content: t.content
        }
        parent.children.push(textNode)
        break
      case 'tagEnd':
        elementStack.pop()
        break
    }
    tokens.shift()
  }

  return root
}

function traverseNode(ast, context) {
  context.currentNode = ast

  const exitFns = []
  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    const onExit = transforms[i](context.currentNode, context)
    if (onExit) {
      exitFns.push(onExit)
    }
    if (!context.currentNode) return
  }

  const children = context.currentNode.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      context.parent = context.currentNode
      context.childIndex = i
      traverseNode(children[i], context)
    }
  }

  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}


function transform(ast) {
  const context = {
    currentNode: null,
    parent: null,
    replaceNode(node) {
      context.currentNode = node
      context.parent.children[context.childIndex] = node
    },
    removeNode() {
      if (context.parent) {
        context.parent.children.splice(context.childIndex, 1)
        context.currentNode = null
      }
    },
    nodeTransforms: [
      transformRoot,
      transformElement,
      transformText
    ]
  }
  // 调用 traverseNode 完成转换
  traverseNode(ast, context)
}

// =============================== AST 工具函数 ===============================
function createStringLiteral(value) {
  return {
    type: 'StringLiteral',
    value
  }
}

function createIdentifier(name) {
  return {
    type: 'Identifier',
    name
  }
}

function createArrayExpression(elements) {
  return {
    type: 'ArrayExpression',
    elements
  }
}

function createCallExpression(callee, arguments) {
  return {
    type: 'CallExpression',
    callee: createIdentifier(callee),
    arguments
  }
}

// =============================== AST 工具函数 ===============================
function transformText(node) {
  if (node.type !== 'Text') {
    return
  }

  node.jsNode = createStringLiteral(node.content)
}


function transformElement(node) {

  return () => {
    if (node.type !== 'Element') {
      return
    }

    const callExp = createCallExpression('h', [
      createStringLiteral(node.tag)
    ])
    node.children.length === 1
      ? callExp.arguments.push(node.children[0].jsNode)
    : callExp.arguments.push(
      createArrayExpression(node.children.map(c => c.jsNode))
    )

    node.jsNode = callExp
  }
}

function transformRoot(node) {
  return () => {
    if (node.type !== 'Root') {
      return
    }

    const vnodeJSAST = node.children[0].jsNode

    node.jsNode = {
      type: 'FunctionDecl',
      id: { type: 'Identifier', name: 'render' },
      params: [],
      body: [
        {
          type: 'ReturnStatement',
          return: vnodeJSAST
        }
      ]
    }
  }
}

const ast = parse(`<div><p>Vue</p><p>Template</p></div>`)
transform(ast)

console.log(ast)
```

:::

::: code-group-item AST 转换结果

```json{125-189}
{
  "type": "Root",
  "children": [
    {
      "type": "Element",
      "tag": "div",
      "children": [
        {
          "type": "Element",
          "tag": "p",
          "children": [
            {
              "type": "Text",
              "content": "Vue",
              "jsNode": {
                "type": "StringLiteral",
                "value": "Vue"
              }
            }
          ],
          "jsNode": {
            "type": "CallExpression",
            "callee": {
              "type": "Identifier",
              "name": "h"
            },
            "arguments": [
              {
                "type": "StringLiteral",
                "value": "p"
              },
              {
                "type": "StringLiteral",
                "value": "Vue"
              }
            ]
          }
        },
        {
          "type": "Element",
          "tag": "p",
          "children": [
            {
              "type": "Text",
              "content": "Template",
              "jsNode": {
                "type": "StringLiteral",
                "value": "Template"
              }
            }
          ],
          "jsNode": {
            "type": "CallExpression",
            "callee": {
              "type": "Identifier",
              "name": "h"
            },
            "arguments": [
              {
                "type": "StringLiteral",
                "value": "p"
              },
              {
                "type": "StringLiteral",
                "value": "Template"
              }
            ]
          }
        }
      ],
      "jsNode": {
        "type": "CallExpression",
        "callee": {
          "type": "Identifier",
          "name": "h"
        },
        "arguments": [
          {
            "type": "StringLiteral",
            "value": "div"
          },
          {
            "type": "ArrayExpression",
            "elements": [
              {
                "type": "CallExpression",
                "callee": {
                  "type": "Identifier",
                  "name": "h"
                },
                "arguments": [
                  {
                    "type": "StringLiteral",
                    "value": "p"
                  },
                  {
                    "type": "StringLiteral",
                    "value": "Vue"
                  }
                ]
              },
              {
                "type": "CallExpression",
                "callee": {
                  "type": "Identifier",
                  "name": "h"
                },
                "arguments": [
                  {
                    "type": "StringLiteral",
                    "value": "p"
                  },
                  {
                    "type": "StringLiteral",
                    "value": "Template"
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  ],
  "jsNode": {
    "type": "FunctionDecl",
    "id": {
      "type": "Identifier",
      "name": "render"
    },
    "params": [],
    "body": [
      {
        "type": "ReturnStatement",
        "return": {
          "type": "CallExpression",
          "callee": {
            "type": "Identifier",
            "name": "h"
          },
          "arguments": [
            {
              "type": "StringLiteral",
              "value": "div"
            },
            {
              "type": "ArrayExpression",
              "elements": [
                {
                  "type": "CallExpression",
                  "callee": {
                    "type": "Identifier",
                    "name": "h"
                  },
                  "arguments": [
                    {
                      "type": "StringLiteral",
                      "value": "p"
                    },
                    {
                      "type": "StringLiteral",
                      "value": "Vue"
                    }
                  ]
                },
                {
                  "type": "CallExpression",
                  "callee": {
                    "type": "Identifier",
                    "name": "h"
                  },
                  "arguments": [
                    {
                      "type": "StringLiteral",
                      "value": "p"
                    },
                    {
                      "type": "StringLiteral",
                      "value": "Template"
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    ]
  }
}
```

:::

::::

至此，模板 AST 将转换为对应的 JavaScript AST，并且可以通过根节点的`node.jsNode`来访问转换后的 JavaScript AST。后续就是根据目前的 JavaScript AST 生成渲染函数。