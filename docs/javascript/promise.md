# Promise

📗 `JavaScript` 中存在很多异步操作,`Promise` 将异步操作队列化，按照期望的顺序执行，返回符合预期的结果。可以通过链式调用多个 `Promise` 达到我们的目的。

Promise 在各种开源库中已经实现，现在标准化后被浏览器默认支持。

> promise 是一个拥有 `then` 方法的对象或函数

## 问题背景

### 定时嵌套

下面是一个定时器执行结束后，执行另一个定时器，这种嵌套造成代码不易阅读

```html
<style>
  div {
    width: 100px;
    height: 100px;
    background: yellowgreen;
    position: absolute;
  }
</style>

<body>
  <div></div>
</body>

<script> 
  function interval(callback, delay = 100) {
    let id = setInterval(() => callback(id), delay);
  }
  
  const div = document.querySelector("div");
  interval(timeId => {
    const left = parseInt(window.getComputedStyle(div).left);
    div.style.left = left + 10 + "px";
    if (left > 200) {
      clearInterval(timeId);
      interval(timeId => {
        const width = parseInt(window.getComputedStyle(div).width);
        div.style.width = width - 1 + "px";
        if (width <= 0) clearInterval(timeId);
      }, 10);
    }
  }, 100);
</script>
```

### 图片加载

下面是图片后设置图片边框，也需要使用**回调函数**处理，代码嵌套较复杂

```js
function loadImage(file, resolve, reject) {
  const image = new Image();
  image.src = file;
  image.onload = () => {
    resolve(image);
  };
  image.onerror = () => {
    reject(new Error("load fail"));
  };
  document.body.appendChild(image);
}

loadImage(
  "images/houdunren.png",
  image => {
    image.style.border = "solid 5px red";
  },
  error => {
    console.log(error);
  }
);
```

### 加载文件

下面是异步加载外部`JS`文件，需要使用回调函数执行，并设置的错误处理的回调函数

```js
function load(file, resolve, reject) {
    const script = document.createElement("script");
    script.src = file;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
}
load(
    "js/func.js",
    script => {
        console.log(`${script.path[0].src} 加载成功`);
        func();
    },
    error => {
        console.log(`${error.srcElement.src} 加载失败`);
    }
);
```

实例中用到的 `hd.js` 与 `houdunren.js` 内容如下

```js
# func.js
function func() {
  console.log("func function run");
}

# index.js
function index() {
  console.log("index run");
  func();
}
```

📌 如果要加载多个脚本时需要**嵌套使用**

下面`index.js` 依赖 `func.js`，需要先加载`func.js` 后加载`index.js`

> 不断的回调函数操作将产生回调地狱，使代码很难维护

```js
load(
    "js/func.js",
    script => {
        load(
            "js/index.js",
            script => {
                index();   // index run \n func function run
            },
            error => {
                console.log(`${error.srcElement.src} 加载失败`);
            }
        );
    },
    error => {
        console.log(`${error.srcElement.src} 加载失败`);
    }
);
```

### 异步请求

使用传统的异步请求也会产生回调嵌套的问题，下在是获取用户的成绩，需要经过以下两步

1. 根据用户名取得 `jerry` 的编号
2. 根据编号获取成绩

```js
function ajax(url, resolve, reject) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.send();
  xhr.onload = function() {
    if (this.status == 200) {
      resolve(JSON.parse(this.response));  // 成功的回调
    } else {
      reject(this);
    }
  };
}
ajax("http://localhost:8888/api/user?name=jerry", user => {
  ajax(
    `http://localhost:8888/api/score?id=${user["id"]}`,
    response => {
      console.log(response[0]);
    }
  );
});
```

### 肯德基

下面是模拟肯德基吃饭的事情，使用 `promise` 操作异步的方式每个阶段会很清楚

```js
let kfc = new Promise((resolve, reject) => {
  console.log("肯德基厨房开始做饭");
  resolve("我是肯德基，你的餐已经做好了");
});
let dad = kfc.then(msg => {
  console.log(`收到肯德基消息: ${msg}`);
  return {
    then(resolve) {
      setTimeout(() => {
        resolve("孩子，我吃了两秒了，不辣，你可以吃了");
      }, 2000);
    }
  };
});
let son = dad.then(msg => {
  return new Promise((resolve, reject) => {
    console.log(`收到爸爸消息: ${msg}`);
    setTimeout(() => {
      resolve("妈妈，我和爸爸吃完饭了");
    }, 2000);
  });
});
let ma = son.then(msg => {
  console.log(`收到孩子消息: ${msg},事情结束`);
});

// 肯德基厨房开始做饭
// 收到肯德基消息: 我是肯德基，你的餐已经做好了
// 收到爸爸消息: 孩子，我吃了两秒了，不辣，你可以吃了
// 收到孩子消息: 妈妈，我和爸爸吃完饭了,事情结束
```

📌 then的执行必须等到返回的promise的状态发生了改变，然后将then当中的回调推入微任务当中，在主线程轮询任务队列的时候才执行。

而使用以往的回调方式，就会让人苦不堪言

```js
function notice(msg, then) {
  then(msg);
}
function meal() {
  notice("肯德基厨房开始做饭", msg => {
    console.log(msg);
    notice("我是肯德基，你的餐已经做好", msg => {
      console.log(`收到肯德基消息: ${msg}`);
      setTimeout(() => {
        notice("孩子，我吃了两秒了，不辣，你可以吃了", msg => {
          console.log(`收到爸爸消息: ${msg}`);
          setTimeout(() => {
            notice("妈妈，我和爸爸吃完饭了", msg => {
              console.log(`收到孩子消息: ${msg},事情结束`);
            });
          }, 2000);
        });
      }, 2000);
    });
  });
}
meal();
```

## 异步状态

📗 Promise 可以理解为**承诺**，就像我们去KFC点餐服务员给我们一引取餐票，这就是承诺。如果餐做好了叫我们这就是成功，如果没有办法给我们做出食物这就是拒绝。

> 一个 `promise` 必须有一个 `then` 方法用于处理状态改变

### 状态说明 💡

Promise包含`pending`、`fulfilled`、`rejected`三种状态

- `pending` 指初始等待状态，初始化 `promise` 时的状态
- `resolve` 指已经解决，将 `promise` 状态设置为`fulfilled`
- `reject` 指拒绝处理，将 `promise` 状态设置为`rejected`
- `promise` 是生产者，通过 `resolve` 与 `reject` 函数告之结果
- `promise` 非常适合需要一定执行时间的异步任务
- 状态一旦改变将不可更改

📗 promise 是队列状态，就像体育中的接力赛，或多米诺骨牌游戏，状态一直向后传递，当然其中的任何一个promise也可以改变状态。promise 没有使用 `resolve` 或 `reject` 更改状态时，状态为 `pending`。

```js
console.log(new Promise((resolve, reject) => {})); //Promise {<pending>}
```

当更改状态后

```js
console.log(
  new Promise((resolve, reject) => {
    resolve("fulfilled");
  })
); // Promise {<resolved>: "fulfilled"}

