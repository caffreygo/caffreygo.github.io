# 数组类型

## 声明数组

1. 通过`Array`构造函数创建数组

   ```js
   new Array(1, 2, 3)  // [1, 2, 3]
   ```

2. 通过字面量创建

   ```js
   const arr = [1, 2, 3]
   ```

3. 声明多个空元素数组

   ```js
   const arr = new Array(3)
   console.log(arr.length)  // 3
   console.log(arr)         // [empty × 3]
   console.log(arr[1])      // undedined
   ```

### Array.of

📌 使用`Array.of` 与 `new Array` 不同，设置一个参数时不会创建空元素数组

`Array.of`方法固定生成一个参数组成的数组

```js
let arr = Array.of(3);
console.log(arr);  // [3]

arr = Array.of(1, 2, 3);
console.log(arr);  // [1, 2, 3]
```

### 类型检测

```js
console.log(Array.isArray([1, "2"]));   //true
console.log(Array.isArray(9));          //false
```

## 类型转换

📌 可以将数组转换为字符串也可以将其他类型转换为数组

### 字符串

**大部分数据类型**都可以使用`.toString()` 函数转换为字符串。

```js
console.log(([1, 2, 3]).toString()); // 1,2,3
```

也可以使用函数 `String` 转换为字符串。

```js
console.log(String([1, 2, 3]));
```

或使用`join`连接为字符串

```js
console.log([1, 2, 3].join("-"));//1-2-3
```

### Array.from 💡

📌 使用`Array.from`可将类数组转换为数组，类数组指包含 `length` 属性或可迭代的对象。

- 第一个参数为要转换的数据，第二个参数为类似于`map` 函数的回调方法

```js
let str = '大家好';
console.log(Array.from(str)); //["大", "家", "好"]
```

📗 为对象设置`length`属性后也可以转换为数组，但要下标为**数值**或**数值字符串**

- length属性
- 下标

```js
let user = {
  0: 'hello',
  '1': 18,
  length: 2
};
console.log(Array.from(user)); //["hello", 18]
```

DOM元素转换为数组后来使用数组函数，第二个参数类似于`map` 函数的方法，可对数组元素执行函数处理。

```html
<body>
    <button message="hello">button</button>
    <button message="world">button</button>
</body>

<script>
    let btns = document.querySelectorAll('button');
    console.log(btns); // 包含length属性
    Array.from(btns, (item) => {
        item.style.background = 'red';
    });
</script>
```

## 展开语法

### 数组合并

使用展开语法来合并数组相比 `concat` 要更简单，使用`...` 可将数组展开为多个值。

```js
let a = [1, 2, 3];
let b = ['a', 'hello', ...a];
console.log(b); //["a", "hello", 1, 2, 3]
```

### 函数参数

📗 使用展示语法可以替代 `arguments` 来接收任意数量的参数

> arguments拥有length属性，但是并不是真正的数组，需要进行转换[...arguments]

```js
function abc(...args) {
  console.log(args);
}
abc(1, 2, 3, "hello"); //[1, 2, 3, "hello"]
```

也可以用于接收部分参数

```js
function abc(site, ...args) {
  console.log(site, args); //hello (3) [1, 2, 3]
}
abc("hello", 1, 2, 3);
```

### 节点转换

可以将DOM节点转为数组，下面例子不可以使用 `map` 方法，因为是节点列表 `NodeList` (类数组)

```html
<body>
    <button message="hello">button</button>
    <button message="Jerry">button</button>
</body>

<script>
    let btns = document.querySelectorAll('button');
    btns.map((item) => {
        console.log(item); //TypeError: btns.map is not a function
    })
</script>
```

💡 使用**展开语法**后就可以使用数据方法

```html
<body>
  <div>Jerry</div>
  <div>nice</div>
</body>

<script>
  let divs = document.querySelectorAll("div");
  [...divs].map(function(div) {
    div.addEventListener("click", function() {
      this.classList.toggle("hide");
    });
  });
</script>
```

💡 也可以使用**原型处理**借用Array的原型方法

