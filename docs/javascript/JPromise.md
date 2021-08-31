# Promise核心

![](./img/JPromise/index.png)

## 起步构建

::: tip 📗 声明定义类并声明Promise状态与值，有以下几个细节需要注意

- executor为执行者
- 当执行者出现异常时触发**拒绝**状态
- 使用静态属性保存状态值
- 状态只能改变一次，所以在resolve与reject添加条件判断
- 因为 `resolve`或`rejected`方法在executor中调用，作用域也是executor作用域，这会造成this指向window，现在我们使用的是class定义，this为undefined。

:::

```js
class JPromise {
    static PENDING = "pending";
    static FULFILLED = "fulfilled";
    static REJECTED = "rejected";

    constructor(executor) {
        this.status = JPromise.PENDING;
        this.value = null;
        try {
            executor(this.resolve.bind(this), this.reject.bind(this));
        } catch (error) {
            this.reject(error);
        }
    }

    resolve(value) {
        if (this.status == JPromise.PENDING) {
            this.status = JPromise.FULFILLED;
            this.value = value;
        }
    }
    reject(value) {
        if (this.status == JPromise.PENDING) {
            this.status = JPromise.REJECTED;
            this.value = value;
        }
    }
}
```

下面测试一下状态改变

```js
let p = new JPromise((resolve, reject) => {
    resolve("Jerry");
});
console.log(p);
```

## THEN

::: tip 📗 现在添加then方法来处理状态的改变，有以下几点说明

1. then可以有两个参数，即成功和错误时的回调函数
2. then的函数参数都不是必须的，所以需要设置默认值为函数，用于处理当没有传递时情况
3. 当执行then传递的函数发生异常时，统一交给onRejected来处理错误

::: 

### 基础构建

```js
then(onFulfilled, onRejected) {
    if (typeof onFulfilled != "function") {
        onFulfilled = value => value;
    }
    if (typeof onRejected != "function") {
        onRejected = value => value;
    }
    if (this.status == JPromise.FULFILLED) {
        try {
            onFulfilled(this.value);
        } catch (error) {
            onRejected(error);
        }
    }
    if (this.status == JPromise.REJECTED) {
        try {
            onRejected(this.value);
        } catch (error) {
            onRejected(error);
        }
    }
}
```

下面来测试then方法的，结果正常输出`Jerry`

```js
let p = new JPromise((resolve, reject) => {
    resolve("Jerry");
}).then(
    value => {
        console.log(value);
    },
    reason => {
        console.log(reason);
    }
);
```

### 异步任务

但上面的代码产生的Promise并**不是异步**的，使用setTimeout来将onFulfilled与onRejected做为异步宏任务执行

```js
then(onFulfilled, onRejected) {
    if (typeof onFulfilled != "function") {
        onFulfilled = value => value;
    }
    if (typeof onRejected != "function") {
        onRejected = value => value;
    }
    if (this.status == JPromise.FULFILLED) {
        setTimeout(() => {
            try {
                onFulfilled(this.value);
            } catch (error) {
                onRejected(error);
            }
        });
    }
    if (this.status == JPromise.REJECTED) {
        setTimeout(() => {
            try {
                onRejected(this.value);
            } catch (error) {
                onRejected(error);
            }
        });
    }
}
```

现在再执行代码，已经有异步效果了，先输出了`Jerry.com`

```js
let p = new JPromise((resolve, reject) => {
    resolve("Jerry");
}).then(
    value => {
        console.log(value);
    },
    reason => {
        console.log(reason);
    }
);
console.log("Jerry.com");
```

### PENDING状态 💡

目前then方法无法处理promise为pending时的状态

```js
...
let p = new JPromise((resolve, reject) => {
    setTimeout(() => {
        resolve("Jerry");
    });
})
    ...
```

💡💡💡为了处理以下情况，需要进行几点改动💡💡💡

