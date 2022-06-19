# 解析器

解析器（parser）负责把字符串模板转化成模板 AST，它的本质就是一个状态机。正则表达式的本质也是一个状态机。

## 文本模式及其对解析器的影响

文本模式指的是解析器在工作时所进入的一些特殊状态，在不同的特殊状态下，解析器对文本的解析行为会有所不同。

::: tip 文本模式

当解析器遇到一些特殊标签时，会切换模式，从而影响其对文本的解析行为：

- `<title>`标签、`<textarea>`标签，当解析器遇到这两个标签时，会切换到 RCDATA 模式；
- `<title> `、`<xmp>`、`<iframe>`、`<noembed>`、`<noframes>`、`<noscript>`等标签，当解析器遇到这些标签时，会切到 RAWDARA 模式；
- 当解析器遇到`<![CDATA[`字符串时，会进入 CDATA 模式。

解析器的初始状态是 CDATA 模式。对于 Vue.js 的模板 DSL 来说，模板中不允许出`<script>`标签，因此 Vue.js 模板解析器在遇到`<script>`标签时也会切换到 RAWDATA 模式。

:::

🌐 [HTML parsing tokenization 文档 (opens new window)](https://whatwg-cn.github.io/html/multipage/parsing.html#tokenization)

在默认的 DATA 模式下，解析器在遇到 `<`时，会切换到标签开始状态（tag open state）。也就是说，在该模式下，解析器能够解析标签元素。当解析器遇到字符 `&` 时，会切换到**字符引用状态**（character reference state），也称 HTML 字符实体状态。也就是说，在  DATA 模式下，解析器能够处理 HTML 字符实体。

| 模式    | 能否解析标签 | 是否支持 HTML 实体 |
| ------- | ------------ | ------------------ |
| DATA    | 能           | 是                 |
| RCDATA  | 否           | 是                 |
| RAWDATA | 否           | 否                 |
| CDATA   | 否           | 否                 |

> 不同的模式还会影响解析器对于终止解析的判断。

```js
const TextMode = {
  DATA: 'DATA',
  RCDARA: 'RCDATA',
  RAWDATA: 'RAWDATA',
  CDATA: 'CDATA'
}
```

## 递归下降算法构造模板 AST

```js
// 定义文本模式，作为一个状态表
const TextModes = {
  DATA: 'DATA',
  RCDATA: 'RCDATA',
  RAWTEXT: 'RAWTEXT',
  CDATA: 'CDATA'
}

// 解析器函数，接收模板作为参数，负责模板 AST 的创建
function parse(str) {
  // 定义上下文对象
  const context = {
    // source 模板内容，用于解析过程消费
    source: str,
    // 解析器当前的文本模式
    mode: TextModes.DATA,
  }

  // parseChidren 函数解析，返回解析后得到的子节点
  // context: 上下文对象
  // Node[]: 父节点构成的节点栈，初始为空
  const nodes = parseChildren(context, [])

  return {
    type: 'Root',
    // 使用 nodes 作为根节点的 children
    children: nodes
  }
}
```

之前的模板 AST 的构建思路是先进行词法记号的分割，然后创建模板 AST。

✅ 创建 Token 与构造模板 AST 的过程可以同时进行，因为模板和模板 AST 具有同构的特性。

`parseChidren`函数本质上也是一个状态机，该状态机有多少种状态取决于子节点的类型数量。

::: tip 在模板中，元素的子节点可以是一下几种：

- 标签节点，例如`<div>`
- 文本插值节点，例如`{{ val }}`
- 普通文本节点，例如：`text`
- 注释节点，例如`<!---->`
- CDATA 节点，例如`<![CDATA[ xxx ]]>`

在标准的 HTML 中，节点的类型将会更多，例如 DOCTYPE 节点等。 

:::

下图为 parseChildren 函数在解析模板过程中的状态迁移过程。



![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/parseChildren.png)

:::: code-group
::: code-group-item parseChildren

```js
function parseChildren(context, ancestors) {
  // nodes 存储子节点，作为返回值
  let nodes = []
	// 从上下文对象取得当前状态，模式 mode 与模板内容 source
  const { mode, source } = context
	// 解析字符串，遇到父级节点的结束标签可停止解析
  while(!isEnd(context, ancestors)) {
    let node
		// DATA 和 RCDATA 模式支持插值节点的解析
    if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
      // 只有 DATA 模式才支持标签节点的解析
      if (mode === TextModes.DATA && context.source[0] === '<') {
        if (context.source[1] === '!') {
          if (context.source.startsWith('<!--')) {
            // 注释
            node = parseComment(context)
          } else if (context.source.startsWith('<![CDATA[')) {
            // CDATA
            node = parseCDATA(context, ancestors)
          }
        } else if (context.source[1] === '/') {
          // 结束标签，这里要抛出错误
        } else if (/[a-z]/i.test(context.source[1])) {
          // 标签
          node = parseElement(context, ancestors)
        }
      } else if (context.source.startsWith('{{')) {
        // 解析插值
        node = parseInterpolation(context)
      }
    }
    
		// node 不存在，说明出于其他模式，非 DATA、RCDATA
    // 这时一切内容都作为文本处理
    if (!node) {
      node = parseText(context)
    }
		// 将节点添加到数组中
    nodes.push(node)
  }

  return nodes
}
```

- `parseChildren` 函数的返回值是子节点组成的数组，这里每次 while 循环都会解析一个或多个节点，这些节点会被添加到 node 数组中，并作为函数返回值。
- 只有 DATA 和 RCDATA 模式支持插值节点的解析；只有 DATA 模式才支持标签节点、注释节点和 CDATA 节点的解析。
- 解析器在遇到特定标签时，会切换模式。一旦解析器切换到 DATA模式和 RCDATA 模式之外的模式时，一切内容都会作为文本节点被解析。当然，即使在 DATA 模式和 RCDATA 模式下，如果无法匹配标签节点、注释节点、CDATA 节点、插值节点，那么也会作为文本节点解析。

:::
::: code-group-item 待解析的模板

```js
const template = `<div>
	<p>Text1</p>
	<p>Text2</p>
</div>`
```

解析模板时，不能忽略空白字符。这些空白字符包括：换行符（\n）、回车符（\t）、空格（' '）、制表符（\t）以及换页符（\f）。

如果我们用（+）代表换行符，用（-）代表空格字符，那么模板可以表示为：

```js
const template = `<div>+--<p>Text1</p>+--<p>Text1</p>+</div>`
```

解析器—开始处于 DATA 模式。开始执行解析后，解析器遇到的第一个字符为`＜`，并且第个字符能够匹配正则表达式 `/a-z/t`，所以解析器会进人标签节点状态，并调用 `parseElement`函数进行解析。

:::

::: code-group-item parseElement

```js
function parseElement(context, ancestors) {
  // 解析开始标签
  const element = parseTag(context)
  // 递归调用 parseChildren 解析子节点
  element.children = parseChildren(context, ancestors)
  // 解析结束标签
  parseEndTag()
  
  return element
}
```

::: tip parseElement 函数会做三件事：

1. 解析开始标签
2. 解析子节点
3. 解析结束标签

:::

:::

::::

::: details 解析过程

如果一个标签不是自闭合标签，则可以认为，一个完整的标签元素是由**开始标签**、**子节点**和**结束标签**这三部分构成的。因此，在 `parseElement` 函数内，我们分别调用三个解析函数来处理这三部分内容。以上述模板为例。

- `parseTag` 解析开始标签。`parseTag` 函数用于解析开始标签，包括开始标签上的属性和指令。因此，在`parseTag` 解析函数执行完毕后，会消费字符串中的内容`<div>`，处理后的模板内容将变为：

```js
const template =`+--<p>Text1</p>+--<p>Text2</p>+</div>`
```

- 递归地调用 `parseChildren` 函数解析子 节点。`parseElement` 函数在解析开始标签时，会产生一个标签节点 element。在 `parseElement`函数执行完毕后，剩下的模板内容应该作为element 的子节点被解析，即 `element.children`。因此，我们要递归地调用 `parseChildren`函数。在这个过程中，`parsechildren`函数会消费字符串的内容：`+--<p>Text1</p>+--<p>Text2</p>+`。处理后的模板内容将变为：
  
  ```js
  const template =`</div>`
  ```
  
- `parseEndTag` 处理结束标签。可以看到，在经过 `parseChildren` 函数处理后，模板内容只剩下一个结束标签了。因此，只需要调用 `parseEndTag` 解析西数来消费它即可。

经过上述三个步骤的处理后，这段模板就被解析完毕了，最终得到了模板 AST。但这里值得注意的是，为了解析标签的子节点，递归地调用了 `parseChildren` 函数。这意味着，一个新的状态机开始运行了，我们称其为“状态机 2”。“状态机 2”所处理的模板内容为：

```js
const template = `+--<p>Text1</p>+--<p>Text2</p>+`
```

接下来，我们继续分析〝状态机 2” 的状态迁移流程。在“状态机 2〞开始运行时，模板的第一个字符是换行符(字符＋代表换行符)。因此，解析器会进入文本节点状态，并调用 `parseText`函数完成文本节点的解析。`parseText` 函数会将下一个`<`字符之前的所有字符都视作文本节点的内容。换向话说，`parseText` 函数会消费模板内容`＋--`，并产生一个文本节点。在`parseText` 解析函数执行完毕后，剩下的模板内容为：

```js
const template = `<p>Text1</p>+--<p>Text2</p>+`
```

接着，`parseChildren` 函数继续执行。此时模板的第一个字符为`<`，并且下一个字符能够匹配正则 `/a-z/i`。于是解析器再次进人 `parseElement` 解析函数的执行阶段，这会消费模板内容`<p>Text1</p>`。在这一步过后，剩下的模板内容为：

```js
const template =`+--<p>Text2</p>+`
```

可以看到，此时模板的第一个字符是换行符，于是调用 `parseText` 函数消费模板内容`+--`现在，模板中剩下的内容是：

```js
const template =`<p>Text2</p>+`
```

解析器会再次调用 parseElement 丽数处理标签节点。在这之后，剩下的模板内容为：

```js
const template =`+`
```

可以看到，现在模板内容只剩下一个换行符了。`parseChildren` 函数会继续执行并调用`parseText` 函数消费剩下的内容，并产生一个文本节点。最终，模板被解析完毕，“状态机2”停止运行。

在“状态机2”运行期间，为了处理标签节点，我们又调用了两次 `parseElement` 函数。第一次调用用于处理内容 `<p>Text1</p>`，第二次调用用于处理内容
`<p>Text2</p>`。我们知道`parseElement` 函数会递少地调用 `parsechildren` 函数完成子节点的解析，这就意味着解析器会再开启了两个新的状态机。

:::

`parseChildren`解析函数是整个状态机的核心，状态迁移操作都在该函数内完成。在`parseChildren` 函数运行过程中，为了处理标签节点，会调用`parseElement` 解析函数，这会间接地调用 `parseChildren`函数，并产生一个新的状态机。

随着标签嵌套层次的增加，新的状态机会随着`parseChildren`函数递归地调用而不断创建，这就是“递归下降”中“递归”二字的含义。

而上级`parseChildren`函数的调用用于构造上级模板 AST，被递归调用的下级 `parseChildren` 函数则用于构造下级模板 AST 节点。最终，会构造出一棵树型结构的模板 AST，这就是“递归下降”中“下降”二字的含义。

## 状态机的开启和停止

`parseChildren`函数本质上是一个状态机，它会开启一个 while 循环使得状态机自动运行。

```js
function parseChildren(context, ancestors) {
  let nodes = []

  const { mode } = context
  // 运行状态机
  while(!isEnd(context, ancestors)) {
    // 省略部分代码
  }

  return nodes
}
```

当解析器遇到开始标签时，会将该标签压入父级节点栈，同时开启新的状态机。当解折器遇到结束标签，井且父级节点栈中存在与该标签同名的开始标签节点时，会停止当前正在运行的状态机。根据上述规则，我们可以给出`isEnd`函数的逻辑，如下面的代码所示：

```js
function isEnd(context, ancestors) {
  // 当解析内容解析完毕之后，停止
  if (!context.source) return true
  const parent = ancestors[ancestors.length - 1]
  // 遇到与父节点同名的结束标签时，停止
  if (parent && context.source.startsWith(`</${parent.tag}`)) {
    return true
  }
}
```

这个判断方式是有瑕疵的，以下面这个模板为例：

```html
<div><span></div></span>
```

1. 目前代码“状态机1“会遇到 div 会开启一个“状态机2“
2. 接着遇到 span 再开启一个“状态机3“
3. “状态机3“解析时遇到了`</div>`这个结束标签，与当前 span 标签不符。则“状态机3“抛出错误：“无效的结束标签”

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/parseTag1.png)

