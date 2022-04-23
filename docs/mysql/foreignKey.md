## 外键约束

🔖 外键表示一个表中的字段被另一个表中的一个字段引用。外键对相关表中的数据造成了限制，使MySQL能够保持数据完整性。

比如学生和班级表，学生表完全依赖班级表，我们可以通过外键约束让学生表与班级表产生关联，当班级表数据变化时影响学生表。

- 父表和子表储存引擎要一致
- 使用InnoDB引擎支持外键约束
- 外键要与主表列类型一致
- 外键列使用索引（有些版本的mysql会自动帮助为外键设置索引)

## 创建外键

### 新建表

下面创建班级表与学生表，并定义学生表与班级表建立外键约束。

学生表是子表，在子表定义外键，班级表是主表，id在主表。

```sql
-- 班级表
CREATE TABLE class (id int PRIMARY KEY AUTO_INCREMENT,name varchar(50));

-- 学生表
CREATE table stu2(
	id int PRIMARY KEY AUTO_INCREMENT,
	sname char(30) NOT NULL,
	class_id int DEFAULT NULL,
	CONSTRAINT stu2_class
	FOREIGN KEY (class_id)
	REFERENCES class(id)
	ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8;
```

>constraint: 约束

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/mysql/foreignKey/er.png)

### 修改表

下面是对学生表添加班级表的外键约束。

```sql
ALTER TABLE stu ADD 
CONSTRAINT stu_class
FOREIGN KEY (class_id) 
REFERENCES class(id) 
ON DELETE CASCADE;
```

### 删除

```sql
ALTER TABLE stu DROP FOREIGN KEY stu_class;
```

## 选项说明

下面列出外键关联用到的关键词。

| 选项        | 说明                 |
| ----------- | -------------------- |
| CONSTRAINT  | 为外键约束定义名称   |
| FOREIGN KEY | 子表与父表关联的列   |
| REFERENCES  | 子表关联的父表字段   |
| ON DELETE   | 父表删除时的处理方式 |
| ON UPDATE   | 父表更新时的处理方式 |

## 处理动作

### ON DELETE

ON DELETE指在删除时的处理方式，常用的处理方式包括以下几种。

| 选项                | 说明                                                         |
| ------------------- | ------------------------------------------------------------ |
| ON DELETE CASCADE   | 删除父表记录时，子表记录同时删除                             |
| ON DELETE SET NULL  | 删除父表记录时，子表记录设置为NULL（子表字段要允许NULL）     |
| ON DELETE NO ACTION | 删除父表记录时，子表不做任何处理，必须把子表处理完才可以删除主表（子表stu 有数据，主表class不能动，没有引用的时候才能删除） |

### ON UPDATE

ON UPDATE 指在更新时的处理方式，常用的处理方式包括以下几种。

| 选项                | 说明                                                         |
| ------------------- | ------------------------------------------------------------ |
| ON UPDATE CASCADE   | 更新父表记录时，比如更改主表的主键(eg. id)时，子表记录同时更新 |
| ON UPDATE SET NULL  | 更新父表记录时，比如更改主表的主键时，子表记录设置为NULL     |
| ON UPDATE NO ACTION | 更新父表记录时，子表不做任何处理，必须把子表处理完才可以更新主表(没有引用的时候才能更新) |