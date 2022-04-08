# 基本类型

## 类型检测

### typeof

::: tip typeof 用于返回以下原始类型

- 基本类型：number/string/boolean
- function
- object
- undefined

::: 

可以使用typeof用于判断数据的类型

```js
let a = 1;
console.log(typeof a); //number

let b = "1";
console.log(typeof b); //string

//未赋值或不存在的变量返回undefined
var abc;
console.log(typeof abc); //undefined 

function run() {}
console.log(typeof run); //function

let c = [1, 2, 3];
console.log(typeof c); //object

let d = { name: "google.com" };
console.log(typeof d); //object
```

### instanceof

📗**`instanceof`** 运算符用于检测**构造函数**的 `prototype` 属性是否出现在某个实例对象的原型链上。也可以理解为是否为某个对象的实例

💡 `typeof`不能区分数组，但`instanceof`则可以。

```js
console.log({}.__proto__ == Object.prototype) // true
```

```js
let abc = [];
let google = {};
console.log(abc instanceof Array); // true
console.log(google instanceof Array); // false

let c = [1, 2, 3];
console.log(c instanceof Array); // true

let d = { name: "google.com" };
console.log(d instanceof Object); // true

function User() {}
let abc = new User();
console.log(abc instanceof User); // true
```

### 值类型与对象 💡

💡💡 下面是使用字面量与对象方法创建字符串，返回的是不同类型。

```js
let abc = "google";
let prop = new String("abcprop"); 
console.log(typeof abc, typeof prop);  // string object
```

只有对象才有方法使用，但在`JS`中也可以使用值类型调用方法，因为**它会在执行时将值类型转为对象**。

```js
let abc = "google";
let prop = new String("abcprop");
console.log(abc.length);  / 6
console.log(prop.length);  / 7
```

## String

### 声明定义

使用对象形式创建字符串

```js
let abc = new String('google');
// 获取字符串长度
console.log(abc.length); // 6
// 获取字符串
console.log(abc.toString()); // google
```

字符串使用单、双引号包裹，单、双引号使用结果没有区别。

```js
let content = 'MDN';
console.log(content); // MDN
```

### 转义符号

📗 有些字符有双层含义，需要使用 `\` 转义符号进行含义转换。下例中引号为字符串边界符，如果输出引号时需要使用转义符号。

```js
let content = 'MDN \'google.com\'';
console.log(content);  // MDN 'google.com'
```

常用转义符号列表如下

| 符号 | 说明     |
| ---- | -------- |
| \t   | 制表符   |
| \n   | 换行     |
| \\   | 斜杠符号 |
| \'   | 单引号   |
| \"   | 双引号R  |

### 连接运算符

使用 `+` 可以连接多个内容组合成字符串，经常用于组合输出内容使用。

```js
let year = 1987,
name = 'google';
console.log(name + '成立于' + year + '年');  // google成立于1987年
```

使用 `+=` 在字符串上追回字符内容

```js
let web = 'MDN';
web += '网址：google.com';
console.log(web); //MDN网址：google.com
```

### 模板字面量 💡

包裹的字符串中可以写入引入变量与表达式

```js
let url = 'google.com';
console.log(`MDN网址是${url}`); //MDN网址是google.com
```

支持换行操作不会产生错误

```js
let url = 'google.com';
document.write(`MDN网址是${url}
大家可以在网站上学习到很多技术知识`);
```

💡💡 使用表达式 💡💡

```js
function show(title) {
	return `MDN`;
}
console.log(`${show()}`)
```

💡💡 模板字面量支持嵌套使用 💡💡

```js
let lessons = [{
    title: '媒体查询响应式布局'
}, {
    title: 'FLEX 弹性盒模型'
}, {
    title: 'GRID 栅格系统'
}];

function template() {
    return `<ul>
		${lessons.map((item)=>`<li>${item.title}</li>`).join('')}
	</ul>`;
}
document.body.innerHTML = template();
```

### 标签模板 💡

标签模板是提取出普通字符串与变量，交由标签函数处理

```js
let lesson = 'css';
let web = 'mdn';
tag `访问${web}巩固${lesson}前端知识`;

