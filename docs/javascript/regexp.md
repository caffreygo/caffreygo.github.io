

# 正则表达式

## 基础知识

::: tip 正则表达式（Regular expression）是用于匹配字符串中字符组合的模式。

- 正则表达式是在宿主环境下运行的，如`js/php/node.js` 等
- 在 JavaScript中，正则表达式也是对象

:::

### 对比分析

与普通函数操作字符串来比较，正则表达式可以写出更简洁、功能强大的代码。

下面使用获取字符串中的所有数字来比较函数与正则的差异。

```js
let str = "jerrychen2200hello9988";
let nums = [...str].filter(a => !Number.isNaN(parseInt(a))); // 过滤出数字数组
console.log(nums.join(""));  // 22009988
```

使用正则表达式将简单得多

```js
let str = "jerrychen2200hello9988";
console.log(str.match(/\d/g).join("")); // 22009988
```

### 创建正则

📗 JS提供字面量与对象两种方式创建正则表达式

#### 字面量创建

使用`//`包裹的字面量创建方式是推荐的作法，但它不能在其中使用变量

```js
let site = "caffreygo.com";
console.log(/f/.test(site)); // 是否含有f字母：true
```

下面尝试使用 `a` 变量时将不可以查询

```js
let site = "caffreygo.com";
let b = "f";
console.log(/b/.test(str)); // false
```

📌 虽然可以使用 `eval` 转换为js语法来实现将变量解析到正则中，但是比较麻烦

 💡 所以有变量时建议使用下面的对象创建方式

```js
let str = "caffreygo.com";
let a = "u";
console.log(eval(`/${a}/`).test(str)); //true
```

#### 对象创建

当正则需要动态创建时使用对象方法

正则拥有`test`方法测试字符串参数是否匹配

```js
let site = "caffreygo.com";
let name = "caffreygo";
let reg = new RegExp(name); // 接收一个字符串参数
console.log(reg.test(site)); // true
```

💡 根据用户输入高亮显示内容，支持用户输入正则表达式

```html
<body>
  <div id="content">caffreygo.com</div>
</body>
<script>
  const content = prompt("请输入要搜索的内容，支持正则表达式");
  const reg = new RegExp(content, "g");
  let body = document
    .querySelector("#content")
    .innerHTML.replace(reg, str => {
      return `<span style="color:red">${str}</span>`;
    });
  document.body.innerHTML = body;
</script>
```

通过对象创建正则提取标签

```html
<body>
  <h1>caffreygo.com</h1>
  <h1>strcms.com</h1>
</body>

<script>
function element(tag) {
  const html = document.body.innerHTML;
  // <(h1)>.+</\1>   \是字符串的转义字符，在字符串当中，可先打印出字符串看看结果
  let reg = new RegExp("<(" + tag + ")>.+</\\1>", "g");
  return html.match(reg);
}
console.table(element("h1"));
```

### 选择符 |

`|` 这个符号带表**选择修释符**，也就是 `|` 左右两侧有一个匹配到就可以。

📗 **原子组**就是正则表达式中的小括号`()`及所包括的内容

检测电话是否是上海或北京的坐机：

```js
let tel = "010-12345678";

// 错误结果：只匹配 | 左右两边任一结果  
console.log(tel.match(/010|020\-\d{7,8}/));
// ["010", index: 0, input: "010-12345678", groups: undefined]

// 正确结果：所以需要放在原子组中使用   \-转义-   \d{7,8}七到八数字
console.log(tel.match(/(010|020)\-\d{7,8}/));
// ["010-12345678", "010", index: 0, input: "010-12345678", groups: undefined]
```

匹配字符是否包含`world` 或 `hello`

```js
const str = "hiworld";
// 匹配到world或者hello即可
console.log(/world|hello/.test(str)); //true
```

### 字符转义

📗 转义用于改变字符的含义，用来对某个字符有多种语义时的处理。