console.log(
  new Promise((resolve, reject) => {
    reject("rejected");
  })
); // Promise {<rejected>: "rejected"}
```

📌 `promise` 创建时即**立即执行**即同步任务，`then` 会放在异步微任务中执行，需要等同步任务执行后才执行。

💡💡💡`resolve`或`reject`产生的微任务会在下一次轮循的时候执行💡💡💡

```js
let promise = new Promise((resolve, reject) => {
  resolve("fulfilled");
  console.log("promise同步代码");
});
promise.then(msg => {console.log()
  console.log(msg);  // 微任务
});
console.log("hello");
// promise同步代码  =>  hello  =>  fulfilled
```

- `promise` 的 then、catch、finally的方法都是异步任务
- 程序需要将主任务执行完成才会执行异步队列任务

```js
const promise = new Promise(resolve => resolve("success"));
promise.then(alert);   // 2 success
alert("jerry");   // 1 jerry
promise.then(() => {
  alert("finally");   // 3  finally
});
```

下例在三秒后将 `Promise` 状态设置为 `fulfilled` ，然后执行 `then` 方法

```js
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("fulfilled");  // resolve的时候产生微任务
  }, 3000);
}).then(
  msg => {
    console.log(msg);   // 下一次轮循的时候执行
  },
  error => {
    console.log(error);
  }
);
```

📌 状态被改变后就不能再修改了

下面先通过`resolve` 改变为成功状态，表示`promise` 状态已经完成，就不能使用 `reject` 更改状态了

```js
new Promise((resolve, reject) => {
  resolve("操作成功");
  reject(new Error("请求失败"));
}).then(
  msg => {
    console.log(msg);
  },
  error => {
    console.log(error);
  }
);
```

### 动态改变 💡

下例中p2 返回了p1 所以此时p2的状态已经无意义了，后面的then是对p1状态的处理。

```js
const p1 = new Promise((resolve, reject) => {
  // resolve("fulfilled");
  reject("淦");
});
const p2 = new Promise(resolve => {
  resolve(p1);
}).then(
  value => {
    console.log("resolve => " + value);
  },
  reason => {
    console.log("reject => " + reason);   // reject => 淦
  }
);
```

💡 `resolve`除了返回信息，也可以直接返回一个promise对象，新promise的状态由`resolve(promise)`的参数promise决定。（如果 `resolve` 参数是一个 `promise` ，将会改变`promise`状态）

下例中 `p1` 的状态将被改变为 `p2` 的状态`resolve(promise)`

```js
const p1 = new Promise((resolve, reject) => {
  resolve(
    new Promise((s, e) => {
      s("成功");
    })
  );
}).then(msg => {
  console.log(msg);  // 成功
});
```

当promise做为参数传递时，需要等待promise执行完才可以继承，下面的p2需要等待p1执行完成。

- ❓❓ 因为`p2` 的`resolve` 返回了 `p1` 的promise，所以此时`p2` 的`then` 方法已经是`p1` 的了 
- 正因为以上原因 `then` 的第一个函数输出了 `p1` 的 `resolve` 的参数

```js
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("操作成功");
  }, 2000);
});
const p2 = new Promise((resolve, reject) => {
  resolve(p1);
}).then(
  msg => {
    console.log(msg);   // 操作成功
  },
  error => {
    console.log(error);
  }
);
```

## then

📗 一个promise 需要提供一个then方法访问promise 结果，`then` 用于定义当 `promise` 状态发生改变时的处理，即`promise`处理异步操作，`then` 用于结果。

📌 `promise` 就像 `kfc` 中的厨房，`then` 就是我们用户，如果餐做好了即 `fulfilled` ，做不了拒绝即`rejected` 状态。那么 then 就要对不同状态处理。

::: tip then

- then 方法必须返回 promise，用户返回或系统自动返回
- 第一个函数在`resolved` 状态时执行，即执行`resolve`时执行`then`第一个函数处理成功状态
- 第二个函数在`rejected`状态时执行，即执行`reject` 时执行第二个函数处理失败状态，该函数是可选的
- 两个函数都接收 `promise` 传出的值做为参数
- 也可以使用`catch` 来处理失败的状态
- 如果 `then` 返回 `promise` ，下一个`then` 会在当前`promise` 状态改变后执行 ✔️

:::

### 语法说明

```js
promise.then(onFulfilled, onRejected)
```

then的语法如下，onFulfilled 函数处理 `fulfilled` 状态， onRejected函数处理 `rejected` 状态

- onFulfilled 或 onRejected 不是函数将被忽略
- 两个函数只会被调用一次
- onFulfilled 在 promise 执行成功时调用
- onRejected 在 promise 执行拒绝时调用

### 基础知识

`then` 会在 `promise` 执行完成后执行，`then` 第一个函数在 `resolve`成功状态执行

```js
const promise = new Promise((resolve, reject) => {
  resolve("success");
}).then(
  value => {
    console.log(`解决：${value}`);
  },
  reason => {
    console.log(`拒绝:${reason}`); 
  }
);
```

`then` 中第二个参数在失败状态执行

```js
const promise = new Promise((resolve, reject) => {
  reject("is error");
});
promise.then(
  msg => {
    console.log(`成功：${msg}`);
  },
  error => {
    console.log(`失败:${error}`);
  }
);
```

如果只关心成功则不需要传递 `then` 的第二个参数

```js
const promise = new Promise((resolve, reject) => {
  resolve("success");
});
promise.then(msg => {
  console.log(`成功：${msg}`);
});
```

如果只关心失败时状态，`then` 的第一个参数传递 `null`

```js
const promise = new Promise((resolve, reject) => {
  reject("is error");
});
promise.then(null, error => {
  console.log(`失败:${error}`);
});
```

📌promise 传向then的传递值，如果then没有可处理函数，会一直向后传递

```js
let p1 = new Promise((resolve, reject) => {
	reject("rejected");
})
.then()
.then(
  null,
  f => console.log(f)
);
```

📌 如果 onFulfilled 不是函数且 promise 执行成功, p2 执行成功并返回相同值

```js
let promise = new Promise((resolve, reject) => {
  resolve("resolve");
});
let p2 = promise.then();
p2.then().then(resolve => {
  console.log(resolve);  // resolve
});
```

如果 onRejected 不是函数且promise拒绝执行，p2 拒绝执行并返回相同值

```js
let promise = new Promise((resolve, reject) => {
  reject("reject");
});
let p2 = promise.then(() => {});
p2.then(null, null).then(null, reject => {
  console.log(reject);  // reject
});
```

### 链式调用

📗 每次的 `then` 都是一个全新的 `promise`，默认 then 返回的 promise 状态是 fulfilled

```js
let promise = new Promise((resolve, reject) => {
  resolve("fulfilled");
}).then(resolve => {
  console.log(resolve);  // fulfilled, 默认将返回resolve的promise
})
.then(resolve => {
  console.log(resolve);   // undefined 没有明确返回值
});
```

每次的 `then` 都是一个全新的 `promise`，不要认为上一个 promise状态会影响以后then返回的状态

```js
let p1 = new Promise(resolve => {
  resolve();
});
let p2 = p1.then(() => {
  console.log("p1 resolve");
});
p2.then(() => {
  console.log("p2 resolve");
});
console.log(p1); // Promise {<fulfilled>: undefined}
console.log(p2); // Promise {<pending>} 同步执行获取的promise状态还未改变，要等p2 resolve

