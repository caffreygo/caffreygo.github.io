# Provider

在模块中使用 **providers** 声明提供者，提供者需要被注册到模块的服务容器中，才可被依赖注入。

- 提供者使用 **@Injectable()** 装饰器定义，这样系统会分析 **constructor** 进行依赖注入
- 提供者在模块的 **providers** 属性中定义，用于注册到服务容器中，用于被其他类依赖注入
- 提供者可以在自身的 constructor 构造函数中依赖注入其他服务提供者，需要使用 **@Injectable()** 装饰器声明该提供者
- 注册到容器的提供者，默认只对当前模块有效，即作用域为模块
- 可以使用 **exports** 导出给其他模块使用
- 提供者是单例的
- 提供者可以是任何值，而不仅仅是服务类

> 提供者在模块的**providers**属性中声明，有多种将提供者注册到容器的方法

## 基本数据

我们也可以将普通数据使用 useValue 注册到服务容器

```typescript
@Module({
  providers: [{
    provide: 'APP_NAME',
    useValue: 'static text',
  }],
})
```

因为普通数据服务不是**class**，所以要使用**@Inject**进行注入

```typescript
@Injectable()
export class AuthService {
  constructor(
    @Inject('APP_NAME')
    private appName,
  ) {}
  show() {
    return this.appName
  }
  ...
}
```

## 类注册

使用类将提供者注册到服务容器是最常用的方式。

### 基本使用

下面是常用的使用类将提供者注册到容器的方式

```typescript
@Module({
  providers: [AuthService],
})
```

以上是简写形式，完整写法应该如下

```typescript
@Module({
  providers: [{
    provide: AuthService,
    useClass: AuthService,
  }],
})
```

### 动态注册

下面实现根据不同的环境创建不同的服务，首先安装 **dotenv** 扩展包，用来读取**.env**环境变量。

```shell
pnpm add dotenv
```

然后创建两个服务 **app.service.ts** 与 **jc.service.ts**

appService.ts 内容

```typescript
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "app getHello";
  }
}
```

jc.service.ts 内容

```typescript
import { Injectable } from "@nestjs/common";

@Injectable()
export class JcService {
  getHello(): string {
    return "jc getHello";
  }
}
```

然后在模块中根据环境变量动态设置服务

```typescript
import { Module } from "@nestjs/common";
import { config } from "dotenv";
import path from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { JcService } from "./jc.service";

//读取.env 到 process.env 环境变量中
config({ path: path.join(__dirname, "../.env") });

const appService = {
  provide: AppService,
  useClass: process.env.NODE_ENV === "development" ? AppService : JcService,
};

@Module({
  imports: [],
  controllers: [AppController],
  providers: [appService],
})
export class AppModule {}
```

## 工厂函数

针对于复杂要求的**provider** ，我们可以使用 **useFactory** 工厂函数对提供者进行注册。

### 基本使用

下面使用工厂函数注册基本数据

```typescript
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

class JrClass {
  make() {
    return "this is JrClass Make Method";
  }
}

@Module({
  providers: [
    AuthService,
    JrClass,
    {
      provide: "JR",
      //依赖注入其他提供者,将做为参数传递给 useFactory 方法
      inject: [JrClass],
      useFactory: (JrClass) => {
        return JrClass.make();
      },
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
```

在其他服务中使用定义的 HD 提供者

```typescript
@Injectable()
export class AuthService {
  constructor(
    @Inject('JR')
    private jr
  ) {}
  show() {
    return this.jr
  }
  ...
}
```

### 动态配置

下面使用工厂函数实现根据.env 环境变量值，加载不同配置项。

首先创建 `config/development.config.ts` 与 `config/production.config.ts` 配置文件

development.config.ts

```typescript
export const devConfig = {
  url: "localhost",
};
```

production.config.ts

```typescript
export const productionConfig = {
  url: "google.com",
};
```

然后在模块中使用 useFactory 动态注册配置

```typescript
import { Module } from "@nestjs/common";
import { config } from "dotenv";
import path from "path";
import { AppController } from "./app.controller";
import { devConfig } from "./config/development.config";
import { productionConfig } from "./config/production.config";
config({ path: path.join(__dirname, "../.env") });

const configService = {
  provide: "config",
  useFactory() {
    return process.env.NODE_ENV === "development"
      ? devConfig
      : productionConfig;
  },
};
@Module({
  imports: [],
  controllers: [AppController],
  providers: [appService, configService],
})
export class AppModule {}
```

## 服务导出

默认情况下服务只在当前模块有效，如果服务要供其他模块使用，需要在该服务所在模块的 **exports** 属性中声明导出。

### 导出服务

下例是将 jc.module.ts 模块的服务 JcService 导出给其他模块使用。

```typescript
import { Module } from "@nestjs/common";
import { JcService } from "./jc.service";
import { JcController } from "./jc.controller";

@Module({
  providers: [JcService],
  controllers: [JcController],
  exports: [JcService],
})
export class JcModule {}
```

### 导入服务

其他模块需要**imports**导入该模块后,才可以使用该模块导出的服务，下面是 AbModule 模块使用 JcModule 的 JcService 服务的定义。

```typescript
import { JcModule } from "./../jc/jc.module";
import { Module } from "@nestjs/common";
import { AbController } from "./ab.controller";
import { AbService } from "./ab.service";

@Module({
  imports: [JcModule],
  controllers: [AbController],
  providers: [AbController],
})
export class AbModule {}
```

## 异步提供者

我们也可以注册异步提供者，用于对异步业务的处理。

### 声明导出

下面在 **JcModule** 模块中定义异步提供者 **AbAsyncService**

```typescript
import { Module } from "@nestjs/common";
import { JcController } from "./jc.controller";
import { JcService } from "./jc.service";

@Module({
  imports: [],
  controllers: [JcController],
  providers: [
    JcService,
    {
      provide: "JcAsyncService",
      useFactory: async () => {
        return new Promise((r) => {
          setTimeout(() => {
            r("Jc Async Service");
          }, 3000);
        });
      },
    },
  ],
  // 暴露给外部使用
  exports: [JcService, "JcAsyncService"],
})
export class JcModule {}
```

### 使用提供者

然后在 **AbModule** 中使用 **JcModule** 模块导出的 **JcAsyncService**

```typescript
import { Module } from "@nestjs/common";
import { JcModule } from "./../jc/jc.module";
import { AbController } from "./ab.controller";
import { AbService } from "./ab.service";

@Module({
  imports: [JcModule],
  providers: [AbService],
  controllers: [AbController],
  exports: [AbService],
})
export class AbModule {}
```

现在就可以在 **AbModule** 模块的控制器中使用 JcAsyncService 服务了

```typescript
import { Controller, Get, Inject } from "@nestjs/common";

@Controller("ab")
export class AbController {
  constructor(
    @Inject("AbAsyncService")
    private readonly abAsyncService: string
  ) {}
  @Get()
  show() {
    return this.abAsyncService;
  }
}
```
