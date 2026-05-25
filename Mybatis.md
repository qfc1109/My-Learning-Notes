## MyBatis

> 官网：https://mybatis.net.cn/index.html

### 1.什么是Mybatis ---面试题

mybatis是基于==sql开发==的==ORM==,==持久层==框架，其内部封装了jdbc，使开发者只需关注于sql语句本身，不用写繁琐的加载驱动，创建连接，结果集处理等操作，前身为ibatis，很多包的底层依然是ibatis包



#### 1.1 ORM

ORM：Object Relation Mapping（对象关系映射），实现java对象和关系型数据库里面的数据进行一一对应，这样就可以实现，以后新增一条数据就相当于新增一个对象，就是用于将数据库的操作转换成了针对于java对象的操作

```java
public class User{
    private Integer id;
    private String name;
   
}

create table user(
	a int primary key auto_increment,
    b varchar(100)
);

//第三者：来完成对象和数据库数据一一对应关系
//1.类名 ---->表名
//2.类的属性 ---->表中的字段
//这个第三者称之为映射文件

```



#### 1.2 持久层

+ 临时状态的数据：在内存中定义的对象，会随着时间超时或者系统gc，服务器关闭...会自动销毁，不会长时间保存
+ 持久状态的数据：存储到本地文件（序列化），存储数据库（mysql）他们不会随着时间超时，服务器关闭而销毁，会长时间保留
+ 持久层：就是专门负责保存持久状态的数据，说白了就是泛指对于数据库的操作（增、删、改、查），所以持久化操作就是增删改查操作



### 2.搭建Mybatis项目

+ 创建maven项目

+ 导入相关依赖==pom.xml==

  ```xml
  <properties>
  <!--mybatis通用版本号-->
      <mybatis.version>3.4.5</mybatis.version>
      <ehcache.version>2.10.4</ehcache.version>
      <mybatis-ehcache.version>1.0.0</mybatis-ehcache.version>
      <mybatis-generator-core.version>1.3.5</mybatis-generator-core.version>
      <maven-plugin-api.version>3.5.0</maven-plugin-api.version>
  </properties>
  
  <!-- Mybatis -->
          <dependency>
              <groupId>org.mybatis</groupId>
              <artifactId>mybatis</artifactId>
              <version>${mybatis.version}</version>
          </dependency>
  
          <!--mybatis缓存-->
          <dependency>
              <groupId>org.mybatis</groupId>
              <artifactId>mybatis-ehcache</artifactId>
              <version>${mybatis-ehcache.version}</version>
          </dependency>
          <!-- 缓存 -->
          <dependency>
              <groupId>net.sf.ehcache</groupId>
              <artifactId>ehcache</artifactId>
              <version>${ehcache.version}</version>
          </dependency>
  
          <!-- mybatis反向建模 -->
          <dependency>
              <groupId>org.apache.maven</groupId>
              <artifactId>maven-plugin-api</artifactId>
              <version>${maven-plugin-api.version}</version>
          </dependency>
          <dependency>
              <groupId>org.mybatis.generator</groupId>
              <artifactId>mybatis-generator-core</artifactId>
              <version>${mybatis-generator-core.version}</version>
          </dependency>
  ```

+ 创建==Mybatis配置文件==，resources包中

  ```xml
  <!--约束-->
  <?xml version="1.0" encoding="UTF-8" ?>
  <!DOCTYPE configuration
          PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
          "http://mybatis.org/dtd/mybatis-3-config.dtd">
  <!--根节点-->
  <configuration>
      <!--0.加载jdbc配置文件-->
      <properties resource="jdbc.properties"></properties>
      <!--1.基础设置:可选的-->
      <settings>
          <!--开启mybatis日志:显示一个sql语句的执行过程（jdbc做事务，连接池的创建，执行sql，参数，查询结果...）
             但是开发过程中，是必加项-->
          <setting name="logImpl" value="STDOUT_LOGGING"/>
      </settings>
      <!--2.插件:可选的 比如:分页插件PageHelper-->
      <plugins>
          <!--一个分页插件-->
          <plugin interceptor="com.github.pagehelper.PageHelper">
              <property name="offsetAsPageNum" value="true" />
              <property name="rowBoundsWithCount" value="true" />
              <!--pageSize=0时，是否查询出全部结果，默认为false-->
              <property name="pageSizeZero" value="true" />
              <!--分页合理化参数，默认文false；pageNum<=0，查询第一页；pageNum>总页数，查询最后一页-->
              <property name="reasonable" value="true" />
              <property name="params"
                        value="pageNum=pageHelperStart;pageSize=pageHelperRows;" />
              <property name="supportMethodsArguments" value="false" />
              <property name="returnPageInfo" value="none" />
          </plugin>
      </plugins>
      <!--3.环境:必选的，环境可以配置多个，但是执行只会启用一个-->
      <environments default="mysql">
          <!--一个环境-->
          <environment id="mysql">
              <!--配置事务:mybatis只提供两种事务管理
                  1.JDBC:通过jdbc做事务
                  2.MANAGED:我不做事务，是交给容器(spring ioc容器)做事务-->
              <transactionManager type="JDBC"></transactionManager>
              <!--数据源头:就是用于创建数据库连接，推荐使用连接池来实现
                  连接池(线程池，常量池):池表示一个容器(一个内存区域)里面会事先存放很多数据库连接，
                  等你需要的时候就可以直接在连接池中获取，节省了自己创建连接的时间，
                  并且使用完之后，不用关闭，自动还回连接池，保证连接池的数量
                  可以进行重复使用
                  并且如果并发量高时，连接池也会创建更多的连接保证需求，
                  并且如果并发量不高时，连接池也会回收长时间不用连接
                  ...底层以空间换时间方式，提高了效率-->
              <dataSource type="pooled">
                  <!--如果读取到了jdbc配置文件，下面value就可以通过类似于EL表达式来根据key读取value
                      比如：${key}返回value-->
                  <property name="driver" value="${jdbc.driver}"/>
                  <property name="url" value="${jdbc.url}"/>
                  <property name="username" value="${jdbc.username}"/>
                  <property name="password" value="${jdbc.password}"/>
              </dataSource>
          </environment>
          <!--一个oracle环境-->
      </environments>
      <!--4.关联映射文件：必选的-->
      <mappers>
          <mapper resource="mapper/MyuserMapper.xml"></mapper>
          <mapper resource="mapper/HuserMapper.xml"></mapper>
          <mapper resource="mapper/HuserinfoMapper.xml"></mapper>
          <mapper resource="mapper/HdeptMapper.xml"></mapper>
          <mapper resource="mapper/SstudentMapper.xml"></mapper>
          <mapper resource="mapper/SteacherMapper.xml"></mapper>
          <mapper resource="mapper/TestlockMapper.xml"></mapper>
      </mappers>
  </configuration>
  ```

