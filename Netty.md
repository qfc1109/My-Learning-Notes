### BIO / NIO / AIO

阻塞 IO 意思是：线程发起 IO 操作后，如果数据还没准备好，线程会一直卡在那里等。

非阻塞 IO 的意思是：线程去问一下“有没有数据”，如果没有，方法马上返回，不会一直卡住。

- BIO（Blocking IO）：阻塞IO，java中的socket，serverSocket就是BIO思路：

  > 一个客户端连接--->一个线程处理
  >
  > 比如：
  >
  > ```
  > Socket socket = serverSocket.accept(); // 阻塞，等客户端连接
  > InputStream in = socket.getInputStream();
  > int len = in.read(buffer);             // 阻塞，等客户端发数据
  > ```

  优点：简单好理解

  缺点：连接多了以后线程数量会很多，比如1万个上连接，如果每个连接一个线程，服务器压力会非常大

  使用场景：连接数少、并发低、逻辑简单的场景

  

- NIO（Non-blocking IO）：也就是常说的New IO，java1.4引入，核心是：

  > 一个线程可以管理多个连接
  >
  > 核心组件：
  >
  > - Channel      通道，类似连接
  > - Buffer       缓冲区，读写数据用
  > - Selector     选择器，监听多个连接上的事件

  工作方式类似于：

  ```
  Selector统一监听很多连接，哪个连接有事件，比如可读、可写、可连接，线程就去处理哪个连接，没事件就不用傻等某一个连接
  ```

  NIO 常见事件：

  ```
  OP_ACCEPT   有新连接
  OP_CONNECT  连接完成
  OP_READ     有数据可读
  OP_WRITE    可以写数据
  ```

  `Netty主要就是针对于Java NIO的高级封装`



- AIO（ Asynchronous IO）：异步IO，也叫NIO.2，Java7引入，他的思想是：

  > 你发起IO操作后不用等，操作系统完成后通知你

  NIO 是线程问：“现在有数据了吗？”

  AIO 是线程说：“有数据了你通知我。”



#### 三者对比

- BIO：
  一个连接一个线程，线程会阻塞等待。
  简单，但并发能力弱。
- NIO：
  一个线程管理多个连接，线程不会一直卡在某个连接上。
  复杂，但适合高并发。
- AIO：
  真正异步，IO 完成后由系统通知程序。
  模型更高级，但在 Java 服务端开发里使用没有 Netty/NIO 普遍。

> BIO 适合简单低并发；
> NIO 适合高并发网络服务；
> AIO 是异步完成通知模型，但 Java 实际主流高性能网络框架多基于 NIO，比如 Netty。



### Reactor模型

Reactor 是一种基于`“事件驱动 + IO 多路复用”`的网络服务器模型。线程不再为某个连接阻塞等待，而是统一等待一批连接上的事件，哪个连接有事件就处理哪个。



#### Reactor核心思想

Reactor模型不是让线程主动去问每一个连接：你现在有数据吗？
而是把连接注册到一个事件监听器上，有操作系统告诉程序：

```
这些连接现在可读
这些连接现在可写
这里来了新连接
这个连接断开了
```

然后 Reactor 再把这些事件分发给对应的处理器。

核心流程：

```
注册事件 -> 等待事件 -> 事件就绪 -> 分发事件 -> Handler 处理

更具体一点:
Channel 注册到 Selector
Selector 监听多个 Channel
某些 Channel 有 IO 事件
Reactor 取出事件
分发给对应 Handler
Handler 执行业务处理
```



#### 核心组件

- **Handle**

  可以理解为一个连接句柄。

  在 Java NIO 里通常对应：

  ```
  SocketChannel
  ServerSocketChannel
  ```

  在 Netty 里对应：

  ```
  Channel
  ```

  它代表一个网络连接或者服务端监听端口。



- **Event**

  事件，比如：

  ```
  accept：有新连接
  read：连接上有数据可读
  write：连接可以写数据
  close：连接关闭
  error：连接异常
  ```

  Java NIO 里常见事件：

  ```
  SelectionKey.OP_ACCEPT
  SelectionKey.OP_READ
  SelectionKey.OP_WRITE
  SelectionKey.OP_CONNECT
  ```



- **Synchronous Event Demultiplexer**

  这个名字很长，可以先理解为：

  ```
  事件多路分离器
  ```

  它负责同时监听多个连接，等待哪些连接有事件发生。

  在 Java NIO 里就是：

  ```
  Selector
  ```

  它的价值是：

  ```
  一个线程可以监听很多连接
  不用一个连接配一个线程
  ```



- **Reactor**

  Reactor 是事件调度器，负责：

  ```
  等待事件
  拿到就绪事件
  分发给对应 Handler
  ```

  它本身通常运行在一个事件循环里：

  ```
  while (true) {
      selector.select();
      // 遍历就绪事件
      // 分发给对应 handler
  }
  ```

  所以 Reactor 的核心就是：

  ```
  事件循环 + 事件分发
  ```



- **Event Handler**

  Handler 是真正处理事件的地方。

  比如：

  ```
  AcceptHandler：处理新连接
  ReadHandler：处理读事件
  WriteHandler：处理写事件
  BusinessHandler：处理业务逻辑
  ```

  在 Netty 里就是各种：

  ```
  ChannelHandler
  ChannelInboundHandler
  ChannelOutboundHandler
  ```



#### **Reactor 的工作流程**

以 TCP 服务端为例：

```
1. 服务端启动，创建 ServerSocketChannel
2. ServerSocketChannel 注册到 Selector，监听 accept 事件
3. Reactor 线程进入 selector.select() 等待
4. 客户端连接进来，Selector 返回 accept 事件
5. Reactor 调用 Acceptor 处理新连接
6. Acceptor 创建 SocketChannel
7. SocketChannel 注册到 Selector，监听 read 事件
8. 客户端发送数据，Selector 返回 read 事件
9. Reactor 调用 ReadHandler 读取数据
10. Handler 解码、处理业务、写响应
```

可以画成这样：

```
客户端连接/发送数据
        |
        v
   操作系统 IO 事件
        |
        v
     Selector
        |
        v
     Reactor
        |
        v
   分发给 Handler
        |
        v
   业务处理 / 编码 / 解码 / 响应
```



#### Reactor和普通阻塞模型的区别

- 阻塞模型：

  ```
  线程 A 负责连接 1
  线程 B 负责连接 2
  线程 C 负责连接 3
  每个线程都可能卡在 read()
  ```

- Reactor 模型：

  ```
  线程 A 负责监听很多连接，
  哪个连接有事件，线程 A 就处理哪个
  没有事件时，线程 A 阻塞在 Selector 上
  ```

- 关键区别：

  ```
  阻塞 IO：线程阻塞在某个连接上
  Reactor：线程阻塞在 Selector 上，等待一批连接的事件
  ```

这就是 Reactor 高并发的基础。



#### 三种常见的Reactor模型

- **单 Reactor 单线程**

  结构：

  ```
  一个 Reactor 线程
  负责 accept
  负责 read/write
  负责业务处理
  ```

  流程：

  ```
  Reactor -> Acceptor
  Reactor -> ReadHandler
  Reactor -> BusinessHandler
  Reactor -> WriteHandler
  ```

  优点：

  ```
  模型简单
  没有多线程竞争
  ```

  缺点：

  ```
  所有事情一个线程做
  业务逻辑稍微慢一点就会阻塞整个服务
  无法利用多核 CPU
  ```

  适合：

  ```
  学习模型
  连接数不大
  业务极轻
  ```

  Redis 早期核心网络模型就比较接近单线程事件循环，但 Redis 后来版本也引入了多线程 IO 辅助能力。



- **单 Reactor 多线程**

  结构：

  ```
  一个 Reactor 线程负责 IO 事件
  业务逻辑交给线程池处理
  ```

  流程：

  ```
  Reactor 监听 accept/read/write
  读到数据后交给 Worker 线程池
  Worker 处理业务
  处理完再把结果交回 Reactor 写出
  ```

  优点：

  ```
  IO 和业务处理分离
  能利用多核 CPU
  Reactor 不容易被业务逻辑卡住
  ```

  缺点：

  ```
  Reactor 仍然只有一个
  连接建立、IO 事件监听压力都在一个 Reactor 上
  线程间数据传递更复杂
  ```

  适合：

  ```
  业务处理比较重
  但连接管理压力还不算特别极端
  ```



