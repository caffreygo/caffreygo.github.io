# 排序聚合分组

## ORDER

### 排序介绍

::: tip mysql对查询结果使用`order by` 进行排序

- 对任何字段进行排序
- desc降序，asc升序
- 对别名字段可排序
- 对函数结果可排序
- 支持多列表排序
- 排序受校对规则影响（请查看其他章节课程了解校对规则）

:::

> Descending：降序；Ascending：升序

### 排序实例

**从男到女排序**

```sql
SELECT * FROM stu ORDER BY sex ASC;
```

**从男到女排序年龄从小到大排序**

```sql
SELECT * FROM stu ORDER BY sex ASC,birthday DESC;
```

**随机获取学生**

```sql
SELECT * FROM stu ORDER BY RAND() LIMIT 1;
```

**按出生月份从小到大排序**

```sql
SELECT birthday,MONTH(birthday) as m FROM stu ORDER BY m ASC;

# 或使用字符串函数操作
SELECT birthday,mid(birthday,6,2) as m FROM stu ORDER BY m ASC;
```

### 自定义排序

field函数用于比较值在集合中的索引，利用这一特性可以自定义排序

```sql
SELECT FIELD('a','c','a','b');
# 第一个a 为比较字符，后面的 c/a/b为集合，所以结果为2，如果在集合中不存在为0
```

使用 field 进行自定义排序

```sql
SELECT * FROM stu ORDER BY FIELD(left(sname,1),'何','赵');
```

## COUNT

**统计所有学生人数**

```sql
SELECT COUNT(*) FROM stu;
```

**所有女生人数**

```sql
SELECT COUNT(*) FROM stu WHERE sex=2;
```

统计所有分配班级的学生（count(字段)不会统计null值，使用count(*)时会计算null），所以下面使用具体的字段

```sql
SELECT COUNT(class_id) FROM stu;
```

## MIN/MAX

**获取最小的学生出生年份**

```sql
SELECT year(max(birthday)) from stu;
```

**最大的班级编号**

```sql
SELECT max(class_id) FROM stu;
```

**获取点击数最少的文章**

```sql
SELECT * FROM article WHERE click = (SELECT MIN(click) FROM article);
```

## [#](https://doc.houdunren.com/mysql/7 排序聚合分组.html#sum-avg)SUM/AVG

**获取所有文章总点击数**

```sql
SELECT SUM(click) FROM article;
```

**获取平均点击数**

```sql
SELECT AVG(click) FROM article;
```

**获取低于平均点击数据的文章**

```sql
SELECT * FROM article WHERE click < (SELECT AVG(click) FROM article);
```

**获取学生的平均年龄**

```sql
SELECT ROUND(AVG(TIMESTAMPDIFF(YEAR,birthday,now())))  FROM stu ;
```

## DISTINCT

distinct用于去除结果集中的重复记录

**获取所有班级编号**

```sql
SELECT DISTINCT class_id AS class FROM stu WHERE class_id IS NOT NULL;
```

**获取学生数，同班同名的算一个**

```sql
SELECT COUNT(DISTINCT class_id,sname) FROM stu WHERE class_id IS NOT NULL;
```

**获取班级平均人数，去掉重复的数值**

```sql
SELECT DISTINCT (count(id)) AS c FROM users GROUP BY class_id 
```

## GROUP

统计受ONLY_FULL_GROUP_BY模式影响，有关 ONLY_FULL_GROUP_BY 的详细讨论请查看 「运行模式」章节。

**统计每个班级的人数**

```sql
SELECT COUNT(*),class_id FROM stu WHERE class_id IS NOT NULL GROUP BY class_id ;
```

**每个班年龄最大的同学**

结果中要求出现班级编号和学生姓名，如果GROUP BY中只有班级编号字段，默认运行模式下SELECT中不能出现学生姓名。

MYSQL默认使用ONLY_FULL_GROUP_BY模式要求select中的列要在group中使用。有多种方式可以处理这个问题

- 可以通过更改查询模式，允许select的列不在group中出现
- 使用聚合函数
- 使用any_value函数处理
- GROUP BY中使用PRIMAY KEY 或 UNIQUE NOT NULL字段
- 有关ONLY_FULL_GROUP_BY模式已经在「运行模式」章节讨论过

直接查询将产生错误，因为sname不是GROUP BY使用的字段

```sql
SELECT min(birthday),sname FROM stu GROUP BY class_id;
```

使用聚合函数解决这个问题

```sql
SELECT min(birthday),min(sname) FROM stu GROUP BY class_id;
```

使用any_value函数解决

```sql
SELECT min(birthday),any_value(sname) FROM stu GROUP BY class_id;
```

也可以使用子查询

```sql
SELECT * FROM stu where birthday IN(
SELECT min(birthday) FROM stu GROUP BY class_id);
```

或使用聚合函数

```sql
SELECT min(birthday),min(sname) FROM stu GROUP BY class_id;
```

也可以更改查询模式，去掉ONLY_FULL_GROUP_BY模式的方式解决。

> 很多后台程序框架提供配置项用于禁止ONLY_FULL_GROUP_BY模式

```sql
SET sql_mode=''

SELECT min(birthday),sname FROM stu GROUP BY class_id;
```

**统计每班的男、女人数**

```sql
SELECT concat(class_id,'班'),if(sex=1,'男','女') as sex,
count(*) FROM stu
WHERE class_id IS NOT NULL
GROUP BY class_id,sex ORDER BY class_id;
```

**查找超过两个同学的班级**

```sql
SELECT class_id FROM stu GROUP BY class_id HAVING count(*)>2;
```

**查找本周迟到超过两次的同学**

```sql
SELECT stu_id FROM attendance 
WHERE date(created_at)>date(DATE_ADD(NOW(),INTERVAL 0-WEEKDAY(NOW()) day))
AND time(created_at)>'08:30:00'
GROUP BY stu_id
HAVING COUNT(*)>2;
```

**本周哪个同学准时到校次数最多**

```sql
SELECT count(*) as c,stu_id FROM attendance
WHERE date(created_at)>=date(date_add(now(),interval 0-WEEKDAY(now()) day))
AND time(created_at)<='08:30:00'
GROUP BY stu_id
ORDER by c desc
limit 1;
```

**本周哪一天迟到的人数最少**

```sql
SELECT date(created_at) FROM attendance 
WHERE date(created_at)>date(DATE_ADD(NOW(),INTERVAL 0-WEEKDAY(NOW()) day))
AND time(created_at)<='08:30:00'
GROUP BY created_at
ORDER BY COUNT(*) DESC
LIMIT 1;
```

**查找哪个姓的同学最多**

```sql
SELECT left(sname,1) as s,count(*) AS c FROM stu
GROUP BY s
ORDER BY c DESC
LIMIT 1;
```

**查找超过两个同学的姓氏**

```sql
SELECT left(sname,1) as s,count(*) AS c FROM stu
GROUP BY s
HAVING c>=2;
```