// 再试试把上面两行放在 setTimeout里
setTimeout(() => {
  console.log(p1); // Promise {<fulfilled>: undefined}
  console.log(p2); // Promise {<fulfilled>: undefined}
});
```

`then` 是对上个promise 的`rejected` 的处理，每个 `then` 会是一个新的promise，默认传递 `fulfilled`状态

```js
new Promise((resolve, reject) => {
  reject();
})
.then(
  resolve => console.log("fulfilled"),
  reject => console.log("rejected")  // 1  无具体返回值 默认将返回resolve的promise
)
.then(
  resolve => console.log("fulfilled"),  // 2  无具体返回值 默认将返回resolve的promise
  reject => console.log("rejected")
)
.then(
  resolve => console.log("fulfilled"), // 3
  reject => console.log("rejected")
);
  
# 执行结果如下
  rejected
  fulfilled
  fulfilled
```

如果内部返回 `promise` 时将使用该 `promise`

```js
let p1 = new Promise(resolve => {
  resolve();
});
let p2 = p1.then(() => {
  return new Promise(resolve => {
   	resolve("123");
  });
});
p2.then(v => {
  console.log(v); // 123
});
```

如果 `then` 返回`promise` 时，后面的`then` 就是对返回的 `promise` 的处理，需要等待该 promise 变更状态后执行。

```js
let promise = new Promise(resolve => resolve());
let p1 = promise.then(() => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`p1`);
      resolve();
    }, 2000);
  });
}).then(() => {
  return new Promise((a, b) => {
    console.log(`p2`);
  });
});

// p1 p2
```

如果`then`返回 `promise` 时，返回的`promise` 后面的`then` 就是处理这个`promise` 的

> 如果不 `return` 情况就不是这样了，即外层的 `then` 的`promise` 和内部的`promise` 是独立的两个promise

```js
new Promise((resolve, reject) => {
  resolve();
})
.then(v => {
  return new Promise((resolve, reject) => {
    resolve("第二个promise");
  }).then(value => {
    console.log(value); // then返回的还是一个promise
    return value;
  });
})
.then(value => {
  console.log(value);
});
// 第二个promise  8 
// 第二个promise  13 
```

这是对上面代码的优化，把内部的 `then` 提取出来

```js
new Promise((resolve, reject) => {
  resolve();
})
.then(v => {
  return new Promise((resolve, reject) => {
    resolve("第二个promise");
  });
})
.then(value => {
  console.log(value);
  return value;  // return new Promise(r=>r(value))
})
.then(value => {
  console.log(value);
});
```

### 其它类型

📗 Promise 解决过程是一个抽象的操作，其需输入一个 `promise` 和一个值，我们表示为 `[[Resolve]](promise, x)`，如果 `x` 有 `then` 方法且看上去像一个 Promise ，解决程序即尝试使 `promise` 接受 `x` 的状态；否则其用 `x` 的值来执行 `promise` 。

#### 循环调用

如果 `then` 返回与 `promise` 相同将禁止执行

```js
let promise = new Promise(resolve => {
  resolve();
});
let p2 = promise.then(() => {
  return p2;
}); // TypeError: Chaining cycle detected for promise
```

#### promise

如果返加值是 `promise` 对象，则需要更新状态后，才可以继承执行后面的`promise`

💡💡💡resolve参数可以是普通返回值，也可以是一个新的promise💡💡💡

```js
new Promise((resolve, reject) => {
  resolve(
    new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("解决状态");
      }, 2000);
    })
  );
})
  .then(
    v => {
      console.log(`fulfilled: ${v}`);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject("失败状态");
        }, 2000);
      });
    },
    v => {
      console.log(`rejected: ${v}`);
    }
  )
  .catch(error => console.log(`rejected: ${error}`));

