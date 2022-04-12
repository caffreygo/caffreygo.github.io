# 基本操作

## 连接服务器

### 参数说明

在命令行连接mysql的参数如下：

| 选项 | 说明        | 默认             |
| ---- | ----------- | ---------------- |
| -u   | 帐号        | 当前系统同名帐号 |
| -p   | 密码        |                  |
| -P   | 连接端口    | 3306             |
| -h   | 主机地址    | 127.0.0.1        |
| -e   | 执行sql指令 |                  |

### 连接操作

**连接服务器**

```sh
mysql -uroot -p -P3306 -h 127.0.0.1
```

连接本地数据库时可以使用默认值

```sh
mysql -uroot -p 
```

使用`-e` 执行SQL语句

```sh
mysql -uroot -proot -e"show databases;"
```

**退出连接**

命令行下执行exit可通出当前连接

```sh
exit
```

### 执行与取消

每条SQL指令以`;`结束，按回车键后执行该条语句。

```sh
show databases;
```

**放弃语句**

在SQL后使用 `\c`表示取消本条SQL，后面不需要写 `;`。

```sh
show databases \c
```

## 数据库管理

### 常用指令

**数据库列表**

使用以下命令可以得到当前服务器中的所有数据库。

```sh
show databases;
```

**创建新库**

下面是创建数据库 `scaffold` 并设置字符集为 utf8。

```sql
CREATE DATABASE scaffold CHARSET utf8;
```

**查看数据库**

```sh
show create database scaffold;
```

**删除数据库**

```sql
drop database scaffold;
```

为了防止删除不存在的数据库报错

```sql
drop database if exists scaffold;
```

**选择数据库**

数据库主要是对表操作，选择数据库后可以省掉每次指定数据库的麻烦。

```sql
use scaffold
```

### 导入语句

有时需要把外部的SQL文件导入到服务器中，图像化的数据库管理软件都支持导入，下面我们介绍命令行的使用方法。

**创建文件**

下面我们创建 `test.sql`文件内容如下

```sql
create database hello charset utf8;

SHOW DATABASES;
```

**外部导入**

```sql
mysql -uroot -p < test.sql
```

**连接后导入**

```sql
mysql -uroot -p
> source test.sql
```

## 数据表管理

可以把数据库理解为文件夹，数据表理解为文件，数据表是真正储存数据的地方。

### 基本操作

**创建数据表**

```sql
create table class (
id int primary key AUTO_INCREMENT,
cname varchar(30) NOT NULL,
description varchar(100) default NULL) 
charset utf8;
```

以上语句创建表 `class` 字段说明如下：

- 字段 id 为主键自增
- 字段 cname 为字符串类型varchar 并不允许为 null
- 字段 description 为可为null 字符串
- 字符集为 utf8 ，如果不设置将继承数据库字符集

**添加测试数据**

```sql
INSERT INTO class (cname,description) VALUES('PHP','后盾人教你使用PHP快速开发网站');
INSERT INTO class (cname) VALUES('Mysql');
```

因为 description 设置为null 所以第二个记录没有设置值时使用默认的null值。

### 复制数据

根据已经存在的表结构创建新表

```sql
create table hello like class;
```

复制其他表的数据

```sql
insert into hello select * from class;
```

只复制批定字段

```sql
insert into hello (cname) select cname from class;
```

复制表时同时复制数据

```sql
create table hdjs select * from class;
```

下面是只复制指定字段，并为不同名字段起别名

```sql
create table hd (id int primary key AUTO_INCREMENT,name varchar(30)) select id,cname as name from class;
```

删除数据表

```sql
DROP TEMPORARY TABLE IF EXISTS hd;
```

### 临时表

::: tip 临时表是用于储存临时数据表表，会在数据库连接中断时自动删除。

- 可以与普通表同名，优先级高于普通表
- 连接终端时自动删除

::: 

```sql
create TEMPORARY TABLE class_names SELECT * from class;
select * from class_names;
```

删除临时表

