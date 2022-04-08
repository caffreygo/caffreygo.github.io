# 背景处理

## 背景样式

### 背景颜色

背景颜色可以使用 `rga | rgba | 十六进制` 等颜色格式

```html
<style>
    h2 {
        background-color: red;
    }
</style>

<h2>hello world</h2>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/1.png)

### 背景图片

可以使用 `png| gif |jpeg` 等图片做为背景使用

```css
background-image: url(bg.png);
```

### 背景裁切

```css
background-clip: border-box;
```

背景图片在容器元素内所显示的区域，例如`content-box`表示背景图片只会在元素的内容区域显示 📌

| 选项        | 说明                 |
| ----------- | -------------------- |
| border-box  | 包括边框             |
| padding-box | 不含边框，包括内边距 |
| content-box | 内容区域             |

### 背景重复

用于设置背景重复的规则

| 选项      | 说明                 |
| --------- | -------------------- |
| repeat    | 水平、垂直重复       |
| repeat-x  | 水平重复             |
| repeat-y  | 垂直重复             |
| no-repeat | 不重复               |
| space     | 背景图片对称均匀分布 |

```css
background-repeat: repeat-y
```

### 背景滚动

📗 `background-attachment`用于设置在页面滚动时的图片处理方式。（在父元素的容器大小限制之下，子元素内容超出滚动，并且带有背景图的情况）

| 选项   | 说明     |
| ------ | -------- |
| scroll | 背景滚动 |
| fixed  | 背景固定 |

#### scroll

```html
<style>
    main {
        height: 200px;
        overflow: auto;
    }
    .content {
        /* scroll跟随内容滚动 */
        background-attachment: scroll;
        background-image: url(bg.png);
        padding: 20px;
        text-shadow: 0 0 0.6rem #ddd, 0 0 0.6rem #fff;
    }
</style>

<main>
    <div class="content">
        London. Michaelmas term lately over, and the Lord Chancellor sitting in Lincoln's Inn Hall. Implacable November
        weather. As much mud in the streets as if the waters had but newly retired from the face of the earth, and it
        would not be wonderful to meet a Megalosaurus, forty feet long or so, waddling like an elephantine lizard up
        Holborn Hill.
        London. Michaelmas term lately over, and the Lord Chancellor sitting in Lincoln's Inn Hall. Implacable November
        weather. As much mud in the streets as if the waters had but newly retired from the face of the earth, and it
        would not be wonderful to meet a Megalosaurus, forty feet long or so, waddling like an elephantine lizard up
        Holborn Hill.
    </div>
</main>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/scroll.gif)

#### fixed

```css
background-attachment: fixed;
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/fixed.gif)

### 背景位置

`background-position`用于设置背景图片的水平、垂直定位。

| 选项   | 说明     |
| ------ | -------- |
| left   | 左对齐   |
| right  | 右对齐   |
| center | 居中对齐 |
| top    | 顶端对齐 |
| bottom | 底部对齐 |

居中对齐

```css
background-position: center;
/* 或 X Y  */
background-position: 50% 50%;
```

水平居右，垂直居中

```css
background-position: right center;
/* 或 X Y  */
background-position: 100% 50%;
```

使用具体数值定义

```css
background-position: 100px 100px;
/* 也支持使用负值  */
background-position: -200px 100px;
```

实例

```css
background-attachment: fixed;
background-image: url(bg.png);
background-size: 200px 100px;
background-repeat: no-repeat;
background-position: 80px 70px;
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/position.gif)

### 背景尺寸

| 选项    | 说明                                       |
| ------- | ------------------------------------------ |
| cover   | 背景完全覆盖，可能会有背景溢出             |
| contain | 图片不溢出的放在容器中，可能会漏出部分区域 |

指定数值定义宽高尺寸

```css
background-size: 50% 100%;
/* 或 Width Height  */
background-size: 200px 200px;
```

宽度固定高度自动

```css
background-size: 50% auto;
```

### 多个背景

后定义的背景置于底层

```css
background-image: url(bg1.png), url(bg.png);
```

多属性定义

```css
background-image: url(bg1.png), url(bg.png);
background-repeat: no-repeat;
background-position: top left, right bottom;
```

可以一次定义多个背景图片。

```css
background: url(bg1.png) left 50% no-repeat,
                url(bg.png) right 100% no-repeat red;
```

实例

```css
background-image: url(bg1.png),url(bg.png);
background-repeat: no-repeat;
padding: 40px;
background-clip: content-box;
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/2.png)

### 组合设置

可以使用一条指令设置背景

```css
background: url(bg1.png) no-repeat content-box fixed;
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/syntax.gif)

## 盒子阴影

可以使用 `box-shadow` 对盒子元素设置阴影，参数为 `水平偏移,垂直偏移,模糊度,颜色` 构成。

```css
box-shadow: 10px 10px 5px rgba(100, 100, 100, .5);
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/3.png)

## 颜色渐变

### 线性渐变

激变一般用在背景颜色中使用（默认渐变角度是从上向下）

```css
background: linear-gradient(red, green);
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/4.png)

渐变角度

```css
background: linear-gradient(30deg, red, green);
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/5.png)

向右渐变

```css
background: linear-gradient(to right, red, green)
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/6.png)

向左渐变

```css
background: linear-gradient(to left, red, green);
```

左上渐变

```css
background: linear-gradient(to top left, red, green);
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/7.png)

右下渐变

```css
background: linear-gradient(to right bottom, red, green);
```

设置多个颜色

```css
background: linear-gradient(red, rgb(0, 0, 200), green, rgba(122, 211, 100, 0));
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/8.png)

### 径向渐变

设置渐变

```css
background: radial-gradient(red, blue, green);
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/9.png)

设置渐变宽度与高度

```css
background: radial-gradient(100px 200px, red, blue, green);
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/10.png)

左下渐变

```css
background: radial-gradient(at bottom left, red, blue);
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/11.png)

右下渐变

```css
background: radial-gradient(at bottom right, red, blue);
```

左侧向中心渐变

```css
background: radial-gradient(at center left, red, blue);
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/12.png)

底部向中心渐变

```css
background: radial-gradient(at 50% 100%, red, blue);
```

### 标识位

颜色未指定标识时，颜色会平均分布。

红色与蓝色在50%和60%间发生激变.

```css
background: linear-gradient(45deg, red 50%, blue 60%);
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/13.png)

标识位相同时将没有过渡效果

```css
background: linear-gradient(45deg, red 50%, blue 50%, blue);
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/14.png)

径向标识位绘制小太阳

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/15.png)

```css
width: 150px;
height: 150px;
background: radial-gradient(red 0, yellow 30%, black 60%, black 100%);
```

通过在两个颜色间中间点定义过渡位置

```css
background: linear-gradient(45deg, red, 30%, blue);
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/16.png)

### 渐变重复 💡

下例定义从0到50px为蓝色,50px到100px的黄色，并进行重复后产生渐变的进度条。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/17.png)

```css
background: repeating-linear-gradient(90deg, blue, blue 50px,yellow 50px,yellow 100px);
```

### 径向重复

```css
width: 200px;
height: 200px;
background: repeating-radial-gradient(100px 100px, red 0%, yellow 40%, black 60%, black 200%);
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/css/bg/18.png)