```html
<body>
    <button message="hello">button</button>
    <button message="Jerry">button</button>
</body>

<script>
    let btns = document.querySelectorAll('button');
    Array.prototype.map.call(btns, (item) => {
        item.style.background = 'red';
    });
</script>
```

## 解构赋值

📌 解构是一种更简洁的赋值特性，可以理解为分解一个数据的结构

> 建议使用 `var/let/const` 声明

### 基本使用

下面是基本使用语法

```js
//数组使用
let [name, url] = ['hello', 'nice.com'];
console.log(name);
```

解构赋值数组

```js
function abc() {
	return ['nice', 'Jerry'];
}
let [a, b] = abc();
console.log(a); //nice
```

剩余解构指用一个变量来接收剩余参数

```js
let [a, ...b] = ['hello', 'nice', 'Jerry'];
console.log(b);  // ['nice', 'Jerry']
```

如果变量已经初始化过，就要使用`()` 定义赋值表达式，严格模式会报错所以不建议使用。

```js
let web = "hello";
[web, url] = ["Jerry.com", "nice.com"];  
console.log(web);
```

字符串解构

```js
"use strict";
const [...a] = "nice.com";
console.log(a); // Array(13)
```

### 严格模式

📗 非严格模式可以不使用声明指令，严格模式下必须使用声明。所以建议使用 let 等声明。

```js
"use strict";

[web, url] = ["Jerry.com", "nice.com"];
console.log(web);
```

### 简洁定义

只赋值部分变量

```js
let [,url]=['hello','nice.com'];
console.log(url);//nice.com
```

使用展开语法获取多个值

```js
let [name, ...arr] = ['hello', 'Jerry', 'nice.com'];
console.log(name, arr); //hello (2) ["Jerry", "nice.com"]
```

### 默认值

为变量设置默认值

```js
let [name, site = 'Jerry'] = ['hello'];
console.log(site); //Jerry
```

### 函数参数

数组参数的使用

```js
function abc([a, b]) {
	console.log(a, b);
}
abc(['hello', 'Jerry']);
```

## 管理元素

### 基本使用

使用从0开始的索引来改变数组

```js
let arr = [1, "hello", "Jerry"];
arr[1] = 'hello教程';
console.log(arr); //[1, "hello教程", "Jerry"]
```

向数组追回元素

```js
let arr = [1, "hello", "Jerry"];
arr[arr.length] = 'nice.com';   // push
console.log(arr);  //[1, "hello", "Jerry", "nice.com"]
```

### 扩展语法

使用展示语法批量添加元素

```js
let arr = ["hello", "Jerry"];
let abc = ["nice"];
abc.push(...arr);
console.log(abc); //["nice", "hello", "Jerry"]
```

### push

压入元素，直接改变元数组，返回值为数组元素数量

```js
let arr = ["hello", "Jerry"];
console.log(arr.push('world', 'nice')); //4
console.log(arr); //["hello", "Jerry", "world", "nice"]
```

根据区间创建新数组

```js
function rangeArray(begin, end) {
  const array = [];
  for (let i = begin; i <= end; i++) {
    array.push(i);
  }
  return array;
}
console.log(rangeArray(1, 6));
```

### pop

从末尾弹出元素，直接改变元数组，返回值为弹出的元素

```js
let arr = ["hello", "Jerry"];
console.log(arr.pop()); //Jerry
console.log(arr); //["hello"]
```

### shift

从数组前面取出一个元素

```js
let arr = ["hello", "Jerry"];
console.log(arr.shift()); //hello
console.log(arr); //["Jerry"]
```

### unshift

从数组前面添加元素

```js
let arr = ["hello", "Jerry"];
console.log(arr.unshift('world', 'nice')); //4
console.log(arr); //["world", "nice", "hello", "Jerry"]
```

### fill

使用`fill` 填充数组元素

```js
console.dir(Array(4).fill("hello")); //["hello", "hello", "hello", "hello"]
```

指定填充位置

```js
console.log([1, 2, 3, 4].fill("hello", 1, 2)); //[1, "hello", 3, 4]
```

