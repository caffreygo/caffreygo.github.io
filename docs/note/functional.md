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

## 范畴论启发下的函数设计模式

`Functor`、`Monad`、`Semigroup`、`Monoid`......这些由范畴论推导出来的编码模式，我们可以记为“范畴论设计模式”。

::: tip 盒子的共性

- 盒子是一个存放数据的容器，它的内部肯定会维护一套数据。这套数据总是以盒子入参的形式传入，总是作为我们整个组合链的起点。
- 同时，盒子内部可以定义一系列操作数据的函数。这些函数未必需要具备【**创建并返回新的盒子**】的能力，但是**关键的函数、决定盒子性质的那些函数**，往往需要具备这个能力。

:::

### 组合问题的链式解法

不借助 `compose/pipe` 函数，构造声明式的数据流。

✅  构造一个【能够创造新盒子】盒子：

:::: code-group
::: code-group-item Box

```js
const Box = x => ({
    map: f => Box(f(x)),
    valueOf: () => x
})

const newBox = Box(10).map(add4)  
// 输出 14
newBox.valueOf()

// 值为 21
const computeBox = Box(10)
.map(add4)
.map(mutiply3)
.map(divide2)
.valueOf()
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

✅ 范畴论对于函数式编程最关键的影响，就在于“复合”，或者说在于“函数的组合”。

::: details 盒子 💡

- 此盒又名 `Functor`（函子），一个 `Functor` 就是一个能够被映射的“东西”。这里，`Functor` 指的是一个实现了 map 方法的数据结构。
- 产生函子，保证纯函数，方便统一接口，组合运算。map 更像提供一种集合的映射能力，map 接收的函数表示这段映射之间的关系。

:::

## Functor 函子

Array 其实就是一种 Functor，它也是一种实现了 map 方法的数据结构：

```js
const fruits = ['apple', 'orange', 'banana', 'papaya']   

const fruitsWithSugar = fruits.map((fruit)=> `Super Sweet ${fruit}`)
```

### Identity Functor

为了标识 Functor 的类别，可以给它补充一个 inspect 函数：

```js
const Identity = x => ({
    map: f => Identity(f(x)),
    valueOf: () => x,
    inspect: () => `Identity {${x}}`
})
```

✅ 通过往 map 行为里“加料”，我们就可以制作出不同的 Functor

### Maybe Functor

```js
const isEmpty = x => x === undefined || x === null  

const Maybe = x => ({
    map: f => isEmpty(x) ? Maybe(null) : Maybe(f(x)),  
    valueOf: () => x,  
    inspect: () => `Maybe {${x}}`
})
```

如果入参 x 为空（undefined 或者 null），那么 isEmpty 就会返回 true，接下来 map 方法就不会再执行 f 函数的，而是直接返回一个空的 Maybe 盒子。

✅ 将错误在内部进行捕捉处理，避免程序 crash

### 合法的 Functor

:::tip Functor 的“生存法则”，一个合法的 Functor 需要满足以下条件：

1. 恒等性（Identity） 
2. 可组合性（Composition）

:::

:::: code-group
::: code-group-item Identity

```js
// const identity = x => x

const originArr = [1, 2, 3]  

const identityArr = originArr.map(x=>x)  

// 输出 [1, 2, 3] 
console.log(identityArr)
```

✅  将恒等函数传入 map 后，最终的映射结果 `identityArr` 和源数据 `originArr` 是等价的：

- 确保你的 map 方法具备“创造一个新的盒子（Functor）”的能力
- 确保你的 map 方法足够“干净”

:::
::: code-group-item Composition

```js
Functor.map(x => f(g(x))) = Functor.map(g).map(f)
```

✅  “盒子模式”是函数组合的另一种解法。

:::

::::

## Monad 单子

Monad 是一个同时实现了 map 方法和 `flatMap` 方法的盒子。

### 嵌套盒子

嵌套的盒子，这里指的是在 Functor 内部嵌套 Functor 的情况。

::: tip 导致嵌套 Functor 的典型 case

- 线性计算场景下的嵌套 Functor —— Functor 作为另一个 Functor 的计算中间态出现
- 非线性计算场景下的嵌套 Functor —— 两个 Functor 共同作为计算入参出现

:::

:::: code-group
::: code-group-item 线性计算场景下的嵌套

```js
// 在任何情况下都会返回一个 Maybe Functor
const getUserSafely = id => {  
    try {
        const userInfo = getUser(id)
        return Maybe(userInfo)
    } catch(e) {
        return Maybe(null)
    }
}

