# 深入浅出Vue.js

## 变化侦测

![](./img/deps.png)

- 只有Watcher触发的getter才会收集依赖，哪个Watcher触发了getter，就把哪个Watcher收集到Dep中; 

- Observer类类的作用是将一个数据内的所有属性（包括子属性）都转换成getter/setter的形式，然后去追踪它们的变化;

- Observe内的walk方法能够将val为对象内的所有键循环defineReactive;

- Dep内收集的依赖Watcher实例，实际上就是我们的数据发生变化之后需要通知的地方，也就是使用到了这些响应式数据的地方，比如模板;

- Watcher在实例化的时候，将自身设置到window.target上，然后实例化的时候触发了一次getter，getter的触发将target加入到了subs数组当中;

  

1. Data通过Observer转换成了getter/setter的形式来追踪变化。
2. 当外界通过Watcher读取数据时，会触发getter从而将Watcher添加到依赖中。
3. 当数据发生了变化时，会触发setter，从而向Dep中的依赖（Watcher）发送通知。
4. Watcher接收到通知后，会向外界发送通知，变化通知到外界后可能会触发视图更新，也有可能触发用户的某个回调函数等。

### Watcher

::: tip

- 状态收集依赖，依赖就是watcher (组件实例的watcher),状态改变的时候向这些依赖（watcher）进行通知。
- 实例销毁的时候，实例的watcher作为依赖收集在状态之中，需要把实例监听的这些状态都取消掉，也就是把状态收集的这个watcher依赖删除。 
- 这里调用wather实例的teardown方法就会从所有依赖项的订阅dep列表中删除watcher实例
- vm._watcher作为一个数组收集了实例内状态收集的所有依赖，依赖watcher又拥有teardown方法可以删除当前依赖与状态之间的订阅关系
- 由于状态变化通知到了watcher需要重新渲染，Vue提供了一个队列将需要重新更新渲染的watcher(组件实例，渲染watcher)先收集起来成为一个watcher数组，即使有多个状态需要更新同一个watcher，这边的队列也只保存了一份，然后在下次的事件循环的时候去循环这个数组对这些watcher调用update方法。

:::

- Watcher想监听某个数据，就会触发某个数据收集依赖的逻辑，将自己收集进去，然后当它发生变化时，就会通知Watcher

- ```js
  Dep => depend { window.target.addDep(this) }
  ```

![](./img/addDep.png)

- window.target就是Watcher实例，Watcher的addDep方法先将监听对象的dep添加到自身当中，然后又触发dep的addSub方法将自身Watcher实例添加到了侦测数据的subs中，实现了多对多的dep与watcher关系
- Watcher虽然每次只收集一个数据，但如果数据是个函数，内部又包含了多个响应式的数据，这就让Watcher收集了多个Dep的发生

### 数组

- ES6之前，JavaScript并没有提供元编程的能力，也就是没有提供可以拦截原型方法的能力 :

  ```js
  const arrayMethods = Object.create(Array.prototype)
  ```

- 拦截操作只针对那些被侦测了变化的数据生效，也就是说希望拦截器只覆盖那些响应式数组的原型；

- arrayMethods通过Object.defineProperty的`value`函数调用原生的原型方法，然后value.__proto__ = arrayMethods 将拦截器覆盖响应式Array的数据原型；

- 它的作用是将拦截器（加工后具备拦截功能的arrayMethods）赋值给value.__proto__，通过 __proto__ 可以很巧妙地实现覆盖value原型的功能；

- Array在getter中收集依赖，在拦截器中触发依赖；

- 收集数组的依赖 : 针对于defineReactive的val可能是一个数组的问题，我们尝试调用observer函数将val生成Observer实例childOb，如果存在，在getter收集依赖时，我们通过childOb.dep.depend()收集依赖（自身是使用dep.depend());

- 让value可以访问到当前Observer实例，获取到dep，标记是否是响应式数据：

  ![](./img/arrayProto.png)

- 当value身上被标记了 __ob__ 之后，就可以通过value.__ob__ 来访问Observer实例。如果是Array拦截器，因为拦截器是原型方法，所以可以直接通过this.__ob__ 来访问Observer实例——调用了ob.dep.notify()去通知依赖（Watcher）数据发生了改变。

  ![](./img/arrayNotify.png)

- 除了方法调用时需要拦截到对应的操作，对于一些**数据更新的操作**我们同样需要对新数据进行的新属性转换为**响应式数据进行侦测**

