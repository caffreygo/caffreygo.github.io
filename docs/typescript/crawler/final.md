# Express项目改良

## 创建控制器和装饰器

```sh
npm install reflect-metadata --save
```

```sh
|-- src
|   |-- controller
|   |   |-- decorators.ts
|   |   |-- LoginController.ts
```

```typescript
// LoginController.ts
import 'reflect-metadata';
import { Request, Response, response } from 'express';
import { controller, get } from './decorators';
import { getResponseData } from '../utils/util';

interface BodyRequest extends Request {
  body: { [key: string]: string | undefined };
}

@controller
class LoginController {
  @get('/logout')
  loginout(req: BodyRequest, res: Response) {
    if (req.session) {
      req.session.login = undefined;
    }
    res.json(getResponseData(true));
  }

  @get('/')
  home(req: BodyRequest, res: Response) {
    const isLogin = req.session ? req.session.login : false;
    if (isLogin) {
      res.send(`
      <html>
        <body>
          <a href='/getData'>爬取内容</a>
          <a href='/showData'>展示内容</a>
          <a href='/logout'>退出</a>
        </body>
      </html>
    `);
    } else {
      res.send(`
      <html>
        <body>
          <form method="post" action="/login">
            <input type="password" name="password" />
            <button>登陆</button>
          </form>
        </body>
      </html>
    `);
    }
  }
}
```

```typescript
export function controller(target: any) {
  for (let key in target.prototype) {
    // 获取'path',从target.prototype中的key上获取
    console.log(Reflect.getMetadata('path', target.prototype, key));
  }
}

export function get(path: string) {
  return function(target: any, key: string) {
    // 存的key是'path',值是传入的path,存到target的key上
    Reflect.defineMetadata('path', path, target, key);
  };
}
```

```json
  "scripts": {
    "test": "tsc && node ./build/controller/LoginController.js"
  }
```

- 将方法所对应的路径，使用get这个方法装饰器，通过**reflect-metadata**绑定到方法上；
- 在**LoginController**这个类上添加**controller**类装饰器，获取到对应方法的**path**元数据值；

## 装饰器实现项目路由

1. 在装饰器内添加生成路由的逻辑

   ```typescript
   import { Router } from 'express';
   // 导出路由
   export const router = Router();
   
   export function controller(target: any) {
     for (let key in target.prototype) {
       const path = Reflect.getMetadata('path', target.prototype, key);
       // 拿到对应的方法
       const handler = target.prototype[key];
       if (path) {
         // 生成路由，放到了router下面
         router.get(path, handler);
       }
     }
   }
   
   export function get(path: string) {
     return function(target: any, key: string) {
       Reflect.defineMetadata('path', path, target, key);
     };
   }
   ```

2. 引入LoginController类生成路由

   ```typescript
   // index.ts
   import './controller/LoginController';          // 生成路由
   import { router } from './controller/decorators';       // 导出路由
   ```

   在index.ts中引入LoginController类，装饰器在类声明时执行，相当于执行了这个装饰器，得到了router

3. 运行

   ```sh
   npm run dev
   ```

   访问根路径（’/‘）和（’login‘）正常返回


## 多种请求方法装饰器

- 增加method元数据区分各类请求方法
- Method枚举类型解决method的any报错
- getRequestDecorator工厂函数生成各种方法装饰器

```typescript
// decorators.ts
import { Router } from 'express';
export const router = Router();

enum Method {
  get = 'get',
  post = 'post',
  put = 'put',
  delete = 'delete'
}

export function controller(target: any) {
  for (let key in target.prototype) {
    const path = Reflect.getMetadata('path', target.prototype, key);
    const method: Method = Reflect.getMetadata('method', target.prototype, key);
    const handler = target.prototype[key];
    if (path && method && handler) {
      router[method](path, handler);
    }
  }
}

function getRequestDecorator(type: string) {
  return function(path: string) {
    return function(target: any, key: string) {
      Reflect.defineMetadata('path', path, target, key);
      Reflect.defineMetadata('method', type, target, key);
    };
  };
}

export const get = getRequestDecorator('get');
export const post = getRequestDecorator('post');
export const put = getRequestDecorator('put');
export const del = getRequestDecorator('delete');  // delete是关键字用del
```

```typescript
// LoginController.ts
import 'reflect-metadata';
import { Request, Response } from 'express';
import { controller, get, post } from './decorators';
import { getResponseData } from '../utils/util';

interface BodyRequest extends Request {
  body: { [key: string]: string | undefined };
}

@controller
class LoginController {
  @post('/login')
  login(req: BodyRequest, res: Response) {
    const { password } = req.body;
    const isLogin = req.session ? req.session.login : false;
    if (isLogin) {
      res.json(getResponseData(false, '已经登陆过'));
    } else {
      if (password === '123' && req.session) {
        req.session.login = true;
        res.json(getResponseData(true));
      } else {
        res.json(getResponseData(false, '登陆失败'));
      }
    }
  }

  @get('/logout')
  logout(req: BodyRequest, res: Response) {
	...
  }

  @get('/')
  home(req: BodyRequest, res: Response) {
    ...
  }
}
```