+ 原来的dao包，修改成==mapper包==，提供操作的接口，而且无需实现类

+ 为每一个mapper接口提供一个映射文件xml（编写sql语句，替代之前的实现类），

  resources中创建一个mapper包存放映射文件

+ 通过mybatis工作流程测试（持久化操作）



### 3.Mybatis工作流程 ---面试题

+ 加载mybatis核心配置文件
+ 创建SqlSessionFactory对象，只需要创建一个
+ 通过SqlSessionFactory创建SqlSession(操作mybatis核心对象)
+ 通过SqlSession动态的创建Mapper接口实现类（jdk动态代理）
+ 通过Mapper接口对象，执行持久化操作（增删改查）
+ 事务提交或者回滚（只有真正提交事务，才会发送sql语句）
+ 关闭资源，sqlSession关闭

```java
@Test
    public void add() throws IOException {
        //1.加载mybatis核心配置文件(内部关联映射文件)
        InputStream is = Resources.getResourceAsStream("mybatis.xml");
        //2.创建SqlSessionFactory对象
        SqlSessionFactory sf = new SqlSessionFactoryBuilder().build(is);
        //3.通过SqlSessionFactory创建SqlSession，不是HttpSession 是SqlSession
        SqlSession session = sf.openSession();
        //4.通过sqlsession动态创建Mapper接口实现类
        MyuserMapper mapper = session.getMapper(MyuserMapper.class);
        //5.持久化操作      
        //自己先定义，后期springmvc会自动获取对象
        MyUser u = new MyUser();
        u.setUsername("aaaaa");
        u.setPassword("bbbbb");
        int i = mapper.add(u);
        System.out.println(i);
        //6.session提交或回滚事务
        session.commit(); //一定要提交 否则s内存完成的 不是真的执行sql语句
        //session.rollback();
        //7.关闭资源
        session.close();
    }
```





### 4.安装mybatis插件 ---不重要，只是idea插件添加了就行

mybatis可以快速切换mapper接口和对应的映射文件，接口的方法也可以快速定位到哪个映射文件的标签，而且还可以添加一些错误提示

==bug：==可能会随着项目越来越多，可能会引用到其他项目的相同文件com.sc.pojo.Myuser，但是项目真正运行时还是在当前项目运行，所以运行是通过的，如果想解决，可以保证不同项目中不出现相同的全类名

#### 4.1 安装方式

fiel--->settings--->plugins--->搜索mybatis--->安装mybatisX--->重启idea



### 5.使用mybatis反向生成工具 

反向生成工具，只要配置好了，可以自动根据数据库的表，动态创建实体类，mapper接口，映射文件，并且映射文件和mapper接口，生成一些常用的增删改查语句，其他需求根据需要自行编写



#### 5.1 使用步骤

1. pom.xml的==build==标签中添加plugin（generator）

```xml
<!--maven的mybatis代码生成插件-->
<build> 
    
    <plugins>
        	<!--maven的mybatis代码生成插件-->
            <plugin>
                <groupId>org.mybatis.generator</groupId>
                <artifactId>mybatis-generator-maven-plugin</artifactId>
                <version>1.3.5</version>
                <configuration>
                    <verbose>true</verbose>
                    <overwrite>true</overwrite>
                </configuration>
            </plugin>
    </plugins>
</build>

```

2. 群里下载反向生成工具的配置文件==generatorConfig.xml==（上面的插件运行时会自动读取根目录下的配置文件）---注意好对应包的路径是否正确（实体类的位置，映射文件的位置，mapper接口的位置）

   jdbc.properties文件

   ```properties
   jdbc.driver=com.mysql.cj.jdbc.Driver
   jdbc.url=jdbc:mysql://localhost:3306/sc251001?useUnicode=true&characterEncoding=utf8&autoReconnect=true&rewriteBatchedStatement=true
   jdbc.username=root
   jdbc.password=root
   # mysql驱动包的本地位置，反向工具需要使用的
   driverClassPath=D://jar//mysql-connector-java-8.0.28.jar
   ```

   generatorConfig.xml文件

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE generatorConfiguration PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
        "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd" >
