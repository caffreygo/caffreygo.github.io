# 定位布局

## 基础知识

📗 定位的基本思想很简单，它允许你定义元素框相对于其正常位置应该出现的位置，或者相对于父元素、另一个元素甚至浏览器窗口本身的位置。

### 定位类型

| 选项     | 说明                 |
| -------- | -------------------- |
| static   | 默认行为，参考文档流 |
| relative | 相对定位             |
| absolute | 绝对定位             |
| fixed    | 固定定位             |
| sticky   | 粘性定位             |

### 位置偏移

可以为部分类型的定位元素设置`上、下、左、右` 的位置偏移。

| 选项   | 说明     |
| ------ | -------- |
| top    | 距离顶边 |
| bottom | 距离下边 |
| left   | 距离左部 |
| right  | 距离右边 |

👾 元素直接设置`absolute`定位是相对于文档的：

![](./img/position/1.png)

```html
<style>
    body {
        padding: 50px;
    }

    article {
        width: 300px;
        height: 200px;
        border: solid 6px blueviolet;
        margin: 20px;
    }

    div {
        font-size: 25px;
        background: #f2a67d;
        padding: 10px;
        position: absolute;
        top: 0;
    }
</style>

<article>
    <div>content</div>
</article>
```

👾 使用百分比单位时使用的是父级尺寸，比如下面的示例`left:100%`会定位到最右边

![](./img/position/2.png)

```html
<style>
    main {
        width: 200px;
        height: 200px;
        background: #1abc9c;
        position: relative;
    }

    main div {
        box-sizing: border-box;
        width: 200px;
        height: 200px;
        background-color: #f1c40f;
        background-clip: content-box;
        border: solid 1px #333;
        color: white;
        font-size: 2em;
        position: absolute;
        left: 100%;
    }
</style>

<main>
    <div>content</div>
</main>
```



## 相对定位

👾 `relative`相对定位是相对于元素**原来的位置**控制，当元素发生位置偏移时，原位置留白。

![](./img/position/3.png)

```html
<style>
    body {
        padding: 50px;
    }
    article {
        width: 400px;
        height: 200px;
        border: solid 10px blueviolet;
        font-size: 14px;
        padding: 30px;
    }
    article img {
        width: 50px;
        position: relative;
        top: -20px;
    }

</style>

<article>
    <img src="item.png" alt="">
    泉州市。市境西南接厦门市、漳州市，西界龙岩市，北邻三明市，东北达福州市、莆田市，东隔台湾海峡与台湾相望。地处闽东南沿海丘陵平原区，地势西北高，东南低，西北部为戴云山。晋江东溪和西溪于南安市双溪口汇合，往东流贯市区，注入泉州湾。全市总面积11,287平方公里，人口878.23万，市人民政府驻丰泽区东海街道。泉州是闽东南沿海政治、经济、文化和交通中心，首批国家历史文化名城，古代海上丝绸之路的起点，联合国教科文组织设立的世界多元文化展示中心，世界宗教博物馆，中国首届东亚文化之都，全国文明城市，国家卫生城市。
</article>
```

## 绝对定位

👾  绝对定义不受文档流影响，就像漂浮在页面中的精灵，绝对定位元素拥有行内块特性。

### 参照元素

如果父级元素设置了 `relative | fixed | sticky` ，绝对定位子元素将参数此父元素进行定位。

![](./img/position/4.png)

```html
<style>
    body {
        padding: 50px;
    }

    article {
        width: 400px;
        height: 100px;
        border: solid 6px blueviolet;
        position: relative;
    }

    div {
        font-size: 25px;
        background: #f2a67d;
        padding: 10px;
        position: absolute;
        top: 0;
        left: 0px;
    }
</style>

<article>
    <div>content</div>
</article>
```

### 默认位置 💡

💡 如果没有为定位元素设置偏移，将受父元素的padding等属性影响（content-box）。但使用定位一般都会设置偏移位置。

![](./img/position/1.gif)

```css
body {
    padding: 50px;
}

article {
    width: 400px;
    height: 100px;
    border: solid 6px blueviolet;
    position: relative;
    padding: 20px;
}

div {
    background: #f2a67d;
    padding: 5px;
    position: absolute;
    top: 50px;
    left: 50px;
}
```

### 设置尺寸

📗 在没用设置定位元素的宽高时，可以通过定位的偏移值设置元素的尺寸。

以下如果我们设置了div的宽高，那么`right: 0; bottom: 0;`就是不生效的；而现在它会依据这个设置得到尺寸是宽高一半一半。

![](./img/position/5.png)

