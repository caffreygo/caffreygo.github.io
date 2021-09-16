

# 页面结构

##  语义标签

📗 HTML标签都有**具体语义**，非然技术上可以使用div标签表示大部分内容，但选择清晰的语义标签更容易让人看明白。比如 `h1`表示标题、`p`标签表示内容、强调内容使用`em`标签。

```html
<article>
    <h1>Hello</h1>
    <p>在线学习平台</p>
</article>
```

## 嵌套关系

元素可以互相嵌套包裹，即元素存在父子级关系。

```html
<article>
    <h1>Hello</h1>
    <div>
        <p>在线学习平台</p>
        <span>google.com</span>
    </div>
</article>
```

## 基本结构

下面是HTML文档的基本组成部分

```html
<!DOCTYPE html>
<html lang="zh-CN">
    <head>
        <meta charset="utf-8">
        <meta name="keyword" content="html,css,js" />
        <meta name="description" content="Hello world" />
        <title>Hello</title>
    </head>
    <body>

    </body>
</html>
```

| 标签        | 说明                                            |
| ----------- | ----------------------------------------------- |
| DOCTYPE     | 声明为HTML文档                                  |
| html        | lang:网页的语言，如en/zh等，非必选项目          |
| head        | 文档说明部分，对搜索引擎提供信息或加载CSS、JS等 |
| title       | 网页标题                                        |
| keyword     | 向搜索引擎说明你的网页的关键词                  |
| description | 向搜索引擎描述网页内容的摘要信息                |
| body        | 页面主体内容                                    |

## 内容标题

::: tip 标题使用 `h1 ~ h6` 来定义，用于突出显示文档内容。

- 从 h1到h6对搜索引擎来说权重会越来越小
- 页面中最好只有一个h1标签
- 标题最好不要嵌套如 h1内部包含 h2

::: 

```html
<h1>Hello</h1>
<h2>google.com</h2>
<h3>take</h3>
<h4>coffee</h4>
<h5>flight</h5>
<h6>stauff</h6>
```

## 页眉页脚

### header

header标签用于定义文档的**页眉**

```html
<body>
    <header>
        <nav>
            <ul>
                <li><a href="">系统学习</a></li>
                <li><a href="">视频库</a></li>
            </ul>
        </nav>
    </header>
    <article>
        <h2>Hello网站动态</h2>
        <ul>
            <li><a href="">完成签到 开心每一天</a></li>
            <li><a href="">完成签到 来了，老铁</a></li>
        </ul>
    </article>
    ...
</body>
```

### footer

footer 标签定义文档或节的**页脚**，页脚通常包含文档的作者、版权信息、使用条款链接、联系信息等等。

```html
<body>
    ...
    <article>
        <h2>Hello网站动态</h2>
        <ul>
            <li><a href="">完成签到 开心每一天</a></li>
            <li><a href="">完成签到 来了，老铁</a></li>
        </ul>
    </article>
    <footer>
        <p>
            我们的使命：传播互联网前沿技术，帮助更多的人实现梦想
        </p>
    </footer>
</body>
```

## 导航元素

在HTML中使用`nav`设置导航链接。

```html
<header>
    <nav>
        <ul>
            <li>
                <a href="">系统学习</a>
            </li>
            <li>
                <a href="">视频库</a>
            </li>
        </ul>
    </nav>
</header>
```

## 主要区域 main

📗 HTML5中使用 `main` 标签表示页面主要区域，一个页面中`main`元素最好只出现一次。

```html
<body>
    ...
    <main>
        <article>
            <h2>网站动态</h2>
            <ul>
                <li><a href="">完成签到 开心每一天</a></li>
                <li><a href="">完成签到 来了，老铁</a></li>
            </ul>
        </article>
    </main>
    ...
</body>
```

## 内容区域 article

使用 `article` 标签规定独立的自包含内容区域。不要被单词的表面意义所局限，`article` 标签表示一个**独立的内容容器**。

```html
<main>
    <article>
        <h2>Hello网站动态</h2>
        <ul>
            <li><a href="">完成签到 开心每一天</a></li>
            <li><a href="">完成签到 来了，老铁</a></li>
        </ul>
    </article>
</main>
```

## 区块定义 section

使用 `section` 定义一个区块，一般是一组相似内容的排列组合。

```html
<main>
    <article>
        <section>
            <h2>锁机制</h2>
        </section>
        <section>
            <h2>事物处理</h2>
        </section>
    </article>
</main>
```

## 附加区域 aside

使用 `aside` 用于设置与主要区域无关的内容，比如侧面栏的广告等。

```html
<body>
    <main>
        <article>
            ...
        </article>
    </main>
    <aside>
        <h2>社区小贴</h2>
        <p>这是一个主张友好、分享、自由的技术交流社区。</p>
    </aside>
    </main>
</body>
```

## 通用容器 div

`div` 通用容器标签是较早出现的，也是被大多数程序员使用最多的容器。不过我们应该更倾向于使用有语义的标签如`article/section/aside/nav` 等。

有些区域这些有语义的容器不好表达，这时可以采用`div`容器，比如轮播图效果中的内容。

```html
<div>
    <header>
        <nav>
            <ul>
                <li><a href="">Hello</a></li>
                <li><a href="">系统课程</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <article>
            <section>
                <h2>事物处理</h2>
            </section>
        </article>
        <aside>
            <h2>社区小贴</h2>
            <p>这是一个主张友好、分享、自由的技术交流社区。</p>
        </aside>
    </main>
    <footer>
        <p>
            我们的使命：传播互联网前沿技术，帮助更多的人实现梦想
        </p>
    </footer>
</div>
```