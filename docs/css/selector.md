# 选择器

## 基本选择器

| 选择器          | 示例       | 描述                           |
| :-------------- | ---------- | :----------------------------- |
| .class          | .intro     | 选择 class="intro" 的所有元素  |
| #id             | #firstname | 选择 id="firstname" 的所有元素 |
| *               | *          | 选择所有元素                   |
| element         | p          | 选择所有元素                   |
| element,element | div,p      | 选择所有元素和所有元素         |
| element element | div p      | 选择元素内部的所有元素         |
| element>element | div>p      | 选择父元素为元素的所有元素     |
| element+element | div+p      | 选择紧接在元素之后的所有元素   |

### 标签选择

使用 `*` 可为所有元素设置样式。

```css
* {
    text-decoration: none;
    color: #6c757d;
}
```

根据标签为元素设置样式

```css
h1 {
    color: red;
}
```

同时设置多个元素组合

```css
h1,h2 {
    color: red;
}
```

元素在多个组件中存在

```css
h1,h2 {
    color: red;
}
h1,h3{
    background: #dcdcdc;
}
```

### 类选择器

类选择器是为一类状态声明样式规则，下面是把文本居中定义为类样式。

```html
<style>
    .text-center {
        text-align: center;
    }
</style>

<h1 class="text-center">google.com</h1>
<h2 class="text-center">mdn.com</h2>
```

将类选择器指定为具体标签

```css
.help-block {
    background: red;
}

span.help-block {
    font-size: 12px;
    color: #aaa;
    background: none;
}
...

<span class="help-block">content</span>
```

### ID选择器

为有 id 属性的元素设置样式

```html
#container {
    background: red;
}

...
<h1 id="container">google.com</h1>
```

> 👾 文档中ID应该是唯一的，虽然为多个元素设置同一个ID也可以产生样式效果，但这是不符合规范的。
>
> 🧐 建议优先使用类选择器

## 结构选择器

| 选择器           | 示例  | 描述                                   |
| :--------------- | ----- | :------------------------------------- |
| element element  | div p | 选择元素内部的所有元素                 |
| element>element  | div>p | 选择父元素为元素的所有元素             |
| element+element  | div+p | 选择**紧接**在元素之后的元素(单个)     |
| element~element2 | p~ul  | 选择元素同级并在元素后面的**所有元素** |

### 后代选择器

📗 HTML中元素是以父子级、兄弟关系存在的。后代选择器指元素后的元素（不只是子元素，是后代元素）。

```html
<style>
    main article h2,
    main h1 {
        color: green;
    }
</style>
...
<main>
    <article>
        <h2 name="google">google.com</h2>
        <aside>
            <h2>baidu.com</h2>
        </aside>
    </article>
    <h2 name="mdn.com">mdn.com</h2>
    <h1>hello</h1>
</main>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/1.png)

### 子元素选择

📗 子元素选择器中选择子元素，不包括孙级及以下元素。

```html
<style>
    main article>h2 {
        color: green;
    }
</style>
...

<main>
	<article>
		<h2 name="google">google.com</h2>
		<aside>
			<h2>baidu.com</h2>
		</aside>
	</article>
	<h2 name="mdn.com">mdn.com</h2>
	<h1>Hello</h1>
</main>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/2.png)

### 紧邻兄弟元素

用于选择紧挨着的同级兄弟元素。

```html
<style>
    main article+h2 {
        color: green;
    }
</style>
...

<main>
	<article>
		<h2 name="google">google.com</h2>
		<aside>
			<h2>baidu.com</h2>
		</aside>
	</article>
	<h2 name="mdn.com">mdn.com</h2>
	<h1>Hello</h1>
</main>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/3.png)

### 后面兄弟元素

用于选择后面的所有兄弟元素。

```html
<style>
    main article~* {
        color: green;
    }
</style>
...

<main>
	<article>
		<h2 name="google">google.com</h2>
		<aside>
			<h2>baidu.com</h2>
		</aside>
	</article>
	<h2 name="mdn.com">mdn.com</h2>
	<h1>Hello</h1>
</main>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/4.png)

## 属性选择器

根据属性来为元素设置样式也是常用的场景。

| 选择器              | 示例               | 描述                                                        |
| :------------------ | ------------------ | :---------------------------------------------------------- |
| [attribute]         | [target]           | 带有 target 属性所有元素                                    |
| [attribute=value]   | [target=_blank]    | targe 属性 **等于**"_blank" 的所有元素                      |
| [attribute~=value]  | [title~=google] | title 属性**包含**单词 "google" 的所有元素               |
| [attribute\|=value] | [title\|=prop]   | title 属性值为 "prop"的单词，或"hh-prop"以`-`**连接**的的独立单词 |
| [attribute*=value]  | a[src*="mdn"]    | src 属性中**包含** "mdn" 字符的每个 `a`元素               |
| [attribute^=value]  | a[src^="https"]    | src 属性值以 "https" **开头**的每个 `a`元素                 |
| [attribute$=value]  | a[src$=".jpeg"]    | src 属性以 ".jpeg" **结尾**的所有 `a`元素                   |

