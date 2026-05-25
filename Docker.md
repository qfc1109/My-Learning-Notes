# Docker

### 1.什么是Docker

Docker是一种容器化技术，它可以将应用程序和依赖环境一起打包成一个独立的运行单元。它的核心目标是：**一次构建，随处运行**。

Docker利用操作系统级虚拟化思想，把应用隔离在一个个容器中运行，避免了传统部署中“环境不一致”的问题。



### 2.为什么要学习Docker

+ 解决环境不一致问题
+ 部署更快，启动更快
+ 资源占用更少，比虚拟机更轻量
+ 便于持续集成和持续部署
+ 适合微服务架构和云原生开发



### 3.Docker和虚拟机的区别

#### 3.1 虚拟机

虚拟机是在物理机上虚拟出一整套完整硬件和操作系统，每个虚拟机都要安装自己的系统，开销大，启动慢。

#### 3.2 容器

容器直接运行在宿主机操作系统之上，共享宿主机内核，只隔离应用运行环境，所以更轻量、更快。

#### 3.3 对比总结

- 虚拟机：更重，隔离更强，适合完整系统模拟
- 容器：更轻，启动更快，适合应用部署



### 4.Docker的核心概念

#### 4.1 镜像（Image）

镜像可以理解为容器的模板，里面包含了应用运行所需的文件、环境、依赖和配置。

- 镜像是只读的
- 一个镜像可以启动多个容器
- 镜像类似于“安装包”



#### 4.2 容器（Container）

容器是镜像运行后的实例。

- 容器是可读写的
- 容器可以启动、停止、删除
- 容器类似于“正在运行的程序”



#### 4.3 仓库（Repository）

仓库用于存放镜像，常见的有 Docker Hub。

- 公共仓库：别人也能拉取
- 私有仓库：企业内部使用



#### 4.4 Dockerfile

Dockerfile是用于构建镜像的脚本文件，通过一系列指令定义镜像如何生成。



### 5.Docker安装

#### 5.0 安装方案选择

Docker 本身运行在 Linux 内核之上。在 Windows 上主要有三种安装方式：

| 方案 | 原理 | 适用场景 |
|------|------|----------|
| **WSL 2 + Docker Desktop** | 利用 Windows 自带 WSL 2 跑 Linux 内核，装 Docker Desktop（GUI） | 不想装虚拟机的 Windows 用户 |
| **VirtualBox 虚拟机 + Docker Engine** | 在 VirtualBox 里装 Linux 虚拟机，再在虚拟机里装 Docker Engine（纯命令行） | 已有 VirtualBox、不想装 Hyper-V/WSL |
| **云服务器 + Docker** | 在云服务器（CentOS/Ubuntu）上直接装 Docker | 有云服务器的用户，环境最干净 |

> 下面分别给出三种方案的安装步骤。

---

#### 5.1 方案一：CentOS / 云服务器安装 Docker（yum）

##### 安装前准备

- Linux 系统需要可以联网
- 建议使用 CentOS 7 或兼容版本
- 先卸载旧版本 Docker

```bash
sudo yum remove docker \
                docker-client \
                docker-client-latest \
                docker-common \
                docker-latest \
                docker-latest-logrotate \
                docker-logrotate \
                docker-engine
```

##### 安装 Docker

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
```

##### 启动 Docker

```bash
systemctl start docker     # 启动
systemctl enable docker    # 开机自启
systemctl status docker    # 查看状态
```

##### 查看版本

```bash
docker -v
docker version
```

---

#### 5.2 方案二：Ubuntu / VirtualBox 虚拟机安装 Docker（apt）

> 适用场景：Windows 用户已有 VirtualBox，不想装 WSL/Hyper-V。

##### 第 1 步：创建 Ubuntu 虚拟机

在 VirtualBox 中新建虚拟机：

| 配置项 | 建议值 |
|--------|--------|
| 系统镜像 | Ubuntu 24.04 LTS（[下载](https://ubuntu.com/download/server)） |
| 内存 | ≥ 4GB |
| CPU | ≥ 2 核 |
| 磁盘 | ≥ 40GB（动态分配），虚拟磁盘文件存到 `D:\softwares\docker` |

##### 第 2 步：配置虚拟机网络

虚拟机 **网卡 1** 设为 **NAT**，然后配置端口转发（虚拟机 设置 → 网络 → 高级 → 端口转发）：

| 名称 | 协议 | 主机 IP | 主机端口 | 子系统 IP | 子系统端口 |
|------|------|---------|----------|-----------|------------|
| ssh | TCP | 127.0.0.1 | 2222 | | 22 |

这样在 Windows 上可以通过 `ssh -p 2222 用户名@127.0.0.1` 连到虚拟机。

##### 第 3 步：安装 Docker Engine

启动虚拟机，登录后执行：

```bash
# 官方一键安装脚本（推荐）
curl -fsSL https://get.docker.com | sudo sh