function tag(strings, ...values) {
    console.log(strings); //["访问", "巩固", "前端知识"]
    console.log(values); // ["mdn", "css"]
}
```

下面例子将标题中有MDN的使用标签模板加上链接

```js
let lessons = [
    { title: "MDN媒体查询响应式布局", author: "MDN" },
    { title: "FLEX 弹性盒模型", author: "CSS" },
    { title: "GRID 栅格系统MDN教程", author: "GRID" }
];

function links(strings, ...vars) {
    // strings ['<li>', ':', '</li>']
    // vars  ['MDN', 'MDN媒体查询响应式布局']...
    return strings
        .map((str, key) => {
        return (
            str +
            (vars[key]
             ? vars[key].replace(
                "MDN",
                `<a href="https://www.google.com">MDN</a>`
            )
             : "")
        ); 
    })
        .join("");
}

function template() {
    return `<ul>
		${lessons
            .map(item => links`<li>${item.author}:${item.title}</li>`)
            .join("")}
	</ul>`;
}
document.body.innerHTML += template();
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/javascript/basicType/1.png)

### 获取长度

使用`length`属性可以获取字符串长度

```js
console.log("google.com".length)  // 10
```

### 大小写转换

将字符转换成大写格式

```js
console.log('google.com'.toUpperCase()); //GOOGLE.COM
```

转字符为小写格式

```js
console.log('google.com'.toLowerCase()); //google.com
```

### 移除空白

使用`trim`删除字符串左右的空白字符

```js
let str = '   google.com  ';
console.log(str.length);  // 15
console.log(str.trim().length);  // 10
```

使用`trimLeft`删除左边空白，使用`trimRight`删除右边空白

```js
let name = " google ";
console.log(name);  // " google "
console.log(name.trimLeft());  // "google "
console.log(name.trimRight());  // " google"
```

### 获取单字符

根据从0开始的位置获取字符

```js
console.log('google'.charAt(3))  // g
```

💡 使用数字索引获取字符串

```js
console.log('google'[3])  // g
```

### 截取字符串

::: tip 使用 `slice、substr、substring` 函数都可以截取字符串。

- slice、substring 第二个参数为截取的结束位置
- substr 第二个参数指定获取字符数量

::: 

```js
let abc = 'google.com';
console.log(abc.slice(3)); // gle.com
console.log(abc.substr(3)); // gle.com
console.log(abc.substring(3)); // gle.com

console.log(abc.slice(3, 6)); // gle
console.log(abc.substring(3, 6)); // gle
console.log(abc.substring(3, 0)); // goo
console.log(abc.substr(3, 6)); // gle.co

console.log(abc.slice(3, -1)); // gle.co
console.log(abc.slice(-2));// om
console.log(abc.substring(3, -9)); // goo  substring没意义负数会变成0
console.log(abc.substr(-3, 2)); // co
```

### 查找字符串

从开始获取字符串位置，检测不到时返回 `-1`

```js
console.log('google.com'.indexOf('o')); // 1
console.log('google.com'.indexOf('o', 3)); // 8 从第3个字符向后搜索
```

从结尾来搜索字符串位置

```js
console.log('google.com'.lastIndexOf('o')); // 8
console.log('google.com'.lastIndexOf('o', 7)); // 2 从第7个字符向前搜索
```

search() 方法用于检索字符串中指定的子字符串，也可以使用正则表达式搜索

```js
let str = "google.com";
console.log(str.search("com"));  // 7
console.log(str.search(/\.com/i));  // 6
```

`includes` 字符串中是否包含指定的值，第二个参数指查找开始位置

```js
console.log('google.com'.includes('o')); //true
console.log('google.com'.includes('l', 6)); //false
```

`startsWith` 是否是指定位置开始，第二个参数为查找的开始位置。

```js
console.log('google.com'.startsWith('g')); //true
console.log('google.com'.startsWith('o', 1)); //true
```