-  **主从 Reactor 多线程**

  这是`高性能网络框架最常见的模型`。

  结构：

  ```
  Main Reactor：负责接收新连接
  Sub Reactor：负责已建立连接的 read/write
  Worker 线程池：处理业务逻辑
  ```

  流程：

  ```
  客户端连接
      |
      v
  Main Reactor 接收连接
      |
      v
  把连接分配给某个 Sub Reactor
      |
      v
  Sub Reactor 监听 read/write
      |
      v
  Handler 处理编解码
      |
      v
  业务逻辑可直接处理或交给业务线程池
  ```

  优点：

  ```
  accept 和 read/write 分离
  可以支撑大量连接
  可以利用多核
  职责更清晰
  ```

  缺点：

  ```
  模型更复杂
  需要处理线程切换、任务队列、连接归属等问题
  ```

  Netty 的常见服务端模型就是这个思路：

  ```
  EventLoopGroup bossGroup = new NioEventLoopGroup(1);
  EventLoopGroup workerGroup = new NioEventLoopGroup();
  ```

  对应关系：

  ```
  bossGroup   -> Main Reactor，负责接收连接
  workerGroup -> Sub Reactor，负责连接读写
  ```



#### **Netty 和 Reactor 的对应关系**

Netty 基本就是 Reactor 模型的成熟工程实现。

可以这样对应：

```
Reactor                 -> EventLoop
Selector                -> Java NIO Selector
Handle                  -> Channel
Event Handler           -> ChannelHandler
事件处理链               -> ChannelPipeline
Main Reactor            -> bossGroup
Sub Reactor             -> workerGroup
accept 事件处理          -> ServerBootstrap 里的连接接收逻辑
read/write 事件处理      -> ChannelInboundHandler / ChannelOutboundHandler
```

Netty 里一个重要特点：

```
一个 Channel 通常绑定到一个 EventLoop
这个 Channel 的 IO 事件始终由同一个 EventLoop 线程处理
```

这带来一个好处：

```
减少并发锁竞争
同一个连接内的事件顺序更容易保证
```



#### **Reactor 是同步还是异步**

这个地方很容易混。

Reactor 通常属于：

```
同步非阻塞 IO + 事件驱动
```

为什么说是同步？

因为当事件可读时，应用程序还是要自己调用：

```
channel.read(buffer);
```

也就是说，真正的数据读取动作由应用线程完成。

为什么说是非阻塞？

因为 `SocketChannel` 通常设置为非阻塞：

```
channel.configureBlocking(false);
```

如果没有数据，不会一直卡死在某个连接的 `read()` 上。





#### **Reactor 和 Proactor 的区别**

简单记：

```
Reactor：通知你“可以读了”，你自己去读
Proactor：系统帮你读完了，通知你“读好了”
```

Reactor：

```
事件 = IO 就绪
应用负责执行 IO 操作
```

Proactor：

```
事件 = IO 完成
操作系统负责完成 IO 操作
应用处理完成结果
```

Java NIO 的 Selector 更接近 Reactor。

Windows IOCP、Java AIO 的思想更接近 Proactor。



#### **为什么 Reactor 适合高并发**

因为它避免了：

```
一个连接一个线程
大量线程阻塞等待
大量线程上下文切换
```

它把模型变成：

```
少量事件循环线程
管理大量连接
事件来了才处理
```

所以它特别适合：

```
连接多
请求频繁但每次处理较快
大量长连接
网络 IO 密集型服务
```

例如：

```
RPC 框架
网关
IM 即时通信
游戏服务器
MQ 通信层
WebSocket 服务
IoT 设备接入
自定义 TCP 协议服务
```





#### **需要注意的问题**

Reactor 线程不能被长时间阻塞。

比如在 Netty 的 `ChannelHandler` 里直接做这些事情就危险：

```
长时间数据库查询
远程 HTTP 调用
复杂 CPU 计算
Thread.sleep()
大文件同步读写
```

因为 EventLoop 线程一旦被卡住，它负责的其他连接也会被影响。

正确思路通常是：

```
轻量 IO 处理、编解码放 EventLoop
耗时业务交给业务线程池
处理完再把结果写回 Channel
```







## Netty

### 概述

Netty 是一个异步事件驱动的网络应用框架，用于快速开发高性能、可维护的网络服务器和客户端。

它基于 Java NIO，对原生 NIO 的复杂 API 进行了封装，提供了连接管理、线程模型、事件处理、数据编解码、内存管理等能力。Netty 主要解决传统 Socket BIO 模型并发能力不足、原生 NIO 开发复杂、TCP 协议处理困难等问题。

Netty 常用于 RPC 框架、网关、IM 聊天、游戏服务器、物联网通信、自定义协议服务等高并发网络通信场景。学习 Netty 时，需要重点掌握 Channel、EventLoop、ChannelPipeline、ChannelHandler、ByteBuf、编码器、解码器、ChannelFuture、Bootstrap，以及 TCP 粘包和半包等核心概念。



Netty 的一次网络通信，大概可以理解成：

```
EventLoopGroup 负责线程
    ↓
Channel 代表连接
    ↓
ChannelPipeline 是这条连接上的处理链
    ↓
ChannelHandler 是处理链上的一个个处理器
    ↓
编码/解码 负责 byte[] 和业务对象之间转换
```

你可以先记住一句话：

> Netty 是事件驱动的网络框架。连接、读、写、断开、异常这些事，都会变成事件，在 ChannelPipeline 里被 ChannelHandler 处理。



### **1. EventLoopGroup**

`EventLoopGroup` 是 Netty 的线程组。

它解决的问题是：**网络连接很多时，不能一个连接一个线程，否则线程数量会爆炸。**

传统 BIO 写法通常是：

```
一个客户端连接 -> 一个线程阻塞等待读取
```

Netty 的思路是：

```
一个 EventLoop 线程 -> 管理多个 Channel 连接
```

服务端常见写法：

```
EventLoopGroup bossGroup = new NioEventLoopGroup(1);
EventLoopGroup workerGroup = new NioEventLoopGroup();

ServerBootstrap bootstrap = new ServerBootstrap();
bootstrap.group(bossGroup, workerGroup);
```

通常分两组：

```
bossGroup   接收新连接
workerGroup 处理连接上的读写事件
```

比如客户端连接服务器时：

```
客户端发起连接
    ↓
bossGroup 接收连接
    ↓
把连接注册给某个 workerGroup 里的 EventLoop
    ↓
之后这个连接的读写事件由该 EventLoop 处理
```

要注意一个关键点：

> 一个 Channel 一旦注册到某个 EventLoop，后续 IO 事件通常都由这个 EventLoop 线程处理。

所以不要在 Netty 的 IO 线程里做耗时操作，比如数据库慢查询、大量计算、远程 HTTP 调用。否则这个 EventLoop 管理的其他连接也会被拖慢。



### **2. Channel**

`Channel` 代表一个网络连接。

在服务端里，一个客户端连上来，就会有一个对应的 `Channel`。

你可以把它理解成：

```
Channel = 一条连接 + 这条连接的读写能力 + 这条连接的状态
```

常见操作：

```
channel.writeAndFlush(data); // 写数据并刷新
channel.close();             // 关闭连接
channel.isActive();          // 连接是否活跃
channel.isWritable();        // 当前是否可写
```

在游戏服务器、IM、网关里，经常会把“用户上下文”绑定到 `Channel` 上。

例如你项目里的思路就是：

```
一个 Channel 对应一个 PlayerContext
```

连接建立时创建玩家上下文，消息来了再从 `Channel` 上取出来。

这类代码通常会用：

