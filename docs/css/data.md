# 数据样式

## 表格

📗表格可以非常快速的部署数据，灵活控制表格样式是必要的。

表格的单元格不能设置外边距 📌

### 定制表格  💡

📗 除了使用 `table` 标签绘制表格外，也可以使用样式绘制。

| 样式规则           | 说明           |
| ------------------ | -------------- |
| table              | 对应 table     |
| table-caption      | 对应 caption   |
| table-row          | 对应 表格行 tr |
| table-row-group    | 对应 tbody     |
| table-header-group | 对应 thead     |
| table-footer-group | 对应 tfoot     |

```html
<article class="table">
    <nav>表格标题</nav>
    <section>
        <ul>
            <li>标题</li>
            <li>说明</li>
        </ul>
    </section>
    <section>
        <ul>
            <li>MDN</li>
            <li>mdn.com</li>
        </ul>
        <ul>
            <li>TS</li>
            <li>typescript.cn</li>
        </ul>
    </section>
    <section>
        <ul>
            <li>hello</li>
            <li>world</li>
        </ul>
    </section>
</article>
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/1.png)

```css
/* table */ 
.table {
    display: table;
    border: solid 1px #ddd;
}

/* table-caption 将元素定位到表格上方的标题位置 */ 
.table nav {
    display: table-caption;
    text-align: center;
    background: black;
    color: white;
    padding: 10px;
}

/* table-header-group 表格 header */
.table section:nth-of-type(1) {
    font-weight: bold;
    display: table-header-group;
    background: #555;
    color: white;
}

/* table-row-group 表格 body */
.table section:nth-of-type(2) {
    display: table-row-group;
}
/* table-footer-group 表格 footer */
.table section:nth-of-type(3) {
    display: table-footer-group;
    background: #f3f3f3;
}

/* table-row 表格 行 */
.table section ul {
    display: table-row;
}

/* table-cell 单元格 */
.table section ul li {
    padding: 10px;
    display: table-cell;
    border: solid 1px #ddd;
}
```

### 表格标题

通过 `caption-side` 可以设置标题位置，值可以设置为 `top | bootom`。

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/2.png)

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/3.png)

```html
<style>
    table caption {
        background: black;
        color: white;
        padding: 10px;
        caption-side: top;
    }
</style>

<table border="1">
    <caption>表格标题</caption>
    <tr>
        <td>单元格区域</td>
        <td>单元格区域</td>
    </tr>
</table>
```

### 内容对齐

水平对齐使用 `text-align` 文本对齐规则

```css
table tr td {
    height: 100px;
    text-align: center;
}
```

垂直对齐使用 `vertical-align` 处理

| 属性   | 说明             |
| ------ | ---------------- |
| top    | 顶对齐           |
| middle | 垂直居中（默认） |
| bottom | 底部对齐         |

```css
table tr td {
    height: 100px;
    vertical-align: bottom;
    text-align: center;
}
```

### 颜色设置

为表格设置颜色与普通标签相似，可以为 `table | thead | tbody | caption | tfoot| tr| td` 设置颜色样式。

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/4.png)

```css
table tr {
    color: white;
}
table tr:nth-child(odd) {
    background: red;
}
table tr:nth-child(even) {
    background: #067db4;
}
```

### 边框间距

设置单元格间距，设置间距上下左右 `20px`、`10px` 。

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/5.png)

```css
table {
    border-spacing: 20px 10px;
}
```

### 边框合并

默认表格边框间是有间距的，以下示例将边框合并形成细线表格  📌

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/6.png)

```css
table {
  border-collapse: collapse;
}
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/7.png)

### 隐藏单元格

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/8.png)

```css
table {
    empty-cells: hide;
}
```

### 无边框表格

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/9.png)

```css
table {
    border: none;
    border-collapse: collapse;
}

table td {
    border: none;
    border-right: solid 1px #ddd;
    border-bottom: solid 1px #ddd;
}

table tr:first-child td {
    border-top: solid 1px #ddd;
}

table td:last-child {
    border-right: none;
}
```

### 数据表格

可以为表格元素使用伪类控制样式，下例中使用 `hover` 伪类样式

```css
table tr:hover {
    background: #ddd;
    cursor: pointer;
}
```

## 列表

### 列表符号

📗 使用 `list-style-type` 来设置列表样式，规则是继承的，所以在`ul` 标签上设置即可。

