"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[9434],{5594:(n,s,a)=>{a.r(s),a.d(s,{data:()=>p});const p={key:"v-0df0b480",path:"/VueJs3/section3/chapter7.html",title:"渲染器的设计",lang:"zh-CN",frontmatter:{},excerpt:"",headers:[{level:2,title:"渲染器与响应系统结合",slug:"渲染器与响应系统结合",children:[]},{level:2,title:"渲染器的基本概念",slug:"渲染器的基本概念",children:[]},{level:2,title:"自定义渲染器",slug:"自定义渲染器",children:[{level:3,title:"浏览器渲染器",slug:"浏览器渲染器",children:[]},{level:3,title:"自定义渲染器",slug:"自定义渲染器-1",children:[]}]},{level:2,title:"总结",slug:"总结",children:[]}],filePathRelative:"VueJs3/section3/chapter7.md",git:{updatedTime:1653975889e3,contributors:[{name:"Jinrui Chen",email:"jinrui@kooboo.cn",commits:2},{name:"Jerry Chen",email:"caffreygo@163.com",commits:1}]}}},2817:(n,s,a)=>{a.r(s),a.d(s,{default:()=>t});const p=(0,a(6252).uE)('<h1 id="渲染器的设计" tabindex="-1"><a class="header-anchor" href="#渲染器的设计" aria-hidden="true">#</a> 渲染器的设计</h1><h2 id="渲染器与响应系统结合" tabindex="-1"><a class="header-anchor" href="#渲染器与响应系统结合" aria-hidden="true">#</a> 渲染器与响应系统结合</h2><p>📝 渲染器是用来执行<strong>渲染任务</strong>的。在浏览器平台上，用它来渲染真实 DOM 元素。</p><p>渲染器不仅能够渲染真实 DOM 元素，它还是框架跨平台能力的关键。在限定的 DOM 平台，渲染器能够渲染一个真实 DOM，那么下面这个 renderer 函数就是一个合格的渲染器。@vue/reactivity 提供了 IIFE 模块格式，我们可以直接引用：</p><div class="language-html ext-html line-numbers-mode"><pre class="language-html"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>app<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>https://unpkg.com/@vue/reactivity@3.0.5/dist/reactivity.global.js<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span><span class="token script"></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript">\n    <span class="token keyword">const</span> <span class="token punctuation">{</span> effect<span class="token punctuation">,</span> ref <span class="token punctuation">}</span> <span class="token operator">=</span> VueReactivity\n    <span class="token comment">// 渲染器</span>\n    <span class="token keyword">function</span> <span class="token function">renderer</span><span class="token punctuation">(</span><span class="token parameter">domString<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        container<span class="token punctuation">.</span>innerHTML <span class="token operator">=</span> domString\n    <span class="token punctuation">}</span>\n    <span class="token comment">// 利用响应系统声明一个原始值响应数据</span>\n    <span class="token keyword">const</span> count <span class="token operator">=</span> <span class="token function">ref</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>\n    <span class="token comment">// 利用响应系统对 count 进行依赖收集</span>\n    <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n        <span class="token function">renderer</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">&lt;h1&gt;</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>count<span class="token punctuation">.</span>value<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">&lt;/h1&gt;</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">,</span> document<span class="token punctuation">.</span><span class="token function">getElementById</span><span class="token punctuation">(</span><span class="token string">&#39;app&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span>\n    <span class="token comment">// 触发副作用函数执行</span>\n    <span class="token function">setInterval</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n        count<span class="token punctuation">.</span>value<span class="token operator">++</span>\n    <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">)</span>\n</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><h2 id="渲染器的基本概念" tabindex="-1"><a class="header-anchor" href="#渲染器的基本概念" aria-hidden="true">#</a> 渲染器的基本概念</h2><details class="custom-container details"><summary>关键词</summary><ul><li>渲染器（renderer）：把虚拟 DOM 渲染为特定平台上的真实元素</li><li>渲染（render）：动词，渲染</li><li>虚拟 DOM（virtual DOM，vdom）：与真实 DOM 结构一样的，由节点组成的树形结构</li><li>虚拟节点（virtual node，vnode）：虚拟 DOM 树的节点，由一个 JavaScript 对象表示</li><li>挂载（mount）：渲染器把虚拟 DOM 节点渲染为真实 DOM 节点的过程</li><li>挂载点（container）：指定渲染器挂载的具体位置，渲染器会把该 DOM 元素作为容器元素</li></ul></details><p>我们通过 <code>createRenderer</code> 函数创建一个渲染器，没有直接定义 render 函数的原因是： ✅ 渲染器不同于渲染，它的概念更加宽泛，它不仅可以用来渲染<code>mount</code>，也可以激活已有元素<code>hydrate</code>...</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">createRenderer</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token comment">// 打补丁：根据 n1 旧节点存在与否，内部挂载或更新</span>\n    <span class="token keyword">function</span> <span class="token function">patch</span><span class="token punctuation">(</span><span class="token parameter">n1<span class="token punctuation">,</span> n2<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/*...*/</span> <span class="token punctuation">}</span>\n\n    <span class="token keyword">function</span> <span class="token function">render</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        <span class="token keyword">if</span> <span class="token punctuation">(</span>vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token comment">// 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数进行打补丁</span>\n            <span class="token function">patch</span><span class="token punctuation">(</span>container<span class="token punctuation">.</span>_vnode<span class="token punctuation">,</span> vnode<span class="token punctuation">,</span> container<span class="token punctuation">)</span>\n        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>\n            <span class="token keyword">if</span> <span class="token punctuation">(</span>container<span class="token punctuation">.</span>_vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n                <span class="token comment">// 旧 vnode 存在，且新 vnode 不存在，说明是卸载(unmount)操作</span>\n                container<span class="token punctuation">.</span>innerHTML <span class="token operator">=</span> <span class="token string">&#39;&#39;</span>\n            <span class="token punctuation">}</span>\n        <span class="token punctuation">}</span>\n        <span class="token comment">// 把 vnode 存储到 container._vnode 下，即后续渲染中的旧 vnode</span>\n        container<span class="token punctuation">.</span>_vnode <span class="token operator">=</span> vnode\n    <span class="token punctuation">}</span>\n\n    <span class="token keyword">return</span> <span class="token punctuation">{</span>\n        render\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n\n<span class="token keyword">const</span> renderer <span class="token operator">=</span> <span class="token function">createRenderer</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n\n<span class="token comment">// 首次渲染：挂载 patch(undefined, vnode, container)</span>\nrenderer<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span>vnode1<span class="token punctuation">,</span> document<span class="token punctuation">.</span><span class="token function">querySelector</span><span class="token punctuation">(</span><span class="token string">&#39;#app&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n<span class="token comment">// 第二次渲染：更新 patch(_vnode, vnode, container)</span>\nrenderer<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span>vnode2<span class="token punctuation">,</span> document<span class="token punctuation">.</span><span class="token function">querySelector</span><span class="token punctuation">(</span><span class="token string">&#39;#app&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n<span class="token comment">// 第三次渲染：卸载 patch(_vnode, null, container)</span>\nrenderer<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> document<span class="token punctuation">.</span><span class="token function">querySelector</span><span class="token punctuation">(</span><span class="token string">&#39;#app&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br></div></div><p>🔥 首次渲染时已经把 oldNode 渲染到 container 内了，所以当再次调用 renderer. Render 函数并尝试渲染 newNode 时，就不能简单地执行挂载动作了。在这种情况下，渲染器会使用 newNode 与上一次渲染的 oldNode 比较，试图找到并更新变更点。这个过程叫做“打补丁”（或更新），英文通常用 patch 来表达。</p><p>📝 挂载动作本身也可以看作一直特殊的打补丁，它的特殊之处在于旧的 VNode 不存在。</p><blockquote><p>patch 函数是整个渲染器的核心入口，它承载了最重要的渲染逻辑；</p><p>patch 函数不仅可以用来挂载，也可以用来更新；</p><p>render 函数是入口，内部判断是 mount、patch 还是 unmount。</p></blockquote><h2 id="自定义渲染器" tabindex="-1"><a class="header-anchor" href="#自定义渲染器" aria-hidden="true">#</a> 自定义渲染器</h2><p>🔥 渲染器要实现跨平台能力，需要<strong>抽象</strong>出<strong>不可复用部分</strong>。</p><p>📝 对于浏览器作为渲染的目标平台时，将浏览器的特定 API 抽离，这样就可以使得渲染器的核心不依赖于浏览器。在此基础上，我们再为那些被抽离的 API 提供可配置的接口，即可实现渲染器的跨平台能力。</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token comment">// 把操作 DOM 的 API 封装为一个对象，当做参数传递</span>\n<span class="token keyword">function</span> <span class="token function">createRenderer</span><span class="token punctuation">(</span><span class="token parameter">options</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token comment">// 渲染器根据配置得到操作 DOM 的 API，实现通用的渲染器</span>\n    <span class="token keyword">const</span> <span class="token punctuation">{</span>\n        createElement<span class="token punctuation">,</span>\n        insert<span class="token punctuation">,</span>\n        setElementText\n    <span class="token punctuation">}</span> <span class="token operator">=</span> options\n\n    <span class="token keyword">function</span> <span class="token function">mountElement</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        <span class="token keyword">const</span> el <span class="token operator">=</span> <span class="token function">createElement</span><span class="token punctuation">(</span>vnode<span class="token punctuation">.</span>type<span class="token punctuation">)</span>\n        <span class="token comment">// 通过传入的 API 操作 DOM</span>\n        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> vnode<span class="token punctuation">.</span>children <span class="token operator">===</span> <span class="token string">&#39;string&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token function">setElementText</span><span class="token punctuation">(</span>el<span class="token punctuation">,</span> vnode<span class="token punctuation">.</span>children<span class="token punctuation">)</span>\n        <span class="token punctuation">}</span>\n        <span class="token function">insert</span><span class="token punctuation">(</span>el<span class="token punctuation">,</span> container<span class="token punctuation">)</span>\n    <span class="token punctuation">}</span>\n\n    <span class="token keyword">function</span> <span class="token function">patch</span><span class="token punctuation">(</span><span class="token parameter">n1<span class="token punctuation">,</span> n2<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>n1<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token comment">// 初始挂载</span>\n            <span class="token function">mountElement</span><span class="token punctuation">(</span>n2<span class="token punctuation">,</span> container<span class="token punctuation">)</span>\n        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>\n            <span class="token comment">// 更新</span>\n        <span class="token punctuation">}</span>\n    <span class="token punctuation">}</span>\n\n    <span class="token keyword">function</span> <span class="token function">render</span><span class="token punctuation">(</span><span class="token parameter">vnode<span class="token punctuation">,</span> container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        <span class="token keyword">if</span> <span class="token punctuation">(</span>vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token function">patch</span><span class="token punctuation">(</span>container<span class="token punctuation">.</span>_vnode<span class="token punctuation">,</span> vnode<span class="token punctuation">,</span> container<span class="token punctuation">)</span>\n        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>\n            <span class="token keyword">if</span> <span class="token punctuation">(</span>container<span class="token punctuation">.</span>_vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n                container<span class="token punctuation">.</span>innerHTML <span class="token operator">=</span> <span class="token string">&#39;&#39;</span>\n            <span class="token punctuation">}</span>\n        <span class="token punctuation">}</span>\n        container<span class="token punctuation">.</span>_vnode <span class="token operator">=</span> vnode\n    <span class="token punctuation">}</span>\n\n    <span class="token keyword">return</span> <span class="token punctuation">{</span>\n        render\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br></div></div><h3 id="浏览器渲染器" tabindex="-1"><a class="header-anchor" href="#浏览器渲染器" aria-hidden="true">#</a> 浏览器渲染器</h3><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">const</span> renderer <span class="token operator">=</span> <span class="token function">createRenderer</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n    <span class="token function">createElement</span><span class="token punctuation">(</span><span class="token parameter">tag</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        <span class="token keyword">return</span> document<span class="token punctuation">.</span><span class="token function">createElement</span><span class="token punctuation">(</span>tag<span class="token punctuation">)</span>\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token function">setElementText</span><span class="token punctuation">(</span><span class="token parameter">el<span class="token punctuation">,</span> text</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        el<span class="token punctuation">.</span>textContent <span class="token operator">=</span> text\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token function">insert</span><span class="token punctuation">(</span><span class="token parameter">el<span class="token punctuation">,</span> parent<span class="token punctuation">,</span> anchor <span class="token operator">=</span> <span class="token keyword">null</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        parent<span class="token punctuation">.</span><span class="token function">insertBefore</span><span class="token punctuation">(</span>el<span class="token punctuation">,</span> anchor<span class="token punctuation">)</span>\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n\n<span class="token keyword">const</span> vnode <span class="token operator">=</span> <span class="token punctuation">{</span>\n    type<span class="token operator">:</span> <span class="token string">&#39;h1&#39;</span><span class="token punctuation">,</span>\n    children<span class="token operator">:</span> <span class="token string">&#39;hello&#39;</span>\n<span class="token punctuation">}</span>\n\nrenderer<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span>vnode<span class="token punctuation">,</span> document<span class="token punctuation">.</span><span class="token function">querySelector</span><span class="token punctuation">(</span><span class="token string">&#39;#app&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><h3 id="自定义渲染器-1" tabindex="-1"><a class="header-anchor" href="#自定义渲染器-1" aria-hidden="true">#</a> 自定义渲染器</h3><p>通过已有的通用渲染器，我们也可以创建一个用来打印渲染器操作流程的自定义渲染器：</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">const</span> renderer2 <span class="token operator">=</span> <span class="token function">createRenderer</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n    <span class="token function">createElement</span><span class="token punctuation">(</span><span class="token parameter">tag</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">创建元素 </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>tag<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span>\n        <span class="token keyword">return</span> <span class="token punctuation">{</span> tag <span class="token punctuation">}</span>\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token function">setElementText</span><span class="token punctuation">(</span><span class="token parameter">el<span class="token punctuation">,</span> text</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">设置 </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span>el<span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> 的文本内容：</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>text<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span>\n        el<span class="token punctuation">.</span>text <span class="token operator">=</span> text\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token function">insert</span><span class="token punctuation">(</span><span class="token parameter">el<span class="token punctuation">,</span> parent<span class="token punctuation">,</span> anchor <span class="token operator">=</span> <span class="token keyword">null</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">将 </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span>el<span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> 添加到 </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span>parent<span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> 下</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span>\n        parent<span class="token punctuation">.</span>children <span class="token operator">=</span> el\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n\n<span class="token keyword">const</span> container <span class="token operator">=</span> <span class="token punctuation">{</span> type<span class="token operator">:</span> <span class="token string">&#39;root&#39;</span> <span class="token punctuation">}</span>\nrenderer2<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span>vnode<span class="token punctuation">,</span> container<span class="token punctuation">)</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结" aria-hidden="true">#</a> 总结</h2><p>✅ 渲染器与响应系统之间的关系：利用响应系统的能力，我们可以做到，当响应式数据发生变化时自动完成页面更新（或重新渲染）。</p><p>✅ 渲染器会执行挂载和打补丁的操作，对于新的元素，渲染器会将它挂载到容器内；对于新旧 vnode 都存在的情况，渲染器则会执行打补丁操作，即对比新旧 vnode，只更新变化的内容。</p><p>✅ 通用渲染器将用来创建、修改和删除元素的操作<strong>抽象</strong>成可配置的对象。用户可以在创建渲染器的时候指定自定义的配置对象，从而实现自定义的行为。</p>',25),t={render:function(n,s){return p}}}}]);