### slice

使用 `slice` 方法从数组中截取部分元素组合成新数组（并不会改变原数组），不传第二个参数时截取到数组的最后元素

```js
let arr = [0, 1, 2, 3, 4, 5, 6];
console.log(arr.slice(1, 3)); // [1,2]
```

不设置参数是为获取所有元素

 💡 可以使用`Array.prototype.slice.call(this)` 进行浅拷贝

```js
let arr = [0, 1, 2, 3, 4, 5, 6];
console.log(arr.slice()); //[0, 1, 2, 3, 4, 5, 6]
```

### splice

使用 `splice` 方法可以添加、删除、替换数组中的元素，**会对原数组进行改变**，返回值为删除的元素。

删除数组元素第一个参数为从哪开始删除，第二个参数为删除的数量。

```js
let arr = [0, 1, 2, 3, 4, 5, 6];
console.log(arr.splice(1, 3)); //返回删除的元素 [1, 2, 3] 
console.log(arr); //删除数据后的原数组 [0, 4, 5, 6]
```

通过修改`length`删除最后一个元素

```js
let arr = ["hello", "Jerry"];
arr.length = arr.length - 1;
console.log(arr);
```

通过指定第三个参数来设置在删除位置添加的元素

```js
let arr = [0, 1, 2, 3, 4, 5, 6];
console.log(arr.splice(1, 3, 'Jerry', 'hello')); //[1, 2, 3]
console.log(arr); //[0, "Jerry", "hello", 4, 5, 6]
```

向末尾添加元素

```js
let arr = [0, 1, 2, 3, 4, 5, 6];
console.log(arr.splice(arr.length, 0, 'Jerry', 'hello')); //[]
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, "Jerry", "hello"]
```

向数组前添加元素

```js
let arr = [0, 1, 2, 3, 4, 5, 6];
console.log(arr.splice(0, 0, 'Jerry', 'hello')); //[]
console.log(arr); //["Jerry", "hello", 0, 1, 2, 3, 4, 5, 6]
```

数组元素位置调整函数

```js
function move(array, before, to) {
    if (before < 0 || to >= array.length) {
        console.error("指定位置错误");
        return;
    }
    const newArray = [...array];
    const elem = newArray.splice(before, 1);
    newArray.splice(to, 0, ...elem);
    return newArray;
}
const array = [1, 2, 3, 4];
console.table(move(array, 0, 3));
```

### 清空数组

将数组值修改为`[]`可以清空数组，如果有多个引用时数组在内存中存在被其他变量引用。

```js
let user = [{ name: "Jerry" }, { name: "hello" }];
let arr = user;
user = [];
console.log(user);
console.log(arr);
```

将数组`length`设置为0也可以清空数组

```js
let user = [{ name: "Jerry" }, { name: "hello" }];
user.length = 0;
console.log(user);
```

使用`splice`方法删除所有数组元素

```js
let user = [{ name: "Jerry" }, { name: "hello" }];
user.splice(0, user.length);
console.log(user);
```

使用`pop/shift`删除所有元素，来清空数组

```js
let user = [{ name: "Jerry" }, { name: "hello" }];
while (user.pop()) {}
console.log(user);
```

## 合并拆分

### join

使用`join`连接成字符串

```js
let arr = [1, "hello", "Jerry"];
console.log(arr.join('-')); //1-hello-Jerry 使用join可以指定转换的连接方式
```

### split

`split` 方法用于将字符串分割成数组，类似`join`方法的反函数。

```js
let price = "99,78,68";
console.log(price.split(",")); //["99", "78", "68"]
```

### concat

`concat`方法用于连接两个或多个数组，元素是值类型的是复制操作，如果是引用类型还是指向同一对象

```js
let array = ["Jerry", "nice"];
let abc = [1, 2];
let cms = [3, 4];
console.log(array.concat(abc, cms)); //["Jerry", "nice", 1, 2, 3, 4]
```

也可以使用扩展语法实现连接

```js
console.log([...array, ...abc, ...cms]);
```

### copyWithin 💡

