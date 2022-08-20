# 类型工具

::: tip TypeScript

- JS 也有类型，但是类型数量比较少（number、string...）
- TS 可以随意自定义类型，比如联合类型。TS 的类型是严格类型，可以对类型进行校验
- TS 无限集合类型 `type JC = string | number`
- TS 有限集合类型 `type JC = 'hello' | 'world'`

:::

## is

`is` 用于定义变量属于某个类型，下面判断时将出现类型错误提示：

```typescript
const isString = (x: unknown): boolean => typeof x === 'string'

function hello(a: unknown) {
    if (isString(a)) {
        //error: 对象的类型为 "unknown"。
        a.toUpperCase()
    }
}
let a = 'ab'

hello(a)
```

现在重新定义 isString 函数，使用 is 来定义变量为某个类型。

`x is string` 表示如果函数返回值为 true，则 x 为 string 类型

```typescript
const isString = (x: unknown): x is string => typeof x === 'string'

function hello(a: unknown) {
    if (isString(a)) {
        a.toUpperCase()
    }
}
let a = 'ab'

hello(a)
```

## keyof

获取类、接口索引组成的**联合类型**

> `keyof` 可用于基本数据类型、any、class、interface、enum 等

任何类型都可以使用 `keyof`

```typescript
// keyof 基本数据类型 => 类型的属性方法
type AMADA = keyof string

let jc: AMADA = 'match'
```

索引类型使用 `keyof` 时，获取索引名

```typescript
// type AMADA = 'name' | 'age'
type AMADA = keyof { name: string, age: number }

let jc: AMADA = 'name'
```

下面是获取**对象的属性**的函数类型定义

```typescript
function getAttribute<T>(obj: T, key: keyof T): T[keyof T] {
    return obj[key]
}

const user = { name: 'jerry', age: 18 }
getAttribute(user, 'name')
// getAttribute('abc', 'includes')
```

我们也可以用**泛型**定义索引类型

```typescript
function getAttribute<T, D extends keyof T>(obj: T, key: D): T[D] {
    return obj[key]
}

const user = { name: 'jerry', age: 18 }
getAttribute(user, 'name')
```

## typeof

使用 typeof 可**获取变量的类型**，下面是获取字符串变量的类型

```typescript
let hello = 'jerry'

// type AMADA = string
type AMADA = typeof hello
```

下面使用 typeof 获取对象的 （在 JS 当中 `typeof {} === 'object'`）

```typescript
let hello = { name: 'jerry', age: 18 }

/**
 type AMADA = {
  name: string;
  age: number;
 */
type AMADA = typeof hello
```

keyof 与 typeof 结合定义获取对象属性的函数

```typescript
// typeof obj => { name: string; age: number }
// keyof => 'name' | 'age'
function getAttribute(obj: object, key: string) {
    return obj[key as keyof typeof obj]
}

const hello = { name: 'helloworld' }
getAttribute(hello, 'name')
```

## in

in 用于遍历接口或联合类型的属性

`K in keyof T` 指 K 类型为 keyof T 获取的 T 类型索引组成的联合类型

```typescript
type USER = { name: string, age: number }

type MEMBER<T> = {
    [K in keyof T]: T[K]
}

const hello: MEMBER<USER & { address: string }> = {
    age: 10, name: 'jerry', address: '上海',
}
```

## extends

extends 在 TS 中拥有多个特性，下面我们来分别了解。

### 类型继承

extends 实现类型的继承

```typescript
type GOLDENJADE = { name: string }

interface helloworld extends GOLDENJADE {
    age: number
}

const hello: helloworld = { age: 33, name: 'jerry' }
```

extends 可用于泛型的类型限定，下例中 T 必须包含 id、render 属性，即 T 类型可赋予 extends 右侧类型

```typescript
function helloworld<T extends { id: number; render(n: number): number }>(arr: T[]) {
    arr.map((a) => a.render(a.id))
}

helloworld([{ id: 1, render(n) { return n } }])
```

### 类型条件判断

extends 用于条件判断来决定返回什么类型，`A extends B ? true:false`。如果 A（狭窄类型） 可以赋予 B（宽泛类型） 类型则为 true。

下例的 hello 变量值必须为 false，因为 AMADA 不包含 GOLDENJADE 类型

```typescript
type GOLDENJADE = { name: string, age: number }

type AMADA = { name: string }
// 窄类型的限制更多，更细。false
type HEYTEA = AMADA extends GOLDENJADE ? true : false

const hello: HEYTEA = false
```

下面是联合类型的条件判断

```typescript
type GOLDENJADE = string

type AMADA = string | number

const hello: AMADA extends GOLDENJADE ? string : boolean = false  // boolean
// 联合类型比单一类型更宽泛，可以被 extendss
const jc: GOLDENJADE extends AMADA ? string : boolean = 'jerry'  // string
```

### ✅ 根据索引名称过滤

