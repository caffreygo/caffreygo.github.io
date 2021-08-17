# TypeScript语法进阶

## TypeScript中的配置文件

### 编译文件指定

```powershell
tsc --init
```

初始化一个新文件夹并且生成一个tsconfig.json文件

直接 tsc指定编译文件 **不会应用**tsconfig.json的配置的

```powershell
tsc demo.ts
```

**直接运行tsc**则会读取配置文件（ts-node demo.ts 也会使用tsconfig.json）

```powershell
tsc
```

运行 tsc 会先到tsconfig.json中查找配置中需要编译的文件(include)，没有则默认把根目录下的ts文件编译

[tsconfig.json]: http://www.typescriptlang.org/docs/handbook/tsconfig-json.html

- include / files指定需要编译的文件(正则匹配)
- exclude指定不编译的文件(正则匹配)

```json
{
    "include"：["./demo.ts"],
	"compilerOptions"： {
        ...
    }
}
```

### compilerOptions

[compilerOptions]: http://www.typescriptlang.org/docs/handbook/compiler-options.html

- removeComments：移除ts对应的注释项
- strict：对应的strict以下的配置都是true
- noImplicitAny：不允许隐士配置any(true: 需要手动设置any类型)
- strictNullChecks：强制检查null类型 （true : const str:string = null报错）
- rootDir/outDir：指定编译的文件和输出的位置
- incremental：增量编译，对已经编译的文件不再编译
- target：es5编译后的语法
- allowJs：对js文件的编译，（e.g. es6=>es5）
- checkJs: 是否检查JS文件的语法
- sourceMap：是否生成代码的.map文件
- noUnusedLocals：有定义但未使用的变量检查
- noUnusedParameters：有定义但未使用的函数参数检查
- baseUrl：根路径指定

......

## 联合类型和类型保护

### 联合类型

**type a | type b**

```typescript
interface Bird {
  fly: boolean;
  sing: () => {};
}

interface Dog {
  fly: boolean;
  bark: () => {};
}

function trainAnimal(animal: Bird | Dog) {
  // 语法只会提示共有的fly,typescript无法判断具体是哪种
  animal.fly...
}
```



### 类型保护

- 类型断言

```typescript
function trainAnimal(animal: Bird | Dog) {
  if (animal.fly) {
    (animal as Bird).sing();
  } else {
    (animal as Dog).bark();
  }
}
```

- in 语法来做类型保护

```typescript
function trainAnimal(animal: Bird | Dog) {
  if ('sing' in animal) {
    animal.sing();
  } else {
    animal.bark();
  }
}
```

- typeof 语法来做类型保护

```typescript
function add(first: string | number, second: string | number) {
  // 运算符“+”不能应用于类型“string | number”和“string | number”
  // return first + second
  if (typeof first === 'string' || typeof second === 'string') {
    return `${first}${second}`
  } else {
    return first + second
  }
}
```

- 使用instanceof 语法来做类型保护（class才可以使用instanceof ， interface不可以）

```typescript
class NumberObj {
  count: number;
}

function addSecond (first : object | NumberObj, second : object | NumberObj) {
  if(first instanceof NumberObj && second instanceof NumberObj) {
    return first.count + second.count
  }
  return 0
}
```

## Enum 枚举类型

```powershell
npm init -y
npm install ts-node -D
npm install typescript -D
```

- JavaScript(场景：某个状态的值固定)

```javascript
const Status = {
  OFFLINE: 0,
  ONLINE: 1,
  DELETED: 2
};

function getResult(status) {
  if (status === Status.OFFLINE) {
    return 'offline';
  } else if (status === Status.ONLINE) {
    return 'online';
  } else if (status === Status.DELETED) {
    return 'deleted';
  }
  return 'error';
}

const result = getResult(Status.ONLINE);
console.log(result);

```

- 枚举类型

```typescript
// 枚举类型的默认值从0开始，  0，1，2...
enum Status {
  OFFLINE,
  ONLINE,
  DELETED
}

function getResult(status: any) {
  if (status === Status.OFFLINE) {
    return 'offline';
  } else if (status === Status.ONLINE) {
    return 'online';
  } else if (status === Status.DELETED) {
    return 'deleted';
  }
  return 'error';
}

const result = getResult(1);     //	online
console.log(Status.OFFLINE);     // 0
console.log(Status.ONLINE);		 // 1
console.log(Status.DELETED);	 // 2
console.log(Status[0]);	   // OFFLINE     反向映射   
```

```typescript
// 如果中间的某个值被设置了，后续的+1自增
enum Status {
  OFFLINE,
  ONLINE = 4,
  DELETED
}
// 0 4 5
// Status[0]    undefined
```

## 函数泛型

- 场景