// fulfilled: 解决状态
// rejected: 失败状态
```

#### Thenables

包含 `then` 方法的对象就是一个 `promise` ，系统将传递 resolvePromise 与 rejectPromise 做为函数参数

下例中使用 `resolve` 或在`then` 方法中返回了具有 `then`方法的对象【有then方法的对象】

- 该对象即为 `promise` 要先执行，并在方法内部更改状态
- 如果不更改状态，后面的 `then` promise都为等待状态

💡 包含 `then` 方法的对象可以当作 promise来使用：

```js
new Promise((resolve, reject) => {
    resolve({
        then(resolve, reject) {
            resolve("解决状态");  // 一个有then方法的对象会被解读为promise
        }
    });
})
    .then(v => {
    console.log(`fupromiselfilled: ${v}`);
    return {
        then(resolve, reject) {
            setTimeout(() => {
                reject("失败状态");
            }, 2000);
        }
    };
})
    .then(null, error => {
    console.log(`rejected: ${error}`);
});
console.log("hello")

// hello (resolve内会在微任务队列当中)
// fupromiselfilled: 解决状态
// rejected: 失败状态

```

💡 当然也可以是类：

```js
new Promise((resolve, reject) => {
    resolve(
        class {
            static then(resolve, reject) {
                setTimeout(() => {
                    resolve("解决状态");   // 类与静态属性就是对象与方法的关系
                }, 2000);
            }
        }
    );
}).then(
    v => {
        console.log(`fulfilled: ${v}`);  // fulfilled: 解决状态
    },
    v => {
        console.log(`rejected: ${v}`);
    }
);
```

💡 类与静态方法：

```js
class User {
    constructor(id) {
        this.id = id;
    }
    then(resolve, reject) {
        resolve(ajax(`http://localhost:8888/api/score?id=${this.id}`));
    }
}
new Promise((resolve, reject) => {
    // resolve可以直接返回一个promise对象，状态由该promise传递
    resolve(ajax(`http://localhost:8888/aoi/user?name=jerry`));
})
    .then(user => {
    return new User(user.id); // class实例化的对象的原型有then方法
})
    .then(lessons => {
    console.log(lessons);
});
```

📌 如果对象中的 then 不是函数，则将**对象**做为值传递。（正常情况看待）

```js
new Promise((resolve, reject) => {
    resolve();
})
    .then(() => {
    return {
        then: "jerry"  // then为该返回对象的一个属性,正常resolve返回
    };
})
    .then(v => {
    console.log(v); // {then: "jerry"}
});
```

## catch

下面使用未定义的变量同样会触发失败状态

```js
let promise = new Promise((resolve, reject) => {
    hd;  
}).then(
    value => console.log(value),
    reason => console.log(reason)  // ReferenceError: hd is not defined
);
```

如果 onFulfilled 或 onRejected 抛出异常，则 p2 拒绝执行并返回拒因

```js
let promise = new Promise((resolve, reject) => {
    throw new Error("fail");
});
let p2 = promise.then();
p2.then().then(null, resolve => {
    console.log(resolve + ",jerry");   // Error: fail,jerry
});
```

📗 catch用于失败状态的处理函数，等同于 `then(null,reject){}`

- 建议使用 `catch` 处理错误
- 将 `catch` 放在最后面用于统一处理前面发生的错误

```js
const promise = new Promise((resolve, reject) => {
    reject(new Error("Notice: Promise Exception"));
}).catch(msg => {
    console.error(msg);
});
```

📗 `catch` 可以捕获之前**所有** `promise` 的错误，所以建议将 `catch` 放在最后。

下例中 `catch` 也可以捕获到了第一个 `then` 返回 的 `promise` 的错误。

```js
new Promise((resolve, reject) => {
  resolve();
})
.then(() => {
  return new Promise((resolve, reject) => {
    reject(".then ");
  });
})
.then(() => {})
.catch(msg => {
  console.log(msg);
});
```

错误是冒泡的操作的，下面没有任何一个`then` 定义第二个函数，将一直冒泡到 `catch` 处理错误

```js
new Promise((resolve, reject) => {
  reject(new Error("请求失败"));
})
.then(msg => {})
.then(msg => {})
.catch(error => {
  console.log(error);
});
```

💡 `catch` 也可以捕获对 `then` 抛出的错误处理

```js
new Promise((resolve, reject) => {
  resolve();
})
.then(msg => {
  throw new Error("这是then 抛出的错误");
})
.catch(() => {
  console.log("33");
});
```

💡 `catch` 也可以捕获其他错误，下面在 `then` 中使用了未定义的变量，将会把错误抛出到 `catch`

```js
new Promise((resolve, reject) => {
  resolve("success");
})
.then(msg => {
  console.log(a);
})
.catch(reason => {
  console.log(reason);
});
```

### 使用建议

💡 建议将错误要交给`catch`处理而不是在`then`中完成，不建议使用下面的方式管理错误

```js
new Promise((resolve, reject) => {
  reject(new Error("请求失败"));
}).then(
  msg => {
    console.log(msg);
  },
  error => {
    console.log(error);  // Error: 请求失败
  }
);
```

### 处理机制 💡

在 `promise` 中抛出的错误也会被`catch` 捕获

```js
const promise = new Promise((resolve, reject) => {
  throw new Error("fail");
}).catch(msg => {
  console.log(msg.toString()+"后盾人");
});
```

可以将上面的理解为如下代码，可以理解为内部自动执行 `try...catch`

```js
const promise = new Promise((resolve, reject) => {
  try {
    throw new Error("fail");
  } catch (error) {
    reject(error);
  }
}).catch(msg => {
  console.log(msg.toString());
});
```

📌 但像下面的在异步中 `throw` 将不会触发 `catch`，而使用系统错误处理

```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    throw new Error("fail");  // 异步错误应该用reject =>  reject(new Error("fail"))
  }, 2000);
}).catch(msg => {
  console.log(msg + "后盾人");
});
```

下面在`then` 方法中使用了没有定义的`hd`函数，也会抛除到 `catch` 执行，可以理解为内部自动执行 `try...catch`

```js
const promise = new Promise((resolve, reject) => {
  resolve();
})
.then(() => {
  test();
})
.catch(msg => {
  console.log(msg.toString());   // ReferenceError: test is not defined
});
```

在 `catch` 中发生的错误也会抛给最近的错误处理

```js
const promise = new Promise((resolve, reject) => {
  reject();
})
.catch(msg => {
  test();
})
.then(null, error => {
  console.log(error);  // ReferenceError: test is not defined
});
```

### 定制错误

可以根据不同的错误类型进行定制操作，下面将参数错误与404错误分别进行了处理

```js
// 继承js的Error类进行定制
class ParamError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ParamError";
  }
}
class HttpError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "HttpError";
  }
}
function ajax(url) {
  return new Promise((resolve, reject) => {
    if (!/^http/.test(url)) {
      throw new ParamError("请求地址格式错误");
    }
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();
    xhr.onload = function() {
      if (this.status == 200) {
        resolve(JSON.parse(this.response));
      } else if (this.status == 404) {
        // throw new HttpError("用户不存在");
        reject(new HttpError("用户不存在"));
      } else {
        reject("加载失败");
      }
    };
    xhr.onerror = function() {
      reject(this);
    };
  });
}

