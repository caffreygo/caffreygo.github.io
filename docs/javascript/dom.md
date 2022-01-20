# DOM

📗 操作文档HTML的JS处理方式为DOM 即Document Object Model 文档对象模型。如果对HTML很了解使用DOM并不复杂。

浏览器在加载页面是会生成DOM对象，以供我们使用JS控制页面元素。

## 文档渲染

::: tip 浏览器会将HTML文本内容进行渲染，并生成相应的JS对象，同时会对不符规则的标签进行处理。

- 浏览器会将标签规范后渲染页面
- 目的一让页面可以正确呈现
- 目的二可以生成统一的JS可操作对象

:::

### 标签修复

🔰 在html中只有内容`hello` 而没有任何标签时，通过浏览器的 `检查>元素` 标签查看会自动修复成以下格式的内容

```html
<html>
    <head></head>
    <body>hello</body>
</html>
```

下面H1标签结束错误并且属性也没有引号，浏览器在渲染中会进行修复

```html
<body>
  <h1 id=jc>hello<h1>
</body>
```

处理后的结果

```html
<html>
	<head></head>
	<body>
    <h1 id="jc">hello</h1>
  </body>
</html>
```

### 表格处理

表格tabel中不允许有内容，浏览器在渲染过程中会进行处理

```html
<table>
    hello
    <tr>
        <td>world</td>
    </tr>
</table>
```

渲染后会添加tbody标签并将table中的字符移出

```html
hello
<table>
    <tbody>
        <tr>
            <td>world</td>
        </tr>
    </tbody>
</table>
```

### 标签移动

📗 所有内容**要写在BODY标签中**，下面的SCRIPT标签写在了BODY后面，浏览器渲染后也会进行处理

```html
<body></body>
<script>
    console.dir('hello')
</script>
```

渲染后处理的结果

```html
<body>
    <script>
        console.dir('hello')
    </script>
</body>
```

## 操作时机 🔰

📗 需要保证浏览器**已经渲染**了内容才可以读取的节点对象，下例将无法读取到节点对象

```html
<script>
    const node = document.getElementById('nodeId')
    console.log(node) // null
</script>
<h1 id="nodeId">hello</h1>
```

不过我们可以将脚本通过**事件**放在页面渲染完执行`window.onload`

```html
<script>
    window.onload = () => {
        const node = document.getElementById('nodeId')
        console.log(node) // <h1 id="nodeId">hello</h1>
    }
</script>
<h1 id="nodeId">hello</h1>
```

或使用**定时器**将脚本设置为异步执行

```html
<script>
    setTimeout(() => {
        const node = document.getElementById('nodeId')
        console.log(node) // <h1 id="nodeId">hello</h1>
    })
</script>
<h1 id="nodeId">hello</h1>
```

或将脚本设置在外部文件并使用defer属性加载，defer即会等到DOM解析后迟延执行

```html
<script defer="defer" src="3.js"></script>
<div id="nodeId"></div>
```

### defer和async

-  defer：此布尔属性被设置为向浏览器指示脚本在**文档被解析后**执行 📌。
-  async：设置此布尔属性，以指示浏览器如果可能的话，应异步执行脚本。

1. 对于defer，我们可以认为是将外链的js放在了页面底部。js的加载不会阻塞页面的渲染和资源的加载。不过defer会按照原本的js的顺序执行，所以如果前后有依赖关系的js可以放心使用。
2. 对于async，这个是html5中新增的属性，它的作用是能够异步的加载和执行脚本，不因为加载脚本而阻塞页面的加载。一旦加载到就会立刻执行在有async的情况下，js一旦下载好了就会执行，所以很有可能不是按照原本的顺序来执行的。如果js前后**有依赖性**，用async，就很有可能**出错**。

## 节点对象

::: tip JS中操作DOM的内容称为节点对象（node)，即然是对象就包括操作NODE的属性和方法

- 包括12种类型的节点对象
- 常用了节点为document、标签元素节点、文本节点、注释节点
- 节点均继承自Node类型，所以拥有相同的属性或方法
- document是DOM操作的起始节点

:::

```html
<body id="nodeId">
    <!-- hello -->
</body>
<script>
    // document节点 noteType为9
    console.log(document.nodeType)

    // 第一个子节点为<!DOCTYPE html>，且nodetype为10
    console.log(document.childNodes.item(0).nodeType)

    // body 是标签节点 nodeType为1
    console.log(document.body.nodeType) 

    // body的属性节点 nodeType 为2
    console.log(document.body.attributes[0].nodeType)

    // body的第一个节点为文本节点，nodeType为3
    console.log(document.body.childNodes.item(0).nodeType)

    // body的第二个节点为注释，nodeType类型为8
    console.log(document.body.childNodes[1].nodeType)
</script>
```

### 原型链

在浏览器渲染过程中会将文档内容生成为不同的对象，我伙来对下例中的h1标签进行讨论，其他节点情况相似

- 不同类型节点由专有的构造函数创建对象
- 使用console.dir 可以打印出DOM节点对象结构
- 节点也是对象所以也具有JS对象的特征

```html
<h1 id="jc">hello</h1>

<script>
  function prototype(el) {
    console.dir(el.__proto__)
    el.__proto__ ? prototype(el.__proto__) : ''  // 递归获取对象原型
  }
  const node = document.getElementById('jc')
  prototype(node)
</script>
```

最终得到的节点的原型链为

| 原型               | 说明                                                         |
| ------------------ | ------------------------------------------------------------ |
| Object             | 根对象，提供hasOwnProperty等基本对象操作支持                 |
| EventTarget        | 提供addEventListener、removeEventListener等事件支持方法      |
| Node               | 提供firstChild、parentNode等节点操作方法                     |
| Element            | 提供getElementsByTagName、querySelector等方法                |
| HTMLElement        | 所有元素的基础类，提供childNodes、nodeType、nodeName、className、nodeName等方法 |
| HTMLHeadingElement | Head标题元素类                                               |

✴️ 将上面的方法优化，实现提取节点原型链的数组

```html
<h2>hello</h2>
<input type="text" value="world" />

<script>
    function prototype(el) {
        const prototypes = []
        prototypes.push(el.__proto__)
        prototypes.push(...(el.__proto__ ? prototype(el.__proto__) : []))
        return prototypes
    }
    const h2 = document.querySelector('h2')
    const input = document.querySelector('input')

    console.log(prototype(input))
</script>
```

下面为标题元素增加两个原型方法，改变颜色与隐藏元素

```html
<h2 onclick="this.color('red')">hello world</h2>
<script>
  const h2 = document.querySelector('h2')
  HTMLHeadingElement.prototype = Object.assign(HTMLHeadingElement.prototype, {
    color(color) {
      this.style.color = color
    },
    hide() {
      this.style.display = 'none'
    },
  })
</script>
```

### 对象特征

📗 即然DOM与我们其他JS创建的对象特征相仿，所以也可以为DOM对象添加属性或方法。

对于系统应用的属性，应该明确含义不应该随意使用，比如ID是用于标识元素唯一属性，不能用于其他目地。`id | title`

> 允许自定义属性，ID属性可以直接修改但是不建议这么做

```javascript
let jc = document.getElementById('jc')
jc.id = 'hi'
console.log(jc)   
```

`title`用于显示提示文档也不应该用于其他目地

```html
<div id="site">caffreygo.com</div>

<script>
  let site = document.getElementById('site')
  site.title = 'caffreygo.com'
  console.log(site)
</script>
```

下面是为对象合并属性的示例