为具有 `class` 属性的h1标签设置样式

```html
<style>
    h1[class] {
        color: red;
    }
</style>

<h1 class="container">google.com</h1>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/5.png)

约束多个属性

```html
<style>
    h1[class][id] {
        color: red;
    }
</style>

<h1 class="container" id>google.com</h1>
```

---

### = 相等

**具体**属性值设置样式

```html
<style>
    a[href="https://www.google.com"] {
        color: green;
    }
</style>

<a href="https://www.google.com">Google</a>
<a href="">Baidu</a>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/6.png)

### ^= 开始匹配

`^` 以指定值开头的元素

```css
h2[name^="mdn"] {
    color: red;
}
...

<h2 name="google">google.com</h2>
<h2 name="mdn.com">mdn.com</h2>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/7.png)

### $= 结束匹配

`$` 以指定值结尾的元素

```html
<style>
    h2[name$="gle"] {
        color: red;
    }
</style>

<h2 name="google">google.com</h2>
<h2 name="mdn.com">mdn.com</h2>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/8.png)

### *= 任意匹配

`*` 属性内部任何位置出现值的元素

```html
<style>
    h2[name*="google"] {
        color: red;
    }
</style>
<h2 name="google">google.com</h2>
<h2 name="google.com">mdn.com</h2>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/9.png)

### ~= 包含匹配 💡

`~` 属性值中包含指定词汇的元素

注意 📌 ：这边的`<h2 name="google.com">mdn.com</h2>`不符合包含google这个词汇的要求，如果是`<h2 name="google web">mdn.com</h2>`这种情况才会被这个选择器匹配到。

```html
<style>
    h2[name~="google"] {
        color: red;
    }
</style>
<h2 name="google">google.com</h2>
<h2 name="google.com">mdn.com</h2>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/8.png)

### |= -连接匹配 💡

`|` 以指定值**开头**或以属性连接破折号`-`的元素 

```html
<style>
    h2[name|="google"] {
        color: red;
    }
</style>
<h2 name="google">google.com</h2>
<h2 name="google-web">mdn.com</h2>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/9.png)

## 伪类选择器 👾

为元素的不同状态或不确定存在的元素设置样式规则。

| 状态                 | 示例                  | 说明                                       |
| -------------------- | --------------------- | ------------------------------------------ |
| :link                | a:link                | 选择所有未被访问的链接                     |
| :visited             | a:visited             | 选择所有已被访问的链接                     |
| :hover               | a:hover               | 鼠标移动到元素上时                         |
| :active              | a:active              | 点击正在发生时                             |
| :focus               | input:focus           | 选择获得焦点的 input 元素                  |
| :root                | :root                 | 选择文档的根元素即html。                   |
| :empty               | p:empty               | 选择没有子元素的每个元素（包括文本节点）。 |
| :first-child         | p:first-child         | 选择属于父元素的第一个子元素的每个元素     |
| :last-child          | p:last-child          | 选择属于其父元素最后一个子元素每个元素。   |
| :first-of-type       | p:first-of-type       | 选择属于其父元素的首个元素的每个元素       |
| :last-of-type        | p:last-of-type        | 选择属于其父元素的最后元素的每个元素。     |
| :only-of-type        | p:only-of-type        | 选择属于其父元素唯一的元素的每个元素。     |
| :only-child          | p:only-child          | 选择属于其父元素的唯一子元素的每个元素。   |
| :nth-child(n)        | p:nth-child(2)        | 选择属于其父元素的第二个子元素的每个元素。 |
| :nth-child(odd)      | p:nth-child(odd)      | 选择属于其父元素的奇数元素。               |
| :nth-child(even)     | p:nth-child(even)     | 选择属于其父元素的偶数元素。               |
| :nth-of-type(n)      | p:nth-of-type(2)      | 选择属于其父元素第二个元素的每个元素。     |
| :nth-last-child(n)   | p:nth-last-child(2)   | 同上，从最后一个子元素开始计数。           |
| :nth-last-of-type(n) | p:nth-last-of-type(2) | 同上，但是从最后一个子元素开始计数。       |
| :not(selector)       | :not(p)               | 选择非元素的每个元素                       |

### :超链接伪类

定义链接的不同状态

```html
<style>
    a:link {
        color: red
    }

    a:visited {
        color: green
    }

    a:hover {
        color: blue
    }

    a:active {
        color: yellow
    }
