# 函数式编程

::: tip 函数式编程的三大特征：

✅ 拒绝副作用，拥抱纯函数

✅ 函数是一等公民

✅ 避免对状态的改变

:::

:::: code-group
::: code-group-item 函数式编程

```js
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

```js
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

:::

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

```js
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

```js
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

:::

::::

`produce` 借助 Proxy，将拷贝动作发生的时机和 `setter` 函数的触发时机牢牢绑定，确保了拷贝动作的精确性。 而逐层的浅拷贝，则间接地实现了数据在新老对象间的共享。

> Immer.js 是通过逐层的浅拷贝实现“知其所止”，这里关注于函数式思想，忽略了这个实现。

## Reduce

### `reduce` 推导 `map`

```js
function add1AndPush(previousValue, currentValue) {
    // previousValue 是一个数组
    previousValue.push(currentValue + 1)
    return previousValue
}

const arr = [1,2,3]
const newArray = arr.reduce(add1AndPush, [])
```

`map()` 的过程本质上也是一个 `reduce()`的过程。

区别仅仅在于， `reduce()` 本体的回调函数入参可以是任何值，出参也可以是任何值；而 map 则是一个相对特殊的 `reduce() `,它锁定了一个数组作为每次回调的第一个入参，并且限定了 `reduce()` 的返回结果只能是数组。

### 参数组合

1. 首先，就 reduce() 过程中的单个步骤来说，每一次回调执行，都会吃进 2 个参数，吐出 1 个结果。我们可以把每一次的调用看做是把 2 个入参被【**组合**】进了 callback 函数里，最后转化出 1 个出参的过程。
2. 我们把数组中的 n 个元素看做 n 个参数，那么 `reduce()` 的过程，就是一个把 n 个参数逐步【**组合**】到一起，最终吐出 1 个结果的过程。

*reduce，动词，意为减少。这个【减少】可以理解为是参数个数的减少。*

### 函数 pipeline

`reduce()` 函数发起的工作流，可以看作是一个函数 pipeline。

尽管每次调用的都是同一个函数，但上一个函数的输出，总是会成为下一个函数的输入。

同时，`reduce()` pipeline 里的每一个任务都是一样的，仅仅是入参不同，这极大地约束了 pipeline 的能力。

*有没有可能把 pipeline 里的每一个函数也弄成不一样的呢？ JavaScript 函数可以作为参数*

## 声明式数据流

### 链式调用

:::: code-group
::: code-group-item 命令式

```js
const filteredArr = arr.filter(biggerThan2)    
const multipledArr = filteredArr.map(multi2)    
const sum = multipledArr.reduce(add, 0)
```

命令式代码产生了不必要的计算中间态。

:::
::: code-group-item 链式调用

```js
const sum = arr.filter(biggerThan2).map(multi2).reduce(add, 0)
```

:::
::: code-group-item utils

```js
// 用于筛选大于2的数组元素
const biggerThan2 = num => num > 2  
// 用于做乘以2计算
const multi2 = num => num * 2    
// 用于求和
const add = (a, b) => a + b   
```

:::

::::

---

链式调用是声明式的。基于此构建出的数据流，就是声明式的数据流。

::: tip 链式调用的前提

1. 它们都**挂载在 Array 原型的 Array.prototype** 上
2. 它们在计算结束后都会 return 一个新的 Array
3. 既然 return 出来的也是 Array，那么自然可以继续访问原型 **Array.prototype** 上的方法

> 链式调用的本质 ，是通过在方法中返回对象实例本身的 this/ 与实例 this 相同类型的对象，达到多次调用其原型（链）上方法的目的。要对函数执行链式调用，前提是函数挂载在一个靠谱的宿主 Object 上。

:::

✅ 实现声明式的数据流，除了借助链式调用，还可以借助函数组合。

### 独立函数

```js
function add4(num) {
  return num + 4
}  

function mutiply3(num) {
  return num*3
}  

function divide2(num) {
  return num/2
}

const sum =  add4(mutiply(divide2(num)))
```

🤡 独立函数无法使用链式调用，导致了回调地狱。

## 函数组合

### pipe

:::: code-group
::: code-group-item pipe

