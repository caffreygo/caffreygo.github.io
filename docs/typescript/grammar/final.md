# TypeScript高级语法

## 类的装饰器

环境搭建

```shell
npm init -y
tsc --init
npm install ts-node -D
npm install typescript --save
```

**装饰器**：对类修饰的工具

- 装饰器本身是一个函数

- 类装饰器接收的参数是constructor
- 类的装饰器通过@decorator使用

```typescript
function testDecorator(constructor: any) {
  constructor.prototype.getName = () => {
    console.log('caffrey');
  };
}

@testDecorator
class Test {}

const test = new Test();
// 这种方式下getName无法提示/报错： test.getName()
(test as any).getName();     // caffrey
```

Error: 对修饰器的实验支持是一项将在将来版本中更改的功能。

设置 "experimentalDecorators" 选项以删除此警告,需要修改**tsconfig.json**文件

```json
"experimentalDecorators": true,
"emitDecoratorMetadata": true 
```

- #### 装饰器的运行时刻

  在类创建好之后立即执行，而不是在实例创建时。是对类的修饰，而不是对实例修饰

- #### 多个装饰器的使用

多次类的装饰，顺序从下往上（从右到左）

```typescript
function testDecorator(constructor: any) {
  console.log('decorator');
}

function testDecorator1(constructor: any) {
  console.log('decorator1');
}

@testDecorator
@testDecorator1
class Test {}

const test = new Test();    // decorator1     decorator
```

- #### 工厂函数实现逻辑判断

通过函数返回类装饰器，使用： @decorator()

```typescript
function decorator(flag: boolean) {
  if (flag) {
    return function testDecorator(constructor: any) {
      constructor.prototype.getName = () => {
        console.log('caffrey');
      };
    };
  }
  return function testDecorator(constructor: any) {};
}

@decorator(true)
class Test {}

const test = new Test();
test as any).getName();    // @decorator(false)下已经getName没有这个方法
```

问题：`getName`方法没有类型提示

- #### 类装饰器合理写法

```typescript
new (...args: any[]) => any
```

构造函数（new），这个函数的返回值是any，这个函数接收很多个的参数，参数的每一项都是any类型

```typescript
function decorator<T extends new (...args: any[]) => any>(constructor: T) {}
```

这个T类型可以通过这种类型的构造函数被实例化出来，T可以理解为一个类，或者说一个包含构造函数这样的一个东西，当constructor是T类型的时候，**肯定会有构造函数**。

```typescript
function testDecorator<T extends new (...args: any[]) => any>(constructor: T) {
  return class extends constructor {
    name = 'new caffrey';
    getName() {
      return this.name;
    }
  };
}

@testDecorator
class Test {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const test = new Test('caffrey');
console.log(test);               //  class_1 { name: 'new caffrey' }
console.log((test as any).getName());      // new caffrey
```

- `@testDecorator`可以对原来的构造函数进行扩展
- 先执行原来的构造函数`this.name = name`，然后再执行`name = 'new caffrey'`

- constructor的类型是一个泛型，这个泛型可以通过实例化创建一个类，

  类里面应该包含一个`new (...args: any[]) => any`这样的构造函数

- #### 语法提示的实现

此时test实例里面还是没有`getName`方法，可以通过工厂模式解决，语法提示

```typescript
function testDecorator() {
  return function<T extends new (...args: any[]) => any>(constructor: T) {
    return class extends constructor {
      name = 'new caffrey';
      getName() {
        return this.name;
      }
    };
  };
}

const Test = testDecorator()(
  class {
    name: string;
    constructor(name: string) {
      this.name = name;
    }
  }
);

const test = new Test('caffrey');
console.log(test.getName());
```

## 方法装饰器

类里面方法的装饰器也是在类执行的时候立即对其进行修改

```typescript
function getNameDecortor(target: any, key: string) {
  console.log(target, key);
}

class Test {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  @getNameDecortor
  getName() {
    return this.name;
  }
}

// 执行结果： Test { getName: [Function] } getName
```

```typescript
function getNameDecortor(target: any, key: string) {
  console.log(target, key);
}

class Test {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  @getNameDecortor
  static getName() {
    return 'static';
  }
}

// 执行结果： [Function: Test] { getName: [Function] } getName
```

**参数**：`target: any, key: string, descriptor: PropertyDescriptor`

参数类似于

[Object.definePropert]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty	"Object.definePropert"