ajax(`http://localhost:8888/api/user?name=jerry`)
.then(value => {
  console.log(value);
})
.catch(error => {
  if (error instanceof ParamError) {
    console.log(error.message);
  }
  if (error instanceof HttpError) {
    alert(error.message);
  }
  console.log(error);
});
```

### 事件处理

**unhandledrejection**事件用于捕获到未处理的Promise错误，下面的 then 产生了错误，但没有`catch` 处理，这时就会触发事件。该事件有可能在以后被废除，处理方式是对没有处理的错误直接终止。

```js
window.addEventListener("unhandledrejection", function(event) {
  console.log(event.promise); // 产生错误的promise对象
  console.log(event.reason); // Promise的reason
});

new Promise((resolve, reject) => {
  resolve("success");
}).then(msg => {
  throw new Error("fail");
});
```

## finally

📗无论状态是`resolve` 或 `reject` 都会执行此动作，`finally` 与状态无关（finally也在微任务队列）

```js
const promise = new Promise((resolve, reject) => {
  reject("hdcms");
})
.then(msg => {
  console.log("resolve");
})
.catch(msg => {
  console.log("reject");  // 1
})
.finally(() => {
  console.log("resolve/reject状态都会执行");  // 2
});
```

下面使用 `finally` 处理加载状态，当请求完成时移除加载图标。请在后台php文件中添加 `sleep(2);` 设置延迟响应

```html
<body>
  <style>
    div {
      width: 100px;
      height: 100px;
      background: red;
      color: white;
      display: none;
    }
  </style>
	<div>loading...</div>
</body>
<script>
function ajax(url) {
  return new Promise((resolve, reject) => {
    document.querySelector("div").style.display = "block";
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();
    xhr.onload = function() {
      if (this.status == 200) {
        resolve(JSON.parse(this.response));
      } else {
        reject(this);
      }
    };
  });
}

ajax("http://localhost:8888/api/user?name=jerry")
  .then(user => {
    console.log(user);
  })
  .catch(error => {
    console.log(error);
  })
  .finally(() => {
    document.querySelector("div").style.display = "none";
  })
</script>
```

## 实例操作

### 异步请求

下面是将 `ajax` 修改为 `promise` 后，代码结构清晰了很多

```js
function ajax(url) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();
    xhr.onload = function() {
      if (this.status == 200) {
        resolve(JSON.parse(this.response));
      } else {
        reject(this);
      }
    };
  });
}

ajax("http://localhost:8888/api/user?name=jerry")
.then(user => ajax(`http://localhost:8888/api/score?id=${user["id"]}`))
.then(lesson => {
  console.log(lesson);
});
```

### 图片加载

下面是异步加载图片示例

```js
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = file;
    image.onload = () => {
      resolve(image);
    };
    image.onerror = reject;
    document.body.appendChild(image);
  });
}

loadImage("images/hello.png").then(image => {
  image.style.border = "solid 20px black";
  console.log("宽度:" + window.getComputedStyle(image).width);
});
```

### 定时器

下面是封装的`timeout` 函数，使用定时器操作更加方便

```js
function timeout(times) {
  return new Promise(resolve => {
    setTimeout(resolve, times);
  });
}

timeout(3000)
  .then(() => {
    console.log("3秒后执行");
    return timeout(1000);
  })
  .then(() => {
    console.log("执行上一步的promise后1秒执行");
  });
```

封闭 `setInterval` 定时器并实现动画效果

```html
<body>
  <style>
    div {
      width: 100px;
      height: 100px;
      background: yellowgreen;
      position: absolute;
    }
  </style>
  <div></div>
</body>
<script>
  function interval(delay = 1000, callback) {
    return new Promise(resolve => {
      let id = setInterval(() => {
        callback(id, resolve);
      }, delay);
    });
  }
  interval(100, (id, resolve) => {
    const div = document.querySelector("div");
    let left = parseInt(window.getComputedStyle(div).left);
    div.style.left = left + 10 + "px";
    if (left >= 200) {
      clearInterval(id);
      resolve(div);
    }
  }).then(div => {
    interval(50, (id, resolve) => {
      let width = parseInt(window.getComputedStyle(div).width);
      div.style.width = width - 10 + "px";
      if (width <= 20) {
        clearInterval(id);
      }
    });
  });
</script>
```

## 链式操作

::: tip

- 第个 `then` 都是一个promise
- 如果 `then` 返回 promise，只当`promise` 结束后，才会继承执行下一个 `then`

:::

### 语法介绍

下面是对同一个 `promise` 的多个 `then` ，每个`then` 都得到了同一个promise 结果，这不是链式操作，实际使用意义不大。(一个promise可以声明多个then处理)

```js
const promise = new Promise((resolve, reject) => {
  resolve("jerry");
});
promise.then(hd => {
  hd += "-abc";
  console.log(hd);  // jerry-abc
});
promise.then(hd => {
  hd += "-ccc";
  console.log(hd);  // jerry-ccc
});
```

第一个 `then` 也是一个promise，当没接受到结果是状态为 `pending`

```js
const promise = new Promise((resolve, reject) => {
  resolve("jerry");
});

