# Vue.js 高级语法

## Mixin 混入

```js
mixins: [myMixin]    // 局部的mixin
```

- 组件data、methods优先级高于mixin数据优先级 (合并策略：覆盖)
- 声明周期函数，先执行mixin里面的，再执行组件里面的

### 全局mixin

- 局部的mixin只能在混入的组件内使用mixin的内容
- 全局的mixin可以在任何组件位置内使用（自动注入）
- 代码维护性不高

```js
app.mixin({
    data() {
        return {
            // ...
        }
    },
    created() {
      	// ...  
    },
    methods: {
        // ...
    }
})
```

### 自定义优先级

自定义属性的优先级高于mixin属性的优先级 （和data、methods一样）

```js
const myMixin = {
    number: 1
}
const app = Vue.createApp({
    minxins: [myMixin],
    number: 2,
    data() {
        return {
        }
    },
    template: '<div>{{ this.$options.number }} </div>'
})

const vm = app.mount('#root');
```

以上页面将会展示 **2**，我们也可以重写属性的合并策略，在声明optionMergeStrategies的number合并策略后，将显示 **1**

```js
const myMixin = {
    number: 1
}

const app = Vue.createApp({
    mixins: [myMixin],
    number: 2,
    template: `
    <div>
    	<div>{{this.$options.number}}</div>
    </div>
`
});

app.config.optionMergeStrategies.number = (mixinVal, appValue) => {
    return mixinVal || appValue;
}

const vm = app.mount('#root');
```

## 自定义指令

输入框自动聚焦

```js
const app = Vue.createApp({
    mounted() {
        this.$refs.input.focus()
    },
    template: `
    <div>
    	<input ref="input" />
    </div>
`
})
const vm = app.mount('#root');
```

### 自动聚焦指令

```js
const app = Vue.createApp({
    template: `
    <div>
    	<input v-focus />
    </div>
`
})
app.directive('focus', {
    // 当元素被挂载到页面dom之后，mounted函数会自动执行
    mounted(el) {
        el.focus()
    }
})
const vm = app.mount('#root');
```

### 局部自定义指令

```js
const directives = {
    focus: {
        mounted(el) {
            el.focus()
        }
    }
}

const app = Vue.createApp({
    directives,
    template: `
    <div>
    	<input v-focus />
    </div>
`
})
const vm = app.mount('#root');
```

### 声明周期函数

1. 执行`vm.$data.show = false`, beforeUpdate、updated依次打印 （display的变化）
2. 当改成`v-if`时，beforeUnmount、unmounted依次打印

```js
const directives = {
    focus: {
        beforeMount() {
            console.log('beforeMount')
        },
        mounted(el) {
            console.log('mounted')
            el.focus()
        },
        beforeUpdate() {
            console.log("beforeUpdate")
        },
        // 元素已经重新更新渲染
        updated() {
            console.log("updated")
        },
        beforeUnmount() {
            console.log("beforeUnmount")
        },
        unmounted() {
            console.log("unmounted")
        }
    }
}

const app = Vue.createApp({
    directives,
    data() {
        return {
            show: true
        }
    },
    template: `
<div>
<div v-show="show">
<input v-focus />
</div>
</div>
`
})
const vm = app.mount('#root');
```

## Teleport传送门功能

Teleport组件能够将组件内的内容挂载到其它确定的DOM节点下，并且模板内能够使用当前组件的数据

以下demo实现了一个简单的蒙层组件：

```js
const app = Vue.createApp({
    data() {
        return {
            show: false,
            message: 'hello'
        }
    },
    methods: {
        handleBtnClick() {
            this.show = !this.show;
        }
    },
    template: `
    <div class="area">
        <button @click="handleBtnClick">按钮</button>
        <teleport to="#hello">
        	<div class="mask" v-show="show">{{message}}</div>
        </teleport>
    </div>
`
});

const vm = app.mount('#root');
```

css:

```css
.area {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 300px;
    background: green;
}
.mask {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #000;
    opacity: 0.5;
    color: #fff;
    font-size: 100px;
}
```

## render函数

render函数返回virtual dom，除了使用**h**函数生成vnode之外，也可以直接写vnode节点返回

```js
// render function
// template -> render -> h -> 虚拟DOM（JS对象）-> 真实 DOM -> 展示到页面上
const app = Vue.createApp({
    template: `
    <my-title :level="2">
    	hello dell
    </my-title>
`
});

app.component('my-title', {
    props: ['level'],
    render() {
        const { h } = Vue;
        return h('h' + this.level, {}, [
            this.$slots.default(),
            h('h4', {}, 'dell')
        ])
    }
})

const vm = app.mount('#root');
```

直接返回vnode:

```js
render(h, context) {
    const { icon, title } = context.props;
    const vnodes = [];

    if (icon) {
        if (icon.includes("el-icon")) {
            vnodes.push(<i class={[icon, "sub-el-icon"]} />);
    	} else {
        	vnodes.push(<svg-icon icon-class={icon} />);
		}
	}

	if (title) {
    	vnodes.push(<span slot="title">{title}</span>);
	}
	return vnodes;
}
```

## 插件的定义和使用

### 插件介绍

- 插件plugin可以是一个包含install方法的对象，也可以直接是install这个函数
- 参数app是Vue实例，options是插件使用时传入的参数`app.use(pluginName, options)`
- plugin 插件, 也是把通用性的功能封装起来
- vue全局属性：**app.config.globalProperties**

```js
const myPlugin = {
    install(app, options) {
        app.provide('name', 'Dell Lee');
        app.directive('focus', {
            mounted(el) {
                el.focus();
            }
        })
        app.mixin({
            mounted(){
                console.log('mixin')
            }
        })
        app.config.globalProperties.$sayHello = 'hello world';
    }
}

const app = Vue.createApp({
    template: `
		<my-title />
	`
});

app.component('my-title', {
    inject: ['name'],
    mounted() {
        console.log(this.$sayHello);
    },
    template: `<div>{{name}}<input v-focus /></div>`
})

app.use(myPlugin, { name: 'dell'});

const vm = app.mount('#root');
```

### 数据校验插件

- 属性内增加**rules**属性，可以通过**this.$options.rules**获取
- 插件内使用mixin在created对需要校验的属性增加watcher，不符合validator时打印错误信息

```js
const app = Vue.createApp({
    data() {
        return { name: 'dell', age: 23}
    },
    rules: {
        age: {
            validate: age => age > 25,
            message: 'too young, to simple'
        },
        name: {
            validate: name => name.length >= 4,
            message: 'name too short'
        }
    },
    template: `
		<div>name:{{name}}, age:{{age}}</div>
	`
});

const validatorPlugin = (app, options) => {
    app.mixin({
        created() {
            for(let key in this.$options.rules) {
                const item = this.$options.rules[key];
                this.$watch(key, (value) => {
                    const result = item.validate(value);
                    if(!result) console.log(item.message);
                })
            }
        }
    })
}

app.use(validatorPlugin);
const vm = app.mount('#root');
```

