# 栅格布局

## 栅格介绍

### 名词解释

📗 CSS 网格布局(Grid Layout) 是CSS中最强大的布局系统。 这是一个二维系统，这意味着它可以同时处理列和行。

栅格系统与FLEX弹性布局有相似之处理，都是由父容器包含多个项目元素的使用。

### 兼容性

下面是栅格系统兼容性数据，你也可以在 [https://caniuse.com/ (opens new window)](https://caniuse.com/)网站查看，所以在根据项目使用的场景决定是否使用栅格布局。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/2.png)

## 基本知识

栅格有关的元素说明

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/3.png)

## 声明容器

### 块级容器

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/4.png)

```css
#container {
    display: grid;
    grid-template-columns: 50px 50px 50px;
    grid-template-rows: 50px 50px 50px;
}
```

### 行级容器

```css
display: inline-grid;
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/5.png)

## 划分行列

📗 栅格有点类似表格，拥有 `行` 和 `列`。

使用 `grid-template-columns` 规则可划分列数，使用 `grid-template-rows` 划分行数。

### 固定宽度

下面是使用固定宽度划分两行三列的的示例，当容器宽度过大时将漏白。

```css
article {
    width: 300px;
    height: 200px;
    border: solid 5px silver;
    display: grid;
    grid-template-rows: 100px 100px;
    grid-template-columns: 100px 100px 100px;
}
article div {
    background: blueviolet;
    background-clip: content-box;
    padding: 10px;
    border: solid 1px #ddd;
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/6.png)

### 百分比 %

可以使用使用百分比自动适就容器。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/7.png)

```text
display: grid;
grid-template-rows: 50% 50%;
grid-template-columns: 25% 25% 25% 25%;
```

### 重复设置

📗 使用 `repeat` 统一设置值，第一个参数为重复数量，第二个参数是重复值

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/8.png)

```css
grid-template-rows: repeat(2, 50%);
grid-template-columns: repeat(2, 50%);
```

👾 可以设置**多个值**来定义重复，下面定义了四列，以 `100%、20px` 重复排列。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/9.png)

```css
display: grid;
/* 50%的高度重复两行 */
grid-template-rows: repeat(2, 50%);
/* 100px 50px的高度重复两次 */
grid-template-columns: repeat(2, 100px 50px);
```

### 自动填充 auto-fill

自动填充是根据容器尺寸，自动**设置元素尺寸**。(在容器宽度已知的情况下，自动计算单元格大小)

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/6.png)

```css
width: 300px;
height: 200px;
display: grid;
grid-template-rows: repeat(auto-fill, 100px);
grid-template-columns: repeat(auto-fill, 100px);
```

### 比例划分 fr

📗 使用 `fr` 单位设置元素在空间中所占的比例，下面按`1份-2份` 分成两组共四列。

#### 单位组合

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/10.png)

```css
width: 300px;
height: 200px;
display: grid;
grid-template-rows: 1fr 2fr;
grid-template-columns: 100px 2fr 1fr;
```

#### 重复定义

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/9.png)

```css
width: 300px;
height: 100px;
display: grid;
grid-template-rows: repeat(2, 1fr);
grid-template-columns: repeat(2, 2fr 1fr);
```

### 自动空间 auto 📐	

📗 下面为第二个栅格列使用`auto`来让其获取所有剩余空间

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/11.png)

```html
<style>
    main {
        display: grid;
        grid-template-rows: repeat(2, 1fr);
        grid-template-columns: 20vw auto 30vw;
    }

    div {
        background: blueviolet;
        border: solid 1px #ddd;
        color: white;
        padding: 5px;
    }
</style>
<main>
    <div>1</div>
    <div>2</div>
    <div>3</div>
</main>
```

### 组合定义

📗 `grid-tempalte` 是 `grid-template-rows`、`grid-template-columns`、`grid-template-areas` 的三个属性的简写。

下面使用`grid-template`实现三行三列的布局

```css
.app {
    display: grid;
    grid-template: repeat(3, 100px) / repeat(3, 100px);
    width: 300px;
    height: 300px;
}

.app > div {
    border: solid 1px red;
    box-sizing: border-box;
}
```

