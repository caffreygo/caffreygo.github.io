"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[9869],{1756:(n,s,a)=>{a.r(s),a.d(s,{data:()=>e});const e={key:"v-223c694e",path:"/tools/webpack/step-2.html",title:"起步",lang:"zh-CN",frontmatter:{},excerpt:"",headers:[{level:2,title:"创建项目结构",slug:"创建项目结构",children:[]},{level:2,title:"添加基础代码",slug:"添加基础代码",children:[]},{level:2,title:"安装Webpack",slug:"安装webpack",children:[]},{level:2,title:"添加配置文件",slug:"添加配置文件",children:[]},{level:2,title:"改写package.json文件",slug:"改写package-json文件",children:[]},{level:2,title:"第一次打包",slug:"第一次打包",children:[]},{level:2,title:"理解webpack打包输出",slug:"理解webpack打包输出",children:[]}],filePathRelative:"tools/webpack/step-2.md",git:{updatedTime:1649446762e3,contributors:[{name:"Jerry Chen",email:"caffreygo@163.com",commits:2},{name:"Jinrui Chen",email:"jinrui@kooboo.cn",commits:1}]}}},8564:(n,s,a)=>{a.r(s),a.d(s,{default:()=>p});const e=(0,a(6252).uE)('<h1 id="起步" tabindex="-1"><a class="header-anchor" href="#起步" aria-hidden="true">#</a> 起步</h1><h2 id="创建项目结构" tabindex="-1"><a class="header-anchor" href="#创建项目结构" aria-hidden="true">#</a> 创建项目结构</h2><p>现在我们来创建基本的项目结构，它可能是下面这样</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token operator">|</span>-- webpack-vuepress\n<span class="token operator">|</span>   <span class="token operator">|</span>-- index.html\n<span class="token operator">|</span>   <span class="token operator">|</span>-- index.js\n<span class="token operator">|</span>   <span class="token operator">|</span>-- package.json\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>其中<code>package.json</code>是利用下面的命令自动生成的配置文件</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>$ <span class="token function">npm</span> init -y\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><h2 id="添加基础代码" tabindex="-1"><a class="header-anchor" href="#添加基础代码" aria-hidden="true">#</a> 添加基础代码</h2><p>在创建了基本的项目结构以后，我们需要为我们创建的文件添加一些代码</p><p><code>index.html</code>页面中的代码：</p><div class="language-html ext-html line-numbers-mode"><pre class="language-html"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>这是最原始的网页内容<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>root<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>\n<span class="token comment">&lt;!-- 引用打包后的js文件 --&gt;</span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>./dist/main.js<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span><span class="token script"></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p><code>index.js</code>文件中的代码：</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code>console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;hello,world&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><h2 id="安装webpack" tabindex="-1"><a class="header-anchor" href="#安装webpack" aria-hidden="true">#</a> 安装Webpack</h2><p>运行如下命令安装<code>webpack4.0+</code>和<code>webpack-cli</code>：</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>$ <span class="token function">npm</span> <span class="token function">install</span> webpack webpack-cli -D\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><h2 id="添加配置文件" tabindex="-1"><a class="header-anchor" href="#添加配置文件" aria-hidden="true">#</a> 添加配置文件</h2><p>使用如下命令添加 Webpack 配置文件：</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>$ <span class="token function">touch</span> webpack.config.js\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><p>使用此命令，变更后的项目结构大概如下所示：</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token operator">|</span>-- webpack-vuepress\n<span class="token operator">|</span>   <span class="token operator">|</span>-- index.html\n<span class="token operator">|</span>   <span class="token operator">|</span>-- index.js\n<span class="token operator">|</span>   <span class="token operator">|</span>-- webpack.config.js\n<span class="token operator">|</span>   <span class="token operator">|</span>-- package.json\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>至此我们的基础目录已创建完毕，接下来需要改写<code>webpack.config.js</code>文件，它的代码如下：</p><p>解释</p><ol><li><code>entry</code>配置项说明了<code>webpack</code>打包的入口文件。</li><li><code>output</code>配置项说明了<code>webpack</code>输出配置：<code>filename</code>配置了打包后的文件叫<code>main.js</code></li><li><code>path</code>配置了打包后的输出目录为<code>dist</code>文件夹下</li></ol><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token comment">// path为Node的核心模块</span>\n<span class="token keyword">const</span> path <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">&#39;path&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\nmodule<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>\n  entry<span class="token operator">:</span> <span class="token string">&#39;./index.js&#39;</span><span class="token punctuation">,</span>\n  output<span class="token operator">:</span> <span class="token punctuation">{</span>\n    filename<span class="token operator">:</span> <span class="token string">&#39;main.js&#39;</span><span class="token punctuation">,</span>\n    path<span class="token operator">:</span> path<span class="token punctuation">.</span><span class="token function">resolve</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">&#39;dist&#39;</span><span class="token punctuation">)</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><h2 id="改写package-json文件" tabindex="-1"><a class="header-anchor" href="#改写package-json文件" aria-hidden="true">#</a> 改写package.json文件</h2><p>改写说明</p><ol><li>添加<code>private</code>属性并设置为<code>true</code>：此属性能让我们的项目为私有的，防止意外发布代码</li><li>移除<code>main</code>属性：我们的项目并不需要对外暴露一个入口文件</li><li>添加<code>scripts</code>命令：即我们的打包命令</li></ol><p>改写后的<code>package.json</code>文件如下所示：</p><div class="language-json ext-json line-numbers-mode"><pre class="language-json"><code><span class="token punctuation">{</span>\n  <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;webpack-vuepress&quot;</span><span class="token punctuation">,</span>\n  <span class="token property">&quot;version&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1.0.0&quot;</span><span class="token punctuation">,</span>\n  <span class="token property">&quot;description&quot;</span><span class="token operator">:</span> <span class="token string">&quot;&quot;</span><span class="token punctuation">,</span>\n  <span class="token property">&quot;private&quot;</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>\n  <span class="token property">&quot;scripts&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>\n    <span class="token property">&quot;bundle&quot;</span><span class="token operator">:</span> <span class="token string">&quot;webpack&quot;</span>\n  <span class="token punctuation">}</span><span class="token punctuation">,</span>\n  <span class="token property">&quot;keywords&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span>\n  <span class="token property">&quot;author&quot;</span><span class="token operator">:</span> <span class="token string">&quot;&quot;</span><span class="token punctuation">,</span>\n  <span class="token property">&quot;license&quot;</span><span class="token operator">:</span> <span class="token string">&quot;ISC&quot;</span><span class="token punctuation">,</span>\n  <span class="token property">&quot;devDependencies&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>\n    <span class="token property">&quot;webpack&quot;</span><span class="token operator">:</span> <span class="token string">&quot;^4.31.0&quot;</span><span class="token punctuation">,</span>\n    <span class="token property">&quot;webpack-cli&quot;</span><span class="token operator">:</span> <span class="token string">&quot;^3.3.2&quot;</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><h2 id="第一次打包" tabindex="-1"><a class="header-anchor" href="#第一次打包" aria-hidden="true">#</a> 第一次打包</h2><p>命令说明</p><p><code>npm run</code>代表运行一个脚本命令，而<code>bundle</code>就是我们配置的打包命令，即<code>npm run bundle</code>就是我们配置的<code>webpack</code>打包命令。</p><p>运行如下命令进行项目打包：</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>$ <span class="token function">npm</span> run bundle\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><p>打包后的效果如下所示：</p><p><img src="https://wangtunan.github.io/blog/assets/img/5.d107e67a.png" alt="第一次打包后的效果"></p><p>打包后的项目目录如下所示，可以看到我们多出了一个叫<code>dist</code>的目录，它里面有一个<code>main.js</code>文件</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token operator">|</span>-- webpack-vuepress\n<span class="token operator">|</span>   <span class="token operator">|</span>-- dist\n<span class="token operator">|</span>   <span class="token operator">|</span>   <span class="token operator">|</span>-- main.js\n<span class="token operator">|</span>   <span class="token operator">|</span>-- index.html\n<span class="token operator">|</span>   <span class="token operator">|</span>-- index.js\n<span class="token operator">|</span>   <span class="token operator">|</span>-- webpack.config.js\n<span class="token operator">|</span>   <span class="token operator">|</span>-- package.json\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>打包成功后，我们需要在浏览器中运行<code>index.html</code>，它的运行结果如下图所示：</p><p><img src="https://raw.githubusercontent.com/caffreygo/static/main/blog/webpack/step-2-2.png" alt="demo"></p><h2 id="理解webpack打包输出" tabindex="-1"><a class="header-anchor" href="#理解webpack打包输出" aria-hidden="true">#</a> 理解webpack打包输出</h2><p>在上一节中，我们第一次运行了一个打包命令，它在控制台上有一些输出内容，这一节我们详细来介绍这些输出是什么意思：</p><p><img src="https://raw.githubusercontent.com/caffreygo/static/main/blog/webpack/step-2-3.png" alt="第一次打包后的效果"></p><ol><li><strong>Hash：</strong> <code>hash</code>代表本次打包的唯一<code>hash</code>值，每一次打包此值都是不一样的</li><li><strong>Version：</strong> 详细展示了我们使用<code>webpack</code>的版本号</li><li><strong>Time：</strong> 代表我们本次打包的耗时</li><li><strong>Asset：</strong> 代表我们打包出的文件名称</li><li><strong>Size：</strong> 代表我们打包出的文件的大小</li><li><strong>Chunks：</strong> 代表打包后的<code>.js</code>文件对应的<code>id</code>，<code>id</code>从<code>0</code>开始，依次往后<code>+1</code></li><li><strong>Chunks Names：</strong> 代表我们打包后的<code>.js</code>文件的名字，至于为何是<code>main</code>，而不是其他的内容，这是因为在我们的<code>webpack.config.js</code>中，<code>entry:&#39;./index.js&#39;</code>是对如下方式的简写形式：</li></ol><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token comment">// path为Node的核心模块</span>\n<span class="token keyword">const</span> path <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">&#39;path&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\nmodule<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>\n  <span class="token comment">// entry: &#39;./index.js&#39;,</span>\n  entry<span class="token operator">:</span> <span class="token punctuation">{</span>\n    main<span class="token operator">:</span> <span class="token string">&#39;./index.js&#39;</span>\n  <span class="token punctuation">}</span>\n  <span class="token comment">// 其它配置</span>\n<span class="token punctuation">}</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><ol><li><strong>Entrypoint main = bundle.js：</strong> 代表我们打包的入口为<code>main</code></li><li><strong>warning in configuration：</strong> 提示警告，意思是我们没有给<code>webpack.config.js</code>设置<code>mode</code>属性，<code>mode</code>属性有三个值：<code>development</code>代表开发环境、<code>production</code>代表生产环境、<code>none</code>代表既不是开发环境也不是生产环境。如果不写的话，默认是生产环境，可在配置文件中配置此项，配置后再次打包将不会再出现此警告。</li></ol><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>// path为Node的核心模块\nconst path = require(&#39;path&#39;);\n\nmodule.exports = {\n  // 其它配置\n  mode: &#39;development&#39;\n}\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div>',47),p={render:function(n,s){return e}}}}]);