# 基础语法

## 组件事件封装

```js
const events = eventNames
	.map(evt=> evt.toLocalLowerCase())
	.map(eventName=> ({
        completeName: 'Plotly_'+eventName,
        handler: context => (...args) => {
            context.$emit.apply(context, [eventName, ...args])
        }
    }))
```

```js
mounted() {
    Plotly.newPlot(this.$el, this.data, ...)
	events.forEach(evt => {
        // this.$el  Plotly的Dom元素.on(event, handler)
        this.$el.on(evt.completeName, evt.handler(this))
    })
}
```

## NPM组件发布

https://www.npmjs.com/package/kl-test-data

### 组件添加install方法

```js
// 导入组件，组件必须声明 name
import KlTestData from "./src/KlTestData.vue";

// 为组件提供 install 安装方法，供按需引入
KlTestData.install = function(Vue) {
  Vue.component(KlTestData.name, KlTestData);
};

// 默认导出组件
export default KlTestData;
```

### 插件注册方法

```js
import KlTestData from "./KlTestData";
// 存储组件列表
const components = [KlTestData];

/* 
  定义install 方法，接收Vue作为参数，如果使用use注册插件，则所有的组件都将被注册
*/
const install = function(Vue) {
   // 判断是否安装
  if (install.installed) {
    return;
  }

  components.map(item => {
    Vue.component(item.name, item);
  });
};
// 判断是否引入文件
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}
export default {
  install,
  KlTestData
};
```

### 组件的使用案例

```js
/* main.js */
// 导入组件库
import ComColorButton from './../packages/index'
// 注册组件库
Vue.use(ComColorButton)
```

### 编译命令行

以下我们在 scripts 中新增一条命令 npm run lib

- --target: 构建目标，默认为应用模式。这里修改为 lib 启用库模式。
- --dest : 输出目录，默认 dist。这里我们改成 lib
- [entry]: 最后一个参数为入口文件，默认为 src/App.vue。这里我们指定编译 packages/ 组件库目录。

```json
"scripts": {
    "lib": "vue-cli-service build --target lib --name vcolorpicker --dest lib packages/index.js"
}
```

### 编译和发布

#### 执行编译库命令

```shell
npm run lib
```

#### npm配置

- private：是否私有，需要修改为 false 才能发布到 npm
- version: 版本号，每次发布至 npm 需要修改版本号，不能和历史版本号相同

```json
{
  "name": "kl-test-data",
  "version": "0.1.1",
  "main": "lib/klTestData.umd.min.js",
  "description": "Component, showing TestData",
  "private": false,
  "author": {
    "name": "Jerry Chen",
    "email": "caffreygo@163.com"
  },
  "keywords": [
    "TestData"
  ],
  "license": "MIT",
}
```

####  .npmignore

```
# 忽略目录
examples/
packages/
public/

# 忽略指定文件
vue.config.js
babel.config.js
*.map
```

#### 发布到npm

```shell
npm login
npm publish
```

## 事件

- 单次点击触发两次事件：`@click=“handleClick1()，habdleClick2()”`
- 不响应子元素的点击：`@click.self`
- `@scroll.passive`增加滚动性能（解决chrome性能警告）
- 键盘修饰符`@keydown.enter deleye`
- 鼠标修饰符`@click.left right middle`
- 精确修饰符, 单独点击ctrl触发`@clock.ctrl.exact`

### V-model修饰符

`v-model. lazy number trim` 

## 组件基础

### 局部组件

 `components: { name: componentObj }`

### 全局组件

`app. component(name, configObj) `

```js
const component = {
	data() {},
    template: '<div>child component</div>'
}
```

### Function类型的传值

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/vue/functionProp.png)

### validator

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/vue/validator.png)

### 对象多属性传值

```js
data() {
    return {
        params: {
            a: 1,
            b: 2
        }
    }
}
```

下面两种形式等价，直接`v-bind`传递，适合需要多个参数传递给子组件的情况