</style>
<a href="javascript:;">链接</a>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/a.gif)

不只是链接可以使用伪类，其他元素也可以使用。下面是对表单的点击与获取焦点状态的样式设置。

```html
<style>
    input:focus {
        background: green;
    }

    input:hover {
        background: blue;
    }

    input:active {
        background: yellow;
    }
</style>
<input type="text">
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/input.gif)

### :target

用于控制具有锚点目标元素的样式

```css
:target {
    border: 2px solid #D4D4D4;
    background-color: #e5eecc;
}
```

```html
<h1>这是标题</h1>

<p><a href="#news1">跳转至内容 1</a></p>
<p><a href="#news2">跳转至内容 2</a></p>

<p>请点击上面的链接，:target 选择器会突出显示当前活动的 HTML 锚。</p>

<p id="news1"><b>内容 1...</b></p>
<p id="news2"><b>内容 2...</b></p>

<p><b>注释：</b> Internet Explorer 8 以及更早的版本不支持 :target 选择器。</p>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/target.gif)

### :root

根元素选择伪类即选择html

```css
:root {
    font-size: 100px;
}
```

### :empty

没有内容和空白的元素。下面第一个p标签会产生样式，第二个不会因为有空白内容

```html
<style>
    p {
        height: 20px;
        border: 1px solid;
    }
    :empty {
        border: solid 2px red;
    }
</style>

<p></p>
<p> </p>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/10.png)

## 结构伪类

下面来通过结构伪类选择器选择树状结构中的标签元素。

::: tip 区别

- :last-child表示其父元素的最后一个子元素，且这个元素是css指定的元素，才可以生效
- :last-of-type代表在一群兄弟元素中的最后一个指定类型的元素

::: 

### :first-child

选择元素中`span` 标签并且是第一个。

```html
<style>
    article span:first-child {
        color: red;
    }
</style>

<article>
    <!-- span必须是当前article的第一个子元素 -->
    <span>1</span>
    <span>2</span>
    <aside>
        <span>3</span>
        <span>4</span>
    </aside>
</article>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/11.png)

### :first-of-type

选择类型是`span` 的第一个元素

```html
<style>
    article span:first-of-type {
        color: red;
    }
</style>

<article>
    <!-- div元素不影响 会找第一个span标签 -->
    <div></div>
    <span>1</span>
    <span>2</span>
    <aside>
        <span>3</span>
        <span>4</span>
    </aside>
</article>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/11.png)

### :last-child

选择元素中`span` 标签并且是最后一个。

```html
<style>
    article span:last-child {
        color: red;
    }
</style>

<article>
    <span>1</span>
    <span>2</span>
    <aside>
        <span>3</span>
        <span>4</span>
    </aside>
    <span>5</span>
</article>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/12.png)

### :last-of-type

选择类型为`span` 的最后一个元素

```html
<style>
    article span:last-of-type {
        color: red;
    }
</style>

<article>
    <span>1</span>
    <span>2</span>
    <aside>
        <span>3</span>
        <span>4</span>
    </aside>
    <span>5</span>
    <!-- div元素不影响 会找最后一个span标签 -->
    <div></div>
</article>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/12.png)

### :only-child

选择是唯一子元素的`span` 标签（👾 第一个span标签当前层级还有aside，该选择器不会作用到）

```html
<style>
    article span:only-child {
        color: red;
    }
</style>

<article>
    <span>google.com</span>
    <aside>
        <span>baidu.com</span>
    </aside>
</article>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/13.png)

### :only-of-type

选择同级中类型是`span` 的唯一子元素（👾 都满足是当前层级的唯一span类型标签）

```html
<style>
    article span:only-of-type {
        color: red;
    }
</style>

<article>
    <span>google.com</span>
    <aside>
        <span>baidu.com</span>
    </aside>
</article>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/14.png)

### :nth-child(n)

选择第二个元素并且是span标签的

```html
<style>
    article span:nth-child(2) {
        color: red;
    }
</style>

<article>
    <span>google.com</span>
    <aside>
        <span>baidu.com</span>
        <span>wiki.com</span>
    </aside>
</article>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/15.png)

### :nth-of-type(n)

选择第二个`span` 元素，不管中间的其他元素