```html
<div id="jc">caffreygo.com</div>
<script>
  let jc = document.getElementById('jc')

  Object.assign(jc, {
    //设置标签内容
    innerHTML: 'hello world',
    color: 'red',
    change() {
      this.innerHTML = '测试数据'
      this.style.color = this.color
    },
    onclick() {
      this.change()
    },
  })
</script>
```

使用对象特性更改样式属性

```html
<div id="jc">caffreygo.com</div>

<script>
  let jc = document.getElementById('jc')
  Object.assign(jc.style, {
    color: 'white',
    backgroundColor: 'red',
  })
</script>
```

## 常用节点

JS 提供了访问常用节点的 api

| 方法                     | 说明                        |
| ------------------------ | --------------------------- |
| document                 | document是DOM操作的起始节点 |
| document.documentElement | 文档节点即html标签节点      |
| document.body            | body标签节点                |
| document.head            | head标签节点                |
| document.links           | 超链接集合                  |
| document.anchors         | 所有锚点集合                |
| document.forms           | form表单集合                |
| document.images          | 图片集合                    |

### DOCUMENT

📗 `document`是window对象的属性，是由HTMLDocument类实现的实例。

> document包含 DocumentType（唯一）或 html元素（唯一）或 comment等元素

原型链中也包含Node，所以可以使用有关节点操作的方法如nodeType/NodeName等

```javascript
console.dir(document.nodeType)
console.dir(document.nodeName)
```

使用`title`获取和设置文档标题

```javascript
//获取文档标题
console.log(document.title)

//设置文档标签
document.title = '测试数据-caffreygo.com'
```

获取当前URL

```javascript
console.log(document.URL)
```

获取域名

```javascript
document.domain
```

获取来源地址 📌

```javascript
console.log(document.referrer)
```

### ID

下面是直接使用 ID 获取元素（这是非标准操作，对浏览器有挑剔）

```javascript
<div id="app">测试数据</div>

<script>
  // 直接通过 ID 获取元素（非标准操作）
  console.dir(app)
</script>
```

### links

下面展示的是获取所有a标签: `document.links => HTMLCollection  `

```html
<div name="app">
  <a href="">caffreygo.com</a>
  <a href="">baidu.com</a>
</div>

<script>
  const nodes = document.links
  console.dir(nodes)
</script>
```

### anchors

下例是获取锚点集合后能过 锚点 name 属性获取元素:  HTMLCollection

```html
<div>
  <a href="" name="n1">caffreygo.com</a>
  <a href="" name="n2">baidu.com</a>
</div>

<script>
  // 通过锚点获取元素
  console.dir(document.anchors.n2)
</script>
```

### images

下面是获取所有图片节点:  HTMLCollection

```html
<img src="" alt="" />
<img src="" alt="" />
<img src="" alt="" />
<script>
  // 获取所有图片节点
  console.dir(document.images)
</script>
```

## 节点属性

📗 不同类型的节点拥有不同属性，下面是节点属性的说明与示例

### nodeType

nodeType指以数值返回节点类型

| nodeType | 说明         |
| -------- | ------------ |
| 1        | 元素节点     |
| 2        | 属性节点     |
| 3        | 文本节点     |
| 8        | 注释节点     |
| 9        | document对象 |

下面是节点nodeType的示例

```html
<div id="app">
  <div>caffreygo.com</div>
  <div>hello</div>
  <div class="flex"><!-- hello world --></div>
</div>

<script>
  const node = document.querySelector(`#app`)
  console.log(node.nodeType)  // 1
  console.log(node.firstChild.nodeType)  // 3 #Text
  console.log(node.attributes.id.nodeType)  // 2 元素属性也是一种节点！

  const node1 = document.querySelector('.flex')
  console.log(node1.childNodes[0].nodeType)  // 8 #Comment
</script>
```

下面是根据指定的 nodeType 递归获取节点元素的示例

> 可获取文本、注释、标签等节点元素

```html
<!-- 测试数据 -->
测试数据 caffreygo.com
<div id="app">
  <ul>
    <li>
      <span></span>
      <span>
        <!-- 注释文本 -->
      </span>
    </li>
    <li><span></span><span></span></li>
    <li><span></span><span></span></li>
  </ul>
</div>

<script>
  function all(el, nodeType = 1) {
    const nodes = []
    // Array.from将NodeList转化为数组
    Array.from(el.childNodes).map(node => {
      // 获取同级匹配的所有节点
      if (node.nodeType == nodeType) nodes.push(node)
      // 如果当前节点是元素，递归～
      if (node.nodeType == 1) nodes.push(...all(node, nodeType))
    })
    return nodes
  }
  console.log(all(document.body))
</script>
```

### Prototype

::: tip 当然也可以使用对象的原型进行检测

- section 、main、aslide 标签的原型对象为HTMLElement
- 其他非系统标签的原型对象为HTMLUnknownElement

​		`obj instanceof Constructor`

::: 

```javascript
let h1 = document.querySelector('h1')
let p = document.querySelector('p')
console.log(h1 instanceof HTMLHeadingElement)  // true
console.log(p instanceof HTMLHeadingElement)  // false
console.log(p instanceof Element)  // true
```

下例是通过构建函数获取节点的示例

```html
<!-- 测试数据 -->
测试数据 caffreygo.com
<div id="app">
  <ul>
    <li>
      <span></span>
      <span>
        <!-- 注释文本 -->
      </span>
    </li>
    <li><span></span><span></span></li>
    <li><span></span><span></span></li>
  </ul>
</div>

<script>
  function all(el, prototype) {
    const nodes = []

    Array.from(el.childNodes).map(node => {
      if (node instanceof prototype) nodes.push(node)

      if (node.nodeType == 1) nodes.push(...all(node, prototype))
    })
    return nodes
  }

  console.log(all(document.body, HTMLSpanElement))
</script>
```

### nodeName

📗 nodeName指定节点的名称，获取值为大写形式

| nodeType | nodeName      |
| -------- | ------------- |
| 1        | 元素名称如DIV |
| 2        | 属性名称      |
| 3        | #text         |
| 8        | #comment      |

下面来操作 nodeName

```html
<div id="app">
  <div class="google" data="jc">caffreygo.com</div>
  <div class="baidu">baidu.com</div>
  <div class="michael"><!-- hello world --></div>
  <span> 测试数据</span>
</div>
<script>
  const div = document.querySelector(`#app`)
  const span = document.querySelector('span')

  // 标签节点为大写的标签名DIV
  console.log(div.nodeName)  // DIV
  console.log(span.nodeName)  // SPAN

  // 文本节点为 #text
  console.log(div.firstChild.nodeName)

  //属性节点为属性名 app
  console.log(div.attributes.id.nodeName)

  // 注释节点为 #comment
  const mc = document.querySelector('.michael')
  console.log(mc.childNodes[0].nodeName)
</script>
```

### tagName

::: tip nodeName可以获取不限于元素的节点名，tagName仅能用于获取标签节点的名称

- tagName存在于Element类的原型中
- 文本、注释节点值为 undefined
- 获取的值为大写的标签名

::: 

```html
<div id="app">
  <div class="google" data="jc">caffreygo.com</div>
  <div class="baidu">baidu.com</div>
  <div class="michael"><!-- hello world --></div>
  <span> 测试数据</span>
</div>
<script>
  const div = document.querySelector(`#app`)
  const span = document.querySelector('span')

  // 标签节点为大写的标签名 如 DIV、SPAN
  console.log(div.tagName)
  console.log(span.tagName)

  // 文本节点为 undefined
  console.log(div.firstChild.tagName)

  // 属性节点为 undefined
  console.log(div.attributes.id.tagName)

  // 注释节点为 undefined
  const xj = document.querySelector('.michael')
  console.log(xj.childNodes[0].tagName)