<generatorConfiguration>
    <!--加载jdbc.properties配置文件-->
    <properties resource="jdbc.properties"/>
    <!--配置驱动jar包的位置-->
    <classPathEntry location="${driverClassPath}"/>
    <!--
        context:生成一组对象的环境
        id:必选，上下文id，用于在生成错误时提示
        defaultModelType:指定生成对象的样式
            1，conditional：类似hierarchical；
            2，flat：所有内容（主键，blob）等全部生成在一个对象中；
            3，hierarchical：主键生成一个XXKey对象(key class)，Blob等单独生成一个对象，其他简单属性在一个对象中(record class)
        targetRuntime:
            1，MyBatis3：默认的值，生成基于MyBatis3.x以上版本的内容，包括XXXBySample；
            2，MyBatis3Simple：类似MyBatis3，只是不生成XXXBySample；
        introspectedColumnImpl：类全限定名，用于扩展MBG
    -->
    <context id="context1" targetRuntime="MyBatis3">

        <!-- genenat entity时,生成toString -->
        <plugin type="org.mybatis.generator.plugins.ToStringPlugin"/>
        <!-- generate entity时，生成serialVersionUID -->
        <plugin type="org.mybatis.generator.plugins.SerializablePlugin"/>
        <!--不生成注释-->
        <commentGenerator>
            <property name="suppressAllComments" value="true"/>
        </commentGenerator>

        <!--配置数据库连接信息-->
        <jdbcConnection driverClass="${jdbc.driver}"
                        connectionURL="${jdbc.url}" userId="${jdbc.username}" password="${jdbc.password}">
            <property name="nullCatalogMeansCurrent" value="true"/>
        </jdbcConnection>
        <!-- java模型创建器，是必须要的元素
            负责：1，key类（见context的defaultModelType）；2，java类；3，查询类
            targetPackage：生成的类要放的包，真实的包受enableSubPackages属性控制；
            targetProject：目标项目，指定一个存在的目录下，生成的内容会放到指定目录中，如果目录不存在，MBG不会自动建目录
         -->
        <!--用于指定实体类的位置-->
        <javaModelGenerator targetPackage="com.sc.pojo"
                            targetProject="src/main/java">
            <!-- 设置是否在getter方法中，对String类型字段调用trim()方法 -->
            <property name="trimStrings" value="true"/>
        </javaModelGenerator>
        <!-- 生成SQL map的XML文件生成器，
                    注意，在Mybatis3之后，我们可以使用mapper.xml文件+Mapper接口（或者不用mapper接口），
                        或者只使用Mapper接口+Annotation，所以，如果 javaClientGenerator配置中配置了需要生成XML的话，这个元素就必须配置
                    targetPackage/targetProject:同javaModelGenerator
                 -->
        <!--用于指定映射文件位置-->
        <sqlMapGenerator targetPackage="mapper"
                         targetProject="src/main/resources"></sqlMapGenerator>

        <!-- 对于mybatis来说，即生成Mapper接口，注意，如果没有配置该元素，那么默认不会生成Mapper接口
            targetPackage/targetProject:同javaModelGenerator
            type：选择怎么生成mapper接口（在MyBatis3/MyBatis3Simple下）：
                1，ANNOTATEDMAPPER：会生成使用Mapper接口+Annotation的方式创建（SQL生成在annotation中），不会生成对应的XML；
                2，MIXEDMAPPER：使用混合配置，会生成Mapper接口，并适当添加合适的Annotation，但是XML会生成在XML中；
                3，XMLMAPPER：会生成Mapper接口，接口完全依赖XML；
            注意，如果context是MyBatis3Simple：只支持ANNOTATEDMAPPER和XMLMAPPER
        -->
        <!--用于指定mapper接口的位置-->
        <javaClientGenerator targetPackage="com.sc.mapper"
                             targetProject="src/main/java" type="XMLMAPPER"/>

        <!-- 需要逆向 enableCountByExample="false" enableUpdateByExample="false"
          enableDeleteByExample="false" enableSelectByExample="false" selectByExampleQueryId="false"
         -->

        <!--重点:需要经常修改的位置：用于根据什么表生成对应的实体类，映射文件，mapper接口
            重点注意：如果生成完毕了,相同的表不要写第二次
                实体类：会还原，自定义编写的需求就没了
                mapper接口：会还原，自定义编写的方法也没了
                映射文件：会追加，映射文件重新加一遍默认标签
                如何防止：生成过的表，不要写第二次
            -->
     <!--   <table tableName="" enableCountByExample="false" enableUpdateByExample="false"
               enableDeleteByExample="false"
               enableSelectByExample="false" selectByExampleQueryId="false">
        </table>-->
        <table tableName="" enableCountByExample="false" enableUpdateByExample="false"
               enableDeleteByExample="false"
               enableSelectByExample="false" selectByExampleQueryId="false">
        </table>

    </context>