```
AttributeKey<PlayerContext> key = AttributeKey.newInstance("PLAYER_CONTEXT");
channel.attr(key).set(playerContext);
PlayerContext ctx = channel.attr(key).get();
```

你要记住：

> Channel 不是业务用户本身，但它是业务用户和网络连接之间的桥。



### **3. ChannelPipeline**

`ChannelPipeline` 是一个处理链。

一个 `Channel` 里面有一个 `Pipeline`，网络事件会沿着这条链传播。

可以想成流水线：

```
原始字节
  -> 拆包 Handler
  -> 解码 Handler
  -> 业务 Handler
  -> 编码 Handler
  -> 写回客户端
```

代码大概是：

```
ChannelPipeline pipeline = channel.pipeline();

pipeline.addLast(new LengthFieldBasedFrameDecoder(...));
pipeline.addLast(new MyDecoder());
pipeline.addLast(new MyBusinessHandler());
pipeline.addLast(new MyEncoder());
```

顺序非常重要。

对入站数据，也就是客户端发给服务端的数据：

```
客户端数据 -> Pipeline 从前往后执行 inbound handler
```

对出站数据，也就是服务端写给客户端的数据：

```
服务端 write -> Pipeline 通常从后往前经过 outbound handler
```

所以你读 Pipeline 时，一定要分清：

```
Inbound  读入方向
Outbound 写出方向
```

比如 TCP 服务端常见链路：

```
LengthFieldBasedFrameDecoder 解决粘包半包
ByteToMessageDecoder         byte[] 转业务消息
BusinessHandler              执行业务逻辑
MessageToByteEncoder         业务消息转 byte[]
LengthFieldPrepender         写出时加长度字段
```



### **4. ChannelHandler**

`ChannelHandler` 是 Pipeline 里的处理器。

真正处理事件的是它。

常见事件包括：

```
channelActive       连接建立
channelInactive     连接断开
channelRead         收到数据
exceptionCaught     出现异常
userEventTriggered  用户事件，比如空闲超时
```

常见继承类：

```
ChannelInboundHandlerAdapter
SimpleChannelInboundHandler<T>
ByteToMessageDecoder
MessageToByteEncoder<T>
MessageToMessageDecoder<T>
MessageToMessageEncoder<T>
```

一个最简单的业务 Handler：

```
public class MyHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelActive(ChannelHandlerContext ctx) {
        System.out.println("连接建立: " + ctx.channel());
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        System.out.println("收到消息: " + msg);
        ctx.writeAndFlush(msg);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}
```

这里的 `ChannelHandlerContext` 很重要。

它代表：

```
当前 Handler 在 Pipeline 中的上下文
```

可以通过它拿到：

```
ctx.channel();   // 当前连接
ctx.pipeline();  // 当前连接的 Pipeline
ctx.writeAndFlush(msg);
ctx.fireChannelRead(msg); // 把事件继续传给下一个 Handler
```

你可以这样区分：

```
Channel              是连接
ChannelPipeline      是连接上的处理链
ChannelHandler       是链上的处理器
ChannelHandlerContext 是当前处理器在链上的位置和上下文
```



### **5. 编码 / 解码**

编码和解码是 Netty 最重要的实战部分。

因为网络传输的本质是：

```
只能传字节
```

但业务代码想处理的是：

```
LoginRequest
ChatMessage
BattleRequest
MessageWrapper
```

所以需要转换：

```
解码 Decode: byte[] -> 业务对象
编码 Encode: 业务对象 -> byte[]
```

最常见的问题是 TCP 粘包和半包。

TCP 是字节流，不是消息队列。你发两条消息：

```
消息A
消息B
```

服务端可能收到：

```
消息A + 消息B 合在一起
```

也可能收到：

```
消息A 的前半段
下一次 read 才收到消息A 的后半段
```

所以 TCP 协议必须设计“消息边界”。

常见做法：

```
4字节长度 + 消息内容
```

例如：

```
[00 00 00 12] [18字节业务数据]
```

Netty 里常用：

```
pipeline.addLast(new LengthFieldBasedFrameDecoder(
    1024 * 1024,
    0,
    4,
    0,
    4
));

pipeline.addLast(new LengthFieldPrepender(4));
```

含义可以先简单记：

```
LengthFieldBasedFrameDecoder 读入时按长度字段拆完整包
LengthFieldPrepender         写出时自动在前面加长度字段
```

然后再加自己的解码器：

```
public class MyDecoder extends ByteToMessageDecoder {
    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) {
        byte[] bytes = new byte[in.readableBytes()];
        in.readBytes(bytes);

        MyMessage message = MyMessage.parseFrom(bytes);
        out.add(message);
    }
}
```

编码器：

```
public class MyEncoder extends MessageToByteEncoder<MyMessage> {
    @Override
    protected void encode(ChannelHandlerContext ctx, MyMessage msg, ByteBuf out) {
        out.writeBytes(msg.toByteArray());
    }
}
```

如果使用 Protobuf，流程通常是：

```
客户端发送:
业务请求对象 -> Protobuf 序列化 -> byte[] -> 加长度字段 -> TCP

服务端接收:
TCP 字节流 -> 按长度字段拆包 -> byte[] -> Protobuf 反序列化 -> 业务对象
```



### 6. 完整链路

你可以这样记一条完整链路：

```
1. 服务启动时创建 EventLoopGroup
2. ServerBootstrap 绑定端口
3. 客户端连接进来，生成一个 Channel
4. Channel 初始化自己的 Pipeline
5. Pipeline 里放多个 Handler
6. 客户端发来字节流
7. 解码器先处理粘包半包，再转成业务消息
8. 业务 Handler 读取消息并调用业务逻辑
9. 服务端返回业务对象
10. 编码器把业务对象转成字节写回客户端
```



真实项目是：

```
客户端发数据
  -> 入站
  -> 拆包
  -> 解码成业务消息
  -> 根据协议号 / 路由找到业务处理器
  -> 调 service
  -> 可能读写数据库、缓存、远程服务
  -> 生成响应对象
  -> 编码成字节
  -> 出站写回客户端
```

拿龙女项目里的结构类比，大概是：

```
channelRead
  -> MessageWrapper.parseFrom(byteMsg)
  -> playerContext.tell(wrapper)
  -> PlayerActor
  -> ProtocolDispatcher
  -> 具体业务 Handler
  -> playerContext.write(...)
  -> channel.writeAndFlush(...)
```



### 7. 快速上手

pom.xml

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.encoding>UTF-8</maven.compiler.encoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>3.8.1</version>
      <scope>test</scope>
    </dependency>
      <!--
          引入 netty-all 是为了学习阶段少关心模块拆分。
          真实项目里可能会按需引入 netty-buffer、netty-transport、netty-codec 等模块。
      -->
      <dependency>
          <groupId>io.netty</groupId>
          <artifactId>netty-all</artifactId>
          <version>4.1.111.Final</version>
      </dependency>

  </dependencies>