const targetUser = {
    id: 1100013,  
    credits: 2000,  
    level: 20
}

const userContainer = Maybe(targetUser)  

const extractUserId = user => user && user.id

const userInfo = userContainer.map(extractUserId).map(getUserSafely)
```

- `map` 对每次计算的结果都会进行一次包装，确保链式调用的可能：` Maybe(f(x))`；
- `map(getUserSafely)` 的参数已经是一个 Maybe Functor, 通过 map 之后又被 Maybe Functor 包装了一次。；
- `userInfo` 的最终结果将是一个两层 Maybe Functor 嵌套的 `userInfo` 数据结构。

:::
::: code-group-item  + utils

```js
const isEmpty = x => x === undefined || x === null

// Maybe Functor
const Maybe = x => ({
    map: f => isEmpty(x) ? Maybe(null) : Maybe(f(x)),  
    valueOf: () => x,  
    inspect: () => `Maybe {${x}}`
})

const isExisted = id => id % 3 === 0

const getUser = id => {  
    if(isExisted(id)) {
        return {
            id,
            nickName: String(id).slice(0, 3)
        }
    } else {
        throw new Error("User not found")
    }
}
```

:::
::: code-group-item 非线性计算场景下的嵌套

```js
// 该函数将对给定 score 作权重为 high 的计算处理
const highWeights = score => score*0.8

// 该函数将对给定 score 作权重为 low 的计算处理
const lowWeights = (score) => score*0.5

const computeFinalScore = (generalScore, healthScore) => {
    const finalGeneralScore = highWeights(generalScore)  
    const finalHealthScore = lowWeights(healthScore)  
    return finalGeneralScore + finalHealthScore
}

const computeFinalScore1 = (generalScore, healthScore) => 
Identity(highWeights(generalScore))
.map(
    finalGeneralScore => 
    Identity(lowWeights(healthScore))
    .map(
        finalhealthScore => 
        finalGeneralScore + finalhealthScore
    )
)
```

- `generalScore` 和 `healthScore` 同时作为数据源存在，都是 `computeFinalScore` 函数的入参。从逻辑上来说，它们应该是**平行**的关系。
- 当我们用盒子模式去实现非线性的计算过程的时候，就不得不像示例这样，把另一个数据源 `healthScore` 也包装成一个盒子，放进 `generalScore` 的 `map` 里面去。导致嵌套 Functor 的产生

:::

::::

### flatMap

:::: code-group
::: code-group-item Monad

```js
const Monad = x => ({
    map: f => Monad(f(x)),
    // flatMap 直接返回 f(x) 的执行结果
    flatMap: f => f(x),

    valueOf: () => x,
    inspect: () => `Monad {${x}}`,
})
```

:::
::: code-group-item  Monad Class

```js
class Monad { 
    constructor(x) {
        this.val = x
    }


    map(f) { 
        return Monad.of(f(this.val)) 
    } 

    flatMap(f) { 
        return this.map(f).valueOf()
    }

    valueOf() {
        return this.val
    }
}

Monad.of = function(val) {
    return new Monad(val);
}  

const monad = Monad.of(1)  
const nestedMonad = Monad.of(monad)  

// 输出 Monad {val: 1}，符合“不嵌套”的预期
console.log(nestedMonad.flatMap(x => x))
```

:::

::::

`flatMap` 就是一个打开盒子的过程，直接调用其参数函数 `x => f(x)`，返回值就是函数的计算结果。

```js
const highWeights = score => score*0.8
const lowWeights = (score) => score*0.5

