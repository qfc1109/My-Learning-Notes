## MyBatis-Plus

> 官网：https://baomidou.com/

### 1.什么是MyBatis-Plus ---面试题

MyBatis-Plus（简称 MP）是基于 MyBatis 进行增强的持久层框架，它在保留 MyBatis 灵活性的基础上，进一步简化了单表的增删改查开发，提供了通用 Mapper、条件构造器、分页插件、自动填充、乐观锁等功能，让开发者可以更专注于业务逻辑而不是重复写 SQL。

> 特点：只做增强，不做改变
>
> 说明：MyBatis-Plus 不会替代 MyBatis，它本质上还是 MyBatis，只是帮你把很多重复代码封装好了


#### 1.1 MyBatis-Plus能做什么

- 自动帮我们完成单表的常用 CRUD
- 提供通用的 Mapper 接口，减少 XML 和接口方法编写
- 提供 Lambda 条件构造器，写条件更安全，更直观
- 提供分页插件，查询分页数据非常方便
- 提供自动填充机制，解决创建时间、修改时间这类字段重复写入问题
- 提供乐观锁插件，解决并发更新问题
- 提供逻辑删除，避免真实删除数据带来的风险



#### 1.2 MyBatis-Plus和MyBatis的关系

- MyBatis 是基础框架，负责 SQL 执行和映射
- MyBatis-Plus 是增强框架，底层还是 MyBatis
- MyBatis-Plus 可以直接和 MyBatis 共存
- 如果遇到复杂查询、多表关联查询，仍然可以回到 MyBatis 的 XML 写法

> 记忆：简单 CRUD 用 MyBatis-Plus，复杂 SQL 用 MyBatis



### 2.为什么要学习MyBatis-Plus

在实际开发中，很多表操作都是重复的：

- 新增一条记录
- 根据主键删除
- 根据主键修改
- 根据条件查询
- 分页查询

如果完全使用 MyBatis，我们需要自己写 Mapper 接口、XML、SQL 语句、分页逻辑等；而 MyBatis-Plus 提供了大量现成的方法，开发效率更高，代码更简洁，维护成本更低。


### 3.快速入门

#### 3.1 导入依赖

创建 maven 项目后，导入 MyBatis-Plus、数据库驱动、测试依赖等。

```xml
<dependencies>
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.5.7</version>
    </dependency>

    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <version>8.4.0</version>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

> 如果是纯 MyBatis 项目，也可以只导入 mybatis-plus 相关核心依赖，不一定必须使用 spring boot starter

#### 3.2 创建数据表

```sql
drop table if exists user;
create table user(
    id bigint primary key auto_increment,
    username varchar(255),
    password varchar(255),
    age int,
    email varchar(255),
    create_time datetime,
    update_time datetime,
    deleted int default 0,
    version int default 1
);

insert into user values
(1,'admin','admin',18,'admin@xx.com',now(),now(),0,1),
(2,'zhangsan','123',20,'zs@xx.com',now(),now(),0,1),
(3,'lisi','456',22,'ls@xx.com',now(),now(),0,1);
```



#### 3.3 创建实体类

```java
public class User {
    private Long id;
    private String username;
    private String password;
    private Integer age;
    private String email;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer deleted;
    private Integer version;
}
```


#### 3.4 创建Mapper接口

MyBatis-Plus 的 Mapper 接口只需要继承 `BaseMapper<T>` 就可以获得很多通用方法。

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
}
```



#### 3.5 Spring Boot 整合 MyBatis-Plus 的配置文件

在 Spring Boot 项目中整合 MyBatis-Plus 时，核心就是把**数据源**、**MyBatis-Plus 配置**、**Mapper XML 映射文件位置**配置好。  
如果你项目里还需要使用 XML 写复杂 SQL，也要把 `mapper-locations` 配置正确。

