# 日常笔记

## Vue

### 父子组件方法调用

- 子组件想要调用父组件的方法，可以直接传递Function类型
- 或直接父组件`@click=“event”`，默认子组件为`inheritAttrs: true`会默认添加到子组件最外层标签
- 如果`inheritAttrs: false`，可以绑定`v-bind=“$attrs”`给目标标签（这种情况相当于把所有事件和属性都绑定给了对应的标签，局限性比较大）
- 最好的方式就是子组件`emit`出自定义事件由父组件接收处理 🔑

### 插槽

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

## Javascript

### ES6 module

1. 使用ES6语法的导出export时，html页面引入该文件需要设置script标签的`type=“module”`

   然后才能import:  `import App from "./App.js"`

2. `import "file.js"`会这种方式引入会**立即执行**该js文件

   `import App friom "file.js"`在**引入而未调用**的情况下则不会