```html
<style>
    body {
        padding: 50px;
    }
    article {
        width: 400px;
        height: 100px;
        border: solid 6px blueviolet;
        position: relative;
    }
    div {
        font-size: 25px;
        background: #f2a67d;
        padding: 10px;
        position: absolute;
        top: 50%;
        left: 50%;
        right: 0;
        bottom: 0;
    }
</style>
```

### 居中定位

通过将 `left` 设置为50% ,并向左偏移子元素宽度一半可以实现水平居中，垂直居中使用方式类似。

![](./img/position/6.png)

### 滚动行为 💡

💡 固定定位元素会随滚动条发生滚动。

![](./img/position/2.gif)

```html
<style>
    body {
        padding: 50px;
    }
    main {
        width: 300px;
        height: 200px;
        border: solid 10px blueviolet;
        position: relative;
        overflow: scroll;
    }
    main article {
        height: 600px;
    }
    main article div {
        width: 200px;
        height: 200px;
        position: absolute;
    }
    main article div:nth-of-type(1) {
        background: red;
        left: 0px;
        z-index: 2;
    }
</style>

<main>
    <article>
        <div></div>
    </article>
</main>
```

## 纵向重叠 👾

📗  `z-index`属性目前只有在`position:relative`、`position:absolute`和`position:fixed`参与的情况下才有作用，表示层级，类似photoshop中层级的概念。现在z-index对于flex容器的子元素也会生效。

📗 `absolute`是一个能够独当一面的属性，其使用可以不要`relative`，当然，也可以不使用`z-index`。在默认情况下，元素应用了非`static`的`position`属性后，**其就会有一个隐晦的层级**，**会居于普通元素之上**，无需额外设置z-index属性值。（当一个元素设置了定位之后，这个元素便理论上可以放到页面的任何位置，这个元素当然也可以盖到其它元素上面，这时候就出现了层级的关系）

::: tip z-index

- 如果元素重叠在一起，可以使用 z-index 控制元素的上下层级，数值越大越在上面。（正负都可以）

- 父级子元素设置 z-index 没有意义，子元素永远在父元素上 面的。

::: 



![](./img/position/7.png)

### 层级改变

![](./img/position/3.gif)

```html
<style>
    body {
        padding: 50px;
    }

    article {
        width: 200px;
        height: 200px;
        border: solid 10px blueviolet;
        position: relative;
        cursor: pointer;
    }

    /* hover时提升第二个div的z-index */
    article:hover div:nth-of-type(2) {
        z-index: 2;
    }

    article div {
        width: 200px;
        height: 200px;
        position: absolute;
    }

    /* 默认情况下将第一个div的index增高，将会覆盖第二个 */
    article div:nth-of-type(1) {
        background: red;
        left: 0px;
        z-index: 2;
    }

    article div:nth-of-type(2) {
        background: green;
        left: 50px;
        top: 50px;
    }
</style>

<article>
    <div></div>
    <div></div>
</article>
```

*两个div子元素都是绝对定位，可以任意设置层级*

### 购物车

固定显示区域的层级要高于hover显示之后的层级，从而在hover状态下 `我的购物车` 的下边线能够遮住下面的元素。

👾 为了让 `我的购物车` 的z-index生效，必须设置元素的定位属性：`position: relative`。

![](./img/position/4.gif)

```html
<style>
    * {
        padding: 0;
        margin: 0;
    }
    main {
        width: 600px;
        padding: 100px;
        margin: 0 auto;
    }
    main article {
        width: 150px;
        position: relative;
        cursor: pointer;
        font-size: 14px;
        color: #555;
    }
    main article:hover div:nth-of-type(1) {
        border-bottom: none;
    }
    main article:hover div:nth-of-type(2) {
        display: block;
    }
    main article div {
        box-sizing: border-box;
        height: 50px;
        line-height: 3.5em;
        text-align: center;
        border: solid 2px blueviolet;
        background: white;
    }
    main article div:nth-of-type(1) {
        /* 这是必要的！ */
        position: relative;
        z-index: 2;
    }
    main article div:nth-of-type(2) {
        display: none;
        position: absolute;
        right: 0;
        top: 48px;
        left: -150px;
        z-index: 1;
    }
</style>

<main>
    <article>
        <div>我的购物车</div>
        <div>购物车中暂无产品</div>
    </article>
</main>
```

## 固定定位

📗 元素相对于页面固定定位在某个位置，固定定位元素不会在滚动时改变位置 ，使用`position: fixed` 产生固定定位。

![](./img/position/5.gif)