```



#### Demo1

```
EchoServer，收到什么返回什么
```

maven项目目录结构

```
Netty
├─ .mvn
├─ src
│  └─ main
│     ├─ java
│     │  └─ com.example.netty
│     │     ├─ EchoClient.java
│     │     ├─ EchoServer.java
│     │     └─ EchoServerHandler.java
│     ├─ resources
│     └─ webapp
├─ target
└─ pom.xml
```

```
EchoServer.java        服务端启动类，负责创建 EventLoopGroup、配置 ServerBootstrap、绑定端口。
EchoServerHandler.java 服务端处理器，负责处理连接建立、读取消息、连接断开、异常。
EchoClient.java        测试客户端，用 JDK Socket 连接 Netty 服务端并发送消息。
pom.xml                Maven 配置文件，引入 Netty 依赖。
```

- EchoServer.java

  ```java
  package com.example.netty;
  
  import io.netty.bootstrap.ServerBootstrap;
  import io.netty.channel.ChannelFuture;
  import io.netty.channel.ChannelInitializer;
  import io.netty.channel.ChannelOption;
  import io.netty.channel.EventLoopGroup;
  import io.netty.channel.ChannelPipeline;
  import io.netty.channel.nio.NioEventLoopGroup;
  import io.netty.channel.socket.SocketChannel;
  import io.netty.channel.socket.nio.NioServerSocketChannel;
  
  public class EchoServer {
  
      public static void main(String[] args) throws InterruptedException {
          int port = 9000;
  
          /*
              bossGroup 只负责接收客户端连接。
  
              这样设计是为了把“接收新连接”和“处理连接上的读写数据”分开。
              如果所有事情都放在一组线程里，读写处理一旦变慢，新的客户端连接也可能被拖慢。
          */
          EventLoopGroup bossGroup = new NioEventLoopGroup(1);
  
          /*
              workerGroup 负责处理已经建立好的连接上的 IO 事件，比如读数据、写数据、断开连接。
  
              Netty 的核心优势之一就是：
              少量 worker 线程可以管理大量 Channel，而不是一个连接创建一个线程。
          */
          EventLoopGroup workerGroup = new NioEventLoopGroup();
  
          try {
              /*
                  ServerBootstrap 是服务端启动器。
  
                  它存在的意义是把服务端启动需要的配置集中起来：
                  用哪些线程、用哪种 Channel、每个客户端连接进来后如何初始化 Pipeline。
              */
              ServerBootstrap bootstrap = new ServerBootstrap();
  
              bootstrap
                      /*
                          服务端需要两组线程：
                          bossGroup 负责接连接，workerGroup 负责处理连接上的读写事件。
                      */
                      .group(bossGroup, workerGroup)
  
                      /*
                          指定服务端 Channel 的类型。
  
                          这里使用 NioServerSocketChannel，表示底层使用 Java NIO。
                          你可以先把它理解成 Netty 对 ServerSocketChannel 的封装。
                      */
                      .channel(NioServerSocketChannel.class)
  
                      /*
                          SO_BACKLOG 表示服务端连接队列大小。
  
                          它不是 Netty 核心概念，但服务端通常要配置。
                          这里给一个普通学习值，避免并发连接稍多时连接队列太小。
                      */
                      .option(ChannelOption.SO_BACKLOG, 128)
  
                      /*
                          childOption 是给“客户端连接 Channel”设置参数。
  
                          TCP_NODELAY=true 表示尽量减少小包延迟。
                          Echo Demo 里不是重点，但真实长连接服务经常会设置。
                      */
                      .childOption(ChannelOption.TCP_NODELAY, true)
  
                      /*
                          childHandler 用来定义每个客户端连接建立后，它的 Pipeline 长什么样。
  
                          注意：
                          这里初始化的不是服务端监听端口的 Channel，
                          而是每一个客户端连接对应的 SocketChannel。
                      */
                      .childHandler(new ChannelInitializer<SocketChannel>() {
  
                          @Override
                          protected void initChannel(SocketChannel ch) {
                              /*
                                  每个 Channel 都有自己的 Pipeline。
  
                                  Pipeline 可以理解成这条连接上的处理流水线。
                                  客户端发来的数据，会沿着 Pipeline 里的 Handler 依次处理。
                              */
                              ChannelPipeline pipeline = ch.pipeline();
  
                              /*
                                  这一版 Demo 只放一个业务 Handler。
  
                                  因为我们现在还不处理粘包、半包、协议解析。
                                  先让你看清楚：
                                  数据进入 Channel -> 触发 Handler -> Handler 写回数据。
                              */
                              pipeline.addLast(new EchoServerHandler());
                          }
                      });
  
              /*
                  bind(port) 是异步操作。
  
                  Netty 很多操作都是异步的，所以返回 ChannelFuture。
                  sync() 的意义是：当前 main 线程等待端口绑定完成，再继续往下走。
              */
              ChannelFuture bindFuture = bootstrap.bind(port).sync();
  
              System.out.println("Echo Server started on port " + port);
  
              /*
                  服务启动后，main 线程不能直接结束。
  
                  closeFuture() 表示“服务端 Channel 关闭”这个未来事件。
                  sync() 表示一直等到服务端关闭。
              */
              bindFuture.channel().closeFuture().sync();
  
          } finally {
              /*
                  优雅关闭线程组。
  
                  Netty 的线程不是普通局部变量用完就自动结束。
                  如果不关闭，程序退出或重启时可能留下资源问题。
              */
              bossGroup.shutdownGracefully();
              workerGroup.shutdownGracefully();
          }
      }
  }
  ```

- EchoServerHandler.java

  ```java
  package com.example.netty;
  
  import io.netty.buffer.ByteBuf;
  import io.netty.channel.ChannelHandlerContext;
  import io.netty.channel.ChannelInboundHandlerAdapter;
  
  public class EchoServerHandler extends ChannelInboundHandlerAdapter {
  
      @Override
      public void channelActive(ChannelHandlerContext ctx) {
          /*
              channelActive 会在客户端连接建立成功后触发。
  
              我们在这里打印连接信息，是为了观察：
              一个客户端连接进来后，Netty 会为它创建一个 Channel。
          */
          System.out.println("client connected: " + ctx.channel().remoteAddress());
      }
  
      @Override
  	public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
           /*
              channelRead 会在当前 Channel 收到数据时触发。
  
              这一版 Pipeline 没有加解码器，所以 msg 还是 Netty 原始的 ByteBuf。
              ByteBuf 可以理解成 Netty 自己管理的字节容器。
          */
      	ByteBuf byteBuf = (ByteBuf) msg;
  
      	try {
               /*
              	readableBytes() 表示当前能读取多少字节。
  
              	我们读取它不是为了业务处理，而是为了在控制台看到客户端到底发了什么。
          	*/
          	byte[] bytes = new byte[byteBuf.readableBytes()];
          	byteBuf.readBytes(bytes);
  
          	String text = new String(bytes);
          	System.out.println("server received: " + text);
              
  			 /*
              	这里重新写回 bytes，而不是直接写回原来的 byteBuf。
  
              	因为上面 readBytes 已经移动了 byteBuf 的读指针。
              	如果直接把同一个 byteBuf 写回去，可能已经没有可读内容了。
          	*/
          	ByteBuf response = ctx.alloc().buffer(bytes.length);
          	response.writeBytes(bytes);
              
  			 /*
              	writeAndFlush 表示写数据并立刻刷新出去。
  
              	write 只是把数据写到 Netty 的出站缓冲区；
              	flush 才会推动数据真正发送。
              	学习阶段直接用 writeAndFlush，更容易观察效果。
          	*/
          	ctx.writeAndFlush(response);
      	} finally {
          	/*
              	因为我们已经把入站 ByteBuf 里的内容读出来了，
              	后面也不会继续把这个 msg 传给下一个 Handler，
              	所以要释放它，避免 Netty 的引用计数内存泄漏。
          	*/
          	byteBuf.release();
      }
  }
  
      @Override
      public void channelInactive(ChannelHandlerContext ctx) {
          /*
              channelInactive 会在连接断开时触发。
  
              真实项目里通常会在这里清理用户上下文、移除连接、发布下线事件。
          */
          System.out.println("client disconnected: " + ctx.channel().remoteAddress());
      }
  
      @Override
      public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
          /*
              出现异常时关闭连接。
  
              网络连接异常后继续保留 Channel，通常没有意义，还可能造成资源泄漏。
          */
          cause.printStackTrace();
          ctx.close();
      }
  }
  ```

- EchoClient.java

  ```java
  package com.example.netty;
  
  import java.io.InputStream;
  import java.io.OutputStream;
  import java.net.Socket;
  import java.nio.charset.StandardCharsets;
  
  public class EchoClient {
  
      public static void main(String[] args) throws Exception {
          /*
              这里不用 Netty 客户端，而是先用 JDK Socket。
  
              这样做是为了让你先专注理解服务端 Netty：
              客户端只负责连上去、发一句话、读一句返回。
          */
          Socket socket = new Socket("127.0.0.1", 9000);
  
          OutputStream out = socket.getOutputStream();
          InputStream in = socket.getInputStream();
  
          byte[] request = "hello netty".getBytes(StandardCharsets.UTF_8);
  
          /*
              写数据给服务端。
  
              服务端的 channelRead 会因为这次写入被触发。
          */
          out.write(request);
          out.flush();
  
          byte[] buffer = new byte[1024];
          int len = in.read(buffer);
  
          String response = new String(buffer, 0, len, StandardCharsets.UTF_8);
          System.out.println("client received: " + response);
  
          socket.close();
      }
  }
  ```



##### 完整流程

```
启动 EchoServer
  -> 监听 9000 端口

