# 文本控制

## 文本基础

### 字体设置

📗 可以定义多个字体，系统会依次查找，比如 `'Courier New'` 字体不存在将使用 `Courier` 以此类推。

Tips: 要使用通用字体，比如你电脑里有 `宋体` 在你电脑可以正常显示，但不保证在其他用户电脑可以正常，因为他们可能没有这个字体。

```css
font-family: 'Courier New', Courier, monospace;
```

**自定义字体**

可以声明自定义字体，如果客户端不存在将下载该字体，使用方式也是通过 `font-family` 引入。📌

```html
<style>
    @font-face {
        font-family: "source";
        src: url("SourceHanSansSC-Light.otf") format("opentype"),
             url("SourceHanSansSC-Heavy.otf") format("opentype");
    }
    span {
        font-family: 'source';
    }
</style>
```

| 字体  | 格式              |
| ----- | ----------------- |
| .otf  | opentype          |
| .woff | woff              |
| .ttf  | truetype          |
| .eot  | Embedded-opentype |

👾 不建议使用中文字体，因为文件**太大**且大部分是**商业**字体。

### 字重定义

📗 字重指字的粗细定义。取值范围 `normal | bold | bolder | lighter | 100 ~900`。

400对应 `normal`,700对应 `bold` ，一般情况下使用 bold 或 normal 较多。

```html
<style>
    span {
        font-weight: bold;
    }

    strong:last-child {
        font-weight: normal;
    }
</style>

<span>source.com</span>
<strong>mdn.com</strong>
```

### 文本字号

📗 字号用于控制字符的显示大小，包括 `xx-small | x-small | small | meidum | large | x-large | xx-large`。

**百分数**

百分数是子元素相对于父元素的大小，如父元素是20px，子元素设置为 200%即为你元素的两倍大小。

```html
<style>
    article {
        font-size: 20px;
    }

    span {
        font-size: 500%;
    }
</style>

<article>
    <!-- 100px -->
	<span>source.com</span>
</article>
```

**em**

em单位等同于百分数单位。(1em == 100%)

```html
<style>
    article {
        font-size: 20px;
    }

    span {
        font-size: 5em;
    }
</style>

<article>
    <!-- 100px -->
    <span>source.com</span>
</article>
```

### 文本颜色

**字符串颜色**

可以使用如 `red | green` 等字符颜色声明

```css
color: red;
```

**使用十六进制网页颜色**

```css
color: #ddffde
```

如果颜色字符相同如 `#dddddd` 可以简写为 `#ddd`

**使用RGB颜色**

```css
color: rgb(38, 149, 162);
```

**透明颜色**

透明色从 `0~1` 间，表示从透明到不透明

```css
color: rgba(38, 149, 162,.2);
```

### 行高定义

```css
div {
    line-height: 2em;
}
```

### 倾斜风格

字符的倾斜样式控制

```html
<style>
    span {
        font-style: italic;
    }

    em {
        font-style: normal;
    }
</style>

<span>source.com</span>
<hr>
<em>mdn.com</em>
```

### 组合定义

::: tip 可以使用 font 一次将字符样式定义，但要注意必须存在以下几点：

- 必须有字体规则('Courier New', Courier, monospace)
- 必须有字符大小规则(20px/1.5)

:::

```html
span {
	font: bold italic 20px/1.5 'Courier New', Courier, monospace;
}

<span>source.com</span>
```

> 上例中的 20px 为字体大小，1.5为1.5倍行高定义

## 文本样式

### 大小转换

小号大写字母（字体变小，全转大写）

```html
<style>
    .font-variant {
        font-variant: small-caps;
    }
</style>

<span>source.com</span>
<span class="font-variant">source.com</span>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/text/1.png)

字母大小写转换		

```html
<style>
    h2 {
        /* 首字母大写 */
        text-transform: capitalize;

        /* 全部大写 */
        text-transform: uppercase;

        /* 全部小写 */
        text-transform: lowercase;
    }
</style>
```

### 文本线条

添加隐藏删除线

```html
<style>
    a {
        text-decoration: none;
    }

    span.underline {
        text-decoration: underline;
    }

    span.through {
        text-decoration: line-through;
    }

    span.overline {
        text-decoration: overline;
    }
</style>

<a href="">source.com</a>
<hr>
<span class="underline">下划线</span>
<hr>
<span class="through">删除线</span>
<hr>
<span class="overline">上划线</span>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/text/2.png)

### 阴影控制

参数顺序为：颜色，水平偏移，垂直偏移，模糊度。

