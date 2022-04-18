# 多表攻略

🔖 当需要从多张表中获得数据，或者通过其他表的数据删除某个表的记录等操作，这个时候就需要多表操作。

## 表关联

### 一对一

比如说会员表与个人资料（QQ，邮箱）表即为一对一关系。

### 一对多

比如学生与班级表间即为一对多关系，一个班级有多个学生，一个学生属于一个班级。

### 多对多

粉丝表与用户表关系，一个粉丝可以关注多个用户，一个用户也可以有多个粉丝。像这种关系我们会使用一张**中间表**来记录关系。

## 笛卡尔积

🔖 多个表的连接将会得到所有可能出现的行，即没有明确做两个表间的关联条件时，所有记录都将符合。

```sql
SELECT * FROM stu ,class;   # table1.length * table2.length
```

下面是添加条件后的结果

```sql
# stu表带class_id 与 class表的id匹配
SELECT * FROM stu ,class WHERE stu.class_id = class.id;
# 或
SELECT s.sname,s.sex ,c.cname
FROM stu as s ,class as c
WHERE s.class_id = c.id
```

## INNER JOIN

🔖 所有多表操作都可以简单理解为，把多个表联系成一个表，最终当成一个表对待。

::: tip 思路

1. 先确定过程涉及到哪几张表
2. 将多表联合成一个表对待 inner join ... on
3. 最后进行我们需要的查询汇总

::: 

### 所有用户的资料

```sql
SELECT * FROM stu as s
INNER JOIN user_info as i
ON s.id = i.stu_id;
```

使用`INNER JOIN` 使用多表关联的语义更清晰

```sql
SELECT * FROM stu
INNER JOIN class
ON stu.class_id = class.id;
```

### 一班的所有同学

> 班级 + 同学

```sql
SELECT * FROM stu INNER JOIN class
ON stu.class_id = class.id
WHERE class.id = 1;
```

💫 为了性能和多表字段重名覆盖的问题，有必要在查询时明确获取的列

```sql
SELECT sname,class_id,stu.id as stu_id,sex,cname FROM stu
INNER JOIN class ON stu.class_id = class.id
WHERE class.id = 1;
```

```json
{
  "sname" : "李广",
  "class_id" : 1,
  "stu_id" : 1,
  "sex" : "男",
  "cname" : "幼儿园"
},
```

### 每个班级文章数量

> 班级 + 学生 + 文章

```sql
SELECT c.id ,count(*) FROM stu as s 
INNER JOIN class as c
INNER JOIN article as a
ON s.class_id = c.id AND s.id = a.stu_id
GROUP BY c.id;
```

| cname  | COUNT(*) |
| ------ | -------- |
| 幼儿园 | 2        |
| 初中   | 1        |
| 小学   | 1        |

### 一班女生发表的文章

先获取通过表关联获取所有数据（as 关键字是可以省略的）

```sql
SELECT * from stu as s
INNER JOIN class as c
ON s.class_id = c.id 
INNER JOIN article as a
ON s.id = a.stu_id;
```

🔥 可以ON同时多个表关联逻辑

```sql
SELECT c.id,a.title FROM stu as s 
INNER JOIN class as c
INNER JOIN article as a
ON s.class_id = c.id AND s.id = a.stu_id
WHERE c.id=1 AND s.sex = '女';
```

### 班级文章发表总数

```sql
SELECT count(a.id) as article_sum,c.id FROM stu as s 
INNER JOIN class as c
INNER JOIN article as a
ON s.class_id = c.id AND s.id = a.stu_id
GROUP BY c.id;
```

### 文章超过两篇的班级

> group by分组后的结果再进行筛选，需要使用having

```sql
SELECT c.id,count(*) as total FROM stu as s
INNER JOIN class as c
INNER join article as a
ON s.class_id = c.id AND s.id = a.stu_id
GROUP BY c.id
HAVING total >2;
```