下面是使用 `grid-template` 同时声明 `grid-template-rows、grid-template-columns`。

```css
main {
    display: grid;
    grid-template: 10vh 20vh 10vh/ 30vw 1fr;
}
div {
    background: blueviolet;
    border: solid 1px #ddd;
    color: white;
    padding: 5px;
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/12.png)

### minmax

📗 使用 `minmax` 方法可以设置取值范围，下列在行高在 `最小100px ~ 最大1fr` 间取值。

```css
width: 300px;
height: 300px;
display: grid;
grid-template-rows: 100px minmax(100px, 1fr);
grid-template-columns: 100px 1fr;
```

## 间距定义

- row-gap
- column-gap
- gap

### 行间距

使用 `row-gap` 设置行间距。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/13.png)

```css
width: 300px;
height: 200px;
display: grid;
grid-template-rows: repeat(2, 1fr);
grid-template-columns: repeat(3, 1fr);
row-gap: 30px;
```

### 列间距

使用 `column-gap` 定义列间距。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/14.png)

```css
width: 300px;
height: 200px;
display: grid;
grid-template-rows: repeat(2, 1fr);
grid-template-columns: repeat(3, 1fr);
column-gap: 20px;
```

### 组合定义

📗 使用 `gap` 规则可以一次定义行、列间距，如果间距一样可以只设置一个值。

**设置行列间距为20px与10px**

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/15.png)

```css
width: 300px;
height: 200px;
display: grid;
grid-template-rows: repeat(2, 1fr);
grid-template-columns: repeat(3, 1fr);
gap: 20px 10px;
```

**统一设置行列间距为20px**

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/16.png)

```css
gap: 20px;
```

## 栅格命名 👾

📗 栅格线可以使用命名与编号找到，方便控制指定栅格，或将内容添加到指定栅格中。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/17.png)

### 独立命名

可以为每个栅格独立命名来进行调用。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/18.png)

```html
<style>
    * {
        padding: 0;
        margin: 0;
    }

    article {
        margin: 0 auto;
        width: 300px;
        height: 300px;
        border: solid 5px silver;
        display: grid;
        /* 线的命名： |-||-||-| */
        grid-template-rows: [r1-start] 100px [r1-end r2-start] 100px [r2-end r3-start] 100px [r3-end];
        grid-template-columns: [c1-start] 100px [c1-end c2-start] 100px [c2-end c3-start] 100px [c3-end];
    }

    div {
        background: blueviolet;
        background-clip: content-box;
        border: solid 1px blueviolet;
        padding: 10px;
        box-sizing: border-box;
        color: white;
    }

    div:first-child {
        grid-row-start: r2-start;
        grid-row-end: r2-end;
        grid-column-start: c2-start;
        grid-column-end: c2-end;
    }
</style>

<article>
    <div>hello</div>
</article>
```

### 自动命名

对于重复设置的栅格系统会自动命名，使用时使用 `c 1、c 2` 的方式定位栅格。

```css
article {
    margin: 0 auto;
    width: 300px;
    height: 300px;
    border: solid 5px silver;
    display: grid;
    grid-template-rows: repeat(3, [r-start] 100px [r-end]);
    grid-template-columns: repeat(3, [c-start] 100px [c-end]);
}


div:first-child {
    /* 在使用[r-start]命名后 通过r-start num确定对应的线 */
    grid-row-start: r-start 2;
    grid-row-end: r-end 2;
    grid-column-start: c-start 2;
    grid-column-end: c-end 2;
}
```

## 元素定位 📐

| 样式属性          | 说明         |
| ----------------- | ------------ |
| grid-row-start    | 行开始栅格线 |
| grid-row-end      | 行结束栅格线 |
| grid-column-start | 列开始栅格线 |
| grid-column-end   | 列结束栅格线 |

上面几个样式属性可以使用以下值

| 属性值        | 说明                                  |
| ------------- | ------------------------------------- |
| Line          | 栅格线                                |
| span 数值     | 栅格包含的栅格数量 （span 2: 占两格） |
| span 区域名称 | 栅格包含到指定的区域名称              |
| auto          | 自动设置，默认为一个网格宽度和高度    |

### 根据栅格线

通过设置具体的第几条栅格线来设置区域位置，设置的数值可以是正数和负数。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/20.png)

```css
article {
    display: grid;
    grid-template-rows: repeat(4, 1fr);
    grid-template-columns: repeat(4, 1fr);
}


