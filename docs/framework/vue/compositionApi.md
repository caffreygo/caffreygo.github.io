# Composition API

## setup函数

::: tip setup(props, context)

- setup(props, context)函数在vue实例被初始化之前执行，return返回的数据可以在模板中使用
- setup内部不能使用this这样的关键词来获取实例上的属性和方法等
- 
  组件可以使用 **this.$options.setup**获取调用

:::

```js
const app = Vue.createApp({
    template: `
		<div @click="handleClick">{{name}}</div>
	`,
    methods: {
        test() {
            console.log(this.$options.setup());
        }
    },
    mounted() {
        this.test();
    },
    // created 实例被完全初始化之前
    setup(props, context) {
        return {
            name: 'dell',
            handleClick: () => {
                alert(123)
            }
        }
    }
});
const vm = app.mount('#root');
```

## ref, reactive 响应式的引用

::: tip ref, reactive

- 原理，通过 proxy 对数据进行封装，当数据变化时，触发模版等内容的更新
- ref 处理基础类型的数据
- reactive 处理非基础类型的数据

:::

1. ref将基本数据类型转化为响应式属性后，其实是转化成了proxy的对象，需要通过**attr.value**对数据进行**更改**
2. 但是在模板中vue如果发现该数据是基本类型的响应式数据会自动取得value值，所有**模板**中直接**{{attr}}**即可

```js
const app = Vue.createApp({
    template: `
		<div>{{name}}</div>
	`,
    setup(props, context) {
        const { ref } = Vue;
        // proxy , 'dell' 变成 proxy({value: 'dell'}) 这样的一个响应式引用
        let name = ref('dell');
        setTimeout(() => {
          name.value = 'lee'
        }, 2000)
        return { name }
    }
});
const vm = app.mount('#root');
```

1. reactive将非基础类型数据转化为proxy对象
2. toRefs可以将proxy对象属性再提取出来，对于不存在但是被结构的属性将会undefined

```js
const app = Vue.createApp({
    template: `
		<div>{{name}}</div>
	`,
    setup(props, context) {
        const { reactive, readonly, toRefs } = Vue;
        // proxy , { name: 'dell'} 变成 proxy({ name: 'dell'}) 这样的一个响应式引用
        const nameObj = reactive({name: 'dell', age: 28});
        setTimeout(() => {
            nameObj.name = 'lee'
        }, 2000)
        const { name, age } = toRefs(nameObj);
        return { name }
    }
});
const vm = app.mount('#root');
```

## toRef以及context参数

::: tip ref和toRef

- 利用`ref`函数将某个对象中的属性变成响应式数据，修改响应式数据是不会影响到原始数据。原因在于，`ref`的本质是拷贝，与原始数据没有引用关系
- 而如果使用`toRef`将某个对象中的属性变成响应式数据，修改响应式数据会**影响**到原始数据

:::

### context

- attrs: `this.$attrs`组件的non-props属性
- slots: `this.$slots`
- emit:`this.$emit`

```js
const app = Vue.createApp({
    methods: {
        handleChange() {
            alert('change');
        }
    },
    template: `<child @change="handleChange">parent</child>`,
});

app.component('child', {
    template: '<div @click="handleClick">123123</div>',
    setup(props, context) {
        const { h } = Vue;
        const { attrs, slots, emit } = context;
        function handleClick() { emit('change'); }
        return { handleClick }
    }
})
const vm = app.mount('#root');
```

## TodoList

将功能内容分开封装更易于维护

```js
// 关于 list 操作的内容进行了封装
const listRelativeEffect = () => {
    const { reactive } = Vue;
    const list = reactive([]);
    const addItemToList = (item) => {
        list.push(item);
    }
    return { list, addItemToList }
}

// 关于 inputValue 操作的内容进行了封装
const inputRelativeEffect = () => {
    const { ref } = Vue;
    const inputValue = ref('');
    const handleInputValueChange = (e) => {
        inputValue.value = e.target.value
    }
    return { inputValue, handleInputValueChange}
}

const app = Vue.createApp({
    setup() {
        // 流程调度中转
        const { list, addItemToList } = listRelativeEffect();
        const { inputValue, handleInputValueChange} = inputRelativeEffect();
        return {
            list, addItemToList,
            inputValue, handleInputValueChange
        }
    },
    template: `
    <div>
        <div>
            <input :value="inputValue" @input="handleInputValueChange" />
            <button @click="() => addItemToList(inputValue)">提交</button>
        </div>
        <ul>
        	<li v-for="(item, index) in list" :key="index">{{item}}</li>
        </ul>
    </div>
`,
});

const vm = app.mount('#root');
```

## computed计算属性

computed接受一个回调**函数**或者一个可以定义getter和setter的**对象**