```html
<child v-bind="params" />

<child :a="params.a" :b="params.b" />
```

### 驼峰属性名

```html
<child data-hello="hello" />
```

子组件使用`dataHello`使用该参数，html不能传**dataHello**这样的属性，只能用**data-hello**

### Non-props | $attrs

::: tip Non-props

1. 父组件向子组件传递属性的时候，子组件不写props属性接受的这些属性；
2. 子组件在接受到这些属性后，会把属性放着子组件**最外层**的**DOM标签**下；
3. 可以设置**inheritAttrs**不写入到DOM (组件的**根元素 继承特性**);
4. 应用：class样式
5. 当子组件根节点不止一个时，将不会自动继承这些属性，可以通过`$attrs`获取

:::

- 父组件

  ```html
  <child msg="hello" />
  ```

- 子组件

  ```
  app.component('child', {
  	template: `<div>child component</div>`
  })
  ```

- 渲染效果

  ```html
  <div msg="hello">child component</div>
  ```

- 有多个根节点时不会写入，使用`$attrs`得到Non-props

  ```js
  app.component('child', {
      template: `
          <div :msg="$attrs.msg">child component</div>
          <div v-bind="$attrs">child component</div>
          <div>child component</div>
  `
  })
  ```


### emits 校验

::: tip emits

emits表示组件将向外触发的事件列表，如果触发的事件不在emits数组里,开发环境下会抛出警告。

```js
app.component('child', {
    props: ['count'],
    emits: ['add'],
    methods: {
      handleClick() {
          this.$emit('add', this.count + 3)
      }  
    },
	template: `<div @click="handleClick">{{ count }}</div>`
})
```

:::

- emits还可以是一个对象，每个事件名都是一个**函数**，对emit事件的参数进行校验 （返回一个布尔值以指示事件**是否有效**）
- 当属性值设置未null表示没有校验

```js
app.component('counter', {
    props: ['count'],
    emits: {
        add: (count) => {
            if(count > 0) {
                return true
            }
            return false
        }
    },
    methods: {
      handleClick() {
          this.$emit('add', this.count + 3)
      }  
    },
	template: `<div @click="handleClick">{{ count }}</div>`
})
```

## v-model

#### 父组件

```js
const app = Vue.createApp({
    data() {
        return { count: 1 }
    },
    template:'<counter v-model="count" />'
})
```

#### 子组件

- 子组件通过**update:modelValue**接收v-model的传递的值
- 子组件向外触发的事件名必须是**update:modelValue**

```js
app.component('counter', {
    props: ['modelValue'],
    methods: {
      handleClick() {
          this.$emit('update:modelValue', this.modelValue + 3)
      }  
    },
	template: `<div @click="handleClick">{{ modelValue }}</div>`
})
```

### v-model 自定义参数名

如果不希望使用**modelValue**作为参数名：

- 父组件：**v-model:app**

```js
const app = Vue.createApp({
    data() {
        return { count: 1 }
    },
    template:'<counter v-model:app="count" />'
})
```

- 子组件：**update:app**

```js
app.component('counter', {
    props: ['app'],
    methods: {
      handleClick() {
          this.$emit('update:app', this.modelValue + 3)
      }  
    },
	template: `<div @click="handleClick">{{ app }}</div>`
})
```

### v-model 多个属性

```js
// 父组件
const app = Vue.createApp({
    data() {
        return { 
            count: 1,
            count1: 2,
        }
    },
    template:'<counter v-model:count="count" v-model:count1="count1" />'
})

// 子组件
app.component('counter', {
    props: ['count','count1'],
    methods: {
        handleClick() {
            this.$emit('update:count', this.count + 3)
        },
        handleClick1() {
            this.$emit('update:count1', this.count1 + 3)
        }
    },
    template: `
        <div @click="handleClick">{{ count }}</div>
        <div @click="handleClick1">{{ count1 }}</div>
`
})
```

### v-model 修饰符 modelModifiers

