## PostgreSQL

### 1.什么是PostgreSQL

PostgreSQL，简称Postgres或PG，是一个开源的、高可靠性的关系型数据库管理系统，强调标准SQL兼容性、数据完整性、扩展性和复杂查询能力。

- 开源免费，社区活跃
- 支持标准SQL，语法风格与MySQL有相似之处，但也有自己的特色
- 支持事务，ACID特性完善
- 支持复杂数据类型，例如数组、JSON、JSONB、UUID、范围类型等
- 支持丰富的扩展能力，适合做企业级系统和高并发读写场景

> 总结：如果说MySQL更偏向“易用和普及”，那么PostgreSQL更偏向“功能强大和规范严谨”。



### 2.PostgreSQL的特点 --- 面试题

- 标准SQL支持好，兼容性强
- 事务能力强，支持严格的一致性控制
- 查询能力强，支持窗口函数、CTE、公用表表达式、复杂子查询
- 数据类型丰富，适合复杂业务建模
- 索引类型多，能针对不同场景优化查询
- 扩展能力强，可以通过插件扩展功能



### 3.PostgreSQL和MySQL的区别 --- 面试题

#### 3.1 相同点

- 都属于关系型数据库
- 都支持SQL语言
- 都支持事务、索引、视图、触发器等常用能力
- 都能配合Java、Spring、MyBatis等技术栈使用



#### 3.2 不同点

- PostgreSQL更强调标准SQL和复杂查询能力
- PostgreSQL的数据类型更丰富，例如JSONB、数组、范围类型
- PostgreSQL的函数、窗口函数、CTE等能力更强
- MySQL更适合入门和常规互联网业务，生态和使用场景更普遍
- PostgreSQL更适合对数据一致性、复杂分析、扩展能力要求更高的场景

> 如果项目中既有简单CRUD，也有复杂报表、统计、地理信息、JSON字段处理等需求，PostgreSQL通常更有优势。



### 4.PostgreSQL安装与启动

#### 4.1 Windows安装

- 下载PostgreSQL安装包
- 按向导完成安装
- 安装时记住：
  - 数据目录
  - 端口号，默认是5432
  - 超级用户postgres的密码

#### 4.2 基本服务与客户端

- 服务端：负责启动数据库服务
- 客户端：用于连接数据库并执行SQL

常见工具：

- `psql`：命令行客户端
- pgAdmin：图形化管理工具



### 5.基础概念

#### 5.1 数据库、模式、表

PostgreSQL里常见的层级关系可以理解为：

- 数据库（Database）：一个独立的数据容器
- 模式（Schema）：数据库下的逻辑命名空间
- 表（Table）：真正存储数据的结构

> 和MySQL相比，PostgreSQL的Schema概念更明显，适合做大型项目的逻辑隔离。

#### 5.2 常见对象

- 表（table）
- 视图（view）
- 索引（index）
- 序列（sequence）
- 函数（function）
- 触发器（trigger）


### 6.SQL基础语法

#### 6.1 DDL：数据定义语言

```sql
-- 创建数据库
create database demo;

-- 切换数据库：psql里通常通过连接目标库实现

-- 创建表
create table student(
    id serial primary key,
    name varchar(50) not null,
    age int,
    gender varchar(10),
    create_time timestamp default now()
);

-- 修改表结构
alter table student add column phone varchar(20);
alter table student rename column phone to mobile;
alter table student rename to tb_student;

-- 删除表
drop table tb_student;
```

#### 6.2 DML：数据操作语言

```sql
-- 新增
insert into student(name, age, gender) values ('张三', 20, '男');

-- 修改
update student set age = 21 where id = 1;

-- 删除
delete from student where id = 1;
```

#### 6.3 DQL：数据查询语言

```sql
select * from student;
select id, name, age from student where age > 18 order by age desc limit 10;
```


### 7.PostgreSQL常用数据类型

#### 7.1 数值类型

- smallint：小整型
- integer / int：整型
- bigint：大整型
- numeric(p,s)：高精度数字，适合金融场景
- real / double precision：浮点数

#### 7.2 字符串类型

- char(n)
- varchar(n)
- text

