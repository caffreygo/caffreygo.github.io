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

### 一等公民函数

::: details First-class function：当一门编程语言的函数可以被当作变量一样用时，则称这门语言拥有头等函数。

> 例如，在这门语言中，函数可以被当作参数传递给其他函数，可以作为另一个函数的返回值，还可以被赋值给一个变量

:::

::: tip “可以被当做变量一样用” 意味着：

可以被当作参数传递给其他函数

可以作为另一个函数的返回值

可以被赋值给一个变量

:::

✅ JavaScript 函数的本质就是可执行**对象**。