1. 在构造函数中添加callbacks来保存pending状态时处理函数，当状态改变时循环调用

   ```js
   constructor(executor) {
       ...
       this.callbacks = [];
       ...
   }    
   ```

2. 将then方法的回调函数添加到 callbacks 数组中，用于异步执行

   ```js
   then(onFulfilled, onRejected) {
       if (typeof onFulfilled != "function") {
           onFulfilled = value => value;
       }
       if (typeof onRejected != "function") {
           onRejected = value => value;
       }
       if (this.status == JPromise.PENDING) {
           this.callbacks.push({
               onFulfilled: value => {
                   try {
                       onFulfilled(value);
                   } catch (error) {
                       onRejected(error);
                   }
               },
               onRejected: value => {
                   try {
                       onRejected(value);
                   } catch (error) {
                       onRejected(error);
                   }
               }
           });
       }
       ...
   }
   ```

3. resovle与reject中添加处理callback方法的代码

   ```js
   resolve(value) {
       if (this.status == JPromise.PENDING) {
           this.status = JPromise.FULFILLED;
           this.value = value;
           this.callbacks.map(callback => {
               callback.onFulfilled(value);
           });
       }
   }
   reject(value) {
       if (this.status == JPromise.PENDING) {
           this.status = JPromise.REJECTED;
           this.value = value;
           this.callbacks.map(callback => {
               callback.onRejected(value);
           });
       }
   }
   ```

### PENDING异步💡

执行以下代码发现并不是异步操作，应该先输出 `1` 然后是`Jerry`

```js
let p = new JPromise((resolve, reject) => {
    setTimeout(() => {
        resolve("Jerry");
        console.log("1");
    });
}).then(
    value => {
        console.log(value);
    },
    reason => {
        console.log(reason);
    }
);
```

💡 解决以上问题，只需要将resolve与reject执行通过setTimeout定义为异步任务

```js
resolve(value) {
    if (this.status == JPromise.PENDING) {
        this.status = JPromise.FULFILLED;
        this.value = value;
        setTimeout(() => {
            this.callbacks.map(callback => {
                callback.onFulfilled(value);
            });
        });
    }
}
reject(value) {
    if (this.status == JPromise.PENDING) {
        this.status = JPromise.REJECTED;
        this.value = value;
        setTimeout(() => {
            this.callbacks.map(callback => {
                callback.onRejected(value);
            });
        });
    }
}
```

## 链式操作

📌 Promise中的then是链式调用执行的，所以then也要返回Promise才能实现

1. then的onReject函数是对前面Promise的rejected的处理
2. 但该Promise返回状态要为fulfilled，所以在调用onRejected后改变当前promise为fulfilled状态

```js
then(onFulfilled, onRejected) {
    if (typeof onFulfilled != "function") {
        onFulfilled = value => value;
    }
    if (typeof onRejected != "function") {
        onRejected = value => value;
    }
    return new JPromise((resolve, reject) => {
        if (this.status == JPromise.PENDING) {
            this.callbacks.push({
                onFulfilled: value => {
                    try {
                        let result = onFulfilled(value);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                },
                onRejected: value => {
                    try {
                        let result = onRejected(value);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        }
        if (this.status == JPromise.FULFILLED) {
            setTimeout(() => {
                try {
                    let result = onFulfilled(this.value);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        }
        if (this.status == JPromise.REJECTED) {
            setTimeout(() => {
                try {
                    let result = onRejected(this.value);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        }
    });
}
```

下面执行测试后，链式操作已经有效了

```js
let p = new JPromise((resolve, reject) => {
    resolve("Jerry")
})
.then(
    value => {
        console.log(value);
        return "Nice";
    },
    reason => {
        console.log(reason);
    }
)
.then(
    value => {
        console.log(value);
    },
    reason => {
        console.log(reason);
    }
);
```

## 返回类型

如果then返回的是Promise呢？所以我们需要判断分别处理返回值为Promise与普通值的情况

### 基本实现

