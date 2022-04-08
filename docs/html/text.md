# 文本相关

## 基本标签

### p

`p`标签标记了一个段落内容。

```html
<p>这是第一个段落。这是第一个段落。
    这是第一个段落。这是第一个段落。</p>
<p>这是第二个段落。这是第二个段落。
    这是第二个段落。这是第二个段落。</p>
```

### pre

> preformatted: 预先格式化

**原样显示**文本内容包括空白、换行等。

```html
<pre>
        这是pre标签的显示效果
            这是换行后的内容，空白和换行都会保留
</pre>
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/text/pre.png)

### br

📌 在`html` 中回车是**忽略**的，使用 `br` 标签可以实现换行效果。

### span

`span` 标签与 `div` 标签都是没有语义的，`span` 常用于对某些文本特殊控制，但该文本又没有适合的语义标签。

## 描述文本

`small` 用于设置描述、声明等文本。

HTML 中的`small`元素將使文本的字体变小一号。(例如从大变成中等，从中等变成小，从小变成超小)。在HTML5中，除了它的样式含义，这个元素被重新定义为表示边注释和附属细则，包括版权和法律文本。

```html
<p>MDN Web Docs is a learning platform for Web technologies and the software that powers the Web.</p>

<hr>

<p><small>The content is licensed under a Creative Commons Attribution-ShareAlike 2.5 Generic License.</small></p>
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/text/small.png)

### time

标签定义日期或时间，或者两者。

```html
<time> 2019-07-26 </time>
```

### abbr

>abbreviation: 缩写

`abbr`用于代表缩写，并且可以通过可选的title属性提供完整的描述。若使用 `title`属性，则它必须且仅可包含完整的描述内容。

```html
<p>You can use <abbr title="Cascading Style Sheets">CSS</abbr> to style your <abbr title="HyperText Markup Language">HTML</abbr>.</p>
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/text/abbr.png)

### sub

用于数字的下标内容

```html
水的化学式为H<sub>2</sub>O
```

### sup

用于数字的上标内容

```html
请计算5<sup>2</sup>平方
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/text/subsup.png)

### del

`del` 标签表示删除的内容，`ins`(insert) 一般与 `del` 标签配合使用描述更新与修正。

```html
原价 <del>200元</del> 现价 <ins>100元</ins>
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/text/delins.png)

### s

`s` 标签显示效果与 `del` 相似，但语义用来定义那些不正确、不准确或没有用的文本。

```html
<s>A 太阳是方的</s> <br>
B 地球是圆的
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/text/s.png)

### code

用于显示代码块内容，一般需要代码格式化插件完成。

### progress

用于表示完成任务的进度，当游览器不支持时显示内容。

```html
<progress value="60" max="100">完成60%</progress>
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/text/progress.png)

## 强调文本

### strong

`strong` 标签和 `em` 一样，用于强调文本，但是它们的强调程度不同。

```html
<strong>Jerry</strong>正在学习<em>HTML</em>
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/text/strongem.png)

### mark

用于突出显示文本内容，类似我们生活中使用的马克笔。

```html
请认真学习以下语言 <mark>PHP</mark>、<mark>JavaScript</mark>
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/text/mark.png)

## 引用标签

### cite

> Citation: 引文

`cite` 标签通常表示它所包含的文本对某个参考文献的引用，或文章作者的名子。

```html
这本小说是 <cite>毛姆</cite> 写的。
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/text/cite.png)

### blockquote

`blockquote` 用来定义摘自另一个源的块引用

```html
下而是来自某一个大叔，对失败的认知
<blockquote cite="https://www.houdunren.com">
	在坚持的人面前，失败终将被踏过。
</blockquote>
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/text/blockquote.png)

### q

`q` 用于表示行内引用文本，在大部分浏览器中会加上引号。

```html
最新课程 <q>HTML开启WEB征途</q> 已经发布了
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/text/q.png)

## 联系信息

### address

用于设置联系地址等信息，一般将`address` 放在`footer` 标签中。

```html
<address>
	感谢您提交建议到 caffreygo@163.com
</address>
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/text/address.png)