</script>
```

### nodeValue

📗 使用nodeValue或data函数获取节点值，也可以使用节点的data属性获取节点内容

| nodeType | nodeValue |
| -------- | --------- |
| 1        | null      |
| 2        | 属性值    |
| 3        | 文本内容  |
| 8        | 注释内容  |

下面来看nodeValue的示例

```html
<div id="app">
  <div class="google">caffreygo.com</div>
  <div class="baidu">baidu.com</div>
  <div class="michael"><!-- hello world --></div>
</div>
<script>
  const node = document.querySelector(`#app`)
  //标签的 nodeValue 值为 null
  console.log(node.nodeValue)

  //属性的 nodeVale 值为属性值 app
  console.log(node.attributes.id.nodeValue)

  //文本的 nodeValue 值为文本内容 baidu.com
  const baidu = document.querySelector('.baidu')
  console.log(baidu.firstChild.nodeValue)

  //注释的 nodeValue 值为注释内容 hello world
  const xj = document.querySelector('.michael')
  console.log(xj.childNodes[0].nodeValue)
</script>
```

使用data属性可以获取文本与注释内容 📌

```html
<div id="app">
  caffreygo.com
  <!-- 测试数据 注释内容-->
</div>

<script>
  const app = document.querySelector('#app')
  console.log(app.childNodes[0].data)
  console.log(app.childNodes[1].data)
</script>
```

### 树状节点

获取标签树状结构即多级标签结构

```html
<div id="app">
  <ul>
    <li><span></span><span></span></li>
    <li><span></span><span></span></li>
    <li><span></span><span></span></li>
  </ul>
</div>

<script>
  function tree(el) {
    return Array.from(el.childNodes)
      .filter(node =>node.tagName)
      .map(node => ({
      name: node.nodeName,
      children: tree(node),  // 递归获取子节点
    }))
  }
  console.log(tree(document.getElementById('app')))
</script>
```

上例结果如下

```shell
Array(2)
0: {name: 'HEAD', children: Array(4)}
1: {name: 'BODY', children: Array(2)}
```

## 节点集合 🔰

::: tip Nodelist与HTMLCollection都是包含多个节点标签的集合，大部分功能也是相同的。

- getElementsBy...等方法返回的是HTMLCollection
- HTMLCollection节点列表是**动态**的，即内容添加后会动态更新 📌
- querySelectorAll 返回的是 NodeList （快照） `for|forEach|keys|values|entries`

::: 

```html
<div></div>
<div></div>

<script>
  console.log(document.querySelectorAll('div'))  // NodeList
  console.log(document.getElementsByTagName('div')) // HTMLCollection 
</script>
```

### length

📗 Nodelist与HTMLCollection包含length属性，记录了节点元素的数量

```html
<div name="app">
  <div id="google">caffreygo.com</div>
  <div name="baidu">baidu.com</div>
</div>

<script>
  // 通过 length 遍历 HTMLCollection
  const nodes = document.getElementsByTagName('div')
  for (let i = 0; i < nodes.length; i++) {
    console.log(nodes[i])
  }
</script>
```

### item

Nodelist与HTMLCollection提供了item()方法来根据索引获取元素

> item(index) —— 返回 HTMLCollection 中指定索引的元素，不存在返回 null

```html
<div name="app">
  <div id="google">caffreygo.com</div>
  <div name="baidu">baidu.com</div>
</div>

<script>
  const nodes = document.getElementsByTagName('div')
  console.dir(nodes.item(0))
</script>
```

使用数组索引获取更方便

```html
<div name="app">
  <div id="google">caffreygo.com</div>
  <div name="baidu">baidu.com</div>
</div>

<script>
  const nodes = document.getElementsByTagName('div')
  console.dir(nodes[0])
</script>
```

### namedItem

📗 HTMLCollection具有namedItem方法可以按`name`或`id`属性来获取元素

```html
<div name="app">
  <div id="google">caffreygo.com</div>
  <div name="baidu">baidu.com</div>
</div>

<script>
  const nodes = document.getElementsByTagName('div')
  console.dir(nodes.namedItem('baidu'))
   console.dir(nodes.namedItem('google'))
</script>
```

也可以使用数组或属性方式获取

```html
<div name="app">
  <div id="google">caffreygo.com</div>
  <div name="baidu">baidu.com</div>
</div>

<script>
  const nodes = document.getElementsByTagName('div')  // collection
  console.dir(nodes['baidu']);
  console.dir(nodes.google)
</script>
```

数字索引时使用item方法，字符串索引时使用namedItem或 items方法

```html
<h1 id="jc">caffreygo.com</h1>
<h1 name="xj">hello world</h1>

<script>
  let items = document.getElementsByTagName('h1')
  console.log(items[0])
  console.log(items['xj'])
</script>
```

## 动态与静态 🧸

::: tip 通过 getElementsByTagname 等getElementsBy... 函数获取的HTMLCollection集合是动态的，即有元素添加或移动操作将实时反映最新状态。

- 使用getElement...返回的都是动态的集合 HTMLCollection
- 使用querySelectorAll返回的是静态集合 NodeList

::: 

### 动态特性

下例中通过按钮动态添加元素后，获取的元素集合是动态的，而不是上次获取的固定快照。

```html
<h1>caffreygo.com</h1>
<h1>baidu.com</h1>
<button id="add">添加元素</button>

<script>
  let elements = document.getElementsByTagName('h1')  // collection
  console.log(elements) // 2
  let button = document.querySelector('#add')
  button.addEventListener('click', () => {
    document.querySelector('body').insertAdjacentHTML('beforeend', '<h1>hello world</h1>')
    console.log(elements)  // 3
  })
</script> 
```

document.querySelectorAll获取的集合是静态的NodeList

```html
<h1>caffreygo.com</h1>
<h1>baidu.com</h1>
<button id="add">添加元素</button>

<script>
  let elements = document.querySelectorAll('h1')
  console.log(elements.length)
  let button = document.querySelector('#add')
  button.addEventListener('click', () => {
    document.querySelector('body').insertAdjacentHTML('beforeend', '<h1>hello world</h1>')
    console.log(elements.length)
  })
</script>
```

### 使用静态

如果需要保存静态集合，则需要对集合进行复制

```html
<div id="google">caffreygo.com</div>
<div name="baidu">baidu.com</div>

<script>
  const nodes = document.getElementsByTagName('div')  // HTMLCollection
  const clone = Array.prototype.slice.call(nodes)
  console.log(nodes.length);  // 2
  document.body.appendChild(document.createElement('div'))
  console.log(nodes.length);  // 3
  console.log(clone.length);  // 2
</script>
```

## 遍历节点

### forOf

Nodelist与HTMLCollection是**类数组**的可迭代对象所以可以使用for...of进行遍历

```html
<div id="google">caffreygo.com</div>
<div name="baidu">baidu.com</div>
<script>
  const nodes = document.getElementsByTagName('div')
  for (const item of nodes) {
    console.log(item)
  }
</script>
```

### forEach

Nodelist节点列表也可以使用forEach来进行遍历，但HTMLCollection则不可以

```html
<div id="google">caffreygo.com</div>
<div name="baidu">baidu.com</div>
<script>
  const nodes = document.querySelectorAll('div')
  nodes.forEach((node, key) => {
    console.log(node)
  })
</script>
```

### call/apply 💡

节点集合对象原型中不存在map方法，但可以借用Array的原型map方法实现遍历

```html
<div id="google">caffreygo.com</div>
<div name="baidu">baidu.com</div>