#### 7.3 日期时间类型

- date：日期
- time：时间
- timestamp：日期时间
- timestamptz：带时区的时间戳

#### 7.4 布尔类型

- boolean：true / false / null

#### 7.5 特殊类型

- json / jsonb：适合存储半结构化数据
- uuid：全局唯一标识
- array：数组
- enum：枚举
- range：范围类型

> PostgreSQL最大的特点之一就是数据类型非常丰富。


### 8.序列与自增主键

PostgreSQL中常用序列来实现自增功能，常见写法：

```sql
-- 方式1：serial
create table t_user(
    id serial primary key,
    name varchar(50)
);

-- 方式2：identity（更现代）
create table t_book(
    id integer generated always as identity primary key,
    title varchar(100)
);
```

> `serial`本质上会帮你创建序列并绑定到字段上。


### 9.约束 --- 面试题

#### 9.1 常见约束

- 非空约束：not null
- 默认约束：default
- 唯一约束：unique
- 主键约束：primary key
- 检查约束：check
- 外键约束：foreign key

```sql
create table dept(
    id int primary key,
    dept_name varchar(50) not null unique
);

create table emp(
    id int primary key generated always as identity,
    emp_name varchar(50) not null,
    age int check(age >= 0),
    dept_id int,
    constraint fk_emp_dept foreign key(dept_id) references dept(id)
);
```



#### 9.2 PostgreSQL约束特点

- `check`约束在PostgreSQL中是有效的
- 外键约束、唯一约束、主键约束都比较严格
- 适合保证数据完整性



### 10.常用查询

#### 10.1 where条件

```sql
select * from emp where age between 18 and 30;
select * from emp where dept_id is null;
select * from emp where name like '张%';
select * from emp where id in (1,2,3);
```



#### 10.2 order by 与 limit

```sql
select * from emp order by age desc;
select * from emp order by age desc limit 10 offset 20;
```

> PostgreSQL分页常用 `limit + offset`。



#### 10.3 group by 与 having

```sql
select dept_id, count(*)
from emp
group by dept_id
having count(*) > 5;
```



#### 10.4 union

```sql
select name from student_a
union
select name from student_b;
```



### 11.常用函数

#### 11.1 聚合函数

- count()
- sum()
- avg()
- max()
- min()

#### 11.2 字符串函数

- length()
- concat()
- substr()
- upper()
- lower()
- replace()

#### 11.3 日期函数

- now()
- current_date
- current_time
- date_trunc()
- age()
- extract()

```sql
select now();
select extract(year from now());
select date_trunc('month', now());
```

#### 11.4 条件函数

- case when then else end
- coalesce()
- nullif()

```sql
select name,
       case
           when age >= 18 then '成人'
           else '未成年'
       end as age_type
from student;
```


### 12.事务 --- 面试题

#### 12.1 什么是事务

事务是一组要么全部成功、要么全部失败的SQL操作集合。

#### 12.2 四大特性（ACID）

- 原子性：要么全做，要么全不做
- 一致性：前后数据状态一致
- 隔离性：事务之间互不干扰
- 持久性：提交后结果永久保存

#### 12.3 PostgreSQL事务基本使用

```sql
begin;
update account set balance = balance - 100 where id = 1;
update account set balance = balance + 100 where id = 2;
commit;

-- 出错时
rollback;
```

#### 12.4 PostgreSQL事务特点

- 支持标准事务控制
- 支持保存点 savepoint
- 默认隔离级别通常是读已提交（Read Committed）

```sql
begin;
savepoint sp1;
-- 操作
rollback to sp1;
commit;
```


### 13.隔离级别与并发问题 --- 面试题

#### 13.1 并发问题

- 脏读
- 不可重复读
- 幻读

#### 13.2 隔离级别

- Read Uncommitted
- Read Committed
- Repeatable Read
- Serializable

> 隔离级别越高，数据越安全，但并发性能越低。


### 14.索引 --- 面试题

#### 14.1 PostgreSQL支持的索引类型

- B-tree：默认索引
- Hash：等值查询
- GIN：适合数组、全文检索、JSONB
- GiST：适合范围查询、地理数据
- BRIN：适合超大表的块范围索引

