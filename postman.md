## Postman

### 1.什么是Postman

Postman 是一款常用的 API 调试与接口管理工具，主要用于发送 HTTP 请求、查看响应结果、保存接口文档、管理环境变量和接口集合。

+ 适合后端开发、前后端联调、接口测试、接口文档管理
+ 可以快速模拟浏览器、前端页面、第三方系统发起的请求
+ 支持常见请求方式：GET、POST、PUT、DELETE、PATCH 等

---

### 2.为什么要学习Postman

在开发 Web 接口时，很多场景都需要手动测试接口是否正常：

+ 接口参数是否正确
+ 返回值是否符合预期
+ 请求头、请求体、路径参数是否生效
+ 登录鉴权、Token 是否正确
+ 接口是否支持跨域、分页、文件上传等功能

> 如果只靠浏览器访问，很多接口类型无法方便测试，所以需要 Postman 这类工具。

---

### 3.Postman可以做什么

#### 3.1 发送不同类型的请求

+ GET：查询数据
+ POST：新增数据
+ PUT：修改数据
+ DELETE：删除数据
+ PATCH：局部更新数据

#### 3.2 携带不同类型的参数

+ 路径参数
+ 查询参数
+ 表单参数
+ JSON 请求体
+ 文件上传
+ 请求头参数
+ Cookie 参数

#### 3.3 管理接口测试

+ 保存接口
+ 分类管理接口集合
+ 重复调用接口
+ 批量测试接口
+ 导出/导入接口集合

#### 3.4 管理环境变量

+ 开发环境
+ 测试环境
+ 生产环境
+ 同一个接口可切换不同地址、Token、参数

---

### 4.Postman基础界面认识

Postman 的核心区域通常包括：

+ 请求方式选择区：GET、POST、PUT、DELETE
+ 请求地址输入区：输入接口 URL
+ 参数配置区：Params、Authorization、Headers、Body、Pre-request Script、Tests
+ 响应结果区：查看状态码、响应体、响应时间、响应大小

---

### 5.第一个Postman请求

#### 5.1 发送一个GET请求

假设后端提供了一个测试接口：

```java
@RestController
public class TestController {
    @RequestMapping("/hello")
    public String hello() {
        return "hello postman";
    }
}
```

在 Postman 中：

+ 选择请求方式：GET
+ 输入地址：`http://localhost:8080/hello`
+ 点击 Send 发送请求

如果接口正常，会看到：

```text
hello postman
```

#### 5.2 查看响应信息

Postman 返回结果时，重点关注：

+ Status：状态码，如 200、404、500
+ Time：接口响应时间
+ Size：返回内容大小
+ Body：响应数据

---

### 6.常见请求方式使用

#### 6.1 GET请求

GET 一般用于查询数据，参数通常放在 URL 后面。

```text
http://localhost:8080/user?id=1
```

#### 6.2 POST请求

POST 常用于新增数据，参数可以放在 Body 中。

```java
@PostMapping("/user")
public String addUser(@RequestBody User user) {
    return "新增成功";
}
```

#### 6.3 PUT请求

PUT 常用于完整修改数据。

#### 6.4 DELETE请求

DELETE 常用于删除数据。

---

### 7.请求参数配置

#### 7.1 Query参数

Query 参数就是 URL 中的查询字符串。

```text
http://localhost:8080/book?name=spring&age=18
```

在 Postman 中可以通过 Params 页签填写。

#### 7.2 路径参数

路径参数通常写在 URL 路径中。

```java
@GetMapping("/book/{id}")
public String getBook(@PathVariable("id") Integer id) {
    return "book:" + id;
}
```

请求示例：

```text
http://localhost:8080/book/1
```

#### 7.3 表单参数

表单参数通常用于 `x-www-form-urlencoded`。

```java
@PostMapping("/login")
public String login(String username, String password) {
    return "登录成功";
}
```

#### 7.4 JSON请求体

JSON 请求体常用于接口提交复杂对象。