<script>
  const nodes = document.querySelectorAll('div')
  Array.prototype.map.call(nodes, (node, index) => {
    console.log(node, index)
  })
</script>
```

当然也可以使用以下方式操作

```javascript
;[].filter.call(nodes, node => {
	console.log(node)
})

;[...nodes].map(node=> {
	console.log(node)
})
```

### Array.from

Array.from用于将类数组转为组件，并提供第二个迭代函数。所以可以借用Array.from实现遍历

```html
<div id="google">caffreygo.com</div>
<div name="baidu">baidu.com</div>

<script>
  const nodes = document.getElementsByTagName('div')
  Array.from(nodes, (node, index) => {
    console.log(node, index)
  })
</script>
```

### 展开语法 💡

下面使用点语法转换节点为数组

```html
<h1>caffreygo.com</h1>
<h1>baidu.com</h1>
<script>
  let elements = document.getElementsByTagName('h1')
  ;[...elements].map((item) => {
    item.addEventListener('click', function () {
      this.style.textTransform = 'uppercase'
    })
  })
</script>
```

## 节点关系

📗 节点是父子级嵌套与前后兄弟关系，使用DOM提供的API可以获取这种关系的元素。

> 文本和注释也是节点，所以也在匹配结果中

### 基础知识

节点是根据HTML内容产生的，所以也存在父子、兄弟、祖先、后代等节点关系，下例中的代码就会产生这种多重关系

- h1与ul是兄弟关系
- span与li是父子关系
- ul与span是后代关系
- span与ul是祖先关系

```html
<h1>测试数据</h1>
<ul>
  <li>
    <span>google</span>
    <strong>baidu</strong>
  </li>
</ul>
```

下面是通过节点关系获取相应元素的方法

| 节点属性        | 说明           |
| --------------- | -------------- |
| childNodes      | 获取所有子节点 |
| parentNode      | 获取父节点     |
| firstChild      | 第一个子节点   |
| lastChild       | 最后一个子节点 |
| nextSibling     | 下一个兄弟节点 |
| previousSibling | 上一个兄弟节点 |

子节点集合与首、尾节点获取

> 文本也是node所以也会在匹配当中

```html
<div id="app">
  <div class="google" data="jc">caffreygo.com</div>
  <div class="baidu">baidu.com</div>
  <div class="michael">hello world</div>
</div>
<script>
  const node = document.querySelector(`#app`)
  console.log(node.childNodes) //所有子节点
  console.log(node.firstChild) //第一个子节点是文本节点
  console.log(node.lastChild) //最后一个子节点也是文本节点
</script>
```

下面通过示例操作节点关联

> 文本也是node所以也会在匹配当中

```html
<div id="app">
  <div class="google" data="jc">caffreygo.com</div>
  <div class="baidu">baidu.com</div>
  <div class="michael">hello world</div>
</div>
<script>
  const node = app.querySelector(`.baidu`)
  console.log(node.parentNode) //div#app
  console.log(node.childNodes) //文本节点
  console.log(node.nextSibling) //下一个兄弟节点是文本节点
  console.log(node.previousSibling) //上一个节点也是文本节点
</script>
```

document是顶级节点html标签的父节点是document

```html
<script>
  console.log(document.documentElement.parentNode === document)
</script>
```

### 父节点集合

下例是查找元素的所有父节点

```html
<div id="google">caffreygo.com</div>

<script>
  function parentNodes(node) {
    let nodes = []
    while ((node = node.parentNode)) nodes.push(node)
    return nodes
  }
  const el = document.getElementById('google')
  const nodes = parentNodes(el)
  console.log(nodes)
</script>
```

使用递归获取所有父级节点

```html
<div>
  <ul>
    <li><span></span></li>
  </ul>
</div>
<script>
  const span = document.querySelector('span')

  function parentNodes(node) {
    const nodes = new Array(node.parentNode)
    if (node.parentNode) nodes.push(...parentNodes(node.parentNode))
    return nodes
  }

  const nodes = parentNodes(document.querySelector('span'))
  console.log(nodes)
</script>
```

### 后代节点集合

获取所有的后代元素SPAN的内容

```html
<div id="app">
  <span>caffreygo.com</span>
  <h2>
    <span>baidu.com</span>
  </h2>
</div>

<script>
  function getChildNodeByName(el, name) {
    const items = []
    Array.from(el.children).forEach(node => {
      // 遍历当前同级标签
      if (node.tagName == name.toUpperCase()) items.push(node)
      // 递归子节点
      items.push(...getChildNodeByName(node, name))
    })

    return items
  }
  const nodes = getChildNodeByName(document, 'span')
  console.log(nodes)
</script>
```

## 标签关系

> 使用childNodes等获取的节点包括文本与注释，但这不是常用的，为此系统也提供了只操作元素的关系方法。

### 基础知识

下面是处理标签关系的常用 API

| 节点属性               | 说明                                             |
| ---------------------- | ------------------------------------------------ |
| parentElement          | 获取父元素                                       |
| children               | 获取所有子元素                                   |
| childElementCount      | 子标签元素的数量                                 |
| firstElementChild      | 第一个子标签                                     |
| lastElementChild       | 最后一个子标签                                   |
| previousElementSibling | 上一个兄弟标签                                   |
| nextElementSibling     | 下一个兄弟标签                                   |
| contains               | 返回布尔值，判断传入的节点是否为该节点的后代节点 |

以下实例展示怎样通过元素关系获取元素

```html
<div id="app">
  <div class="google" data="jc">caffreygo.com</div>
  <div class="baidu">baidu.com</div>
  <div class="michael"><!-- hello world --></div>
</div>

<script>
  const app = document.querySelector(`#app`)
  console.log(app.children) //所有子元素
  console.log(app.firstElementChild) //第一个子元素 div.google
  console.log(app.lastElementChild) //最后一个子元素 div.michael

  const baidu = document.querySelector('.baidu')
  console.log(baidu.parentElement) //父元素 div#app

  console.log(baidu.previousElementSibling) //上一个兄弟元素 div.google
  console.log(baidu.nextElementSibling) //下一个兄弟元素 div.michael
</script>
```

html标签的父节点是document，但父标签节点不存在

```html
<script>
  console.log(document.documentElement.parentNode === document) //true
  console.log(document.documentElement.parentElement) //null
</script>
```

### 按类名获取标签

下例是按 className 来获取标签

```html
<div>
  <ul>
    <li class="jc item">caffreygo.com</li>
    <li class="item">测试数据</li>
    <li class="jc">你好</li>
  </ul>
</div>
<script>
  function getTagByClassName(className, tag = document) {
    const items = []
    Array.from(tag.children).map(el => {
      if (el.className.includes(className)) items.push(el)
      items.push(...getTagByClassName(className, el))
    })
    return items
  }

  console.log(getTagByClassName('jc'))
</script>
```

## 标签获取

### getElementById

使用ID选择是非常方便的选择具有ID值的节点元素，但注意ID应该是唯一的

> 只能通过document对象上使用 ⚠️

```html
<div id="google">caffreygo.com</div>
<script>
  const node = document.getElementById('google')
  console.dir(node)
</script>
```

getElementById只能通过document访问，不能通过元素读取拥有ID的子元素，下面的操作将产生错误

```html
<div id="app">
  caffreygo.com
  <div id="baidu">baidu.com</div>
</div>

<script>
  const app = document.getElementById('app')
  const node = app.getElementById('baidu') //app.getElementById is not a function
  console.log(node)
</script>
```

下面自定义函数来支持批量按ID选择元素

```html
<div id="google">caffreygo.com</div>
<div id="app"></div>
<script>
  function getByElementIds(ids) {
    return ids.map((id) => document.getElementById(id))
  }
  let nodes = getByElementIds(['google', 'app'])
  console.dir(nodes)
