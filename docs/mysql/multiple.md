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

获取没有设置QQ的用户

```sql
SELECT s.sname FROM stu AS s LEFT JOIN user_info as i
ON s.id = i.stu_id
WHERE i.qq is null;
```

查找所有没有发表文章的同学

```sql
SELECT s.id,s.sname FROM stu as s LEFT JOIN article as a 
ON s.id = a.stu_id
WHERE a.id IS NULL;
```

哪个班级没有学生

```sql
SELECT sname,c.id,c.cname FROM stu AS s RIGHT JOIN class as c
ON s.class_id = c.id
WHERE s.id IS NULL;
```

每个班级的平均年龄

```sql
SELECT c.cname,avg(timestampdiff(year,s.birthday,now())) as t 
FROM stu as s INNER JOIN class as c
ON s.class_id = c.id
GROUP BY c.cname;
```

查找学生所在班级，没有班级的学生显示无

```sql
SELECT sname,ifnull(s.class_id,'无') FROM stu AS s LEFT JOIN class AS c
ON s.class_id = c.id;
```

## SELF JOIN

`SELF JOIN`为自连接即表与自身进行关联。虽然自连接的两张表都是同一张表，但也把它按两张表对待，这样理解就会容易些。

**查找后盾人的同班同学**

使用子查询操作

```sql
SELECT * FROM stu WHERE class_id = 
(SELECT class_id FROM stu WHERE sname = '后盾人')
AND stu.sname !='后盾人';
```

使用自连接查询

```sql
SELECT s1.sname,s2.sname FROM stu as s1 
INNER JOIN stu as s2
ON s1.class_id = s2.class_id
WHERE s1.sname = '后盾人' AND s2.sname !='后盾人';
```

**查找与后盾人同年出生的同学**

```sql
SELECT s2.* FROM stu as s1 INNER JOIN stu AS s2
ON year(s1.birthday) = year(s2.birthday)
WHERE s1.sname ='后盾人' AND s2.sname !='后盾人';
```

**查找比后盾人大的同学**

```sql
SELECT s2.sname,s2.birthday FROM stu AS s1
INNER JOIN stu AS s2
ON year(s1.birthday)>year(s2.birthday)
WHERE s1.sname = '后盾人';
```

## 多对多

比如学生可以学习多个课程，一个课程也可以被多个学生学习，这种情况就是多对多的关系。需要创建一张中间表来把这种关系联系起来。

**查找后盾人学习的课程**

```sql
SELECT sname,l.name FROM stu AS s
INNER JOIN user_lesson AS ul
ON s.id = ul.stu_id
INNER JOIN lesson AS l
ON ul.lesson_id = l.id
WHERE s.sname = '后盾人';
```

**哪个班级的同学最爱学习PHP**

```sql
SELECT c.cname,count(*) AS total FROM stu AS s
INNER JOIN user_lesson AS ul
INNER JOIN lesson AS l
ON s.id = ul.stu_id AND ul.lesson_id = l.id
INNER JOIN class AS c
ON c.id = s.class_id
WHERE l.name='php'
GROUP BY c.cname
ORDER by total 
LIMIT 1;
```

## UNION

`UNION` 用于连接多个查询结果，要保证每个查询返回的列的数量与顺序要一样。

- UNION会过滤重复的结果
- UNION ALL 不过滤重复结果
- 列表字段由是第一个查询的字段

**查询年龄最大与最小的同学**

```sql
(SELECT sname,birthday FROM stu ORDER BY birthday DESC LIMIT 1)
UNION
(SELECT sname,birthday from stu ORDER BY birthday ASC LIMIT 1)
ORDER BY birthday DESC;
```

**最新发表的文章和学习的课程组成动态数据**

```sql
(SELECT CONCAT(s.sname,'发表了文章：',a.title) from article as a
INNER JOIN stu as s
ON s.id = a.stu_id
LIMIT 2)
UNION
(SELECT CONCAT(s.sname,'正在学习：',l.name) FROM stu AS s 
INNER JOIN user_lesson as ul
INNER JOIN lesson as l
ON s.id = ul.stu_id AND ul.lesson_id = l.id 
LIMIT 2);
```

## 多表删除

删除所有没有学习任何课程的同学

```sql
DELETE s FROM stu as s 
LEFT JOIN user_lesson as ul
ON s.id = ul.stu_id
WHERE ul.lesson_id IS NULL;
```

使用子查询操作

```sql
DELETE FROM stu WHERE id IN(
  SELECT id FROM
    (SELECT s.id FROM stu as s
    LEFT JOIN user_lesson as ul
    ON s.id = ul.stu_id
    WHERE ul.lesson_id IS NULL) 
  AS s
);
```