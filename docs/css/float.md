# 浮动布局

## float

📗 float 属性定义元素在哪个方向浮动。以往这个属性总应用于图像，使文本围绕在图像周围，不过在 CSS 中，任何元素都可以浮动。浮动元素会生成一个块级框，而不论它本身是何种元素。

- 浮动元素会影响后面文档元素的布局
- 浮动元素是inline block，设置浮动之后可以为inline元素设置宽高
- 清楚浮动能够让父元素获得高度信息

### FLOAT

使用浮动可以控制相邻元素间的排列关系。

| 选项  | 说明     |
| ----- | -------- |
| left  | 向左浮动 |
| right | 向右浮动 |
| none  | 不浮动   |

### 文档流

没有设置浮动的块元素是独占一行的。

浮动是对后面元素的影响，下图中第二个元素设置浮动对第一个元素没有影响

```css
div:first-of-type {
    border: solid 2px red;
}

div:last-of-type {
    float: left;
    background: green;
}
```

![](./img/float/1.png)

### 丢失空间

如果只给第一个元素设置浮动，第二个元素不设置，后面的元素会占用第一个元素空间。

```css
div:first-of-type {
    float: left;
    border: solid 2px red;
}

div:last-of-type {
    background: green;
}
```

![](./img/float/2.png)

### 使用浮动

两个元素都设置浮动后，会并排显示

```css
div:first-of-type {
    float: left;
    border: solid 2px red;
}

div:last-of-type {
    float: left;
    background: green;
}
```

![](./img/float/3.png)

为第二个元素设置右浮动时将移动到右边

```css
div:first-of-type {
    float: left;
    border: solid 2px red;
}

div:last-of-type {
    float: right;
    background: green;
}
```

![](./img/float/4.png)

### 浮动边界

浮动元素边界不能超过父元素的padding

```css
main {
    width: 400px;
    border: solid 2px black;
    overflow: auto;
    padding: 50px;
    background-color: antiquewhite;
    background-clip: content-box;
}

div {
    width: 100px;
    height: 100px;
    box-sizing: border-box;
}

div:first-of-type {
    float: left;
    border: solid 2px red;
}

div:last-of-type {
    float: right;
    background: green;
}
```

![](./img/float/5.png)

### 浮动转块

📗  元素浮动后会变为**块元素**包括行元素如 `span`，所以浮动后的元素可以**设置宽高**

```css
a {
    float: left;
    width: 300px;
}
```

## 清除浮动

📗 不希望元素受浮动元素影响时，可以清除浮动。

### CLEAR

CSS提供了 `clear` 规则用于清除元素浮动影响。

| 选项  | 说明               |
| ----- | ------------------ |
| left  | 左边远离浮动元素   |
| right | 右连远离浮动元素   |
| both  | 左右都远离浮动元素 |

使用清除浮动

```html
<style>
    div {
        width: 200px;
        height: 200px;
        margin-bottom: 10px;
    }

    div.green {
        border: solid 2px green;
        float: left;
    }

    div.red {
        border: solid 2px red;
        float: right;
    }

    div.blue {
        background: blue;
        clear: both;
    }
</style>

<div class="green"></div>
<div class="red"></div>
<div class="blue"></div>
```

![](./img/float/6.png)

在父元素内部最后面添加一个没有高度的子元素，并使用`clear:both` 📌

```html
<style>
    .clearfix {
        clear: both;
        height: 0;
    }

    div {
        width: 200px;
        height: 200px;
        margin-bottom: 10px;
    }


    div.green {
        border: solid 2px green;
        float: left;
    }

    div.red {
        border: solid 2px red;
        float: left;
    }

    div.blue {
        background: blue;
    }
</style>

<article>
    <div class="green"></div>
    <div class="red"></div>
    <div class="clear"></div>
</article>
<div class="blue"></div>
```

![](./img/float/7.png)

### AFTER

使用 `::after` 伪类为父元素添加后标签，实现清除浮动影响 📌

```css
.clearfix::after {
    content: "";
    display: block;
    clear: both;
}
```

### OVERFLOW

子元素使用浮动后将不占用空间，这时父元素高度为将为零。

通过添加父元素并设置 `overflow` 属性可以清除浮动。

将会使用父元素产生 `BFC` 机制，即父元素的高度计算会包括浮动元素的高度 📌

```css
article {
    overflow: hidden;
}
```

## 页面布局

::: tip 完成页面布局注意以下几点

1. 首先根据设计稿确定页面大小（主要指宽度，移动端不需要考虑），如 1200px 宽度
2. 水平分割页面主要区域
3. 每个区域中按以上两步继续细分

::: 

## 形状浮动 👾

`shape-outside`的[CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) 属性定义了一个可以是非矩形的形状，相邻的内联内容应围绕该形状进行包装。 默认情况下，内联内容包围其边距框; `shape-outside`提供了一种自定义此包装的方法，可以将文本包装在复杂对象周围而不是简单的框中。

📗 通过形状浮动可以让内容围绕图片，类似于我们在word 中的环绕排版。要求图片是有透明度的PNG格式。

### shape-outside

`shape-outside`

| 选项        | 说明       |
| ----------- | ---------- |
| margin-box  | 外边距环绕 |
| padding-box | 内边距环绕 |
| border-box  | 边线环绕   |
| content-box | 内容环绕   |

