# webpack打包配置

## 什么是loader？

::: tip 概念

`loader`是一种打包规则，它告诉了 Webpack 在遇到非`.js`文件时，应该如何处理这些文件

`loader`有如下几种固定的运用规则：

- 使用`test`正则来匹配相应的文件
- 使用`use`来添加文件对应的`loader`
- 对于多个`loader`而言，从 **右到左** 依次调用

:::

## 使用loader打包图片

### 1.安装依赖

打包图片需要用到`file-loader`或者`url-loader`，需使用`npm install`进行安装

一点小改动:

在打包图片之前，让我们把`index.html`移动到上一节打包后的`dist`目录下，`index.html`中相应的`.js`引入也需要修改一下，像下面这样

```html
<script src="./main.js"></script>
```

### 2.添加打包图片规则

对于打包图片，我们需要在`webpack.config.js`中进行相应的配置，它可以像下面这样

```js
// path为Node的核心模块
const path = require('path');

module.exports = {
  // 其它配置
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'file-loader'
        }
      }
    ]
  }
}
```

### 3.改写`index.js`

```js
import avatar from './avatar.jpg'

var root = document.getElementById('root');
var img = document.createElement('img');
img.src = avatar
root.appendChild(img)
```

### 4.打包结果

打包后的项目目录

```sh
|-- dist
|   |-- bd7a45571e4b5ccb8e7c33b7ce27070a.jpg
|   |-- main.js
|   |-- index.html
|-- index.js
|-- avatar.jpg
|-- package.json
|-- webpack.config.js
```

![打包结果](./img/step-3-1.png)

### 运用占位符

在以上打包图片的过程中，我们发现打包生成的图片好像名字是一串乱码，如果我们要原样输出原图片的名字的话，又该如何进行配置呢？这个问题，可以使用 **占位符** 进行解决。

占位符说明

文件占位符它有一些固定的规则，像下面这样：

- `[name]`代表原本文件的名字
- `[ext]`代表原本文件的后缀
- `[hash]`代表一个`md5`的唯一编码

根据占位符的规则再次改写`webpack.config.js`文件，

```js
// path为Node的核心模块
const path = require('path');

module.exports = {
  // 其它配置
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name]_[hash].[ext]'
          }
        }
      }
    ]
  }
}
```

根据上面占位符的运用，打包生成的图片，它的名字如下

```sh
|-- dist
|   |-- avatar_bd7a45571e4b5ccb8e7c33b7ce27070a.jpg
```

## 使用loader打包CSS

::: tip 打包说明

样式文件分为几种情况，每一种都需要不同的`loader`来处理：

1. 普通`.css`文件，使用`style-loader`和`css-loader`来处理
2. `.less`文件，使用`less-loader`来处理
3. `.sass或者.scss`文件，需要使用`sass-loader`来处理
4. `.styl`文件，需要使用`stylus-loader`来处理

:::

### 打包css文件

安装依赖

首先安装`style-loader`和`css-loader`

改写webpack配置文件：

```js
// path为Node的核心模块
const path = require('path');

module.exports = {
  // 其它配置
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name]_[hash].[ext]'
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
```

根目录下创建`index.css`

```css
.avatar{
  width: 150px;
  height: 150px;
}
```

改写`index.js`文件

```js
import avatar from './avatar.jpg';
import './index.css';

var root = document.getElementById('root');
var img = new Image();
img.src = avatar;
img.classList.add('avatar');
root.appendChild(img);
```

### **打包结果**

![css打包结果](./img/step-3-2.png)

### 打包Sass文件

安装依赖

需要安装`sass-loader`和`node-sass`

改写`webpack.config.js`文件

```js
// path为Node的核心模块
const path = require('path');

module.exports = {
  // 其它配置
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name]_[hash].[ext]'
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(sass|scss)$/,
        use: ['style-loader','css-loader','sass-loader']
      }
    ]
  }
}
```

根目录下添加`index-sass.sass`文件

```scss
body{
  .avatar-sass{
    width: 150px;
    height: 150px;
  }
}
```

改写`index.js`

```js
import avatar from './avatar.jpg';
import './index.css';
import './index-sass.sass';

var img = new Image();
img.src = avatar;
img.classList.add('avatar-sass');

var root = document.getElementById('root');
root.appendChild(img);
```

根据上面的配置和代码改写后，再次打包，打包的结果会是下面这个样子

![打包结果](./img/step-3-3.png)

### 自动添加CSS厂商前缀