console.log(
  promise.then(hd => {
    hd += "-abc";
    console.log(hd);
  })
); //Promise {<pending>}
```

📗 `promise` 中的 `then` 方法可以链接执行，`then` 方法的返回值会传递到下一个`then` 方法。

- `then` 会返回一个`promise` ，所以如果有多个`then` 时会连续执行
- `then` 返回的值会做为当前`promise` 的结果

下面是链式操作的 `then`，即始没有 `return` 也是会执行，因为每个`then` 会返回`promise`

```js
new Promise((resolve, reject) => {
  resolve("a");
})
.then(hd => {
  hd += "-b";
  console.log(hd); //a-b
  return hd;
})
.then(hd => {
  hd += "-c";
  console.log(hd); //a-b-c
});
```

📗 `then` 方法可以返回一个`promise` 对象，等`promise` 执行结束后，才会继承执行后面的 `then`。后面的`then` 方法就是对新返回的`promise` 状态的处理

```js
new Promise((resolve, reject) => {
  resolve("第一个promise");  // 1
})
.then(msg => {
  console.log(msg);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("第二个promise");  // 2
    }, 3000);
  });
})
.then(msg => {
  console.log(msg);
});
```

### 链式加载

使用`promise` 链式操作重构前面章节中的文件加载，使用代码会变得更清晰

```js
function load(file) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = file;
    script.onload = () => resolve(script);
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
}

load("js/func.js")
.then(() => load("js/index.js"))  // 直接return一个promise
.then(() => houdunren());
```

### 操作元素

下面使用 `promise` 对元素事件进行处理

```html
<body>
  <div>
    <h2>Promise深入浅出</h2>
    <button>收藏课程</button>
  </div>
</body>

<script>
new Promise(resolve => {
  document.querySelector("button").addEventListener("click", e => {
    resolve();
  });
})
.then(() => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("执行收藏任务");
      resolve();
    }, 2000);
  });
})
.then(() => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("更新积分");
      resolve();
    }, 2000);
  });
})
.then(() => {
  console.log("收藏成功！奖励10积分");
})
.catch(error => console.log(errro));
```

### 异步请求

下面是使用链式操作获取学生成绩

```js
function ajax(url) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();
    xhr.onload = function() {
      if (this.status == 200) {
        resolve(JSON.parse(this.response));
      } else {
        reject(this);
      }
    };
  });
}
ajax("http://localhost:8888/api/user?name=jerry")
.then(user => {
  return ajax(`http://localhost:8888/api/score?id=${user["id"]}`);
})
.then(lesson => {
  console.log(lesson);
});
```

## 扩展接口

### resolve

📗 使用 `promise.resolve` 方法可以快速的返回一个promise对象。相当于

```js
return new Promise((resolve, reject) => {
  resolve(parameter);
})
```

根据值返加 `promise`

```js
Promise.resolve("nice").then(value => {
  console.log(value); //nice
});
```

下面将请求结果缓存，如果再次请求时直接返回带值的 `promise` 

```js
function query(name) {
  const cache = query.cache || (query.cache = new Map());
  if (cache.has(name)) {
    console.log("走缓存了");
    return Promise.resolve(cache.get(name));  // 返回带值的promise
  }
  return ajax(`http://localhost:8888/api/user?name=${name}`).then(
    response => {
      cache.set(name, response);
      console.log("没走缓存");
      return response;  // then再返回一个promise
    }
  );
}
query("jerry").then(response => {
  console.log(response);  // 没走缓存
});
setTimeout(() => {
  query("jerry").then(response => {
    console.log(response);   // 走缓存了
  });
}, 1000);
```

如果是 `thenable` 对象，会将对象包装成promise处理，这与其他promise处理方式一样的

```js
const obj = {
  then(resolve, reject) {
    resolve("jerry");
  }
};
Promise.resolve(obj).then(value => {
  console.log(value);
});
```

### reject

和 `Promise.resolve` 类似，`reject` 生成一个失败的`promise`

```js
Promise.reject("fail").catch(error => console.log(error));
```

下面使用 `Project.reject` 设置状态

```js
new Promise(resolve => {
  resolve("jerry");
})
.then(v => {
  if (v != "chen") return Promise.reject(new Error("fail"));
})
.catch(error => {
  console.log(error);  // Error: fail
});
```

### all

📗 使用`Promise.all` 方法可以同时执行多个**并行异步**操作，比如页面加载时同进获取课程列表与推荐课程。

::: tip Promise.all

- 任何一个 `Promise` 执行失败就会调用 `catch`方法
- 适用于一次发送多个异步操作
- 参数必须是可迭代类型，如Array/Set
- 成功后返回 `promise` 结果的有序数组

:::

下例中当 `p1、p2` 两个 Promise 状态都为 `fulfilled` 时，p3状态才为`fulfilled`。

```js
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("第一个Promise");
  }, 600);
});
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("第二个异步");
  }, 1200);
});
const p3 = Promise.all([p1, p2])
  .then(results => {
    console.log(results);
  })
  .catch(msg => {
    console.log(msg);  // ["第一个Promise", "第二个异步"]
  });
```

根据用户名获取用户，有任何一个用户获取不到时 `promise.all` 状态失败，执行 `catch` 方法

```js
function ajax(url) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();
    xhr.onload = function() {
      if (this.status == 200) {
        resolve(JSON.parse(this.response));
      } else {
        reject(this);
      }
    };
  });
}

const api = "http://localhost:8888/php";
const promises = ["jerry", "kangkang"].map(name => {
  return ajax(`${api}/user?name=${name}`);
});

Promise.all(promises)
  .then(response => {
    console.log(response);
  })
  .catch(error => {
    console.log(error);
  });