#### 14.2 创建索引

```sql
create index idx_emp_name on emp(name);
create unique index idx_emp_phone on emp(phone);
```

#### 14.3 查看执行计划

```sql
explain analyze select * from emp where name = '张三';
```

#### 14.4 索引使用建议

- 经常作为查询条件的字段适合加索引
- 主外键字段适合加索引
- 经常排序、分组的字段适合加索引
- 不要盲目加很多索引，增删改会变慢


### 15.视图

视图是虚拟表，本质上是封装好的查询语句。

```sql
create view v_emp as
select id, name, dept_id from emp;

select * from v_emp;
drop view v_emp;
```

优点：

- 复用查询逻辑
- 简化复杂SQL
- 可以增强安全性

缺点：

- 不会提升查询性能
- 复杂视图可能影响维护


### 16.子查询

#### 16.1 where型子查询

```sql
select * from emp
where id = (select max(id) from emp);
```

#### 16.2 from型子查询

```sql
select dept_id, avg(age)
from (
    select dept_id, age
    from emp
) t
group by dept_id;
```

#### 16.3 exists型子查询

```sql
select * from dept d
where exists (
    select 1 from emp e where e.dept_id = d.id
);
```


### 17.窗口函数 --- PostgreSQL特色

PostgreSQL对窗口函数支持很好，适合做排名、统计、累计计算。

```sql
select
    name,
    dept_id,
    salary,
    row_number() over(partition by dept_id order by salary desc) as rn
from emp;
```

常见窗口函数：

- row_number()
- rank()
- dense_rank()
- sum() over()
- avg() over()


### 18.JSON与JSONB

PostgreSQL中JSON和JSONB非常常用，适合存储半结构化数据。

```sql
create table t_config(
    id serial primary key,
    content jsonb
);

insert into t_config(content) values ('{"name":"redis","type":"cache"}');

select content->>'name' from t_config;
```

> JSONB更适合查询和索引，JSON更偏原样存储。


### 19.PostgreSQL与Java整合

#### 19.1 JDBC连接思路

- 导入PostgreSQL驱动
- 配置连接URL
- 使用DriverManager或连接池创建连接
- 执行SQL并处理结果集

#### 19.2 Spring Boot整合

常见配置示例：

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/demo
spring.datasource.username=postgres
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver
```

#### 19.3 MyBatis整合

- 配置数据源为PostgreSQL
- Mapper XML中编写PostgreSQL方言SQL
- 注意分页、函数、数据类型的差异


### 20.MyBatis在PostgreSQL中的注意点

- PostgreSQL主键自增更推荐用 `serial` 或 `identity`
- 分页语法常用 `limit + offset`
- 字段名、表名如果使用大写或特殊字符，通常需要双引号
- `resultType` 和 `resultMap` 的使用思路与MySQL一致
- 如果涉及JSONB、数组、UUID等类型，需要注意Java类型映射



### 21.PostgreSQL常见面试题

> 1.什么是PostgreSQL？
>
> 2.PostgreSQL和MySQL的区别？
>
> 3.PostgreSQL有哪些常用数据类型？
>
> 4.PostgreSQL如何实现自增主键？
>
> 5.PostgreSQL事务的特性是什么？
>
> 6.PostgreSQL支持哪些索引类型？
>
> 7.什么是JSONB？和JSON有什么区别？
>
> 8.PostgreSQL怎么分页？
>
> 9.PostgreSQL如何查看执行计划？
>
> 10.PostgreSQL与MyBatis整合时要注意什么？



### 22.学习总结

PostgreSQL学习时可以重点把握以下几个方向：

- 基础SQL语法和MySQL的共性
- PostgreSQL独有的数据类型和窗口函数
- 事务、索引、视图、子查询等核心能力
- JSONB、数组、UUID等适合业务建模的类型
- 与Java、Spring Boot、MyBatis的整合方式

> 如果你已经学过MySQL，再学习PostgreSQL时，重点不是“重新学一遍SQL”，而是关注“PostgreSQL比MySQL多了什么、强了什么、以及怎么在项目里用起来”。