第一次运行 EchoClient
  -> new Socket("127.0.0.1", 9000)
  -> 服务端触发 channelActive
  -> 客户端 out.write("hello netty")
  -> 服务端触发 channelRead
  -> 服务端 writeAndFlush 原样返回
  -> 客户端 in.read 读到 hello netty
  -> 客户端 socket.close
  -> 服务端触发 channelInactive

第二次运行 EchoClient
  -> 重复同样流程
  -> 但客户端临时端口换了
```



#### Demo2

这一版对应的 Netty 概念是：

```
ByteBuf -> StringDecoder -> String -> 业务 Handler
String  -> StringEncoder -> ByteBuf -> 网络发送
```

注意：**这一版还没有解决 TCP 粘包 / 半包**。它只是让你看到：为什么第一版拿到 `ByteBuf`，加入解码器后就能拿到 `String`。

**Maven 项目目录结构**

```
Netty
├─ .mvn
├─ src
│  └─ main
│     ├─ java
│     │  └─ v2
│     │     ├─ EchoClient.java
│     │     ├─ EchoClientHandler.java
│     │     ├─ EchoServer.java
│     │     └─ EchoServerHandler.java
│     ├─ resources
│     └─ webapp
├─ target
└─ pom.xml
```

```
EchoServer.java
服务端启动类，负责创建 EventLoopGroup、配置 ServerBootstrap、绑定 9000 端口。
第二版重点是在 Pipeline 中加入 StringDecoder 和 StringEncoder。

EchoServerHandler.java
服务端业务处理类，负责观察连接建立、连接断开、读取客户端消息、原样写回消息。
因为前面有 StringDecoder，所以 channelRead 中的 msg 可以强转成 String。

EchoClient.java
测试客户端启动类，负责创建 Bootstrap、连接 Netty 服务端、发送 hello netty。
第二版客户端也配置 StringEncoder 和 StringDecoder，用来发送字符串并接收字符串响应。

EchoClientHandler.java
客户端业务处理类，负责读取服务端返回的字符串消息，并在收到响应后关闭连接。
因为客户端 Pipeline 中也有 StringDecoder，所以这里收到的 msg 也是 String。