1. key是装饰的方法的名字
2. 普通方法： target对应类的prototype
3. 静态方法： target对应类的构造函数
4. descriptor：属性配置

- #### descriptor实现被修饰的方法不允许被重写

```typescript
function getNameDecorator(
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) {
  descriptor.writable = false;
}

class Test {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  @getNameDecorator
  getName() {
    return this.name;
  }
}

const test = new Test('caffrey');
test.getName = () => {
  return '123';
};
console.log(test.getName());
```

此时执行`npm run dev`报错：

`Cannot assign to read only property 'getName' of object '#<Test>'`

- #### descriptor修改方法原始值

```typescript
function getNameDecorator(
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) {
  descriptor.value = function() {
    return 'descriptor';
  };
}

class Test {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  @getNameDecorator
  getName() {
    return this.name;
  }
}

const test = new Test('caffrey');
console.log(test.getName());      // 修改getName的定义，返回值：descriptor
```

## 访问器的装饰器

参数： (类的prototype, 装饰的访问器的名字，访问器的PropertyDescriptor)

```typescript
function visitDecorator(
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) {
  descriptor.writable = false;
}

class Test {
  private _name: string;
  constructor(name: string) {
    this._name = name;
  }
  get name() {
    return this._name;
  }
  @visitDecorator
  set name(name: string) {
    this._name = name;
  }
}

const test = new Test('caffrey');
test.name = '123123'; // setter (setter修改报错)
console.log(test.name); // getter
```

和方法的装饰器一样，`descriptor.writable = false;`将禁止访问器的重写，报错：

 `Invalid property descriptor. Cannot both specify accessors and a value or writable attribute, #<Object>`

- 注意set和get不能用同名的decorator

## 属性装饰器

```typescript
function nameDecorator(target: any, key: string) {
  console.log(target, key);        // Test {} name
}

class Test {
  @nameDecorator
  name = 'caffrey';
}

const test = new Test();
test.name = 'new name';
console.log(test.name);       //  new name
```

类的属性装饰器只能接收**两个参数**：（类的prototype，修饰的属性的名字）

- #### 属性装饰器的descriptor

此时属性是可以被修改，在没有descriptor的属性装饰器中，可以通过以下方法来实现：

```typescript
function nameDecorator(target: any, key: string): any {
  const descriptor = { writable: false };
  return descriptor;
}

class Test {
  @nameDecorator
  name = 'caffrey';
}

const test = new Test();
test.name = 'new name';
console.log(test.name);
```

需要给装饰器加上函数返回类型（void | any）,否则会报错：属性修饰器函数的返回类型必须为 "void" 或 "any"。作为表达式调用时，无法解析属性修饰器的签名。

**禁止重写**后报错：`Cannot assign to read only property 'name' of object '#<Test>'`

::: tip Tips

​	装饰器内创建并且返回一个descriptor，这个descriptor会替换掉原始属性的descriptor

:::

- #### 修改原型上的属性值

::: tip Tips

​	使用属性装饰器没有办法修改属性的值，这个属性是直接声明在类对应的实例上的

:::

```typescript
// 修改的并不是实例上的name,而是原型上的name
function nameDecorator(target: any, key: string): any {
  target[key] = 'hello';
}

class Test {
  @nameDecorator
  name = 'caffrey';
}

const test = new Test();
console.log(test.name);                       // caffrey
console.log((test as any).__proto__.name);    // hello
```

此时name是在类对应的实例上，而装饰器修改的是类的prototype上的name,会先在实例上属性上寻找

## 参数装饰器

类方法的参数的装饰器

参数：（类的**原型**，被修饰的参数**方法**的名字，参数**位置**）

```typescript
function paramDecorator(target: any, key: string, paramIndex: number) {
  console.log(target, key, paramIndex);    // Test { getInfo: [Function] } getInfo 0
}

class Test {
  getInfo(@paramDecorator name: string, age: number) {
    console.log(name, age);    // caffrey 24
  }
}

const test = new Test();
test.getInfo('caffrey', 24);
```

## 实际使用例子

```typescript
const userInfo: any = undefined;


class Test {
  getName() {
    try {
      return userInfo.name;
    } catch (e) {
      console.log('userInfo.name 不存在');
    }
  }
  getAge() {
    try {
      return userInfo.age;
    } catch (e) {
      console.log('userInfo.age 不存在');
    }
  }
}

const test = new Test();
test.getName();
```