- observerArray循环数组的每一项尝试将其转化为响应式数据，inserted的新数据。侦测数组的每一项

  ![](./img/observerArray.png)
----

1. Array追踪变化的方式和Object不一样。因为它是通过方法来改变内容的，所以我们通过创建拦截器去覆盖数组原型的方式来追踪变化。
2. 为了不污染全局Array.prototype，我们在Observer中只针对那些需要侦测变化的数组使用__proto__ 来覆盖原型方法，但 __proto__ 在ES6之前并不是标准属性，不是所有浏览器都支持它。因此，针对不支持 __proto__ 属性的浏览器，我们直接循环拦截器，把拦截器中的方法直接设置到数组身上来拦截Array.prototype上的原生方法。
3. Array收集依赖的方式和Object一样，都是在getter中收集。但是由于使用依赖的位置不同，数组要在拦截器中向依赖发消息，所以依赖不能像Object那样保存在defineReactive中，而是把依赖保存在了Observer实例上。
4. 在Observer中，我们对每个侦测了变化的数据都标上印记 __ob__，并把this（Observer实例）保存在 __ob__ 上。这主要有两个作用，一方面是为了标记数据是否被侦测了变化（保证同一个数据只被侦测一次），另一方面可以很方便地通过数据取到 __ob__，从而拿到Observer实例上保存的依赖。当拦截到数组发生变化时，向依赖发送通知。



- 除了侦测数组自身的变化外，数组中元素发生的变化也要侦测。我们在Observer中判断如果当前被侦测的数据是数组，则调用observeArray方法将数组中的每一个元素都转换成响应式的并侦测变化。
- 除了侦测已有数据外，当用户使用push等方法向数组中新增数据时，新增的数据也要进行变化侦测。我们使用当前操作数组的方法来进行判断，如果是push、unshift和splice方法，则从参数中将新增数据提取出来，然后使用observeArray对新增数据进行变化侦测。
- 由于在ES6之前，JavaScript并没有提供元编程的能力，所以对于数组类型的数据，一些语法无法追踪到变化，只能拦截原型上的方法，而无法拦截数组特有的语法，例如使用length清空数组的操作就无法拦截。

### 注意

同时向实例的响应式对象添加多个新属性：

```js
vm.items[1] = 'x'    // 不是响应性的
vm.items.length = 2  // 不是响应性的
```

数组项响应式赋值：

```js
// Vue.set $set  如果object是响应式的，Vue.js会保证属性被创建后也是响应式的，并且触发视图更新。这个方法主要用来避开Vue.js不能侦测属性被添加的限制
Vue.set(vm.items, indexOfItem, newValue)
// Array.prototype.splice
vm.items.splice(indexOfItem, 1, newValue)
```

由于 Vue 不允许动态添加根级响应式 property，所以你必须在初始化实例前声明所有根级响应式 property (根级响应式属性是在初始化的时候所声明的)

因为 **$nextTick()** 返回一个 Promise 对象，所以你可以使用新的 ES2017 async/await 语法完成相同的事情：

```js
methods: {
    updateMessage: async function () {
        this.message = '已更新'
        console.log(this.$el.textContent) // => '未更新'
        await this.$nextTick()
        console.log(this.$el.textContent) // => '已更新'
    }
}
```

## 虚拟DOM

​		Vue.js中通过模板来描述状态与视图之间的映射关系，所以它会先将**模板**编译成**渲染函数**，然后执行渲染函数生成**虚拟节点**，最后使用虚拟节点更新视图

![](./img/compile.png)

```shell
template > ast > render function > 执行 render function > VNode
```



- 访问DOM是非常昂贵的。按照上面说的方式做，会造成相当多的性能浪费;
- 虚拟DOM的解决方式是通过状态生成一个虚拟节点树，然后使用虚拟节点树进行渲染。在渲染之前，会使用新生成的虚拟节点树和上一次生成的虚拟节点树进行对比，只渲染不同的部分;
- 在vue中绑定数据的地方，我们通过watcher来观察状态变化，如果状态被过多的节点使用，开销会很大;（中小项目？）
- **中等粒度**的vue2就是把**组件级别**作为watcher的实例，即使组件内有多个节点使用到了状态，对应该状态来说只有一个watcher指向这个组件实例，发生变化后组件内部再通过虚拟DOM对比渲染; (当状态发生变化时，只通知到组件级别，然后组件内使用虚拟DOM来渲染视图)
- 为了避免不必要的DOM操作，虚拟DOM在虚拟节点映射到视图的过程中，将虚拟节点与上一次渲染视图所使用的旧虚拟节点（oldVnode）做对比，找出真正需要更新的节点来进行DOM操作，从而避免操作其他无任何改动的DOM;
- 虚拟DOM在Vue.js中所做的事是提供虚拟节点vnode和对新旧两个vnode进行比对，并根据比对结果进行DOM操作来更新视图;
- 克隆节点实际上就是节点的复制，例如静态节点不会因为状态变化而改变内容，也就不需要重复执行渲染函数生成vnode，这时候可以克隆一份使用它就行渲染。减少重复执行渲染函数生成新的静态vnode的开销;
- 此后vnode还需要进行和缓存vnode对比，然后更新DOM节点

