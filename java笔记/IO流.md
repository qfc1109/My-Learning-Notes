IO流

InputStream 输入字节流 接口 

FileInputStream 实现类

| 接口                    | 实现类                              |
| ----------------------- | ----------------------------------- |
| InputStream 输入字节流  | FileInputStream                     |
| OutputStream 输出字节流 | FileOutputStream                    |
| Reader   字符流         | FileReader                          |
| Writer   字符流         | FileWriter                          |
|                         | BufferedInputStream字节输入缓冲流   |
|                         | BufferedOutputStream 字节输出缓冲流 |
|                         | BufferedReader字符输入缓冲流        |
|                         | BufferedWriter 字符输出缓冲流       |
|                         | InputStreamReader 输入桥梁流        |
|                         | OutputStreamWriter 输出桥梁流       |







字节流读取

```
//先准备文件
String str  = "D:"+File.separator + "sun11"+File.separator+"1.txt";
FileInputStream f= new FileInputStream(str);

```