```yml
server:
  port: 9991  # 应用服务端口

spring:
  main:
    allow-circular-references: true #允许循环依赖
  datasource:
    # MySQL数据库连接配置
    driver-class-name: com.mysql.cj.jdbc.Driver  # MySQL驱动类
    url: jdbc:mysql://localhost:3306/testtest?useUnicode=true&characterEncoding=utf8&autoReconnect=true&rewriteBatchedStatement=true
    username: root  # 数据库用户名
    password: root  # 数据库密码

  # 其他常见组件配置，例如 redis、rabbitmq、文件上传等，也可以继续写在这里
  # data:
  #   redis:
  #     cluster:
  #       nodes:
  #         - localhost:6379
  # rabbitmq:
  #   host: localhost
  #   port: 5672
  #   username: qfc
  #   password: 123456
  #   virtual-host: /qfc
  
  # SQL初始化配置（暂时禁用以避免冲突）
  sql:
    init:
      mode: never  # 暂时禁用SQL初始化 

mybatis-plus:
  # 如果使用 XML 映射文件，必须配置 mapper-locations
  mapper-locations: classpath*:/mapper/**/*.xml
  configuration:
    map-underscore-to-camel-case: true  # 开启下划线转驼峰
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl  # 控制台输出 SQL 日志
  global-config:
    db-config:
      id-type: auto  # 主键策略

logging:
  level:
    com.baomidou.mybatisplus: debug
```

> 说明：
>
> - `mapper-locations` 用来告诉 MyBatis-Plus 去哪里找 XML 文件
> - `classpath*:/mapper/**/*.xml` 表示扫描 `resources/mapper` 下所有子目录的 XML
> - 如果你只用 `BaseMapper` 做简单 CRUD，可以不写 XML
> - 如果有多表关联、复杂查询、动态 SQL，建议使用 XML 映射文件

#### 3.6 关联映射文件的写法

如果你的 Mapper 接口中写了自定义方法，比如多表查询、复杂条件查询，那么需要配套 XML 文件。

**1）Mapper 接口**

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    User selectUserDetail(Long id);
}
```

**2）XML 映射文件位置**

建议放在：

```text
src/main/resources/mapper/UserMapper.xml
```

如果是多模块项目，也可以按照包名分目录存放，比如：

```text
src/main/resources/mapper/user/UserMapper.xml
```

**3）XML 编写方式**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">

    <select id="selectUserDetail" resultType="com.example.entity.User">
        select id, username, password, age, email, create_time, update_time, deleted, version
        from user
        where id = #{id}
    </select>

</mapper>
```

> 注意：
>
> - `namespace` 必须写 Mapper 接口的全限定类名
> - `id` 必须和接口中的方法名一致
> - `resultType` 可以写实体类全限定名，也可以写别名

**4）常见配置补充**

如果你希望 XML 和接口分层更清晰，建议再补充：

```yml
mybatis-plus:
  mapper-locations: classpath*:/mapper/**/*.xml
  type-aliases-package: com.example.entity
```

这样实体类可以少写一些全限定名，XML 也会更简洁。

#### 3.7 常见配置说明

- `map-underscore-to-camel-case: true`  
  数据库字段 `create_time` 自动映射为实体类属性 `createTime`

- `log-impl: org.apache.ibatis.logging.stdout.StdOutImpl`  
  打印 SQL，方便开发阶段排查问题

- `id-type: auto`  
  数据库主键自增，适合传统单库项目

- `allow-circular-references: true`  
  允许循环依赖，属于特殊场景配置，尽量减少使用

- `mapper-locations`  
  XML 文件路径配置，**只要你使用 XML，就一定要配**

#### 3.8 实战建议

一般在 Spring Boot + MyBatis-Plus 项目里，推荐这样搭配：

- 简单增删改查：直接用 `BaseMapper`
- 复杂 SQL：写 XML
- 服务层业务逻辑：写 `Service`
- 统一分页、自动填充、逻辑删除：通过 MyBatis-Plus 插件完成

> 记忆：
>
> - 配置文件负责“找到数据库、找到 XML、打开日志”
> - XML 负责“写复杂 SQL”
> - Mapper 负责“定义接口”
> - Service 负责“承接业务”


#### 3.6 测试CRUD

```java
@SpringBootTest
class UserMapperTest {

    @Autowired
    private UserMapper userMapper;

    @Test
    void testSelectList() {
        List<User> users = userMapper.selectList(null);
        System.out.println(users);
    }
}
```

> `selectList(null)` 表示查询全部数据，条件为空