### 意义

- 之所以要这么做，主要是因为DOM操作的执行速度远不如JavaScript的运算速度快。
- 因此，把大量的DOM操作搬运到JavaScript中，使用patching算法来计算出真正需要更新的节点，最大限度地减少DOM操作，从而显著提升性能。
- 这本质上其实是使用JavaScript的运算成本来替换DOM操作的执行成本，而JavaScript的运算速度要比DOM快很多，这样做很划算，所以才会有虚拟DOM

### patch

1. 当oldVnode不存在时，直接使用vnode渲染视图；
2. 当oldVnode和vnode都存在但并不是同一个节点时，使用vnode创建的DOM元素替换旧的DOM元素；
3. 当oldVnode和vnode是同一个节点时，使用更详细的对比操作对真实的DOM节点进行更新



::: tip 如果这个新节点后面也是一个新增节点呢?

​	连续两个新增节点的情况下，两个黑色的已处理真实DOM节点作为参照，我们需要把节点的插入位置放在当前未处理的DOM节点的前面，两次插入后，顺序才是正常的排序

:::

![](./img/addNode.png)

对于子节点的分析，我们进行循环和旧节点对比，如果是不存在于旧节点的我们进行新增操作，如果节点存在则进行更新操作，如果位置不同则移动节点；

已处理未处理的标记位于vnode当中，而真实的DOM操作在页面上；

为了防止后续重复处理同一个节点，旧的虚拟子节点就会被设置为undefined，用来标记这个节点已经被处理并且移动到其他位置；

- 新增节点
- 更新节点：我们在节点中进行对比查找，如果找到了节点并且位置相同，则说明我们只需要进行节点的更新操作
- 移动节点：对于节点的移动操作，因为我们是循环新节点然后在旧节点当中寻找，进而通过DOM操作移动旧节点的位置，所以新节点循环过的节点都是已经处理过的节点。所以我们需要做的就是把旧节点对应的DOM节点移动到所有未处理节点的前面。
- 删除节点

![](./img/nodeLogic.png)

- [ ] 因为如果是oldChildren先循环完毕，这个时候如果newChildren中还有剩余的节点，那么说明什么问题？说明这些节点都是需要新增的节点，直接把这些节点插入到DOM中就行了，不需要循环比对了。
- [ ] 如果是newChildren先循环完毕，这时如果oldChildren还有剩余的节点，又说明了什么问题？这说明oldChildren中剩余的节点都是被废弃的节点，是应该被删除的节点。这时不需要循环对比就可以知道需要将这些节点从DOM中移除。
- [ ] patch中的优化策略能够帮助我们减少循环，当循环停止触发后，新节点start和end之间未处理的节点就是要新增的节点，同理旧节点start和end之间的节点就是要删除的节点

### Key

- 生成了一个key对应着一个节点下标这样一个对象。也就是说，如果在节点上设置了属性key，那么在oldChildren中找相同节点时，可以直接通过key拿到下标，从而获取节点。这样，我们根本不需要通过循环来查找节点。
- 我们在旧节点中寻找节点需要一个循环操作，而如果前台为列表循环时设置了key作为节点的唯一标识符，那么patch中会建立一个key对应节点的对象，获取这个节点通过key直接获取，省去了循环的时间

![](./img/key.png)

理解：dom的更新本身之后更新文本节点，而为了触发动画效果，需要span标签也重新走一次渲染，我们为span设置了一个key，那么patch过程中会把这个span节点作为新的节点处理，移除旧节点，也就触发了动画过程

### forceUpdate

常用的**强制重新渲染**的方法：

1. 刷新组件的key