使用 `copyWithin` 从数组中复制一部分到同数组中的另外位置。

语法说明

```js
array.copyWithin(target, start, end)
```

参数说明

| 参数     | 描述                                                         |
| :------- | :----------------------------------------------------------- |
| *target* | 必需。复制到指定目标索引位置。                               |
| *start*  | 可选。元素复制的起始位置。                                   |
| *end*    | 可选。停止复制的索引位置 (默认为 *array*.length)。如果为负值，表示倒数。 |

```js
const arr = [1, 2, 3, 4];
console.log(arr.copyWithin(2, 0, 2)); //[1, 2, 1, 2]
```

## 查找元素

数组包含多种查找的函数，需要把这些函数掌握清楚，然后根据不同场景选择合适的函数。

### indexOf

使用 `indexOf` 从前向后查找元素出现的位置，如果找不到返回 `-1`。

```js
let arr = [7, 3, 2, 8, 2, 6];
console.log(arr.indexOf(2)); // 2 从前面查找2出现的位置
```

如下面代码一下，使用 `indexOf` 查找字符串将找不到，因为`indexOf` 类似于`===`是严格类型约束。

```js
let arr = [7, 3, 2, '8', 2, 6];
console.log(arr.indexOf(8)); // -1
```

第二个参数用于指定查找开始位置

```js
let arr = [7, 3, 2, 8, 2, 6];
//从第二个元素开始向后查找
console.log(arr.indexOf(2, 3)); //4
```

### lastIndexOf

使用 `lastIndexOf` 从后向前查找元素出现的位置，如果找不到返回 `-1`。

```js
let arr = [7, 3, 2, 8, 2, 6];
console.log(arr.lastIndexOf(2)); // 4 从后查找2出现的位置
```

第二个参数用于指定查找开始位置

```js
let arr = [7, 3, 2, 8, 2, 6];
//从第五个元素向前查找
console.log(arr.lastIndexOf(2, 5));

//从最后一个字符向前查找
console.log(arr.lastIndexOf(2, -2));
```

### includes

使用 `includes` 查找字符串返回值是布尔类型更方便判断

```js
let arr = [7, 3, 2, 6];
console.log(arr.includes(6)); //true
```

我们来实现一个自已经的`includes`函数，来加深对`includes`方法的了解

```js
function includes(array, item) {
  for (const value of array)
    if (item === value) return true;
  return false;
}

console.log(includes([1, 2, 3, 4], 3)); //true
```

### find

find 方法找到后会把值返回出来

> 如果找不到返回值为`undefined`

返回第一次找到的值，不继续查找

```js
let arr = ["Jerry", "nice", "Jerry"];

let find = arr.find(function(item) {
  return item == "Jerry";
});

console.log(find); //Jerry
```

使用`includes`等不能查找引用类型，因为它们的内存地址是不相等的

```js
const user = [{ name: "李四" }, { name: "张三" }, { name: "hello" }];
const find = user.includes({ name: "hello" });
console.log(find);
```

`find` 可以方便的查找引用类型

```js
const user = [{ name: "李四" }, { name: "张三" }, { name: "hello" }];
const find = user.find(user => user.name === "hello");
console.log(find);
```

### findIndex

`findIndex` 与 `find` 的区别是返回索引值，参数也是 : 当前值，索引，操作数组。

- 查找不到时返回 `-1`

```js
let arr = [7, 3, 2, '8', 2, 6];

console.log(arr.findIndex(function (v) {
	return v == 8;
})); //3
```

### find原理

下面使用自定义函数

```js
let arr = [1, 2, 3, 4, 5];
function find(array, callback) {
  for (const value of array) {
    if (callback(value) === true) return value;
  }
  return undefined;
}
let res = find(arr, function(item) {
  return item == 23;
});
console.log(res);
```

下面添加原型方法实现

```js
Array.prototype.findValue = function(callback) {
  for (const value of this) {
    if (callback(value) === true) return value;
  }
  return undefined;
};

let re = arr.findValue(function(item) {
  return item == 2;
});
console.log(re);
```

