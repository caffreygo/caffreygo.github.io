# 日常笔记

## Vue

### 父子组件方法调用

- 子组件想要调用父组件的方法，可以直接传递Function类型；
- 或者可以直接父组件@click=“event”，默认子组件为inheritAttrs是true会默认添加到自组件最外层标签；
- 如果inheritAttrs为false，可以绑定v-bind=“$attrs”给目标标签；

### 插槽

1. 在默认只有default一个插槽的情况下，可以直接在组件`v-slot="slotProps"`或者`#default="slotProps"`,不需要套template标签

2. 通过props向子组件传递数据，子组件的插槽再通过`<slot :id="props.id" />`给父组件插槽的组件传递数据，父组件的插槽位置组件便可以使用该数据

   ```vue
   <template>
   	<div>
     	{{lesson.title}}
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

   ```vue
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

1. 使用ES6语法的导出export时，其他文件引入该文件需要设置script标签的`type=“module”`

   然后才能import:  `import App from "./App.js"`

2. `import "file.js"`会立即执行该js文件

   `import App friom "file.js"`在为调用任何内容的情况下则不会