const computeFinalScore = (generalScore, healthScore) => 
Monad(highWeights(generalScore))
.flatMap(
    finalGeneralScore => 
    Monad(lowWeights(healthScore))
    .flatMap(
        finalhealthScore => 
        finalGeneralScore + finalhealthScore
    )
)

// Monad(highWeights(200)).flatMap(x=>x) 160
// Monad(lowWeights(100)).flatMap(x=>x) 50

const finalScore = computeFinalScore(200, 100)  // 210
```

::: tip flatMap 和 map 其实很像，区别在于它们对回调函数 f(x) 的预期：

- `map` 预期 `f(x)` 会输出一个具体的值。这个值会作为下一个“基础行为”的回调入参传递下去。
- 而 `flatMap` 预期 `f(x)` 会输出一个 Functor，它会像剥洋葱一样，把 Functor 里包裹的值给“剥”出来。确保最终传递给下一个“基础行为”的回调入参，仍然是一个具体的值。

:::

✅  不管这个方法叫啥，只要它在 Functor 的基础上，实现了楼上描述的这个“剥洋葱”般的逻辑，它都足以将一个 Functor 拓展为 Monad。（行为决定性质）

## Semigroup 与 Monoid

::: tip 加法和乘法有两个关键的共性：

- 它们都满足结合律。

  ```
  (1 + 2) + 3 = 1 + (2 + 3)
  (1 * 2) * 3 = 1 * (2 * 3)
  ```

- 它们都是闭合的。（在数学中，闭合意味着我们对某个集合的成员进行运算后，生成的仍然是这个集合的成员）

  > `1、2、3` 三个整数做完加法后，得到的计算结果 6 也是一个整数。`1 * 2 * 3` 三个整数做完乘法后，得到的计算结果 6 也是一个整数。这就是所谓的“闭合”。

:::

### Semigroup

在整数运算的加法/乘法中，`+ / *` 是一个运算符，可以用来计算两个任意的整数以获得另一个整数。因此，加法运算/乘法运算在所有可能的整数集合上形成一个 Semigroup。

::: tip JavaScript 中的 SemiGroup:

- 整数的加法和乘法
- (boolean, &&)，布尔值的“与”运算
- (boolean, ||)，布尔值的“或”运算
- (string, +/concat) ，字符串的拼接（并集）运算。
- (Array, concat)，数组的拼接（并集）运算

:::

:::: code-group
::: code-group-item Add

```js
// 定义一个类型为 Add 的 Semigroup 盒子
const Add = (value) => ({
    value,  
    // concat 接收一个类型为 Add 的 Semigroup 盒子作为入参
    concat: (box) => Add(value + box.value)
})   

// 输出一个 value=6 的 Add 盒子
Add(1).concat(Add(2)).concat(Add(3))
```

:::
::: code-group-item  Multi

```js
// 定义一个类型为 Multi 的 Semigroup 盒子
const Multi = (value) => ({
    value,  
    // concat 接收一个类型为 Multi 的Semigroup 盒子作为入参
    concat: (box) => Multi(value * box.value)
})   

// 输出一个 value=60 的 Multi 盒子
Multi(3).concat(Multi(4)).concat(Multi(5))
```

:::

::::

### Monoid

- Monoid 是一个拥有了 `identity element` 的半群：`Monoid = Semigroup + identity element`
- `identity element` “单位元”。它和任何运算数相结合时，都不会改变那个运算数。
- 在函数式编程中，单位元也是一个函数，我们一般把它记为 `empty()` 函数。也就是说，Monoid = Semigroup + `empty()` 函数。

```js
// 定义一个类型为 Add 的 Semigroup 盒子
const Add = (value) => ({
    value,  
    // concat 接收一个类型为 Add 的 Semigroup 盒子作为入参
    concat: (box) => Add(value + box.value)
})   


// 这个 empty() 函数就是加法运算的单位元
Add.empty = () => Add(0)

// 输出一个 value=3 的 Add 盒子
Add.empty().concat(Add(1)).concat(Add(2))
```