当我们在`css`文件中写一些需要处理兼容性的样式的时候，需要我们分别对于不同的浏览器书添加不同的厂商前缀，使用`postcss-loader`可以帮我们在`webpack`打包的时候自动添加这些厂商前缀。

安装依赖

自动添加厂商前缀需要`npm install`安装`postcss-loader`和`autoprefixer`

```sh
npm install postcss-loader autoprefixer -D
```

修改`index-sass.sass`

```css
.avatar-sass {
  width: 150px;
  height: 150px;
  transform: translate(50px,50px);
}
```

在修改`sass`文件代码后，我们需要对`webpack.config.js`

 

```json
// path为Node的核心模块
const path = require('path');

module.exports = {
  // 其它配置
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name]_[hash].[ext]'
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(sass|scss)$/,
        use: ['style-loader','css-loader','sass-loader','postcss-loader']
      }
    ]
  }
}
```

根目录下添加`postcss.config.js`，并添加代码

```js
module.exports = {
  plugins: [require('autoprefixer')]
}
```

根据上面的配置，我们再次打包运行，在浏览器中运行`index.html`，它的结果如下图所示

![打包运行结果](./img/step-3-4.png)

### 模块化打包CSS文件

概念

`CSS`的模块化打包的理解是：除非我主动引用你的样式，否则你打包的样式不能影响到我。

根目录下添加`createAvatar.js`文件，并填写下面这段代码

```js
import avatar from './avatar.jpg';
export default function CreateAvatar() {
  var img = new Image();
  img.src = avatar;
  img.classList.add('avatar-sass');

  var root = document.getElementById('root');
  root.appendChild(img);
}
```

改写`index.js`，引入`createAvatar.js`并调用

```js
import avatar from './avatar.jpg';
import createAvatar from './createAvatar';
import './index.css';
import './index-sass.sass';

createAvatar();

var img = new Image();
img.src = avatar;
img.classList.add('avatar-sass');

var root = document.getElementById('root');
root.appendChild(img);
```

**打包运行**

![打包运行](./img/step-3-5.png)

我们可以看到，在`createAvatar.js`中，我们写的`img`标签的样式，它受`index-sass.sass`样式文件的影响，如果要消除这种影响，需要我们开启对`css`样式文件的模块化打包。

进一步改写`webpack.config.js`

```js
// path为Node的核心模块
const path = require('path');

module.exports = {
  // 其它配置
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name]_[hash].[ext]'
          }
        }
      },
      {
        test: /\.(sass|scss)$/,
        use: ['style-loader', {
          loader: 'css-loader',
          options: {
            modules: true
          }
        }, 'sass-loader', 'postcss-loader']
      }
    ]
  }
}
```

开启`css`模块化打包后，我们需要在`index.js`中做一点小小的改动，像下面这样子

```js
import avatar from './avatar.jpg';
import createAvatar from './createAvatar';
import './index.css';
import style from  './index-sass.sass';

createAvatar();

var img = new Image();
img.src = avatar;
img.classList.add(style['avatar-sass']);

var root = document.getElementById('root');
root.appendChild(img);
```

打包运行后，我们发现使用`createAvatar.js`创建出来的`img`没有受到样式文件的影响，证明我们的`css`模块化配置已经生效，下图是`css`模块化打包的结果：

<img src="./img/step-3-6.png" alt="打包结果" style="zoom:50%;" />



## 使用WebpackPlugin

::: tip 理解

`plugin`的理解是：当 Webpack 运行到某一个阶段时，可以使用`plugin`来帮我们做一些事情。

在使用`plugin`之前，我们先来改造一下我们的代码，首先删掉无用的文件，随后在根目录下新建一个`src`文件夹，并把`index.js`移动到`src`文件夹下，移动后你的目录看起来应该是下面这样子的

:::

```js
|-- dist
|   |-- index.html
|-- src
|   |-- index.js
|-- postcss.config.js
|-- webpack.config.js
|-- package.json
```

接下来再来处理一下`index.js`文件的代码，写成下面这样

```js
// src/index.js
var root = document.getElementById('root');
var dom = document.createElement('div');
dom.innerHTML = 'hello,world';
root.appendChild(dom);
```

最后我们来处理一下我们的`webpack.config.js`文件，它的改动有下面这些

- 因为`index.js`文件的位置变动了，我们需要改动一下`entry`
- 删除掉我们配置的所有`loader`规则 按照上面的改动后，`webpack.config.js`中的代码看起来是下面这样的

```js
const path = require('path');
module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname,'dist')
  }
}
```