```typescript
// 装饰器
const userInfo: any = undefined;

function catchError(target: any, key: string, descriptor: PropertyDescriptor) {
  const fn = descriptor.value;
  descriptor.value = function() {
    try {
      fn();
    } catch (e) {
      console.log('userInfo存在问题');
    }
  };
}

class Test {
  @catchError
  getName() {
    return userInfo.name;
  }
  @catchError
  getAge() {
    return userInfo.age;
  }
}

const test = new Test();
test.getName();     // userInfo存在问题
test.getAge();     // userInfo存在问题
```

进一步优化，通过函数返回装饰器，可传递参数

```typescript
const userInfo: any = undefined;

function catchError(msg: string) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = function() {
      try {
        fn();
      } catch (e) {
        console.log(msg);
      }
    };
  };
}

class Test {
  @catchError('userInfo.name不存在')
  getName() {
    return userInfo.name;
  }
  @catchError('userInfo.age不存在')
  getAge() {
    return userInfo.age;
  }
}

const test = new Test();
test.getName();      // userInfo.name不存在
test.getAge();       // userInfo.age不存在
```

## reflect-metadata

[github]: https://github.com/rbuckton/reflect-metadata	"github"

存储一些额外的数据（元数据），无法打印获取

```sh
npm install reflect-metadata --save
```

```typescript
// 对象上定义/获取元数据
import 'reflect-metadata';

const user = {
  name: 'caffrey'
};

Reflect.defineMetadata('data', 'test', user);

console.log(user);                                   // { name: 'caffrey' }
console.log(Reflect.getMetadata('data', user));      // test
```

常用于类上定义/获取元数据

```typescript
import 'reflect-metadata';

@Reflect.metadata('data', 'test')
class User {
  name = 'caffrey';
}

console.log(Reflect.getMetadata('data', User));    // test
```

定义在类的属性上

```typescript
import 'reflect-metadata';

class User {
  @Reflect.metadata('data', 'test')
  name = 'caffrey';
}

console.log(Reflect.getMetadata('data', User.prototype, 'name'));      // test
```

定在类的方法上

```typescript
import 'reflect-metadata';

class User {
  name = 'caffrey';

  @Reflect.metadata('data', 'test')
  getName() {
    return this.name;
  }
}

console.log(Reflect.getMetadata('data', User.prototype, 'getName'));         // test
console.log(Reflect.hasMetadata('data', User.prototype, 'getName'));         // true
console.log(Reflect.hasMetadata('data', Teacher.prototype, 'getName'));      // true
console.log(Reflect.hasOwnMetadata('data', Teacher.prototype, 'getName'));   // false

// 获取类上方法的元数据有哪些
console.log(Reflect.getMetadataKeys(User.prototype, 'getName'));
console.log(Reflect.getMetadataKeys(Teacher.prototype, 'getName'));
console.log(Reflect.getOwnMetadataKeys(User.prototype, 'getName'));
// [ 'design:returntype', 'design:paramtypes', 'design:type', 'data' ]

console.log(Reflect.getOwnMetadataKeys(Teacher.prototype, 'getName'));       // []

// deleteMetadata删除
```

## 装饰器的执行顺序

```typescript
import 'reflect-metadata';

// 类的构造器target：类的构造函数
function showData(target: typeof User) {
  for (let key in target.prototype) {
    const data = Reflect.getMetadata('data', target.prototype, key);
    console.log(data);
  }
}

@showData
class User {
  @Reflect.metadata('data', 'name')
  getName() {}

  @Reflect.metadata('data', 'age')
  getAge() {}
}
```

执行结果

```shell
name
age
```

类里面方法的装饰器是优先于类的装饰器执行的，这里`@Reflect.metadata`先绑定了方法上的元数据，然后才能被类上的装饰器读取到元数据。

::: tip 

​		类的装饰器是最后执行的

​		而方法上的装饰器是优先执行的

:::

```typescript
import 'reflect-metadata';

// 类的构造器target：类的构造函数
function showData(target: typeof User) {
  for (let key in target.prototype) {
    const data = Reflect.getMetadata('data', target.prototype, key);
    console.log(data);
  }
}

function setData(dataKey: string, data: string) {
  // 方法的构造器就是类的prototype
  return function(target: User, key: string) {
    Reflect.defineMetadata(dataKey, data, target, key);
  };
}

@showData
class User {
  @setData('data', 'name')
  getName() {}

  @setData('data', 'age')
  getAge() {}
} 
// name
// age
```

