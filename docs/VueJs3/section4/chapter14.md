# 内建组件和模块

## KeepAlive 组件的实现原理

### 组件的激活与失活

::: tip KeepAlive 

KeepAlive 一词借鉴于 HTTP 协议。在 HTTP 协议中，KeepAlive 又称 HTTP 持久连接（HTTP persistent connection），其作用是允许多个请求或响应共用一个 TCP 连接。在没有 KeepAlive 的情况下，一个 HTTP 连接会在每次请求/响应结束后关闭，当下一次请求发生时，会建立一个新的 HTTP 连接。频繁地销毁、创建 HTTP 连接会带来额外的性能开销，KeepAlive 就是为了解决这个问题而生的。

:::

HTTP 中的 KeepAlive 可以避免连接频繁地销毁/创建，与 HTTP 中的 KeepAlive 相似，Vue.js 内建的 KeepAlive 组件可以**避免一个组件被频繁地销毁/重建**。

:::: code-group
::: code-group-item Tab 组件

```html
<template>
    <Tab v-if="currentTab === 1"></Tab>
    <Tab v-if="currentTab === 2"></Tab>
    <Tab v-if="currentTab === 3"></Tab>
</template>
```

模板内根据 `currentTab` 的值不同，会渲染不同的 `<Tab>` 组件。当用户频繁地切换 Tab 时，会导致不停地卸载并重建对应的 `<Tab>`  组件。为了避免因此产生的性能开销，可以使用 KeepAlive 组件来解决这个问题。

:::

::: code-group-item Transition

```html
<template>
    <KeepAlive>
        <Tab v-if="currentTab === 1"></Tab>
        <Tab v-if="currentTab === 2"></Tab>
        <Tab v-if="currentTab === 3"></Tab>
    </KeepAlive>
</template>
```

KeepAlive 能够避免频繁的创建和销毁，因而会极大地优化对用户的操作响应，有其是大组件场景下。

:::

::::

> KeepAlive 的本质是缓存管理，再加上特殊的挂载/卸载逻辑