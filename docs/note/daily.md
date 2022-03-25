# 日常笔记

## Vue

### 父子组件方法传递

::: tip 理解

- 子组件想要调用父组件的方法，可以直接传递Function类型

- 或直接父组件`@click=“event”`，默认子组件为`inheritAttrs: true`会默认添加到子组件最外层标签

  📗 事件`@event=“handler“`和属性一样都会被添加到子组件的最外层标签，这会将父组件的方法和属性传递给子组件。属性通过props接收，事件通过emits触发

- 如果`inheritAttrs: false`，可以绑定`v-bind=“$attrs”`给目标标签（这种情况相当于把所有事件和属性都绑定给了对应的标签，局限性比较大）

- 最好的方式就是子组件`emit`出自定义事件由父组件接收处理

:::

### $event

事件指令不写处理方法，也可以直接写代码，模板内可以直接使用`$event`参数得到**原生事件对象**或者**自定义事件参数**

```html
<input :value="model" @input="model = $event.target.value" />

<button @click="console.log($event.target)">单击</button>
```

### v-model

```html
<JcInput :value="title" @update:value="(newVal)=> title = newValue" />

<JcInput :value="title" @update:value="title = $event" />

<JcInput v-model:value="model" />
```

📗 如果子组件props的名字是**modelValue**，即对应`v-model:modelValue`和事件`@update:modelValue`，可以简写成`v-model`

### provide/inject

```javascript
provide: { webName: "helloWorld" }
```

provide提供数据时如果希望使用`this`的引用，需要将provide转化为一个函数：

```javascript
provide() {
  return { webName: this.webName}
}
```

provide注入的数据是**非响应式**的，为了解决这个问题可以：

- 提供一个js引用类型数据（对象）

  ```javascript
  provide() {
    return { webName: this.webName}
  }，
  data() {
    return {
      webName: {
        label: "helloWorld"
      }
    }
  }
  
  // 子组件使用： webName.label
  ```

- 如果还是希望使用基本数据类型，可以用computed将它包装成计算属性

  ```javascript
  provide() {
    return { webName: computed(()=> this.webName) }
  }
  ```

📗 在组合式api中，如果希望数据时响应式的，因为ref已经包装成了引用类型数据：

```javascript
let data = ref("hello");
provide('data', data);
provide('updateData', (newData)=> data.value = newData);
```

### slot插槽

```html
<slot name="header" :data="slotData">default content</slot>

<template #header="slotData">
  <div @click="show(slotData)">
    hello world    
  </div>
</template>
```

1. 在默认只有default一个插槽的情况下，可以直接在组件`v-slot="slotProps"`或者`#default="slotProps"`，且不需要套template标签

2. 通过props向子组件传递数据，子组件的插槽再通过`<slot :id="props.id" />`给父组件插槽的组件传递数据，父组件的插槽位置组件便可以使用该数据

   ```html
   <template>
     <div>
       <span>{{lesson.title}}</span>
       <slot :id="lesson.id" />
     </div>
   </template>
   
   <script>
     export default {
       name: "Lesson",
       props: ["lesson"]
     }
   </script>
   ```

   ```html
   <template>
     <lesson v-for="lesson of lessons" :key="lesson.id" :lesson="lesson">
       <template #default="{id}">
         <button @click="del(id)">删除</button>
       </template>
     </lesson>
   </template>
   ```

### 生命周期

- beforeCreate： 组件创建之前，this为undefined
- created：实例已经创建，但未渲染，this可以访问，但模板数据还未真正的挂载。所以还不能操作模板，this.$refs.el为undefined
- beforeMount：DOM被挂载之前，依然不能读取DOM元素
- mounted：DOM挂载完毕，可以访问模板

```html
父组件 beforeCreate
父组件 created
父组件 beforeMount

子组件 beforeCreate
子组件 created
子组件 beforeMount
子组件 mounted

父组件 mounted
```

- beforeUpdate：更新之前，此时模板还未更新
- updated：视图更新完毕
- beforeUnmount：组件卸载之前
- unmounted：组件卸载完毕，适用于比如播放器/定时器的销毁

### watchEffect

::: tip watchEffect

- 启动的时候就会被执行
- 函数声明内使用的响应式数据发生变化时会自动执行
- 返回值时一个可以停止监听的函数

:::