```html
<style>
    article span:nth-of-type(2) {
        color: red;
    }
</style>

<article>
    <span>google.com</span>
    <aside>
        <span>baidu.com</span>
        <span>wiki.com</span>
    </aside>
    <span>MDN.com</span>
</article>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/16.png)

### 计算数量

📗 n为0/1/2/3... ，下面是隔列变色

```html
<style>
    table tr>td:nth-child(2n+1) {
        background: green;
        color: white;
    }
</style>

<table border="1">
    <tr>
        <td>1</td>
        <td>2</td>
        <td>3</td>
        <td>4</td>
        <td>5</td>
    </tr>
</table>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/17.png)

从第三个开始设置样式

```css
table tr>td:nth-child(n+3) {
    background: rgb(128, 35, 2);
    color: white;
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/18.png)

设置前三个元素

```css
table tr>td:nth-child(-n+3) {
    background: rgb(128, 35, 2);
    color: white;
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/19.png)

### 奇数元素 odd

选择奇数单元格

```css
table tr>td:nth-child(odd) {
    background: green;
    color: white;
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/17.png)

### 偶数元素 even

选择偶数单元格

```css
table tr>td:nth-child(even) {
    background: green;
    color: white;
}
```

### :nth-last-child(n)

从最后一个元素开始获取

```css
table tr>td:nth-last-child(2n+1){
    background: green;
    color: white;
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/17.png)

取最后两个元素

```css
main>ul li:nth-last-child(-n+2) {
	color: red;
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/20.png)

### :nth-last-of-type(n)

从最后一个元素开始选择`span` 标签 。

```css
article span:nth-last-of-type(1) {
    background: red;
    color: white;
}
```

### :not(selector)

排除第一个li元素

```html
<style>
    ul li:not(:nth-child(1)) {
        background: red;
    }
</style>

<ul>
    <li>google.com</li>
    <li>mdn.com</li>
    <li>baidu.com</li>
</ul>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/21.png)

## 表单伪类

| 选择器    | 示例           | 说明                        |
| --------- | -------------- | --------------------------- |
| :enabled  | input:enabled  | 选择每个启用的 input 元素   |
| :disabled | input:disabled | 选择每个禁用的 input 元素   |
| :checked  | input:checked  | 选择每个被选中的 input 元素 |
| :required | input:required | 包含`required`属性的元素    |
| :optional | input:optional | 不包含`required`属性的元素  |
| :valid    | input:valid    | 验证通过的表单元素          |
| :invalid  | input:invalid  | 验证不通过的表单            |

### 表单属性样式

```html
<style>
    input:enabled {
        background: red;
    }

    input:disabled {
        background: #dddddd;
    }

    input:checked+label {
        color: green;
    }
</style>
<input type="text" disabled>
<input type="text" name="info">

<input type="radio" name="sex" checked id="boy">
<label for="boy">男</label>
<input type="radio" name="sex" checked id="girl">
<label for="girl">女</label>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/22.png)

### 表单必选样式

```html
<style>
    input:required {
        border: solid 2px blue;
    }

    input:optional {
        background: #dcdcdc;
        border: none;
    }
</style>
<input type="text" name="title" required>
<input type="text" name="name">
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/23.png)

### 表单验证样式

```html
<style>
    input:valid {
        border: solid 1px blue;
    }

    input:invalid {
        border: solid 1px red;
    }
</style>

<form>
    <input type="email">
    <button>保存</button>
</form>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/valid.gif)

## 字符伪类

| 状态           | 示例           | 说明                         |
| -------------- | -------------- | ---------------------------- |
| ::first-letter | p:first-letter | 选择每个元素的首字母         |
| ::first-line   | p:first-line   | 选择每个元素的首行           |
| ::before       | p:before       | 在每个元素的内容之前插入内容 |
| ::after        | p:after        | 在每个元素的内容之后插入内容 |

### 段落首行处理

```css
p::first-line {
 font-size: 20px;
}
```

### 首字母大写

```css
p::first-letter {
    font-size: 30px;
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/24.png)

### 在元素前添加

```html
<style>
    span::before {
        content: '⇰';
        color: red;
    }

    span::after {
        content: '⟲';
        color: green;
    }
</style>

<span>Hello world</span>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/25.png)

### 搜索框示例

```css
div {
    border: solid 1px #ddd;
    width: 150px;
}

div>input[type="text"] {
    border: none;
    outline: none;
}

div>input[type="text"]+span:after {
    content: "\21AA";
    font-size: 14px;
    cursor: pointer;
}
```

### 添加属性内容 💡

```html
<style>
    p:before {
        content: attr(data-foo) " ";
    }
</style>

<p data-foo="hello">world</p>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/26.png)

```html
<style>
    h2::before {
        content: attr(title);
    }
</style>

<h2 title="this is h2 title ">hello world</h2>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/selector/27.png)