# 把当前用户加入 docker 组，之后不用每次 sudo
sudo usermod -aG docker $USER

# 设置 Docker 开机自启
sudo systemctl enable docker
```

> 执行 `usermod` 后需要**重新登录**（logout/login）才生效。

##### 第 4 步：验证安装

```bash
docker run hello-world
```

输出 `Hello from Docker!` 即安装成功。

##### ⚠ 方案二无法连接 Docker Desktop GUI

方案二装的是 **Docker Engine（纯 CLI）**，而 Docker Desktop 是另一个独立产品（GUI + 内置 Engine），两者互不兼容：

- Docker Desktop 的 GUI 只能连接它**自己内置**的 Docker Engine（跑在 WSL 2 里），**不支持**远程连接到外部 Docker Engine
- 方案二装的 Docker Engine 跑在 VirtualBox 虚拟机里，Docker Desktop 无法管理它

如果需要在 Windows 上获得图形化管理界面，可以考虑：

1. **Portainer**（推荐）：在虚拟机里跑一个轻量 Web GUI
   ```bash
   docker run -d -p 9000:9000 --name portainer --restart=always \
     -v /var/run/docker.sock:/var/run/docker.sock \
     portainer/portainer-ce
   ```
   然后在 VirtualBox 端口转发里加一条：主机端口 9000 → 子系统端口 9000，浏览器访问 `http://127.0.0.1:9000`

2. **VS Code Docker 插件**：在 Windows 上设环境变量 `DOCKER_HOST=tcp://127.0.0.1:2375`，再配合 VS Code 的 Docker 插件远程管理（需额外开启 Docker 的 TCP 端口）

---

#### 5.3 方案三：WSL 2 + Docker Desktop（Windows GUI）

##### 安装 WSL 2

以**管理员身份**打开 PowerShell：

```powershell
wsl --install
```

安装完成后重启电脑。如果失败，手动启用组件：

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

##### 安装 Docker Desktop

1. 下载 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. 运行安装程序
3. 安装完成后，打开 Docker Desktop → Settings → Resources → Advanced → 将 **Disk image location** 改为 `D:\softwares\docker` → Apply & Restart

##### 验证

```powershell
docker --version
docker run hello-world
```

