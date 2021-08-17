# TypeScript 编写爬虫工具

## 初始化

```sh
// 生成package.json
npm init -y
// tsconfig.json
tsc --init
// 卸载全局ts-node
npm uninstall ts-node -g
// 安装ts-node typescript在dev环境
npm install -D ts-node
npm install typescript -D
```

- 新建 src 下的 crawler.ts

```js
console.log('test');
```

- 更改 package.json 中的执行语句

```js
  "scripts": {
    "dev": "ts-node ./src/crawler.ts"
  }
```

- 测试

```powershell
PS E:\typescript\crawler> npm run dev

> crawler@1.0.0 dev E:\typescript\crawler
> ts-node ./src/crawler.ts

hello world
```

```typescript
class Crawler {
  private secret = 'secretKey';
  private url = `
    http://www.dell-lee.com/typescript/demo.html?secret?=${this.secret}
  `;
  constructor() {
    console.log('constructor');
  }
}

// secret是类里面的一个属性，需要通过this获取
const crawler = new Crawler();
```

## SuperAgent

superagent 可以获取到远程网址上的 html

```sh
npm install superagent --save
```

- --save：dependencies 生产环境用到的模块
- --–save-dev： devDependencies 开发环境模块（-D）

### 类型定义文件@types

TypeScript 引用 JavaScript 会报错，且无法提供只能提醒

```typescript
import Superagent from 'superagent';
```

需要提供 **.d.ts** 的翻译文件,将 **js** 文件里面的类型文件进行补全

**ts => .d.ts 翻译文件 @types/ => js**

```powershell
无法找到模块“superagent”的声明文件。“e:/typescript/crawler/node_modules/superagent/lib/node/index.js”隐式拥有 "any" 类型。
  Try `npm install @types/superagent` if it exists or add a new declaration (.d.ts) file containing `declare module 'superagent';`ts(7016)
```

解决：在开发环境下引入翻译文件

```sh
npm install @types/superagent -D
```

### Htmt 获取的实现

```typescript
import Superagent from 'superagent';

class Crawler {
  private secret = 'secretKey';
  private url = `http://www.dell-lee.com/typescript/demo.html?secret?=${this.secret}`;
  private rawHtml = '';

  async getRawHtml() {
    const result = await Superagent.get(this.url);
    this.rawHtml = result.text;
  }

  constructor() {
    this.getRawHtml();
  }
}

const crawler = new Crawler();
```

## cheerio 数据获取

### cheerio 库引入

cheerio 可以读取 html 字符串，让我们能够以 jQuery 的方式操作获取数据

```shell
npm install cheerio --save
npm install @types/cheerio -D
```

### 代码实现

cheerio 中的 map((index,element)=>{})方法的参数和 JS 的 map((element,index)=>{})方法参数相反

```javascript
// https://cheerio.js.org/ 文档实例
$('li')
  .map(function(i, el) {
    // this === el
    return $(this).text();
  })
  .get()
  .join(' ');
//=> "apple orange pear"
```

```typescript
import superagent from 'superagent';
import cheerio from 'cheerio';

interface Course {
  title: string;
  count: number;
}

class Crowller {
  private secret = 'secretKey';
  private url = `http://www.dell-lee.com/typescript/demo.html?secret=${this.secret}`;

  getCourseInfo(html: string) {
    const $ = cheerio.load(html);
    const courseItems = $('.course-item');
    const courseInfo: Course[] = [];

    courseItems.map((index, ele) => {
      const descs = $(ele).find('.course-desc');
      const title = descs.eq(0).text();
      const count = parseInt(
        descs
          .eq(1)
          .text()
          .split('：')[1],
        10
      );
      courseInfo.push({
        title: title,
        count: count,
      });
    });

    const result = {
      time: new Date().getTime(),
      data: courseInfo,
    };

    console.log(result);
  }

  async getRawHtml() {
    const result = await superagent.get(this.url);
    this.getCourseInfo(result.text);
  }

  constructor() {
    this.getRawHtml();
  }
}

const crowller = new Crowller();
```

### 结果

```powershell
> ts-node ./src/crawler.ts

{
  time: 1582818112855,
  data: [
    { title: 'Vue2.5开发去哪儿网App', count: 18 },
    { title: 'React 16.4 开发简书项目', count: 74 },
    { title: 'React服务器渲染原理解析与实践', count: 10 },
    { title: '手把手带你掌握新版Webpack4.0', count: 41 }
  ]
}
```

## 组合设计模式优化

### crawler

```typescript
import fs from 'fs';
import path from 'path';
import superagent from 'superagent';
import CaffreyAnalyzer from './specialAnalyzer';

export interface Analyzer {
  analyze: (html: string, filePath: string) => string;
}

class Crowller {
  private filePath = path.resolve(__dirname, '../data/course.json');

  async getRawHtml() {
    const result = await superagent.get(url);
    return result.text;
  }

  private writeFile(content: string) {
    fs.writeFileSync(this.filePath, content);
  }

  async initSpiderProcess() {
    const html = await this.getRawHtml();
    const fileContent = this.analyzer.analyze(html, this.filePath);
    this.writeFile(fileContent);
  }

  constructor(private url: string, private analyzer: Analyzer) {
    this.initSpiderProcess();
  }
}