### 班级文章的 总点击数与平均点击数

```sql
SELECT sum(a.click) as class_sum,avg(a.click),c.id FROM stu as s 
INNER JOIN class as c
INNER JOIN article as a
ON s.class_id = c.id AND s.id = a.stu_id
GROUP BY c.id
ORDER BY class_sum DESC;
```

| class_sum | avg(a.click) | id   |
| --------- | ------------ | ---- |
| 118       | 59.0000      | 1    |
| 100       | 100.0000     | 2    |
| 18        | 18.0000      | 3    |

### 每个班级有多少同学

```sql
SELECT count(*),c.cname FROM stu as s
INNER JOIN class as c
ON s.class_id = c.id
GROUP BY c.id;
```

### 学生人数大于2的班级

```sql
SELECT count(*) as total,c.cname FROM stu as s INNER JOIN class as c
ON s.class_id = c.id
GROUP BY c.cname
HAVING total>=2;
```

## OUTER JOIN

外链接包括`LEFT JOIN` 与 `RIGHT JOIN` ，可以简单理解为 `LEFT JOIN`会包含左侧所有表记录，`RIGHT JOIN` 会包含右侧表全部记录。

### -----INNER JOIN------

### 没设置QQ的用户

🚨 使用`inner join`只能拿到对应规则匹配到的数据，也就是在信息表里有数据的学生列表：

```sql
SELECT * FROM stu AS s
INNER JOIN stu_info as i
ON s.id = i.stu_id;
```

| id   | sname | class_id | birthday            | updated_at          | sex  | id   | email               | qq         | mobile     | stu_id |
| ---- | ----- | -------- | ------------------- | ------------------- | ---- | ---- | ------------------- | ---------- | ---------- | ------ |
| 1    | 李广  | 1        | 1998-02-12 08:22:13 | 2019-07-20 14:22:16 | 男   | 1    | 2300071698@qq.com   | 2300071698 | 999999999  | 1      |
| 3    | 钱佳  | 3        | 1989-11-17 10:29:13 | 2019-07-17 20:54:14 | 男   | 2    | good@houdunren.com  | 9999999    | 188888888  | 3      |
| 5    | 小明  | 2        | 2003-09-01 20:33:13 | 2019-07-20 16:41:32 | 男   | 3    | hello@houdunren.com | 2222       | 1988888888 | 5      |

---

✅ 使用`left join`来获取到所有学生，有信息的也包含在表结果中

```sql
SELECT * FROM stu AS s
lEFT JOIN stu_info as i
ON s.id = i.stu_id;
```

| id   | sname | class_id | birthday            | updated_at          | sex  | id   | email               | qq         | mobile     | stu_id |
| ---- | ----- | -------- | ------------------- | ------------------- | ---- | ---- | ------------------- | ---------- | ---------- | ------ |
| 1    | 李广  | 1        | 1998-02-12 08:22:13 | 2019-07-20 14:22:16 | 男   | 1    | 2300071698@qq.com   | 2300071698 | 999999999  | 1      |
| 2    | 何青  | 1        | 1985-07-22 18:19:13 | 2019-07-17 21:50:38 | 女   |      |                     |            |            |        |
| 3    | 钱佳  | 3        | 1989-11-17 10:29:13 | 2019-07-17 20:54:14 | 男   | 2    | good@houdunren.com  | 9999999    | 188888888  | 3      |
| 4    | 刘玉  | 1        | 1999-07-03 19:46:13 | 2019-07-17 20:54:14 | 女   |      |                     |            |            |        |
| 5    | 小明  | 2        | 2003-09-01 20:33:13 | 2019-07-20 16:41:32 | 男   | 3    | hello@houdunren.com | 2222       | 1988888888 | 5      |
| ...  | ...   | ...      |                     |                     |      |      |                     |            |            |        |

---

🚀 最终，获取没有设置qq信息的用户结果如下：