### html-webpack-plugin

::: tip 说明

`html-webpack-plugin`可以让我们使用固定的模板，在每次打包的时候 **自动生成** 一个`index.html`文件，并且它会 **自动** 帮我们引入我们打包后的`.js`文件

:::

使用如下命令安装`html-webpack-plugin`

```sh
$ npm install html-webpack-plugin -D
```

在`src`目录下创建`index.html`模板文件，它的代码可以写成下面这样子

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Html 模板</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

因为我们要使用`html-webpack-plugin`插件，所以我们需要再次改写`webpack.config.js`文件(具体改动部分见高亮部分)

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname,'dist')
  }
}
```

在完成上面的配置后，我们使用`npm run bundle`命令来打包一下测试一下，在打包完毕后，我们能在`dist`目录下面，看到`index.html`中的代码变成下面这样子

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>HTML模板</title>
</head>
<body>
  <div id="root"></div>
  <script type="text/javascript" src="main.js"></script>
</body>
</html>
```

我们发现，以上`index.html`的结构，正是我们在`src`目录下`index.html`模板的结构，并且还能发现，在打包完成后，还自动帮我们引入了打包输出的`.js`文件，这正是`html-webpack-plugin`的基本功能，当然它还有其它更多的功能，我们将在后面进行详细的说明。

### clean-webpack-plugin

::: tip 理解

`clean-webpack-plugin`的理解是：它能帮我们在打包之前 **自动删除** `dist`打包目录及其目录下所有文件，不用我们手动进行删除。

:::

我们使用如下命令来安装`clean-webpack-plugin`

```sh
$ npm install clean-webpack-plugin -D
```

安装完毕以后，我们同样需要在`webpack.config.js`中进行配置(改动部分参考高亮代码块)

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new CleanWebpackPlugin()
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname,'dist')
  }
}
```

在完成以上配置后，我们使用`npm run bundle`打包命令进行打包，它的打包结果请自行在你的项目下观看自动清理`dist`目录的实时效果。

在使用`WebpackPlugin`小节，我们只介绍了两种常用的`plugin`，更多`plugin`的用法我们将在后续进行学习，你也可以点击[Webpack Plugins](https://webpack.js.org/plugins)来学习更多官网推荐的`plugin`用法。

## Entry和Output

### 多个入口文件

在我们之前的所有`entry`配置中，仅仅只有一个入口文件，假设现在我们有这样一个需求：需要把`index.js`打包两遍，一个叫`main.js`，另外一个叫`sub.js`，那么我们应该在`entry`进行如下的配置：

```js
const path = require('path');
module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
    sub: './src/index.js'
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname,'dist')
  }
}
```

**注意**：如果我们仅仅只是调整了`entry`配置，没有进行`output`配置修改的话，则会打包错误。原因是`output`打包后的文件都叫`main.js`，但我们`entry`却有两个入口文件，因此会造成错误，所以我们同样需要对`output`配置进行修改：

```js
const path = require('path');
module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
    sub: './src/index.js'
  },
  output: {
    // 使用[name]占位符，打包结果为main.js，sub.js
    filename: '[name].js',
    path: path.resolve(__dirname,'dist')
  }
}
```

进行如上配置后，`dist/index.html`文件中`js`的引用如下：

```html
<script type="text/javascript" src="main.js"></script>
<script type="text/javascript" src="sub.js"></script>
```

### CDN引用

在打包后，把静态资源发布到`CDN`是一种常见的提高网页性能的手段，正如你在上面所看到的的那样，我们现在的打包方式并不能实现`CDN`引用，需要我们进行如下的配置：

```js
const path = require('path');
module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
    sub: './src/index.js'
  },
  output: {
    // 假设一个CDN地址
    publicPath: 'www.cdn.com/wangtunan',
    // 使用[name]占位符，打包结果为main.js，sub.js
    filename: '[name].js',
    path: path.resolve(__dirname,'dist')
  }
}
```

在上面的配置完毕，我们打包后`dist/index.html`的`js`引用效果如下：

```html
<script type="text/javascript" src="www.cdn.com/wangtunan/main.js"></script>
<script type="text/javascript" src="www.cdn.com/wangtunan/sub.js"></script>
```

## 配置SourceMap

理解

`source-map`的理解：它是一种映射关系，它映射了打包后的代码和源代码之间的对应关系，一般通过`devtool`来配置。

以下是官方提供的`devtool`各个属性的解释以及打包速度对比图：

![devtool](https://wangtunan.github.io/blog/assets/img/16.495d7697.png)

通过上图我们可以看出，良好的`source-map`配置不仅能帮助我们提高打包速度，同时在代码维护和调错方面也能有很大的帮助，一般来说，`source-map`的最佳实践是下面这样的：

- 开发环境下`development`：推荐将`devtool`设置成`cheap-module-eval-source-map`
- 生产环境下`production`：推荐将`devtool`设置成`cheap-module-source-map`

## 使用WebpackDevServer

::: tip 理解

`webpack-dev-server`的理解：它能帮助我们在源代码更改的情况下，**自动** 帮我们打包我们的代码并 **启动** 一个小型的服务器。如果与热更新一起使用，它能帮助我们高效的开发。

:::

自动打包的方案，通常来说有如下几种：

- `watch`参数自动打包：它是在打包命令后面跟了一个`--watch`参数，它虽然能帮我们自动打包，但我们任然需要手动刷新浏览器，同时它不能帮我们在本地启动一个小型服务器，一些`http`请求不能通过。
- `webpack-dev-server`插件打包(推荐)：它是我们推荐的一种自动打包方案，在开发环境下使用尤其能帮我们高效的开发，它能解决`watch`参数打包中的问题，如果我们与热更新`HMR`一起使用，我们将拥有非常良好的开发体验。

### watch参数自动打包

使用`watch`参数进行打包，我们需要在`package.json`中新增一个`watch`打包命令，它的配置如下

```json
{
  // 其它配置
  "scripts": {
    "bundle": "webpack",
    "watch": "webpack --watch"
  }
}
```

在配置好上面的打包命令后，我们使用`npm run watch`命令进行打包，然后在浏览器中运行`dist`目录下的`index.html`，运行后，我们尝试修改`src/index.js`中的代码，例如把`hello,world`改成`hello,dell-lee`，改动完毕后，我们刷新一下浏览器，会发现浏览器成功输出`hello,dell-lee`，这也证明了`watch`参数确实能自动帮我们进行打包。

### webpack-dev-server打包

要使用`webpack-dev-server`，我们需要使用如下命令进行安装

```sh
$ npm install webpack-dev-server -D
```

安装完毕后，我们和`watch`参数配置打包命令一样，也需要新增一个打包命令，在`package.json`中做如下改动：

```json
// 其它配置
  "scripts": {
    "bundle": "webpack",
    "watch": "webpack --watch",
    "dev": "webpack-dev-server"
  }
