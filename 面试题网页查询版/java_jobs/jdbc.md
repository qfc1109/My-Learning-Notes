# JDBC

### 1.为什么需要jdbc

之前存储数据 使用序列化方式,缺点 不适合大量数据存储，所以如果是大量数据 还是推荐使用数据库 ，所以还需要学习java 如何和数据库进行交互得技术  这个也是jdbc得作用  而且jdbc学习也会为了以后更好学习mybatis框架(底层就是jdbc)

### 2.什么是jdbc

jdbc:(java database connection)是java数据库连接得简称,是javaEE的一个核心组具  是一种用于执行SQL语句的一套完整API， 它里面提供一个完整的类和接口   这些接口和类 定义了访问数据库的规则   但是要实现哪种数据库 必须要得到数据库厂商的许可(`驱动包jar`)

### 3.JDBC涉及的类和接口 --- 笔试题(选择题)

- DriverManager: 驱动管理类，用于加载驱动包的信息 可以创建数据库连接 
- Connection: 数据库连接   负责和数据库进行交互  还负责创建 Statement对象
- Statement: 用于执行sql语句(增 删 改 查)
- ResultSet: 只有查询语句会返回结果集合对象 负责保存查询语句查出来的内容 

![image-20250724163553919](../../typora_images/image-20250724163553919.png)

### 4.jdbc使用步骤 --- 面试题

- 加载驱动类(`前提:需要先导入好驱动包`)
- 通过DriverManager管理驱动类  创建数据库连接
- 通过连接对象 创建Statement对象(核心对象)
- 通过Statement对象 去执行sql语句
  - 如果是查询语句  会返回ResultSet对象 需要处理结果集
- 关闭资源



### 5.sql注入 --- 高频面试题

sql注入:一般是前端可以传递一些`非法参数`  最后通过`字符串拼接`的方式 来处理sql语句  最终执行sql语句 可能执行效果 不是按照程序员预期执行  达到了服务器的目的  比如: delete from 表 where name='随便写'  or 1=1  这里or 1=1 就是非法参数  就会造成明明只是删除一条  最后删除全部数据

```java
String name=" java' or '1'='1 ";
//delete from jdbcUser where name='  java' or '1'='1   '
delete(name);
```

#### 5.1 解决方案(预编译)

使用预编译对象PreparedStatement来解决 ,它会先编译sql语句  目的是让sql语句结构 是固定的, 并且sql语句的参数 是通过? 做占位符   同时还可以实现一次编译 多次运行  执行效率也会高一些 

```java
public static void main(String[] args){    
  String name=" java' or '1'='1 ";
  //delete from jdbcUser where name='  java' or '1'='1   '
   delete2(name);
}
    public static void delete2(String name) throws ClassNotFoundException, SQLException {
        Class.forName(driver);
        Connection conn=DriverManager.getConnection(url,username,password);
        //预编译对象 要先传入sql语句 对它进行编译
        String sql="delete from jdbcUser where name=?";
        //insert into 表 values(null,?,?,?,?);
        PreparedStatement pstmt=
                conn.prepareStatement(sql);
        //?做占位符的  执行语句前 要给?赋值
        //pstmt.set类型(整数(给第几个?赋值) ,数据 )
        pstmt.setString(1,name);
        int i=pstmt.executeUpdate(); //不能传入sql
        System.out.println("删除了"+i+"条");
        pstmt.close();
        conn.close();
    }
```



#### 5.2 PreparedStatement和Statement区别 --- 面试题

#### 5.3 mybatis中#{} 和 ${} 区别 --- 面试题

- ${}: 底层是通过Statement实现的, 是通过`字符串拼接`的方式 来处理参数  会存在`sql注入的隐患` 一般用于编写表名 或者字段名 这种不需要预编译的数据
- #{}: 底层是通过PreparedStatement实现的,是`预编译`对象  要先编译sql语句  多次运行  执行效率高于Statement， 是采用`? 作为占位符`来处理参数  可以`防止sql注入`   比较安全 大部分都会使用这种方式来执行sql语句  

