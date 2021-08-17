# Symbol

## 声明

`Symbol()`产生一个唯一的数据，类似字符串

```js
const a = Symbol("a")         // a: Symbol(a)
const b = Symbol.for("b")     // b: Symbol(b)

const c = Symbol("a")      	  // c: Symbol(a)
const d = Symbol.for("b")     // d: Symbol(b)

console.log(a==c)  // false 普通声明的参数只是个描述，无其他作用
console.log(b==d)  
// true  Symbol.for(key)会在全局内存中记录这个key的Symbol,再次声明会直接返回原来声明过的

console.log(Symbol.keyFor(a))   // undefined
console.log(Symbol.keyFor(b))   // b  Symbol.keyFor获取key
```

## Symbol作key

```js
let u1 = {
	name: "Jerry",
    key: Symbol()
}
let u2 = {
	name: "Jerry",
    key: Symbol()
}
let grade ={
    [u1.key]: {js: 100, css: 20},
    [u2.key]: {js: 60, css: 80}
}
console.log(grade[u2.key])  //  {js: 60, css: 80}
```

## 属性遍历

Symbol类型作key是不能被for in/of遍历到的

```js
var a = {
    [Symbol()]: "haha",
    one: "hello"
};
Object.defineProperties(a, {
    two: {enumerable: false, value: 2},
});

Object.keys(a);   // ["one"]
Object.getOwnPropertyNames(a);     // ["one", "two"]
Object.getOwnPropertySymbols(a);   // [Symbol()]
Reflect.ownKeys(a);                // ["one", "two", Symbol()]
```

- `Object.keys`：获取自身上的可枚举属性
- `Object.getOwnPropertyNames`：获取自身上的属性
- `Object.getOwnPropertySymbols`: 获取自身上的Symbol属性
- `Reflect.ownKeys(a)`