```typescript
function join(first: string | number, second: string | number) {
  return `${first}${second}`;
}

join('1', 1);

// 需求如果fisrt是number或者string,second也要一样?
```

- 泛型 generic **泛指的类型**，在使用的时候才会知道具体的类型，可以显式得声明，也可以让typescript进行类型推断

```typescript
// ABC 泛型（任意类型）
function join<ABC>(first: ABC,second: ABC) {
  return `${first}${second}`
}

// 报错：类型“1”的参数不能赋给类型“string”的参数
join("1",1)
join<string>('1',1)
// success
join<string>('1','1')
join<number>(1,1)
```

- 泛型的使用

```typescript
function map<ABC>(params: ABC) {
  return params
}
map<string>('123')     //  123

// T[]  与  Array<T>  等价
function map1<T>(params: T[]) {
  return params
}
map1<string>(['123'])     //  ['123']

function map1<T>(params: Array<T>) {
  return params
}
map2<string>(['123'])     //  ['123']
```

- 多个泛型的定义

```typescript
function join<T, P>(first: T, second: P) {
  return `${first}${second}`
}

join<number, string>(1,'1')
// 如果没有写类型，typescript会类型推断
join(1,'1')
```

## 类中的泛型以及泛型类型、

### 类中的泛型

```typescript
class DataManager {
	// 可以传string或者number类型的数组...
	constructor (private data: string [] | number[]) {}
	getItem(index: number): string|number {
		return this.data[index]
	}
}

const data = new DataManager(['1']);
data.getItem(0)           //   '1'
```

为了能传入各种类型的参数，并且返回和传入相应的类型，减少代码量

```typescript
class DataManager<T> {
	constructor (private data: T[]) {}
	getItem(index: number): T {
		return this.data[index]
	}
}

// const data = new DataManager(['1']);    类型推断
const data = new DanaManager<number>([1]);
data.getItem(0)           //   '1'
```

- 泛型类型约束（extends）

如果要求this.data[index].name有值,传入T类型一定要包含name属性，此时返回值是string

```typescript
interface Item {
	name: string;
}

class DataManager<T extends Item> {
	constructor (private data: T[]) {}
	getItem(index: number): string {
		return this.data[index].name;
	}
}

const data = new DanaManager([
	{
		name: 'caffrey'
	}
]);


//  interface Test {
//  	name: string
//  }
//  const data = new DanaManager<Test>([{name: 'caffrey'}]);
```

- 类接收的泛型的具体类型只能是number和string

```typescript
class DataManager<T extends number | string> {
	constructor (private data: T[]) {}
	getItem(index: number): T {
		return this.data[index]
	}
}

const data = new DataManager<string>([1])

```

### 泛型声明类型

```typescript
// 如何使用泛型作为一个具体的类型注解
function hello<T>(params: T) {
    return params;
}

//  const func: (T)=>string = <T>() => {
//  	return '123'
//  }
const func: <T>(patams: T) => T = hello;
```

## 命名空间

```shell
npm init -y
tsc -init
```

tsconfig.json

```json
"outDir": "./dist",
"rootDir": "./src"
```

index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script src="./page.js"></script>
  </head>
  <body>
    <script>
      new Page();
    </script>
  </body>
</html>
```

page.ts

```typescript
class Header {
  constructor() {
    const elem = document.createElement('div');
    elem.innerText = 'this is header';
    document.body.appendChild(elem);
  }
}

class Content {
  constructor() {
    const elem = document.createElement('div');
    elem.innerText = 'this is content';
    document.body.appendChild(elem);
  }
}

class Footer {
  constructor() {
    const elem = document.createElement('div');
    elem.innerText = 'this is footer';
    document.body.appendChild(elem);
  }
}

class Page {
  constructor() {
    new Header();
    new Content();
    new Footer();
  }
}
```

运行 tsc -w (自动检测变化编译)

```shell
|-- namespace
|   |-- dist
|   |   |-- page.js
|   |   |-- index.html
|   |-- src
|   |   |-- page.ts
|   |-- package.json
|   |-- tsconfig.json
```

问题：编译后的page.js文件暴露了很多的全局变量（控制台能够拿到Header、Content、Footer、Page）,而实际上需要保留的只有Page这个全局变量，需要在typescript中融入一些**模块化**的思想。

### namespace

```typescript
namespace Home {
  class Header {
    constructor() {
      const elem = document.createElement('div');
      elem.innerText = 'this is header';
      document.body.appendChild(elem);
    }
  }

  class Content {
    constructor() {
      const elem = document.createElement('div');
      elem.innerText = 'this is content';
      document.body.appendChild(elem);
    }
  }