</script>
```

拥有ID的元素可做为WINDOW的属性进行访问

```html
<div id="app">
  caffreygo.com
</div>

<script>
  console.log(app.innerHTML)
</script>
```

如果声明了变量这种访问方式将无效，所以并不建议使用这种方式访问对象

```html
<div id="app">
  caffreygo.com
</div>

<script>
  let app = 'baidu'
  console.log(app.innerHTML)
</script>
```

### getElementsByName

::: tip 使用getElementByName获取设置了name属性的元素，虽然在DIV等元素上同样有效，但一般用来对表单元素进行操作时使用。

- 返回NodeList节点列表对象
- NodeList顺序为元素在文档中的顺序
- 需要在 document 对象上使用

::: 

```html
<div name="google">caffreygo.com</div>
<input type="text" name="username" />

<script>
  const div = document.getElementsByName('google')
  console.dir(div)
  const input = document.getElementsByName('username')
  console.dir(input)
</script>
```

### getElementsByTagName

::: tip 使用getElementsByTagName用于按标签名获取元素

- 返回HTMLCollection节点列表对象
- 获取是不区分大小写参数的

:::

```html
<div name="google">caffreygo.com</div>
<div id="app"></div>
<script>
  const divs = document.getElementsByTagName('div')
  console.dir(divs)
</script>
```

**通配符**

可以使用通配符 ***** 获取所有元素

```html
<div name="google">caffreygo.com</div>
<div id="app"></div>

<script>
  const nodes = document.getElementsByTagName('*')
  console.dir(nodes)
</script>
```

某个元素也可以使用通配置符 ***** 获取后代元素，下面获取 id为google的所有后代元素

```html
<div id="google">
  <span>caffreygo.com</span>
  <span>baidu.com</span>
</div>

<script>
  const nodes = document.getElementsByTagName('*').namedItem('google').getElementsByTagName('*')
  console.dir(nodes)
</script>
```

### getElementsByClassName

`getElementsByClassName`用于按class样式属性值获取元素集合

> 设置多个值时顺序无关，指包含这些class属性的元素 ✅

```html
<div class="google baidu michael">caffreygo.com</div>
<div class="baidu">baidu.com</div>

<script>
  const nodes = document.getElementsByClassName('baidu')
  console.log(nodes.length) //2

  //查找同时具有 baidu 与 google 两个class属性的元素
  const tags = document.body.getElementsByClassName('baidu google ')
  console.log(tags.length) //1
</script>
```

下面我们来自己开发一个与 getElementsByClassName 相同的功能函数

```html
<div class="google baidu michael">caffreygo.com</div>
<div class="baidu">baidu.com</div>
<script>
  function getByClassName(names) {
    //将用户参数转为数组，并过滤掉空值
    const classNames = names.split(/\s+/).filter(t => t)

    return Array.from(document.getElementsByTagName('*')).filter(tag => {
      // 提取标签的所有 class 值为数组
      return classNames.every(className => {
        const names = tag.className
          .toUpperCase()
          .split(/\s+/)
          .filter(t => t)

        //检索标签是否存在class
        return names.some(name => name == className.toUpperCase())
      })
    })
  }

  console.log(getByClassName('baidu google '))
</script>
```

## 样式选择器

📗 在CSS中可以通过样式选择器修饰元素样式，在DOM操作中也可以使用这种方式查找元素。

使用getElementsByTagName等方式选择元素不够灵活，建议使用下面的样式选择器操作，更加方便灵活

### querySelectorAll 💡

使用querySelectorAll根据CSS选择器获取Nodelist节点列表NodeList

> 获取的NodeList节点列表是静态的，添加或删除元素后不变

```html
<div class="michael">hello world</div>
<div id="app">
  <div class="google baidu">caffreygo.com</div>
  <div class="baidu">baidu.com</div>
</div>

<script>
  const app = document.getElementById('app')
  const nodes = app.querySelectorAll('div')
  console.log(nodes.length) // 2
</script>
```

获取id为app元素的，class 为google的后代元素

```html
<div class="michael">hello world</div>
<div id="app">
  <div class="google baidu">caffreygo.com</div>
  <div class="baidu">baidu.com</div>
</div>
<script>
  const nodes = document.querySelectorAll('#app .baidu')
  console.log(nodes.length) //2
</script>
```

💡💡根据元素属性值获取元素集合 

```html
<div id="app">
  <div class="google baidu" data="jc">caffreygo.com</div>
  <div class="baidu">baidu.com</div>
</div>
<script>
  const nodes = document.querySelectorAll(`#app .google[data='jc']`)
  console.log(nodes.length) //2
</script>
```

💡💡再来看一些通过样式选择器查找元素 

```html
<div id="app">
  <div class="google">caffreygo.com</div>
  <div class="baidu">baidu.com</div>
  <span>测试数据</span>
</div>

<script>
  //查找紧临兄弟元素
  console.log(document.querySelectorAll('.google+div.baidu'))

  //查找最后一个 div 子元素
  console.log(document.querySelector('#app div:last-of-type'))

  //查找第二个 div 元素
  console.log(document.querySelector('#app div:nth-of-type(2)').innerHTML)
</script>
```

### querySelector

querySelector使用CSS选择器获取一个元素，下面是根据属性获取单个元素

```html
<div id="app">
  <div class="google baidu" data="jc">caffreygo.com</div>
  <div class="baidu">baidu.com</div>
</div>
<script>
  const node = app.querySelector(`#app .google[data='jc']`)
  console.log(node)
</script>
```

### matches 💡

用于检测元素是否是指定的**样式选择器匹配**，下面过滤掉所有name属性的LI元素

```html
<div id="app">
    <li>google</li>
    <li>hello world</li>
    <li name="baidu">baidu.com</li>
</div>
<script>
    const nodes = [...document.querySelectorAll('li')].filter(node => {
        return !node.matches(`[name]`)
    })
    console.log(nodes)
</script>
```

### closest 💡

查找**最近的**符合选择器的祖先元素（包括自身），下例查找父级拥有 `.comment`类的元素

```html
<div class="comment">
    <ul class="comment">
        <li>caffreygo.com</li>
    </ul>
</div>

<script>
    const li = document.getElementsByTagName('li')[0]
    const node = li.closest(`.comment`)
    //结果为 ul.comment
    console.log(node)
</script>
```

## 标准属性

::: tip 元素的标准属性具有相对应的DOM对象属性

- 操作属性区分大小写
- 多个单词属性命名规则为第一个单词小写，其他单词大写
- 属性值是多类型并不全是字符串，也可能是对象等
- 事件处理程序属性值为函数
- style属性为CSSStyleDeclaration对象
- DOM对象不同生成的属性也不同

::: 

### 属性别名

有些属性名与JS关键词冲突，系统已经起了别名 📌

| 属性  | 别名      |
| ----- | --------- |
| class | className |
| for   | htmlFor   |

### 操作属性

元素的标准属性可以直接进行操作，下面是直接设置元素的className

```html
<div id="app">
    <div class="google" data="jc">caffreygo.com</div>
    <div class="baidu">baidu.com</div>
</div>
<script>
    const app = document.querySelector(`#app`)
    app.className = 'google baidu'
</script>
```

下面设置图像元素的标准属性

```html
<img src="" alt="" />
<script>
    let img = document.images[0]
    img.src = 'https://www.houdurnen.com/avatar.jpg'
    img.alt = '测试数据'
