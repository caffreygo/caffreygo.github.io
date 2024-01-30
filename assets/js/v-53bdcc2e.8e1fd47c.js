"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[2756],{7911:(s,n,a)=>{a.r(n),a.d(n,{data:()=>t});const t={key:"v-53bdcc2e",path:"/typescript/grammar/note.html",title:"笔记",lang:"zh-CN",frontmatter:{},excerpt:"",headers:[{level:2,title:"命名空间与编译打包",slug:"命名空间与编译打包",children:[{level:3,title:"命名空间",slug:"命名空间",children:[]},{level:3,title:"单独编译",slug:"单独编译",children:[]},{level:3,title:"合并打包",slug:"合并打包",children:[]},{level:3,title:"reference",slug:"reference",children:[]},{level:3,title:"amd",slug:"amd",children:[]}]}],filePathRelative:"typescript/grammar/note.md",git:{updatedTime:1645625378e3,contributors:[{name:"Jerry Chen",email:"caffreygo@163.com",commits:1}]}}},477:(s,n,a)=>{a.r(n),a.d(n,{default:()=>p});const t=(0,a(6252).uE)('<h1 id="笔记" tabindex="-1"><a class="header-anchor" href="#笔记" aria-hidden="true">#</a> 笔记</h1><h2 id="命名空间与编译打包" tabindex="-1"><a class="header-anchor" href="#命名空间与编译打包" aria-hidden="true">#</a> 命名空间与编译打包</h2><h3 id="命名空间" tabindex="-1"><a class="header-anchor" href="#命名空间" aria-hidden="true">#</a> 命名空间</h3><p>📗 TypeScript 像其他编程语言一样，存在命名空间（namespace）的概念。</p><blockquote><p>https://github.com/caffreygo/demoFolder</p></blockquote><p>当我们定义以下同名变量时是不允许的，这种情况可以通过命名空间解决</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code><span class="token keyword">let</span> name<span class="token operator">:</span> <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&#39;helloworld&#39;</span>\n<span class="token keyword">let</span> name<span class="token operator">:</span> <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&#39;google.com&#39;</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p>下面是使用<strong>命名空间</strong>将变量隔离</p><ul><li>数据需要使用 export 导出才可以使用</li><li>子命名空间也需要 export 后才可以使用</li></ul><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code><span class="token keyword">namespace</span> User <span class="token punctuation">{</span>\n    <span class="token keyword">export</span> <span class="token keyword">let</span> name<span class="token operator">:</span> <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&#39;helloworld&#39;</span>\n<span class="token punctuation">}</span>\n<span class="token keyword">namespace</span> Member <span class="token punctuation">{</span>\n    <span class="token keyword">let</span> name<span class="token operator">:</span> <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&#39;google.com&#39;</span>\n<span class="token punctuation">}</span>\n\n<span class="token builtin">console</span><span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>User<span class="token punctuation">.</span>name<span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token builtin">console</span><span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>Member<span class="token punctuation">.</span>name<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">//报错，因为没有使用 export 将变量导出</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>命名空间支持嵌套</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code><span class="token keyword">namespace</span> User <span class="token punctuation">{</span>\n    <span class="token keyword">export</span> <span class="token keyword">let</span> name<span class="token operator">:</span> <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&#39;helloworld&#39;</span>\n    <span class="token keyword">export</span> <span class="token keyword">namespace</span> Member <span class="token punctuation">{</span>\n        <span class="token keyword">export</span> <span class="token keyword">let</span> name<span class="token operator">:</span> <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&#39;google.com&#39;</span>\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n\n<span class="token builtin">console</span><span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>User<span class="token punctuation">.</span>name<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token builtin">console</span><span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>User<span class="token punctuation">.</span>Member<span class="token punctuation">.</span>name<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">//google.com 获取子命名空间中的数据 </span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><h3 id="单独编译" tabindex="-1"><a class="header-anchor" href="#单独编译" aria-hidden="true">#</a> 单独编译</h3><p>下面将每个 ts 文件单独进行编译，然后在 html 文件中依次引入</p><p>首先创建 tsconfig.js</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>tsc --init\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><p>然后执行文件监测</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>tsc -w\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><p>下面我们创建<code>user.ts</code>模块文件</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code><span class="token keyword">namespace</span> User <span class="token punctuation">{</span>\n    <span class="token keyword">export</span> <span class="token keyword">let</span> name<span class="token operator">:</span> <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&#39;helloworld&#39;</span>\n<span class="token punctuation">}</span>\n<span class="token keyword">namespace</span> Member <span class="token punctuation">{</span>\n    <span class="token keyword">export</span> <span class="token keyword">let</span> name<span class="token operator">:</span> <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&#39;google.com&#39;</span>\n<span class="token punctuation">}</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>在 index.ts 文件中定义业务内容，即使用 User.ts 中的数据 User.name</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code><span class="token builtin">console</span><span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>User<span class="token punctuation">.</span>name<span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><p>然后执行编译</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>tsc -w\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><p>创建hd.html 文件引入这两个 JS 文件，注意要将 namespace.js 文件先引入</p><div class="language-html ext-html line-numbers-mode"><pre class="language-html"><code><span class="token doctype"><span class="token punctuation">&lt;!</span><span class="token doctype-tag">DOCTYPE</span> <span class="token name">html</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>html</span> <span class="token attr-name">lang</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>en<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>head</span><span class="token punctuation">&gt;</span></span>\n        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>title</span><span class="token punctuation">&gt;</span></span>helloworld<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>title</span><span class="token punctuation">&gt;</span></span>\n        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>user.js<span class="token punctuation">&quot;</span></span> <span class="token attr-name">defer</span><span class="token punctuation">&gt;</span></span><span class="token script"></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>\n        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>index.js<span class="token punctuation">&quot;</span></span> <span class="token attr-name">defer</span><span class="token punctuation">&gt;</span></span><span class="token script"></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>head</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>body</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>body</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>html</span><span class="token punctuation">&gt;</span></span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><h3 id="合并打包" tabindex="-1"><a class="header-anchor" href="#合并打包" aria-hidden="true">#</a> 合并打包</h3><p>📗 上面的多文件处理方式非常不方便，如果有<strong>多个文件</strong>要写多个 script 标签来引入。</p><p>下面是通过命令将多个文件进行打包</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>tsc --outFile ./dist/app.js user.ts index.ts\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><p>然后在 hd.html 文件引入打包好的文件</p><div class="language-html ext-html line-numbers-mode"><pre class="language-html"><code><span class="token doctype"><span class="token punctuation">&lt;!</span><span class="token doctype-tag">DOCTYPE</span> <span class="token name">html</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>html</span> <span class="token attr-name">lang</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>en<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>head</span><span class="token punctuation">&gt;</span></span>\n        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>title</span><span class="token punctuation">&gt;</span></span>helloworld<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>title</span><span class="token punctuation">&gt;</span></span>\n        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>dist/app.js<span class="token punctuation">&quot;</span></span> <span class="token attr-name">defer</span><span class="token punctuation">&gt;</span></span><span class="token script"></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>head</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>body</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>body</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>html</span><span class="token punctuation">&gt;</span></span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><h3 id="reference" tabindex="-1"><a class="header-anchor" href="#reference" aria-hidden="true">#</a> reference</h3><p>📗 如果存在多个文件都像上面一样在命令行填写，显然是很麻烦了。我们可以使用以下方法优化在 index.ts 中使用 <code>reference</code> 引入依赖的文件</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code><span class="token comment">/// &lt;reference path=&quot;user.ts&quot;/&gt;</span>\n<span class="token builtin">console</span><span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>User<span class="token punctuation">.</span>name<span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p>然后使用下面的命令编译到一个文件中</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>tsc --outFile ./dist/app.js index.ts \n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><p>然后访问 hd.html</p><div class="language-html ext-html line-numbers-mode"><pre class="language-html"><code><span class="token doctype"><span class="token punctuation">&lt;!</span><span class="token doctype-tag">DOCTYPE</span> <span class="token name">html</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>html</span> <span class="token attr-name">lang</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>en<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>head</span><span class="token punctuation">&gt;</span></span>\n        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>title</span><span class="token punctuation">&gt;</span></span>helloworld<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>title</span><span class="token punctuation">&gt;</span></span>\n        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>dist/app.js<span class="token punctuation">&quot;</span></span> <span class="token attr-name">defer</span><span class="token punctuation">&gt;</span></span><span class="token script"></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>head</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>body</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>body</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>html</span><span class="token punctuation">&gt;</span></span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><h3 id="amd" tabindex="-1"><a class="header-anchor" href="#amd" aria-hidden="true">#</a> amd</h3><p>🔰 使用 amd 模块打包较上面的打包方式<strong>方便</strong>些，因为我们可以在代码中使用 js 模块的 export/import 语法</p><div class="custom-container tip"><p class="custom-container-title">提示</p><ol><li>ts代码的书写正常使用es6规范的import/export，然后将tsconfig的打包输出方式更改为amd。</li><li>tsc执行编译命令将ts文件编译为amd模块代码</li><li>页面引入require.js，然后使用正确require amd <code>require([&#39;App&#39;])</code>即可</li></ol></div><p>首先创建 ts配置文件 tsconfig.js</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>tsc --init\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><p>然后修改配置项</p><div class="language-json ext-json line-numbers-mode"><pre class="language-json"><code>...\n<span class="token property">&quot;module&quot;</span><span class="token operator">:</span> <span class="token string">&quot;amd&quot;</span> \n...\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>然后创建user.ts，并且只导出 User类</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code><span class="token keyword">export</span> <span class="token keyword">namespace</span> User <span class="token punctuation">{</span>\n    <span class="token keyword">export</span> <span class="token keyword">let</span> name<span class="token operator">:</span> <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&#39;helloworld&#39;</span>\n<span class="token punctuation">}</span>\n<span class="token keyword">export</span> <span class="token keyword">namespace</span> Member <span class="token punctuation">{</span>\n    <span class="token keyword">export</span> <span class="token keyword">let</span> name<span class="token operator">:</span> <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&#39;google.com&#39;</span>\n<span class="token punctuation">}</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>在index.ts 文件中import导入 ts 的User模块</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code><span class="token keyword">import</span> <span class="token punctuation">{</span> User <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;./user&quot;</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><p>然后执行命令进行编译</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>tsc --outFile ./dist/app.js   \n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><p>然后修改 hd.html 文件内容，因为是 amd 模块所以需要使用 require.js 处理。</p><div class="language-html ext-html line-numbers-mode"><pre class="language-html"><code><span class="token doctype"><span class="token punctuation">&lt;!</span><span class="token doctype-tag">DOCTYPE</span> <span class="token name">html</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>html</span> <span class="token attr-name">lang</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>en<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>\n  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>head</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>meta</span> <span class="token attr-name">charset</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>UTF-8<span class="token punctuation">&quot;</span></span> <span class="token punctuation">/&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>https://cdn.bootcdn.net/ajax/libs/require.js/2.3.6/require.min.js<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span><span class="token script"></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>\n  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>head</span><span class="token punctuation">&gt;</span></span>\n  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>body</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>dist/app.js<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span><span class="token script"></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript">\n      <span class="token function">require</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token string">&#39;App&#39;</span><span class="token punctuation">]</span><span class="token punctuation">)</span>\n      <span class="token function">require</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token string">&#39;User&#39;</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token parameter">User</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>User<span class="token punctuation">.</span>title<span class="token punctuation">)</span>\n      <span class="token punctuation">}</span><span class="token punctuation">)</span>\n    </span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>\n  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>body</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>html</span><span class="token punctuation">&gt;</span></span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div>',54),p={render:function(s,n){return t}}}}]);