### 6.jdbc工具类封装

```java
//jdbc工具类1.0的: 把jdbc代码 提取出来统一处理
public class Jdbcs {
    //四个属性经常修改, 但是经常修改的部分
    //java规范是推荐 把这些内容 放入java代码直接编写的
    //而是把他们单独提出来形成一个文件(配置文件)
    //配置文件: xml  properties  yml ...
    private static String driver;
    private static String url;
    private static String username;
    private static String password;
    static{ //会再类加载执行一次  非常适合读取配置文件...
        //通过当前类的类加载器 获取本地文件生成io流
        InputStream is=Jdbcs.class.getClassLoader()
                            .getResourceAsStream("config/jdbc.properties");
        Properties p=new Properties();
        try {
            p.load(is);  //读取properties文件给p对象赋值
            //String value=p.getProperty("key");
            driver=p.getProperty("driver");
            url=p.getProperty("url");
            username=p.getProperty("username");
            password=p.getProperty("password");
            Class.forName(driver);
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
    //获取连接的通用方法
    public static Connection getConn(){
        Connection conn = null;
        try {
            conn = DriverManager.getConnection(url,username,password);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return conn;
    }
    //关闭资源的通用方法   可变长参数... 类型不同(AutoCloseable)
    //bug:传参的顺序的就是关闭的顺序(先创建后关闭)
    public static void close(AutoCloseable ... o){
        for(AutoCloseable a:o){
            try {
                if(a!=null)a.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
    //增删改的通用方法
    //bug: sql语句参数的顺序和个数 必须和sql语句中的?一一对应
    public static int update(String sql,Object ... o){
        int result= 0;
        Connection conn= null;
        PreparedStatement pstmt= null;
        try {
            conn=getConn();
            pstmt=conn.prepareStatement(sql);
            if(o!=null) { //是否有参数
                for (int i = 0; i < o.length; i++) {
                    pstmt.setObject(i + 1, o[i]);
                }
            }
            result = pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            close(pstmt,conn);
        }
        return result;
    }
    //查询半通用方法
    public static Connection conn= null;
    public static PreparedStatement pstmt= null;
    public static ResultSet select(String sql,Object ... o){
        ResultSet rs=null;
        try {
            conn=getConn();
            pstmt=conn.prepareStatement(sql);
            if(o!=null) { //是否有参数
                for (int i = 0; i < o.length; i++) {
                    pstmt.setObject(i + 1, o[i]);
                }
            }
            rs=pstmt.executeQuery();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        //finally {
            //不能关闭 如果关闭了 外面就无法使用rs处理结果集
            //close(rs,pstmt,conn);
        //}
        return rs;
    }
}
```

### 7.jdbc如何做事务管理 --- 面试题

jdbc做事务类似于mysql数据库,都是自动提交事务，如果想自己实现事务 需要手动提交, ==jdbc本身是通过Connection对象来完成事务操作的==   实现步骤如下:

- conn.setAutoCommit(false);//设置手动提交
- 如果没有发送异常conn.commit();//提交事务
- 如果出现异常 conn.rollback();//回滚事务

### 8.什么是ThreadLocal --- 面试题

ThreadLocal是java中的一个特殊的类,用于再多线程的环境下 维护线程的局部变量 ,一般情况下 如果多个线程共享同一个变量 可能引发线程安全的问题,而ThreadLocal可以为每个线程提供一个独立的变量副本,每个线程都可以独立修改这个副本 不会影响到其他线程对象的副本   适合再多线程下共享资源时使用： 比如: 存储数据库连接，Session会话管理....    常用方法如下:

- set(): 设置当前线程的变量副本
- get():  获取当前线程的变量副本
- remove(): 清除当前线程的变量副本