```sql
DROP TEMPORARY TABLE IF EXISTS class_names;
```

> 当然开发中我们更喜欢将临时数据放在缓存或会话中，这里只是介绍这个mysql特性。

## 查询数据

### 测试表

为了进行查询实例操作我们创建以下表

```sql
CREATE TABLE stu (id int PRIMARY KEY AUTO_INCREMENT,sname char(30),class_id int default null,age smallint default null)

INSERT INTO stu(sname,class_id,age) VALUES('小明',1,20),('张三',2,32),('李四',3,null),('小刘',null,46);
```

### 字段处理

查询所有字估数据

```sql
select * from class;
```

查询指定字段数据并排序字段

```sql
select description,cname from class;
```

### 条件筛选

`where`根据条件查询

```sql
select * from class where cname = 'php'
```

查询**包含**关键词的数据

```sql
select * from class where description like '%p%';
```

**合并**列返回查询结果

```sql
select CONCAT(id,cname) as 'class_info' FROM class;
```

指定多条件查询

```sql
SELECT * FROM class where id>1 and cname = 'php'
```

查找一班或姓张的同学

```sql
select * from stu where class_id =1 or sname like '%张%'
```

介绍中不包含php的班级

```sql
SELECT * from class WHERE description NOT LIKE '%php%';
```

查询学生所在班级编号，并去除重复值

```sql
SELECT DISTINCT class_id from stu ;
```

查询年龄在20~35岁的同学

```sql
select * from stu where age BETWEEN 20 and 35;
```

查找不在30~35岁间的同学

```sql
select * from stu where age NOT BETWEEN 30 and 35;
```

查找2、3班的所有同学

```sql
SELECT * FROM stu where class_id IN(2,3);
```

查找除了1、3班的同学

```sql
select * from stu where class_id NOT IN (1,3);
```

### NULL

查询没有分配班级的学生姓名

```sql
select sname from stu where class_id is null;
```

查询已经分配班级的学生信息

```sql
SELECT * from stu where class_id is not null;
```

> 查询结果中对没分配班级的学生显示未分配

```sql
select sname,if(class_id is null,'未分配',class_id) from stu;
# 也可以使用IFNULl 函数简化操作
select sname,ifnull (class_id ,'未分配') from stu;
```

### 排序结果

按学生年龄从大到小排序

```sql
SELECT * FROM stu order by age desc;
```

班级从大到小排序，相同班级的同学年龄从小到大排序

```sql
select * from stu order by class_id DESC,age ASC;
```

随机获取一名同学

```sql
SELECT * from stu order by RAND() limit 1;
```

最后报名的同名

```sql
select * from stu order by id desc limit 1
```

每二和第三报名的同学

```sql
# Limit 是从零开始的
SELECT * FROM stu order by id ASC limit 1,2;
```

查找2班年龄最小的同学

```sql
SELECT * from stu where class_id =2 and age is not null order by age asc limit 1;
```

以上代码结果不准确，因为可能有同年龄的同学，所以可以使用子查询操作。

```sql
select * from stu where age = (SELECT age from stu where class_id =2 and age is not null order by age asc limit 1)
```

## 其他操作

### 更新数据

将班级为2的学生改为班级3

```sql
UPDATE stu SET class_id = 3 WHERE class_id = 2;
```

2班年龄小于20岁的同学年龄设置为NULL

```sql
UPDATE stu SET age = null WHERE class_id=2 AND age<20;
```

将年龄小于20岁的同学年龄加10岁

```sql
UPDATE stu SET age= age+20 WHERE age<20;
```

### 删除记录

删除所有年龄小于20的同学

```sql
DELETE FROM stu WHERE age<20;
```

删除所有年龄小在30并没有班级的同学

```sql
DELETE FROM stu WHERE class_id IS NULL;
```

### 添加数据

添加一条记录

```sql
INSERT INTO stu SET sname = '小明',age=22,class_id=1;
```

添加多条记录

```sql
INSERT INTO stu (sname,class_id,age) VALUES('小明',2,32),('小张',3,45);
```