```

📌 可以将其他非`promise` 数据添加到 `all` 中，它将被处理成 `Promise.resolve`

```js
...
const promises = [
  ajax(`${api}/user?name=jerry`),
  ajax(`${api}/user?name=chen`),
  { id: 3, name: "qq", email: "123@163.com" }
];
...
```

如果某一个`promise`没有catch 处理，将使用`promise.all` 的catch处理

```js
let p1 = new Promise((resolve, reject) => {
  resolve("fulfilled");
});
let p2 = new Promise((resolve, reject) => {
  reject("rejected");
});
Promise.all([p1, p2]).catch(reason => {
  console.log(reason);
});
```

### allSettled

📗 `allSettled` 用于处理多个`promise` ，**只关注执行完成**，不关注是否全部执行成功，`allSettled` 状态只会是`fulfilled`。

下面的p2 返回状态为 `rejected` ，但`promise.allSettled` 始终将状态设置为 `fulfilled` 。

```js
const p1 = new Promise((resolve, reject) => {
  resolve("resolved");
});
const p2 = new Promise((resolve, reject) => {
  reject("rejected");
});
Promise.allSettled([p1, p2])
.then(msg => {
  console.log(msg); 
})
// [{status:"fulfilled",value:"resolved"},{status:"rejected",reason:"rejected"}]
```

下面是获取用户信息，但不关注某个用户是否获取不成功

```js
const api = "http://localhost:8888/api";
const promises = [
  ajax(`${api}/user?name=jerry`),
  ajax(`${api}/user?name=chen`)
];
Promise.allSettled(promises).then(response => {
  console.log(response);
});
```

### race

使用`Promise.race()` 处理容错异步，和`race`单词一样哪个Promise快用哪个，哪个先返回用哪个。

::: tip 

- 以最快返回的promise为准
- 如果最快返加的状态为`rejected` 那整个`promise`为`rejected`执行cache
- 如果参数不是promise，内部将自动转为promise

::: 

下面将第一次请求的异步时间调整为两秒，这时第二个先返回就用第二人。

```js
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("第一个Promise");
  }, 2000);
});
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("第二个异步");
  }, 1000);
});
Promise.race([p1, p2])
.then(results => {
  console.log(results);  // 第二个异步
})
.catch(msg => {
  console.log(msg);
});
```

获取用户资料，如果两秒内没有结果 `promise.race` 状态失败，执行`catch` 方法

```js
const api = "http://localhost:8888/php";
const promises = [
  ajax(`${api}/user?name=jerry`),
  new Promise((a, b) =>
    setTimeout(() => b(new Error("request fail")), 2000)
  )
];
Promise.race(promises)
.then(response => {
  console.log(response);
})
.catch(error => {
  console.log(error);
});
```

## 任务队列

### 实现原理 💡

如果 `then` 返回`promise` 时，后面的`then` 就是对返回的 `promise` 的处理

```js
let promise = Promise.resolve();
let p1 = promise.then(() => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`p1`);
      resolve();
    }, 1000);
  });
});
p1.then(() => {
  return new Promise((a, b) => {
    setTimeout(() => {
      console.log(`p2`);
    }, 1000);
  });
});
```

下面使用 `map` 构建的队列，有以下几点需要说明

- `then` 内部返回的 `promise` 更改外部的 `promise` 变量
- 为了让任务继承，执行完任务需要将 `promise` 状态修改为 `fulfilled`

```js
function queue(nums) {
  let promise = Promise.resolve();
  nums.map(n => {
    promise = promise.then(v => {
      return new Promise(resolve => {
        console.log(n);
        resolve();  // 只有当前resolve了，下一个then才能执行！
      });
    });
  });
}

queue([1, 2, 3, 4, 5]);  // 1 2 3 4 5
```

💡 下面再来通过 `reduce` 来实现队列

```js
function queue(nums) {
  return nums.reduce((promise, n) => {
    return promise.then(() => {
      return new Promise(resolve => {
        console.log(n);
        resolve();
      });
    });
  }, Promise.resolve());
}

queue([1, 2, 3, 4, 5]);
```

### 队列请求

下面是异步加载用户并渲染到视图中的队列实例

- 请在后台添加延迟脚本，以观察队列执行过程
- 也可以在任何`promise` 中添加定时器观察

```js
class User {
	//加载用户
  ajax(user) {
    let url = `http://localhost:8888/api/user?name=${user}`;
    return new Promise(resolve => {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.send();
      xhr.onload = function() {
        if (this.status == 200) {
          resolve(JSON.parse(this.response));
        } else {
          reject(this);
        }
      };
    });
  }
  //启动
  render(users) {
    users.reduce((promise, user) => {
      return promise
        .then(() => {
          return this.ajax(user);
        })
        .then(user => {
          return this.view(user);
        });
    }, Promise.resolve());
  }
  //宣染视图
  view(user) {
    return new Promise(resolve => {
      let h1 = document.createElement("h1");
      h1.innerHTML = user.name;
      document.body.appendChild(h1);
      resolve();
    });
  }
}
new User().render(["jerry", "michael"]);
```

### 高可用封装

上例中处理是在队列中完成，不方便业务定制，下面将Promise处理在剥离到外部

**后台请求处理类**

```js
export default function(url) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.send()
    xhr.onload = function() {
      if (this.status === 200) {
        resolve(this.response)
      } else {
        reject(this)
      }
    }
  })
}
```

**队列处理类**

```js
export default function(promises) {
  promises.reduce((promise, next) => promise.then(next), Promise.resolve())
}
```

**使用队列**

```html
<script type="module">
  import queue from './queue.js'
  import axios from './axios.js'
  queue(
    [1, 2, 3].map(v => () =>
      axios(`user?id=${v}`).then(user => console.log(user))
    )
  )