requirement: 希望通过自定义修饰符 uppercase 自动将改变后的数据大写

```js
// 父组件
const app = Vue.createApp({
    data() {
        return { 
            count: 'a',
        }
    },
    template:'<counter v-model.uppercase="count" />'
})

// 子组件
app.component('counter', {
    props: {
        'modelValue': String,
        'modelModifiers': {
            // 不传递修饰符的时候，默认修饰符是个空对象,组件可以通过this.modelModifiers访问
            default: () => ({}),
        }
    },
    methods: {
      handleClick() {
          let newValue = this.modelValue + 'b';
          if(this.modelModifiers.uppercase) {
              // 如果有uppercase修饰符，调用字符串toUpperCase方法将首字母大写
              newValue = newValue.toUpperCase()
          }
          this.$emit('update:modelValue', newValue)
      }  
    },
	template: `<div @click="handleClick">{{ modelValue }}</div>`
})

// 组件渲染
const vm = app.mount('#root');
```

#### 自定义参数的修饰符

对于带参数的 `v-model` 绑定，生成的 prop 名称将为 `arg + "Modifiers"`：

父组件： 

```html
<my-component v-model:foo.capitalize="bar"></my-component>
```

子组件通过 this**.fooModifiers** 访问:

```js
app.component('my-component', {
  props: ['foo', 'fooModifiers'],
  template: `
    <input type="text" 
      :value="foo"
      @input="$emit('update:foo', $event.target.value)">
  `,
  created() {
    console.log(this.fooModifiers) // { capitalize: true }
  }
})
```

## 插槽

### 基础插槽

- slot 插槽

- 父模板里面调用的数据属性，使用的都是父模板里面的数据
- 子模板里面调用的数据属性，使用的都是子模板里面的数据
- 默认值：`<slot>default value</slot>`在未传递插槽内容的时候显示

```js
// 父组件
const app = Vue.createApp({
    data() {
        return {
            text: '提交'
        }
    },
    template:`
        <myform>
            <div>{{text}}</div>
        </myform>
        <myform>
            <button>{{text}}</button>
        </myform>
	`
})

// 子组件  （插槽是不能绑定事件的，可以在插槽外面加一个标签监听）
app.component('myform', {
    methods: {
      handleClick() {
          alert(123)
      }  
    },
	template: `
        <div>
            <input />
            <span @click="handleClick">
                <slot>default value</slot>
            </span>
        </div>
	`
})

const vm = app.mount('#root');
```

### 具名插槽

- 父组件 `v-slot:name`
- 子组件 `<slot name="name"></slot>`

```js
// 父组件
const app = Vue.createApp({
    template:`
        <layout>
			<template v-slot:header>
				<div>header</div>
			</template>
			<template v-slot:footer>
				<div>header</div>
			</template>
        </layout>>
	`
})

// 子组件
app.component('layout', {
	template: `
        <div>
			<slot name="header"></slot>
            <div>content</div>
			<slot name="footer"></slot>
        </div>
	`
})

const vm = app.mount('#root');
```

### 作用域插槽

#### 插槽简写  #slotName

```html
<template v-slot:header>
    <div>header</div>
</template>
<template v-slot:footer>
    <div>header</div>
</template>
```

简写：

```html
<template #header>
    <div>header</div>
</template>
<template #footer>
    <div>header</div>
</template>
```

#### 作用域插槽

::: tip 

- 当子组件渲染的内容需要由父组件决定的时候
- 因为父组件只能使用自己作用域内的数据，实现在父组件内去调用子组件的数据

:::

- 子组件将item数据传递给item属性
- 父组件使用slot时，通过`v-slot="slotProps"`的**数据对象**接收使用

```js
// 父组件
const app = Vue.createApp({
    template:`
        <list v-slot="slotProps">
        	<div>{{ slotProps.item }}</div>    // 传递给子组件的slot
        </list>
	`
})

// 子组件
app.component('list', {
    data() {
        return {
            list: [1,2,3]
        }
    }
	template: `
        <div>
            <slot v-for="item in list" :item="item"/>
        </div>
	`
})

const vm = app.mount('#root');
```