```java
@PostMapping("/order")
public String save(@RequestBody Order order) {
    return "保存订单成功";
}
```

请求体示例：

```json
{
  "name": "张三",
  "age": 18,
  "address": "北京"
}
```

#### 7.5 请求头参数

请求头常用于传递 Token、Content-Type、User-Agent 等信息。

```text
Authorization: Bearer xxx
Content-Type: application/json
```

#### 7.6 文件上传

文件上传一般使用 `form-data`。

```java
@PostMapping("/upload")
public String upload(MultipartFile file) {
    return "上传成功";
}
```

---

### 8.环境变量管理

Postman 的环境变量可以帮助我们在不同环境之间快速切换。

#### 8.1 环境变量的作用

+ 避免重复修改接口地址
+ 统一管理 Token、端口号、前缀路径
+ 开发、测试、生产环境切换方便

#### 8.2 环境变量写法

```text
{{baseUrl}}
{{token}}
{{userId}}
```

例如：

```text
{{baseUrl}}/user/{{userId}}
```

#### 8.3 常见变量来源

+ 当前环境变量
+ 全局变量
+ Collection 变量
+ 本地变量

---

### 9.集合Collection的使用

Collection 是 Postman 中管理接口的核心方式。

#### 9.1 什么是Collection

Collection 可以理解为接口集合，方便把同一个项目的接口统一管理。

#### 9.2 Collection的好处

+ 接口分类清晰
+ 方便多人协作
+ 便于批量运行接口
+ 可以配合环境变量和脚本使用

#### 9.3 常见分类方式

+ 用户模块
+ 订单模块
+ 商品模块
+ 权限模块

---

### 10.脚本功能

Postman 支持在请求前后执行脚本，适合做自动化处理。

#### 10.1 Pre-request Script

请求发送前执行，可以用于：

+ 生成随机值
+ 设置变量
+ 签名计算
+ 时间戳生成

#### 10.2 Tests

请求完成后执行，可以用于：

+ 校验状态码
+ 校验响应内容
+ 保存响应数据到变量
+ 断言接口是否正确

#### 10.3 简单测试示例

```javascript
pm.test("状态码是200", function () {
    pm.response.to.have.status(200);
});
```

---

### 11.断言与自动化测试

Postman 不只是一个请求工具，它还可以做接口自动化测试。

#### 11.1 常见断言内容

+ 状态码是否正确
+ 返回字段是否存在
+ 返回值是否等于预期
+ 响应时间是否过长

#### 11.2 断言示例

```javascript
pm.test("响应体包含success", function () {
    pm.expect(pm.response.text()).to.include("success");
});
```

#### 11.3 断言的意义

+ 快速发现接口问题
+ 回归测试接口功能
+ 保证修改代码后接口行为稳定

---

### 12.接口调试常见问题

#### 12.1 404问题

可能原因：

+ 请求地址写错
+ Controller 路径写错
+ 请求方式不匹配

#### 12.2 415问题

可能原因：

+ 请求体类型不匹配
+ `Content-Type` 设置错误

#### 12.3 500问题

可能原因：

+ 后端代码异常
+ 参数绑定错误
+ 数据库操作失败

#### 12.4 参数为空

可能原因：

+ 参数名不一致
+ 没有选择正确的参数提交方式
+ 忘记加 `@RequestBody` 或 `@PathVariable`

---

### 13.Postman学习建议

#### 13.1 学习顺序

1. 熟悉界面
2. 掌握请求方式
3. 学会传参
4. 学会环境变量
5. 学会集合管理
6. 学会脚本和断言
7. 学会批量测试

#### 13.2 学习目标

+ 能独立调试接口
+ 能快速验证后端功能
+ 能辅助接口联调
+ 能写简单的接口测试脚本

---

### 14.总结

Postman 是接口开发和测试中非常重要的工具，能够帮助我们快速构造请求、查看响应、管理接口和环境变量，并支持脚本、断言和自动化测试。

> 对于后端开发者来说，Postman 是接口联调和接口验证的必备工具。