</generatorConfiguration>  
```



3. 选择maven界面，根据plugin双击运行



### 6. 映射文件介绍

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<!--根节点，namespace是可选的
    如果添加了，就可以实现一个Mapper接口对应一个映射文件，多个映射文件标签id是可以重复的
    如果没有添加，一个mapper接口，可能会对应多个映射文件，多个映射文件标签id是不可以重复的
    编程规范是需要添加的
-->
<mapper namespace="com.sc.mapper.HuserMapper">
    <!--结果集合标签:只用于查询语句，表示返回的结果，还能够实现复杂度关联映射（查询多张表数据）-->
    <resultMap id="BaseResultMap" type="com.sc.pojo.Huser">
        <!--id标签:表示mybatis推荐表要设计主键
            column属性:表示字段 
			property:表示属性
            jdbcType标签:类型可以省略
            result标签:表示其他字段的映射关系

            并且resultMap标签是可以配置多个的，保证id唯一-->
        <id column="id" jdbcType="INTEGER" property="id"/>
        <result column="username" jdbcType="VARCHAR" property="username"/>
        <result column="password" jdbcType="VARCHAR" property="password"/>
        <result column="createtime" jdbcType="DATE" property="createtime"/>
        <result column="did" jdbcType="INTEGER" property="did"/>
    </resultMap>
    
    <!--自定义resultMap-->
    <resultMap id="myMap" type="com.sc.pojo.Huser">
        <!--主键字段-->
        <id column="id" property="id"/>
        <!--其他字段-->
        <result column="username" property="username"/>
        <result column="password" property="password"/>
        <result column="createtime" property="createtime"/>
        <result column="did" property="did"/>
    </resultMap>
    
    <!--用于定义sql语句中，可以重用的代码片段，也可以配置多个
        下面的所有标签都可以通过<include/>来包含这些内容-->
    <sql id="Base_Column_List">
        id
        , username, password, createtime, did
    </sql>
   
    <sql id="myBase">
        id
        ,username,password
    </sql>
    
    <!--查询标签:id必须对应mapper接口的方法名
        parameterType:表示mapper接口参数类型，可以省略
        查询语句必须添加resultType或resultMap，否则编译报错
        resultType:只有当类中的属性名和查询中字段名，相同时才能够自动映射（自动赋值）,否者对应的属性为null
        解决方案：1.可以给查询的字段设置别名，让别名和属性名相同也可以
                2.可以使用resultMap来实现，因为它可以自定义映射关系
        resultMap:可以自定义映射关系，属性名和查询的字段相同和不相同都可以，比较灵活，并且还可以实现复杂的关联查询
        开发过程中推荐使用resultMap
        jdbcType=INTEGER 表示参数类型，可以省略
        #{}:预编译，可以防止预输入，推荐使用
        ${}:字符串拼接，存在注入隐患
        -->
    <select id="selectByPrimaryKey" parameterType="java.lang.Integer" resultMap="BaseResultMap">
        select
        <include refid="Base_Column_List"/>
        from huser
        where id = #{id,jdbcType=INTEGER}
    </select>
    <select id="selectAll" resultMap="myMap">
        select
        <include refid="Base_Column_List"/>
        from huser
    </select>

    <delete id="deleteByPrimaryKey" parameterType="java.lang.Integer">
        delete
        from huser
        where id = #{id,jdbcType=INTEGER}
    </delete>

    <insert id="insert" parameterType="com.sc.pojo.Huser">
        insert into huser (id, username, password,
                           createtime, did)
        values (#{id,jdbcType=INTEGER}, #{username,jdbcType=VARCHAR}, #{password,jdbcType=VARCHAR},
                #{createtime,jdbcType=DATE}, #{did,jdbcType=INTEGER})
    </insert>
    <insert id="insertSelective" parameterType="com.sc.pojo.Huser">
        insert into huser
        <trim prefix="(" suffix=")" suffixOverrides=",">
            <if test="id != null">
                id,
            </if>
            <if test="username != null">
                username,
            </if>
            <if test="password != null">
                password,
            </if>
            <if test="createtime != null">
                createtime,
            </if>
            <if test="did != null">
                did,
            </if>
        </trim>
        <trim prefix="values (" suffix=")" suffixOverrides=",">
            <if test="id != null">
                #{id,jdbcType=INTEGER},
            </if>
            <if test="username != null">
                #{username,jdbcType=VARCHAR},
            </if>
            <if test="password != null">
                #{password,jdbcType=VARCHAR},
            </if>
            <if test="createtime != null">
                #{createtime,jdbcType=DATE},
            </if>
            <if test="did != null">
                #{did,jdbcType=INTEGER},
            </if>
        </trim>
    </insert>
    <update id="updateByPrimaryKeySelective" parameterType="com.sc.pojo.Huser">
        update huser
        <set>
            <if test="username != null">
                username = #{username,jdbcType=VARCHAR},
            </if>
            <if test="password != null">
                password = #{password,jdbcType=VARCHAR},
            </if>
            <if test="createtime != null">
                createtime = #{createtime,jdbcType=DATE},
            </if>
            <if test="did != null">
                did = #{did,jdbcType=INTEGER},
            </if>
        </set>
        where id = #{id,jdbcType=INTEGER}
    </update>
    <update id="updateByPrimaryKey" parameterType="com.sc.pojo.Huser">
        update huser
        set username   = #{username,jdbcType=VARCHAR},
            password   = #{password,jdbcType=VARCHAR},
            createtime = #{createtime,jdbcType=DATE},
            did        = #{did,jdbcType=INTEGER}
        where id = #{id,jdbcType=INTEGER}
    </update>
</mapper>
```



#### 6.1 resultType和resultMap的区别 ---面试题

+ resultType：只有当查询的字段和类中的属性一样时，才会自动映射，如果不一样，属性是null

  + 解决方案：
    + 给sql语句添加别名，让别名和属性名相同也可以映射
    + 可以直接使用resultMap

+ resultMap：可以自定义属性和查询字段的映射关系，是否一样都可以，

  并且还可以实现复杂的关联映射（可以做多表关联查询），比较灵活，开发阶段推荐使用resultMap

==resultType和resultMap的数据结构是一样的，都是Map结构==



#### 6.2 #{}和${}的区别 ---面试题

+ #{}：底层PreparedStatement，采用预编译方式处理sql语句，参数是通过？做占位符的方式来处理，可以防止sql注入，而且可以一次编译多次运行，执行效率会高一些
+ ${}：底层是Statement，采用字符串拼接方式来处理参数，存在sql注入隐患，通常用于处理表名，字段名，这些不需要预编译的数据，`select ${字段},...from ${table}` 



#### 6.3 如果想获取新增时自增主键 ---面试题

```xml
<!--如果想获取新增之后的自增主键
    前提：数据库必须支持主键自增（mysql,sqlsever）
    useGeneratedKeys="true"，表示是否返回自增主键
    keyProperty="id"，表示把获取的主键给哪个属性赋值
    这样用户新增的用户对象，原来id是null，现在id是自增主键
-->
<insert id="insert" useGeneratedKeys="true" keyProperty="id">
    insert into huser (id, username, password,
                       createtime, did)
    values (#{id,jdbcType=INTEGER}, #{username,jdbcType=VARCHAR}, #{password,jdbcType=VARCHAR},
            #{createtime,jdbcType=DATE}, #{did,jdbcType=INTEGER})
</insert>
```



#### 6.4 Mybatis的Xml映射文件中，不同的Xml映射文件，id是否可以重复？

答案：主要是==看映射文件中mapper标签是否添加了namespace==，

如果添加了，就可以实现一个Mapper接口对应一个映射文件，多个映射文件标签id是可以重复的

如果没有添加，一个mapper接口，可能会对应多个映射文件，多个映射文件标签id是不可以重复的



### 7. mybatis中Mapper接口参数传递