`endsWith` 是否是指定位置结束，第二个参数为查找的结束位置。

```js
console.log('google.com'.endsWith('com')); //true
console.log('google.com'.endsWith('g', 4)); //true
```

下面是查找关键词的示例

```js
const words = ["js", "css"];
const title = "我爱在MDN学习js与css知识";
const status = words.some(word => {
  return title.includes(word);
});
console.log(status);  // true
```

### 替换字符串

`replace` 方法用于字符串的替换操作

```js
let name = "google.com";
web = name.replace("google", "baidu");
console.log(web);  // baidu.com
```

默认只替换一次，如果全局替换需要使用正则

```js
let str = "2023/02/12";
console.log(str.replace(/\//g, "-"));  // 2023-02-12
```

使用字符串替换来生成关键词链接

```js
const word = ["js", "css"];
const string = "我喜欢在MDN学习js与css知识";
const title = word.reduce((pre, word) => {
  return pre.replace(word, `<a href="?w=${word}">${word}</a>`);
}, string);
console.log(title);
// 我喜欢在MDN学习<a href="?w=js">js</a>与<a href="?w=css">css</a>知识
```

使用正则表达式完成替换

```js
let res = "google.com".replace(/g/g, str => {
  return "@";
});
console.log(res);  // @oo@le.com
```

### 重复生成

下例是根据参数重复生成星号

```js
function star(num = 3) {
	return '*'.repeat(num);
}
console.log(star());  // ***
```

下面是模糊后三位电话号码

```js
let phone = "98765432101";
console.log(phone.slice(0, -3) + "*".repeat(3));  // 98765432***
```

### 类型转换

分隔字母

```js
let name = "abc";
console.log(name.split(""));  // ['a', 'b', 'c']
```

将字符串转换为数组

```js
console.log("1,2,3".split(",")); // ['1', '2', '3']
```

**隐式类型转换**会根据类型自动转换类型

```js
let abc = 99 + '';
console.log(typeof abc); //string
```

使用 `String` 构造函数可以显示转换字符串类型

```js
let abc = 99;
console.log(typeof String(abc));  // string
```

js中大部分类型都是对象，可以使用**类方法** `toString`转化为字符串

```js
let abc = 99;
console.log(typeof abc.toString()); //string

let arr = ['abcprop', 'MDN'];
console.log(typeof arr.toString()); //string
```

## Boolean

布尔类型包括 `true` 与 `false` 两个值

### 声明定义

使用对象形式创建布尔类型

```js
console.log(new Boolean(true)); // Boolean {true}
console.log(new Boolean(false)); // Boolean {false}
```

但建议使用字面量创建布尔类型

```js
let bool =true;
```

### 隐式转换 💡

**基本上所有类型都可以隐式转换为Boolean类型**（先转化为数值后进行比较）

| 数据类型  | true             | false            |
| --------- | ---------------- | ---------------- |
| String    | 非空字符串       | 空字符串         |
| Number    | 非0的数值        | 0 、NaN          |
| Array     | 数组不参与比较时 | 参与比较的空数组 |
| Object    | 所有对象         |                  |
| undefined | 无               | undefined        |
| null      | 无               | null             |
| NaN       | 无               | NaN              |

📌 当与boolean类型比较时，会将两边类型统一为数字1或0。

如果使用Boolean与数值比较时，会进行隐式类型转换 true转为1，false 转为0。

```js
console.log(3 == true); // false
console.log(0 == false); // true
```

📌 下面是一个典型的例子，字符串在与Boolean比较时，两边都为转换为数值类型后再进行比较。

```js
console.log(Number("google")); //NaN
console.log(Boolean("google")); //true
console.log("google" == true); //false   (NaN == 1)
console.log("1" == true); //true  (1 == 1)
```

数组的表现与字符串原理一样，会先转换为数值

```js
console.log(Number([])); // 0
console.log(Number([3])); // 3
console.log(Number([1, 2, 3])); // NaN
console.log([] == false); // true  (0 == 0)
console.log([1] == true); // true  (1 == 1)
console.log([1, 2, 3] == true); // false  (NaN == 0)
```

