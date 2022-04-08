#  元素权重

📗 元素会被多个样式一层层作用，这就是层叠样式表的来源。如果多个样式做用在元素上就会产生优先级权重问题。

使用类、ID、伪类都有不同的权重，具体应用哪条规则要看权限大小。

- 相同权重的规则应用最后出现的
- 可以使用 `!important` 强制提升某个规则的权限

## 权重应用 👾

| 规则          | 粒度 |
| ------------- | ---- |
| ID            | 0100 |
| class，属性值 | 0010 |
| 标签，伪元素  | 0001 |
| *             | 0000 |
| 行内样式      | 1000 |

下面是ID权限大于CLASS的示例

```html
<style>
    .color {
        color: blue;
    }
    #hot {
        color: green;
    }
</style>

<h2 class="color" id="hot">Title</h2>
<h2 class="color" id="hot" style="color: red;">Title</h2>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/priority/1.png)

属性权重的示例

```html
<style>
    /* 权重:0021 = class和id两个属性为20 + h2标签为1  */
    h2[class="color"][id] {
        color: red;
    }

    /* 权重:0012 = class属性值为10 + article和h2两个标签为2*/
    article h2[class="color"] {
        color: blue;
    }
</style>

<article>
    <h2 class="color" id="hot">HDCMS</h2>
</article>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/priority/2.png)

行级权重优先级最高

```html
<style>
    /* 权重:0012  */
    article h2[class="color"] {
        color: blue;
    }

    #hot {
        color: black;
    }
</style>

<article>
    <h2 class="color" id="hot">Title</h2>
</article>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/priority/3.png)

## 强制优先级

有时在规则冲突时，为了让某个规则强制有效可以使用 !important。

```html
<style>
    h2 {
        color: red !important;
    }

    h2 {
        color: green;
    }
</style>
```

两条规则权限一样，默认应用第二个规则，但第一个规则使用了`!important` 提升了权限，所以被应用。

## LESS

📗 为了使 CSS 更易维护和扩展，并减少在书写规则时对权重的思考，使用LESS是不错的主意。

很多软件提供了自动生成LESS的功能，下面是在VSCODE中使用的方法。

1. 安装插件 [easy-less 编译LESS(opens new window)](https://marketplace.visualstudio.com/items?itemName=mrcrowl.easy-less)
2. 编辑扩展名为 `.less` 的文件将自动生成同名的 `.css` 文件。

下面是一个LESS的示例

```less
main {
    article {
        h1 {
            color: red;
        }
    }
}
```

将生成 `css` 文件如下

```css
main article h1 {
    color: red;
}
```

## 继承规则 👾

::: tip 子元素可以继承父元素设置的样式。

- 👾 子元素并不是继承全部样式。比如边框、高度等并不会继承。
- 👾 继承的规则没有权重

:::

```html
<style>
    article {
        color: red;
        border: solid 1px #ddd;
    }
</style>

<article>
    <h2>hello <span>Michael</span></h2>
</article>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/priority/4.png)

上例中 `h2` 标签没有设置颜色样式，将继承 `article` 的颜色，并且边框没有产生继承。

## 通配符

在开发中使用`*` 选择器会有一个问题。因为通配符的权重为0，而继承的规则**没有权重(NULL)**，看以下代码产生的问题。

```html
<style>
    * {
        color: red;
    }

    h2 {
        color: blue;
    }
</style>

<article>
    <h2>hello <span>Michael</span></h2>
</article>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/priority/5.png)

span并没有继承 `h2` 的颜色，就是因为继承没有权重。而使用了 `*` 权重为0的规则。(0权重大于null无权重，`*` > 继承)