假如有这样的场景，如果我们想通过正则查找`/`符号，但是 `/`在正则中有特殊的意义。如果写成`///`这会造成解析错误，所以要使用转义语法 `/\/\`来匹配。

```js
const url = "https://www.caffreygo.com";
console.log(/https:\/\//.test(url)); //true
```

📌 使用 `RegExp` 构建正则时在转义上会有些区别，下面是对象与字面量定义正则时区别

```js
let price = 12.23;
//含义1: . 除换行外任何字符 	含义2: .普通点
//含义1: d 字母d   		    含义2: \d 数字 0~9
console.log(/\d+\.\d+/.test(price)); //   \d+匹配多个数字   \.匹配点

//字符串中 \d 与 d 是一样的，所以在 new RegExp 时\d 即为 d
console.log("\d" == "d");

//使用对象定义正则时，可以先把字符串打印一样，结果是字面量一样的定义就对了
console.log("\\d+\\.\\d+");   // \d+\.\d+
let reg = new RegExp("\\d+\\.\\d+");
console.log(reg.test(price));
```

下面是网址检测中转义符使用

```js
let url = "https://www.caffreygo.com";
console.log(/https?:\/\/\w+\.\w+\.\w+/.test(url));
```

### 字符边界

📗 使用字符边界符用于控制匹配内容的开始与结束约定。

| 边界符 | 说明                         |
| ------ | ---------------------------- |
| ^      | 匹配字符串的开始             |
| $      | 匹配字符串的结束，忽略换行符 |

匹配内容必须以`www`开始

```js
const str = "www.caffreygo.com";
console.log(/^www/.test(str)); //true
```

匹配内容必须以`.com`结束

```js
const str = "www.caffreygo.com";
console.log(/\.com$/.test(str)); //true
```

检测用户名长度为3~6位，且只能为字母。如果不使用 `^与$` 限制将得不到正确结果

```html
<body>
  <input type="text" name="username" />
</body>

<script>
  document
    .querySelector(`[name="username"]`)
    .addEventListener("keyup", function() {
      let res = this.value.match(/^[a-z]{3,6}$/i);
      console.log(res);
      console.log(res ? "正确" : "失败");
    });
</script>
```

## 元子字符 📗

📗 元字符是正则表达式中的**最小元素**，只代表单一（一个）字符

### 字符列表

| 元字符 | 说明                                                 | 示例          |
| ------ | ---------------------------------------------------- | ------------- |
| \d     | 匹配任意一个数字                                     | [0-9]         |
| \D     | 与除了数字以外的任何一个字符匹配                     | [^0-9]        |
| \w     | 与任意一个英文字母,数字或下划线匹配                  | [a-zA-Z_]     |
| \W     | 除了字母,数字或下划线外与任何字符匹配                | [^a-zA-Z_]    |
| \s     | 任意一个空白字符匹配，如空格，制表符`\t`，换行符`\n` | [\n\f\r\t\v]  |
| \S     | 除了空白符外任意一个字符匹配                         | [^\n\f\r\t\v] |
| .      | 匹配除换行符外的任意字符                             |               |

### 使用体验

匹配任意数字`string.match(regexp)`

```js
let str = "hellowrold 2010";
console.log(str.match(/\d/g)); //["2", "0", "1", "0"]
```

匹配所有电话号码

```js
let str = "张三:010-99999999,李四:020-88888888";

let res = str.match(/\d{3}-\d{7,8}/g);
console.log(res);   // ["010-99999999", "020-88888888"]
```

获取所有用户名

```js
let str = "张三:010-99999999,李四:020-88888888";
let res = str.match(/[^:\d-,]+/g); 
// [^:\d-,]表示匹配除了 : 数字 - , 这些字符之外的部分

console.log(res);   // ['张三', '李四']
```

匹配任意非数字

```js
console.log(/\D/.test(2029)); // false
```

匹配字母数字下划线

```js
let str = "hello@";
console.log(str.match(/\w/g)); // ["h", "e", "l", "l", "o"]
```

匹配除了字母,数字或下划线外与任何字符匹配

```js
console.log(/\W/.test("@")); //true
```

匹配与任意一个空白字符匹配

```js
console.log(/\s/.test(" ")); //true
console.log(/\s/.test("\n")); //true
```

匹配除了空白符外任意一个字符匹配

```js
let str = "hi123 @";
console.log(str.match(/\S/g)); // ["h", "i", "1", "2", "3", "@"]
```

如果要匹配点则需要转义

```js
let str = `caffreygo@com`;
console.log(/caffreygo.com/i.test(str));  // true
console.log(/caffreygo\.com/i.test(str)); // false
```

📗 `.`匹配除换行符外任意字符了，下面匹配不到`test.com` 因为有换行符

```js
const url = `https://www.caffreygo.com
  test.com
`;
console.log(url.match(/.+/));
// ["  https://www.caffreygo.com", index: 1, input: "\n  https://www.caffreygo.com\n  test.com\n", groups: undefined]
```

📗 使用`/s`视为单行模式（忽略换行）时，`.` 可以匹配所有

```js
let str = `
  <span>
    hello
    jerry
  </span>
`;
// .* 匹配 0个或多个 除换行符之外 的字符
let res = str.match(/<span>.*<\/span>/s);
console.log(res[0]); 
```

正则中空格会按普通字符对待

```js
let tel = `010 - 999999`;
console.log(/\d+-\d+/.test(tel)); // false
console.log(/\d+ - \d+/.test(tel)); // true
```

### 所有字符

可以使用 `[\s\S]` 或 `[\d\D]` 来匹配所有字符

```js
let str = `
  <span>
    houdunren
    strcms
  </span>
`;
let res = str.match(/<span>[\s\S]+<\/span>/);
console.log(res[0]);
```

## 模式修饰

正则表达式在执行时会按他们的默认执行方式进行，但有时候默认的处理方式总不能满足我们的需求，所以可以使用模式修正符更改默认方式。

| 修饰符 | 说明                                                         |
| ------ | ------------------------------------------------------------ |
| i      | 不区分大小写字母的匹配                                       |
| g      | 全局搜索所有匹配内容                                         |
| m      | 视为多行 （多行搜索）                                        |
| s      | 视为单行忽略换行符，使用`.` 可以匹配所有字符 /.*/s  （允许 `.` 匹配换行符。） |
| y      | 从 `regexp.lastIndex` 开始匹配  （执行“粘性(`sticky`)”搜索,匹配从目标字符串的当前位置开始） |
| u      | 正确处理四个字符的 UTF-16 编码  （使用unicode码的模式进行匹配） |

### i

将所有`caffreygo.com` 统一为小写（忽略大小写）

```js
let abc = "caffreygo.com CAFFREYGO.COM";
abc = abc.replace(/caffreygo\.com/gi, "website");
console.log(abc);  // website website
```

### g

使用 `g` 修饰符可以全局操作内容

```js
let abc = "abcuabcu";
abc = abc.replace(/u/, "@");
console.log(abc); // abc@abcu   没有使用 g 修饰符是，只替换了第一个

let abc = "abcuabcu";
abc = abc.replace(/u/g, "@");
console.log(abc); // abc@abc@   使用全局修饰符后替换了全部的 u
```

### m

用于将内容视为多行匹配，主要是对 `^`和 `$` 的修饰

将下面是将以 `#数字`开始的课程解析为对象结构，学习过后面讲到的原子组可以让代码简单些

```js
let abc = `
  #1 js,200元 #
  #2 php,300元 #
  #9 css # hello
  #3 node.js,180元 #
`;
// [{name:'js',price:'200元'}]
let lessons = abc.match(/^\s*#\d+\s+.+\s+#$/gm).map(v => {
  // 分组，将不必要字符清除
  v = v.replace(/\s*#\d+\s*/, "").replace(/\s+#/, "");
  [name, price] = v.split(",");
  return { name, price };
});
console.log(JSON.stringify(lessons, null, 2));
```

### u ❓

📗 每个字符都有属性，如`L`属性表示是字母，`P` 表示标点符号，需要结合 `u` 模式才有效。

其他属性简写可以访问 [属性的别名 (opens new window)](https://www.unicode.org/Public/UCD/latest/ucd/PropertyValueAliases.txt)网站查看。

```js
//使用\p{L}属性匹配字母
let abc = "abc大家好！哈哈。";
console.log(abc.match(/\p{L}+/gu));  // ['abc大家好', '哈哈']

//使用\p{P}属性匹配标点
console.log(abc.match(/\p{P}+/gu));  // ['！', '。']
```

字符也有unicode文字系统属性 `Script=文字系统`，下面是使用 `\p{sc=Han}` 获取中文字符 `han`为中文系统，其他语言请查看 [文字语言表(opens new window)](http://www.unicode.org/standard/supported.html)

```js
let abc = `
张三:010-99999999,李四:020-88888888`;
let res = abc.match(/\p{sc=Han}+/gu);
console.log(res);  // ['张三', '李四']
```

使用 `u` 模式可以正确处理四个字符的 UTF-16 字节编码

```js
let str = "𝒳𝒴";
console.table(str.match(/[𝒳𝒴]/)); //结果为乱字符"�"

console.table(str.match(/[𝒳𝒴]/u)); //结果正确 "𝒳"
```

### lastIndex

::: tip RegExp对象`lastIndex` 属性可以返回或者设置正则表达式开始匹配的位置

- 必须结合 `g` 修饰符使用
- 对 `exec` 方法有效
- 匹配完成时，`lastIndex` 会被重置为0

::: 

```js
let abc = `测试器不断分享视频教程，测试器网址是 google.com`;
let reg = /测试器(.{2})/g;
reg.lastIndex = 10; //从索引10开始搜索
console.log(reg.exec(abc));  // ['后盾人网址', '网址', index: 12...]
console.log(reg.lastIndex);  // 17

reg = /\p{sc=Han}/gu;   // 打印出所有汉字 g
while ((res = reg.exec(abc))) {
  console.log(res[0]);
}
```

### y

我们来对比使用 `y` 与`g` 模式，使用 `g` 模式会一直匹配字符串

```js
let abc = "udunren";
let reg = /u/g;
console.log(reg.exec(abc)); // ['u', index: 0, input: 'udunren', groups: undefined]
console.log(reg.lastIndex); // 1
console.log(reg.exec(abc)); // ['u', index: 2, input: 'udunren', groups: undefined]
console.log(reg.lastIndex); // 3
console.log(reg.exec(abc)); // null
console.log(reg.lastIndex); // 0
```

📌 使用`y` 模式后如果从 `lastIndex` 开始匹配不成功就**不继续匹配**了

```js
let abc = "udunren";
let reg = /u/y;
console.log(reg.exec(abc)); // ['u', index: 0, input: 'udunren', groups: undefined]
console.log(reg.lastIndex); // 1
console.log(reg.exec(abc)); // null
console.log(reg.lastIndex); // 0
```

因为使用 `y` 模式可以在匹配不到时停止匹配，在匹配下面字符中的qq时可以提高匹配效率

```js
let abc = `我们的QQ群:11111111,999999999,88888888
我们的网址是 google.com 123`;

let reg = /(\d+),?/y;
reg.lastIndex = 7;
while ((res = reg.exec(abc))) console.log(res[1]);  // 11111111 999999999 88888888
```

## 原子表

📗 在一组字符中匹配某个元字符，在正则表达式中通过元字符表来完成，就是放到`[]` (方括号)中。(单个字符)

### 使用语法

| 原子表 | 说明                               |
| ------ | ---------------------------------- |
| []     | 只匹配其中的一个原子               |
| [^]    | 只匹配"除了"其中字符的任意一个原子 |
| [0-9]  | 匹配0-9任何一个数字                |
| [a-z]  | 匹配小写a-z任何一个字母            |
| [A-Z]  | 匹配大写A-Z任何一个字母            |

### 实例操作

使用`[]`匹配其中任意字符即成功，下例中匹配`ue`任何一个字符，而不会当成一个整体来对待

```js
const url = "uande";
console.log(/ue/.test(url)); // false  匹配ue全部
console.log(/[ue]/.test(url)); // true  匹配字母u或者字母e
```

日期的匹配

```js
let tel = "2022-02-23";
// 四位数字 分隔符-或者/ 两位数组  与原子表1相同 两位数字
console.log(tel.match(/\d{4}([-\/])\d{2}\1\d{2}/));
```

获取`0~3`间的任意数字

```js
const num = "2";
console.log(/[0-3]/.test(num)); // true
```

匹配`a~f`间的任意字符

```js
const abc = "e";
console.log(/[a-f]/.test(abc)); //true
```

📌 顺序为**升序**否则将报错

```js
const num = "2";
console.log(/[3-0]/.test(num)); // SyntaxError
```

字母也要升序否则也报错

```js
const abc = "stringarea";
console.log(/[f-a]/.test(abc)); // SyntaxError
```

获取所有用户名

```js
let str = `
	张三:010-99999999,李四:020-88888888`;
let res = str.match(/[^:\d\s-,]+/g);  // 过滤 ：数字 换行符 - ，
console.log(res);   // ['张三', '李四']
```

📌 原子表中有些正则字符不需要转义，如果转义也是没问题的，可以理解为在原子表中`.` 就是小数点

```js
let str = "(caffreygo.com)+";
console.log(str.match(/[().+]/g));  // ['(', '.', ')', '+']

//使用转义也没有问题
console.log(str.match(/[\(\)\.\+]/g));  // '(', '.', ')', '+']
```

📌  可以使用 `[\s\S]` 或 `[\d\D]`匹配到**所有字符**包括换行符

```js
...
const reg = /[\s\S]+/g;
...
```

下面是使用原子表知识删除所有标题

```html
<body>
  <p>正则</p>
  <h1>blog.caffreygo.com</h1>
  <h2>google.com</h2>
</body>
<script>
  const body = document.body;
  const reg = /<(h[1-6])>[\s\S]*<\/\1>*/g;
  let content = body.innerHTML.replace(reg, "");
  document.body.innerHTML = content;
</script>
```

## 原子组

::: tip 原子组

- 如果一次要匹配多个元子，可以通过元子组完成
- 原子组与原子表的差别在于原子组一次匹配多个元子，而原子表则是匹配任意一个字符
- 元字符组用 `()` 包裹

::: 

下面使用原子组匹配 `h1` 标签，如果想匹配 `h2` 只需要把前面原子组改为 `h2` 即可。

```js
const str = `<h1>google</h1>`;
console.log(/<(h1)>.+<\/\1>/.test(str)); // true
```

### 基本使用

没有添加 `g` 模式修正符时只匹配到第一个，匹配到的信息包含以下数据

| 变量    | 说明             |
| ------- | ---------------- |
| 0       | 匹配到的完整内容 |
| 1,2.... | 匹配到的原子组   |
| index   | 原字符串中的位置 |
| input   | 原字符串         |
| groups  | 命名分组         |

在`match`中使用原子组匹配，会将每个组数据返回到结果中

```js
let str = "google.com";
console.log(str.match(/goo(gle)\.(com)/)); 
// ['google.com', 'gle', 'com', index: 0, input: 'google.com', groups: undefined]
```

下面使用原子组匹配**标题**元素

```js
let abc = `
  <h1>google</h1>
  <span>正则</span>
  <h2>MDN</h2>
`;

abc.match(/<(h[1-6])[\s\S]*<\/\1>/g);
//  ['<h1>google</h1>', '<h2>MDN</h2>']
```

检测 `0~100` 的数值，使用 `parseInt` 将数值转为10进制

```js
console.log(/^(\d{1,2}|100)$/.test(parseInt(09, 10)));
```

### 邮箱匹配

下面使用原子组匹配邮箱

```js
let str = "1106894094@qq.com";
let reg = /^[\w\-]+@[\w\-]+\.(com|org|cn|cc|net)$/i;   // \w 数字字母下划线
console.dir(str.match(reg));   // ["1106894094@qq.com", "com"]
```

如果邮箱是以下格式 `test@abc.com.cn` 上面规则将无效，需要定义以下方式

```js
let abc = `test@abc.com.cn`;
let reg = /^[\w-]+@([\w-]+\.)+(org|com|cc|cn)$/;   // ([\w-]+\.)+
console.log(abc.match(reg));
// ['test@abc.com.cn', 'com.', 'cn', index: 0]
```

### 引用分组

📗 `\n` 在匹配时引用原子组， `$n` 指在替换时使用匹配的组数据。

下面将标题标签替换为`p`标签：

```js
let abc = `
  <h1>google</h1>
  <span>正则</span>
  <h2>MDN</h2>
`;

let reg = /<(h[1-6])>([\s\S]*)<\/\1>/gi;
// $1是标签名 $2是标签内容，在replace第二个参数中可以使用这些变量
console.log(abc.replace(reg, `<p>$2</p>`));
```

📌 如果只希望组参与匹配，便不希望返回到结果中使用 `(?:` 处理。下面是获取所有域名的示例

```js
let abc = `
  <h1>https://google.com</h1>
  <span>正则</span>
  <h2>MDN.com</h2>
`;

let reg = /https?:\/\/((?:\w+\.)?\w+\.(?:com|org|cn))/gi;
while ((v = reg.exec(abc))) {
  console.dir(v);   // ["https://google.com", "google.com", ...]
}
```

### 分组别名 

📗 如果希望返回的组数据更清晰，可以为原子组编号，结果将保存在返回的 `groups`字段中

```js
let abc = "<h1>google.com</h1>";
console.dir(abc.match(/<(?<tag>h[1-6])[\s\S]*<\/\1>/));
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/javascript/regexp/1.png)

---

📌 组别名使用 `?<>` 形式定义，下面将标签替换为`p`标签（通过`?<groupName>`设置，在replace中通过`$<groupName>`获取）

```js
let abc = `
  <h1>google</h1>
  <span>正则</span>
  <h2>MDN</h2>
`;

let reg = /<(?<tag>h[1-6])>(?<con>[\s\S]*)<\/\1>/gi;
console.log(abc.replace(reg, `<p>$<con></p>`));
```

```text

  <p>google</p>
  <span>正则</span>
  <p>MDN</p>
```

获取链接与网站名称组成数组集合

```html
<body>
    <a href="https://www.google.com">Google</a>
    <a href="https://www.baidu.com">百度</a>
    <a href="https://www.sina.com.cn">新浪</a>
</body>

<script>
    let body = document.body.innerHTML;
    // a标签 空格 除了换行的字符(其他属性等等) link组 字符 title组
    let reg = /<a\s*.+?(?<link>https?:\/\/(\w+\.)+(com|org|cc|cn)).*>(?<title>.+)<\/a>/gi;
    const links = [];
    for (const iterator of body.matchAll(reg)) {
        links.push(iterator["groups"]);
    }
    console.log(links);
</script>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/javascript/regexp/2.jpg)

## 重复匹配

### 基本使用

如果要重复匹配一些内容时我们要使用重复匹配修饰符，包括以下几种。

| 符号  | 说明             |
| ----- | ---------------- |
| *     | 重复零次或更多次 |
| +     | 重复一次或更多次 |
| ?     | 重复零次或一次   |
| {n}   | 重复n次          |
| {n,}  | 重复n次或更多次  |
| {n,m} | 重复n到m次       |

> 因为正则最小单位是元字符，而我们很少只匹配一个元字符如a、b所以基本上重复匹配在每条正则语句中都是必用到的内容。

默认情况下重复选项对**单个字符**进行重复匹配，即不是贪婪匹配

```js
"abcddd".match(/abc+/i);
// ['abc', index: 0, input: 'abcddd', groups: undefined]

"abccccd".match(/abc+/i);
// ['abcccc', index: 0, input: 'abccccd', groups: undefined]
```

使用原子组后则对整个组重复匹配

```js
"abcddd".match(/(abc)+/i);
// ['abc', 'abc', index: 0, input: 'abcddd', groups: undefined]
```

下面是验证坐机号的正则

```js
let abc = "010-12345678";
/0\d{2,3}-\d{7,8}/.exec(abc);
// ['010-12345678', index: 0, ...]
```

验证用户名只能为3~8位的字母或数字，并以字母开始

```html
<body>
  <input type="text" name="username" />
</body>
<script>
  let input = document.querySelector(`[name="username"]`);
  input.addEventListener("keyup", e => {
    const value = e.target.value;
    let state = /^[a-z][\w]{2,7}$/i.test(value);
    console.log(
      state ? "正确！" : "用户名只能为3~8位的字母或数字，并以字母开始"
    );
  });
</script>
```

验证密码必须包含大写字母并在5~10位之间（💡💡通过数组`every`方法匹配多个正则💡）

```html
<body>
<input type="text" name="password" />
</body>

<script>
let input = document.querySelector(`[name="password"]`);
input.addEventListener("keyup", e => {
  const value = e.target.value.trim();
  const regs = [/^[a-zA-Z0-9]{5,10}$/, /[A-Z]/];
  let state = regs.every(v => v.test(value));
  console.log(state ? "正确！" : "密码必须包含大写字母并在5~10位之间");
});
</script>
```

### 禁止贪婪

📗 正则表达式在进行重复匹配时，默认是贪婪匹配模式，也就是说会尽量匹配更多内容，但是有的时候我们并不希望他匹配更多内容，这时可以通过`?`进行修饰来禁止重复匹配

| 使用   | 说明                            |
| ------ | ------------------------------- |
| *?     | 重复任意次，但尽可能少重复      |
| +?     | 重复1次或更多次，但尽可能少重复 |
| ??     | 重复0次或1次，但尽可能少重复    |
| {n,m}? | 重复n到m次，但尽可能少重复      |
| {n,}?  | 重复n次以上，但尽可能少重复     |

下面是禁止贪婪的语法例子

```js
let str = "aaa";
console.log(str.match(/a+/)); //aaa
console.log(str.match(/a+?/)); //a
console.log(str.match(/a{2,3}?/)); //aa
console.log(str.match(/a{2,}?/)); //aa
```

将所有span更换为`h4` 并描红，并在内容前加上 `website-`

```html
<body>
  <main>
    <span>google.com</span>
    <span>baidu.com</span>
    <span>getemoji.com</span>
  </main>
</body>

<script>
  const main = document.querySelector("main");
  const reg = /<span>([\s\S]+?)<\/span>/gi;
  main.innerHTML = main.innerHTML.replace(reg, (v, p1) => {
    console.log(p1);
    return `<h4 style="color:red">website-${p1}</h4>`;
  });
</script>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/javascript/regexp/3.jpg)

---

下面是使用禁止贪婪查找页面中的标题元素

```html
<body>
  <h1>
    google.com
  </h1>
  <h2>emoji.com</h2>
  <h3></H3>
  <H1></H1>
</body>

<script>
  let body = document.body.innerHTML;
  let reg = /<(h[1-6])>[\s\S]*?<\/\1>/gi;
  console.table(body.match(reg));
</script>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/javascript/regexp/4.jpg)

---

## 全局匹配

### 问题分析

下面是使用`match` 全局获取页面中标签内容，但并不会返回匹配细节

```js
<body>
  <h1>google</h1>
  <h2>getemoji.com</h2>
  <h1>Jerry</h1>
</body>

<script>
  function elem(tag) {
    // 构造函数的第二个参数为匹配模式
    const reg = new RegExp("<(" + tag + ")>.+?<\.\\1>", "g");
    return document.body.innerHTML.match(reg);
  }
  console.table(elem("h1"));
</script>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/javascript/regexp/5.jpg)

---

### matchAll 💡

在新浏览器中支持使用 `matchAll` 操作，并返回迭代对象

> 需要添加 `g` 修饰符

```js
let str = "caffrey";
let reg = /[a-z]/ig;
for (const iterator of str.matchAll(reg)) {
  console.log(iterator);
}
```

```text
['c', index: 0, input: 'caffrey', groups: undefined]
['a', index: 1, input: 'caffrey', groups: undefined]
['f', index: 2, input: 'caffrey', groups: undefined]
['f', index: 3, input: 'caffrey', groups: undefined]
['r', index: 4, input: 'caffrey', groups: undefined]
['e', index: 5, input: 'caffrey', groups: undefined]
['y', index: 6, input: 'caffrey', groups: undefined]
```

💡 在原型定义 `matchAll`方法，用于在旧浏览器中工作，不需要添加`g` 模式运行

```js
String.prototype.matchAll = function(reg) {
  let res = this.match(reg);
  if (res) {
    // 将匹配到的字符全都替换成^,下次就不会再匹配到
    let str = this.replace(res[0], "^".repeat(res[0].length));
    let match = str.matchAll(reg) || [];
    return [res, ...match];
  }
};
let str = "jerry";
console.dir(str.matchAll(/(\w)/i));
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/javascript/regexp/6.jpg)