引用类型的Boolean值为真，如对象和数组

```js
if ([]) console.log("true");  // true
if ({}) console.log("true");  // true
```

### 显式转换

使用 `!!` 转换布尔类型

```js
let abc = '';
console.log(!!abc); //false
abc = 0;
console.log(!!abc); //false
abc = null;
console.log(!!abc); //false
abc = new Date("2020-2-22 10:33");
console.log(!!abc); //true
```

使用 `Boolean` 函数可以显式转换为布尔类型

```js
let abc = '';
console.log(Boolean(abc)); //false
abc = 0;
console.log(Boolean(abc)); //false
abc = null;
console.log(Boolean(abc)); //false
abc = new Date("2020-2-22 10:33");
console.log(Boolean(abc)); //true
```

### 实例操作

下面使用Boolean类型判断用户的输入，并给出不同的反馈。

```js
while (true) {
    let n = prompt("请输入MDN成立年份").trim();
    if (!n) continue;  // 进入下一次while
    alert(n == 2010 ? "回答正确" : "答案错误！看看官网了解下");
    break;  // 跳出循环
}
```

## Number

### 声明定义

使用对象方式声明

```js
let abc = new Number(3);
console.log(abc+3); //6
```

Number用于表示整数和浮点数，数字是 `Number`实例化的对象，可以使用对象提供的丰富方法。

```js
let num = 99;
console.log(typeof num);  // number
```

### 基本函数

判断是否为整数

```js
console.log(Number.isInteger(1.2));
```

指定返回的小数位数可以四舍五入

```js
console.log((16.556).toFixed(2)); // 16.56
```

### NaN

表示无效的数值，下例计算将产生NaN结果。

```js
console.log(Number("google")); //NaN
console.log(2 / 'google'); //NaN
```

NaN不能使用 `==` 比较，使用以下代码来判断结果是否正确

```js
var res = 2 / 'google';
if (Number.isNaN(res)) {
	console.log('Error');  // Error
}
```

也可以使用 `Object.is` 方法判断两个值是否完全相同

```js
var res = 2 / 'google';
console.log(Object.is(res, NaN));
```

### 类型转换

**Number**

使用Number函数基本上可以转换所有类型

```js
console.log(Number('google')); //NaN
console.log(Number(true));	//1
console.log(Number(false));	//0
console.log(Number('9'));	//9
console.log(Number([]));	//0
console.log(Number([5]));	//5
console.log(Number([5, 2])); //NaN
console.log(Number({}));	//NaN
```

**parseInt** 💡

提取字符串开始**去除空白后**的数字转为整数。

```js
console.log(parseInt('  99google'));	//99
console.log(parseInt('18.55'));	 // 18
```

**parseFloat**

转换字符串为浮点数，忽略字符串前面空白字符。

```js
console.log(parseFloat('  99google'));	//99
console.log(parseFloat('18.55'));	//18.55
```

比如从表单获取的数字是字符串类型需要类型转换才可以计算，下面**使用乘法进行隐式类型转换**。

```html
<input type="text" name="num" value="66">
<script>
  let num = document.querySelector("[name='num']").value;
  console.log(num + 5); //665

  console.log(num * 1 + 5); //71
</script>
```

### 舍入操作

使用 `toFixed` 可对数值舍入操作，参数指定保存的小数位

```js
console.log(1.556.toFixed(2)); //1.56
```

### 浮点精度

📗 大部分编程语言在浮点数计算时都会有精度误差问题，下面来看JS中的表现形式

```js
let abc = 0.1 + 0.2
console.log(abc)// 结果：0.30000000000000004
```

📌 这是因为计算机以二进制处理数值类型，上面的0.1与0.2转为二进制后是**无穷**的

```js
console.log((0.1).toString(2)) //0.0001100110011001100110011001100110011001100110011001101
console.log((0.2).toString(2)) //0.001100110011001100110011001100110011001100110011001101
```

**处理方式**