</script>
```

使用hidden隐藏元素 💡

```html
<div id="app">caffreygo.com</div>
<script>
    const app = document.querySelector('#app')
    app.addEventListener('click', function () {
        this.hidden = true
    })
</script>
```

### 多类型

大部分属性值是都是字符串，但并不是全部，下例中需要转换为数值后进行数据运算

```html
<input type="number" name="age" value="88" />

<script>
    let input = document.getElementsByName('age').item(0)
    input.value = parseInt(input.value) + 100
</script>
```

下面表单checked属性值为Boolean类型

```html
<label for="hot">
    <input id="hot" type="checkbox" name="hot" />热门
</label>
<script>
    const node = document.querySelector(`[name='hot']`)
    node.addEventListener('change', function () {
        console.log(this.checked)
    })
</script>
```

属性值并都与HTML定义的值一样，下面返回的href属性值是**完整链接**

```html
<a href="#google" id="home">测试数据</a>
<script>
    const node = document.querySelector(`#home`)
    console.log(node.href)  
    // file:///C:/Users/caffr/Desktop/demo/index.html#google
</script>
```

## 元素特征

📗 对于标准的属性可以使用DOM属性的方式进行操作，但对于标签的非标准的定制属性则不可以。但JS提供了方法来控制标准或非标准的属性

可以理解为元素的属性分两个地方保存，DOM属性中记录标准属性，特征中记录标准和定制属性

- 使用特征操作时属性名称不区分大小写
- 特征值都为字符串类型

| 方法            | 说明     |
| --------------- | -------- |
| getAttribute    | 获取属性 |
| setAttribute    | 设置属性 |
| removeAttribute | 删除属性 |
| hasAttribute    | 属性检测 |

`attributes`特征是可迭代对象，下面使用for...of来进行遍历操作

```html
<div id="app" content="测试数据" color="red">baidu.com</div>
<script>
    const app = document.querySelector('#app')
    // id="app"  content="测试数据"  color="red" （属性节点）
    for (const attr of app.attributes) {
        console.log(attr)  
    }
    //  id app   content 测试数据   color red
    for (const { name, value } of app.attributes) {
        console.log(name, value)
    }
</script>
```

属性值都为**字符串**，所以数值类型需要进行转换

```html
<input type="number" name="age" value="88" />
<script>
    let input = document.getElementsByName('age').item(0)
    let value = input.getAttribute('value') * 1 + 100
    input.setAttribute('value', value)
</script>
```

使用removeAttribute删除元素的class属性，并通过hasAttribute进行检测删除结果

```html
<div class="baidu">baidu.com</div>
<script>
    let baidu = document.querySelector('.baidu')
    baidu.removeAttribute('class')
    console.log(baidu.hasAttribute('class')) //false
</script>
```

特征值与HTML定义是**一致**的，这和属性值是不同的 📌

```html
<a href="#google" id="home">测试数据</a>
<script>
    const node = document.querySelector(`#home`)

    // http://127.0.0.1:5500/test.html#google
    console.log(node.href)

    // #google
    console.log(node.getAttribute('href'))
</script>
```

### attributes

元素提供了attributes 属性可以只读的获取元素的属性

```html
<div class="baidu" data-content="测试数据">baidu.com</div>
<script>
    let baidu = document.querySelector('.baidu')
    console.dir(baidu.attributes['class'].nodeValue) //baidu
    console.dir(baidu.attributes['data-content'].nodeValue) //测试数据
</script>
```

### 自定义特征

::: tip 📗 虽然可以随意定义特征并使用getAttribute等方法管理，但很容易造成与标签的现在或未来属性重名。建议使用以data-为前缀的自定义特征处理，针对这种定义方式JS也提供了接口方便操作。

- 元素中以data-为前缀的属性会添加到属性集中
- ✅ 使用元素的dataset可获取属性集中的属性 
- 改变dataset的值也会影响到元素上

::: 

下面演示使用属性集设置DIV标签内容

```html
<div class="baidu" data-content="测试数据" data-color="red">baidu.com</div>

<script>
    let baidu = document.querySelector('.baidu')
    // dataset:DOMStringMap {content: '测试数据', color: 'red'}
    let content = baidu.dataset.content
    console.log(content) //测试数据
    baidu.innerHTML = `<span style="color:${baidu.dataset.color}">${content}</span>`
</script>
```

多个单词的特征使用驼峰命名方式读取

```html
<div class="baidu" data-title-color="red">baidu.com</div>
<script>
    let baidu = document.querySelector('.baidu')
    baidu.innerHTML = `
<span style="color:${baidu.dataset.titleColor}">${baidu.innerHTML}</span>
`
</script>
```

改变dataset值也会影响到页面元素上

```html
<div class="baidu" data-title-color="red">baidu.com</div>
<script>
    let baidu = document.querySelector('.baidu')
    baidu.addEventListener('click', function () {
        this.dataset.titleColor = ['red', 'green', 'blue'][Math.floor(Math.random() * 3)]
        this.style.color = this.dataset.titleColor
    })
</script>
```

### 属性同步

📗 特征和属性是记录元素属性的两个不同场所，大部分更改会进行同步操作。

下面使用属性更改了className，会自动**同步**到了特征集中，反之亦然

```html
<div id="app" class="red">caffreygo.com</div>
<script>
    const app = document.querySelector('#app')
    app.className = 'baidu'
    console.log(app.getAttribute('class')) //baidu
    app.setAttribute('class', 'blue')
    console.log(app.className) //blue
</script>
```

下面对input值使用属性设置，但并没有同步到特征

```html
<input type="text" name="package" value="caffreygo.com" />
<script>
    const package = document.querySelector(`[name='package']`)
    package.value = 'baidu.com'
    console.log(package.getAttribute('value'))//caffreygo.com
</script>
```

但改变input的特征value会同步到DOM对象属性

```html
<input type="text" name="package" value="caffreygo.com" />
<script>
    const package = document.querySelector(`[name='package']`)
    package.setAttribute('value', 'baidu.com')
    console.log(package.value) //baidu.com
</script>
```

## 创建节点

创建节点的就是构建出DOM对象，然后根据需要添加到其他节点中

### append

append 也是用于添加元素，同时他也可以直接添加文本等内容。

>  **`Element.append`** 方法在 `Element`的最后一个子节点之后插入一组 [`Node`](https://developer.mozilla.org/zh-CN/docs/Web/API/Node) 对象或 [`DOMString`](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString) 对象

```html
<script>
    // parent.append("Some text", document.createElement("p")); 同时添加文本和标签节点
    document.body.append((document.createElement('div').innerText = '向军'))
    document.body.append('caffreygo.com')
</script>
```

### createTextNode

创建文本对象并添加到元素中

```html
<div id="app"></div>
<script>
    let app = document.querySelector('#app')
    let text = document.createTextNode('google')
    app.append(text)
</script>
```

### createElement

使用createElement方法可以标签节点对象，创建span标签新节点并添加到div#app

```html
<div id="app"></div>
<script>
    let app = document.querySelector('#app')
    let span = document.createElement('span')
    span.innerHTML = 'google'
    app.append(span)
</script>
```

💡💡使用PROMISE结合节点操作来加载外部JAVASCRIPT文件

```JavaScript
function js(file) {
    return new Promise((resolve, reject) => {
        let js = document.createElement('script')
        js.type = 'text/javascript'
        js.src = file
        js.onload = resolve
        js.onerror = reject
        document.head.appendChild(js)
    })
}

js('11.js')
    .then(() => console.log('加载成功'))
    .catch((error) => console.log(`${error.target.src} 加载失败`))