### 4.MyBatis-Plus的核心功能

#### 4.1 BaseMapper ---通用Mapper

`BaseMapper<T>` 中已经封装好了常用方法：

- `insert(T entity)`：新增
- `deleteById(Serializable id)`：根据 id 删除
- `deleteByMap(Map<String, Object> columnMap)`：根据 map 删除
- `deleteBatchIds(Collection<?> idList)`：批量删除
- `updateById(T entity)`：根据 id 修改
- `selectById(Serializable id)`：根据 id 查询
- `selectBatchIds(Collection<? extends Serializable> idList)`：批量查询
- `selectByMap(Map<String, Object> columnMap)`：根据 map 查询
- `selectOne(Wrapper<T> queryWrapper)`：查询一条
- `selectList(Wrapper<T> queryWrapper)`：查询多条
- `selectPage(Page<T> page, Wrapper<T> queryWrapper)`：分页查询

> 说明：这些方法大多数情况下已经够用，能显著减少重复代码


#### 4.2 IService和ServiceImpl

除了 Mapper 层，MyBatis-Plus 还提供了业务层通用接口：

- `IService<T>`
- `ServiceImpl<M extends BaseMapper<T>, T>`

它们进一步封装了常用业务方法，比如：

- `save(T entity)`
- `saveBatch(Collection<T> entityList)`
- `removeById(Serializable id)`
- `updateById(T entity)`
- `getById(Serializable id)`
- `list()`
- `page(Page<T> page)`

> 一般开发中，Mapper 层负责数据访问，Service 层负责业务处理


### 5.常用注解

#### 5.1 @TableName

用于指定实体类对应的表名。

```java
@TableName("user")
public class User {
}
```

> 如果类名和表名不一致，就需要加这个注解


#### 5.2 @TableId

用于指定主键字段。

```java
@TableId(type = IdType.AUTO)
private Long id;
```

常见主键策略：

- `AUTO`：数据库自增
- `ASSIGN_ID`：雪花算法，适合分布式
- `ASSIGN_UUID`：使用 UUID
- `INPUT`：手动输入


#### 5.3 @TableField

用于指定普通字段映射关系。

```java
@TableField("create_time")
private LocalDateTime createTime;
```

也可以设置一些额外规则：

- `exist = false`：表示该字段不是数据库字段
- `fill = FieldFill.INSERT`：插入时自动填充
- `fill = FieldFill.INSERT_UPDATE`：插入和更新时自动填充


#### 5.4 @TableLogic

用于逻辑删除。

```java
@TableLogic
private Integer deleted;
```

> 逻辑删除不会真正删除数据库数据，而是修改一个标识字段，避免误删


### 6.常用查询构造器

MyBatis-Plus 最强大的地方之一就是条件构造器，常见的有：

- `QueryWrapper<T>`
- `LambdaQueryWrapper<T>`
- `UpdateWrapper<T>`
- `LambdaUpdateWrapper<T>`


#### 6.1 QueryWrapper

```java
QueryWrapper<User> qw = new QueryWrapper<>();
qw.eq("username", "admin")
  .ge("age", 18)
  .like("email", "@xx.com");
List<User> users = userMapper.selectList(qw);
```

常用方法：

- `eq`：等于
- `ne`：不等于
- `gt`：大于
- `ge`：大于等于
- `lt`：小于
- `le`：小于等于
- `like`：模糊查询
- `between`：范围查询
- `in`：in 查询
- `orderByAsc` / `orderByDesc`：排序


#### 6.2 LambdaQueryWrapper

Lambda 写法可以避免字段名写错，更安全。

```java
LambdaQueryWrapper<User> lqw = new LambdaQueryWrapper<>();
lqw.eq(User::getUsername, "admin")
   .ge(User::getAge, 18);
List<User> users = userMapper.selectList(lqw);
```

> 推荐开发中优先使用 Lambda 写法，代码更清晰，也更不容易写错字段名


#### 6.3 条件判断拼接

```java
LambdaQueryWrapper<User> lqw = new LambdaQueryWrapper<>();
lqw.eq(StringUtils.hasText(username), User::getUsername, username)
   .ge(age != null, User::getAge, age);
```