## 数组排序

### reverse

反转数组顺序

```js
let arr = [1, 4, 2, 9];
console.log(arr.reverse()); //[9, 2, 4, 1]
```

### sort

```
sort`每次使用两个值进行比较 `Array.sort((a,b)=>a-b
```

- 返回负数 a 排在 b前面，从小到大
- 返回正数 b 排在a 前面
- 返回 0 时不动

默认从小于大排序数组元素

```js
let arr = [1, 4, 2, 9];
console.log(arr.sort()); //[1, 2, 4, 9]
```

使用排序函数从大到小排序，参数一与参数二比较，返回正数为降序负数为升序

```js
let arr = [1, 4, 2, 9];

console.log(arr.sort(function (v1, v2) {
	return v2 - v1;
})); //[9, 4, 2, 1]
```

下面是按课程点击数由高到低排序

```js
let lessons = [
  { title: "媒体查询响应式布局", click: 78 },
  { title: "FLEX 弹性盒模型", click: 12 },
  { title: "MYSQL多表查询随意操作", click: 99 }
];

let sortLessons = lessons.sort((v1, v2) => v2.click - v1.click);
console.log(sortLessons);
```

### 排序原理

```js
let arr = [1, 5, 3, 9, 7];
function sort(array, callback) {
  for (const n in array) {
    for (const m in array) {
      if (callback(array[n], array[m]) < 0) {
        let temp = array[n];
        array[n] = array[m];
        array[m] = temp;
      }
    }
  }
  return array;
}
arr = sort(arr, function(a, b) {
  return a - b;
});
console.table(arr);
```

## 循环遍历

### for

根据数组长度结合`for` 循环来遍历数组

```js
let lessons = [
	{title: '媒体查询响应式布局',category: 'css'},
  {title: 'FLEX 弹性盒模型',category: 'css'},
	{title: 'MYSQL多表查询随意操作',category: 'mysql'}
];

for (let i = 0; i < lessons.length; i++) {
  lessons[i] = `hello: ${lessons[i].title}`;
}
console.table(lessons);
```

### forEach

`forEach`使函数作用在每个数组元素上，但是没有返回值。

下面例子是截取标签的五个字符。

```js
let lessons = [
	{title: '媒体查询响应式布局',category: 'css'},
  {title: 'FLEX 弹性盒模型',category: 'css'},
	{title: 'MYSQL多表查询随意操作',category: 'mysql'}
];

lessons.forEach((item, index, array) => {
    item.title = item.title.substr(0, 5);
});
console.log(lessons);
```

### for/in

遍历时的 key 值为数组的索引 (key in Object, value of Object)

```js
let lessons = [
	{title: '媒体查询响应式布局',category: 'css'},
  {title: 'FLEX 弹性盒模型',category: 'css'},
	{title: 'MYSQL多表查询随意操作',category: 'mysql'}
];

for (const key in lessons) {
    console.log(`标题: ${lessons[key].title}`);
}
```

### for/of

与 `for/in` 不同的是 `for/of` 每次循环取其中的值而不是索引。

```js
let lessons = [
	{title: '媒体查询响应式布局',category: 'css'},
  {title: 'FLEX 弹性盒模型',category: 'css'},
	{title: 'MYSQL多表查询随意操作',category: 'mysql'}
];

for (const item of lessons) {
  console.log(`
    标题: ${item.title}
    栏目: ${item.category == "css" ? "前端" : "数据库"}
  `);
}
```

使用数组的迭代对象遍历获取索引与值

```js
const abc = ['nice', 'Jerry'];
const iterator = abc.entries();
console.log(iterator.next()); //value:{0:0,1:'nice'}
console.log(iterator.next()); //value:{0:1,1:'Jerry'}
```

这样就可以使用解构特性与 `for/of` 遍历并获取索引与值了

```js
const abc = ["Jerry", "nice"];

for (const [key, value] of abc.entries()) {
  console.log(key, value); //这样就可以遍历了
}
```

取数组中的最大值