::: tip 对象结构语法

```js
const app = Vue.createApp({
    template:`
        <list v-slot="{ item }">
        	<div>{{ item }}</div>
        </list>
	`
})
```

:::

## 动态组件和异步组件

### 动态组件

- 根据数据的变化，结合`component`标签来随时动态切换组件
- 可以结合使用`keep-alive`组件，来保留组件切换前的状态

```js
// 父组件
const app = Vue.createApp({
    data() {
        return {
            componentName: 'common-item'
        }
    },
    template:`
		<keep-alive>
			<component :is="componentName" />
		</keep-alive>
		<button @click="handleClick">切换</button>
	`,
    methods: {
        handleClick() {
            this.componentName = this.componentName==='common-item'?'input-item':'common-item'
        }
    }
})

// 子组件
app.component('common-item', {
	template: `
        <div>common-item</div>
	`
})

app.component('input-item', {
	template: `
        <div>input-item</div>
	`
})

const vm = app.mount('#root');
```

### 异步组件

调用**Vue.defineAsyncComponent（fn）**方法，参数函数返回一个**Promise**

```js
const AsyncCommonItem = Vue.defineAsyncComponent(() => {
    return new Promise((resolve, reject) => {
        setTimeout(()=> {
            resolve({
                template: `<div>this is an async component</div>`
            })
        },4000)
    });
});

// 父组件
const app = Vue.createApp({
    data() {
        return {
            componentName: "common-item",
        };
    },
    template: `
        <div>
        <common-item />
        <async-common-item />
        </div>
	`,
});

// 子组件
app.component("common-item", {
    template: `
<div>common-item</div>
`,
});

app.component("async-common-item", AsyncCommonItem);

const vm = app.mount("#root");
```

## v-once

表示标签只会被渲染一次，后续即使数据发生了变化也不会再更新视图

- 第一个div标签内初始数据未1，点击不会更新
- 第二个div伴随着点击，数据会更新

```js
const app = Vue.createApp({
    data() {
        return {
            count: 1,
        };
    },
    template: `
        <div @click="count += 1" v-once>
            {{count}}
        </div>
        <div>{{count}}</div>
	`,
});

const vm = app.mount("#root");
```

## Provide & Inject

组件嵌套多级时（**跨组件的多级传递**），数据传递繁琐：

```js
const app = Vue.createApp({
    data() {
        return {
            count: 1,
        };
    },
    template: `
    <div>
    	<child :count="count" />
    </div>
`,
});
app.component('child', {
    props: ['count'],
    template: `<child-child :count="count"/>`
})

app.component('child-child', {
    props: ['count'],
    template: `<div>{{count}}</div>`
})

const vm = app.mount("#root");
```

### Provide搭配Inject

```js
const app = Vue.createApp({
    data() {
        return {
            count: 1,
        };
    },
    provide: {
        count: 1,
    },
    template: `
    <div>
    	<child :count="count" />
    </div>
`,
});
app.component('child', {
    template: `<child-child />`
})

app.component('child-child', {
    inject: ['count'],
    template: `<div>{{count}}</div>`
})

const vm = app.mount("#root");
```

### 传递data的数据

- 如果想传递data里面的数据，需要把**provide**改写成**函数**形式；
- provide提供的数据**不是响应式**的，点击之后`child-child`组件不会发生改变；

```js
const app = Vue.createApp({
    data() {
        return {
            count: 1,
        };
    },
    provide() {
        return {
            count: this.count
        }
    },
    template: `
    <div>
        <div>{{count}}</div>
        <child :count="count" />
        <button @click="count += 1">Add</button>
    </div>
`,
});
app.component('child', {
    template: `<child-child />`
})

app.component('child-child', {
    inject: ['count'],
    template: `<div>{{count}}</div>`
})

const vm = app.mount("#root");
```