一种方式使用toFixed 方法进行小数截取

```js
console.log((0.1 + 0.2).toFixed(2)) //0.3

console.log(1.0 - 0.9) //0.09999999999999998
console.log((1.0 - 0.9).toFixed(2)) //0.10
```

将小数转为整数进行计算后，再转为小数也可以解决精度问题

```js
Number.prototype.add = function (num) {
    //取两个数值中小数位最大的
    let n1 = this.toString().split('.')[1].length
    let n2 = num.toString().split('.')[1].length

    //得到10的N次幂
    let m = Math.pow(10, Math.max(n1, n2))
    return (this * m + num * m) / m
}
console.log((0.1).add(0.2))  // 0.3
```

**推荐做法**

市面上已经存在很多针对数学计算的库 [mathjs (opens new window)](https://mathjs.org/examples/browser/basic_usage.html.html)、[decimal.js (opens new window)](http://mikemcl.github.io/decimal.js)等，我们就不需要自己构建了。下面来演示使用 [decimal.js (opens new window)](http://mikemcl.github.io/decimal.js)进行浮点计算。

```html
<script src="https://cdn.bootcss.com/decimal.js/10.2.0/decimal.min.js"></script>

<script>
	console.log(Decimal.add(0.1, 0.2).valueOf())
</script>
```

## Math

`Math` 对象提供了众多方法用来进行数学计算，下面我们介绍常用的方法，更多方法使用请查看 [MDN官网 (opens new window)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)了解。

### 取极限值

使用 `min` 与 `max` 可以取得最小与最大值。

```js
console.log(Math.min(1, 2, 3));  // 1

console.log(Math.max(1, 2, 3));  // 3
```

使用`apply` 来从数组中取值

```js
console.log(Math.max.apply(Math, [1, 2, 3]));  // 3
console.log(Math.max.apply(null, [1, 2, 3]));  // 3
console.log(Math.max.call(null, ...[1, 2, 3]));  // 3
```

### 舍入处理

取最接近的向上整数

```js
console.log(Math.ceil(1.111)); //2
```

得到最接近的向下整数

```js
console.log(Math.floor(1.555)); //1
```

四舍五入处理

```js
console.log(Math.round(1.5)); //2
```

### random

`random` 方法用于返回 >=0 且 <1 的随机数（包括0但不包括1）。

返回0~5的随机数，不包括5

```js
const number = Math.floor(Math.random() * 5);
console.log(number);
```

返回0~5的随机数，包括5

```js
const number = Math.floor(Math.random() * (5+1));
console.log(number);
```

下面取2~5的随机数（不包括5）公式为：min+Math.floor(Math.random()*(Max-min))

```js
const number = Math.floor(Math.random() * (5 - 2)) + 2;
console.log(number);
```

下面取2~5的随机数（包括5）公式为：min+Math.floor(Math.random()*(Max-min+1))

```js
const number = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
console.log(number);
```

下面是随机点名的示例

```js
let stus = ['小明', '张三', '王五', '爱情'];  // 0-3 包括3
let pos = Math.floor(Math.random() * stus.length);
console.log(stus[pos]);
```

随机取第二到第三间的学生，即1~2的值

```js
let stus = ['小明', '张三', '王五', '爱情'];
let pos = Math.floor(Math.random() * (3-1)) + 1;
console.log(stus[pos]);
```

## Date

网站中处理日期时间是很常用的功能，通过 `Date` 类型提供的丰富功能可以非常方便的操作。

### 声明日期

获取当前日期时间

```js
let now = new Date();
console.log(now);  // Mon Sep 13 2021 21:09:20 GMT+0800 (中国标准时间)
console.log(typeof new Date()); //object
console.log(now * 1); //获取时间戳 1631538560135

//直接使用函数获取当前时间
console.log(Date());  // Mon Sep 13 2021 21:10:59 GMT+0800 (中国标准时间)
console.log(typeof Date()); // string 作为函数的返回值是一个string

//获取当前时间戳单位毫秒
console.log(Date.now());  // 1631538700238
```

计算脚本执行时间

```js
const start = Date.now();
for (let i = 0; i < 20000000; i++) {}
const end = Date.now();
console.log(end - start);  // 12
```

当然也可以使用控制台测试

```js
console.time("testFor");
for (let i = 0; i < 20000000; i++) {}
console.timeEnd("testFor");  // testFor: 11.673095703125 ms
```

根据指定的日期与时间定义日期对象

```js
let now = new Date('2028-02-22 03:25:02');
console.log(now);
// Tue Feb 22 2028 03:25:02 GMT+0800 (中国标准时间)

now = new Date(2028, 4, 5, 1, 22, 16);
console.log(now);
// Fri May 05 2028 01:22:16 GMT+0800 (中国标准时间)
```

使用展示运算符处理更方便

```js
let info = [2020, 2, 20, 10, 15, 32];
let date = new Date(...info);
```

### 类型转换 💡

📌 将日期转为数值类型就是转为时间戳单位是毫秒

📌 `Date`类型提供的静态方法`now()`和实例方法`getTime()`都能获取到时间戳。

```js
let abc = new Date("2020-2-22 10:33:12");
console.log(abc * 1);  // 1582338792000

console.log(Number(abc));  // 1582338792000

console.log(abc.valueOf())  // 1582338792000

console.log(date.getTime());  // 1582338792000

console.log(Date.now());  // 1582338792000
```

有时后台提供的日期为时间戳格式，下面是将时间戳转换为标准日期的方法

```js
const param = [1990, 2, 22, 13, 22, 19];
const date = new Date(...param);
const timestamp = date.getTime();
console.log(timestamp);  // 638083339000
console.log(new Date(timestamp));
// Thu Mar 22 1990 13:22:19 GMT+0800 (中国标准时间)
```

### 对象方法 💡

格式化输出日期

```js
let time = new Date();
console.log(
  `${time.getFullYear()}-${time.getMonth()}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
);  // 2021-8-13 21:22:31
```

封装函数用于复用

```js
function dateFormat(date, format = "YYYY-MM-DD HH:mm:ss") {
  const config = {
    YYYY: date.getFullYear(),
    MM: date.getMonth() + 1,
    DD: date.getDate(),
    HH: date.getHours(),
    mm: date.getMinutes(),
    ss: date.getSeconds()
  };
  for (const key in config) {
    format = format.replace(key, config[key]);
  }
  return format;
}
console.log(dateFormat(new Date(), "YYYY年MM月DD日"));  // 2021年9月13日
```

下面是系统提供的日期时间方法，更多方法请查看 [MDN官网(opens new window)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date)

| 方法                 | 描述                                                   |
| :------------------- | :----------------------------------------------------- |
| Date()               | 返回当日的日期和时间。                                 |
| getDate()            | 从 Date 对象返回一个月中的某一天 (1 ~ 31)。            |
| getDay()             | 从 Date 对象返回一周中的某一天 (0 ~ 6)。               |
| getMonth()           | 从 Date 对象返回月份 (0 ~ 11)。                        |
| getFullYear()        | 从 Date 对象以四位数字返回年份。                       |
| getYear()            | 请使用 getFullYear() 方法代替。                        |
| getHours()           | 返回 Date 对象的小时 (0 ~ 23)。                        |
| getMinutes()         | 返回 Date 对象的分钟 (0 ~ 59)。                        |
| getSeconds()         | 返回 Date 对象的秒数 (0 ~ 59)。                        |
| getMilliseconds()    | 返回 Date 对象的毫秒(0 ~ 999)。                        |
| getTime()            | 返回 1970 年 1 月 1 日至今的毫秒数。                   |
| getTimezoneOffset()  | 返回本地时间与格林威治标准时间 (GMT) 的分钟差。        |
| getUTCDate()         | 根据世界时从 Date 对象返回月中的一天 (1 ~ 31)。        |
| getUTCDay()          | 根据世界时从 Date 对象返回周中的一天 (0 ~ 6)。         |
| getUTCMonth()        | 根据世界时从 Date 对象返回月份 (0 ~ 11)。              |
| getUTCFullYear()     | 根据世界时从 Date 对象返回四位数的年份。               |
| getUTCHours()        | 根据世界时返回 Date 对象的小时 (0 ~ 23)。              |
| getUTCMinutes()      | 根据世界时返回 Date 对象的分钟 (0 ~ 59)。              |
| getUTCSeconds()      | 根据世界时返回 Date 对象的秒钟 (0 ~ 59)。              |
| getUTCMilliseconds() | 根据世界时返回 Date 对象的毫秒(0 ~ 999)。              |
| parse()              | 返回1970年1月1日午夜到指定日期（字符串）的毫秒数。     |
| setDate()            | 设置 Date 对象中月的某一天 (1 ~ 31)。                  |
| setMonth()           | 设置 Date 对象中月份 (0 ~ 11)。                        |
| setFullYear()        | 设置 Date 对象中的年份（四位数字）。                   |
| setYear()            | 请使用 setFullYear() 方法代替。                        |
| setHours()           | 设置 Date 对象中的小时 (0 ~ 23)。                      |
| setMinutes()         | 设置 Date 对象中的分钟 (0 ~ 59)。                      |
| setSeconds()         | 设置 Date 对象中的秒钟 (0 ~ 59)。                      |
| setMilliseconds()    | 设置 Date 对象中的毫秒 (0 ~ 999)。                     |
| setTime()            | 以毫秒设置 Date 对象。                                 |
| setUTCDate()         | 根据世界时设置 Date 对象中月份的一天 (1 ~ 31)。        |
| setUTCMonth()        | 根据世界时设置 Date 对象中的月份 (0 ~ 11)。            |
| setUTCFullYear()     | 根据世界时设置 Date 对象中的年份（四位数字）。         |
| setUTCHours()        | 根据世界时设置 Date 对象中的小时 (0 ~ 23)。            |
| setUTCMinutes()      | 根据世界时设置 Date 对象中的分钟 (0 ~ 59)。            |
| setUTCSeconds()      | 根据世界时设置 Date 对象中的秒钟 (0 ~ 59)。            |
| setUTCMilliseconds() | 根据世界时设置 Date 对象中的毫秒 (0 ~ 999)。           |
| toSource()           | 返回该对象的源代码。                                   |
| toString()           | 把 Date 对象转换为字符串。                             |
| toTimeString()       | 把 Date 对象的时间部分转换为字符串。                   |
| toDateString()       | 把 Date 对象的日期部分转换为字符串。                   |
| toGMTString()        | 请使用 toUTCString() 方法代替。                        |
| toUTCString()        | 根据世界时，把 Date 对象转换为字符串。                 |
| toLocaleString()     | 根据本地时间格式，把 Date 对象转换为字符串。           |
| toLocaleTimeString() | 根据本地时间格式，把 Date 对象的时间部分转换为字符串。 |
| toLocaleDateString() | 根据本地时间格式，把 Date 对象的日期部分转换为字符串。 |
| UTC()                | 根据世界时返回 1970 年 1 月 1 日 到指定日期的毫秒数。  |
| valueOf()            | 返回 Date 对象的原始值。                               |

### moment.js

Moment.js是一个轻量级的JavaScript时间库，它方便了日常开发中对时间的操作，提高了开发效率。

更多使用方法请访问中文官网 [http://momentjs.cn (opens new window)](http://momentjs.cn/)或 英文官网 [https://momentjs.com(opens new window)](https://momentjs.com/)

```js
<script src="https://cdn.bootcss.com/moment.js/2.24.0/moment.min.js"></script>
```

获取当前时间

```js
console.log(moment().format("YYYY-MM-DD HH:mm:ss"));
```

设置时间

```js
console.log(moment("2020-02-18 09:22:15").format("YYYY-MM-DD HH:mm:ss"));
```

十天后的日期

```js
console.log(moment().add(10, "days").format("YYYY-MM-DD hh:mm:ss"));
```