```

配置完打包命令后，我们最后需要对`webpack.config.js`做一下处理：

```js
module.exports = {
  // 其它配置
  devServer: {
    // 以dist为基础启动一个服务器，服务器运行在4200端口上，每次启动时自动打开浏览器
    contentBase: 'dist',
    open: true,
    port: 4200
  }
}
```

在以上都配置完毕后，我们使用`npm run dev`命令进行打包，它会自动帮我们打开浏览器，现在你可以在`src/index.js`修改代码，再在浏览器中查看效果，它会有惊喜的哦，ღ( ´･ᴗ･` )比心

这一小节主要介绍了如何让工具自动帮我们打包，下一节我们将学习模块热更新(HMR)。

## 模块热更新(HMR)

::: tip 理解

模块热更新(HMR)的理解：它能够让我们在不刷新浏览器(或自动刷新)的前提下，在运行时帮我们更新最新的代码。

:::

模块热更新(HMR)已内置到 Webpack ,我们只需要在`webpack.config.js`中像下面这样简单的配置即可，无需安装别的东西。

```js
const webpack = require('webpack');
module.exports = {
  // 其它配置
  devServer: {
    contentBase: 'dist',
    open: true,
    port: 3000,
    hot: true,    // 启用模块热更新
    hotOnly: true // 模块热更新启动失败时，不重新刷新浏览器
  },
  plugins: [
    // 其它插件
    new webpack.HotModuleReplacementPlugin()
  ]
}
```

在模块热更新(HMR)配置完毕后，我们现在来想一下，什么样的代码是我们希望能够热更新的，我们发现大多数情况下，我们似乎只需要关心两部分内容：`CSS`文件和`.js`文件，根据这两部分，我们将分别来进行介绍。

### CSS中的模块热更新

首先我们在`src`目录下新建一个`style.css`样式文件，它的代码可以这样下：

```css
div:nth-of-type(odd) {
  background-color: yellow;
}
```

随后我们改写一下`src`目录下的`index.js`中的代码，像下面这样子：