```

使用同样的逻辑来实现加载CSS文件

```javascript
function css(file) {
    return new Promise((resolve, reject) => {
        let css = document.createElement('link')
        css.rel = 'stylesheet'
        css.href = file
        css.onload = resolve
        css.onerror = reject
        document.head.appendChild(css)
    })
}
css('1.css').then(() => {
    console.log('加载成功')
})
```

### cloneNode&importNode

::: tip 使用cloneNode和document.importNode用于复制节点对象操作

- cloneNode是节点方法
- cloneNode 参数为true时递归复制子节点即深拷贝
- importNode是documet对象方法

:::

复制div#app节点并添加到body元素中

```html
<div id="app">google</div>
<script>
  let app = document.querySelector('#app')
  let newApp = app.cloneNode(true)  // <div id="app">google</div>
  document.body.appendChild(newApp)
</script>
```

document.importNode方法是部分IE浏览器不支持的，也是复制节点对象的方法

- 第一个参数为节点对象
- 第二个参数为true时递归复制

```html
<div id="app">google</div>
<script>
    let app = document.querySelector('#app')
    let newApp = document.importNode(app, true)
    document.body.appendChild(newApp)
</script>
```

## 节点内容

### innerHTML

inneHTML用于向标签中添加html内容，同时触发浏览器的解析器重绘DOM。

下例使用innerHTML获取和设置div内容

> innerHTML中只解析HTML标签语法，所以其中的 script 不会做为JS处理

```html
<div id="app">
  <div class="google" data="jc">caffreygo.com</div>
  <div class="baidu">baidu.com</div>
</div>
<script>
  let app = document.querySelector('#app')
  console.log(app.innerHTML)  // string

  app.innerHTML = '<h1>测试数据</h1>'
</script>
```

**重绘节点**

:::tip 使用innertHTML操作会重绘元素，下面在点击第二次就没有效果了

- 因为对#app内容进行了重绘，即删除原内容然后设置新内容
- 重绘后产生的button对象没有事件
- 重绘后又产生了新img对象，所以在控制台中可看到新图片在加载

::: 

```html
<div id="app">
    <button>caffreygo.com</button>
    <img src="1.jpg" alt="" />
</div>
<script>
    const app = document.querySelector('#app')
    app.querySelector('button').addEventListener('click', function () {
        alert(this.innerHTML)
        this.parentElement.innerHTML += '<hr/>hello world'
    })
</script>
```

### outerHTML

outerHTML与innerHTML的区别是包含父标签

- outerHTML不会删除原来的旧元素
- 只是用新内容替换替换旧内容，旧内容（元素）依然存在

下面将div#app替换为新内容

```html
<div id="app">
  <div class="google" data="jc">caffreygo.com</div>
  <div class="baidu">baidu.com</div>
</div>
<script>
  let app = document.querySelector('#app')
  console.log(app.outerHTML) // <div id="app">...</div>

  app.outerHTML = '<h1>测试数据</h1>'
</script>
```

使用innerHTML内容是被删除然后使用新内容

```html
<div id="app">
    caffreygo.com
</div>
<script>
    const app = document.querySelector('#app')
    console.log(app)
    app.innerHTML = 'baidu.com'
    console.log(app)
</script>
```

而使用outerHTML是保留旧内容，页面中使用新内容

```html
<div id="app">
  caffreygo.com
</div>
<script>
  const app = document.querySelector('#app')
  console.log(app)
  app.outerHTML = 'baidu.com'
  console.log(app)  // 节点依然存在
</script>
```

### textContent与innerText

::: tip textContent与innerText是访问或添加文本内容到元素中

- textContentb部分IE浏览器版本不支持
- innerText部分FireFox浏览器版本不支持
- 获取时**忽略所有标签**,只获取文本内容
- 设置时将内容中的标签当文本对待不进行标签解析

:::

获取时忽略内容中的所有标签

```html
<div id="app">
    <h1>caffreygo.com</h1>
</div>
<script>
    let app = document.querySelector('#app')
    console.log(app.textContent)  // caffreygo.com
</script>
```

设置时将标签当文本对待，即转为HTML实体内容

```html
<div id="app">
    <div class="google" data="jc">caffreygo.com</div>
    <div class="baidu">baidu.com</div>
</div>
<script>
    let app = document.querySelector('#app')
    app.textContent="<h1>测试数据</h1>"  // 是文本，不会渲染成标签
</script>
```

### outerText

与innerText差别是会影响所操作的标签

```html
<h1>caffreygo.com</h1>
<script>
    let h1 = document.querySelector('h1')
    h1.outerText = '测试数据'
</script>
```

### insertAdjacentText

> Adjacent: 邻近的

将**文本**插入到元素指定位置，不会对文本中的标签进行解析，包括以下位置

| 选项        | 说明         |
| ----------- | ------------ |
| beforebegin | 元素本身前面 |
| afterend    | 元素本身后面 |
| afterbegin  | 元素内部前面 |
| beforeend   | 元素内部后面 |

添加文本内容到div#app前面

```html
<div id="app">
    <div class="google" data="jc">caffreygo.com</div>
    <div class="baidu">baidu.com</div>
</div>
<script>
    let app = document.querySelector('#app')
    let span = document.createElement('span')
    app.insertAdjacentText('beforebegin', '<h1>测试数据</h1>')
</script>
```

## 节点管理

节点元素的管理，包括添加、删除、替换等操作

### 推荐方法

| 方法        | 说明                         |
| ----------- | ---------------------------- |
| append      | 节点内尾部添加新节点或字符串 |
| prepend     | 节点内开始添加新节点或字符串 |
| before      | 节点前面添加新节点或字符串   |
| after       | 节点后面添加新节点或字符串   |
| replaceWith | 将节点替换为新节点或字符串   |

在标签内容后面添加新内容

```html
<div id="app">
    caffreygo.com
</div>
<script>
    let app = document.querySelector('#app')
    app.append('-baidu.com')  // caffreygo.com -baidu.com
</script>
```

**同时添加**多个内容，包括字符串与元素标签

```html
<div id="app">
    caffreygo.com
</div>
<script>
    let app = document.querySelector('#app')
    let h1 = document.createElement('h1')
    h1.append('测试数据')
    app.append('@', h1)  // caffreygo.com @<h1>测试数据</h1>
</script>
```

将标签替换为新内容

```html
<div id="app">
    caffreygo.com
</div>
<script>
    let app = document.querySelector('#app')
    let h1 = document.createElement('h1')
    h1.append('baidu.com')
    app.replaceWith(h1)  // <h1>baidu.com</h1>
</script>
```

添加新元素h1到目标元素div#app里面

```html
<div id="app"></div>
<script>
  let app = document.querySelector('#app')
  let h1 = document.createElement('h1')
  h1.innerHTML = 'google'
  app.append(h1)  // <div id="app"> <h1>google</h1> </div>
</script>
```

将h2移动到h1之前

```html
<h1>caffreygo.com@h1</h1>
<h2>baidu@h2</h2>
<script>
    let h1 = document.querySelector('h1')
    let h2 = document.querySelector('h2')
    h1.before(h2)  // 移动现有节点
</script>
```

使用remove方法可以删除节点

```html
<div id="app">
    caffreygo.com
</div>
<script>
    let app = document.querySelector('#app')
    app.remove()
</script>
```

### insertAdjacentHTML

📗 将html文本插入到元素指定位置，浏览器会对文本进行标签解析，包括以下位置

| 选项        | 说明         |
| ----------- | ------------ |
| beforebegin | 元素本身前面 |
| afterend    | 元素本身后面 |
| afterbegin  | 元素内部前面 |
| beforeend   | 元素内部后面 |

在div#app前添加HTML文本

```html
<div id="app">
    <div class="google" data="jc">caffreygo.com</div>
    <div class="baidu">baidu.com</div>