> 面试题：如果mybatis的mapper接口想传递多种不同的参数有哪些方式可以解决？
>
> + 通过@Param直接给参数添加别名，映射文件中只需要通过#{别名}
> + 可以将不同的参数，封装到一个对象中，参数只需要传递一个对象，映射文件只需要#{属性名}
> + 可以将不同的参数，封装到一个Map集合中，参数只需要传递一个map，映射文件只需要#{key}

+ 传递一个参数：#{随便写}，因为只有一个参数，写什么都是它

+ 传递多个参数：需要给参数添加`@Param("参数别名")`而映射文件通过`#{参数别名}`来获取参数的，和参数名没有任何关系

  mapper接口中：

  ```java
  //传递多个参数
      Huser selectByMany(
              @Param("a") String username,
              @Param("b") String password);
      //传递多个参数（包含对象）
      int insertByMany(
              @Param("t") Date time,
              @Param("user") Huser u);
  ```

  映射文件中：

  ```xml
  <select id="selectByMany" resultMap="BaseResultMap">
          select
          <include refid="Base_Column_List"/>
          from huser where username=#{username} and password=#{password}
      </select>
  
  <insert id="insertByMany">
          insert into huser
          values (null, #{user.username}, #{user.password}, #{t}, #{user.did})
      </insert>
  ```

  

+ 传递对象参数：==#{属性名}==，通过属性名可以获取属性值，如果是Integer之类的，直接写参数名

+ 传递集合或数组：

  Mapper接口中：

  ```java
  //传递一个集合或者数组
      int batchInsert(List<Huser> users);//批量新增
      int batchDelete(Integer[] id);//批量删除
  ```

  映射文件中：

  ```xml
  <insert id="batchInsert">
          insert into huser
          values
          <foreach collection="list" item="u" separator=",">
              (null,#{u.username},#{u.password},#{u.createtime},#{u.did})
          </foreach>
      </insert>
  
  <!--foreach属性介绍:
      collection:指定遍历的数组或者集合，一般可以写list，array，也可以自动自定义（参数别名，ids）
      item:类似于每次遍历出来的数据，类似于之前的var
      separator:指定每个遍历出来的数据之间的间隔符，还会帮你去除最后一个间隔符
      open:指定遍历开始位置的内容
      close:指定遍历结束的内容
      -->
      <delete id="batchDelete">
          delete from huser where id in
          <foreach collection="array" item="id" separator="," open="(" close=")">
              #{id}
          </foreach>
      </delete>
  ```

  

+ 传递Map集合：类似于对象传递参数的方式，通过==#{key}==获取value值



### 8. MyBatis关联映射 ---重点、难点、面试题

#### 8.1 Mybatis关联映射有哪些

+ 一对一关联：用户表和用户信息表，是一对一关联，因为每个用户只能对应一个用户信息
+ 一对多关联：部门表和用户表之间，是一对多的，因为一个部门可以包含多个用户
+ 多对一关联：用户表和部门表是多对一，因为多个用户可以加入一个部门
+ 多对多关联：老师表和学生表是多对多，因为一个老师可以教多名学生，一名学生也可以被多名老师教



#### 8.2 mybatis实现关联映射前提

+ 表和表关系要维护好：

  + 一对一：一个表的主键和另一个表的主键是一一对应的
  + 一对多，多对一：两个表必须添加主外键关联
  + 多对多：表和表之间，是通过第三张表（关系表）来维护的

+ 类和类的关系要维护好：==添加关联属性==

  + 一对一：用户类添加用户信息==对象==属性

  + 一对多：部门类添加用户==集合==属性

  + 多对一：用户类添加部门对象属性

  + 多对多：老师类添加学生集合属性，学生类添加老师集合属性

    > ==bug==：做关联映射不要做双向关联，一般只需要做单向关联，否则会出现无限嵌套的情况，比如：用户和部门关联，同时还做了部门和用户的关联