```sql
SELECT s.sname FROM stu AS s
lEFT JOIN stu_info as i
ON s.id = i.stu_id
WHERE i.qq IS NULL;
```

### 没发表文章的同学

```sql
SELECT s.id,s.sname FROM stu as s
LEFT JOIN article as a 
ON s.id = a.stu_id
WHERE a.id IS NULL;
```

### ------RIGHT JOIN------

### 哪个班级没有学生

> 无论class有没有学生，都要获取到class信息

```sql
SELECT * FROM stu AS s
RIGHT JOIN class as c
ON s.class_id = c.id;
```

| id   | sname | class_id | birthday            | updated_at          | sex  | id   | cname  | description         |
| ---- | ----- | -------- | ------------------- | ------------------- | ---- | ---- | ------ | ------------------- |
| 9    | 李月  | 1        |                     | 2019-07-18 17:49:03 | 女   | 1    | 幼儿园 | 学习PHP 开发网站    |
| 7    | 李风  | 1        | 2003-02-15 20:33:13 | 2019-07-20 14:30:02 | 男   | 1    | 幼儿园 | 学习PHP 开发网站    |
| 4    | 刘玉  | 1        | 1999-07-03 19:46:13 | 2019-07-17 20:54:14 | 女   | 1    | 幼儿园 | 学习PHP 开发网站    |
| 2    | 何青  | 1        | 1985-07-22 18:19:13 | 2019-07-17 21:50:38 | 女   | 1    | 幼儿园 | 学习PHP 开发网站    |
| 1    | 李广  | 1        | 1998-02-12 08:22:13 | 2019-07-20 14:22:16 | 男   | 1    | 幼儿园 | 学习PHP 开发网站    |
| 8    | 李兰  | 2        |                     | 2019-07-19 12:50:07 | 女   | 2    | 小学   | 前端工程师          |
| 5    | 小明  | 2        | 2003-09-01 20:33:13 | 2019-07-20 16:41:32 | 男   | 2    | 小学   | 前端工程师          |
| 6    | 张云  | 3        | 1996-09-01 20:33:13 | 2019-07-19 12:59:40 | 女   | 3    | 初中   | 服务器知识PHP好帮助 |
| 3    | 钱佳  | 3        | 1989-11-17 10:29:13 | 2019-07-17 20:54:14 | 男   | 3    | 初中   | 服务器知识PHP好帮助 |
|      |       |          |                     |                     |      | 4    | 高中   | 数据库学习          |
|      |       |          |                     |                     |      | 5    | 大学   | 越努力越幸运        |

---

```sql
SELECT * FROM stu AS s
RIGHT JOIN class as c
ON s.class_id = c.id
WHERE s.id IS NULL;
```

### 查找学生所在班级，没有班级的学生显示无

> 偏心学生表

```sql
SELECT sname,ifnull(s.class_id,'无') FROM stu AS s
LEFT JOIN class AS c
ON s.class_id = c.id;
#或
SELECT s.sname,if(s.class_id,c.cname,'无') as cname
FROM class as c
RIGHT JOIN stu as s
ON c.id = s.class_id;
```

## SELF JOIN

🔖 `SELF JOIN`为自连接即表与自身进行关联。虽然自连接的两张表都是同一张表，但也把它**按两张表对待**，这样理解就会容易些。

> 子链接的性能比子查询要好

### 查找小明的同班同学

使用子查询操作

```sql
SELECT * FROM stu WHERE class_id = 
(SELECT class_id FROM stu WHERE sname = '小明')
AND stu.sname !='小明';
```

使用自连接查询

```sql
SELECT s2.sname FROM stu AS s1
INNER JOIN stu AS s2
ON s1.class_id = s2.class_id
WHERE s1.sname = '李月'
AND s2.sname != '李月';
```

