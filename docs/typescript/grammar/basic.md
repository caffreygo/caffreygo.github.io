# 基础语法

## TypeScript的定义

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.

- JavaScript的超集 、静态类型
- 需要把ts编译成 JavaScript 代码才能执行

```js
// js动态类型
let a = 123;
a = '123';

// ts静态类型   报错提示
let b1 = 123;
let b2:number = 123;

// ts直接执行
// Uncaught SyntaxError: Unexpected identifier
```

## TypeScript的优势

- 编写时的错误检查
- 编辑器的语法提示
- 代码语义更清晰易懂

```typescript
interface Point { x: number, y: number }

function tsDemo(data: Point) {
  return Math.sqrt(data.x ** 2 + data.y ** 2);
}

tsDemo({ x: 1, y: 123 });
```

## TypeScript运行环境

- node环境  （node -v && npm -v检查版本）
- vs code设置（quote: single && tab: 2)
- 安装prettier  (format on save  = true  && prettier: Single Quote)
- 安装typescript  (npm install typescript@3.6.4 -g)

```js
// 验证
tsc demo.ts
node demo.js

//  tsc : 无法加载文件 C:\Users\Caffrey\AppData\Roaming\npm\tsc.ps1。
//  未对文件 C:\Users\Caffrey\AppData\Roaming\npm\tsc.ps1 进行数字签名。无法在当前
//  系统上运行该脚本。有关运行脚本和设置执行策略的详细信息，请参阅 https:/go.microsoft.com/
//  fwlink/?LinkID=135170中的 about_Execution_Policies。
//  所在位置 行:1 字符: 1
//  + tsc demo.ts
//  + ~~~
//      + CategoryInfo          : SecurityError: (:) []，PSSecurityException
//      + FullyQualifiedErrorId : UnauthorizedAccess
需要管理员身份打开powershell
运行Set-ExecutionPolicy RemoteSigned
```

**改进**