div:first-child {
    grid-row-start: 2;
    grid-row-end: 4;
    grid-column-start: 2;
    grid-column-end: 4;
}
```

### 根据栅格命名

```css
article {
    display: grid;
    grid-template-rows: [r1-start] 100px [r1-end r2-start] 100px [r2-end r3-start] 100px [r3-end];
    grid-template-columns: [c1-start] 100px [c1-end c2-start] 100px [c2-start c3-start] 100px [c3-end];
}

div:first-child {
    /* r1-end r2-start是一样的线, 同理参考命名在同一个中括号内的线 */
    grid-row-start: r1-end;
    grid-column-start: c2-start;
    grid-row-end: r3-start;
    grid-column-end: c3-start;
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/19.png)

### 根据自动命名

对于重复设置的栅格系统会自动命名，使用时使用 `c 1、c 2` 的方式定位栅格。

```css
article {

    display: grid;
    grid-template-rows: repeat(3, [r-start] 100px [r-end]);
    grid-template-columns: repeat(3, [c-start] 100px [c-end]);
}

div:first-child {
    grid-row-start: r-start 2;
    grid-column-start: c-start 2;
    grid-row-end: r-start 2;
    grid-column-end: c-end 2;
}
```

### 根据偏移量

使用 `span` 可以设置包含栅格的数量或包含到的区域名称 📌

| 示例                | 说明        |
| ------------------- | ----------- |
| grid-row-end:2      | 向下包含2行 |
| grid-row-start:2    | 向上包含2行 |
| grid-column-end:2   | 向右包含2行 |
| grid-column-start:2 | 向左包含2行 |

```css
div {
    /* span 1表示占一个格子 */
    grid-row-start: 2;
    grid-row-end: span 1;
    grid-column-start: 2;
    grid-column-end: span 1;
}
```

### 简写模式

📗 可以使用 `grid-row` 设置行开始栅格线，使用 `grid-column` 设置结束栅格线。

上例中的居中对齐元素，可以使用以下简写的方式声明（推荐）。

```css
/* 2/3表示区间为第2条线到第3条线之间 */
div {
    grid-row: 2/3;
    grid-column: 2/3;
}

/* 或者 */
div {
    grid-row: 2/span 1;
    grid-column: 2/span 1;
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/21.png)



### grid-area

`grid-area`更加简洁是同时对 `grid-row` 与 `grid-column` 属性的组合声明。

语法结构如下（逆时针）：

```text
grid-row-start/grid-column-start/grid-row-end/grid-column-end。
```

下面是将元素定位在中间的示例。

```css
main {
    display: grid;
    grid-template: repeat(3, 1fr)/repeat(3, 1fr);
}

div {
    grid-area: 2/2/4/3;
}
```

### BOOTSTRAP

下面是bootstrap栅格系统的开发，根据指定的样式自动设置栅格大小。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/22.png)

```html
<style>
    * {
        padding: 0;
        margin: 0;
    }

    body {
        padding-top: 200px;
    }

    .container {
        margin: 0 auto;
        border: solid 5px silver;
        width: 1020px;
        height: 320px;
    }

    .row {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 10px 10px;
    }

    div {
        background: blueviolet;
        height: 100px;
        background-clip: content-box;
        padding: 10px;
        box-sizing: border-box;
        border: solid 1px blueviolet;
        font-size: 35px;
    }

    .c-1 {
        grid-column: span 1;
    }

    .c-2 {
        grid-column-end: span 2;
    }

    .c-3 {
        grid-column-end: span 3;
    }

    .c-4 {
        grid-column-end: span 4;
    }

    .c-5 {
        grid-column-end: span 5;
    }

    .c-6 {
        grid-column-end: span 6;
    }

    .c-7 {
        grid-column-end: span 7;
    }

    .blue {
        background: #904FA9;
    }

    .green {
        background: #EEBC31;
    }