```json
{
  "sname" : "李广"
},
{
  "sname" : "何青"
},
{
  "sname" : "刘玉"
},
{
  "sname" : "李风"
}
```

### 查找与刘雷同年出生的同学

1. 首先在单表查内找出生日相同的所有匹配信息：

```sql
SELECT * FROM stu as s1
INNER JOIN stu as s2
ON YEAR(s1.birthday) = YEAR(s2.birthday)
```

| id   | sname | class_id | birthday            | updated_at          | sex  | id   | sname | class_id | birthday            | updated_at          | sex  |
| ---- | ----- | -------- | ------------------- | ------------------- | ---- | ---- | ----- | -------- | ------------------- | ------------------- | ---- |
| 1    | 李广  | 1        | 1998-02-12 08:22:13 | 2019-07-20 14:22:16 | 男   | 1    | 李广  | 1        | 1998-02-12 08:22:13 | 2019-07-20 14:22:16 | 男   |
| 2    | 何青  | 1        | 1985-07-22 18:19:13 | 2019-07-17 21:50:38 | 女   | 2    | 何青  | 1        | 1985-07-22 18:19:13 | 2019-07-17 21:50:38 | 女   |
| 3    | 钱佳  | 3        | 1989-11-17 10:29:13 | 2019-07-17 20:54:14 | 男   | 3    | 钱佳  | 3        | 1989-11-17 10:29:13 | 2019-07-17 20:54:14 | 男   |
| 4    | 刘玉  | 1        | 1999-07-03 19:46:13 | 2019-07-17 20:54:14 | 女   | 4    | 刘玉  | 1        | 1999-07-03 19:46:13 | 2019-07-17 20:54:14 | 女   |
| 7    | 李风  | 1        | 2003-02-15 20:33:13 | 2019-07-20 14:30:02 | 男   | 5    | 张云  | 2        | 2003-09-01 20:33:13 | 2019-07-20 16:41:32 | 男   |
| 5    | 刘雷  | 2        | 2003-09-01 20:33:13 | 2019-07-20 16:41:32 | 男   | 5    | 张云  | 2        | 2003-09-01 20:33:13 | 2019-07-20 16:41:32 | 男   |
| ...  | ...   | ...      | ...                 |                     |      |      |       |          |                     |                     |      |

2. 然后过滤出需要的信息

```sql
SELECT s2.sname FROM stu as s1
INNER JOIN stu as s2
ON YEAR(s1.birthday) = YEAR(s2.birthday)
WHERE s1.sname = '刘雷' AND s2.sname != '刘雷'
```

### 查找比刘雷大的同学

```sql
SELECT s2.sname FROM stu as s1
INNER JOIN stu as s2
ON YEAR(s1.birthday) > YEAR(s2.birthday)
WHERE s1.sname = '刘雷';
```

## 多对多

🔖 比如学生可以学习多个课程，一个课程也可以被多个学生学习，这种情况就是多对多的关系。需要创建一张**中间表**来把这种关系联系起来。

### 查找小明学习的课程

1. 先把三张表关联起来：stu =>  stu_lesson => lesson

```sql
SELECT * FROM stu as s
INNER JOIN stu_lesson as sl
ON s.id = sl.stu_id
INNER JOIN lesson as l
ON l.id = sl.lesson_id;
```

2. 然后添加过滤逻辑即可

```sql
SELECT s.sname, l.name FROM stu as s
INNER JOIN stu_lesson as sl
ON s.id = sl.stu_id
INNER JOIN lesson as l
ON l.id = sl.lesson_id
WHERE s.sname = '李广'

# 大多数情况下，获取到lesson id即可,减少表的关联性能更好
SELECT sl.lesson_id ,s.sname FROM stu as s
INNER JOIN stu_lesson as sl
ON s.id = sl.stu_id
WHERE s.sname = '李广'
#|lesson_id|sname|
#|---------|-----|
#|2        |李广  |
#|1        |李广  |
```

