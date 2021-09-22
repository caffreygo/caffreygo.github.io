# 基础知识

📗 大部分HTML元素都有系统提供的样式，但有以下问题

- 不同浏览器显示样式不一致
- 样式过于简单，显示效果不美观
- 很难按照设计稿完全呈现显示效果

## 样式声明

可以通过多种方式定义样式表。

### 外部样式

::: tip 使用 link标签引入外部样式文件，需要注意以下几点。

- link 标签放在 `head` 标签内部
- 样式文件要以 `.css` 为扩展名
- 一个页面往往需要引入多个样式文件

::: 

| 属性 | 说明                               |
| ---- | ---------------------------------- |
| rel  | 定义当前文档与被链接文档之间的关系 |
| href | 外部样式文件                       |
| type | 文档类型                           |

```html
<link rel="stylesheet" href="style.css" type="text/css">
```

### 嵌入样式

使用 `style` 标签可以在文档内部定义样式规则。

```html
<style>
    body {
        background: red;
    }
</style>
```

### 内联样式

可以为某个标签单独设置样式。

```html
<h1 style="color:green;">caffreygo.com</h1>
```

### 导入样式 💡

📗  使用 `@import` 可以在原样式规则中导入其他样式表，可以在外部样式、`style`标签中使用。

可以使用以下两种方式导入

```css
@import "style.css"
@import url("style.css")
```

导入样式要放在样式规则前面定义。

```html
<style>
    @import url("hdcms.css");
    body {
        background: red;
    }
</style1>
```

## 其他细节

### 空白

📗 在样式规则中可以随意使用空白，空白只是看不见但同样**占用空间**，所以可以结合其他工具如 `webpack` 等将`css` 📗 为一行。

### 注释

注释是对定义样式规则的说明，便于后期维护理解。

```css
...
body {
    /* 这是注释的使用 */
    background: red;
}
...
```

### 错误

📗 样式规则如果存在错误，解析器会选择**忽略**，并不会影响其他样式规则。

以下代码的`hello:red` 是无效样式但不影响后面的 `font-size:100px;` 规则使用。

```css
h1 {
    hello: red;
    font-size: 100px;
}
```

## 初始样式

有些标签默认含有内外边距，且不同浏览器大小也不一样。为了统一我们可以**重置**标签的CSS默认样式。

最简单的方式就是使用插件[css-reset (opens new window)](https://meyerweb.com/eric/tools/css/reset/)完成，也可以在vscode等编辑器中定义代码片段。

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css" />
```