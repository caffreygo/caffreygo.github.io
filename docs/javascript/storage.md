# 存储

## cookie

::: tip cookie

​		本身用于浏览器和server通讯，被‘借用’到本地存储

​		前端可通过document.cookie = '...' 来修改

:::

```js
document.cookie = 'a=100';
document.cookie = 'b=200';
document.cookie = 'a=300';

console.log(document.cookie) // a=300;b=200
```

只要页面不清除，页面刷新cookie仍然存在

**缺点**：

- 最大为4kb
- http请求时需要发送到服务端，增加请求数据量
- 只能通过document.cookie = '...' 来修改

## lcoalStorage/sessionStorage

::: tip lcoalStorage和sessionStorage

​		HTML5专门为存储而设计，最大可存5M

​		API简单易用 setTtem getItem

​		不会随着请求被发送出去

:::

```js
localStorage.setItem('a', 100)
localStorage.getItem('a')        // "100"

sessionStorage.setItem('b', '200')
sessionStorage.getItem(b)        // "200"
```

- localStorage数据会永久存储，除非代码或者手动删除
- sessionStorage数据只存在于当前会话，浏览器关闭则清空
- 一般用localStorage会多一些（方便下次访问）

## 区别

1. 容量
2. API易用性
3. 是否跟随http请求发送出去 