+ 映射文件中通过resultMap来完成映射关系

  + 第一种：可以使用多表关联查询完成映射关系，

    + 但是多个表查询会出现重名字段，注意添加别名

      > 自己的理解：association或collection双标签，跟resultMap一样有id，和result
      >
      > 适用于字段不多，简单点的查询，直接把所有数据一次查出来，注意重复字段

    ==描述对象==

    ```xml
    <resultMap id="myMap" type="com.sc.pojo.Huser">
            <!--主键字段-->
            <id column="id" property="id"/>
            <!--其他字段-->
            <result column="username" property="username"/>
            <result column="password" property="password"/>
            <result column="createtime" property="createtime"/>
            <result column="did" property="did"/>
            <!--如果关联属性是对象，要添加一个描述对象的标签
                第一种方式：使用多表关联来查询来完成
                    property:关联属性名
                    javaType:关联属性类型
                    -->
            <association property="info" javaType="com.sc.pojo.Huserinfo">
                <id column="id" property="id"/>
                <result column="sex" property="sex"/>
                <result column="age" property="age"/>
                <result column="mess" property="mess"/>
            </association>
        </resultMap>
    	<!------------------------------->
    ```

    ==描述集合==

    ```xml
    
        <resultMap id="myMap" type="com.sc.pojo.Hdept">
            <id column="uid" jdbcType="INTEGER" property="id"/>
            <result column="deptName" jdbcType="VARCHAR" property="deptname"/>
            <!--描述集合的标签
                property:关联属性名
                ofType:关联属性集合泛型
                bug:如果多张表很可能会出现重名字段，这样映射结果集时，默认会映射第一个字段
                    解决方案:把冲突的字段取别名
            -->
            <collection property="users" ofType="com.sc.pojo.Huser">
                <!--主键字段-->
                <id column="id" property="id"/>
                <!--其他字段-->
                <result column="username" property="username"/>
                <result column="password" property="password"/>
                <result column="createtime" property="createtime"/>
                <result column="did" property="did"/>
            </collection>
        </resultMap>
    ```

    

  + 第二种分成多次查询，（更推荐使用，没有重复字段的bug）

    + 借助于其他mapper接口写好的方法，来给关联属性赋值，通过全类名+方法名进行调用

      ==注：column传递给另一个mapper接口方法的参数必须是另一个result标签的column==
      
      > 自己的理解：association和collection单标签，
      >
      > + association：描述对象属性，
      >   + property：属性名
      >   + select：调用其他Mapper接口的方法
      >   + column：传递给另一个mapper接口方法的参数
      > + collection：描述集合属性
      >   + ofType：泛型
      >   + ......其他的一样
      >
      > 逻辑，比如：`<collection ofType="com.sc.pojo.Huser" property="users" select="com.sc.mapper.HuserMapper.selectByDid"  column="id"/>`
      >
      > collection：属性类型是集合；
      >
      > ofType：集合泛型是：Huser；
      >
      > property：属性名是users;
      >
      > select：调用HuserMapper的selectByDid方法，（全类名+方法）
      >
      > column：并把id作为参数传过去，得到的结果赋值给属性users，

  ==描述对象==
  
  ```xml
  <resultMap id="myMap2" type="com.sc.pojo.Huser">
          <!--主键字段-->
          <id column="id" property="id"/>
          <!--其他字段-->
          <result column="username" property="username"/>
          <result column="password" property="password"/>
          <result column="createtime" property="createtime"/>
          <result column="did" property="did"/>
          <!--如果关联属性是对象，要添加一个描述对象的标签
             第二种方式:借助于其他mapper接口写好的方法来实现关系，分成两次查询需要的数据
                  property:关联属性名
                  column:调用另一个mapper方法的参数
                  select:表示调用其他Mapper写好的方法来给关联属性赋值
                          调用方式：全类名+方法
                  -->
          <association property="info" column="id" select="com.sc.mapper.HuserinfoMapper.selectByPrimaryKey"/>
      </resultMap>
  ```

  ==描述集合==
  
  ```xml
  <resultMap id="myMap2" type="com.sc.pojo.Hdept">
          <id column="id" jdbcType="INTEGER" property="id"/>
          <result column="deptName" jdbcType="VARCHAR" property="deptname"/>
          <!--不会出现对个表，重名字段的问题-->
          <collection  property="users" ofType="com.sc.pojo.Huser" select="com.sc.mapper.HuserMapper.selectByDid"  column="id"/>
      </resultMap>
  ```
  
  

### 9. Mybatis动态sql语句 ---面试题

mybatis动态sql语句是通过映射文件的标签（比如：if）就可以根据Mapper接口传递的方法参数的不同，生成不同的sql语句，面试官重点问的是：==mybaits有哪些常用的映射文件标签==

+ if：==单分支判断==，可以根据test属性，是否满足条件，拼接里面的sql语句，

+ where：可以根据是否有条件，动态添加where关键字，还可以动态删除多余的and或者or

+ set：一般用于更新语句，自动添加set关键字，还可以动态删除多余的逗号

+ foreach：用于遍历数组和集合的参数

+ trim：可以用于任何语句，相当于结合了set和where标签的功能，也可以去除多余的逗号或者and以及还可以给sql语句添加共同的前缀和后缀

+ bind：对于传递的参数做二次处理，通常用于模糊查询

+ choose：==多分支判断==

  ```xml
  <choose>
  	<when 条件>???</when>
  	<when 条件>???</when>
  	<when 条件>???</when>
  	...
  	<otherwise>???</otherwise>
  </choose>
  ```

+ ...



案例：`<where>``<bind>` `<if>`实现动态模糊查询

```xml
<!-- select * from huser where username like bind and createtime=?    -->
<select id="dynamicSearch" resultType="com.sc.pojo.Huser">
    select
    <include refid="Base_Column_List"/>
    from huser
    <where>
        <if test="username!=null">
            <bind name="newName" value="'%'+username+'%'"/>
            and username like #{newName}
        </if>
        <if test="createtime!=null">
            and createtime=#{createtime}
        </if>
        <if test="did!=null">
            and did=#{did}
        </if>
    </where>
</select>
```

案例：`<trim>`实现动态新增

```xml
<!--insert into huser (id,username,password) values (#{id},#{username},#{password})-->
<insert id="dynamicInsert">
    insert into huser
    <trim prefix="(" suffix=")" suffixOverrides=",">
        <if test="id!=null">
            id,
        </if>
        <if test="username!=null">
            username,
        </if>
        <if test="password!=null">
            password,
        </if>
        <if test="createtime!=null">
            createtime,
        </if>
        <if test="did!=null">
            did,
        </if>
    </trim>
    <trim prefix="values (" suffix=")" suffixOverrides=",">
        <if test="id!=null">
            #{id},
        </if>
        <if test="username!=null">
            #{username},
        </if>
        <if test="password!=null">
            #{password},
        </if>
        <if test="createtime!=null">
            #{createtime},
        </if>
        <if test="did!=null">
            #{did},
        </if>
    </trim>
</insert>
```

案例：`<set>`实现动态更新

```xml
<!--update huser set 列=值,... where id=#{id}-->
<update id="dynamicUpdate">
    update huser
    <set>
        <if test="username!=null">
            username=#{username},
        </if>
        <if test="password!=null">
            password=#{password},
        </if>
        <if test="createtime!=null">
            createtime=#{createtime},
        </if>
        <if test="did!=null">
            did=#{did},
        </if>
    </set>
    where id=#{id}
</update>
```

案例：`<trim>`实现动态更新

```xml
<update id="dynamicUpdate2">
    update huser
    <trim prefix="set" suffixOverrides=",">
        <if test="username!=null">
            username=#{username},
        </if>
        <if test="password!=null">
            password=#{password},
        </if>
        <if test="createtime!=null">
            createtime=#{createtime},
        </if>
        <if test="did!=null">
            did=#{did},
        </if>
    </trim>
    where id=#{id}
</update>
```

案例：`<foreach>`实现批量新增

```xml
<insert id="batchInsert">
    insert into huser
    values
    <foreach collection="list" item="u" separator=",">
        (null,#{u.username},#{u.password},#{u.createtime},#{u.did})
    </foreach>
</insert>
```