</style>

<article class="container">
    <section class="row">
        <div class="c-1 blue">1</div>
        <div class="c-3 blue">3</div>
        <div class="c-6 blue">6</div>
        <div class="c-2 blue">2</div>
    </section>
    <section class="row">
        <div class="c-4 green">4</div>
        <div class="c-4 green">4</div>
        <div class="c-4 green">4</div>
    </section>
</article>
```

## 区域定位

📗 通过 `grid-area` 属性可以将元素放在指定区域中。`grid-area`由`grid-row-start`、`grid-column-start`、`grid-row-end`、`grid-column-end` 的简写模式。

### 编号定位

下例中将元素放在容器的中心位置中的栅格中。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/21.png)

```css
article {
    display: grid;
    grid-template-rows: repeat(3, 100px);
    grid-template-columns: repeat(3, 100px);
}
article div:first-child {
    grid-area: 2/2/4/3;
}
```

### 命名定位

同样是上面的例子可以使用栅格线命名来附加元素。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/23.png)

```css
article {
    margin: 0 auto;
    width: 400px;
    height: 400px;
    border: solid 5px silver;
    display: grid;
    grid-template-rows: repeat(auto-fill, [r] 100px);
    grid-template-columns: repeat(auto-fill, [l] 100px);
}
article div:first-child {
    grid-area: r 2/l 2/r 4/l 4;
}
```

## 区域声明 👾

📗 区域是由多个单元格构成，使用 `grid-template-areas`可以定义栅格区域，并且栅格区域必须是矩形的。

### 区域布局

下面是使用栅格区域布局移动端页面结构：

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/25.png)

```html
<style>
    body {
        width: 100vw;
        height: 100vh;
        display: grid;
        grid-template-rows: 80px 1fr 50px;
        grid-template-columns: 100px 1fr 50px 60px;
        grid-template-areas: "header header header header"
            "nav main main aside"
            "footer footer footer footer";
    }

    main {
    	/* 完整的写法，推荐使用下面的简写方式*/
		/* grid-area: main-start/main-start/main-end/main-end; */
        grid-area: main;
        background: #E9EEEF;
    }

    header {
        background: #2EC56C;
        grid-area: header;
    }

    nav {
        background: #E1732C;
        grid-area: nav;
    }

    aside {
        grid-area: aside;
        background: #EEBC31;
    }

    footer {
        grid-area: footer;
        background: #904FA9;
    }
</style>

<body>
    <header></header>
    <nav></nav>
    <main></main>
    <aside></aside>
    <footer></footer>
</body>
```

### 简写形式

使用`grid-template`进行栅格划分会更简洁。

1. grid-template-rows
2. grid-template-columns
3. grid-template-areas

语法格式为：

```shell
 grid-template:
      '栅格名称 栅格名称 栅格名称 栅格名称' 行高
      '栅格名称 栅格名称 栅格名称 栅格名称' 行高
      '栅格名称 栅格名称 栅格名称 栅格名称' 行高/列宽 列宽 列宽 列宽;
```

下面是使用grid-template进行简写的示例

```css
body {
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-template:
        'header header header header' 80px
        'nav main main aside' auto
        'footer footer footer footer' 50px/100px auto 50px 60px;
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/24.png)

### 区域命名

系统会为区域自动命名，上例中的会产生 `header-start` 水平与垂直同名的起始区域与 `header-end`水平与垂直同名的区域终止。

下面使用区域命名部署的效果

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/26.png)