```js
import './style.css';

var btn = document.createElement('button');
btn.innerHTML = '新增';
document.body.appendChild(btn);

btn.onclick = function() {
  var dom = document.createElement('div');
  dom.innerHTML = 'item';
  document.body.appendChild(dom);
}
```

由于我们需要处理`CSS`文件，所以我们需要保留处理`CSS`文件的`loader`规则，像下面这样

```js
module.exports = {
  // 其它配置
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
```

在以上代码添加和配置完毕后，我们使用`npm run dev`进行打包，我们点击按钮后，它会出现如下的情况

![打包结果](./img/1110.png)

**理解**： 由于`item`是动态生成的，当我们要将`yellow`颜色改变成`red`时，模块热更新能帮我们在不刷新浏览器的情况下，替换掉样式的内容。直白来说：自动生成的`item`依然存在，只是颜色变了。

### 在js中的模块热更新

在介绍完`CSS`中的模块热更新后，我们接下来介绍在`js`中的模块热更新。

首先，我们在`src`目录下创建两个`.js`文件，分别叫`counter.js`和`number.js`，它的代码可以写成下面这样：

```js
// counter.js代码
export default function counter() {
  var dom = document.createElement('div');
  dom.setAttribute('id', 'counter');
  dom.innerHTML = 1;
  dom.onclick = function() {
    dom.innerHTML = parseInt(dom.innerHTML,10)+1;
  }
  document.body.appendChild(dom);
}
```

`number.js`中的代码是下面这样的：

```js
// number.js代码
export default function number() {
  var dom = document.createElement('div');
  dom.setAttribute('id','number');
  dom.innerHTML = '1000';
  document.body.appendChild(dom);
}
```

添加完以上两个`.js`文件后，我们再来对`index.js`文件做一下小小的改动：

```js
// index.js代码
import counter from './counter';
import number from './number';
counter();
number();
```

在以上都改动完毕后，我们使用`npm run dev`进行打包，在页面上点击数字`1`，让它不断的累计到你喜欢的一个数值(记住这个数值)，这个时候我们再去修改`number.js`中的代码，将`1000`修改为`3000`，也就是下面这样修改：

```js
// number.js代码
export default function number() {
  var dom = document.createElement('div');
  dom.setAttribute('id','number');
  dom.innerHTML = '3000';
  document.body.appendChild(dom);
}
```

我们发现，虽然`1000`成功变成了`3000`，但我们累计的数值却重置到了`1`，这个时候你可能会问，我们不是配置了模块热更新了吗，为什么不像`CSS`一样，直接替换即可？

**回答**：这是因为`CSS`文件，我们是使用了`loader`来进行处理，有些`loader`已经帮我们写好了模块热更新的代码，我们直接使用即可(类似的还有`.vue`文件，`vue-loader`也帮我们处理好了模块热更新)。而对于`js`代码，还需要我们写一点点额外的代码，像下面这样子：

```js
import counter from './counter';
import number from './number';
counter();
number();

// 额外的模块HMR配置
if(module.hot) {
  module.hot.accept('./number.js', () => {
    document.body.removeChild(document.getElementById('number'));
    number();
  })
}
```

写完上面的额外代码后，我们再在浏览器中重复我们刚才的操作，即：

- 累加数字`1`带你喜欢的一个值
- 修改`number.js`中的`1000`为你喜欢的一个值

以下截图是我的测试结果，同时我们也可以在控制台`console`上，看到模块热更新第二次启动时，已经成功帮我们把`number.js`中的代码输出到了浏览器。

![模块热更新结果](./img/1111.png)

**小结**：在更改`CSS`样式文件时，我们不用书写`module.hot`，这是因为各种`CSS`的`loader`已经帮我们处理了，相同的道理还有`.vue`文件的`vue-loader`，它也帮我们处理了模块热更新，但在`.js`文件中，我们还是需要根据实际的业务来书写一点`module.hot`代码的。

## 处理ES6语法

### Babel

::: tip 说明

我们在项目中书写的`ES6`代码，由于考虑到低版本浏览器的兼容性问题，需要把`ES6`代码转换成低版本浏览器能够识别的`ES5`代码。使用`babel-loader`和`@babel/core`来进行`ES6`和`ES5`之间的链接，使用`@babel/preset-env`来进行`ES6`转`ES5`

