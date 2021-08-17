# Express && 爬虫

## Express基础项目结构搭建

### 改良

使用Express开启一个服务器，让浏览器能够访问服务器上的接口

```json
  "scripts": {
    "dev:build": "tsc -w",
    "dev:start": "nodemon node ./build/index.js",
    "dev": "concurrently npm:dev:*"
  },
```

第一次运行`npm run dev`时，由于build和start是并行运行的，当index.js还未生成，会报错找不到index.js

解决：

```json
  "scripts": {
    "dev:build": "tsc -w",
    "dev:start": "nodemon node ./build/index.js",
    "dev": "tsc && concurrently npm:dev:*"
  },
```

在node执行js的时候先tsc编译一次TS代码

### Express搭建服务器

```sh
npm install express --save
npm install @types/express --D
```

```sh
|-- build
|-- data
|-- node_modules
|-- src
|   |-- crowller.ts
|   |-- dellAnalyzer.ts
|   |-- index.ts
|   |-- router.ts
|-- package-lock.json
|-- package.json
|-- tsconfig.json
```

```typescript
// index.js
import express, { Request, Response } from 'express';
import router from './router';

const app = express();
app.use(router);

app.listen(7001, () => {
  console.log('server is running');
});
```

```typescript
// router.ts
import { Router, Request, Response } from 'express';
import Crowller from './crowller';
import DellAnalyzer from './dellAnalyzer';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('hello world !');
});

router.get('/getData', (req: Request, res: Response) => {
  const secret = 'secretKey';
  const url = `http://www.dell-lee.com/typescript/demo.html?secret=${secret}`;
  const analyzer = DellAnalyzer.getInstance();
  new Crowller(url, analyzer);
  res.send('getData Success!');
});

export default router;
```

### TS编写express代码

现在每次访问getData接口，就会生成新数据，为了防止过多的访问刷新，增加权限

```typescript
router.post('/getData', (req: Request, res: Response) => {
  if (req.body.password === '123') {
    const secret = 'secretKey';
    const url = `http://www.dell-lee.com/typescript/demo.html?secret=${secret}`;
    const analyzer = DellAnalyzer.getInstance();
    new Crowller(url, analyzer);
    res.send('getData Success!');
  } else {
    res.send('password Error!');
  }
});
```

req.body返回值是undefined,然而编辑器中虽然引入了.d.ts文件，却没有报错。需要有body-parse这个express中间件`npm install body-parse --save`，中间件使用app.use(),必须在app.use(router之前)

```typescript
// index.ts
import express, { Request, Response } from 'express';
import bodyParse from 'body-parser';
import router from './router';

const app = express();
app.use(bodyParse.urlencoded({ extended: false }));
app.use(router);

app.listen(7001, () => {
  console.log('server is running');
});
```

- express库的类型定义文件 .d.ts 文件描述不准确（老框架）
- 当使用中间件的时候，对req res进行了修改，实际上类型并不能改变（例如当对req增加了新属性，但是使用的时候类型没有更新，会报错）

### Express类型定义文件

- .d.ts 文件类型定义不准确

```typescript
const { password } = req.body           // const password: any

// 修改对应.d.ts
ReqBody = { password: string | undefined }        // 随着node module的重新安装就失效了
```

解决：

```typescript
interface RequestWithBody extends Request {
  body: {
  	// password: string | undefined;
    [key: string]: string | undefined;
  };
}
```

- 中间件对req res进行了修改，但是类型不能修改（类型融合）

```typescript
// index.ts
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req: Request, res: Response, next: NextFunction) => {
  req.teacherName = 'dell';
  next();
});
app.use(router);


// custom.d.ts
declare namespace Express {
  interface Request {
    teacherName: string;
  }
}
    
// touter.ts 编辑器提醒
res.send(`${req.teacherName}`);
```

### 登录功能的开发

[cookie-session]: https://github.com/expressjs/cookie-session	"cookie-session"

```sh
npm install cookie-session --save
npm install @types/cookie-session -D
```

```typescript
// router.ts   用户进行登录并且 爬取/展示 数据
import { Router, Request, Response } from 'express';
import Crowller from './crowller';
import DellAnalyzer from './dellAnalyzer';
import fs from 'fs';
import path from 'path';
import { json } from 'body-parser';

interface RequestWithBody extends Request {
  body: {
    [key: string]: string | undefined;
  };
}

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const isLogin = req.session ? req.session.login : false;
  if (isLogin) {
    res.send(`
    <html>
      <body>
        <a href="/getData">爬取内容</a>
        <a href="/showData">展示内容</a>
        <a href="/logout">退出</a>
      </body>
    </html>
  `);
  } else {
    res.send(`
    <html>
      <body>
        <form method="post" action="/login">
          <input type="password" name="password" />
          <button>登录</button>
        </form>
      </body>
    </html>
  `);
  }
});

router.post('/login', (req: RequestWithBody, res: Response) => {
  const { password } = req.body;
  const isLogin = req.session ? req.session.login : false;
  if (isLogin) {
    res.send('已经登录过');
  } else {
    if (password === '123' && req.session) {
      req.session.login = true;
      res.send('登录成功');
    } else {
      res.send('登录失败');
    }
  }
});

router.get('/logout', (req: RequestWithBody, res: Response) => {
  if (req.session) {
    req.session.login = false;
  }
  res.redirect('/');
});

router.get('/getData', (req: RequestWithBody, res: Response) => {
  const isLogin = req.session ? req.session.login : false;
  if (isLogin) {
    const secret = 'secretKey';
    const url = `http://www.dell-lee.com/typescript/demo.html?secret=${secret}`;
    const analyzer = DellAnalyzer.getInstance();
    new Crowller(url, analyzer);
    res.send('getData Success!');
  } else {
    res.send('请登录后爬取内容');
  }
});

router.get('/showData', (req: RequestWithBody, res: Response) => {
  const isLogin = req.session ? req.session.login : false;
  if (isLogin) {
    try {
      const position = path.resolve(__dirname, '../data/course.json');
      const result = fs.readFileSync(position, 'utf8');
      res.json(JSON.parse(result));
    } catch (e) {
      res.send('尚未爬取到内容');
    }
  } else {
    res.send('请登录后查看内容');
  }
});

export default router;
```

```typescript
// index.ts
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import router from './router';

// 问题1: express 库的类型定义文件 .d.ts 文件类型描述不准确
// 问题2: 当我使用中间件的时候，对 req 或者 res 做了修改之后呢，实际上类型并不能改变。

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['caffrey go'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);
app.use(router);

app.listen(7001, () => {
  console.log('server is running');
});
```

- ### 优化

编写和使用自己的业务中间件

```typescript
// router.ts
const checkLogin = (req: Request, res: Response, next: NextFunction) => {
  const isLogin = req.session ? req.session.login : false;
  if (isLogin) {
    next();
  } else {
    res.send('请先登录');
  }
};

//  router.get('/getData', checkLogin, (req: BodyRequest, res: Response) => {...}
```

接口统一

```typescript
// util.ts
interface Result {
  success: boolean;
  errMsg?: string;
  data: any;
}

export const getResponseData = (data: any, errMsg?: string): Result => {
  if (errMsg) {
    return {
      success: false,
      errMsg,
      data
    };
  }
  return {
    success: true,
    data
  };
};

// res.json(getResponseData(false, '数据不存在'));
// res.json(getResponseData(true));
// res.json(getResponseData(JSON.parse(result)));
```

