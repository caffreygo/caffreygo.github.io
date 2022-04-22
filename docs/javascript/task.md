# 任务管理

🌐 [事件循环详解 (opens new window)](http://www.inode.club/node/event_loop.html#%E8%AF%A6%E7%BB%86%E8%AE%B2%E8%A7%A3)

```js
async function async1() {
  console.log('async1 start')     // 2
  await async2()    // async函数执行时遇到await先返回，await异步完成后再执行，也就是后面的执行相当于在async2 resolve当中执行
  console.log('async1 end')   // 7 微任务
}

async function async2() {
  console.log('async2')     // 3  async2执行完成后把 async1 await后面的执行推入微任务队列: ['async1 end']
}

console.log('script start')     // 1

setTimeout(function() {
  console.log('setTimeout0')   // 9 次轮循环  宏任务
}, 0)

setTimeout(function() {
  console.log('setTimeout3')   // 11 次轮循环  宏任务
}, 3)

setImmediate(() => console.log('setImmediate'))   // 10 次轮循环  宏任务

process.nextTick(() => console.log('nextTick'))   // 6  微任务  ['nextTick', 'async1 end']

async1()     // 2

new Promise(function(resolve) {
  console.log('promise1')   // 4  Promise是一个立即执行函数
  resolve()                 // microTaskQueue: ['nextTick', 'async1 end', 'promise3']
  console.log('promise2')   // 5  resolve后不会终结promise的参数函数的执行
}).then(function() {
  console.log('promise3')   // 8 异步微任务
})

console.log('script end')   // 6
```

## 任务队列

📗 JavaScript 语言的一大特点就是**单线程**，也就是说同一个时间只能处理一个任务。为了协调事件、用户交互、脚本、UI 渲染和网络处理等行为，防止主线程的不阻塞，（事件循环）Event Loop的方案应用而生。

::: tip JavaScript 处理任务是在等待任务、执行任务 、休眠等待新任务中不断循环中，也称这种机制为事件循环。

- 主线程中的任务执行完后，才执行任务队列中的任务
- 有新任务到来时会将其放入队列，采取先进先执行的策略执行队列中的任务
- 比如多个 `setTimeout` 同时到时间了，就要依次执行

:::

任务包括 script(整体代码)、 setTimeout、setInterval、DOM渲染、DOM事件、Promise、XMLHTTPREQUEST等

### 原理分析

下面通过一个例子来详细分析宏任务与微任务

```js
console.log("Jerry");
setTimeout(function() {
    console.log("定时器");
}, 0);
Promise.resolve()
    .then(function() {
    console.log("promise1");
})
    .then(function() {
    console.log("promise2");
});
console.log("Hello");

#输出结果为
Jerry
Hello
promise1
promise2
定时器
```

1. 先执最前面的宏任务 script，然后输出

   ```js
   script start
   ```

2. 然后执行到`setTimeout`异步宏任务，并将其放入宏任务队列，等待执行

3. 之后执行到`Promise.then`微任务，并将其放入微任务队列，等待执行

4. 然后执行到主代码输出

   ```js
   script end
   ```

5. 主线程所有任务处理完成

6. 通过事件循环遍历微任务队列，将刚才放入的`Promise.then`微任务读取到主线程执行，然后输出

   ```js
   promise1
   ```

7. 之后又执行 `promse.then` 产生新的微任务，并放入微任务队列

8. 主线程任务执行完毕

9. 现次事件循环遍历微任务队列，读取到promise2微任务放入主线程执行，然后输出 

   ```js
   promise2
   ```

10. 主线程任务执行完毕

11. 此时微任务队列已经无任务，然后从宏任务队列中读取到 `setTimeout`任务并加入主线程，然后输出

    ```js
    setTimeout
    ```

> 宏任务实际上就是次轮事件循环。当前事件循环的微任务清空，结束本轮循环，下次事件循环开始才会执行。

### 脚本加载

📗 引擎在执行任务时不会进行DOM渲染（同步的），所以如果把`script` 定义在前面

📌 要先执行完任务后再渲染DOM，建议将`script` 放在 BODY 结束标签前。

### 定时器

定时器会放入异步任务队列，也需要等待同步任务执行完成后执行。

下面设置了 6 毫秒执行，如果主线程代码执行10毫秒，定时器要等主线程执行完才执行。

📌 HTML标准规定最小时间不能低于4毫秒，有些异步操作如DOM操作最低是16毫秒，总之把时间设置大些对性能更好。

```js
setTimeout(func,6);
```

下面的代码会先输出 `hello` 之后输出 `jerry`

```js
setTimeout(() => {
  console.log("jerry");  // 宏任务队列
}, 0);
console.log("hello");
```

> 这是对定时器的说明，其他的异步操作如事件、XMLHTTPREQUEST 等逻辑是一样的

### 微任务

📌 微任务一般由用户代码产生，微任务较宏任务执行优先级更高，`Promise.then` 是典型的微任务

💡💡 实例化 Promise 时执行的代码是同步的，then注册的回调函数是异步微任务的 💡💡

任务的执行顺序是同步任务、微任务、宏任务所以下面执行结果是 `1、2、3、4`

```js
setTimeout(() => console.log(4));  // 宏任务

new Promise(resolve => {
  resolve();
  console.log(1);  // promise声明 同步任务
}).then(_ => {
  console.log(3);  // 微任务
});

console.log(2);  // 同步任务
```

我们再来看下面稍复杂的任务代码

```js
setTimeout(() => {
    console.log("定时器");  // 4
    setTimeout(() => {
        console.log("timeout timeout");  // 7
    }, 0);
    new Promise(resolve => {
        console.log("settimeout Promise");   // 5
        resolve();
    }).then(() => {
        console.log("settimeout then");  // 6
    });
}, 0);
new Promise(resolve => {
    console.log("Promise");   // 1
    resolve();
}).then(() => {
    console.log("then");  // 3
});
console.log("hello");   // 2
```

以上代码执行结果为

```json
Promise
hello
then
定时器
settimeout Promise
settimeout then
timeout timeout
```

## 实例操作

### 进度条

下面的定时器虽然都定时了一秒钟，但也是按先进行出原则，依次执行

```js
let i = 0;
setTimeout(() => {
  console.log(++i);  // 1
}, 1000);

setTimeout(() => {
  console.log(++i);  // 2
}, 1000);
```

下面是一个进度条的示例，将每个数字放在一个任务中执行

```html
<body>
  <style>
    body {
      padding: 30px;
    }
    #hd {
      height: 30px;
      background: yellowgreen;
      width: 0;
      text-align: center;
      font-weight: bold;
    }
  </style>
  <div id="hd"></div>
</body>

<script>
  function view() {
    let i = 0;
    (function handle() {
      hd.innerHTML = i + "%";
      hd.style.width = i + "%";
      if (i++ < 100) {
        setTimeout(handle, 20);  // 每次执行完之后，通过setTimeout添加一个新的宏任务，不会阻塞主线程的执行
      }
    })();
  }
  view();
  console.log("定时器开始了...");
</script>
```

### 任务分解

📌 一个比较耗时的任务可能造成游览器卡死现象，所以可以将任务拆分为多小小异步小任务执行。下面是一个数字统计的函数，我们会发现运行时间特别长

```js
console.time("runtime");
function func() {
    for(let i=0;i<num;i++) {
        count+=num--
    }
    console.log(count);
    console.timeEnd("runtime");
}
let num = 987654321;
let count = 0;
func();
console.log("hello");

// 365797897407398850
// runtime: 3804.149169921875 ms
// hello
```

现在把任务分解成小块放入任务队列，浏览器就不会出现卡死的现象了，也不会影响后续代码的执行

```js
function func() {
    for(let i=0;i<20;i++) {  // 表示每20次累加分解为一次任务
        if(num <= 0) break 
        count+=num--
    }
    if (num > 0) {
        console.log("========");  // 如果累加未结束，创建一个新的宏任务继续累加
        setTimeout(func);
    }
    console.log(count);
}
let num = 100;
let count = 0;
func();
console.log("hello");
```

输出结果是

```json
======== 100~81
1810     创建第一次宏任务
hello
======== 80~61 创建第二次宏任务 
3220
======== 60~41 创建第三次宏任务 
4230
======== 40~21 创建第四次宏任务 
4840     20~00
5050
```

可以将代码放到宏任务当中：

``` js
function sum(num) {
    return new Promise(resolve=> {
        setTimeout(()=> {
            let count = 0;
            for(let i = 0; i < num; i++) {
                count += num--;
            }
            resolve(count)
        })
    })
}
async function abc(num) {
    let res = await sum(num);
    console.log(res)
}
abc(87654321);
console.log("hello");

// hello 同步代码打印
// 2881230040066301 宏任务
```

交给微任务处理是更好的选择`Promise.resolve().then(...)`

```js
async function func(num) {
  let res = await Promise.resolve().then(_ => {  // 异步微任务
    let count = 0;
    for (let i = 0; i < num; i++) {
      count += num--;
    }
    return count;
  });
  console.log(res);
}
func(987654321);
console.log("hello"); 

// 结果
// hello
// 365797897407398850
```

### 题目解析

```js
setTimeout(() => {
    console.log(0);  // 10 宏任务
}, 0)

new Promise((resolve, reject) => {
	console.log(1);  // 1同步代码
    resolve()
}).then(() => {
	console.log(2);  // 3微任务
    new Promise((resolve, reject) => {
        console.log(3); // 4微任务的同步代码
		resolve()
    }).then(() => {
      	console.log(4); // 6
    }).then(() => {
      	console.log(5); // 8
    }).then(() => {
        console.log(6);  // 9
    })
}).then(() => {
    console.log(7);  // 7
})

new Promise((resolve, reject) => {
    console.log(8); // 2同步代码
	resolve()
}).then(() => {
    console.log(9);  // 5微任务
})

// 1 8 2 3 9 4 7 5 6 0
```