  class Footer {
    constructor() {
      const elem = document.createElement('div');
      elem.innerText = 'this is footer';
      document.body.appendChild(elem);
    }
  }
  // 如果没有export,此时在控制台只能拿到一个空对象Home,export编译后（Home.Page = Page）
  // new Home.page()
  export class Page {
    constructor() {
      new Header();
      new Content();
      new Footer();
    }
  }
}
```

全局变量只有一个Home,而且Home只暴露了一个Page方法（export）

### 命名空间相互引用

将组件放在单独的文件中去管理，与页面逻辑分开（component / page两个全局变量）

```typescript
// Components
namespace Components {
  export class Header {
    constructor() {
      const elem = document.createElement('div');
      elem.innerText = 'this is header';
      document.body.appendChild(elem);
    }
  }

  export class Content {
    constructor() {
      const elem = document.createElement('div');
      elem.innerText = 'this is content';
      document.body.appendChild(elem);
    }
  }

  export class Footer {
    constructor() {
      const elem = document.createElement('div');
      elem.innerText = 'this is footer';
      document.body.appendChild(elem);
    }
  }
}
```

```typescript
// Home
namespace Home {
  export class Page {
    constructor() {
      new Components.Header();
      new Components.Content();
      new Components.Footer();
    }
  }
}
```

引用

```typescript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script src="./dist/components.js"></script>
    <script src="./dist/page.js"></script>
  </head>
  <body>
    <script>
      new Home.Page();
    </script>
  </body>
</html>
```

### 打包生成单个文件

这样导致出现了多个js文件的引入，如果希望只生成一个单独的文件，修改tsconfig.json(这种情况下module只支持amd和system)，不支持commonjs的模块化规范（修改后由于IDE延迟需要重新打开编辑器）

```json
"module": "amd",
"outFile": "./build/page.js"
```

打包后：

```sh
|-- namespace
|   |-- build
|   |   |-- page.js
|   |-- src
|   |   |-- components.ts
|   |   |-- page.ts
|   |   |-- index.html
|   |-- package.json
|   |-- tsconfig.json
```

### 命名空间依赖声明

namespace依赖之前的相互引用可以做一个声明

Home这个命名空间依赖于Components

```typescript
///<reference path='./components.ts' />

namespace Home {
  export class Page {
    constructor() {
      new Components.Header();
      new Components.Content();
      new Components.Footer();
    }
  }
}
```

### 内部其他声明

- 命名空间内部声明interface

- 命名空间导出子命名空间

```typescript
namespace Components {
  // new Components.SubComponents.Test()
  export namespace SubComponents {
    export class Test {}
  }
  // 声明interface
  export interface User {
    name: string;
  }
  
  ...Header Content Footer...
}
```

```typescript
///<reference path='./components.ts' />

namespace Home {
  export class Page {
    // interface使用
    user: Components.User = {
      name: 'caffrey'
    }
    constructor() {
      new Components.Header();
      new Components.Content();
      new Components.Footer();
    }
  }
}
```

## import对应的模块化

修改Components

```typescript
export class Header {
  constructor() {
    const elem = document.createElement('div');
    elem.innerText = 'this is header';
    document.body.appendChild(elem);
  }
}

export class Content {
  constructor() {
    const elem = document.createElement('div');
    elem.innerText = 'this is content';
    document.body.appendChild(elem);
  }
}

export class Footer {
  constructor() {
    const elem = document.createElement('div');
    elem.innerText = 'this is footer';
    document.body.appendChild(elem);
  }
}
```

```typescript
import { Header, Content, Footer } from './components';

class Page {
  constructor() {
    new Header();
    new Content();
    new Footer();
  }
}
```

打包生成AMD某块语法的js文件（module: amd）,浏览器不支持AMD(define => require)语法，需要引入能够识别define语法支持的文件。而且现在是在page这个模块定义了Page这个class

```typescript
import { Header, Content, Footer } from './components';

export default class Page {
  constructor() {
    new Header();
    new Content();
    new Footer();
  }
}
```

```typescript
export class Header {
  constructor() {
    const elem = document.createElement('div');
    elem.innerText = 'this is header';
    document.body.appendChild(elem);
  }
}

export class Content {
  constructor() {
    const elem = document.createElement('div');
    elem.innerText = 'this is content';
    document.body.appendChild(elem);
  }
}

export class Footer {
  constructor() {
    const elem = document.createElement('div');
    elem.innerText = 'this is footer';
    document.body.appendChild(elem);
  }
}
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.js"></script>
    <script src="./build/page.js"></script>
  </head>
  <body>
    <script>
      require([
        'page',
        function(page) {
          new page.default();
        }
      ]);
    </script>
  </body>