```html
<style>
    h2 {
        text-shadow: rgba(13, 6, 89, 0.8) 3px 3px 5px;
    }
</style>

<h2>source.com</h2>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/text/3.png)

### 空白处理

使用 `white-space` 控制文本空白显示。

| 选项     | 说明                                    |
| -------- | --------------------------------------- |
| pre      | 保留文本中的所有空白，类似使用 pre 标签 |
| nowrap   | 禁止文本换行                            |
| pre-wrap | 保留空白，保留换行符                    |
| pre-line | 空白合并，保留换行符                    |

```html
<style>
    h2 {
        white-space: pre;
        width: 200px;
        border: solid 1px #ddd;
    }
</style>

<h2>hel lo World</h2>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/text/4.png)

### 文本溢出 💡

**单行文本**

溢出文本容器后换行处理，不加`overflow-wrap: break-word;`文本会溢出h2容器。

```html
<style>
    h2 {
        overflow-wrap: break-word;
        width: 100px;
        border: solid 1px #ddd;
    }
</style>

<h2>helloWorld</h2>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/text/5.png)

溢出内容末尾添加 `...`

```html
<style>
    div {
        width: 200px;
        border: solid 1px blueviolet;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
<div>
    泉州市地处福建省東南沿海，介于上海和湛江两大港口之间的海岸线中段；全市范围位于东经117°35′-l19°05′，北纬24°23′-25°56′之间，東西宽约138公里，南北長约157公里。
</div>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/text/6.png)

**多行文本**

控制多行文本溢出时添加 `...`

```html
<style>
    div {
        width: 200px;
        border: solid 1px blueviolet;
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
    }
</style>
<div>
    泉州市地处福建省東南沿海，介于上海和湛江两大港口之间的海岸线中段；全市范围位于东经117°35′-l19°05′，北纬24°23′-25°56′之间，東西宽约138公里，南北長约157公里。
</div>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/text/7.png)

**表格文本溢出**

表格文本溢出控制需要为 table 标签定义 `table-layout: fixed;` css样式，表示列宽是由表格和单元格宽度定义。

```html
<style>
    table {
        table-layout: fixed;
    }

    table tbody tr td {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
```

## 段落控制

### 文本缩进

控制元素部的文本、图片进行缩进操作（2em可表示2个字体宽度）

```css
p {
    text-indent: 2em;
}
```

### 水平对齐

使用 `left|right|center` 对文本进行对齐操作

```css
h2 {
    text-align: center;
}
```

为了让段落内容看得舒服，需要设置合适的行高

```html
<style>
    p {
        text-indent: 2em;
        line-height: 2em;
    }
</style>
<p>
    泉州市地处福建省東南沿海，介于上海和湛江两大港口之间的海岸线中段；全市范围位于东经117°35′-l19°05′，北纬24°23′-25°56′之间，東西宽约138公里，南北長约157公里。
</p>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/text/8.png)

### 垂直对齐

使用 `vertical-align` 用于定义内容的垂直对齐风格，包括`middle | baseline | sub | super` 等。

**图像在段落中居中对齐**

```html
<style>
    img {
        height: 50px;
        vertical-align: middle;
    }
</style>
<p>
    泉州市地处福建省東南沿海，介于上海和湛江两大港口之间的海岸线中段；<img src="1.jpg" />全市范围位于东经117°35′-l19°05′，北纬24°23′-25°56′之间，東西宽约138公里，南北長约157公里。
</p>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/text/9.png)

**顶部与底部对齐**

`bottom | top` 相对于行框底部或顶部对齐。

```html
<style>
    h2 > span {
        vertical-align: bottom;
        font-size: 12px;
    }
</style>

<h2>source.com <span>mdn</span></h2>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/text/10.png)

**使用单位对齐**

可以使用具体数值设置对齐的位置。

```css
h2>span {
	vertical-align: -20px;
	font-size: 12px;
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/text/11.png)

### 字符间隔

**单词与字符间距**

使用 `word-spacing` 与 `letter-spacing` 控制单词与字符间距。

```css
h2 {
    word-spacing: 2em;
    letter-spacing: 3em;
}
```

### 排版模式

| 模式          | 说明                                     |
| ------------- | ---------------------------------------- |
| horizontal-tb | 水平方向自上而下的书写方式               |
| vertical-rl   | 垂直方向自右而左的书写方式               |
| vertical-lr   | 垂直方向内内容从上到下，水平方向从左到右 |

```css
div {
    height: 200px;
    border: solid 1px #ddd;
    writing-mode: vertical-rl;
}
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/text/12.png)