#### 9.1 mybatis中实现模糊查询

```xml
<select id="dynamicSearch" resultType="com.sc.pojo.Huser">
    select
    <include refid="Base_Column_List"/>
    from huser
    <where>
        <if test="username!=null">
            <!--通过bind对参数做二次处理-->
            <bind name="newName" value="'%'+username+'%'"/>
            and username like #{newName}
        </if>
        <if test="createtime!=null">
            and createtime=#{createtime}
        </if>
        <if test="did!=null">
            and did=#{did}
        </if>
    </where>
</select>
```





### 10. Mybatis缓存 ---面试题

#### 10.1为什么需要缓存

缓存类似于系统的内存，访问数据库mysql类似于访问系统的本地磁盘，所以访问缓存的速度一定会高于mysql的速度，mybatis提供了一些缓存机制，当第一次查询mysql数据时，会先查询mysql数据库，同时mybatis会在缓存中备份一次，如果再次访问相同的数据，mybatis会优先访问缓存，如果存在会直接使用缓存的数据，就无需访问mysql，如果不存在，才会走mysql，提高了查询效率

==注==：如果对数据增删改了，mybatis缓存，也会帮你自动清除缓存为了防止脏读



#### 10.2 mybatis缓存机制

+ 一级缓存：是sqlSession级别的缓存，只能在同一个sqlSession有效，默认开启的，无需多余配置，并且对数据修改后，为了防止脏读，会清空缓存
+ 二级缓存：是Mapper级别的缓存，同一个namespace中的所有sqlSession共享，默认关闭的，需要手动配置，通过`<cache>`标签开启，只有一级缓存失效了，才会使用二级缓存

```xml
<!--开启二级缓存
        flushInterval:刷新缓存的时间间隔，单位是毫秒，默认不设置，
        readOnly:是否设置为只读缓存，会失效
        eviction:配置清除缓存的策略，默认LRU
            LRU:最近最少使用，最长时间不用的对象先删除
            FIFO:类似于队列，先进先出，按照创建顺序来清除
        size:缓存个数
    -->
    <cache flushInterval="60000"
            readOnly="true" eviction="LRU" size="512"
    />
```

> 自己的总结：
>
> 缓存类似于系统的内存，访问数据库mysql类似于访问系统的本地磁盘，所以访问缓存的速度一定会高于mysql的速度，mybatis提供了一些缓存机制：
>
> 一级缓存，sqlsession级别，只在同一个sqlsession中有效，默认开启，第一次执行查询语句的时候，会先访问数据库，然后将返回的数据在缓存中备份一份，当执行相同的查询语句的时候就会先在缓存中查找，如果找到了就不需要再访问数据库，提高了查询效率，更新操作会清空一级缓存，防止数据脏读
>
> 二级缓存：mapper级别，在多个sqlsession中有效，默认关闭，（只有当一级缓存失效才能生效），开启二级缓存后，当session提交事务或者关闭，会把数据刷入二级缓存，如果session关闭了，在执行相同的查询语句，二级缓存就会生效也不会访问数据库
>
> + 查询顺序：当二级缓存开启后，MyBatis 会先查询二级缓存，如果命中则直接返回结果；只有二级缓存未命中时，才会进入一级缓存；如果一级缓存也未命中，最后才查询数据库。
> + 也就是说，二级缓存的优先级**高于**一级缓存，而非等待一级缓存失效才启用。



### 11. Mapper接口工作原理 ---难点、面试题

Mapper接口就是原来的dao接口，是根据映射文件中的namespace属性，找到哪个Mapper接口对应哪个映射文件，Mapper接口方法会对应映射文件中的标签id