```js
const app = Vue.createApp({
    setup() {
        const { reactive, computed } = Vue;
        const countObj = reactive({ count: 0});
        const handleClick = () => {
            countObj.count += 1;
        }
        let countAddFive = computed({
            get: () => {
                return countObj.count + 5;
            },
            set: (param) => {
                countObj.count = param;
            }
        })

        setTimeout(() => {
            countAddFive.value = 100;
        }, 3000)

        return { countObj, countAddFive, handleClick }
    },
    template: `
    <div>
    	<span @click="handleClick">{{countObj.count}}</span> -- {{countAddFive}}
    </div>
`,
});

const vm = app.mount('#root');
```

## watch和watchEffect

::: tip watch 侦听器

- 具备一定的惰性 lazy：不会立即执行，但是可以设置 { immediate: true }来达到效果
- 参数可以拿到原始和当前值
- 可以侦听多个数据的变化，用一个侦听器承载
- watch的第一个参数是getter/setter Function、响应式变量或者响应式对象
- `const stop = watch()`，stop函数可以销毁watch的监听

:::

```js
const app = Vue.createApp({
    setup() {
        const { reactive, watch, watchEffect, toRefs } = Vue;
        const nameObj = reactive({
            name: 'dell', englishName: 'lee'
        })
        watch([() => nameObj.name, () => nameObj.englishName], ([curName, curEng], [prevName, preEng]) => {
            console.log('watch', curName, prevName, '---', curEng, preEng);
        }, { immediate: true })

        const { name, englishName } = toRefs(nameObj);
        return { name, englishName }
    },
    template: `
    <div>
        <div>
        	Name: <input v-model="name"> 
        </div>
        <div>
        	Name is {{name}}
        </div>
        <div>
        	EnglishName: <input v-model="englishName"> 
        </div>
        <div>
        	EnglishName is {{englishName}}
        </div>
    </div>
`,
});

const vm = app.mount('#root');
```

::: tip watchEffect

- 立即执行，没有惰性 immediate
-  不需要传递你要侦听的内容，自动会感知代码依赖(响应式数据)，不需要传递很多参数，只要传递一个回调函数
- 不能获取之前数据的值

:::

```js
const stop = watchEffect(() => {
    console.log(nameObj.name);
    console.log(nameObj.englishName);
    setTimeout(() => {
        stop();
    }, 5000)
})
```

## 声明周期函数

::: tip 

- onRenderTracked：每次渲染后重新收集响应式依赖
- onRenderTriggered：每次触发页面重新渲染时自动执行
- 删除了beforeCreated和created，因为setup是在这两个声明周期函数之间执行的

:::

```js
const app = Vue.createApp({
    // beforeMount => onBeforeMount
    // mounted => onMounted
    // beforeUpdate => onBeforeUpdate
    // beforeUnmount => onBeforeUnmount
    // unmouted => onUnmounted
    setup() {
        const {
            ref, onBeforeMount, onMounted, onBeforeUpdate, onUpdated,
            onRenderTracked, onRenderTriggered
        } = Vue;
        const name = ref('dell')
        onBeforeMount(() => {
            console.log('onBeforeMount')
        })
        onMounted(() => {
            console.log('onMounted')
        })
        onBeforeUpdate(() => {
            console.log('onBeforeUpdate')
        })
        onUpdated(() => {
            console.log('onUpdated')
        })
        onRenderTracked(() => {
            console.log('onRenderTracked')
        })
        onRenderTriggered(() => {
            console.log('onRenderTriggered')
        })
        const handleClick = () => {
            name.value = 'lee'
        }
        return { name, handleClick }
    },
    template: `
    <div @click="handleClick">
    	{{name}}
    </div>
`,
});

const vm = app.mount('#root');
```

## provide和inject

::: tip

- provide在上层组件提供数据和更改的方法
- jeject在孙子组件获取
- 通过readonly(name)防止数据在孙子组件内通过name.value更改

:::

```js
const app = Vue.createApp({
    setup() {
        const { provide, ref, readonly } = Vue;
        const name = ref('dell');
        provide('name', readonly(name));
        provide('changeName', (value) => {
            name.value = value;
        });
        return { }
    },
    template: `
    <div>
    	<child />
    </div>
`,
});

app.component('child', {
    setup() {
        const { inject } = Vue;
        const name = inject('name');
        const changeName = inject('changeName');
        const handleClick = () => {
            changeName('lee');
        }
        return { name, handleClick }
    },
    template: '<div @click="handleClick">{{name}}</div>'
})

const vm = app.mount('#root');
```

## ref获取模板dom节点

- 模板内`ref="hello"`定义节点的ref属性
- setup内`const hello = ref(null)`

```js
// CompositionAPI 的语法下，获取真实的 DOM 元素节点
const app = Vue.createApp({
    setup() {
        const { ref, onMounted } = Vue;
        const hello = ref(null);
        onMounted(() => {
            console.log(hello.value);
        })
        return { hello }
    },
    template: `
    <div>
    	<div ref="hello">hello world</div>
    </div>
`,
});

const vm = app.mount('#root');
```

