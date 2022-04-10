# 表维护

> alter: 改变

## 修改表

修改表名 `RENAME`

```sql
ALTER TABLE stu RENAME stus;
```

别一种操作方式 `RENAME ... to ...`

```sql
RENAME TABLE stus to stu;
```

修改表字符集 `charset`

```sql
ALTER TABLE class charset gbk;
```

删除表所有数据 `TRUNCAT`

```sql
TRUNCATE stu;
```

> truncate: 截断

删除数据表 `DROP`

```sql
DROP TABLE IF EXISTS stu;
```

## 字段管理

修改字段类型 `MODIFY`

```sql
ALTER TABLE stu MODIFY sname char(30) not null;
```

修改字段时同时更改字段名 `CHANGE`

```sql
ALTER TABLE stu CHANGE sname name varchar(30) not null;
```

添加字段 `ADD`

```sql
ALTER TABLE stu ADD sex SMALLINT default null;
```

在学生名称后添加邮箱字段 `ADD ... AFTER ...`

```sql
ALTER TABLE stu ADD email varchar(50) AFTER sname;
```

将字段添加到最前面 `ADD ... FIRST`

```sql
ALTER TABLE stu ADD qq varchar(30) first;
```

删除学生邮箱字段 `DROP`

```sql
ALTER TABLE stu DROP email;
```

## 主键操作

一般主键为**自增字段**，需要<u>删除自增属性</u>后才可以删除主键 

```sql
ALTER TABLE stu MODIFY id int not null;
```

删除主键  `DROP PROMARY KEY`

```sql
ALTER TABLE stu DROP PRIMARY key;
```

添加表主键 `ADD PRIMARY KEY`

```sql
ALTER table stu2 add PRIMARY KEY(id);
```

添加自增列 `AUTO_INCREMENT`

```sql
ALTER TABLE stu2 MODIFY id int not null AUTO_INCREMENT;
```

💡 主键与自增列一起添加

```sql
ALTER table stu3 modify id int not null AUTO_INCREMENT ,add PRIMARY key(id);
```