#### margin-box

![](./img/float/8.png)

```html
<style>
    span.shape {
        float: left;
        width: 100px;
        height: 100px;
        padding: 30px;
        margin: 30px;
        border: solid 30px green;
        shape-outside: margin-box;
    }
</style>

<p>
    <span class="shape"></span>
    泉州市（闽南语：泉州市，白话字：Choân-chiu-chhǐ，台罗：Tsuân-tsiu-tshǐ，闽拼：Zuánziū-cî，国际音标：/tsuan˨˨ ʨiu˧˧
    ʨʰi˧˧/），简称泉、鲤，泉州府城又称刺桐城（Zaytun：زيتون或Chidun：ᠴᠢᠳᠤᠨ，在阿拉伯语、蒙古语意为橄榄）、温陵、清源，是中华人民共和国福建省下辖的地级市，位于福建省中南部沿海。市境西南接厦门市、漳州市，西界龙岩市，北邻三明市，东北达福州市、莆田市，东隔台湾海峡与台湾相望。地处闽东南沿海丘陵平原区，地势西北高，东南低，西北部为戴云山。晋江东溪和西溪于南安市双溪口汇合，往东流贯市区，注入泉州湾。全市总面积11,287平方公里，人口878.23万，市人民政府驻丰泽区东海街道。泉州是闽东南沿海政治、经济、文化和交通中心，首批国家历史文化名城，古代海上丝绸之路的起点，联合国教科文组织设立的世界多元文化展示中心，世界宗教博物馆，中国首届东亚文化之都，全国文明城市，国家卫生城市。
</p>
```

#### border-box

![](./img/float/9.png)

```css
span.shape {
    float: left;
    width: 100px;
    height: 100px;
    padding: 30px;
    margin: 30px;
    border: solid 30px green;
    shape-outside: border-box;
}
```

#### padding-box

![](./img/float/10.png)

### clip-path

`clip-path` 直译过来就是裁剪路径，使用SVG或形状定义一个HTML元素的可见区域的方法。想象一下你在`Photoshop`中勾勒路径的场景。

> clip-path属性可以防止部分元素通过定义的剪切区域来显示，仅通过显示的特殊区域。剪切区域是被URL定义的路径代替行内或者外部svg，或者定义路线的方法例如circle().。clip-path属性代替了现在已经弃用的剪切 clip属性。
>
> `clip-path`在线神器 - [http://bennettfeely.com/clippy](https://link.segmentfault.com/?url=http%3A%2F%2Fbennettfeely.com%2Fclippy) 。

| 选项    | 说明   |
| ------- | ------ |
| circle  | 圆形   |
| ellipse | 椭圆   |
| polygon | 多边形 |

#### circle

1. 圆的半径
2. 圆心位置

```css
circle( [ <shape-radius> ]? [ at <position> ]? )
```

![](./img/float/11.png)

```css
span.shape {
    float: left;
    width: 100px;
    height: 100px;
    padding: 30px;
    margin: 30px;
    background: red;
    clip-path: circle(50% at center);
}
```

#### ellipse

1. 椭圆的X轴半径，默认是宽度的一半，支持百分比
2. 椭圆的Y轴半径，默认是高度的一半，支持百分比
3. 椭圆中心位置，默认是元素的中心点

```css
ellipse( [ <shape-radius>{2} ]? [ at <position> ]? )
```

![](./img/float/12.png)

```css
span.shape {
    float: left;
    width: 100px;
    height: 100px;
    padding: 30px;
    margin: 30px;
    background: red;
    clip-path: ellipse(50% 80% at 100% 0);
}
```

#### ploygon

> polygon() : 定义一个多边形 。

```css
polygon( <fill-rule>? , [ <length-percentage> <length-percentage> ]# )
```

![](./img/float/13.png)

```css
span.shape {
    float: left;
    width: 100px;
    height: 100px;
    padding: 30px;
    margin: 30px;
    background: red;
    clip-path: polygon(50% 0, 100% 100%, 0 100%)
}
```

### 内移距离 inset

使用 `inset` 属性控制环绕向内移动的距离。

```css
span.shape {
    float: left;
    width: 100px;
    height: 100px;
    padding: 30px;
    margin: 30px;
    background: red;
    shape-outside: inset(50px 30px 80px 50px) padding-box;
}
```

![](./img/float/14.png)

### 环绕模式

| 选项    | 说明     |
| ------- | -------- |
| circle  | 圆形环绕 |
| ellipse | 椭圆环绕 |
| url     | 图片环绕 |
| polygan | 多边环绕 |

#### 圆形环绕

![](./img/float/15.png)

```css
img {
    padding: 20px;
    float: left;
    shape-outside: circle(50%) padding-box;
}
```

#### 椭圆环绕

![](./img/float/16.png)

```css
img {
    padding: 20px;
    float: left;
    shape-outside: ellipse(120px 98px) padding-box;
}
```

#### 图片环绕

![](./img/float/17.png)

```css
img {
    float: left;
    shape-outside: url(xj.png);
}
```

#### 多边环绕

![](./img/float/18.png)

```css
span.shape {
    float: left;
    width: 100px;
    height: 100px;
    background: red;
    clip-path: polygon(50px 0px, 0 100px, 100px 100px);
    shape-outside: polygon(50px 0px, 0 100px, 100px 100px);
}
```