下面来实现不同类型不同处理机制

```js
then(onFulfilled, onRejected) {
    if (typeof onFulfilled != "function") {
        onFulfilled = value => value;
    }
    if (typeof onRejected != "function") {
        onRejected = value => value;
    }
    return new JPromise((resolve, reject) => {
        if (this.status == JPromise.PENDING) {
            this.callbacks.push({
                onFulfilled: value => {
                    try {
                        let result = onFulfilled(value);
                        if (result instanceof JPromise) {
                            result.then(resolve, reject);
                        } else {
                            resolve(result);
                        }
                    } catch (error) {
                        reject(error);
                    }
                },
                onRejected: value => {
                    try {
                        let result = onRejected(value);
                        if (result instanceof JPromise) {
                            result.then(resolve, reject);
                        } else {
                            resolve(result);
                        }
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        }
        if (this.status == JPromise.FULFILLED) {
            setTimeout(() => {
                try {
                    let result = onFulfilled(this.value);
                    if (result instanceof JPromise) {
                        result.then(resolve, reject);
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }
        if (this.status == JPromise.REJECTED) {
            setTimeout(() => {
                try {
                    let result = onRejected(this.value);
                    if (result instanceof JPromise) {
                        result.then(resolve, reject);
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }
    });
}
```

### 代码复用

现在发现pendding、fulfilled、rejected 状态的代码非常相似，所以可以提取出方法Parse来复用

```js
then(onFulfilled, onRejected) {
    if (typeof onFulfilled != "function") {
        onFulfilled = value => value;
    }
    if (typeof onRejected != "function") {
        onRejected = value => value;
    }
    return new JPromise((resolve, reject) => {
        if (this.status == JPromise.PENDING) {
            this.callbacks.push({
                onFulfilled: value => {
                    this.parse(onFulfilled(this.value), resolve, reject);
                },
                onRejected: value => {
                    this.parse(onRejected(this.value), resolve, reject);
                }
            });
        }
        if (this.status == JPromise.FULFILLED) {
            setTimeout(() => {
                this.parse(onFulfilled(this.value), resolve, reject);
            });
        }
        if (this.status == JPromise.REJECTED) {
            setTimeout(() => {
                this.parse(onRejected(this.value), resolve, reject);
            });
        }
    });
}
parse(result, resolve, reject) {
    try {
        if (result instanceof JPromise) {
            result.then(resolve, reject);
        } else {
            resolve(result);
        }
    } catch (error) {
        reject(error);
    }
}
```

### 返回约束

📌 then的返回的promise不能是then相同的Promise，下面是原生Promise的示例将产生错误

```js
let promise = new Promise(resolve => {
    setTimeout(() => {
        resolve("Jerry");
    });
});
let p = promise.then(value => {
    return p;
});
```

解决上面的问题来完善代码，添加当前promise做为parse的第一个参数与函数结果比对

```js
then(onFulfilled, onRejected) {
    if (typeof onFulfilled != "function") {
        onFulfilled = value => value;
    }
    if (typeof onRejected != "function") {
        onRejected = value => value;
    }
    let promise = new JPromise((resolve, reject) => {
        if (this.status == JPromise.PENDING) {
            this.callbacks.push({
                onFulfilled: value => {
                    this.parse(promise, onFulfilled(this.value), resolve, reject);
                },
                onRejected: value => {
                    this.parse(promise, onRejected(this.value), resolve, reject);
                }
            });
        }
        if (this.status == JPromise.FULFILLED) {
            setTimeout(() => {
                this.parse(promise, onFulfilled(this.value), resolve, reject);
            });
        }
        if (this.status == JPromise.REJECTED) {
            setTimeout(() => {
                this.parse(promise, onRejected(this.value), resolve, reject);
            });
        }
    });
    return promise;
}
parse(promise, result, resolve, reject) {
    // result与当前promise的判断
    if (promise == result) {
        throw new TypeError("Chaining cycle detected for promise");
    }
    try {
        if (result instanceof JPromise) {
            result.then(resolve, reject);
        } else {
            resolve(result);
        }
    } catch (error) {
        reject(error);
    }
}
```