pom.xml
Maven 配置文件，引入 Netty 依赖，并配置 UTF-8 源码编码，保证中文注释可以正常编译。
```

- EchoServer.java

  ```java
  package v2;
  
  import io.netty.bootstrap.ServerBootstrap;
  import io.netty.channel.ChannelFuture;
  import io.netty.channel.ChannelInitializer;
  import io.netty.channel.ChannelPipeline;
  import io.netty.channel.EventLoopGroup;
  import io.netty.channel.nio.NioEventLoopGroup;
  import io.netty.channel.socket.SocketChannel;
  import io.netty.channel.socket.nio.NioServerSocketChannel;
  import io.netty.handler.codec.string.StringDecoder;
  import io.netty.handler.codec.string.StringEncoder;
  import io.netty.util.CharsetUtil;
  
  public class EchoServer {
      public static void main(String[] args) throws InterruptedException {
          /*
           * 为什么服务端通常要分 bossGroup 和 workerGroup：
           *
           * 服务端要同时做两类事情：
           * 1. 接收新的客户端连接。
           * 2. 处理已经连上的客户端读写事件。
           *
           * Netty 把这两类职责拆开，是为了避免“接连接”和“处理消息”互相影响。
           * 这个 Demo 没指定线程数，是为了先把主流程看清楚；真实项目里一般会按配置指定线程数。
           */
          EventLoopGroup bossGroup = new NioEventLoopGroup();
          EventLoopGroup workerGroup = new NioEventLoopGroup();
          try {
              /*
               * 为什么服务端用 ServerBootstrap：
               *
               * 服务端不是主动连别人，而是绑定端口，等待客户端连进来。
               * ServerBootstrap 封装的就是“启动一个服务端监听端口”的流程。
               */
              ServerBootstrap bootstrap = new ServerBootstrap();
              bootstrap.group(bossGroup, workerGroup)
                      /*
                       * 为什么这里是 NioServerSocketChannel：
                       *
                       * 服务端监听端口时，需要的是“服务端 Channel”。
                       * 它负责接收连接；真正和客户端通信的是连接建立后生成的 SocketChannel。
                       */
                      .channel(NioServerSocketChannel.class)
                      /*
                       * 为什么用 childHandler：
                       *
                       * 服务端自己有一个监听端口的 Channel。
                       * 每个客户端连进来后，又会产生一个子 Channel。
                       *
                       * childHandler 配置的是“每个客户端连接自己的 Pipeline”，
                       * 所以后面的 StringDecoder、StringEncoder、EchoServerHandler
                       * 都是给每条客户端连接使用的。
                       */
                      .childHandler(new ChannelInitializer<SocketChannel>() {
                          @Override
                          protected void initChannel(SocketChannel socketChannel) throws Exception {
                              ChannelPipeline pipeline = socketChannel.pipeline();
  
                              /*
                               * 为什么先加 StringDecoder：
                               *
                               * 网络底层读到的是字节，不是 Java 字符串。
                               * 第一版没有解码器，所以业务 Handler 的 channelRead 收到的是 ByteBuf。
                               *
                               * Inbound 读入方向是从 Pipeline 前面往后面走。
                               * 把 StringDecoder 放在 EchoServerHandler 前面，
                               * 后面的业务 Handler 才能直接收到 String。
                               */
                              pipeline.addLast(new StringDecoder(CharsetUtil.UTF_8));
  
                              /*
                               * 为什么这里也要加 StringEncoder：
                               *
                               * EchoServerHandler 会把收到的 String 原样写回客户端。
                               * 但 TCP 只能发送字节，不能直接发送 Java String 对象。
                               *
                               * 加上 StringEncoder 后，服务端写出的 String
                               * 才能在出站时被转换成 ByteBuf，再发送到网络里。
                               */
                              pipeline.addLast(new StringEncoder(CharsetUtil.UTF_8));
  
                              /*
                               * 为什么业务 Handler 放在解码器后面：
                               *
                               * 这一版 Demo 的目标是让业务代码先不关心 ByteBuf。
                               * 前面的解码器已经把 ByteBuf 变成 String，
                               * EchoServerHandler 只负责理解业务含义：收到什么，就回什么。
                               */
                              pipeline.addLast(new EchoServerHandler());
                          }
                      });
  
              /*
               * 为什么 bind 后要 sync：
               *
               * Netty 的绑定端口是异步操作。
               * sync 会等待端口真正绑定完成，避免服务还没启动好就继续往下走。
               */
              ChannelFuture future = bootstrap.bind(9000).sync();
              System.out.println("Server started on port 9000");
  
              /*
               * 为什么这里要等待 closeFuture：
               *
               * 如果 main 线程直接结束，服务端程序就退出了。
               * 等待服务端 Channel 关闭，可以让服务一直保持监听状态。
               */
              future.channel().closeFuture().sync();
          } finally {
              /*
               * 为什么 finally 里关闭线程组：
               *
               * EventLoopGroup 底层是线程池。
               * 程序结束时主动优雅关闭，可以释放线程资源。
               */
              bossGroup.shutdownGracefully();
              workerGroup.shutdownGracefully();
          }
      }
  }
  ```



- EchoServerHandler.java

  ```java
  package v2;
  
  import io.netty.channel.ChannelHandlerContext;
  import io.netty.channel.ChannelInboundHandlerAdapter;
  
  public class EchoServerHandler extends ChannelInboundHandlerAdapter {
      @Override
      public void channelActive(ChannelHandlerContext ctx) throws Exception {
          /*
           * 为什么这里能观察连接建立：
           *
           * 客户端 TCP 连接建立成功后，Netty 会触发 channelActive 事件。
           * 这个事件适合用来记录“谁连上来了”，或者初始化连接相关的上下文。
           */
          System.out.println("Server ChannerActive: " + ctx.channel().remoteAddress());
      }
  
      @Override
      public void channelInactive(ChannelHandlerContext ctx) throws Exception {
          /*
           * 为什么这里能观察连接断开：
           *
           * 客户端主动关闭、网络断开、服务端关闭连接，最终都会让 Channel 失效。
           * Netty 会触发 channelInactive，真实项目里常在这里清理玩家/用户连接状态。
           */
          System.out.println("server channelInactive: " + ctx.channel().remoteAddress());
      }
  
      @Override
      public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
          /*
           * 为什么这里可以强转成 String：
           *
           * 不是因为 Netty 天生知道这是字符串，
           * 而是因为 Pipeline 前面已经放了 StringDecoder。
           *
           * StringDecoder 已经把 ByteBuf 按 UTF-8 转成 String，
           * 所以传到这里的 msg 真实类型就是 String。
           * 如果前面没有 StringDecoder，这里强转就会出错。
           */
          String text = (String) msg;
          System.out.println("server received: " + text);
  
          /*
           * 为什么这里直接写回 String：
           *
           * 这一版想验证“编码器”的作用。
           * 业务 Handler 可以只写 String，
           * 后面的出站流程会通过 StringEncoder 把 String 转成字节再发出去。
           */
          ctx.channel().writeAndFlush(text);
      }
  
      @Override
      public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
          /*
           * 为什么异常时关闭连接：
           *
           * 网络连接一旦出现异常，继续复用这个 Channel 往往不可靠。
           * Demo 里先打印原因再关闭连接，能让问题暴露出来，也避免连接残留。
           */
          cause.printStackTrace();
          ctx.close();
      }
  }
  ```



- EchoClient.java

  ```java
  package v2;
  
  import io.netty.bootstrap.Bootstrap;
  import io.netty.channel.Channel;
  import io.netty.channel.ChannelInitializer;
  import io.netty.channel.ChannelPipeline;
  import io.netty.channel.EventLoopGroup;
  import io.netty.channel.nio.NioEventLoopGroup;
  import io.netty.channel.socket.SocketChannel;
  import io.netty.channel.socket.nio.NioSocketChannel;
  import io.netty.handler.codec.string.StringDecoder;
  import io.netty.handler.codec.string.StringEncoder;
  import io.netty.util.CharsetUtil;
  
  public class EchoClient {
      public static void main(String[] args) throws InterruptedException {
          /*
           * 为什么客户端只需要一个 EventLoopGroup：
           *
           * 客户端不是监听端口接收大量新连接，
           * 它只是主动连接服务端，并处理这条连接上的读写事件。
           * 所以客户端通常一个线程组就够了。
           */
          EventLoopGroup group = new NioEventLoopGroup();
          try {
              /*
               * 为什么客户端用 Bootstrap：
               *
               * 客户端的角色是主动发起连接。
               * Bootstrap 封装的是“连接远程服务端”的启动流程。
               */
              Bootstrap bootstrap = new Bootstrap();
  
              bootstrap.group(group)
                      /*
                       * 为什么客户端用 NioSocketChannel：
                       *
                       * 客户端需要的是一条能和服务端通信的 TCP 连接。
                       * NioSocketChannel 就是 Netty 基于 Java NIO 封装出来的 TCP 客户端 Channel。
                       */
                      .channel(NioSocketChannel.class)
                      /*
                       * 为什么客户端也要配置 Pipeline：
                       *
                       * 服务端有服务端的处理链，客户端也有自己的处理链。
                       * 客户端发出的 String 要编码，服务端回来的字节也要解码。
                       */
                      .handler(new ChannelInitializer<SocketChannel>() {
                          @Override
                          protected void initChannel(SocketChannel socketChannel) throws Exception {
                              ChannelPipeline pipeline = socketChannel.pipeline();
  
                              /*
                               * 为什么客户端也需要 StringDecoder：
                               *
                               * 服务端回写到网络里的仍然是字节。
                               * 客户端想在 Handler 里直接拿到 String，
                               * 就也需要先把 ByteBuf 解码成 String。
                               */
                              pipeline.addLast(new StringDecoder(CharsetUtil.UTF_8));
  
                              /*
                               * 为什么客户端也需要 StringEncoder：
                               *
                               * 下面会直接 writeAndFlush("hello netty")。
                               * 这对业务代码来说是 String，但网络只能传字节。
                               * StringEncoder 负责把这个 String 转成可发送的 ByteBuf。
                               */
                              pipeline.addLast(new StringEncoder(CharsetUtil.UTF_8));
  
                              /*
                               * 为什么业务 Handler 放最后：
                               *
                               * 客户端业务 Handler 只关心服务端返回的字符串。
                               * 前面的 StringDecoder 已经完成字节到字符串的转换，
                               * 所以这里能保持最简单的业务处理逻辑。
                               */
                              pipeline.addLast(new EchoClientHandler());
                          }
                      });
  
              /*
               * 为什么 connect 后要 sync：
               *
               * Netty 的连接是异步发起的。
               * sync 会等连接真正建立成功，再继续发送消息。
               */
              Channel channel = bootstrap.connect("127.0.0.1", 9000).sync().channel();
  
              /*
               * 为什么这里可以直接发送 String：
               *
               * 因为客户端 Pipeline 里已经配置了 StringEncoder。
               * 没有 StringEncoder 时，Netty 不知道该如何把 String 写成网络字节。
               */
              channel.writeAndFlush("hello netty").sync();
  
              /*
               * 为什么等待 closeFuture：
               *
               * 客户端发送完消息后，还要等服务端回包。
               * EchoClientHandler 收到回包后会关闭连接，
               * 这里等待关闭完成，可以让 Demo 的执行顺序更清楚。
               */
              channel.closeFuture().sync();
          } finally {
              /*
               * 为什么 finally 里关闭线程组：
               *
               * 客户端程序结束时，如果不关闭 EventLoopGroup，
               * Netty 的线程可能还在运行，程序就不容易正常退出。
               */
              group.shutdownGracefully();
          }
      }
  }
  ```

  

- EchoClientHandler.java

  ```java
  package v2;
  
  import io.netty.channel.ChannelHandlerContext;
  import io.netty.channel.ChannelInboundHandlerAdapter;
  
  public class EchoClientHandler extends ChannelInboundHandlerAdapter {
      @Override
      public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
          /*
           * 为什么客户端这里也可以强转成 String：
           *
           * 服务端回来的数据经过了客户端 Pipeline 里的 StringDecoder。
           * 到达这个 Handler 时，msg 已经不再是原始 ByteBuf，而是 String。
           */
          String text = (String) msg;
          System.out.println("client received:" + text);
  
          /*
           * 为什么收到一次响应后就关闭：
           *
           * 这个 Demo 的目标是验证“一次发送、一次回显、一次接收”。
           * 收到服务端回包就主动关闭，程序可以自然结束，
           * 不需要额外手动停客户端。
           */
          ctx.close();
      }
  
      @Override
      public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
          /*
           * 为什么异常时关闭连接：
           *
           * 客户端连接异常后继续读写没有教学意义，
           * 先打印异常再关闭，方便定位问题，也避免连接挂住。
           */
          cause.printStackTrace();
          ctx.close();
  
      }
  }
  ```



##### 执行链路

```
客户端 writeAndFlush("hello netty")
    ↓
客户端 StringEncoder：String -> ByteBuf
    ↓
服务端收到 ByteBuf
    ↓
服务端 StringDecoder：ByteBuf -> String
    ↓
EchoServerHandler.channelRead 收到 String
    ↓
服务端 ctx.writeAndFlush(String)
    ↓
服务端 StringEncoder：String -> ByteBuf
    ↓
客户端 StringDecoder：ByteBuf -> String
    ↓