---

### exec 💡

使用 `g` 模式修正符并结合 `exec` 循环操作可以获取结果和匹配细节

```js
<body>
  <h1>google</h1>
  <h2>getemoji.com</h2>
  <h1>Jerry</h1>
</body>

<script>
  function search(string, reg) {
    const matchs = [];
    while ((data = reg.exec( string))) {
      matchs.push(data);
    }
    return matchs;
  }
  search(document.body.innerHTML, /<(h[1-6])>[\s\S]+?<\/\1>/gi);
</script>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/javascript/regexp/7.jpg)

---

使用上面定义的函数来检索字符串中的网址

```js
let abc = `https://abccms.com  
https://www.sina.com.cn
https://www.houdunren.com`;

let res = search(abc, /https?:\/\/(\w+\.)?(\w+\.)+(com|cn)/gi);
console.dir(res);
```

## 字符方法

下面介绍的方法是 `String` 提供的支持正则表达式的方法

### search

search() 方法用于检索字符串中指定的子字符串，也可以使用正则表达式搜索，返回值为索引位置

```js
let str = "google.com";
console.log(str.search("com"));  // 7
```

使用正则表达式搜索

```js
console.log(str.search(/\.com/i)); // 6
```

### match

直接使用字符串搜索

```js
let str = "google.com";
console.log(str.match("com"));
// ['com', index: 7, input: 'google.com', groups: undefined]
```

使用正则获取内容，下面是简单的搜索字符串

```js
let abc = "google";
let res = abc.match(/g/);
console.log(res);  // ['g', index: 0, input: 'google', groups: undefined]
console.log(res[0]);  // 匹配结果 g
console.log(res.index);  // 出现位置 0
```

📌 如果使用 `g` 修饰符时（返回匹配结果数组），就不会有结果的详细信息了（可以使用exec），下面是获取所有h1~6的标题元素

```js
let body = document.body.innerHTML;
let result = body.match(/<(h[1-6])>[\s\S]+?<\/\1>/g);
```

### matchAll

在新浏览器中支持使用 `matchAll` 操作，并返回迭代对象

```js
let str = "emoji";
let reg = /[a-z]/ig;
for (const iterator of str.matchAll(reg)) {
  console.log(iterator);
}
```

### split ✔️

用于使用字符串或正则表达式分隔字符串，下面是使用字符串分隔日期

```js
let str = "2023-02-12";
console.log(str.split("-")); //["2023", "02", "12"]
```

如果日期的连接符不确定，那就要使用正则操作了

```js
let str = "2023/02-12";
console.log(str.split(/-|\//));   // - | / 三类分隔符
```

### replace

`replace` 方法不仅可以执行基本字符替换，也可以进行正则替换，下面替换日期连接符

```js
let str = "2023/02/12";
console.log(str.replace(/\//g, "-")); //2023-02-12
```

替换字符串可以插入下面的特殊变量名：

| 变量 | 说明                                                         |
| ---- | ------------------------------------------------------------ |
| `$$` | 插入一个 "$"。                                               |
| `$&` | 插入匹配的子串。                                             |
| $`   | 插入当前匹配的子串左边的内容。                               |
| `$'` | 插入当前匹配的子串右边的内容。                               |
| `$n` | 假如第一个参数是 `RegExp` 对象，并且 n 是个小于100的非负整数，那么插入第 n 个括号匹配的字符串。提示：索引是从1开始 |

在Jerry前后添加三个`=`

```js
let abc = "=Jerry=";
//  $`(=)   $`(=)   $&(=Jerry=)   $'(=)   $'(=)
console.log(abc.replace(/Jerry/g, "$`$`$&$'$'"));  // ===Jerry===
```

把电话号用 `-` 连接

```js
let abc = "(010)99999999 (020)8888888";
console.log(abc.replace(/\((\d{3,4})\)(\d{7,8})/g, "$1-$2"));
// 010-99999999 020-8888888
```

把所有`教育`汉字加上链接 `https://www.google.com`

```html
<body>
  在线教育是一种高效的学习方式，教育是一生的事业
</body>
<script>
  const body = document.body;
  body.innerHTML = body.innerHTML.replace(
    /教育/g,
    `<a href="https://www.houdunren.com">$&</a>`
  );
</script>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/javascript/regexp/8.jpg)

---

为链接添加上`https` ，并补全 `www.`

```html
<body>
  <main>
    <a style="color:red" href="http://www.google.com">
      谷歌
    </a>
    <a id="l1" href="http://baidu.com">百度</a>
    <a href="http://yahoo.com">雅虎</a>
    <h4>http://www.emoji.com</h4>
  </main>
</body>
<script>
  const main = document.querySelector("body main");
  const reg = /(<a.*href=['"])(http)(:\/\/)(www\.)?(baidu|google)/gi;
  main.innerHTML = main.innerHTML.replace(reg, (v, ...args) => {
    args[1] += "s";
    args[3] = args[3] || "www.";
    return args.splice(0, 5).join("");
  });
</script>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/javascript/regexp/9.jpg)

---

将标题标签全部替换为 `p` 标签

```html
<body>
  <h1>google.com</h1>
  <h2>baidu.com</h2>
  <h1>Jerry</h1>
</body>

<script>
  const reg = /<(h[1-6])>(.*?)<\/\1>/g;
  const body = document.body.innerHTML;
  const html = body.replace(reg, function(str, tag, content) {
    return `<p>${content}</p>`;
  });
  document.body.innerHTML = html;
</script>
```

结果

```html
<body>
    <p>google.com</p>
    <p>baidu.com</p>
    <p>Jerry</p>
</body>
```

删除页面中的 `h1~h6` 标签

```html
<body>
  <h1>google.com</h1>
  <h2>baidu.com</h2>
  <h1>Jerry</h1>
</body>
<script>
  const reg = /<(h[1-6])>(.*?)<\/\1>/g;
  const body = document.body.innerHTML;
  const html = body.replace(reg, "");
  document.body.innerHTML = html;
</script>
```

**回调函数**

replace 支持回调函数操作，用于处理复杂的替换逻辑

| 变量名            | 代表的值                                                     |
| ----------------- | ------------------------------------------------------------ |
| `match`           | 匹配的子串。（对应于上述的$&。）                             |
| `p1,p2, ...`      | 假如replace()方法的第一个参数是一个 `RegExp` 对象，则代表第n个括号匹配的字符串。（对应于上述的$1，$2等。）例如，如果是用 `/(\a+)(\b+)/` 这个来匹配，`p1` 就是匹配的 `\a+`，`p2` 就是匹配的 `\b+`。 |
| `offset`          | 匹配到的子字符串在原字符串中的偏移量。（比如，如果原字符串是 `'abcd'`，匹配到的子字符串是 `'bc'`，那么这个参数将会是 1） |
| `string`          | 被匹配的原字符串。                                           |
| NamedCaptureGroup | 命名捕获组匹配的对象                                         |

使用回调函数将 `博客` 添加上链接

```html

<body>
  <div class="content">
    博客会不断更新优质视频教程
  </div>
</body>

<script>
  let content = document.querySelector(".content");
  content.innerHTML = content.innerHTML.replace("博客", function(
    search,
    pos,
    source
  ) {
    return `<a href="https://blog.caffreygo.com">${search}</a>`;
  });
</script>
```

为所有标题添加上 `hot` 类

```html
<body>
  <div class="content">
    <h1>google.com</h1>
    <h2>baidu.com</h2>
    <h1>Jerry</h1>
  </div>
</body>
<script>
  let content = document.querySelector(".content");
  let reg = /<(h[1-6])>([\s\S]*?)<\/\1>/gi;
  content.innerHTML = content.innerHTML.replace(
    reg,
    (
      search, // 匹配到的字符
      p1, // 第一个原子组
      p2, // 第二个原子组
      index, // 索引位置
      source // 原字符
    ) => {
      return `
<${p1} class="hot">${p2}</${p1}>
`;
    }
  );
</script>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/javascript/regexp/10.jpg)

---

## 正则方法

下面是 `RegExp` 正则对象提供的操作方法

### test

检测输入的邮箱是否合法

```html
<body>
  <input type="text" name="email" />
</body>

<script>
  let email = document.querySelector(`[name="email"]`);
  email.addEventListener("keyup", e => {
    console.log(/^\w+@\w+\.\w+$/.test(e.target.value));
  });
</script>
```

### exec

::: tip 不使用 `g` 修饰符时与 `match` 方法使用相似，使用 `g` 修饰符后可以循环调用直到全部匹配完。

- 使用 `g` 修饰符多次操作时使用同一个正则，即把正则定义为变量使用
- 使用 `g` 修饰符最后匹配不到时返回 `null`

:::

计算内容中博客出现的次数

```html
<body>
  <div class="content">
    博客不断分享视频教程，博客网址是 blog.caffreygo.com
  </div>
</body>

<script>
  let content = document.querySelector(".content");
  let reg = /(?<tag>博客)/g;
  let num = 0;
  while ((result = reg.exec(content.innerHTML))) {
    num++;
  }
  console.log(`博客共出现${num}次`);  // 博客共出现2次
</script>
```

## 断言匹配

📗 断言虽然写在扩号中但它不是组，所以不会在匹配结果中保存，可以将断言理解为正则中的条件。

### (?=exp)

**零宽先行断言** `?=exp` 匹配后面为 `exp` 的内容

把后面是`教程` 的博客汉字加上链接

```html
<body>
  <main>
    博客不断分享视频教程，学习博客教程提升编程能力。
  </main>
</body>

<script>
  const main = document.querySelector("main");
  const reg = /博客(?=教程)/gi;
  main.innerHTML = main.innerHTML.replace(
    reg,
    v => `<a href="https://blog.caffreygo.com">${v}</a>`
  );
</script>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/javascript/regexp/11.jpg)

---

下面是将价格后面 添加上 `.00`

```js
<script>
  let lessons = `
    js,200元,300次
    php,300.00元,100次
    node.js,180元,260次
  `;
  let reg = /(\d+)(.00)?(?=元)/gi;  // 以元结束的数字
  lessons = lessons.replace(reg, (v, ...args) => {
    args[1] = args[1] || ".00";
    return args.splice(0, 2).join("");
  });
  console.log(lessons);
</script>
```

```text
js,200.00元,300次
php,300.00元,100次
node.js,180.00元,260次
```

使用断言验证用户名必须为五位，下面正则体现断言是不是组，并且不在匹配结果中记录

```html
<body>
    <input type="text" name="username" />
</body>

<script>
    document
        .querySelector(`[name="username"]`)
        .addEventListener("keyup", function() {
        let reg = /^(?=[a-z]{5}$)/i;
        console.log(reg.test(this.value));
    });
</script>
```

### (?<=exp)

**零宽后行断言** `?<=exp` 匹配前面为 `exp` 的内容

匹配前面是`houdunren` 的数字

```js
let abc = "hello789hi666";
let reg = /(?<=hello)\d+/i;
abc.match(reg);
// ['789', index: 5, input: 'hello789hi666', groups: undefined]
```

匹配前后都是数字的内容

```js
let abc = "hello789hi666";
let reg = /(?<=\d)[a-z]+(?=\d{3})/i;
abc.match(reg);
// ['hi', index: 8, input: 'hello789hi666', groups: undefined]
```

所有超链接替换为`google.com`

```html
<body>
  <a href="https://baidu.com">百度</a>
  <a href="https://yahoo.com">雅虎</a>
</body>
<script>
  const body = document.body;
  let reg = /(?<=<a.*href=(['"])).+?(?=\1)/gi;
  body.innerHTML = body.innerHTML.replace(reg, "https://google.com");
</script>
```

```html
<body>
  <a href="https://google.com">百度</a>
  <a href="https://google.com">雅虎</a>
</body>
```

下例中将 `博客` 后面的视频添加上链接

```html
<body>
  <h1>博客视频不断录制案例丰富的视频教程</h1>
</body>

<script>
  let h1 = document.querySelector("h1");
  let reg = /(?<=博客)视频/;
  h1.innerHTML = h1.innerHTML.replace(reg, str => {
    return `<a href="https://www.link.com">${str}</a>`;
  });
</script>
```

```text
<h1>博客<a href="https://www.link.com">视频</a>不断录制案例丰富的视频教程</h1>
```

将电话的后四位模糊处理

```js
let users = `
  小明电话: 12345678901
  老李电话: 98745675603
`;
// 匹配前面是七个数字的数字，也就是后四位数字
let reg = /(?<=\d{7})\d+\s*/g;
users = users.replace(reg, str => {
  return "*".repeat(4);
});
console.log(users); // '\n  小明电话: 1234567****老李电话: 9874567****'
```

获取标题中的内容

```js
let abc = `<h1>大家好</h1>`;
let reg = /(?<=<h1>).*(?=<\/h1>)/g;
console.log(abc.match(reg));  // ['大家好']
```

### (?!exp)

**零宽负向先行断言** 后面不能出现 `exp` 指定的内容

使用 `(?!exp)`字母后面不能为两位数字

```js
let abc = "jerry12";
let reg = /[a-z]+(?!\d{2})$/i;
console.table(reg.exec(abc));  // null
```

下例为用户名中不能出现`Jerry`

```html
<body>
  <main>
    <input type="text" name="username" />
  </main>
</body>
<script>
  const input = document.querySelector(`[name="username"]`);
  input.addEventListener("keyup", function() {
    const reg = /^(?!.*Jerry.*)[a-z]{5,6}$/i;
    console.log(this.value.match(reg));
  });
</script>
```

### (?<!exp)

**零宽负向后行断言** 前面不能出现exp指定的内容

获取前面不是数字的字符

```js
let abc = "abc99hello";
let reg = /(?<!\d+)[a-z]+/i;
console.log(reg.exec(abc));
// ['abc', index: 0, input: 'abc99hello', groups: undefined]
```

把所有不是以 `https://oss.google.com` 开始的静态资源替换为新网址

```html
<body>
  <main>
    <a href="https://www.baidu.com/1.jpg">1.jpg</a>
    <a href="https://oss.google.com/2.jpg">2.jpg</a>
    <a href="https://cdn.yahoo.com/2.jpg">3.jpg</a>
    <a href="https://google.com/2.jpg">3.jpg</a>
  </main>
</body>
<script>
  const main = document.querySelector("main");
  const reg = /https:\/\/(\w+)?(?<!oss)\..+?(?=\/)/gi;
  main.innerHTML = main.innerHTML.replace(reg, v => {
    console.log(v);
    return "https://oss.google.com";
  });
</script>
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/javascript/regexp/12.jpg)