```js
function arrayMax(array) {
  let max = array[0];
  for (const elem of array) {
    max = max > elem ? max : elem;
  }
  return max;
}

console.log(arrayMax([1, 3, 2, 9]));
```

## 迭代器方法 💡

### keys

通过迭代对象获取索引

```js
const abc = ["nice", "Jerry"];
const keys = abc.keys();
console.log(keys.next());
console.log(keys.next());
```

获取数组所有键

```js
"use strict";
const arr = ["a", "b", "c", "hello"];

for (const key of arr.keys()) {
  console.log(key);
}
```

使用while遍历

```js
let arr = ["Jerry", "nice"];
while (({ value, done } = values.keys()) && done === false) {
	console.log(value);
}
```

### values

通过迭代对象获取值

```js
const abc = ["nice", "Jerry"];
const values = abc.values();
console.log(values.next());
console.log(values.next());
console.log(values.next());
```

获取数组的所有值

```js
"use strict";
const arr = ["a", "b", "c", "hello"];

for (const value of arr.values()) {
  console.log(value);
}
```

### entries

返回数组所有键值对，下面使用解构语法循环

```js
const arr = ["a", "b", "c", "hello"];
for (const [key, value] of arr.entries()) {
  console.log(key, value);
}
```

解构获取内容（对象章节会详细讲解）

```js
const abc = ["nice", "Jerry"];
const iterator = abc.entries();

let {done,value: [k, v]} = iterator.next();

console.log(v);
```

## 扩展方法

### every

`every` 用于递归的检测元素，要所有元素操作都要返回真结果才为真。

查看班级中同学的JS成绩是否都及格

```js
const user = [
  { name: "李四", js: 89 },
  { name: "马六", js: 55 },
  { name: "张三", js: 78 }
];
const resust = user.every(user => user.js >= 60);
console.log(resust);
```

标题的关键词检查

```js
let words = ['后盾', '北京', '培训'];
let title = 'hello不断分享技术教程';

let state = words.every(function (item, index, array) {
  return title.indexOf(item) >= 0;
});

if (state == false) console.log('标题必须包含所有关键词');
```

### some

使用 `some` 函数可以递归的检测元素，如果有一个返回true，表达式结果就是真。第一个参数为元素，第二个参数为索引，第三个参数为原数组。

下面是使用 `some` 检测规则关键词的示例，如果匹配到一个词就提示违规。

```js
let words = ['厦门', '北京', '武汉'];
let title = 'hello不断分享技术教程'

let state = words.some(function (item, index, array) {
	return title.indexOf(item) >= 0;
});

if (state) console.log('标题含有违规关键词');
```

### filter

📌使用 `filter` 可以过滤数据中元素，下面是获取所有在CSS栏目的数据

```js
let lessons = [
  {title: '媒体查询响应式布局',category: 'css'},
  {title: 'FLEX 弹性盒模型',category: 'css'},
  {title: 'MYSQL多表查询随意操作',category: 'mysql'}
];

let cssLessons = lessons.filter(function (item, index, array) {
  if (item.category.toLowerCase() == 'css') {
    return true;
  }
});

console.log(cssLessons);
```

我们来写一个过滤元素的方法来加深些技术

```js
function except(array, excepts) {
  const newArray = [];
  for (const elem of array)
    if (!excepts.includes(elem)) newArray.push(elem);
  return newArray;
}

const array = [1, 2, 3, 4];
console.log(except(array, [2, 3])); //[1,4]
```

### map

 📌 使用 `map` **映射**可以在数组的所有元素上应用函数，用于映射出新的值。

获取数组所有标题组合的新数组

```js
let lessons = [
  {title: '媒体查询响应式布局',category: 'css'},
  {title: 'FLEX 弹性盒模型',category: 'css'},
  {title: 'MYSQL多表查询随意操作',category: 'mysql'}
];

console.log(lessons.map(item => item.title));
```

为所有标题添加上 `hello`