- 安装ts-node (npm install -g ts-node  // npm install -g ts-node@8.4.1)

```shell
ts-node demo.ts
```

## 静态类型

- 变量会受到静态类型的限制（类型不能修改）
- 拥有类型的属性和方法（编辑器的提醒）

## 基础类型和对象类型

静态类型帮助判断变量的属性和方法是什么

静态类型：

1. 基础类型
2. 对象类型

```js
// 基础类型 null, undefined, symbol, boolean, void, string, number...
const count: number = 123;
const teacherName: string = 'Dell';

// 对象类型（函数类型， 数组类型...）
class Person {}

const teacher: {
  name: string;
  age: number;
} = {
  name: 'Dell',
  age: 18
};

// 数组类型
const numbers: number[] = [1, 2, 3];

// dell 必须是一个Person类对应的对象
const dell: Person = new Person();

// getTotal是一个函数（）=> ，返回值是数字 number
const getTotal: () => number = () => {
  return 123;
};
```

## 类型注解和类型推断

- type annotation: 类型注解, 我们来告诉 TS 变量是什么类型
- type inference: 类型推断, TS 会自动的去尝试分析变量的类型
- 如果 TS 能够自动分析变量类型，我们就什么也不需要做了
- 如果 TS 无法分析变量类型的话，我们就需要使用类型注解

```js
// 可自动分析
const firstNumber = 1;
const secondNumber = 2;
const total = firstNumber + secondNumber;

// 类型注解，结果类型推断
function getTotalData(firstNumber: number, secondNumber: number) {
  return firstNumber + secondNumber;
}

const totalData = getTotalData(1, 3);
```

## 函数相关类型

- 如果函数的参数解构，对应的参数类型声明 ：{ key: value }

```js
// function add(first: number, second: number): number {
//   return first + second;
// }

// function sayHello(): void {
//   console.log('hello');
// }

// function errorEmitter(): never {
//   while(true) {}
// }

function add({ first, second }: { first: number; second: number }): number {
  return first + second;
}

function getNumber({ first }: { first: number }) {
  return first;
}

const total = add({ first: 1, second: 2 });
const count = getNumber({ first: 1 });
```

## 回顾

- 声明函数的两种方式(:类型 = 实现)

```js
// 定义函数结构体，可以把 (str: string) => number 提取出来声明为type（类型别名）
const func1: (str: string) => number = str => {
  return parseInt(str, 10);
};
```

```js
// 直接定义函数参数和返回值的类型
const func = (str: string)：number => {
  return parseInt(str, 10);
};
```

- 函数的返回值通常可以通过类型推断返回

```js
// 无法通过类型推断的case
interface Person {
  name: 'string';
}
const rawData = '{"name": "dell"}';
const newData: Person = JSON.parse(rawData);
```

- 联合类型：多种类型声明 ( | )

```js
let temp: number | string = 123;
temp = '456';
```

## 数组和元组

### 数组

- 基础的数组声明

```js
const numberArr: number[] = [1,2,3];
const undefinedArr: undefined[] = [undefined];
```

- 包含多种类型值的数组声明

```js
const arr: (number | string)[] = [1, '2', 3];
```

- 通过**范型**定义包含多种类型值的数组

```typescript
const arr: Array<number | string | object> = ["jkl", {}, 123];
```

- 对象数组

```js
// 对象数组中必须包含一个string类型的name,只能有一个key,并且是name
const objectArr: {name: string}[] = [{name: 'caffrey'}]
// 多个key的对象数组
const objectArr: {name: string，age: number}[] = [{name: 'caffrey', age: 24}]
```

- 类型别名 type alias

```js
type User = {name: string, age:number};

const objectArr: User[] = [{
	name: 'caffrey';
	age: 24
}]

// typescript这种也支持
class Teacher {
	name: string;
	age: number
}

const teacherArr: Teacher[] = [
    new Teacher(),
    {
        name: 'caffrey';
        age: 24
	}
]
```

### 元组

元组在数组的基础上还定义了数组每一项的类型限制

- 数组长度固定
- 数组每一项的类型固定

```js
const teacherInfo: [string, string, number] = ['Dell', 'male', 18];

// csv应用
const teacherList: [string, string, number][] = [['dell', 'male', 19], ['sun', 'female', 26], ['jeny', 'female', 38]];
```

## Interface

### 通用性的类型集合

- interface 接口

```js
const getPersonName1 = (person: {name: string}) => {
    console.log(person.name)
}
const setPersonName = (person:{name: string},name: string) => {
    person.name = name
}
// interface Person定义
interface Person {
	name: string
}
const getPersonName = (person: Person):void => {
    console.log(person.name)
}
const setPersonName = (person:Person,name: string):void => {
    person.name = name
}
```

### type 类型别名（=）

```js
type Person = {
	name: string
}
// interface可以代表函数和对象
// type还可以代表基础类型
type Person1 = string;
```

- 一般用interface代表类型可以实现，否则才用type

### 可选择属性（?）

```typescript
interface Person {
  name: string;
  age?: number;
}
```

### 只读属性readonly

```js
interface Person {
  readonly name: string;
}

// 报错，read-only的属性只读，不能被赋值
const setPersonName = (person: Person,name: string)：void {
    person.name = name
}
```

### 字面量强校验

```js
// Person要求传入的参数必须有name
interface Person {
	name: string;
	age?: number;
}
const getPersonName = (person: Person):void => {
    console.log(person.name)
}

// success
const person = {
	name: 'caffrey',
	sex: 'male'
}
getPersonName(person)

// error (Object literal may only specify known properties, and 'sex' does not exist in type 'Person')
// person写成字面量形式传递给函数报错
getPersonName({
    name: 'caffrey',
    sex: 'male'
})
```

- 当以对象字面量的形式传递时typescript会变成**强校验**

- 以缓存的变量形式，只要满足interface的要求即可（name）

###   [propName: string]: any

```typescript
interface Person {
  name: string;
  age?: number;
  [propName: string]: any;
}
```

​		如果要让字面量形式也满足需求

​		可以用如上形式代表，还有可能存在string类型的key，任何类型的value的属性

### 方法

```js
interface Person {
  name: string;
  age?: number;
  [propName: string]: any;
  say(): string;
}
const getPersonName = (person: Person): void => {
  console.log(person.name);
};

const person = {
  name: 'dell',
  sex: 'male',
  say() {
    return 'say hello';
  }
};
getPersonName(person);
```

### 类应用接口（implements）

```js
class User implements Person {
  name = 'dell';
  say() {
    return 'hello';
  }
}
// User类必须要有name属性和say方法
```

### 接口的继承（extends）

```js
interface Teacher extends Person {
	teach():string
}
// Tercher接口除了要求Person的属性方法，还需要有一个teach方法
const person：Teacher = {
  name: 'dell',
  sex: 'male',
  say() {
    return 'say hello';
  },
  teach() {
    return 'teach';
  }
};
```

### 接口定义函数

```js
interface SayHi {
	(word: string): string
}
// 接口使用
const say:SayHi =(word:string)=> {
    return word
}
```

### 接口编译成javascript

```shell
// 初始化typescript工程(配置文件)
tsc --init
// 编译
tsc demo.ts
```

接口是在typescript开发时定义的代码，完成类型检查的功能

编译成JavaScript的过程中会被**剔除**

## 类的定义与继承

- 定义类的属性和方法

```js
class Person {
	name: 'caffrey';
	getName(){
		return this.name;
	}
}

const person = new Person();
console.log(person.getName())
```

- 类的继承(extends)

```js
class Teacher extends Person {
	getTeacherName () {
		return 'teacher name'
	}
}

const teacher = new Teacher()
```

- 类的重写（子类可以重写父类）

```js
class Teacher extends Person {
    getTeacherName () {
		return 'teacher name'
	}
	getName () {
		return 'go'
	}
}

const teacher = new Teacher()
teacher.getName() === 'go'
```

- super(代表父类)

当类方法被重写，可以使用super去调用父类的方法

```js
class Teacher extends Person {
	getName () {
		return super.getName()+' go'
	}
}

const teacher = new Teacher()
teacher.getName() === 'caffrey go'
```

## 类中的访问类型和构造器

### 访问类型

- public 允许在类的内外被调用（默认）

- private 允许在类内被使用
- protected 允许在类内及继承的子类中使用

```js
class Person {
	public name: string;
	public sayHi () {
		// 类内调用
		this.name
		console.log('hi')
	}
}

const person = new Person()
// 类外
person.name = 'caffrey'
person.sayHi()
```

### constructor

constructor会在类实例化（new Class）的时候被执行

```js
class Person {
  // 传统写法
  // public name: string;
  // constructor(name: string) {
  //   this.name = name;
  // }
  // 简化写法
  constructor(public name: string) {}
}
const person = new Person('dell');
console.log(person.name);

```

- 父类和子类都有构造器

**子类构造器**需要调用父类的构造函数，否则会报错super(...)

即使父类没有参数，也要调用super()

```js
class Person {
  constructor(public name: string) {}
}

class Teacher extends Person {
  constructor(public age: number) {
    super('caffrey');
  }
}

const teacher = new Teacher(28);
console.log(teacher.age);   // 28
console.log(teacher.name);  // caffrey
```

## 静态属性，getter和setter

### 类里面的getter和setter

```js
class Person {
  constructor(private name: string) {}
  get getName () {
    return this.name + ' go';
  }
}

const person = new Person('caffrey')
// get直接getName调用，不需要person.getName()
console.log(person.getName)
// 'caffrey go'
```

private的属性(私有属性)一般使用_name命名

```js
class Person {
  constructor(private _name: string) {}
  get name() {
    return this._name + ' go';
  }
  set name(name: string) {
    const realName = name.split(' ')[0];
    this._name = realName;
  }
}

const person = new Person('caffrey');
// get
console.log(person.name);
// set
person.name = 'caffrey go';
console.log(person.name);
```

### 设计模式：单例模式

只能生成一个类的实例（不允许外部以new Demo()的方式创建实例）

**private**私有限制符,只允许内部调用，默认**public**

**static**静态属性，将方法直接挂载在类上面，而不是类的实例上面

```js
class Demo {
    private static instance: Demo;
    // 不允许外部以new Demo()的方式创建实例
    private constructor (public name: string) {}
   	// static将方法直接挂载在类上面，而不是类的实例上面
    // new Demo可以在类内调用
	// static getInstance == public static getInstance
    static getInstance () {
        if(!this.instance) {
            this.instance = new Demo('caffrey go');
        }
        return this.instance;
    }
}

// demo1 demo2完全相同，而不是两个不同实例
const demo1 = Demo.getInstance();
const demo2 = Demo.getInstance();
// demo1.name === demo2.name === 'caffrey go'
```

## readonly只读

- 通过getter和setter实现

```js
class Person {
	private _name: string;
	constructor (name: string) {
		this._name = name;
	}
	get name () {
    	return this._name;
    }
}

const person = new Person ();
console.log(person.name);
// 报错，没有设置getter的私有属性无法读取
person.name = 'hello';
console.log(person.name);
```

- readonly

```js
class Person {
	public readonly name: string;
	constructor (name: string) {
		this.name = name;
	}
}

const person = new Person ();
console.log(person.name);
// 报错，readonly这样的public属性只能读不能改
person.name = 'hello';
console.log(person.name);
```

## 抽象类

### 抽象类/方法

- 类的通性 => 抽象类
- abstract方法，具体实现不确定（只能定义，不能实现）,继承的抽象方法必须实现
- 抽象类只能被**继承**，不能被实例化

```js
// abstract类，通用的类
abstract class Geom {
    width: number;
    getType () {
        return 'Geom'
    }
    // abstract方法，具体实现不确定（只能定义，不能实现）
	abstract getArea ()： number;
}

class Circle extends Geom {
    // 继承的抽象方法必须实现
    getArea() {
        return 123;
    }
}

class Square  {}
class Triangle {}
```

### 抽象类和接口

- 抽象类是把类里面相关的通用的东西抽象出来
- 接口是把各种对象等的通用性东西的提炼

```js
interface Person {
	name: string;
}

interface Teacher extends Person {
	teachingAge: number
}

interface Student extends Person {
	age: number
}

const teacher = {
	name: 'caffrey',
	teachingAge: 3
}

const student = {
	name: 'go',
	age: 18
}

const getUserInfo = (user: Person)=> {
	console.log(user.name)
}

getUserInfo(teacher);
getUserInfo(student);
```