| 值                   | 描述                                                        |
| :------------------- | :---------------------------------------------------------- |
| none                 | 无标记。                                                    |
| disc                 | 默认。标记是实心圆。                                        |
| circle               | 标记是空心圆。                                              |
| square               | 标记是实心方块。                                            |
| decimal              | 标记是数字。                                                |
| decimal-leading-zero | 0开头的数字标记。(01, 02, 03, 等。)                         |
| lower-roman          | 小写罗马数字(i, ii, iii, iv, v, 等。)                       |
| upper-roman          | 大写罗马数字(I, II, III, IV, V, 等。)                       |
| lower-alpha          | 小写英文字母The marker is lower-alpha (a, b, c, d, e, 等。) |
| upper-alpha          | 大写英文字母The marker is upper-alpha (A, B, C, D, E, 等。) |
| lower-greek          | 小写希腊字母(alpha, beta, gamma, 等。)                      |
| lower-latin          | 小写拉丁字母(a, b, c, d, e, 等。)                           |
| upper-latin          | 大写拉丁字母(A, B, C, D, E, 等。)                           |
| hebrew               | 传统的希伯来编号方式                                        |
| armenian             | 传统的亚美尼亚编号方式                                      |
| georgian             | 传统的乔治亚编号方式(an, ban, gan, 等。)                    |
| cjk-ideographic      | 简单的表意数字                                              |
| hiragana             | 标记是：a, i, u, e, o, ka, ki, 等。（日文片假名）           |
| katakana             | 标记是：A, I, U, E, O, KA, KI, 等。（日文片假名）           |
| hiragana-iroha       | 标记是：i, ro, ha, ni, ho, he, to, 等。（日文片假名）       |
| katakana-iroha       | 标记是：I, RO, HA, NI, HO, HE, TO, 等。（日文片假名）       |

隐藏列表符号（实际上设置的是li元素，继承了该属性）

```css
ul {
    list-style-type: none;
}
```

 👾 自定义列表样式 

```css
ul li {
    /* list-style-image: url(item.png); */
    list-style-image: radial-gradient(10px 10px, red, black);
}
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/10.png)

### 符号位置

控制符号显示在内容外面还是内部

| 选项    | 说明                                  |
| ------- | ------------------------------------- |
| inside  | 内部 （::marker伪元素处在li元素内部） |
| outside | 外部 (默认)                           |

```css
ul {
    list-style-position: inside;
}
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/11.png)

### 组合定义

可以一次定义列表样式

```css
ul {
    list-style: circle inside;
}
```

### 背景符号 💡

通过为li元素设置背景图片，也可以达到效果

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/12.png)

```css
ul li {
    background: url(item.png) no-repeat 0 6px;
    background-size: 20px 20px;
    list-style: none;
    text-indent: 2em;
    border-bottom: 1px solid #ddd;
    padding: 6px;
}
```

多图背景定义

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/13.png)

```css
ul {
    list-style-type: none;
}

ul li {
    background-image: url(item.png), url(bg.png);
    background-repeat: no-repeat, repeat;
    background-size: 20px 20px, 100%;
    background-position: 2px 2px, 0 0;
    text-indent: 2em;
    border-bottom: solid 1px #ddd;
    margin-bottom: 10px;
    padding-bottom: 5px;
}
```

## 追加内容 👾

### 基本使用

使用伪类 `::before` 向前添加内容，使用 `::after` 向后面添加内容。

```css
a::after {
  content: " (坚持努力) ";
}
```

### 提取属性 💡

`attr`使用属性值添加内容，可以使用标准属性与自定义属性。

```css
<style>
  a::after {
    content: attr(href);
  }
</style>

<a href="blog.caffreygo.com">博客</a>
```

通过属性值添加标签提示

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/14.png)

```html
<style>
    a {
        position: relative;
    }

    a:hover::before {
        /* content: attr(data-link); */
        content: "URL: "attr(data-link);
        background: #555;
        color: white;
        position: absolute;
        top: 20px;
        padding: 3px 10px;
        border-radius: 10px;
    }
</style>
<a data-link="blog.caffreygo.com">博客</a>
```

### 自定义表单 

![](http://ra15bg9hk.hn-bkt.clouddn.com/css/data/before.gif)

```html
<style>
    body {
        padding: 80px;
    }

    .field {
        position: relative;
    }

    input {
        border: none;
        outline: none;
    }

    .field::after {
        content: '';
        background: linear-gradient(to right, white, red, green, blue, white);
        height: 30px;
        position: relative;
        width: 100%;
        height: 1px;
        display: block;
        left: 0px;
        right: 0px;
    }

    .field:hover::before {
        content: attr(data-placeholder);
        position: absolute;
        top: -20px;
        left: 0px;
        color: #555;
        font-size: 12px;
    }
</style>

<div class="field" data-placeholder="请输入少于100字的标题">
    <input type="text" id="name">
</div>
```