根据联合类型过滤掉指定索引

```typescript
type User = { name: string, age: number, get(): void };

// type K = 'name' | 'age' |  'get'
// Exclude<K, 'name'> => never | 'age' | 'get' => 'age' | 'get'
// as never => neve, never 作为 key 会被过滤掉
type FilterObjectProperty<T, U> = {
    [K in keyof T as Exclude<K, U>]: T[K]
}

type HK = FilterObjectProperty<User, 'name' | 'age'>
```

### ✅ 根据值类型过滤

过滤掉指定的类型，以下代码含有下面几个含义

- 根据类型获取索引组合成的联合类型
- 根据新的联合类型提取出指定的索引，组合成新的类型

```typescript
type USER = { name: string, age: number, get(a: string): void }

type FilterProperty<T, U> = {
    [K in keyof T]: T[K] extends U ? never : K
}[keyof T]

// [keyof T] 获取到 key 的联合类型
// type ABC = FilterProperty<USER, number>;  'name' | 'get'
// type UserType = { name: string }
type UserType = Pick<USER, FilterProperty<USER, Function | number>>
```

💡 `[keyof T] `解析：

```typescript
// 在 JavaScript 当中，let a = { name: '33'}，a['name']可以取值

type UU = { name: 'name'; age: never; get: 'get' };
type AB = UU[keyof UU];  // 'name' | 'get' | never => 'name' | 'age'
```

### 泛型条件分配

如果泛型是普通类型，则与上面一样也是判断左侧类型是否可赋予右侧类型

```typescript
type GOLDENJADE = string

type HEYTEA<T> = T extends GOLDENJADE ? string : boolean

const hello: HEYTEA<string> = 'jerry' //string
```

如果 extends 是泛型类型，并且传入的类型是联合类型。则**分别进行判断**，最后得到联合类型。

```typescript
type GOLDENJADE = string

type HEYTEA<T> = T extends GOLDENJADE ? string : boolean

const hello: HEYTEA<string | number> = false  // string | boolean
```

条件判断也可以嵌套使用

```typescript
type GOLDENJADE = string

type AMADA = string | number

type HEYTEA<T> =
	T extends GOLDENJADE ? string :
	T extends AMADA ? symbol : boolean

const hello: HEYTEA<string | number> = 'jerry'
```

✅ 使用 **[ ]** 包裹类型，表示使用泛型的整体进行比较

```typescript
type GOLDENJADE = string | number

type AMADA = string | number

type HEYTEA<T> = [T] extends [GOLDENJADE] ? string : boolean

const hello: HEYTEA<string | number> = 'jerry'  // string
```

## Exclude

我们利用上面的泛型类型的条件分配，可以创建一个类型用于进行类型的过滤。

- 从 T 泛型类型 中过滤掉 U 的类型
- **never 是任何类型的子类型**，可以赋值给任何类型，没有类型是 never 的子类型或可以赋值给 never 类型(never 本身除外)

```typescript
type EXCLUDE<T, U> = T extends U ? never : T

type GOLDENJADE = string

type AMADA = string | number

const hello: EXCLUDE<AMADA, GOLDENJADE> = 100;  // number
```

事实上 typescript 已经提供了 Exclude 关键字用于完成上面的工作，所以我们不需要单独定义 Exclude 类型了。

```typescript
type GOLDENJADE = string

type AMADA = string | number

const hello: Exclude<AMADA, GOLDENJADE> = 100;
```

## Extract

Extract 与 Exclude 相反，用于获取相交的类型。(v. 提炼)

```typescript
type EXTRACT<T, U> = T extends U ? T : never;

type AMADA = string | number | boolean

const hello: EXTRACT<AMADA, string | number> = 'jerry';
```

下面是取两个类型相同的属性名

```typescript
type AMADA = string | number | boolean

const hello: Extract<AMADA, string | number> = 'jerry';
```

## Pick

pick 可以用于从属性中挑选出一组属性，组成新的类型。

下面定义 pick 类型用于从 AMADA 类型中挑选出 name 与 age 类型。

```typescript
type AMADA = { name: string, age: number, skill: string }
// keyof T: name | age | skill
type PICK<T, U extends keyof T> = {
    [P in U]: T[P]
}

// type HK = { name: string; age: number; }
type HK = PICK<AMADA, 'name' | 'age'>
const jc: HK = { name: 'jerry', age: 33 }
```

同样 typescript 已经原生提供了 Pick 类型，所以我们不用像上面那样自己定义了

```typescript
type AMADA = { name: string, age: number, skill: string }

type HK = Pick<AMADA, 'name' | 'age'>
const jc: HK = { name: 'jerry', age: 33 }
```

## Omit

从类型中**过滤掉指定属性**，这与 Pick 类型工具功能相反