2. $forceUpdate方法：通过调用组件Watcher实例的update方法，dep.notify()进而遍历触发subs[i].update()

   声明响应式时，我们为数据声明了 dep = new Dep(), dep就会是一个包含subs数组的对象，同时拥有类似addSub removeSub和notify的方法。其中notify实际上就是遍历subs这个Watcher实例数组，调用watcher的update方法，触发更新

![](./img/forceUpdate.png)

::: tip

- vm.$forceUpdate()的作用是迫使Vue.js实例重新渲染。注意它仅仅影响实例本身以及插入插槽内容的子组件，而不是所有子组件。
- 我们只需要执行实例watcher的update方法，就可以让实例重新渲染。Vue.js的每一个实例都有一个watcher。第5章介绍虚拟DOM时提到，当状态发生变化时，会通知到组件级别，然后组件内部使用虚拟DOM进行更详细的重新渲染操作。
- 事实上，组件就是Vue.js实例，所以组件级别的watcher和Vue.js实例上的watcher说的是同一个watcher。

:::

### 优缺点

​		<img src="./img/virtualDom.png" style="zoom:50%;" />

## 模板编译

![](./img/vueRender.png)

​		模板template的内容通过编译生成为render function渲染函数，然后执行渲染函数生成vnodes，虚拟DOM，虚拟dom经过patch操作页面的节点生成最终我们需要的新页面。

所以从模板到渲染函数的模板编译过程包括了三部分内容：

1. 将模板解析为AST  =>   **解析器**：包括HTML解析器、文本解析器和过滤器解析器，生成AST抽象语法树
2. 遍历AST静态节点  =>   **优化器**：就是标签AST中的静态节点，这种节点除了初始的渲染后续都不需要节点更新
3. 使用AST生成渲染函数  =>   **代码生成器**：将AST生成为渲染函数，render function执行后就能生成vnodes.

### HTML解析器

**AST**就是用JavaScript中的对象来描述一个节点，一个对象表示一个节点，对象中的属性用来保存节点所需的各种数据

- 基于HTML解析器的逻辑，我们可以在每次触发钩子函数start时，把当前构建的节点推入栈中；每当触发钩子函数end时，就从栈中弹出一个节点。
  这样就可以保证每当触发钩子函数start时，栈的最后一个节点就是当前正在构建的节点的父节点
- 就是在start时将节点推入，在end时将节点弹出 栈的特点是后入先出，那么保证栈的最后一个节点就会是当前构建节点的父节点
- 节点本身拥有子节点才需要被推入栈中，而文本节点作为读取到当前栈尾的父节点后，就可以直接从模板中删除了，不需要进行入栈的操作
- 空格也是会触发文本节点的钩子函数的，但是钩子函数中会忽略这些空格，同时在模板中将这些空格截取掉
- 读取到开始标签时，将节点推入栈中，读取到结束标签时，将节点出栈，并且也会将对应的标签从模板中删除掉

HTML解析器文本截取时的一些**片段类型**:

![](./img/htmlParser.png)

- 需要每解析一个属性就截取一个属性。如果截取完后，剩下的HTML模板依然符合标签属性的正则表达式，那么说明还有剩余的属性需要处理，此时就重复执行前面的流程，直到剩余的模板不存在属性，也就是剩余的模板不存在符合正则表达式所预设的规则

- 自闭合标签是没有子节点的，所以前文中我们提到构建AST层级时，需要维护一个栈，而一个节点是否需要推入到栈中，可以使用这个自闭合标识来判断

- 解析开始标签的过程分为三步，分别是解析标签名，然后是循环解析标签的属性，最后一步判断标签是不是单闭合标签，没执行一步解析都会将解析完的模板字符串删除  (因此，判断剩余模板是否符合开始标签的规则，只需要调用parseStartTag即可。如果调用它后得到了解析结果，那么说明剩余模板的开始部分符合开始标签的规则，此时将解析出来的结果取出来并调用钩子函数start即可)

  ![](./img/parserStartTag.png)

### 优化器

​		在虚拟DOM的更新操作中，如果发现两个节点是同一个节点，正常情况下会对这两个节点进行更新，但是如果这两个节点是静态节点，则可以直接跳过更新节点的流程。

优化器的作用是在AST中找出静态子树并打上标记，这样做有两个好处：
● 每次重新渲染时，不需要为静态子树创建新节点；
● 在虚拟DOM中打补丁的过程可以跳过。

### 代码生成器