### 哪个班级的同学最爱学习MYSQL

> 班级 + 学生 + 课程 ，为了获取课程的名称。除了学生课程关联表，还需要课程表的信息

```sql
SELECT * FROM class as c
INNER JOIN stu as s
ON c.id = s.class_id 
INNER JOIN stu_lesson as sl
ON s.id = sl.stu_id
INNER JOIN lesson as l
ON l.id = sl.lesson_id;
```

然后添加过滤条件，最终进行分组排序

```sql
SELECT c.id, count(*) as total FROM class as c
INNER JOIN stu as s
ON c.id = s.class_id 
INNER JOIN stu_lesson as sl
ON s.id = sl.stu_id
INNER JOIN lesson as l
ON l.id = sl.lesson_id
WHERE l.name = 'MYSQL'
GROUP BY c.id
ORDER BY total DESC
LIMIT 1;

# |id |total|
# |---|-----|
# |1  |2    |
```

## UNION

::: tip `UNION` 用于**连接多个查询结果**，要保证每个查询返回的列的数量与顺序要一样。

- UNION会过滤重复的结果 

  `SELECT * FROM stu UNION SELECT * FROM stu`与单表查询结果相同

- UNION ALL 不过滤重复结果

  `SELECT * FROM stu UNION ALL SELECT * FROM stu`单表重复

- 列表字段由是第一个查询的字段 `sname`

::: 

```sql
(SELECT sname from stu WHERE sex = '男' limit 2)
UNION ALL
(SELECT cname from class limit 3)
# ORDER by rand()
# limit 2;

|sname|
|-----|
|李广   |
|何青   |
|幼儿园  |
|小学   |
|初中   |
```

### 年龄最大与最小的同学

```sql
(SELECT sname,birthday FROM stu ORDER BY birthday DESC LIMIT 1)
UNION
(SELECT sname,birthday from stu ORDER BY birthday ASC LIMIT 1)
ORDER BY birthday DESC;
```

| sname | birthday            |
| ----- | ------------------- |
| 小明  | 2003-09-01 20:33:13 |
| 李兰  | 1996-09-01 20:33:13 |

### 组成动态数据

最新发表的文章和学习的课程

```sql
(SELECT CONCAT(s.sname,'发表了文章：',a.title) as title from article as a
INNER JOIN stu as s
ON s.id = a.stu_id
LIMIT 2)
UNION
(SELECT CONCAT(s.sname,'正在学习：',l.name) FROM stu AS s 
INNER JOIN stu_lesson as sl
INNER JOIN lesson as l
ON s.id = sl.stu_id AND sl.lesson_id = l.id 
LIMIT 2);
# ORDER by rand()
```

| title                                 |
| ------------------------------------- |
| 李广发表了文章：PHP很好学习，功能强大 |
| 钱佳发表了文章：Mysql系统课程正在更新 |
| 李广正在学习：MYSQL                   |
| 李广正在学习：PHP                     |

## 多表删除

### 删除所有没有学习任何课程的同学

🔖 要先查询到学生与课程的集合，因为没有课程的学生也要拿到，偏心向学生表；再删除

```sql
# 备份：create table stu2 SELECT * from stu;
SELECT * from stu2 as s
LEFT JOIN stu_lesson as sl
ON s.id = sl.stu_id
WHERE sl.lesson_id IS NULL;
```

1. 使用子查询删除

```sql
DELETE FROM stu2 WHERE id IN(
  SELECT * FROM(
    SELECT s.id from stu2 as s
    LEFT JOIN stu_lesson as sl
    ON s.id = sl.stu_id
    WHERE sl.lesson_id IS NULL
  )AS s
);
```

2. 使用多表删除：`DELETE table from ~`

```sql
DELETE s from stu2 as s
LEFT JOIN stu_lesson as sl
ON s.id = sl.stu_id
WHERE sl.lesson_id IS NULL
```