```typescript
type HK = { name: string, age: number, city: string }

type MyOmit<T, U> = Pick<T, {
    [K in keyof T]: K extends U ? never : K
}[keyof T]>

// { [K in keyof T]: K extends U ? never : K }
// { name: never ; age: never; city: 'city' }
// 最后通过 [keyof T] 提取出值的联合类型：never | never | 'city' => 'city'
// 结果为：Pick<HK, 'city'>
type XJ = MyOmit<HK, 'name' | 'age'>  // {city:string}
```

可以将上面代码使用 Exclude 优化

```typescript
type HK = { name: string, age: number, city: string }

type MyOmit<T, U> = Pick<T, Exclude<keyof T, U>>

type XJ = MyOmit<HK, 'name' | 'age'>  // {city:string}
```

typescript 已经提供了类型工具 Omit

```typescript
type HK = { name: string, age: number, city: string }

type XJ = Omit<HK, 'name' | 'age'>  // {city:string}
```

## Partial

下面定义 Partial 类型，用于将全部属性设置为可选

```typescript
type GOLDENJADE = { name: string, age: number }

type PARTIAL<T> = {
    [P in keyof T]?: T[P]
}

const hello: PARTIAL<GOLDENJADE> = { name: '小强' } // {name?:string,age?:number}
```

Typescript 原生提供了 Partial 的支持，所以我们不用自己定义了

```typescript
type GOLDENJADE = { name: string, age: number }

const hello: Partial<GOLDENJADE> = { name: '小强' }
```

## Record

✅ Record 常用于**快速定义对象类型**使用

下面我们来手动实现一个 Record，RECORD 类型的第一个参数为索引，第二个为类型

```typescript
type RECORD<K extends string | number | symbol, V> = {
  [P in K]: V
}

// type HK = { name: string | number; age: string | number }
type HK = RECORD<'name' | 'age', string | number>

type MN = Record<string, string | number>

const jc: HK = { name: "jerry", age: 18 }
```

typescript 原生已经提供了 Record 类型，下面定义 MEMBER 类型，索引为字符串，值为任何类型

```typescript
type HK = Record<'name' | 'age', any>

const jc: HK = { name: "jerry", age: 18 }
```

### 索引签名

```typescript
type HELLO = {
  [x: `${string}Jc`]: string | number;
  city: string;
  age: number;
}

let jc = HELLO = {
  nameJc: 'Jerry',
  city: 'XIAMEN',
  age: 25
}

// type ABC = string | number | symbol
type ABC = keyof any
```

## 交叉类型

```typescript
interface A { name: string }
type B = { age: number }
let c: A & B = { name: 'Jerry', age: 25 }

// 类型不一致无法交叉，结果就是没有类型：never
type JC = string & number  // never
type JC = 'a' & 'b'  // never
```

类型不一致报错：

```typescript
type A = { name: string }
type B = { age: number, name: boolean }

// type AB = A & B
// name 报错，不能将类型“string”分配给类型“never”
type AB = A & Pick<B, 'age'>
let hi: AB = { age: 25, name: 'Jerry'}
```

交叉类型的实际应用：（类型拓展）

```typescript
type User = { name: string, age: number }
type Member = { avatar: string} & User
```

### merge 方法

```typescript
function merge<T, U>(a: T & U, b: U): T & U {
  for(const key in b) {
    // a[key as Extract<keyof U, 'string'>] = b[key] as any
    a[key] = b[key] as any
  }
  return a
}
```

### 联合类型

```typescript
tyoe HK = ('a' | 'b') & ('a') // a | never => a

// 'b'是单个字符串类型，是字符串的子类， 'b' & string => 'b'
tyoe HK = ('a' | 'b') & ('a' | string) // a | b
```

## infer

::: tip infer

- infer 只能在 extends 中使用
- infer 的类型变量，**只能在 extends 条件的 true 中使用** 🚨

 :::

下面使用 infer **推断**属性值类型

```typescript
type HK = { name: string, age: number }

// type AttrType<T> = T extends { name: infer M, age: infer N } ? [M, N] : T
type AttrType<T> = T extends { name: infer M, age: infer M } ? M : T

type valueType = AttrType<HK>  // string | number
```

下面使用 infer 获取值类型

```typescript
type USER = { name: string, age: number, get(a: string): void }

type GetType<T> = {
  	// infer 会动态改变：string -> number -> ((a: string) => void)
    [K in keyof T]: T[K] extends (infer U) ? U : K
}[keyof T]

// 最后通过 [keyof T] 获取到值联合类型：string | number | ((a: string) => void)
type valueType = GetType<USER>;
```

下面是获取**函数返回值**类型

```typescript
type HK = (n: string) => number[]

type GetFunctionReturnValue<T> = T extends ((...args: any) => (infer U)[]) ? U : T

// number
type valueType = GetFunctionReturnValue<HK>;

// number[]
// type GetFunctionReturnValue<T> = T extends ((...args: any) => (infer U)) ? U : T
```