- 通过递归AST来生成字符串，最先生成根节点，然后在子节点字符串生成后，将其拼接在根节点的参数中，子节点的子节点拼接在子节点的参数中，这样一层一层地拼接，直到最后拼接成完整的字符串。
- 同时还介绍了三种类型的节点，分别是元素节点、文本节点与注释节点。而不同类型的节点生成字符串的方式是不同的。
- 最后，我们介绍了当字符串拼接好后，会将字符串拼在with中返回给调用者。

## 整体流程

### 架构设计与项目设计

![](./img/structure.png)

Vue.js在大体上可以分三部分：**核心代码**、**跨平台相关**与**公用工具函数**。
核心代码包含原型方法和全局API，它们可以在各个平台下运行，而跨平台相关的部分更多的是渲染相关的功能，不同平台下的渲染API是不同的。
以Web平台为例，Web页面中的渲染操作就是操作DOM，所以在跨平台的Web环境下对DOM操作的API进行了封装，这个封装主要与虚拟DOM对接，而虚拟DOM中所使用的各种节点操作其实是调用跨平台层封装的API接口。而Weex平台对节点的操作与Web平台并不相同。

![](./img/initVue.png)

先向Vue构造函数的prototype属性上添加一些方法，然后向Vue构造函数自身添加一些全局API，接着将平台特有的代码导入进来，最后将编译器导入进来。最终将所有代码同Vue构造函数一起导出去

### 实例方法与全局API

- 数据相关的实例方法有3个，分别是vm.$watch、vm.$set和vm.$delete    stateMixin
- 与事件相关的实例方法有4个，分别是：vm.$on、vm.$once、vm.$off和vm.$emit     eventsMixin
- 与生命周期相关的实例方法有4个，分别是：

1. vm.$mount           跨平台的代码中挂载到Vue构造函数的prototype属性上的
2. vm.$forceUpdate       lifecycleMixin中挂载到Vue构造函数的prototype属性上的
3. vm.$nextTick          renderMixin中挂载到Vue构造函数的prototype属性上的
4. vm.$destroy           lifecycleMixin中挂载到Vue构造函数的prototype属性上的

### vm.$once

![](./img/once.png)

$on进行事件对应回调函数的绑定，在$emit触发的时候，就遍历事件的回调列表执行即可

### 事件循环

::: tip

- JavaScript是一门单线程且非阻塞的脚本语言，这意味着JavaScript代码在执行的任何时候都只有一个主线程来处理所有任务。而非阻塞是指当代码需要处理异步任务时，主线程会挂起（pending）这个任务，当异步任务处理完毕后，主线程再根据一定规则去执行相应回调。
- 事实上，当任务处理完毕后，JavaScript会将这个事件加入一个队列中，我们称这个队列为事件队列。被放入事件队列中的事件不会立刻执行其回调，而是等待当前执行栈中的所有任务执行完毕后，主线程会去查找事件队列中是否有任务。
- 异步任务有两种类型：微任务（microtask）和宏任务（macrotask）。不同类型的任务会被分配到不同的任务队列中。
- 当执行栈中的所有任务都执行完毕后，会去检查微任务队列中是否有事件存在，如果存在，则会依次执行微任务队列中事件对应的回调，直到为空。然后去宏任务队列中取出一个事件，把对应的回调加入当前执行栈，当执行栈中的所有任务都执行完毕后，检查微任务队列中是否有事件存在。无限重复此过程，就形成了一个无限循环，这个循环就叫作事件循环。
  :::

在Vue.js中，当状态发生变化时，watcher会得到通知，然后触发虚拟DOM的渲染流程。而watcher触发渲染这个操作并不是同步的，而是异步的。Vue.js中有一个队列，每当需要渲染时，会将watcher推送到这个队列中，在下一次事件循环中再让watcher触发渲染的流程。

“**下次DOM更新周期**”的意思其实是下次微任务执行时更新DOM。而vm.$nextTick其实是将回调添加到微任务中。只有在特殊情况下才会降级成宏任务，默认会添加到微任务中。

更新DOM的操作也是使用vm.$nextTick来注册到微任务的队列当中，在事件循环中，必须当微任务队列中的事件都执行完之后，才会从宏任务队列中取出一个事件执行下一轮，所以添加到微任务队列中的任务的执行时机优先于向宏任务队列中添加的任务



#### setTimeout

setTimeout属于宏任务，使用它注册的回调会加入到宏任务中。宏任务的执行要比微任务晚，

所以即便是先注册，也是先更新DOM后执行setTimeout中设置的回调。