```html
<style>
    article {
        width: 100vw;
        height: 100vh;
        display: grid;
        grid-template-rows: 80px 1fr 50px;
        grid-template-columns: 80 1fr;
        grid-template-areas: "header header header"
            "nav main main"
            "footer footer footer";
    }

    div {
        background: blueviolet;
        background-clip: content-box;
        border: solid 1px blueviolet;
        padding: 10px;
        box-sizing: border-box;
        color: white;
        font-size: 25px;
    }

    div:nth-child(1) {
        grid-area: header-start/nav-start/main-end/main-end;
    }

    div:nth-child(2) {
        grid-area: footer-start/footer-start/footer-end/footer-end;
    }
</style>

<article>
    <div></div>
    <div></div>
</article>
```

### 区域占位

使用一个或多个 连续的`.` 定义区域占位 📌

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/27.png)

```html
<style>
    * {
        padding: 0;
        margin: 0;
    }

    article {
        width: 100vw;
        height: 100vh;
        display: grid;
        grid-template-rows: repeat(3, 33.3%);
        grid-template-columns: repeat(3, 33.3%);
        grid-template-areas: "top . ."
            "top . ."
            "bottom bottom bottom";
    }

    .top {
        background: blueviolet;
        grid-area: top;
        font-size: 35px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
    }

    .bottom {
        background: orange;
        grid-area: bottom;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 35px;
    }
</style>

<article>
    <div class="top">
        top
    </div>
    <div class="bottom">
        bottom
    </div>
</article>
```

## 栅格流动

在容器中设置`grid-auto-flow` 属性可以改变单元格排列方式。

| 选项   | 说明                                   |
| ------ | -------------------------------------- |
| column | 按列排序                               |
| row    | 按行排列                               |
| dense  | 元素使用前面空余栅格（下面有示例说明） |

### 基本使用

下例将单元按列排序流动`grid-auto-flow: column;`

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/28.png)

```html
<style>
  article {
      width: 400px;
      height: 400px;
      display: grid;
      grid-template-rows: repeat(2, 1fr);
      grid-template-columns: repeat(2, 1fr);
      border: solid 5px silver;
      grid-auto-flow: column;
  }

  div {
      background: blueviolet;
      background-clip: content-box;
      padding: 10px;
      font-size: 35px;
      color: white;
  }
</style>

<article>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
</article>
```

### 强制填充

当元素在栅格中放不下时，将会发生换行产生留白，使用`grid-auto-flow: row dense;` 可以执行填充空白区域操作。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/29.png)

```html
<style>
    * {
        padding: 0;
        margin: 0;
    }

    body {
        padding-left: 200px;
        padding-top: 200px;
    }

    article {
        width: 600px;
        height: 600px;
        display: grid;
        grid-template-rows: repeat(3, 200px);
        grid-template-columns: repeat(3, 200px);
        border: solid 5px silver;
        grid-auto-flow: row dense;
    }

    div {
        background: blueviolet;
        background-clip: content-box;
        padding: 10px;
        font-size: 35px;
        color: white;
    }

    article div:nth-child(1) {
        grid-column: 1/span 2;
        background: #000;
    }

    article div:nth-child(2) {
        grid-column: 2/span 1;
    }
</style>

<article>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
</article>
```

## 对齐管理

📗 可以通过属性方便的定义栅格或元素的对齐方式

| 选项            | 说明                                             | 对象     |
| --------------- | ------------------------------------------------ | -------- |
| justify-content | 所有栅格在容器中的水平对齐方式，容器有额外空间时 | 栅格容器 |
| align-content   | 所有栅格在容器中的垂直对齐方式，容器有额外空间时 | 栅格容器 |
| align-items     | 栅格内所有元素的垂直排列方式                     | 栅格容器 |
| justify-items   | 栅格内所有元素的横向排列方式                     | 栅格容器 |
| align-self      | 元素在栅格中垂直对齐方式                         | 栅格元素 |
| justify-self    | 元素在栅格中水平对齐方式                         | 栅格元素 |

### 栅格对齐

📗 justify-content与align-content用于控制栅格的对齐方式，比如在栅格的尺寸**小于**容器的心里时，控制栅格的布局方式。

justify-content属性的值如下