> 第一个参数是条件，条件成立才拼接 SQL


### 7.分页插件 ---重点、面试题

MyBatis-Plus 内置分页插件，分页查询非常方便。

#### 7.1 使用步骤

1. 配置分页拦截器
2. 创建 `Page` 对象
3. 调用分页查询方法
4. 获取分页结果

```java
@Configuration
@MapperScan("com.example.mapper")
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```


#### 7.2 分页查询代码

```java
@Test
void testPage() {
    Page<User> page = new Page<>(1, 5);
    Page<User> result = userMapper.selectPage(page, null);
    System.out.println("当前页：" + result.getCurrent());
    System.out.println("总页数：" + result.getPages());
    System.out.println("总条数：" + result.getTotal());
    System.out.println("当前页数据：" + result.getRecords());
}
```


#### 7.3 Page常用属性

```java
public class Page<T> implements IPage<T> {
    private long current;   // 当前页
    private long size;      // 每页条数
    private long total;     // 总条数
    private long pages;     // 总页数
    private List<T> records; // 数据集合
}
```


### 8.自动填充 ---重点、面试题

很多业务字段，例如创建时间、修改时间、创建人、修改人，经常需要自动赋值，MyBatis-Plus 提供了自动填充机制。

#### 8.1 实体类字段设置

```java
@TableField(fill = FieldFill.INSERT)
private LocalDateTime createTime;

@TableField(fill = FieldFill.INSERT_UPDATE)
private LocalDateTime updateTime;
```


#### 8.2 编写元对象处理器

```java
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}
```

> 说明：自动填充本质上是在插入和更新时，帮我们给字段赋值


### 9.逻辑删除 ---重点、面试题

逻辑删除是指：删除数据时不是真的删除，而是把某个字段修改为删除状态。

#### 9.1 配置逻辑删除字段

```yml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```


#### 9.2 使用逻辑删除注解

```java
@TableLogic
private Integer deleted;
```


#### 9.3 删除效果

- 执行删除方法时，实际上执行的是 `update`
- 查询时会自动过滤掉已删除数据
- 适合业务数据保留场景

> 面试题：逻辑删除和物理删除的区别？
>
> 答案：逻辑删除只是改状态，数据还在；物理删除是真正从数据库中删除


### 10.乐观锁 ---重点、面试题

MyBatis-Plus 支持乐观锁插件，适合解决并发修改问题。

#### 10.1 原理

- 给表增加版本号字段
- 查询时取出版本号
- 更新时带上版本号作为条件
- 更新成功后版本号加 1
- 如果版本号不一致，说明数据已经被别人改过了，更新失败


#### 10.2 实体类设置

```java
@Version
private Integer version;
```


#### 10.3 插件配置

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
    return interceptor;
}
```


### 11.代码生成器

MyBatis-Plus 提供了代码生成器，可以根据数据库表自动生成：

- 实体类
- Mapper 接口
- Service 接口
- Service 实现类
- Controller
- XML 映射文件

> 说明：生成器主要用于快速搭建项目骨架，提高开发效率


### 12.MyBatis-Plus常见面试题

> 1.什么是 MyBatis-Plus？
>
> 2.MyBatis-Plus 和 MyBatis 有什么区别？
>
> 3.BaseMapper 有哪些常用方法？
>
> 4.IService 和 ServiceImpl 有什么作用？
>
> 5.@TableId、@TableField、@TableLogic 分别有什么作用？
>
> 6.什么是逻辑删除？
>
> 7.什么是自动填充？如何实现？
>
> 8.MyBatis-Plus 分页插件怎么使用？
>
> 9.什么是乐观锁？
>
> 10.常用的条件构造器有哪些？
>
> 11.为什么推荐使用 LambdaQueryWrapper？
>
> 12.MyBatis-Plus 能否写复杂 SQL？


### 13.总结

MyBatis-Plus 的核心思想就是：

- 简化单表 CRUD
- 提高开发效率
- 保留 MyBatis 的灵活性
- 让开发者聚焦业务，不再重复写大量基础 SQL

> 记忆口诀：
>
> 复杂查询用 MyBatis，简单 CRUD 用 MyBatis-Plus