</div>
<script>
    let app = document.querySelector('#app')
    let span = document.createElement('span')
    app.insertAdjacentHTML('beforebegin', '<h1>测试数据</h1>')
</script>
```

### insertAdjacentElement

📗 insertAdjacentElement() 方法将指定元素插入到元素的指定位置，包括以下位置

- 第一个参数是位置
- 第二个参数为新元素节点

| 选项        | 说明         |
| ----------- | ------------ |
| beforebegin | 元素本身前面 |
| afterend    | 元素本身后面 |
| afterbegin  | 元素内部前面 |
| beforeend   | 元素内部后面 |

在div#app 前插入span标签

```html
<div id="app">
    <div class="google" data="jc">caffreygo.com</div>
    <div class="baidu">baidu.com</div>
</div>
<script>
    let app = document.querySelector('#app')
    let span = document.createElement('span')
    span.innerHTML = '测试数据'
    app.insertAdjacentElement('beforebegin', span)
</script>
```

### 古老方法

下面列表过去使用的操作节点的方法，现在不建议使用了。但在阅读老代码时可来此查看语法

| 方法         | 说明                           |
| ------------ | ------------------------------ |
| appendChild  | 添加节点                       |
| insertBefore | 用于插入元素到另一个元素的前面 |
| removeChild  | 删除节点                       |
| replaceChild | 进行节点的替换操作             |

### DocumentFragment

📗 当对节点进行添加、删除等操作时，都会引起页面回流来重新渲染页面,即重新渲染颜色，尺寸，大小、位置等等。所以会带来对性能的影响。

**解决以上问题可以使用以下几种方式**

1. 可以将DOM写成html字符串，然后使用innerHTML添加到页面中，但这种操作会比较麻烦，且不方便使用节点操作的相关方法。
2. 使用createDocumentFragment来管理节点时，此时节点都在内存中，而不是DOM树中。对节点的操作不会引发页面回流,带来比较好的性能体验。 📌

:::tip DocumentFragment特点

- ✅ createDocumentFragment父节点为null
- ✅ 继承自node所以可以使用NODE的属性和方法
- ✅ createDocumentFragment创建的是文档碎片，节点类型nodeType为11。因为不在DOM树中所以只能通过JS进行操作
- ✅ 添加createDocumentFragment添加到DOM后,就不可以再操作createDocumentFragment元素了,这与DOM操作是不同的
- ✅ 将文档DOM添加到createDocumentFragment时,会移除文档中的DOM元素
- ✅ createDocumentFragment创建的节点添加到其他节点上时，会将子节点一并添加
- ✅ createDocumentFragment是虚拟节点对象，不直接操作DOM所以性能更好
- ✅ 在排序/移动等大量DOM操作时建议使用createDocumentFragment

:::

## 表单控制

### 表单查找

::: tip JS为表单的操作提供了单独的集合控制

- 使用document.forms获取表单集合
- 使用form的name属性获取指定form元素
- 根据表单项的name属性使用form.elements.title获取表单项，
- 也可以直接写成form.name形式，不需要form.elements.title
- 针对radio/checkbox获取的表单项是一个集合

::: 

```html
<form action="" name="jc">
  <input type="text" name="title" />
</form>
<script>
  const form = document.forms.jc
  console.log(form.elements.title)  // <input type="text" name="title">
</script>
```

通过表单项可以反向查找FORM

```html
<form action="" name="jc">
    <input type="text" name="title" />
</form>
<script>
    const form = document.forms.jc
    console.log(form.title.form === form) //true
</script>
```

## 样式管理

通过DOM修改样式可以通过更改元素的class属性或通过style对象设置行样式来完成。

> 建议使用class控制样式，将任务交给CSS处理，更简单高效

### 批量设置

使用JS的className可以批量设置样式

```html
<div id="app" class="d-flex container">测试数据</div>
<script>
    let app = document.getElementById('app')
    app.className = 'baidu'
</script>
```

也可以通过特征的方式来更改

```html
<div id="app" class="d-flex container">测试数据</div>
<script>
    let app = document.getElementById('app')
    app.setAttribute('class', 'baidu')
</script>
```

### classList

如果对类单独进行控制使用 classList属性操作

| 方法                    | 说明     |
| ----------------------- | -------- |
| node.classList.add      | 添加类名 |
| node.classList.remove   | 删除类名 |
| node.classList.toggle   | 切换类名 |
| node.classList.contains | 类名检测 |

在元素的原有class上添加新class

```html
<div id="app" class="d-flex container">测试数据</div>
<script>
    let app = document.getElementById('app')
    app.classList.add('baidu')
</script>
```

使用classList也可以移除class列表中的部分class

```html
<div id="app" class="d-flex container">测试数据</div>
<script>
    let app = document.getElementById('app')
    app.classList.remove('container')
</script>
```

✅ 使用toggle切换类，即类已经存在时删除，不存在时添加

```html
<div id="app" class="d-flex container">测试数据</div>
<script>
    let app = document.getElementById('app')
    app.addEventListener('click', function () {
        this.classList.toggle('baidu')
    })
</script>
```

✅ 使用contains检查class是否存在

```html
<div id="app" class="d-flex container">测试数据</div>
<script>
    let app = document.getElementById('app')
    console.log(app.classList.contains('container')) //true
    console.log(app.classList.contains('baidu')) //false
</script>
```

### 设置行样式

使用style对象可以对样式属性单独设置，使用cssText可以批量设置行样式

**样式属性设置**

使用节点的style对象来设置行样式，多个单词的属性使用驼峰进行命名

```html
<div id="app" class="d-flex container">测试数据</div>
<script>
    let app = document.getElementById('app')
    app.style.backgroundColor = 'red'
    app.style.color = 'yellow'
</script>
```

**批量设置行样式**

使用 cssText属性可以**批量设置**行样式

> 属性名和写CSS一样不需要考虑驼峰命名

```html
<div id="app" class="d-flex container">测试数据</div>
<script>
    let app = document.getElementById('app')
    app.style.cssText = `background-color:red;color:yellow`
</script>
```

也可以通过setAttribute改变style特征来批量设置样式

```html
<div id="app" class="d-flex container">测试数据</div>
<script>
    let app = document.getElementById('app')
    app.setAttribute('style', `background-color:red;color:yellow;`)
</script>
```

### 获取样式

可以通过style对象，window.window.getComputedStyle对象获取样式属性，下面进行说明

**style**

可以使用DOM对象的style属性读取行样式

> style对象不能获取行样式外定义的样式  ⚠️

```html
<style>
    div {
        color: yellow;
    }
</style>
<div id="app" style="background-color: red; margin: 20px;">测试数据</div>
<script>
    let app = document.getElementById('app')
    console.log(app.style.backgroundColor)  // red
    console.log(app.style.margin)  // 20px
    console.log(app.style.marginTop)  // 20px
    console.log(app.style.color)  // ''
</script>
```

**getComputedStyle**

::: tip window.getComputedStyle可获取所有应用在元素上的样式属性

- 函数第一个参数为元素
- 第二个参数为伪类
- 这是计算后的样式属性，所以取得的单位和定义时的可能会有不同

::: 

```html
<style>
    div {
        font-size: 35px;
        color: yellow;
    }
</style>
<div id="app" style="background-color: red; margin: 20px;">测试数据</div>
<script>
    let app = document.getElementById('app')
    let fontSize = window.getComputedStyle(app).fontSize
    console.log(fontSize.slice(0, -2))  // '35'
    console.log(parseInt(fontSize))
</script>
```