客户端打印 client received: hello netty
```





#### Demo3

```
出站：
String
 -> StringEncoder
 -> ByteBuf
 -> LengthFieldPrepender
 -> 4字节长度 + 正文
 -> TCP

入站：
TCP字节流
 -> LengthFieldBasedFrameDecoder
 -> 一条完整正文 ByteBuf
 -> StringDecoder
 -> String
 -> 业务 Handler
```

注意：**这一版重点不是让控制台输出变得不一样，而是解决 TCP 粘包 / 半包问题。**

第二版只是把 `ByteBuf` 转成 `String`，但它不知道“一条消息从哪里开始、到哪里结束”。

第三版加入长度字段后，发送的数据会变成：

```
[4字节长度][消息正文]

例如：
hello netty

实际发送：
00 00 00 0B hello netty
```

其中：

```
00 00 00 0B 表示后面的正文长度是 11 字节
hello netty 是真正的业务内容
```

Maven 项目目录结构

```
Netty
├── .mvn
├── src
│   ├── main
│   │   ├── java
│   │   │   └── v3
│   │   │       ├── EchoClient.java
│   │   │       ├── EchoClientHandler.java
│   │   │       ├── EchoServer.java
│   │   │       └── EchoServerHandler.java
│   │   ├── resources
│   │   └── webapp
│   └── test
│       └── java
│           └── v3
│               └── LengthFieldFramingTest.java
├── target
└── pom.xml
```

```
EchoServer.java

服务端启动类，负责创建 EventLoopGroup、配置 ServerBootstrap、绑定 9000 端口。

第三版重点是在 Pipeline 中加入：

LengthFieldBasedFrameDecoder
StringDecoder
LengthFieldPrepender
StringEncoder
EchoServerHandler

入站时：
LengthFieldBasedFrameDecoder 先根据前 4 字节长度判断消息是否完整。
消息没收完整，不会继续传给后面的 Handler。
消息收完整后，去掉长度字段，把正文交给 StringDecoder。

出站时：
EchoServerHandler 写回 String。
StringEncoder 把 String 转成 ByteBuf。
LengthFieldPrepender 自动在 ByteBuf 前面加 4 字节长度。
```

```
EchoServerHandler.java
服务端业务处理类。
收到 String，打印后原样写回。

EchoClient.java
客户端启动类。
连接 127.0.0.1:9000，发送 hello netty。
客户端也要配置同样的长度字段编解码器。

EchoClientHandler.java
客户端业务处理类。
收到服务端返回的 String 后打印并关闭连接。
```

- EchoServer.java

  ```java
  package v3;
  
  import io.netty.bootstrap.ServerBootstrap;
  import io.netty.channel.ChannelFuture;
  import io.netty.channel.ChannelInitializer;
  import io.netty.channel.ChannelPipeline;
  import io.netty.channel.EventLoopGroup;
  import io.netty.channel.nio.NioEventLoopGroup;
  import io.netty.channel.socket.SocketChannel;
  import io.netty.channel.socket.nio.NioServerSocketChannel;
  import io.netty.handler.codec.LengthFieldBasedFrameDecoder;
  import io.netty.handler.codec.LengthFieldPrepender;
  import io.netty.handler.codec.string.StringDecoder;
  import io.netty.handler.codec.string.StringEncoder;
  import io.netty.util.CharsetUtil;
  
  public class EchoServer {
      private static final int PORT = 9000;
      private static final int MAX_FRAME_LENGTH = 1024 * 1024;
  
      public static void main(String[] args) throws InterruptedException {
          /*
           * 这一版仍然沿用服务端的两组线程：
           * bossGroup 负责接收新连接，workerGroup 负责处理连接上的读写事件。
           *
           * 本版新增的重点不是线程模型，而是“读到一串字节后，怎样知道一条消息到哪里结束”。
           */
          EventLoopGroup bossGroup = new NioEventLoopGroup();
          EventLoopGroup workerGroup = new NioEventLoopGroup();
          try {
              ServerBootstrap bootstrap = new ServerBootstrap();
              bootstrap.group(bossGroup, workerGroup)
                      .channel(NioServerSocketChannel.class)
                      .childHandler(new ChannelInitializer<SocketChannel>() {
                          @Override
                          protected void initChannel(SocketChannel socketChannel) throws Exception {
                              configurePipeline(socketChannel.pipeline());
                          }
                      });
  
              ChannelFuture future = bootstrap.bind(PORT).sync();
              System.out.println("Server started on port " + PORT);
  
              future.channel().closeFuture().sync();
          } finally {
              bossGroup.shutdownGracefully();
              workerGroup.shutdownGracefully();
          }
      }
  
      static void configurePipeline(ChannelPipeline pipeline) {
          /*
           * 为什么 StringDecoder 前面还要加 LengthFieldBasedFrameDecoder：
           *
           * TCP 传输的是连续字节流，不会替我们保留“发送方 writeAndFlush 了几次”。
           * 接收方一次 channelRead 可能读到半条消息，也可能读到多条消息粘在一起。
           *
           * StringDecoder 只负责把 ByteBuf 里的字节按 UTF-8 转成 String，
           * 它并不知道“一条完整业务消息”应该从哪里开始、在哪里结束。
           *
           * LengthFieldBasedFrameDecoder 会先读取消息前面的 4 字节长度字段，
           * 等后面的正文凑够这个长度后，才把一条完整消息交给后面的 StringDecoder。
           */
          pipeline.addLast(new LengthFieldBasedFrameDecoder(
                  MAX_FRAME_LENGTH,
                  0,
                  4,
                  0,
                  4
          ));
  
          /*
           * 为什么这里还能继续使用 StringDecoder：
           *
           * 上面的拆包器已经把“消息边界”处理好了，并且 initialBytesToStrip=4，
           * 说明交给后面的 ByteBuf 已经去掉了 4 字节长度字段，只剩真正的字符串正文。
           *
           * 所以 StringDecoder 看到的仍然是干净的 UTF-8 字符串字节。
           */
          pipeline.addLast(new StringDecoder(CharsetUtil.UTF_8));
  
          /*
           * 为什么 LengthFieldPrepender 要放在 StringEncoder 前面：
           *
           * 出站方向和入站方向相反，会从业务 Handler 往 Pipeline 前面走。
           * 业务 Handler 写出 String 后，会先经过 StringEncoder 变成 ByteBuf，
           * 再经过 LengthFieldPrepender 在前面补 4 字节长度。
           *
           * 也就是说，代码顺序看起来是 Prepender 在 Encoder 前面，
           * 但真正出站执行顺序是：StringEncoder -> LengthFieldPrepender。
           */
          pipeline.addLast(new LengthFieldPrepender(4));
  
          /*
           * 为什么仍然需要 StringEncoder：
           *
           * 长度字段只解决“这一条消息有多长”，不负责把 Java String 转成网络字节。
           * StringEncoder 负责把字符串正文编码成 ByteBuf，
           * LengthFieldPrepender 再根据这个 ByteBuf 的长度自动补长度字段。
           */
          pipeline.addLast(new StringEncoder(CharsetUtil.UTF_8));
  
          /*
           * 为什么业务 Handler 还是放最后：
           *
           * 到达这里时，入站数据已经先完成拆包，再完成字符串解码。
           * 所以 EchoServerHandler 不需要关心 TCP 粘包、半包，也不需要手动处理 ByteBuf。
           */
          pipeline.addLast(new EchoServerHandler());
      }
  }
  ```

- EchoServerHandler.java

  ```java
  package v3;
  
  import io.netty.channel.ChannelHandlerContext;
  import io.netty.channel.ChannelInboundHandlerAdapter;
  
  public class EchoServerHandler extends ChannelInboundHandlerAdapter {
      @Override
      public void channelActive(ChannelHandlerContext ctx) throws Exception {
          /*
           * 连接建立这件事没有变化。
           * 本版关注的是连接建立之后，收到的字节流怎样被切成一条条完整消息。
           */
          System.out.println("Server ChannelActive: " + ctx.channel().remoteAddress());
      }
  
      @Override
      public void channelInactive(ChannelHandlerContext ctx) throws Exception {
          System.out.println("server channelInactive: " + ctx.channel().remoteAddress());
      }
  
      @Override
      public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
          /*
           * 为什么这里仍然可以强转成 String：
           *
           * 入站数据进入业务 Handler 前，已经按顺序经过：
           * LengthFieldBasedFrameDecoder -> StringDecoder。
           *
           * 前者保证传下来的 ByteBuf 是一条完整消息；
           * 后者再把这条完整消息的正文转成 String。
           */
          String text = (String) msg;
          System.out.println("server received: " + text);
  
          /*
           * 为什么这里仍然直接写回 String：
           *
           * 出站时 Pipeline 会反向经过：
           * StringEncoder -> LengthFieldPrepender。
           *
           * 所以服务端写出的内容，真正发到网络里时会变成：
           * 4 字节长度 + UTF-8 字符串正文。
           */
          ctx.channel().writeAndFlush(text);
      }
  
      @Override
      public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
          cause.printStackTrace();
          ctx.close();
      }
  }
  ```

- EchoClient.java

  ```java
  package v3;
  
  import io.netty.bootstrap.Bootstrap;
  import io.netty.channel.Channel;
  import io.netty.channel.ChannelInitializer;
  import io.netty.channel.ChannelPipeline;
  import io.netty.channel.EventLoopGroup;
  import io.netty.channel.nio.NioEventLoopGroup;
  import io.netty.channel.socket.SocketChannel;
  import io.netty.channel.socket.nio.NioSocketChannel;
  import io.netty.handler.codec.LengthFieldBasedFrameDecoder;
  import io.netty.handler.codec.LengthFieldPrepender;
  import io.netty.handler.codec.string.StringDecoder;
  import io.netty.handler.codec.string.StringEncoder;
  import io.netty.util.CharsetUtil;
  
  public class EchoClient {
      private static final int PORT = 9000;
      private static final int MAX_FRAME_LENGTH = 1024 * 1024;
  
      public static void main(String[] args) throws InterruptedException {
          /*
           * 客户端仍然只需要一个 EventLoopGroup。
           * 本版变化点不在线程，而在客户端也必须和服务端使用同一套消息边界规则。
           */
          EventLoopGroup group = new NioEventLoopGroup();
          try {
              Bootstrap bootstrap = new Bootstrap();
  
              bootstrap.group(group)
                      .channel(NioSocketChannel.class)
                      .handler(new ChannelInitializer<SocketChannel>() {
                          @Override
                          protected void initChannel(SocketChannel socketChannel) throws Exception {
                              configurePipeline(socketChannel.pipeline());
                          }
                      });
  
              Channel channel = bootstrap.connect("127.0.0.1", PORT).sync().channel();
  
              /*
               * 为什么还是发送普通字符串：
               *
               * 业务代码只表达“我要发送 hello netty”。
               * 前面补 4 字节长度、把字符串变成字节，都是 Pipeline 里的编码器负责。
               */
              channel.writeAndFlush("hello netty").sync();
  
              channel.closeFuture().sync();
          } finally {
              group.shutdownGracefully();
          }
      }
  
      static void configurePipeline(ChannelPipeline pipeline) {
          /*
           * 客户端收到服务端回包时，也会先面对 TCP 字节流。
           * 所以客户端同样要先按长度字段拆出完整消息，再交给 StringDecoder。
           */
          pipeline.addLast(new LengthFieldBasedFrameDecoder(
                  MAX_FRAME_LENGTH,
                  0,
                  4,
                  0,
                  4
          ));
  
          pipeline.addLast(new StringDecoder(CharsetUtil.UTF_8));
  
          /*
           * 客户端写出请求时，出站顺序仍然是：
           * StringEncoder -> LengthFieldPrepender。
           *
           * 这样服务端收到的字节格式才和它的 LengthFieldBasedFrameDecoder 匹配。
           */
          pipeline.addLast(new LengthFieldPrepender(4));
          pipeline.addLast(new StringEncoder(CharsetUtil.UTF_8));
  
          /*
           * 到达业务 Handler 的回包已经是完整 String。
           * 客户端不需要知道前面曾经有 4 字节长度字段。
           */
          pipeline.addLast(new EchoClientHandler());
      }
  }
  ```

- EchoClientHandler.java

  ```java
  package v3;
  
  import io.netty.channel.ChannelHandlerContext;
  import io.netty.channel.ChannelInboundHandlerAdapter;
  
  public class EchoClientHandler extends ChannelInboundHandlerAdapter {
      @Override
      public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
          /*
           * 为什么客户端这里拿到的还是 String：
           *
           * 服务端返回的真实网络数据是：4 字节长度 + 字符串正文。
           * 客户端 Pipeline 会先用 LengthFieldBasedFrameDecoder 去掉长度字段并拆出完整包，
           * 再用 StringDecoder 把正文转成 String。
           */
          String text = (String) msg;
          System.out.println("client received: " + text);
  
          /*
           * Demo 只验证一次请求和一次回显。
           * 收到完整回包后关闭连接，程序执行路径最清楚。
           */
          ctx.close();
      }
  
      @Override
      public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
          cause.printStackTrace();
          ctx.close();
      }
  }
  ```

##### 理解

```
1. TCP 是字节流，不是消息队列