| 值            | 说明                                                         |
| ------------- | ------------------------------------------------------------ |
| start         | 容器左边                                                     |
| end           | 容器右边                                                     |
| center        | 容器中间                                                     |
| stretch       | 撑满容器                                                     |
| space-between | 第一个栅格靠左边，最后一个栅格靠右边，余下元素平均分配空间   |
| space-around  | 每个元素两侧的间隔相等。所以，栅格之间的间隔比栅格与容器边距的间隔大一倍 |
| space-evenly  | 栅格间距离完全平均分配                                       |

align-content属性的值如下

| 值            | 说明                                                         |
| ------------- | ------------------------------------------------------------ |
| start         | 容器顶边                                                     |
| end           | 容器底边                                                     |
| center        | 容器垂直中间                                                 |
| stretch       | 撑满容器                                                     |
| space-between | 第一个栅格靠左边，最后一个栅格靠右边，余下元素平均分配空间   |
| space-around  | 每个元素两侧的间隔相等。所以，栅格之间的间隔比栅格与容器边距的间隔大一倍 |
| space-evenly  | 栅格间距离完全平均分配                                       |

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/30.png)

```css
border: solid 5px silver;
width: 600px;
height: 600px;
display: grid;
grid-template-columns: 200px 200px;
grid-template-rows: 200px 200px;
/* 水平两边对其 */
justify-content: space-between;
/* 垂直间隔对其 */
align-content: space-evenly;
```

下面是栅格水平与垂直居中对齐的示例

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/31.png)

```html
<style>
    main {
        display: grid;
        width: 100vw;
        height: 100vh;
        grid-template: 10vh 20vh / 30vw auto;
        justify-content: center;
        align-content: center;
    }

    div {
        background: blueviolet;
        border: solid 1px #ddd;
        color: white;
        padding: 5px;
        box-sizing: border-box;
    }

    div:nth-child(1) {
        background-color: #3498db;
    }

    div:nth-child(2) {
        background-color: #f1c40f;
    }

    div:nth-child(3) {
        background-color: #2ecc71;
    }

    div:nth-child(4) {
        background-color: #9b59b6;
    }
</style>
<main>
    <div href="">1st</div>
    <div href="">hello world</div>
    <div href="">3rd</div>
    <div href="">4th</div>
</main>
```

### 元素对齐

justify-items与align-items用于控制所有栅格内元素的对齐方式

justify-items用于控制元素的水平对齐方式，可用的属性值如下

| 值      | 说明               |
| ------- | ------------------ |
| start   | 元素对齐栅格的左边 |
| end     | 元素对齐栅格的右边 |
| center  | 元素对齐栅格的中间 |
| stretch | 水平撑满栅格       |

align-items用于控制元素的垂直对齐方式，可用的属性值如下

| 值      | 说明                   |
| ------- | ---------------------- |
| start   | 元素对齐栅格的顶边     |
| end     | 元素对齐栅格的底边     |
| center  | 元素对齐栅格的垂直中间 |
| stretch | 垂直撑满栅格           |

下面是将元素在所在栅格中水平、垂直居中的示例

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/32.png)

```css
main {
    display: grid;
    width: 100vw;
    height: 100vh;
    grid-template: 20vh / repeat(4, 1fr);
    /* 区域内容的水平对其 */
    justify-items: center;
    /* 区域内容的垂直对其 */
    align-items: center;
}
```

下面是所有元素在所在栅格中居中对齐的示例

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/33.png)

```css
main {
    display: grid;
    width: 100vw;
    height: 100vh;
    grid-template: 50vh 1fr / 50vw 1fr;
    justify-content: center;
    align-content: center;
}
```

### 元素独立控制

📗 justify-self与align-self控制单个栅格内元素的对齐方式，属性值与justify-items和align-items是一致的。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/34.png)

```css
div:first-child {
    justify-self: end;
    align-self: center;
}

div:nth-child(4) {
    justify-self: start;
    align-self: center;
}
```

### 组合简写

#### place-content

用于控制栅格的对齐方式，语法如下：

```css
place-content: <align-content> <justify-content>
```

#### place-items

控制所有元素的对齐方式，语法结构如下：

```css
place-items: <align-items> <justify-items>
```

#### place-self