```html
<style>
    header {
        height: 60px;
        border-bottom: solid 5px #7f35c9;
        box-shadow: 0 5px 8px rgba(100, 100, 100, 0.6);
        position: fixed;
        top: 0px;
        left: 0px;
        right: 0px;
    }
    article {
        height: 3000px;
        margin-top: 80px;
        background: #f3f3f3;
        border: solid 5px #ddd;
    }
</style>

<header></header>
<article></article>
```

## 粘性定位

### 同级定位

粘性定位如果是同级的，上面的元素并不会被顶走，会一直**叠加**堆接在一起。

![](./img/position/6.gif)

```html
<style>
    * {
        padding: 0;
        margin: 0;
    }

    main {
        padding: 30px;
        font-size: 14px;
    }

    main article {
        width: 400px;
        height: 100px;
        border: solid 5px blueviolet;
        overflow: scroll;
    }

    main article h2 {
        background: #db1f77;
        color: white;
        text-indent: 20px;
        position: sticky;
        top: 0;
    }

    main article h2:nth-of-type(1) {
        background: blueviolet;
    }

    main article section {
        height: 300px;
    }
</style>

<main>
    <article>
        <section></section>
        <h2>HHH</h2>
        <section></section>
        <h2>TTT</h2>
        <section></section>
    </article>
</main>
```

### 非同级定位

不属于同一个父元素设置粘性定位时，后面的元素**挤掉**原来位置的元素如下例。

![](./img/position/7.gif)

```html
<style>
    * {
        padding: 0;
        margin: 0;
    }

    main {
        padding: 30px;
        font-size: 14px;
    }

    main article {
        width: 400px;
        border: solid 5px blueviolet;
        height: 200px;
        overflow: scroll;
    }

    main article section:nth-of-type(odd) h2 {
        background: blueviolet;
    }

    main article section h2 {
        background: #db1f77;
        color: white;
        text-indent: 20px;
        position: sticky;
        top: 0;
    }

    main article section p {
        padding: 20px;
    }
</style>

<main>
    <article>
        <section>
            <h2>简介</h2>
            <p>
                泉州市（闽南语：泉州市，白話字：Choân-chiu-chhǐ，臺羅：Tsuân-tsiu-tshǐ，閩拼：Zuánziū-cî，國際音標：/tsuan˨˨ ʨiu˧˧ ʨʰi˧˧/），简称泉、鲤，泉州府城又称刺桐城（Zaytun：زيتون或Chidun：ᠴᠢᠳᠤᠨ，在阿拉伯語、蒙古語意為橄欖）、温陵、清源，是中華人民共和國福建省下辖的地级市，位于福建省中南部沿海。市境西南接厦门市、漳州市，西界龙岩市，北邻三明市，东北达福州市、莆田市，东隔台湾海峡与台湾相望。地处闽东南沿海丘陵平原区，地势西北高，东南低，西北部为戴云山。晋江东溪和西溪于南安市双溪口汇合，往东流贯市区，注入泉州湾。全市总面积11,287平方公里，人口878.23万，市人民政府驻丰泽区东海街道。泉州是闽东南沿海政治、经济、文化和交通中心，首批国家历史文化名城，古代海上絲綢之路的起点，联合国教科文组织设立的世界多元文化展示中心，世界宗教博物馆，中国首届东亚文化之都，全国文明城市，国家卫生城市。
            </p>
        </section>
        <section>
            <h2>经济</h2>
            <p>
                泉州是闻名海内外的国际花园城市，中国三大金融综合改革试验区之一，海峡西岸经济区五大中心城市之一，经济总量连续22年居福建省首位[3]。2017年城市综合经济竞争力位列中国第28位。[4]泉州是中国著名的侨乡籍貫地，同时泉州也是闽南文化的发源地与发祥地，闽南文化保护的核心区与富集区，历史文化深厚、名胜古迹众多，有“海滨邹鲁”、“光明之城”的美誉。
            </p>
        </section>
        <section>
            <h2>文化</h2>
            <p>
                泉州文化生活丰富，并拥有大量国家级非物质文化遗产。如南音、泉州北管、泉州拍胸舞、梨园戏、高甲戏（柯派）、泉州提线木偶戏、晋江布袋木偶戏、惠安石雕、泉州花灯、德化瓷烧制技艺、惠安女服饰、打城戏、五祖拳、水密隔舱福船制造技艺、乌龙茶制作技艺（铁观音制作技艺）、闽南传统民居营造技艺、灵源万应茶、南安英都拔拔灯、蟳埔女习俗、泉州（李尧宝）刻纸、木偶头雕刻（江加走木偶头雕刻）、安海嗦啰嗹习俗、安海抓鸭等。
            </p>
        </section>
    </article>
</main>
```