```js
// 构建 pipeline
function pipe(...funcs) {
    function callback(input, func) {
        return func(input)
    }  

    return function(param) {
        return funcs.reduce(callback, param)
    }
}
const compute = pipe(add4, mutiply3, divide2)

// 执行 pipeline：21
console.log(compute(10))

[add4, mutiply3, divide2].reduce((result, func)=> func(result), 10)  // 21
```

:::
::: code-group-item utils

```js
function add4(num) {
    return num + 4
}  

function mutiply3(num) {
    return num*3
}  

function divide2(num) {
    return num/2
}
```

:::

::::

### compose

```js
// compose 则用于创建一个倒序的函数传送带
function compose(...funcs) {
    function callback(input, func) {
        return func(input)
    }  

    return function(param) {
        return funcs.reduceRight(callback, param)
    }
}

// 21
const compute = compose(divide2, mutiply3, add4)

[divide2, mutiply3, add4].reduceRight((result, func)=> func(result), 10)
```

✅ 面向对象的核心在于继承，而**函数式编程的核心则在于组合**。

## 多元函数解决方案

::: tip 偏函数和柯里化解决的最核心的问题有两个，分别是：

- 函数组合链中的多元参数问题
- 函数逻辑复用的问题

> 函数参数里的“元数(Arity)”，指的其实就是函数参数的数量。来源于数学的“n元函数”。

:::

> 对于函数组合链来说，它总是预期链上的函数是一元函数：函数吃进一个入参，吐出一个出参，然后这个出参又会作为下一个一元函数的入参......**参数个数的对齐，是组合链能够运转的前提**。

🤡 一旦链上乱入了多元函数，那么多元函数的入参数量就无法和上一个函数的出参数量对齐，进而导致执行错误。

### 柯里化

把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术。

✅ 通俗来讲，它是这个意思： 柯里化是把 **1 个 n 元函数**改造为 **n 个相互嵌套的一元函数**的过程。

 [柯里化的实现(opens new window)](https://www.ijerrychen.com/note/manual.html#%E5%87%BD%E6%95%B0%E6%9F%AF%E9%87%8C%E5%8C%96)

:::: code-group
::: code-group-item 表现

```js
// 定义高阶函数 curry
function curry(addThreeNum) {
    // 返回一个嵌套了三层的函数
    return function addA(a) {
        // 第一层“记住”参数a
        return function addB(b) {
            // 第二层“记住”参数b
            return function addC(c) {
                // 第三层直接调用现有函数 addThreeNum
                return addThreeNum(a, b, c)
            }
        }
    }
}

// 借助 curry 函数将 add
const curriedAddThreeNum = curry(addThreeNum)
// 输出6，输出结果符合预期
curriedAddThreeNum(1)(2)(3)
```

:::
::: code-group-item useage

```js
const compute = pipe(
    curriedAdd(1), 
    curriedMultiply(2)(3), 
    curriedAddMore(1)(2)(3), 
    curriedDivide(300)
)
```

:::
::: code-group-item utils

```js
function add(a, b) {
    return a + b
}

function multiply(a, b, c) {
    return a*b*c
}

function addMore(a, b, c, d) {
    return a+b+c+d
}

function divide(a, b) {
    return a/b
}
```

:::

::::

### 偏函数

> tips: 偏函数英文是 partial application， 直译过来就是“部分应用”。

- 柯里化说的是一个 n 元函数变成 n 个一元函数。
- 偏函数，仅有函数的元发生了变化（减少了），函数的数量是不变的。

```js
// 定义一个包装函数，专门用来处理偏函数逻辑
function wrapFunc(func, fixedValue) {
    // 包装函数的目标输出是一个新的函数
    function wrappedFunc(input){
        // 这个函数会固定 fixedValue，然后把 input 作为动态参数读取
        const newFunc = func(input, fixedValue)
        return newFunc
    }
    return wrappedFunc
}
const multiply3 = wrapFunc(multiply, 3)

// 输出6
multiply3(2)
```

✅ 偏函数固定了一些入参，无需再还原逻辑。通过偏函数处理实现对存量逻辑的控制。减少重复代码的定义和重复传参。

#### 