+ 工作原理：先根据mapper接口的全类名+方法名，作为一个key值，来快速定位到哪个映射文件中的哪个标签底层实现是根据jdk==动态代理==方式，它运行时会给Mapper接口创建一个Proxy(代理对象)，会拦截Mapper接口的方法，帮你动态调用哪个映射文件的标签，就可以执行里面的sql语句，并且运行的结果也会根据提供的resultType或者resultMap属性，进行封装和返回
+ 了解：mybatis工作原理，主要涉及的几个拦截器
  + 执行器拦截器：用于拦截sql语句并且执行，可以实现事务，还可以用于实现缓存操作
  + 参数拦截器：用于拦截mapper接口传递的参数，或者用于转换使用....
  + 结果集拦截器：根据提供的resultType或者resultMap提供的方式，拦截查询的结果，进行封装返回
  + sql语句构建拦截器：用于修改sql语句，添加之前拦截的参数，替换成？占位符(#{})或者拼接字符串(${})



#### 11.1 mapper接口的方法可以重载吗

答案：不能，因为mapper接口是根据全类名+方法名作为key值，用于匹配对应哪个映射文件中的哪个标签，如果重载，方法名相同，参数不同，就会出现很多一样的key，无法精准匹配对应哪个标签......



### 12. mybatis分页插件如何使用

+ 导入分页插件依赖：PageHelper

```xml
<!--mybatis分页插件-->
<dependency>
<groupId>com.github.pagehelper</groupId>
<artifactId>pagehelper</artifactId>
<version>4.2.1</version>
</dependency>
```

+ mybatis核心配置文件，配置插件（spring会整合）

  ```xml
  <!--一个分页插件-->
          <plugin interceptor="com.github.pagehelper.PageHelper">
              <property name="offsetAsPageNum" value="true" />
              <property name="rowBoundsWithCount" value="true" />
              <!--pageSize=0时，是否查询出全部结果，默认为false-->
              <property name="pageSizeZero" value="true" />
              <!--分页合理化参数，默认文false；pageNum<=0，查询第一页；pageNum>总页数，查询最后一页-->
              <property name="reasonable" value="true" />
              <property name="params"
                        value="pageNum=pageHelperStart;pageSize=pageHelperRows;" />
              <property name="supportMethodsArguments" value="false" />
              <property name="returnPageInfo" value="none" />
          </plugin>
  ```

+ service：使用PageHelper封装好的分页信息（PageInfo对象）

  ```java
  public PageInfo<Huser> page(Integer pageNum, Integer pageSize) {
          //1.先设置分页，并且必须写在查询功能前面，否者分页
          //这样就可以真正查询时，动态拼接limit关键字做分页
          PageHelper.startPage(pageNum, pageSize);
          //2.封装数据,借助于有参构造方法（传递一个用户集合）
          HuserMapper mapper = MybatisUtil.getSession().getMapper(HuserMapper.class);
          PageInfo<Huser> p = new PageInfo<>(mapper.selectAll());
          MybatisUtil.close();
          return p;
      }
  ```

+ 通过Controller把PageInfo对象传递（作用域，json）给前端即可





#### 12.1 PageInfo属性介绍

```java
public class PageInfo<T> implements Serializable {
    private int pageNum;//当前页数
    private int pageSize;//每页条数
    private int size;//当前页数据的长度
    private String orderBy;//
    private int startRow;//当前页第一行行号
    private int endRow;//当前页最后一行行号
    private long total;//总条数
    private int pages;//总页数
    private List<T> list;//每页集合的数据
    private int prePage;//上一页
    private int nextPage;//下一页
    private boolean isFirstPage;//是否是首页
    private boolean isLastPage;//是否是尾页
    private boolean hasPreviousPage;//是否有上一页
    private boolean hasNextPage;//是否有下一页
    private int navigatePages;//导航页码数
    private int[] navigatepageNums;//所有导航页码数
    private int navigateFirstPage;//导航页码数的首页
    private int navigateLastPage;//导航页码数尾页
}
```



### 13. 乐观锁和悲观锁 ---面试题

在项目过程中经常会发生数据并发问题，多个用户同时访问同一些数据，并且对数据进行修改，就有可能发生数据不一致的问题，mybatis也可以使用乐观锁和悲观锁的方式，来解决这些并发问题

+ 乐观锁：给表添加一个字段（版本号int或者时间戳timestamp）两种字段方式都是一样的，每次更新前，先查询一次版本号或者时间戳，等到用户修改时，事务提交之前拿之前记录的版本号进行匹配，如果相同说明没有被其他人修改过，就可以提交事务，并且版本号+1，如果不相同，说明被其他人修改了，则不能提交事务
+ 悲观锁：是数据库控制的，我们查询时添加for update，来锁住要查询的数据，这样其他用户就无法对这些加锁的数据做操作了，只有事务提交了，才会释放锁，这样其他用户才可以操作这些数据，类似于同步锁synchronized

#### 13.1 乐观锁实现

+ 给表添加一个version字段

+ mapper接口提供两个方法

  ```xml
  <!--查询方法-->
  <select id="selectById" resultMap="BaseResultMap">
          select
          <include refid="Base_Column_List"/>
          from testlock where id=#{id}
      </select>
  ```

  ```xml
  <!--更新数据，版本号做条件，版本号+1-->
      <update id="updateLock">
          update testLock
          set name=#{name},
              version=version + 1
          where id = #{id}
            and version = #{version}
      </update>
  ```

  测试：

  ```java
      @Test
      public void happyLock1() throws InterruptedException {
          SqlSession session = MybatisUtil.getSession();
          TestlockMapper mapper = session.getMapper(TestlockMapper.class);
          Testlock t1 = mapper.selectById(1);
          Thread.sleep(10000);//模拟并发
          t1.setName("happyLock11111");
          int i = mapper.updateLock(t1);
          MybatisUtil.close();
  
      }
  
      @Test
      public void happyLock2() {
          SqlSession session = MybatisUtil.getSession();
          TestlockMapper mapper = session.getMapper(TestlockMapper.class);
          Testlock t1 = mapper.selectById(1);
          t1.setName("happyLock22222");
          int i = mapper.updateLock(t1);
          MybatisUtil.close();
      }
  ```



#### 13.2 悲观锁实现

+ 先查询：添加 `for update` 给数据加锁，后更新（随便）

  ```xml
  <select id="selectForUpdate" resultMap="BaseResultMap">
          select
          <include refid="Base_Column_List"/>
          from testlock where id=#{id} for update
      </select>
  ```

  测试：

  ```java
  @Test
      public void sadLock1() throws InterruptedException {
          SqlSession session = MybatisUtil.getSession();
          TestlockMapper mapper = session.getMapper(TestlockMapper.class);
          //先查询一遍，为了给数据加锁
          Testlock tl = mapper.selectForUpdate(2);
          Thread.sleep(10000);
          //在更新，加了悲观锁之后，其他用户无法操作该数据
          tl.setName("sadLock11111");
          int i = mapper.updateByPrimaryKey(tl);
          MybatisUtil.close();
      }
  
      @Test
      public void sadLock2() throws InterruptedException {
          SqlSession session = MybatisUtil.getSession();
          TestlockMapper mapper = session.getMapper(TestlockMapper.class);
          Testlock tl = mapper.selectForUpdate(2);
          Thread.sleep(2000);
          tl.setName("sadLock2222");
          int i = mapper.updateByPrimaryKey(tl);
          MybatisUtil.close();
      }
  ```

  

### 14. 总结面试题

> 1.什么是Mybatis？
>
> 2.mybatis工作流程
>
> 3.resultType和resultMap的区别？
>
> 4.#{}和${}区别？
>
> 5.mybatis中mapper接口如何传递多个参数？
>
> 6.mybaits如何实现关联映射？
>
> 7.mybatis动态sql语句标签有哪些？
>
> 8.mybatis缓存机制？
>
> 9.乐观锁和悲观锁的区别？
>
> 10.Mapper接口工作原理？
>
> 11.Mybatis的Xml映射文件中，不同的Xml映射文件，id是否可以重复？
>
> 12.mapper接口的方法可以重载吗