</html>
```

这种引入require.js文件的方式有些麻烦，可以结合webpack进行处理

## 使用parcel打包代码

[parcel]: https://www.github.com/parcel-bundler/parcel

```sh
npm install parcel@next -D
```

```
"scripts": {
	"start": "parcel ./src/index.html"
}
```

运行parcel对TS代码进行编译，然后在本地（localhost:1234）起一个服务器，然后我们便可以直接访问index.html文件，引入的ts代码以及被编译

```html
// index.html
<script src="./page.ts"></script>
```

## 描述文件中的全局类型

- 定义全局变量 declare var
- 定义全局函数 declare function
- 定义全局对象 declare namespace

仍然使用parcel对代码进行编译，引入jquery代码

```html
<--! index.html -->
<script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.js"></script>
<script src="./page.ts"></script>
```

```js
// page.ts
$(function() {
    alert(123)
})
// $里面传一个字符串，如果没继续声明会报错，但是parcel会尝试打包，正常运行
$(function() {
    $('body').html('<div>123</div>')
})
```

此时运行**npm run start**代码可以运行，但是typescript下编辑器会对$进行报错；此时需要类型定义文件**.d.ts**

类型定义文件如果不引入，如何**自己写一个类型定义文件**？

### 定义全局变量/函数

```typescript
// jquery.d.ts
// $是一个返回值为空的函数，接收的参数也是一个返回值为空的函数
// 定义全局变量
// declare var $: (param: () => void) => void；

interface JqueryInstance {
    html: (html: string) => JqueryInstance;
}

// 定义全局函数
declare function $(readyFuc: () => void): void;
// 函数重载，$还可以接收一个字符串，返回也是一个jquery对象，有html方法
declare function $(selector: string): JqueryInstance;
```

### interface进行函数重载

interface里面如果定义了多个函数的声明，就是函数的重载

当$既要是一个函数也是对象，使用declare声明；而如果只是函数的重载，interface也支持

```typescript
interface JQuery {
    (readyFunc: ()=> void): void;
    (selector: string): JqueryInstance;
}

declare $:JQuery;
```

### 定义全局对象

```typescript
$(function() {
    $('body').html('<div>123</div>');
    // $ 还是一个对象, new一个class
    new $.fn.init();
})
```

```typescript
declare namespace {
    namespace fn {
    	class init {}
	}
}
```

## 模块代码的类型描述文件

使用模块包的方式安装jquery

```shell
npm install --save jquery
```

使用import引入模块包，需要声明juqery的模块**declare module 'jquery'**

```typescript
// Es6 模块化 (jquery.d.ts)
declare module 'jquery' {
  interface JqueryInstance {
    html: (html: string) => JqueryInstance;
  }
  // 混合类型,不需要再declare
  function $(readyFunc: () => void): void;
  function $(selector: string): JqueryInstance;
  namespace $ {
    namespace fn {
      class init {}
    }
  }
  // 模块化定义.d.ts，需要export
  export = $;
}
```

```typescript
// page.ts
import $ from 'jquery';

$(function() {
  $('body').html('<div>123</div>');
  new $.fn.init();
});
```

common和umd模块的声明和ES6略有不同，需查阅

## 泛型中keyof语法的使用

```typescript
// page.ts
interface Person {
  name: string;
  age: number;
  gender: string;
}

class Teacher {
  constructor(private info: Person) {}
    
  getInfo(key: string) {
    // getInfo返回值为any
    // return this.info[key];
      
    // (method) Teacher.getInfo(key: string): string | number | undefined
   	if (key === 'name' || key === 'age' || key === 'gender') {
      return this.info[key];
    }
  }
}

const teacher = new Teacher({
  name: 'caffrey',
  age: 18,
  gender: 'male'
});

// const test = teacher.getInfo('name') as string;
const test = teacher.getInfo('name');
console.log(test);
```

如果有类是一个对象，希望通过key值获取对象的内容，并且能够获取到正确的类型推断：

通过泛型结合**keyof**来确定返回值类型

```typescript
interface Person {
  name: string;
  age: number;
  gender: string;
}

// T extends 'name'
// type T = 'name'
// key: 'name'
// Person['name']

// type T = 'age'
// key: 'age'
// Person['age']
class Teacher {
  constructor(private info: Person) {}
  getInfo<T extends keyof Person>(key: T): Person[T] {
    return this.info[key];
  }
}

const teacher = new Teacher({
  name: 'caffrey',
  age: 18,
  gender: 'male'
});

// const test: string
const test = teacher.getInfo('name');
// const test: number
const test = teacher.getInfo('age');
// 类型“"abc"”的参数不能赋给类型“"name" | "age" | "gender"”的参数
const test = teacher.getInfo('abc');
console.log(test);
```

类型的值可以是一个字符串

```typescript
type NAME = 'name';
const abc: NAME = 'name';

// 不能将类型“"hello"”分配给类型“"name"”
const abc: NAME = 'hello';
```