TCP 不保证一次 writeAndFlush 对应一次 channelRead。

可能出现：

半包：
发送方发了一条完整消息，但接收方第一次只收到一部分。

粘包：
发送方连续发了多条消息，接收方一次 channelRead 收到了多条粘在一起的数据。
```

```
2. StringDecoder 不能解决粘包 / 半包

StringDecoder 只负责：

ByteBuf -> String

它不知道一条业务消息的边界。

所以只加 StringDecoder，只能解决“字节转字符串”的问题，不能解决“哪里是一条完整消息”的问题。
```

```
3. LengthFieldPrepender 的作用

LengthFieldPrepender 用在出站方向。

它会在真正的消息正文前面自动加一个长度字段。

例如业务代码写：

hello netty

实际网络发送：

00 00 00 0B hello netty
```

```
4. LengthFieldBasedFrameDecoder 的作用

LengthFieldBasedFrameDecoder 用在入站方向。

它先读前面的长度字段，知道正文应该有多长。

如果正文还没收够：
不传给后面的 StringDecoder
不进入业务 Handler

如果正文已经收够：
切出一条完整消息
去掉长度字段
交给后面的 StringDecoder
```

```
5. 为什么 LengthFieldBasedFrameDecoder 要放在 StringDecoder 前面

因为必须先判断“一条消息是否完整”，再把完整正文转成 String。

正确顺序：

字节流
-> LengthFieldBasedFrameDecoder 拆出完整消息
-> StringDecoder 转成 String
-> 业务 Handler

如果先 StringDecoder，还是不知道该截取多少字节才是一条完整字符串消息。
```

```
6. 为什么代码里 LengthFieldPrepender 写在 StringEncoder 前面

Pipeline 添加顺序是：

LengthFieldPrepender
StringEncoder

但出站方向是反着走的。

所以真正执行顺序是：

业务 Handler 写 String
-> StringEncoder 把 String 转成 ByteBuf
-> LengthFieldPrepender 在 ByteBuf 前面加长度
-> 网络发送
```

```
7. maxFrameLength 很重要

LengthFieldBasedFrameDecoder 里配置了：

MAX_FRAME_LENGTH = 1024 * 1024

表示一条消息最大允许 1MB。

如果长度字段声明的消息超过这个值，Netty 会抛 TooLongFrameException，不会交给业务 Handler。

这个限制是为了防止超大包占用内存。
```

##### 一句话总结

```
StringDecoder / StringEncoder 解决的是：字节和字符串怎么互转。

LengthFieldPrepender / LengthFieldBasedFrameDecoder 解决的是：
TCP 字节流里，怎么判断一条完整消息的边界。

maxFrameLength 解决的是：
不能让一条消息无限大，防止内存被超大包打爆。
```

