# WebSocket

::: tip WebSocket

一种网络传输协议，位于`OSI`模型的**应用层**。可在单个`TCP`连接上进行**全双工**通信，能更好的节省服务器资源和带宽并达到实时通迅。

客户端和服务器只需要完成**一次握手**，两者之间就可以创建持久性的连接，并进行双向数据传输。

:::

> 在`websocket`出现之前，开发实时`web`应用的方式为轮询。
>
> 不停地向服务器发送 HTTP 请求，问有没有数据，有数据的话服务器就用响应报文回应。如果轮询的频率比较高，那么就可以近似地实现“实时通信”的效果。
>
> ⚡️ 轮询的缺点也很明显，反复发送无效查询请求耗费了大量的带宽和 `CPU`资源。

## 特点

### 全双工

通信允许数据在两个方向上同时传输，它在能力上相当于两个单工通信方式的结合。

例如指 A→B 的同时 B→A ，是瞬时同步的。

### 二进制帧

采用了二进制帧结构，语法、语义与 HTTP 完全不兼容，相比 `http/2` ，`WebSocket`更侧重于“实时通信”，而`HTTP/2` 更侧重于提高传输效率，所以两者的帧结构也有很大的区别。

不像 `HTTP/2` 那样定义流，也就不存在多路复用、优先级等特性。

自身就是全双工，也不需要服务器推送。

### 协议名

引入 `ws` 和 `wss` 分别代表明文和密文的 `websocket` 协议，且默认端口使用 80 或 443，几乎与 `http` 一致：

```http
ws://www.chrono.com
ws://www.chrono.com:8080/srv
wss://www.chrono.com:445/im?user_id=xxx
```

### 握手

`WebSocket`也要有一个握手过程，然后才能正式收发数据。客户端发送数据格式如下：

```http
GET ws://192.168.10.64:8080/sockjs-node/017/emx2b1pz/websocket HTTP/1.1
Host: 192.168.10.64:8080
✅ Connection: Upgrade
Pragma: no-cache
Cache-Control: no-cache
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36
✅ Upgrade: websocket
Origin: http://localhost:8080
✅ Sec-WebSocket-Version: 13
Accept-Encoding: gzip, deflate
Accept-Language: en,zh;q=0.9,zh-CN;q=0.8
✅ Sec-WebSocket-Key: 5OY3YDN4POGmZrcwSea+PQ==
Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits
```

- `Connection`：必须设置 `Upgrade`，表示客户端希望**连接升级**
- `Upgrade`：必须设置 `Websocket`，表示希望升级到 `Websocket` 协议
- `Sec-WebSocket-Key`：客户端发送的一个 base64 编码的密文，用于简单的认证秘钥。要求服务端必须返回一个对应加密的 `Sec-WebSocket-Accept` 应答，否则客户端会抛出错误，并关闭连接
- `Sec-WebSocket-Version` ：表示支持的 `Websocket` 版本

服务端返回的数据格式：

```http
✅ HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
✅ Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=Sec-WebSocket-Protocol: chat
```

- `HTTP/1.1 101 Switching Protocols`：表示服务端接受 `WebSocket` 协议的客户端连接。
- `Sec-WebSocket-Accep` ：验证客户端请求报文，同样也是为了防止误连接。具体做法是把请求头里 `Sec-WebSocket-Key` 的值，加上一个专用的 UUID，再计算摘要

### 优点

- 较少的控制开销：数据包头部协议较小，不同于http每次请求需要携带完整的头部
- 更强的实时性：相对于HTTP请求需要等待客户端发起请求服务端才能响应，延迟明显更少
- 保持创连接状态：创建通信后，可省略状态信息，不同于HTTP每次请求需要携带身份验证
- 更好的二进制支持：定义了二进制帧，更好处理二进制内容
- 支持扩展：用户可以扩展 `websocket` 协议、实现部分自定义的子协议
- 更好的压缩效果：`Websocket` 在适当的扩展支持下，可以沿用之前内容的上下文，在传递类似的数据时，可以显著地提高压缩率

## 应用场景

基于`websocket`的事实通信的特点，其存在的应用场景大概有：

- 弹幕
- 媒体聊天
- 协同编辑
- 基于位置的应用
- 体育实况更新
- 股票基金报价实时更新

