# 笔记

## 命名空间与编译打包

### 命名空间

📗 TypeScript 像其他编程语言一样，存在命名空间（namespace）的概念。

> https://github.com/caffreygo/demoFolder

当我们定义以下同名变量时是不允许的，这种情况可以通过命名空间解决

```typescript
let name: string = 'helloworld'
let name: string = 'google.com'
```

下面是使用**命名空间**将变量隔离

- 数据需要使用 export 导出才可以使用
- 子命名空间也需要 export 后才可以使用

```typescript
namespace User {
    export let name: string = 'helloworld'
}
namespace Member {
    let name: string = 'google.com'
}

console.log(User.name);

console.log(Member.name); //报错，因为没有使用 export 将变量导出
```

命名空间支持嵌套

```typescript
namespace User {
    export let name: string = 'helloworld'
    export namespace Member {
        export let name: string = 'google.com'
    }
}

console.log(User.name);
console.log(User.Member.name); //google.com 获取子命名空间中的数据 
```

### 单独编译

下面将每个 ts 文件单独进行编译，然后在 html 文件中依次引入

首先创建 tsconfig.js

```shell
tsc --init
```

然后执行文件监测

```shell
tsc -w
```

下面我们创建`user.ts`模块文件

```typescript
namespace User {
    export let name: string = 'helloworld'
}
namespace Member {
    export let name: string = 'google.com'
}
```

在 index.ts 文件中定义业务内容，即使用 User.ts 中的数据 User.name

```typescript
console.log(User.name);
```

然后执行编译

```shell
tsc -w
```

创建hd.html 文件引入这两个 JS 文件，注意要将 namespace.js 文件先引入

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>helloworld</title>
        <script src="user.js" defer></script>
        <script src="index.js" defer></script>
    </head>
    <body></body>
</html>
```

### 合并打包

📗 上面的多文件处理方式非常不方便，如果有**多个文件**要写多个 script 标签来引入。

下面是通过命令将多个文件进行打包

```shell
tsc --outFile ./dist/app.js user.ts index.ts
```

然后在 hd.html 文件引入打包好的文件

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>helloworld</title>
        <script src="dist/app.js" defer></script>
    </head>
    <body></body>
</html>
```

### reference

📗 如果存在多个文件都像上面一样在命令行填写，显然是很麻烦了。我们可以使用以下方法优化在 index.ts 中使用 `reference` 引入依赖的文件

```typescript
/// <reference path="user.ts"/>
console.log(User.name);
```

然后使用下面的命令编译到一个文件中

```shell
tsc --outFile ./dist/app.js index.ts 
```

然后访问 hd.html

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>helloworld</title>
        <script src="dist/app.js" defer></script>
    </head>
    <body></body>
</html>
```

### amd

🔰 使用 amd 模块打包较上面的打包方式**方便**些，因为我们可以在代码中使用 js 模块的 export/import 语法

::: tip 

1. ts代码的书写正常使用es6规范的import/export，然后将tsconfig的打包输出方式更改为amd。
2. tsc执行编译命令将ts文件编译为amd模块代码
3. 页面引入require.js，然后使用正确require amd `require(['App'])`即可

:::

首先创建 ts配置文件 tsconfig.js

```shell
tsc --init
```

然后修改配置项

```json
...
"module": "amd" 
...
```

然后创建user.ts，并且只导出 User类

```typescript
export namespace User {
    export let name: string = 'helloworld'
}
export namespace Member {
    export let name: string = 'google.com'
}
```

在index.ts 文件中import导入 ts 的User模块

```typescript
import { User } from "./user";
```

然后执行命令进行编译

```shell
tsc --outFile ./dist/app.js   
```

然后修改 hd.html 文件内容，因为是 amd 模块所以需要使用 require.js 处理。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script src="https://cdn.bootcdn.net/ajax/libs/require.js/2.3.6/require.min.js"></script>
  </head>
  <body>
    <script src="dist/app.js"></script>
    <script>
      require(['App'])
      require(['User'], User => {
        console.log(User.title)
      })
    </script>
  </body>
</html>
```