```js
let lessons = [
  {title: '媒体查询响应式布局',category: 'css'},
  {title: 'FLEX 弹性盒模型',category: 'css'},
  {title: 'MYSQL多表查询随意操作',category: 'mysql'}
];

lessons = lessons.map(function (item, index, array) {
    item.title = `[hello] ${item['title']}`;
    return item;
});
console.log(lessons);
```

### reduce 💡

📌 使用 `reduce` 与 `reduceRight` 函数可以迭代数组的所有元素，`reduce` 从前开始 `reduceRight` 从后面开始。下面通过函数计算课程点击数的和。

第一个参数是执行函数，第二个参数为初始值

- 传入第二个参数时将所有元素循环一遍
- 不传第二个参数时从第二个元素开始循环

函数参数说明如下：

| 参数  | 说明                       |
| ----- | -------------------------- |
| prev  | 上次调用回调函数返回的结果 |
| cur   | 当前的元素值               |
| index | 当前的索引                 |
| array | 原数组                     |

统计元素出现的次数

```js
function countArrayELem(array, elem) {
  return array.reduce((total, cur) => (total += cur == elem ? 1 : 0), 0);
}

let numbers = [1, 2, 3, 1, 5];
console.log(countArrayELem(numbers, 1)); //2
```

取数组中的最大值

```js
function arrayMax(array) {
  return array.reduce(
  	(max, elem) => (max > elem ? max : elem), array[0]
  );
}

console.log(arrayMax([1, 3, 2, 9]));
```

取价格最高的商品

```js
let cart = [
  { name: "iphone", price: 12000 },
  { name: "imac", price: 25000 },
  { name: "ipad", price: 3600 }
];

function maxPrice(array) {
  return array.reduce(
    (goods, elem) => (goods.price > elem.price ? goods : elem),
    array[0]
  );
}
console.log(maxPrice(cart));
```

计算购物车中的商品总价

```js
let cart = [
  { name: "iphone", price: 12000 },
  { name: "imac", price: 25000 },
  { name: "ipad", price: 3600 }
];

const total = cart.reduce(
	(total, goods) => total += goods.price, 0
);
console.log(total); //40600
```

获取价格超过1万的商品名称

```js
let goods = [
  { name: "iphone", price: 12000 },
  { name: "imac", price: 25000 },
  { name: "ipad", price: 3600 }
];

function getNameByPrice(array, price) {
  return array.reduce((goods, elem) => {
    if (elem.price > price) {
      goods.push(elem);
    }
    return goods;
  }, []).map(elem => elem.name);
}
console.table(getNameByPrice(goods, 10000));
```

使用 `reduce` 实现数组去重

```js
let arr = [1, 2, 6, 2, 1];
let filterArr = arr.reduce((pre, cur, index, array) => {
  if (pre.includes(cur) === false) {
      pre = [...pre, cur];
  }
  return pre;
}, [])
console.log(filterArr); // [1,2,6]
```

## 动画案例

![](./img/array/jsAnimation.gif)

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #2c3e50;
    }

    * {
      padding: 0;
      margin: 0;
    }

    div {
      color: #9b59b6;
      font-size: 5em;
      font-weight: bold;
      text-transform: uppercase;
      cursor: pointer;
    }

    div>span {
      position: relative;
      display: inline-block;
    }

    .changeColor {
      animation-name: changeColor;
      animation-duration: 1s;
      animation-direction: alternate;
      animation-iteration-count: 2;
      animation-timing-function: linear;
    }

    @keyframes changeColor {
      50% {
        color: #f1c40f;
        transform: scale(1.5);
      }

      to {
        color: #9b59b6;
        transform: scale(0.5);
      }
    }
  </style>
</head>


<body>
  <div>blog.caffreygo.com</div>
</body>

<script>
  let div = document.querySelector("div");
  [...div.textContent].reduce((pre, cur, index) => {
    pre == index && (div.innerHTML = "");
    let span = document.createElement("span");
    span.textContent = cur;
    div.appendChild(span);
    span.addEventListener("mouseover", function () {
      this.classList.add("changeColor");
    });
    span.addEventListener("animationend", function () {
      this.classList.remove("changeColor");
    });
  }, 0);
</script>

</html>
```