```javascript
let num = ref(3);

watch(num, (v)=> {
  if(v < 0) num.value = 0; 
})

const stop = watchEffect(()=> {
  if(num.value < 0) num.value = 0;
})

// 让监听失效：stop()  
```

### setup中的ref

```html
<template>
	<child ref="childRef" @change="handleChange" :init="3" />
  {{ handleChange() }}
</template>

<script>
import Child from "./components/child.vue";
import { ref, onMounted } from "vue";
export default {
  components: { Child },
  setup() {
    const childRef = ref();
		const handleChange = (v) => childRef.value?.num;
    return { childRef, handleChange }
  }
}
</script>
```

```html
<template>
  <button @click="sub">sub</button>
  	{{ num }}
  <button @click="add">add</button>
</template>

<script>
import { ref, watchEffect } from "vue";
export default {
  props: { init: Number, default: 3 },
  emits: ['change'],
  setup(props, context) {
    const { emit, expose } = context;
    let num = ref(props.init);
    let add = ()=> {
      num.value++
      emit('change', num.value)
    }
    let sub = ()=> {
      num.value--
      emit('change', num.value)
    }
    watchEffect(()=> {
      if(num.value < 0) num.value = 0
      emit('change', num.vaue)
    })
    // 让child组件只暴露num属性
    expose({ num })
    return { num, add, sub }
  }
}
</script>
```

### setup中的context

::: tip setup函数中的context包含了emit、expose、attrs和slots

1. emit即`this.$emits`
2. expose可以只将需要暴露的属性或方法声明给外部
3. attrs即`this.$attrs`，当使用该方法需要声明`inheritAttrs: false`
4. slots获取插槽： `const defaults = slots.default()`返回一个组件数组

:::

```html
<!-- 显示父组件默认插槽内的第二个标签 -->
<component :is="defaults[1]" />
```

### suspense

suspense组件可以处理全局异步问题，setup中使用await移步方法的时候不需要写async，当setup函数执行完后才会渲染组件。suspsense组件有两个插槽：

```html
<suspense>
  <template #default>
    <div>
      <todo />
    </div>
  </template>
  <template #fallback>
    loading
  </template>
</suspense>
```

```html
<script setup>
import { ref } from "vue"
const todos = ref([])
// setup中可以使用await
todos.value = await fetch(`http://127.0.0.1:3003/news`).then(res=> {
  return new Promise(resolve => {
    setTimeout(()=> resolve(res.json()), 2000)
  })
})
</script>
```

### Transition

使用Transition组件，在未显示定义name属性的情况下，name默认为v，class如下：

```shell
{name}-enter-from
{name}-enter-active
{name}-enter-to

{name}-leave-from
{name}-leave-active
{name}-leave-to
```

除了直接定义class，组件自身也允许我们传入**自定义动画类名**，因此可借助animate.css（https://animate.style/）

`appear`允许初始加载的时候也有动画

```vue
<Transition
            appea=""
            enter-active-class="animate__animated animate__flip"
            enter-active-class="animate__animated animate__rotateOut"
            >
  <hello-world v-if="show" ></hello-world>