- webpack使用**babel-loader**来使用babel，**@babel/core**实现通过Babel的API转码
- **@babel/preset-env**定义语法转化的配置
  1. preset就是在babel编译之前，让babel知道你的编译规则，看是用什么样的规范去编译
  2. 例如babel-preset-es2015就是安装es6标准编译
  3. babel-preset-env可以直接实现使用最新的规范编译，包括了babel-preset-es2015,babel-preset-es2016 and babel-preset-es2017...

- @babel/polyfill补全浏览器中缺失的方法（promise、map....）

:::

在处理`ES6`代码之前，我们先来清理一下前面小节的中的代理，我们需要删除`counter.js`、`number.js`和`style.css`这个三个文件，删除后的文件目录大概是下面这样子的：

```js
|-- dist
|   |-- index.html
|   |-- main.js
|-- src
|   |-- index.html
|   |-- index.js
|-- package.json
|-- webpack.config.js
```

要处理`ES6`代码，需要我们安装几个`npm`包，可以使用如下的命令去安装

```sh
# 安装 babel-loader @babel/core
$ npm install babel-loader @babel/core --save-dev

# 安装 @babel/preset-env
$ npm install @babel/preset-env --save-dev

# 安装 @babel/polyfill进行ES5代码补丁
$ npm install @babel/polyfill --save-dev
```

安装完毕后，我们需要改写`src/index.js`中的代码，可以是下面这个样子：

```js
import '@babel/polyfill';
const arr = [
  new Promise(() => {}),
  new Promise(() => {}),
  new Promise(() => {})
]

arr.map(item => {
  console.log(item);
})
```

处理`ES6`代码，需要我们使用`loader`，所以需要在`webpack.config.js`中添加如下的代码：

```js
module.exports = {
  // 其它配置
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}
```

`@babel/preset-env`需要在根目录下有一个`.babelrc`文件，所以我们新建一个`.babelrc`文件，它的代码如下：

```js
{
  "presets": ["@babel/preset-env"]
}
```

为了让我们的打包变得更加清晰，我们需要在`webpack.config.js`中把`source-map`配置成`none`，像下面这样：

```js
module.exports = {
  // 其他配置
  mode: 'development',
  devtool: 'none'
}
```

本次打包，我们需要使用`npx webpack`，打包的结果如下图所示：

![打包结果](./img/es6result.png)

在以上的打包中，我们可以发现：

- 箭头函数被转成了普通的函数形式
- 如果你仔细观察这次打包输出的话，你会发现打包体积会非常大，有几百K，这是因为我们将`@babel/polyfill`中的代码全部都打包进了我们的代码中

### useBuiltIns配置

针对以上最后一个问题，我们希望，我们使用了哪些`ES6`代码，就引入它对应的`polyfill`包，达到一种按需引入的目的，要实现这样一个效果，我们需要在`.babelrc`文件中做一下小小的改动，像下面这样：

```json
{
  "presets": [["@babel/preset-env", {
    // "corejs": 2,
    "useBuiltIns": "usage"
  }]]
}
```

**usage**的配置实现了**只对使用到的方法补全**。进行了同时需要注意的时，我们使用了`useBuiltIns:"usage"`后，在`index.js`中就不用使用`import '@babel/polyfill'`这样的写法了，因为它已经帮我们自动这样做了。

在以上配置完毕后，我们再次使用`npx webpack`进行打包，如下图，可以看到此次打包后，`main.js`的大小明显变小了。

![打包结果](./img/es6-2.png)

### targets配置目标浏览器

可以设置targets属性设置需要转换的目标浏览器，例如下面设置了转化之后要让67版本以上的chrome的支持ES6语法，因为本身67版本以上的chrome本身就支持ES6,这个配置下的打包几乎对打包体积没影响。

```js
{
  "presets": [["@babel/preset-env", {
      targets: {
          chrome: '67'
      },
      "useBuiltIns": "usage"
  }]]
}
```

### 组件库或类库下

通过preset打包的babel补全的polyfill会注入到全局变量，如果希望打包一个组件库或者类库，可以使用@babel/plugin-transform-runtime和@babel/runtime配合实现

```shell
npm i -D @babel/plugin-transform-runtime
npm i -S @babel/runtime
```

**.babelrc**文件去掉presets的配置，添加plugins的配置

```js
{
  "plugins": [["@babel/plugin-transform-runtime", {
      "core-js": 2,
      "helpers": true,
      "regenerator": true,
      "useESModules": false
  }]]
}
```

**core-js**从默认false改成 2 需要安装`npm i -S @babel/runtime-corejs2`，core-js为2才能实现当没有promise、map这些方法的时候会把方法打包到库文件中