const secret = 'secretKey';
const url = `http://www.dell-lee.com/typescript/demo.html?secret=${secret}`;

const analyzer = new CaffreyAnalyzer();
new Crowller(url, analyzer);
```

### analyzer.js

- class implements interface

```typescript
import fs from 'fs';
import cheerio from 'cheerio';
import { Analyzer } from './crowller';

interface Course {
  title: string;
  count: number;
}

interface CourseResult {
  time: number;
  data: Course[];
}

interface Content {
  [propName: number]: Course[];
}

export default class CaffreyAnalyzer implements Analyzer {
  getCourseInfo(html: string) {
    const $ = cheerio.load(html);
    const courseItems = $('.course-item');
    const courseInfos: Course[] = [];
    courseItems.map((index, element) => {
      const descs = $(element).find('.course-desc');
      const title = descs.eq(0).text();
      const count = parseInt(
        descs
          .eq(1)
          .text()
          .split('：')[1],
        10
      );
      courseInfos.push({ title, count });
    });
    return {
      time: new Date().getTime(),
      data: courseInfos,
    };
  }

  generateJsonContent(courseInfo: CourseResult, filePath: string) {
    let fileContent: Content = {};
    if (fs.existsSync(filePath)) {
      fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    fileContent[courseInfo.time] = courseInfo.data;
    return fileContent;
  }

  public analyze(html: string, filePath: string) {
    const courseInfo = this.getCourseInfo(html);
    const fileContent = this.generateJsonContent(courseInfo, filePath);
    return JSON.stringify(fileContent);
  }
}
```

## 单例模式实战

### specialAnalyzer.ts

```typescript
import fs from 'fs';
import cheerio from 'cheerio';
import { Analyzer } from './crowller';

interface Course {
  title: string;
  count: number;
}

interface CourseResult {
  time: number;
  data: Course[];
}

interface Content {
  [propName: number]: Course[];
}

export default class CaffreyAnalyzer implements Analyzer {
  // static静态属性，将方法直接挂载在类上面，而不是类的实例上面
  private static instance: CaffreyAnalyzer;

  static getInstance() {
    // 只生成一次
    if (!CaffreyAnalyzer.instance) {
      CaffreyAnalyzer.instance = new CaffreyAnalyzer();
    }
    return CaffreyAnalyzer.instance;
  }
  private getCourseInfo(html: string) {
    const $ = cheerio.load(html);
    const courseItems = $('.course-item');
    const courseInfos: Course[] = [];
    courseItems.map((index, element) => {
      const descs = $(element).find('.course-desc');
      const title = descs.eq(0).text();
      const count = parseInt(
        descs
          .eq(1)
          .text()
          .split('：')[1],
        10
      );
      courseInfos.push({ title, count });
    });
    return {
      time: new Date().getTime(),
      data: courseInfos,
    };
  }

  private generateJsonContent(courseInfo: CourseResult, filePath: string) {
    let fileContent: Content = {};
    if (fs.existsSync(filePath)) {
      fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    fileContent[courseInfo.time] = courseInfo.data;
    return fileContent;
  }

  public analyze(html: string, filePath: string) {
    const courseInfo = this.getCourseInfo(html);
    const fileContent = this.generateJsonContent(courseInfo, filePath);
    return JSON.stringify(fileContent);
  }

  // private私有限制符,只允许内部调用  禁止new 实例
  private constructor() {}
}
```

### 引用

```typescript
const analyzer = CaffreyAnalyzer.getInstance();
new Crowller(url, analyzer);
```

## 编译过程

### 初始配置

将 ts 文件编译为 js 文件，然后运行该文件

```json
"scripts": {
    "dev": "ts-node ./src/crawler.ts"
}
```

打开 **tsconfig.json** 修改编译路径

```json
"outDir": "./build"
```

typescript 文件是不能直接运行的

```powershell
node ./build/crawler.js
//报错
node src/crawler.ts
```

### 自动编译 ts 文件

通过 npm run build 后，如果后续 ts 文件有修改，会自动编译更新 js 文件

```json
"scripts": {
    "build": "tsc -w"
}
```

### 自动执行 js 文件

[nodemon]: https://github.com/remy/nodemon

监控整个项目文件变化后执行动作，安装 nodemon(npm install nodemon -D)

- nodemon 默认不会监测 TypeScript 的文件变化（可配置修改）

```json
"scripts": {
    "build": "tsc -w",
    "start": "nodemon node ./build/crawler.js"
}
```

tips: 第一次运行的 npm run start 的时候会先执行一次，导致生成了 data 文件夹下面的 course.json; 而当前的文件变化又导致了 nodemon 的监测重新执行，如此反复循环运行 craw.js，需要在 package.json 增加 json 配置

```json
"nodemonConfig": {
    "ignore": [
        "data/*"
    ]
}
```

### 合并命令

**concurrently**并行执行命令(npm install concurrently -D)

```json
"scripts": {
    "dev:build": "tsc -w",
    "dev:start": "nodemon node ./build/crawler.js",
    "dev": "concurrently npm run dev:build & npm run dev:start"
}
```

npm:dev:\*相当于 npm run dev: 下的所有命令

```json
"scripts": {
    "dev:build": "tsc -w",
    "dev: start": "nodemon node ./build/crawler.js",
    "dev": "concurrently npm:dev:*"
}
```