</script>
```

## async/await

::: tip 使用 `async/await` 是promise 的语法糖，可以让编写 promise 更清晰易懂，也是推荐编写promise 的方式。

- `async/await` 本质还是promise，只是更简洁的语法糖书写
- `async/await` 使用更清晰的promise来替换 promise.then/catch 的方式

::: 

### async

📗 下面在 `hd` 函数前加上async，**函数将返回promise**，我们就可以像使用标准Promise一样使用了。

```js
async function func() {
  return "hi";
}
console.log(func());  // Promise {<fulfilled>: "hi"}
func().then(value => {
  console.log(value);  // hi
});
```

如果有多个await 需要排队执行完成，我们可以很方便的处理多个异步队列

```js
function func(message) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(message);
    }, 2000);
  });
}
async function run() {
  let p1 = await func("promise 1");
  console.log(p1);  // promise 1
  let p2 = await func("promise 2");
  console.log(p2);  // promise 2
}
run();
```

### await

::: tip 使用 `await` 关键词后会等待promise 完

- `await` 后面一般是promise，如果不是直接返回
- `await` 必须放在 async 定义的函数中使用
- `await` 用于替代 `then` 使编码更优雅

::: 

下例会在 await 这行暂停执行，直到等待 promise 返回结果后才继执行。

```js
async function func() {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("hello world");
    }, 2000);
  });
  let result = await promise;
  console.log(result);   // hello world
}
func()
```

一般await后面是外部其它的promise对象

```js
async function func() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("fulfilled");
    }, 2000);
  });
}
async function run() {
  let value = await func();
  console.log("nice");
  console.log(value);
}
run();
```

下面是请求后台获取用户课程成绩的示例

```js
async function user() {
  let user = await ajax(`http://localhost:8888/api/user?name=jerry`);
  let lessons = await ajax(
    `http://localhost:8888/api/score?id=${user.id}`
  );
  console.log(lessons);
}
```

也可以将操作放在立即执行函数中完成

```js
(async () => {
  let user = await ajax(`http://localhost:8888/api/user?name=jerry`);
  let lessons = await ajax(
    `http://localhost:8888/api/score?id=${user.id}`
  );
  console.log(lessons);
})();
```

下面是使用async 设置定时器，并间隔时间来输出内容

```js
async function sleep(ms = 2000) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
async function run() {
  for (const value of ["后盾人", "向军"]) {
    await sleep();
    console.log(value);
  }
}
run();
```

### 加载进度

下面是请求后台加载用户并通过进度条展示的效果

```html
<body>
  <style>
    div {
      height: 50px;
      width: 0px;
      background: green;
    }
  </style>
  <div id="loading"></div>
</body>

<script src="js/ajax.js"></script>
<script>
  async function query(name) {
    return ajax(`http://localhost:8888/api/user?name=${name}`);
  }
  (async () => {
    let users = ["Michael", "Jhon", "李四", "王五", "赵六"];
    for (let i = 0; i < users.length; i++) {
      await query(users[i]);
      let progress = (i + 1) / users.length;
      loading.style.width = progress * 100 + "%";
    }
  })();
</script>
```

### 类中使用

和 promise 一样，await 也可以操作`thenables` 对象

```js
class User {
  constructor(name) {
    this.name = name;
  }
  then(resolve, reject) {
    let user = ajax(`http://localhost:8888/php/user.php?name=${this.name}`);
    resolve(user);
  }
}
async function get() {
  let user = await new User("向军");
  console.log(user);
}
get();
```

类方法也可以通过 `async` 与 `await` 来操作promise

```js
class User {
  constructor() {}
  async get(name) {
    let user = await ajax(
      `http://localhost:8888/api/user?name=${name}`
    );
    user.name += "-tag";
    return user;  // async返回一个promise, resolve(user)
  }
}
new User().get("jerry").then(resolve => {
  console.log(resolve);
});
```

### 其他声明

函数声明

```js
async function get(name) {
  return await ajax(`http://localhost:8888/api/user?name=${name}`);
}
get("jerry").then(user => {
  console.log(user);
});
```

函数表达式

```js
let get = async function(name) {
  return await ajax(`http://localhost:8888/api/user?name=${name}`);
};
get("jerry").then(user => {
  console.log(user);
});
```

对象方法声明

```js
let func = {
  async get(name) {
    return await ajax(`http://localhost:8888/api/user?name=${name}`);
  }
};

func.get("jerry").then(user => {
  console.log(user);
});
```

立即执行函数

```js
(async () => {
  let user = await ajax(`http://localhost:8888/api/user?name=${name}`);
  let lessons = await ajax( 
    `http://localhost:8888/api/score?id=${user.id}`
  );
  console.log(lessons);
})();
```

类方法中的使用

```js
class User {
  async get(name) {
    return await ajax(`http://localhost:8888/api/user?name=${name}`);
  }
}
let user = new User().get("jerry").then(user => {
  console.log(user);
});
```

### 错误处理

async 内部发生的错误，会将必变promise对象为rejected 状态，所以可以使用`catch` 来处理

```js
async function func() {
  console.log(houdunren);
}
func().catch(error => {
  throw new Error(error);
});
```

下面是异步请求数据不存在时的错误处理

```js
async function get(name) {
  return await ajax(`http://localhost:8888/api/user?name=${name}`);
}

get("iconman").catch(error => {
  alert("用户不存在");
});
```

如果`promise` 被拒绝将抛出异常，可以使用 `try...catch` 处理错误

```js
async function get(name) {
  try {
    let user = await ajax(
      `http://localhost:8888/api/user?name=${name}`
    );
    console.log(user);
  } catch (error) {
    alert("用户不存在");
  }
}
get("spiderman");
```

多个 await 时当前面的出现失败，后面的将不可以执行

```js
async function func() {
  await Promise.reject("fail"); // 不会再继续往下执行
  await Promise.resolve("success").then(value => {
    console.log(value);
  });
}
func();
```

如果对前一个错误进行了处理，后面的 await 可以继续执行

```js
async function func() {
  await Promise.reject("fail").catch(e => console.log(e));
  await Promise.resolve("success").then(value => {
    console.log(value);
  });
}
func();
```

也可以使用 `try...catch` 特性忽略不必要的错误

```js
async function func() {
  try {
    await Promise.reject("fail");
  } catch (error) {}
  await Promise.resolve("success").then(value => {
    console.log(value);
  });
}
func();
```

也可以将多个 await 放在 try...catch 中统一处理错误

```js
async function func(name) {
  const host = "http://localhost:8888/api";
  try {
    const user = await ajax(`${host}/user?name=${name}`);
    const lessons = await ajax(`${host}/score?id=${user.id}`);
    console.log(lessons);
  } catch (error) {
    console.log("用户不存在");
  }
}
func("MichaelJackson");
```

### 并发执行

有时需要多个await 同时执行，有以下几种方法处理，下面多个await 将**产生等待**

```js
async function p1() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("houdunren");
      resolve();
    }, 2000);
  });
}
async function p2() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("hdcms");
      resolve();
    }, 2000);
  });
}
async function func() {
  await p1();
  await p2();
}
func();
```

使用 `Promise.all()` 处理多个promise并行执行

```js
async function func() {
  await Promise.all([p1(), p2()]);
}
func();
```

让promise先执行后再使用await处理结果

```js
async function func() {
  let h1 = p1();
  let h2 = p2();
  await h1;
  await h2;
}
func();
```