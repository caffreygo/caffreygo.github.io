# 链接与图片

## 图片处理

### 图像格式

- 网络带宽成本很高，图片处理在保证用户体验好的前提下，文件尺寸也要尽可能小
- 图片属性静态文件，不要放在WEB服务器上，而放在云储存服务器上并使用CDN加速
- 以JPEG类型优先使用，文件尺寸更小
- 小图片使用PNG，清晰度更高，因为文件尺寸小，文件也不会太大
- 网页图标建议使用css字体构建如 [iconfont (opens new window)](https://www.iconfont.cn/)或 [fontawesome(opens new window)](https://fontawesome.com/icons?d=gallery)

| 格式 | 说明                                                         | 透明 |
| ---- | ------------------------------------------------------------ | ---- |
| PNG  | 无损压缩格式，适合图标、验证码等。有些小图标建议使用css字体构建。 | 支持 |
| GIF  | 256色，可以产生动画效果（即GIF动图）                         | 支持 |
| JPEG | 有损压缩的类型，如商品、文章的图片展示                       |      |

💡 使用`png` 类型，图片清晰，同时有透明色，当页面底色改变时也不需要修改图片。

💡 大图使用`jpeg` ，因为图片比较大使用png会造成文件过大，使用`jpeg`后尺寸不大而且清晰度也可以接受。

### 使用图片

在网页中使用 `img` 标签展示图片，图片的大小、边框、倒角效果使用css处理。

```html
<img src="test.png" alt="图片"/>
```

| 属性 | 说明                     |
| ---- | ------------------------ |
| src  | 图片地址                 |
| alt  | 图像打开异常时的替代文本 |

## 网页链接

📗 不能通过一个页面展示网站的所有功能，需要在不同页面中跳转，这就是链接所起到的功能。

```html
<a href="http://doc.googlr.com" target="_blank" title="文档库">google文档库</a>
```

| 选项   | 说明                                 |
| ------ | ------------------------------------ |
| href   | 跳转地址                             |
| target | _blank 新窗口打开 _self 当前窗口打开 |
| title  | 链接提示文本                         |

### 打开窗口

下面设置 target 属性在指定窗口打开。(从已有的google窗口中打开)

```html
<a href="https://www.baidu.com" target="google">
    在IFRAME中打开
</a>
<script>
    window.open('https://www.google.com', 'google');
</script>
```

### 锚点链接

📗 锚点`#`可以设置跳转到页面中的某个部分。

1. 为元素添加`id` 属性来设置锚点

2. 设置 `a` 标签的 `href` 属性

3. ```html
   <a href="#comment-1">跳转到评论区</a>
   <div style="height: 1000px;"></div>
   
   <div id="comment-1" style="background: green;">
       这是评论内容区
   </div>
   ```

4. 也可以跳转到不同页面的锚点

   ```html
   <a href="article.html#comment-1">跳转到评论区</a>
   ```

### 邮箱链接

📗 除了页面跳转外可以指定其他链接。使用以下方式也有缺点，邮箱可能会被恶意用户采集到，所以有些用户使用 `test#qq.com` 然后提示用户 `请将#改为@后发邮件`的提示形式。

```html
<a href="mailto:1106894094@qq.com">给后盾人发送邮件</a>
```

### 拨打电话

点击以下链接后，手机会询问用户是否拨打电话。

```html
<a href="tel:99999999999">联系客服</a>
```

### 下载文件

📗 默认情况下使用链接可以**下载**浏览器无法处理的文件，如果下载图片需要后台语言告之浏览器`mime`类型。

```html
<a href="https://www.test.com/202005072207.zip">下载压缩包</a>
```