控制单个元素的对齐方式

```css
place-self: <align-self> <justify-self>
```

## 自动排列

📗 当栅格无法放置内容时，系统会自动添加栅格用于放置溢出的元素，我们需要使用以下属性控制自动添加栅格的尺寸。

### 属性说明

| 选项              | 说明                                                   | 对象 |
| ----------------- | ------------------------------------------------------ | ---- |
| grid-auto-rows    | 控制自动增加的栅格行的尺寸，grid-auto-flow:row; 为默认 | 容器 |
| grid-auto-columns | 控制自动增加的栅格列的尺寸，grid-auto-flow: column;    | 容器 |

### 自动栅格行

下面定义了2X2的栅格，但有多个元素，系统将自动创建栅格用于放置额外元素。我们使用grid-auto-rows来控制增加栅格的行高。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/35.png)

```html
<style>
    main {
        display: grid;
        grid-template-rows: repeat(2, 50px);
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: 50px;
        grid-auto-columns: 200px;
    }
    div {
        background: blueviolet;
        background-clip: content-box;
        border: solid 1px #ddd;
        color: white;
    }
</style>

<main>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
    <div>5</div>
    <div>6</div>
</main>
```

### 自动行列

下面创建了2X2栅格，我们将第2个DIV设置的格栅已经超过了四个栅格，所以系统会自动创建栅格。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/36.png)

```html
<style>
    main {
        display: grid;
        grid-template-rows: repeat(2, 50px);
        grid-template-columns: repeat(2, 1fr);
        grid-auto-columns: 10vw;
        grid-auto-rows: 10vh;
    }

    div {
        background: blueviolet;
        background-clip: content-box;
        border: solid 1px #ddd;
        color: white;
    }

    div:nth-child(2) {
        grid-area: 5/5/5/5;
    }
</style>
<main>
    <div>Hello</div>
    <div>World</div>
</main>
```

## 终级简写

grid是简写属性，可以用来设置：

- 显式网格属性 grid-template-rows、grid-template-columns和 grid-template-areas，
- 隐式网格属性 grid-auto-rows、grid-auto-columns 和 grid-auto-flow，
- 间距属性 grid-column-gap和 grid-row-gap

使用语法:

```css
<'grid-template'> | <'grid-template-rows'> / [ auto-flow && dense? ] <'grid-auto-columns'>? | [ auto-flow && dense? ] <'grid-auto-rows'>? / <'grid-template-columns'>
```

### 行列划分

下面使用grid布局内容，将body容器的栅格居中排列，将main容器内的栅格内的元素居中排列。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/37.png)

```html
<style>
    body {
        display: grid;
        place-content: center center;
        width: 100vw;
        height: 100vh;
    }

    main {
        display: grid;
        grid: 10vh / repeat(4, 1fr);
        place-items: center center;
    }

    div {
        background-clip: content-box;
        border: solid 1px #ddd;
        color: white;
        padding: 10px;
        box-sizing: border-box;
    }

    div:nth-child(1) {
        background-color: #3498db;
    }

    div:nth-child(2) {
        background-color: #f1c40f;
    }

    div:nth-child(3) {
        background-color: #2ecc71;
    }

    div:nth-child(4) {
        background-color: #9b59b6;
    }
</style>
<main>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
</main>
```

### 定义区域

使用grid也可以定义栅格区域

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/grid/38.png)

```html
<style>
    main {
        width: 100vw;
        height: 100vh;
        display: grid;
        grid:
            'header header'50px 'nav main'auto 'footer footer'60px/100px auto;
    }

    div {
        border: solid 1px #ddd;
        color: white;
        padding: 10px;
        box-sizing: border-box;
    }

    div:nth-child(1) {
        background-color: #3498db;
        grid-area: header;
    }

    div:nth-child(2) {
        background-color: #f1c40f;
        grid-area: nav;
    }

    div:nth-child(3) {
        background-color: #2ecc71;
        grid-area: main;
    }

    div:nth-child(4) {
        background-color: #9b59b6;
        grid-area: footer;
    }
</style>
<main>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
</main>
```