</Transition>
```

#### 动画钩子函数

组件还提供了动画钩子函数动画钩子函数，可借助gsap帮助我们操作元素

```vue
<script setup>
import { ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
const show = ref(false)

const beforeEnter = (el) => {
  gsap.set(el, {
    opacity: 0
  })
}

const enter = (el, done) => {
  gsap.to(el, {
    opacity: 1,
    duration: 2,
    onComplete: done
  })
}

const leave = (el, done) => {
  gsap.to(el, {
    opacity: 0,
    duration: 2,
    onComplete: done
  })
}
</script>

<template>
  <!-- beforeEnter enter afterEnter beforeLeave leave afterLeave -->
  <transition @before-enter="beforeEnter" @enter="enter" @leave="leave">
    <hello-world v-if="show">hello world</hello-world>
  </transition>
  <button @click="show = !show">切换</button>
</template>
```

#### 多标签的动画过渡

对于多标签切换时位置抖动的问题：

1. 将元素设置为绝对定位，外层套一个相对定位的父组件，切换时则是在原位置上切换
2. 使用**mode为**`out-in`，即当前元素先消失之后，另一个元素才出来

使用额外的class可以达到重写animate的duration的效果

```vue
<script setup>
import 'animate.css'
import { ref } from 'vue'
const action = ref('on')
</script>

<template>
  <section>
    <transition
      enter-active-class="animate__animated animate__zoomIn jc"
      leave-active-class="animate__animated animate__zoomOut jc"
      mode="out-in"
    >
      <button v-if="action == 'on'" @click="action = 'off'" class="on">开启</button>
      <button v-else @click="action = 'on'" class="off">关闭</button>
    </transition>
  </section>
</template>

<style lang="scss">
// section {
//   position: relative;
//   button {
//     position: absolute;
//   }
// }
.jc {
  animation-duration: 5s !important;
}
button {
  border: none;
  padding: 5px 10px;
  color: #fff;
  &.on {
    background-color: #16a085;
  }
  &.off {
    background-color: #d35400;
  }
}
</style>

```

#### TransitionGroup

::: tip 动画组

可以一次性控制所有子元素的动画效果，同时还有`v-move`允许我们配置其余元素位置移动时的动画效果

- enter时为不同index元素设置不同的动画延迟时间，达到按序动画的效果
- appear允许初始化就出现该动画
- `todo-move`定义了其他元素移动的平滑过渡动画
- `todo-leave-active`设置元素消失时为绝对定位，不占空间（外层使用当前组件要套一个相对定位元素），让后面元素平滑上移

:::

```vue
<script setup>
import gsap from 'gsap'

const prop = defineProps({
	duration: { default: 0.6 },
	delay: { default: 0.2 },
	tag: { default: null }
})
const beforeEnter = (el) => {
	gsap.set(el, {
		opacity: 0
	})
}

const enter = (el, done) => {
	gsap.to(el, {
		opacity: 1,
		duration: prop.duration,
		delay: el.dataset.index * prop.delay,
	})
}

</script>

<template>
	<transition-group :tag="tag" appear name="todo" @before-enter="beforeEnter" @enter="enter">
		<slot />
	</transition-group>
</template>

<style lang="scss">
.todo-leave-to {
	opacity: 0;
	transform: scale(0);
}
.todo-leave-active {
	transition: 1s ease;
	position: absolute;
}
.todo-move {
	transition: all 1s ease;
}
</style>
```

## vue-router

- 页面兜底

  `:any(.*)`这边括号内的正则即匹配除了换行外的一个或多个字符，any表示任意参数，可随意

  ```javascript
  path: "/:any(.*)"
  ```

- RouterView组件

  ```html
  <router-view #default="{route, Component}">
  	<div :class="route.meta?.class">
          <component :is="Component" />
      </div>
  </router-view>
  ```

### 命名视图

同一个页面当中可以使用多个`RouterView`组件，不同的视图设置不同的name，默认上default。对应的路由的定义当中components属性：

```javascript
let route = {
  path: "/",
  name: "home",
  components: {
    default: CustomNavigation,  // 默认试图渲染的组件
		navigation: HomeView  // navigation视图组件，如果有，在渲染时代替DefaultNavigation
  }
}
```

```html
<router-view name="navigation" #default="{ Component }">
  <component :is="Component ?? DefaultNavigation" />
</router-view>
<router-view name="default" />
```

### 路由别名

route配置中有`alias`属性，它可以是string或array，为当前页面设置其它的路径

```javascript
alias： "/:id(\\d+).html"     // ‘/123.html’
alias: ["/hello", "/world"]
```

### 路由守卫

路由的守卫包括**全局守卫**，**路由中定义的守卫**和**组件路由守卫**

- 当页面跳转时

1. beforeRouteLeave  离开组件
2. beforeEach  全局前置守卫
3. beforeEnter  路由前置守卫
4. beforeRouteEnter  组件前置守卫
5. beforeResolve  全局解析守卫
6. afterEach 全局后置守卫

- 当路由更新时

1. beforeEach 全局前置守卫
2. beforeRouteUpdate  组件更新守卫
3. beforeResolve  全局解析守卫
4. afterEach  全局后置守卫

```javascript
router.beforeEach((to, from)=> {
  // return true/false
  
  // return new Promise((resolve, reject)=> {
  //   setTimeout(()=> resolve(true), 2000)
  // })
  
  // return await new Promise((resolve)=> {
  //   resolve(false)
  // })
  
  // if(to.name === "about") next('/login')
  // else next()
  if(to.name === "about") return '/login'   // return from
})
```

组件路由守卫的使用

```javascript
const loadData = async ()=> {
  return await new Promise(resolve=> {data: '1'})
}
beforeRouteEnter((ro, from, next)=> {
  next(async (vm)=> {
    vm.data = await loadData()
  })
})
async beforeRouteUpdate() {
  this.data = await loadData()
}
```

## JavaScript

### sort

📗 sort是按照字符串ASCII码的顺序进行排序的，所以首先应该把数组元素都转化成字符串（如有必要），以便进行比较。

https://www.asciitable.com/

```javascript
[1,2,4,9,11,12].sort()
// (6) [1, 11, 12, 2, 4, 9]  转化成字符串比较，1开始在前

['Ana', 'ana', 'john', 'John'].sort()
// (4) ['Ana', 'John', 'ana', 'john']  大写字母的ASCII值较小，排前面

['Ana', 'ana', 'john', 'John'].sort((a, b) => {
    if (a.toLowerCase() < b.toLowerCase()) { return -1;}
    if (a.toLowerCase() > b.toLowerCase()) { return 1; }
    return 0;
})
// (4) ['Ana', 'ana', 'john', 'John']  忽略大小写之后当前sort函数则无作用: a < b 
```

如果希望小写字母排前面（或带有重音符号的字符），可以使用`localeCompare`方法：

```javascript
['Ana', 'ana', 'john', 'John'].sort((a,b)=> a.localeCompare(b))
// (4) ['ana', 'Ana', 'john', 'John']

const names2 = ['Maève', 'Maeve'];
names2.sort((a, b) => a.localeCompare(b))
// (2) ['Maève', 'Maeve']
```

### 数组迭代器

📗 ES2015为Array类增加了一个`@@iterator`属性，需要通过`Symbol.iterator`来访问:

```javascript
const numbers = [1,2,3,4,5];
let iterator = numbers[Symbol.iterator](); //获取数组迭代器
iterator.next().value; // 1
iterator.next().value; // 2
iterator.next().value; // 3
iterator.next().value; // 4
iterator.next().value; // 5
```

ES2015还增加了三种从数组中得到迭代器的方法: entries、keys和values

```javascript
let aEntries = numbers.entries(); // 得到键值对的迭代器
console.log(aEntries.next().value); // [0, 1] - 位置0 的值为1
console.log(aEntries.next().value); // [1, 2] - 位置1 的值为2
console.log(aEntries.next().value); // [2, 3] - 位置2 的值为3

const aValues = numbers.values();
console.log(aValues.next()); // { value: 1, done: false }
console.log(aValues.next()); // { value: 2, done: false }
console.log(aValues.next()); // { value: 3, done: false }
```

可以使用`for...of`遍历迭代器

```javascript
aEntries = numbers.entries();
for (const n of aEntries) {
	console.log(n);
}
```

### ES6 module

1. 使用ES6语法的导出export时，html页面引入该文件需要设置script标签的`type=“module”`

   然后才能import:  `import App from "./App.js"`

2. `import "file.js"`会这种方式引入会**立即执行**该js文件

   `import App friom "file.js"`在**引入而未调用**的情况下则不会

### 对象结构赋值

```javascript
const jc = { article: "hello" };
const { article: hello } = jc;
console.log(hello);  // "hello"
```

### weakMap与Map

::: tip 基本上，Map和Set与其弱化版本之间仅有的区别是：
❑ WeakSet或WeakMap类没有entries、keys和values等方法；
❑ 只能用对象作为键。

:::

- 创建和使用这两个类主要是为了性能。WeakSet和WeakMap是弱化的（用对象作为键），没有强引用的键。这使得JavaScript的垃圾回收器可以从中清除整个入口。
- 另一个优点是，必须用键才可以取出值。这些类没有entries、keys和values等迭代器方法，因此，除非你知道键，否则没有办法取出值。使用WeakMap类封装ES2015类的私有属性。

```javascript
const items = new WeakMap();

class Stack {
    constructor () {
        items.set(this, []);
    }
    push(element){
        const s = items.get(this);
        s.push(element);
    }
    pop(){
        const s = items.get(this);
        const r = s.pop();
        return r;
    }
}
```

## TypeScript

### 对象所有键

```typescript
type ObjKey = keyof typeof obj;
```