> ⚠ WSL 方案可能与 VirtualBox 冲突（Hyper-V 和 VirtualBox 不能同时运行）。如果你已经有 VirtualBox 在用，建议用上面的方案二。
>
> 如果 `wsl --install` 遇到错误 `0xc03a0014`（虚拟磁盘支持提供程序未找到），通常是设备管理器中的虚拟化相关驱动被禁用了。排查和修复方法见下方 [WSL 2 故障排查与修复](#wsl-2-故障排查与修复2026-05-08)。



### 6.Docker常用命令 --- 重点背、面试题

#### 6.1 服务管理命令

- systemctl start docker：启动Docker服务
- systemctl stop docker：停止Docker服务
- systemctl restart docker：重启Docker服务
- systemctl status docker：查看Docker状态
- systemctl enable docker：设置开机启动



#### 6.2 镜像相关命令

- docker images：查看本地镜像
- docker pull：拉取镜像
- docker rmi：删除镜像
- docker search：搜索镜像

```bash
# 拉取mysql镜像
docker pull mysql:8.0

# 查看镜像
docker images

# 删除镜像
docker rmi mysql:8.0
```



#### 6.3 docker run 详解（重要）

`docker run` 是最核心的命令，支持大量参数，常用组合：

```bash
docker run [参数] 镜像名 [命令]
```

| 参数 | 作用 | 示例 |
|------|------|------|
| `-d` | 后台运行容器（detached） | `-d nginx` |
| `-p 宿主机端口:容器端口` | 端口映射（最重要） | `-p 8080:80` |
| `-v 宿主机路径:容器路径` | 目录挂载（最重要） | `-v $(pwd):/usr/share/nginx/html` |
| `--name 名称` | 给容器起名 | `--name mynginx` |
| `-e 变量名=值` | 设置环境变量 | `-e MYSQL_ROOT_PASSWORD=123456` |
| `-it` | 交互式终端（进入容器用） | `-it ubuntu /bin/bash` |
| `--rm` | 容器停止后自动删除 | `--rm` 配合 `-d` 使用 |

> 完整参数列表：`docker run --help`

**端口映射 `-p` 的含义：**

```
-p 宿主机端口:容器端口
```

- 宿主机端口：你在浏览器/客户端访问的端口
- 容器端口：容器内部服务监听的端口

示例：
```bash
# 把宿主机的 8080 映射到容器的 80
docker run -d -p 8080:80 nginx

# 浏览器访问 http://localhost:8080
# 实际访问的是容器内 nginx 的 80 端口
```

**目录挂载 `-v` 的含义：**

```
-v 宿主机路径:容器路径
```

- 宿主机路径：你的真实文件所在位置
- 容器路径：容器内哪个目录来使用这些文件

> **注意**：修改挂载源文件后，**必须重启容器**才能生效，nginx 不会实时检测文件变化。

```bash
# 正确写法：用 $(pwd) 获取当前目录，避免写死路径
cd /website/html
docker run -d -p 80:80 -v $(pwd):/usr/share/nginx/html nginx

# 如果想在任意目录执行，用绝对路径
docker run -d -p 80:80 -v /website/html:/usr/share/nginx/html nginx
```

**⚠ Windows/macOS + Docker Desktop 路径注意：**

- Git Bash 里 `$(pwd)` 输出 Unix 风格路径（`/d/docker/html`），Docker Desktop 自动转换，无需额外处理
- WSL Ubuntu 里 `$(pwd)` 输出 Linux 路径（`/home/user/docker/html`），直接挂载到 WSL 里的目录即可
- WSL 里用 `/mnt/c/...` 可以访问 Windows C盘 的文件（跨系统挂载）

```bash
# WSL 中挂载 Windows C盘 目录
docker run -d -p 80:80 -v /mnt/c/docker/html:/usr/share/nginx/html nginx
```

**完整示例：运行 nginx 并挂载网页文件**

```bash
# 1. 创建网页目录
mkdir -p /website/html

# 2. 放入网页文件
echo "<h1>Hello Docker!</h1>" > /website/html/index.html

# 3. 启动容器
docker run -d --name mynginx -p 80:80 -v $(pwd):/usr/share/nginx/html nginx

# 4. 浏览器访问 localhost:80

# 5. 修改文件后需要重启容器
docker restart mynginx
```

---

#### 6.4 容器相关命令

- docker run：创建并运行容器
- docker ps：查看运行中的容器
- docker ps -a：查看所有容器
- docker start：启动容器
- docker stop：停止容器
- docker restart：重启容器
- docker rm：删除容器
- docker exec：进入容器内部

```bash
# 运行一个nginx容器
docker run -d --name mynginx -p 80:80 nginx

# 查看正在运行的容器
docker ps

# 进入容器
docker exec -it mynginx /bin/bash
```

**容器状态异常排查：**

```bash
# 容器启动后立即退出？
docker ps -a                        # 查看所有容器状态
docker logs 容器名                   # 查看容器日志，找报错原因

# 常见原因：
# - 端口被占用：换一个端口（如 -p 8080:80）
# - 挂载路径不存在：确保宿主机目录存在
# - 权限问题：某些容器需要 root 权限
```

---

#### 6.6 查看日志命令

```bash
docker logs 容器名

docker logs -f 容器名
```

- -f：持续跟踪日志输出



#### 6.7 文件复制命令

```bash
docker cp 容器名:容器内路径 主机路径
docker cp 主机路径 容器名:容器内路径
```

#### 6.8 资源查看命令

```bash
docker stats
```

- 用于查看容器CPU、内存、网络、IO等资源占用情况



### 7.Docker镜像原理

Docker镜像采用分层思想构建。

- 基础镜像提供最底层环境
- 每执行一条构建命令，就会增加一层
- 多个镜像可以共享基础层，节省空间

#### 7.1 镜像分层优点

+ 复用性高
+ 节省磁盘空间
+ 构建速度更快
+ 便于缓存



### 8.Docker数据卷（Volume）

数据卷用于实现容器与宿主机之间的数据共享。

#### 8.1 数据卷作用

- 解决容器删除后数据丢失问题
- 实现数据持久化
- 方便容器间共享数据

#### 8.2 使用方式

```bash
# 创建数据卷
docker volume create myvol

# 查看数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect myvol
```

#### 8.3 容器挂载数据卷

```bash
docker run -d \
  --name nginx01 \
  -p 8080:80 \
  -v myvol:/usr/share/nginx/html \
  nginx
```

- `-v`：挂载卷
- 左边是宿主机或数据卷路径，右边是容器内路径



### 9.Docker网络

Docker为容器提供了网络通信能力，常见网络类型如下：

- bridge：桥接网络，默认网络模式
- host：与宿主机共享网络
- none：不使用网络

#### 9.1 查看网络

```bash
docker network ls
```

#### 9.2 创建网络

```bash
docker network create mynet
```

#### 9.3 指定网络启动容器

```bash
docker run -d --name web1 --network mynet nginx
```



### 10.Docker Compose --- 多容器编排

Docker Compose 用于**一键启动多个相关容器**，通过一个 `docker-compose.yml` 文件定义所有服务，避免重复输入 `docker run` 参数。

#### 10.1 安装

```bash
# Linux/macOS
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证
docker-compose --version
```

> Docker Desktop 已自带 Docker Compose，无需单独安装。

#### 10.2 基本使用流程

```bash
# 1. 创建 docker-compose.yml 文件
# 2. 一键启动所有服务
docker-compose up -d

# 3. 查看运行状态
docker-compose ps

# 4. 停止并删除
docker-compose down

# 5. 查看日志
docker-compose logs -f
```

#### 10.3 快速入门示例：Nginx + MySQL

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 第一个服务：Nginx
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    depends_on:
      - db

  # 第二个服务：MySQL
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: myapp
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

# 数据卷
volumes:
  mysql_data:
```

```bash
# 启动
docker-compose up -d

# 进入 MySQL 容器
docker-compose exec db mysql -uroot -p123456
```

#### 10.4 常用命令

| 命令 | 作用 |
|------|------|
| `docker-compose up -d` | 后台启动所有服务 |
| `docker-compose down` | 停止并删除容器和网络 |
| `docker-compose restart` | 重启所有服务 |
| `docker-compose logs -f 服务名` | 查看某个服务的日志 |
| `docker-compose exec 服务名 命令` | 在某个服务里执行命令 |
| `docker-compose ps` | 查看状态 |
| `docker-compose build` | 重新构建镜像 |

#### 10.5 Docker Compose vs 直接 docker run

| | docker run | docker-compose |
|---|---|---|
| 适用场景 | 单个容器 | 多个容器协同 |
| 配置方式 | 命令行参数 | YAML 文件 |
| 可维护性 | 难管理多服务 | 一目了然 |
| 版本控制 | 难以追溯 | YAML 可提交到 Git |

> **什么时候用？** 如果你只是跑一个 nginx，用 `docker run` 即可。如果你的项目需要 MySQL + Redis + Nginx 多个服务，用 Docker Compose 一键启动最方便。

---

### 11.Dockerfile --- 重点掌握

Dockerfile是构建镜像的核心文件。

#### 10.1 常见指令

- FROM：指定基础镜像
- MAINTAINER：作者信息
- WORKDIR：工作目录
- COPY：复制文件到镜像中
- ADD：复制文件，支持自动解压
- RUN：构建镜像时执行命令
- CMD：容器启动时执行默认命令
- ENTRYPOINT：容器启动时执行主命令
- EXPOSE：声明暴露端口

#### 10.2 Dockerfile示例

```dockerfile
FROM openjdk:8-jdk-alpine

WORKDIR /app

COPY target/demo.jar /app/demo.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","/app/demo.jar"]
```

#### 10.3 构建镜像

```bash
docker build -t demo:1.0 .
```

- `-t`：指定镜像名称和标签
- `.`：表示当前目录下的Dockerfile



### 12.Docker部署MySQL

#### 11.1 拉取镜像

```bash
docker pull mysql:8.0
```

#### 11.2 启动容器

```bash
docker run -d \
  --name mysql01 \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  mysql:8.0
```

#### 11.3 进入容器连接MySQL

```bash
docker exec -it mysql01 mysql -uroot -p
```

#### 11.4 挂载数据卷实现持久化

```bash
docker run -d \
  --name mysql02 \
  -p 3307:3306 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -v /mydata/mysql/log:/var/log/mysql \
  -v /mydata/mysql/data:/var/lib/mysql \
  -v /mydata/mysql/conf:/etc/mysql/conf.d \
  mysql:8.0
```



### 13.Docker部署Tomcat

#### 12.1 拉取镜像

```bash
docker pull tomcat:9.0
```

#### 12.2 运行容器

```bash
docker run -d \
  --name tomcat01 \
  -p 8080:8080 \
  tomcat:9.0
```

#### 12.3 访问测试

在浏览器输入：

```bash
http://Linux的IP地址:8080
```

#### 12.4 挂载webapps目录

```bash
docker run -d \
  --name tomcat02 \
  -p 8081:8080 \
  -v /mydata/tomcat/webapps:/usr/local/tomcat/webapps \
  tomcat:9.0
```



### 14.Docker部署Redis

#### 13.1 拉取镜像

```bash
docker pull redis:7
```

#### 13.2 运行容器

```bash
docker run -d \
  --name redis01 \
  -p 6379:6379 \
  redis:7
```

#### 13.3 进入Redis容器

```bash
docker exec -it redis01 redis-cli
```



### 15.Docker常见面试题

#### 14.1 Docker和虚拟机的区别是什么

- 虚拟机模拟整套硬件和系统，开销大
- Docker共享宿主机内核，只隔离应用环境，轻量高效

#### 14.2 容器和镜像有什么区别

- 镜像是静态模板，只读
- 容器是镜像运行后的实例，可读写

#### 14.3 数据卷的作用是什么

- 数据持久化
- 容器间共享数据
- 容器删除后数据不丢失

#### 14.4 Dockerfile有什么作用

- 用于描述镜像构建过程
- 可以自动化构建镜像
- 方便团队统一环境

#### 14.5 容器删除后数据为什么会丢失

因为容器本身是临时运行实例，如果没有挂载数据卷，容器内部的数据会随着容器删除而销毁。

#### 14.6 什么是 Docker Compose？它解决什么问题？

Docker Compose 用于编排多个容器，通过 `docker-compose.yml` 文件定义一组相关服务（如 Nginx + MySQL + Redis），实现一键启动和停止。解决了多容器协同部署时命令繁琐、难以管理的问题。

#### 14.7 修改挂载文件后为什么要重启容器？

挂载（`-v`）是在容器**启动时**建立的目录绑定关系。容器运行后，宿主机文件的修改不会自动同步到容器内。重启容器后，Docker 重新建立挂载，此时新文件才对容器可见。



### 16.学习建议

+ 先掌握Docker基础概念：镜像、容器、仓库
+ 再练习常用命令：拉取、运行、停止、删除
+ 重点理解Dockerfile和数据卷
+ 最后结合项目练习部署MySQL、Tomcat、Redis
+
+ 通过“理论 + 实操 + 面试题”三步学习，效果最好

---

## Windows 安装实战记录

### 最终方案

- **WSL 2 + Docker Desktop**（2026-05-08 修复成功）
- 放弃 VirtualBox 方案（WSL 修复后不再需要）

---

### WSL 2 故障排查与修复（2026-05-08）

#### 故障现象

`wsl --install -d Ubuntu-24.04` 报错：

```
Wsl/InstallDistro/Service/RegisterDistro/0xc03a0014
```

#### 根因

设备管理器中有 **4 个关键系统驱动被禁用**，WSL 2 需要它们来创建虚拟磁盘（`.vhdx`）：

| 驱动名 | 实例 ID | 作用 |
|---|---|---|
| UMBus Root Bus Enumerator | `ROOT\UMBUS\0000` | 用户模式总线，虚拟磁盘挂载依赖 |
| Composite Bus Enumerator | `ROOT\COMPOSITEBUS\0000` | 组合总线枚举器 |
| Microsoft Virtual Drive Enumerator | `ROOT\VDRVROOT\0000` | 虚拟驱动器枚举器 |
| NDIS Virtual Network Adapter Enumerator | `ROOT\NDISVIRTUALBUS\0000` | 虚拟网络适配器枚举器 |

状态均为 `CM_PROB_DISABLED`（已禁用）。

#### 修复方法

以**管理员身份**打开 PowerShell，逐条执行：

```powershell
# 逐个启用被禁用的驱动
Enable-PnpDevice -InstanceId 'ROOT\UMBUS\0000' -Confirm:$false
Enable-PnpDevice -InstanceId 'ROOT\COMPOSITEBUS\0000' -Confirm:$false
Enable-PnpDevice -InstanceId 'ROOT\VDRVROOT\0000' -Confirm:$false
Enable-PnpDevice -InstanceId 'ROOT\NDISVIRTUALBUS\0000' -Confirm:$false
```

或者直接在**设备管理器** → **系统设备**中，找到上述设备右键 → **启用设备**。

启用后无需重启，直接执行 `wsl --install -d Ubuntu-24.04` 即可成功。

#### 验证修复

```powershell
# 确认四个驱动状态均为 OK
Get-PnpDevice -InstanceId 'ROOT\UMBUS\0000','ROOT\COMPOSITEBUS\0000','ROOT\VDRVROOT\0000','ROOT\NDISVIRTUALBUS\0000' | Select-Object FriendlyName, Status
```

---

### 安装 Docker Desktop（2026-05-08）

#### 环境信息

| 组件 | 版本 |
|---|---|
| Windows | 10.0.26200 |
| WSL 2 | 2.6.3.0 |
| 内核 | 6.6.87.2-microsoft-standard-WSL2 |
| Ubuntu | 24.04 LTS (on WSL 2) |
| Docker Desktop | 4.71.0 |
| Docker Engine | 29.4.1 |

#### 安装步骤

1. 确保 WSL 2 已安装且 Ubuntu 发行版正常运行（见上方故障排查）
2. 安装 Docker Desktop：
   ```powershell
   winget install Docker.DockerDesktop --accept-package-agreements
   ```
3. Docker Desktop 启动后，**停止 Docker Desktop**
4. 创建配置文件，把数据存储改到 D 盘：
   ```powershell
   # 创建 %APPDATA%\Docker\settings.json
   mkdir $env:APPDATA\Docker
   Set-Content -Path $env:APPDATA\Docker\settings.json -Value '{ "dataFolder": "D:\\softwares\\docker" }'
   ```
5. 关闭 WSL 释放文件锁：`wsl --shutdown`
6. 移动已创建的 VHDX 文件：
   ```
   C:\Users\<用户名>\AppData\Local\Docker\wsl\
     ├── disk\docker_data.vhdx  →  D:\softwares\docker\wsl\disk\
     └── main\ext4.vhdx         →  D:\softwares\docker\wsl\main\
   ```
7. 重新启动 Docker Desktop

> **注意**：Docker Desktop 程序本身安装到 `C:\Program Files\Docker\` 无法更改，以上配置只改变**数据文件**（镜像、容器、卷等）的存放位置。

#### 验证安装

```powershell
docker run --rm hello-world
# 输出 "Hello from Docker!" 即安装成功
```

> Docker CLI 首次启动后可能需要**新开终端**才能直接用 `docker` 命令，否则需要用完整路径：
> `C:\Program Files\Docker\Docker\resources\bin\docker.exe`

#### 实用的检查命令

```powershell
wsl --list --verbose          # 查看 WSL 发行版
docker info                   # 查看 Docker Engine 详情
docker desktop status         # 查看 Docker Desktop 状态
Get-PnpDevice | Where-Object { $_.Status -ne 'OK' }  # 检查是否有异常设备
```

---

### 与 VirtualBox 的冲突

Docker Desktop (WSL 2) 依赖 Hyper-V 架构，与 VirtualBox **不能同时运行**。

- 要用 Docker Desktop → 关掉 VirtualBox
- 要用 VirtualBox → 关掉 Docker Desktop（`docker desktop stop`）
- 切换后可能需要重启电脑