```js{18-19}
function parseChildren(context, ancestors) {
  let nodes = []
  const { mode } = context

  while(!isEnd(context, ancestors)) {
    let node

    if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
      if (mode === TextModes.DATA && context.source[0] === '<') {
        if (context.source[1] === '!') {
          if (context.source.startsWith('<!--')) {
            // 注释
          } else if (context.source.startsWith('<![CDATA[')) {
            // CDATA
          }
        } else if (context.source[1] === '/') {
          // 结束标签，这里要抛出错误，因为它缺少对应的开始标签
          console.error('无效的结束标签')
          continue
        } else if (/[a-z]/i.test(context.source[1])) {
          // ...
        }
      } else if (context.source.startsWith('{{')) {
        // ...
      }
    }
    // ...
  }

  return nodes
}
```

当前解释方式是会得到错误信息：“无效的结束标签”。

✅ 还有一种解释方式，在“完整的内容”部分被解析完毕后，解析器就会打印错误信息：“`<span>`标签缺少闭合标签”。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/Vuejs3/parseTag2.png)

```js
function isEnd(context, ancestors) {
  if (!context.source) return true

  // 与节点栈内全部的节点比较
  for (let i = ancestors.length - 1; i >= 0; --i) {
    if (context.source.startsWith(`</${ancestors[i].tag}`)) {
      return true
    }
  }
}
```

1. ”状态机1”遇到 div 会开启一个”状态机2”；
2. 接着遇到 span 再开启一个”状态机3”；
3. ”状态机3”这个状态机解析时遇到了`</div>`这个结束标签，在节点栈中找到了存在名为 div 的标签节点。于是状态机3停止。

在这个过程中，“状态机2”在调用`parseElement`函数时检测到`<span>`缺少闭合标签，打印“`<span>`缺少闭合标签”。

```js
function parseElement(context, ancestors) {
  const element = parseTag(context)
  if (element.isSelfClosing) return element

  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  if (context.source.startsWith(`</${element.tag}`)) {
    parseTag(context, 'end')
  } else {
    console.error(`${element.tag} 标签缺少闭合标签`)
  }

  return element
}
```
