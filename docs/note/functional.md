# 函数式编程

::: tip 函数式编程的三大特征：

✅ 拒绝副作用，拥抱纯函数

✅ 函数是一等公民

✅ 避免对状态的改变

:::

:::: code-group
::: code-group-item 函数式编程

```ts
// 定义筛选逻辑
const ageBiggerThan24 = (person)=> person.age >= 24

// 定义排序逻辑
const smallAgeFirst = (a, b) => {
    return a.age - b.age
}

// 定义信息提取逻辑
const generateLogText = (person)=>{
    const perLogText = `${person.name}'s age is ${person.age}`
    return perLogText
}

const logText = peopleList.filter(ageBiggerThan24)
.sort(smallAgeFirst)
.map(generateLogText)
.join(',')

console.log(logText)
```
:::
::: code-group-item 命令式编程

```ts
const len = peopleList.length

// 对员工列表按照年龄【排序】
for(let i=0;i<len;i++) {
    // 内层循环用于完成每一轮遍历过程中的重复比较+交换
    for(let j=0;j<len-1;j++) {
        // 若相邻元素前面的数比后面的大
        if(peopleList[j].age > peopleList[j+1].age) {
            // 交换两者
            [peopleList[j], peopleList[j+1]] = [peopleList[j+1], peopleList[j]]
        }
    }
}

let logText = ''
for(let i=0; i<len; i++) {
    const person = peopleList[i]
    // 【筛选】出年龄符合条件的
    if( person.age >= 24 ) {
        // 从数组中【提取】目标信息到 logText
        const perLogText = `${person.name}'s age is ${person.age}`
        if(i!==len-1) {
            logText += `${perLogText},`
        } else {
            logText += perLogText
        }
    }
}

console.log(logText)
```
:::

::: code-group-item mockData

```js
const peopleList = [
    {
        name: 'John Lee',
        age: 24,
        career: 'engineer'
    },
    {
        name: 'Bob Chen',
        age: 22,
        career: 'engineer'
    },
    {
        name: 'Lucy Liu',
        age: 28,
        career: 'PM'
    },
    {
        name: 'Jack Zhang',
        age: 26,
        career: 'PM'
    },
    {
        name: 'Yan Xiu',
        age: 30,
        career: 'engineer'
    }
]
```

::::

> 函数式编程是声明式编程

## 纯函数

::: tip 纯函数

对于相同的输入，总是会得到相同的输出；

在执行过程中没有语义上可观察的副作用。

:::

`数学化的 JS 函数 === 纯函数`：函数源于数学，计算机中的函数式编程通过纯函数达到类似函数的行为。

## 一等公民函数

::: details First-class function：当一门编程语言的函数可以被当作变量一样用时，则称这门语言拥有头等函数。

> 例如，在这门语言中，函数可以被当作参数传递给其他函数，可以作为另一个函数的返回值，还可以被赋值给一个变量

:::

::: tip “可以被当做变量一样用” 意味着：

可以被当作参数传递给其他函数

可以作为另一个函数的返回值

可以被赋值给一个变量

:::

✅ JavaScript 函数的本质就是可执行**对象**。

## 持久化数据结构

对于函数式编程来说，函数的外部数据是只读的，函数的内部数据则是可写的。

对于一个纯函数来说，它需要把自己的入参当做只读数据，它也需要把自己可访问的所有全局变量/自由变量当做只读数据。 有且仅有这些外部数据，存在 **只读** 的必要。

> Git 快照保存文件索引，而不会保存文件本身。变化的文件将拥有新的存储空间 + 新的索引，不变的文件将永远呆在原地。这是 Git 应对变化的艺术，也是持久化数据结构的核心思想。
>

> Immutable.js 仅会创建变化的那部分，和一个指向源对象的指针，进而复用不变的字段。

### Immer.js

:::: code-group
::: code-group-item Immer.js

```ts
import produce from "immer"

// 这是我的源数据
const baseState = [
    {
        name: "Jerry",
        age: 99
    },
    {
        name: "Meghan",
        age: 100
    }
]

// 定义数据的写逻辑
const recipe = draft => {
    draft.push({name: "Michael", age: 101})
    draft[1].age = 102
}

// 借助 produce，执行数据的写逻辑
const nextState = produce(baseState, recipe)
```

:::
::: code-group-item Proxy

```ts
// 定义一个 programmer 对象
const programmer = {
    name: 'Jerry',
    age: 30
}

// 定义这个对象的拦截逻辑
const proxyHandler = {
    // obj 是目标对象， key 是被访问的键名
    get(obj, key) {
        if(key === 'age')
            return 100
        return obj[key]
    }
}

// 借助 Proxy，将这个对象使用拦截逻辑包起来
const wrappedProgrammer = new Proxy(programmer, proxyHandler)

// 'Jerry'
console.log(wrappedProgrammer.name)
// 100
console.log(wrappedProgrammer.age)
```

:::

::: code-group-item 核心实现

```js
function produce(base, recipe) {
    // 预定义一个 copy 副本
    let copy
    // 定义 base 对象的 proxy handler
    const baseHandler = {
        set(obj, key, value) {
            // 先检查 copy 是否存在，如果不存在，创建 copy
            if (!copy) {
                copy = { ...base }
            }
            // 如果 copy 存在，修改 copy，而不是 base
            copy[key] = value
            return true
        }
    }

    // 被 proxy 包装后的 base 记为 draft
    const draft = new Proxy(base, baseHandler)
    // 将 draft 作为入参传入 recipe
    recipe(draft)
    // 返回一个被“冻结”的 copy，如果 copy 不存在，表示没有执行写操作，返回 base 即可
    // “冻结”是为了避免意外的修改发生，进一步保证数据的纯度
    return Object.freeze(copy || base)
}
```

:::

::: code-group-item Useage

```js
// 这是我的源对象
const baseObj = {
  a: 1,
  b: {
    name: "Jc"
  }
}

// 这是一个执行写操作的 recipe
const changeA = (draft) => {
  draft.a = 2
}


// 这是一个不执行写操作、只执行读操作的 recipe
const doNothing = (draft) => {
  console.log("doNothing function is called, and draft is", draft)
}

// 借助 produce，对源对象应用写操作，修改源对象里的 a 属性
const changedObjA = produce(baseObj, changeA)

// 借助 produce，对源对象应用读操作
const doNothingObj = produce(baseObj, doNothing)

// 顺序输出3个对象，确认写操作确实生效了
console.log(baseObj)
console.log(changedObjA)
console.log(doNothingObj)

// 【源对象】 和 【借助 produce 对源对象执行过读操作后的对象】 还是同一个对象吗？
// 答案为 true
console.log(baseObj === doNothingObj)
// 【源对象】 和 【借助 produce 对源对象执行过写操作后的对象】 还是同一个对象吗？
// 答案为 false
console.log(baseObj === changedObjA)
// 源对象里没有被执行写操作的 b 属性，在 produce 执行前后是否会发生变化？
// 输出为 true，说明不会发生变化
console.log(baseObj.b === changedObjA.b)
```

::::

`produce` 借助 Proxy，将拷贝动作发生的时机和 `setter` 函数的触发时机牢牢绑定，确保了拷贝动作的精确性。 而逐层的浅拷贝，则间接地实现了数据在新老对象间的共享。

> Immer.js 是通过逐层的浅拷贝实现“知其所止”，这里关注于函数式思想，忽略了这个实现。