现在进行测试也可以得到原生一样效果了

```js
let p = new JPromise((resolve, reject) => {
    resolve("Jerry");
});
p = p.then(value => {
    return p;
});
```

## RESOLVE

下面来实现Promise的resolve方法

```js
static resolve(value) {
  return new JPromise((resolve, reject) => {
    if (value instanceof JPromise) {
      value.then(resolve, reject);
    } else {
      resolve(value);
    }
  });
}
```

使用普通值的测试

```js
JPromise.resolve("Jerry").then(value => {
    console.log(value);
});
```

使用状态为fulfilled的promise值测试

```js
JPromise.resolve(
    new JPromise(resolve => {
        resolve("Jerry");
    })
).then(value => {
    console.log(value);
});
```

使用状态为rejected的Promise测试

```js
JPromise.resolve(
    new JPromise((null, reject) => {
        reject("rejected");
    })
).then(
    value => {
        console.log(value);
    },
    reason => {
        console.log(reason);
    }
);
```

## REJEDCT

下面定义Promise的reject方法

```js
static reject(reason) {
  // reject不能接受promise，不用考虑
  return new JPromise((null, reject) => {
    reject(reason);
  });
}
```

使用测试

```js
JPromise.reject("rejected").then(null, reason => {
    console.log(reason);
});
```

## ALL

下面来实现Promise的all方法

```js
static all(promises) {
    let resolves = [];
    return new JPromise((resolve, reject) => {
        promises.forEach((promise, index) => {
            promise.then(
                value => {
                    resolves.push(value);
                    // 结束判断
                    if (resolves.length == promises.length) {
                        resolve(resolves);
                    }
                },
                reason => {
                    reject(reason);
                }
            );
        });
    });
}
```

来对所有Promise状态为fulfilled的测试

```js
let p1 = new JPromise((resolve, reject) => {
    resolve("Jerry");
});
let p2 = new JPromise((resolve, reject) => {
    reject("Jerry");
});
let promises = JPromise.all([p1, p2]).then(
    promises => {
        console.log(promises);
    },
    reason => {
        console.log(reason);
    }
);
```

使用我们写的resolve进行测试

```js
let p1 = JPromise.resolve("Jerry");
let p2 = JPromise.resolve("Hello");
let promises = JPromise.all([p1, p2]).then(
    promises => {
        console.log(promises);
    },
    reason => {
        console.log(reason);
    }
);
```

其中一个Promise为rejected时的效果

```js
let p1 = JPromise.resolve("Jerry");
let p2 = JPromise.reject("rejected");
let promises = JPromise.all([p1, p2]).then(
    promises => {
        console.log(promises);
    },
    reason => {
        console.log(reason);
    }
);
```

## RACE

下面实现Promise的race方法

```js
static race(promises) {
    return new JPromise((resolve, reject) => {
        promises.map(promise => {
            // 因为promise状态改变之后就不会再变化，不需要其他操作
            promise.then(value => {
                resolve(value);
            });
        });
    });
}
```

我们来进行测试

```js
let p1 = JPromise.resolve("Jerry");
let p2 = JPromise.resolve("Nice");
let promises = JPromise.race([p1, p2]).then(
    promises => {
        console.log(promises);
    },
    reason => {
        console.log(reason);
    }
);
```

使用延迟Promise后的效果

```js
let p1 = new JPromise(resolve => {
    setInterval(() => {
        resolve("Jerry");
    }, 2000);
});
let p2 = new JPromise(resolve => {
    setInterval(() => {
        resolve("Hi~");
    }, 1000);
});
let promises = JPromise.race([p1, p2]).then(
    promises => {
        console.log(promises);  // Hi~
    },
    reason => {
        console.log(reason);
    }
);
```