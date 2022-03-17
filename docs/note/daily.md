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

## TypeScript

### 对象所有键

```typescript
type ObjKey = keyof typeof obj;
```