![](./img/setTimeout.png)

在事件循环中，必须当微任务队列中的事件都执行完之后，才会从宏任务队列中取出一个事件执行下一轮，所以添加到微任务队列中的任务的执行时机优先于向宏任务队列中添加的任务

![](./img/setTimeOut1.png)

理解： 微任务的执行优先于宏任务，当数据改变实际上向微任务队列注册了DOM更新的回调，而setTimeout则作为宏任务添加到事件队列当中。事件循环会先执行微任务队列的所有回调，这里就是更新DOM，然后再执行宏任务队列的setTimeout回调。所以，虽然代码顺序里setTimeout在前，但是在事件循环里面是在微任务之后执行的，所以能获取到更新后的DOM数据

#### 执行栈

当我们执行一个方法时，JavaScript会生成一个与这个方法对应的执行环境（context），又叫执行上下文。这个执行环境中有这个方法的私有作用域、上层作用域的指向、方法的参数、私有作用域中定义的变量以及this对象。这个执行环境会被添加到一个栈中，这个栈就是执行栈。

### slice

slice() 方法返回一个新的数组对象，这一对象是一个由 begin 和 end 决定的原数组的浅拷贝（包括 begin，不包括end）。原始数组不会被改变。
slice可以将类数组对象（NodeList 通过getElementsByTagName）转化为真正的数组对象。

```js
[].slice.call([1,2,3],0,2)     // [1, 2]
Array.prototype.slice.call([1,2,3],0,2)   // [1, 2]
[].slice.call(document.getElementsByTagName('a'), 0)   // 类数组转数组
```

slice(0)相当于返回一个原始数组的浅拷贝数组

### nextTick

![](./img/nextTick.png)

立即resolve的 Promise 对象，是在本轮“事件循环”（event loop）的结束时执行执行，不是马上执行,也不是在下一轮“事件循环”的开始时执行
原因：传递到 then() 中的函数被置入了一个微任务队列，而不是立即执行，这意味着它是在 JavaScript 事件队列的所有运行时结束了，事件队列被清空之后，才开始执行

- resolve()是用来表示promise的状态为fullfilled，相当于只是定义了一个有状态的Promise，但是并没有调用它；
- promise调用then的前提是promise的状态为fullfilled；
- 只有promise调用then的时候，then里面的函数才会被推入微任务中；

#### 降级处理

我们在前面介绍过Event Loop事件循环，由于macro task和micro task特殊的执行机制，我们首先判断当前浏览器是否支持Promise，如果不支持，则降级到判断是否支持MutationObserver，如果还不支持，则继续降级到判断是否支持setImmediate，最后降级使用setTimeout。

![](./img/timerFunc.png)

```js
()=> (Promise.resolve().then(()=> {console.log(1)}))   // 1
```

#### MutationObserver

MutationObserver可以实现观测一个DOM节点的变化，new MutationObserver(callback).observe(textNode, {characterData: true}),然后执行一个能更新textNode节点内容的函数即可，MutationObserver作为观察者会通知到回调函数并执行

#### macroTimerFunc

宏任务的事件，Vue.js优先使用setImmediate，但是它存在兼容性问题，只能在IE中使用，所以使用MessageChannel作为备选方案。如果浏览器也不支持MessageChannel，那么最后会使用setTimeout来将回调添加到宏任务队列中

 setImmediate => setImmediate => setImmediate

### $mount

​		完整版和只包含运行时版本之间的差异在于是否有**编译器**，而是否有编译器的差异主要在于vm.$mount方法的表现形式。在只包含运行时的构建版本中，vm.$mount的作用如前面介绍的那样。而在完整的构建版本中，vm.$mount的作用会稍有不同，它首先会检查template或el选项所提供的模板是否已经转换成渲染函数（render函数）。如果没有，则立即进入编译过程，将模板编译成渲染函数，完成之后再进入挂载与渲染的流程中。只包含运行时版本的vm.$mount没有编译步骤，它会默认实例上已经存在渲染函数，如果不存在，则会设置一个。并且，这个渲染函数在执行时会返回一个空节点的VNode，以保证执行时不会因为函数不存在而报错。同时，如果是在开发环境下运行，Vue.js会触发警告，提示我们当前使用的是只包含运行时版本，会让我们提供渲染函数，或者去使用完整的构建版本。

#### 函数劫持

先保存初始的函数，重新声明一个函数覆盖它，在函数执行之前我们可以增加一些操作

![](./img/mount.png)
