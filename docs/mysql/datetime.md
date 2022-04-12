# 日期时间

## DBeaver

如果使用DBeaver软件学习，需要在编辑连接设置正确时区。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/mysql/datetime/dbeaver.png)

**使用命令设置时区**

设置会话时区，每次连接会话需要重新设置

```sql
set time_zone = '+8:00'
```

全局时区设置

```sql
set global time_zone = '+8:00';
flush privileges;
```

## 数据类型

| 日期时间类型 | 占用空间 | 日期格式            | 最小值              | 最大值              | 零值表示            |
| ------------ | -------- | ------------------- | ------------------- | ------------------- | ------------------- |
| DATETIME     | 8 bytes  | YYYY-MM-DD HH:MM:SS | 1000-01-01 00:00:00 | 9999-12-31 23:59:59 | 0000-00-00 00:00:00 |
| TIMESTAMP    | 4 bytes  | YYYY-MM-DD HH:MM:SS | 1970-01-01 08:00:01 | 2038-01-19 03:14:07 | 00000000000000      |
| DATE         | 4 bytes  | YYYY-MM-DD          | 1000-01-01          | 9999-12-31          | 0000-00-00          |
| TIME         | 3 bytes  | HH:MM:SS            | -838:59:59          | 838:59:59           | 00:00:00            |
| YEAR         | 1 bytes  | YYYY                | 1901                | 2155                | 0000                |

- Mysql保存日期格式使用 YYYY-MM-DD HH:MM:SS的ISO 8601标准
- 向数据表储存日期与时间必须使用ISO格式
- 如果涉及时间计算，使用mysql的时间类型会方便很多
- 如果只是单纯为了记录时间，也可以选择使用int或者datetime类型

## 创建字段

```sql
ALTER TABLE stu ADD birthday datetime default null;
UPDATE stu set birthday ="1996-02-12 08:22:13" WHERE id=2;
```

## 格式化

### 参数介绍

| 格式 | 描述                                           |
| :--- | :--------------------------------------------- |
| %a   | 缩写星期名                                     |
| %b   | 缩写月名                                       |
| %c   | 月，数值                                       |
| %D   | 带有英文前缀的月中的天                         |
| %d   | 月的天，数值(00-31)                            |
| %e   | 月的天，数值(0-31)                             |
| %f   | 微秒                                           |
| %H   | 小时 (00-23)                                   |
| %h   | 小时 (01-12)                                   |
| %I   | 小时 (01-12)                                   |
| %i   | 分钟，数值(00-59)                              |
| %j   | 年的天 (001-366)                               |
| %k   | 小时 (0-23)                                    |
| %l   | 小时 (1-12)                                    |
| %M   | 月名                                           |
| %m   | 月，数值(00-12)                                |
| %p   | AM 或 PM                                       |
| %r   | 时间，12-小时（hh:mm:ss AM 或 PM）             |
| %S   | 秒(00-59)                                      |
| %s   | 秒(00-59)                                      |
| %T   | 时间, 24-小时 (hh:mm:ss)                       |
| %U   | 周 (00-53) 星期日是一周的第一天                |
| %u   | 周 (00-53) 星期一是一周的第一天                |
| %V   | 周 (01-53) 星期日是一周的第一天，与 %X 使用    |
| %v   | 周 (01-53) 星期一是一周的第一天，与 %x 使用    |
| %W   | 星期名                                         |
| %w   | 周的天 （0=星期日, 6=星期六）                  |
| %X   | 年，其中的星期日是周的第一天，4 位，与 %V 使用 |
| %x   | 年，其中的星期一是周的第一天，4 位，与 %v 使用 |
| %Y   | 年，4 位                                       |
| %y   | 年，2 位                                       |

### 实例操作

使用`Date_format`格式化**日期与时间**显示

```sql
select cname,DATE_FORMAT(birthday,'%Y年%m月%d %H时%i分%s秒') as birthday from class;
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/mysql/datetime/dateformat.png)

使用`time_format`格式化输出**时间**

```sql
select cname,TIME_FORMAT(birthday,'%h:%i:%s') as birthday from class;
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/mysql/datetime/timeformat.png)

## 时间戳

以时间戳格式来记录日期与时间。

**设置TIMESTAMP字段**

```sql
ALTER TABLE class ADD updated_at
TIMESTAMP default CURRENT_TIMESTAMP;

INSERT INTO class SET cname = 'Jerry',updated_at = '2020-2-12 10:33:12';
```

**添加数据时自动更新时间**  `ON UPDATE CURRENT_TIMESTAMP`

```sql
ALTER TABLE class ADD updated_at 
TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
ON UPDATE CURRENT_TIMESTAMP;
```

当执行添加与更新时字段将自动为当前时间

```sql
insert into class set cname = '小张';
update class set cname = 'hello' where id= 2;
```

> 执行更新或添加都会改变timestamp字段

## 常用函数

下面是获取当前日期、时间的示例

```sql
select CURRENT_DATE,CURRENT_TIME,NOW();
```

获取时间部分值

```sql
select YEAR(updated_at),MONTH(updated_at),DAY(updated_at) from stu;
```

其他可以使用的函数如下

| 函数           | 说明                                                   |
| -------------- | ------------------------------------------------------ |
| HOUR           | 时（范围从0到23）                                      |
| MINUTE         | 分（范围从0到59）                                      |
| SECOND         | 秒（范围从0到59）                                      |
| YEAR           | 年（范围从1000 到 9999）                               |
| MONTH          | 月（范围从1到12）                                      |
| DAY            | 日（范围从1开始）                                      |
| TIME           | 获取时间                                               |
| WEEK           | 一年中的第几周，从1开始计数                            |
| QUARTER        | 一年中的季度，从1开始计数                              |
| CURRENT_DATE   | 当前日期                                               |
| CURRENT_TIME   | 当前时间                                               |
| NOW            | 当前时间                                               |
| DAYOFYEAR      | 一年中的第几天（从1开始）                              |
| DAYOFMONTH     | 月份中天数（从1开始）                                  |
| DAYOFWEEK      | 星期天（1）到星期六（7）                               |
| WEEKDAY        | 星期一（0）到星期天（6）                               |
| TO_DAYS        | 从元年到现在的天数（忽略时间部分）                     |
| FROM_DAYS      | 根据天数得到日期（忽略时间部分）                       |
| TIME_TO_SEC    | 时间转为秒数（忽略日期部分）                           |
| SEC_TO_TIME    | 根据秒数转为时间（忽略日期部分）                       |
| UNIX_TIMESTAMP | 根据日期返回秒数（包括日期与时间）                     |
| FROM_UNIXTIME  | 根据秒数返回日期与时间（包括日期与时间）               |
| DATEDIFF       | 两个日期相差的天数（忽略时间部分，前面日期减后面日期） |
| TIMEDIFF       | 计算两个时间的间隔（忽略日期部分）                     |
| TIMESTAMPDIFF  | 根据指定单位计算两个日期时间的间隔（包括日期与时间）   |
| LAST_DAY       | 该月的最后一天                                         |

### 拆分日期时间

```sql
select sname,
YEAR(birthday),MONTH(birthday),DAY(birthday),HOUR(birthday),
MINUTE(birthday),SECOND(birthday) from stu;
```

### 当前日期时间

```sql
SELECT now(),CURDATE(),CURRENT_DATE(),CURRENT_TIME(),NOW();
```

### 时间计算

```sql
SELECT DAYOFYEAR(now()),DAYOFMONTH(now()),DAYOFWEEK(now()),WEEKDAY(now());
```

### 秒转换

不包含日期的秒转换

```sql
SET @time = time(now());
SELECT now(),TIME_TO_SEC(@time),SEC_TO_TIME(TIME_TO_SEC(@time));
```

日期时间与秒转换

```sql
SELECT now(),UNIX_TIMESTAMP(birthday),FROM_UNIXTIME(UNIX_TIMESTAMP(birthday)) FROM stu;
```

### 天转换

```sql
SELECT now(),TO_DAYS(birthday),FROM_DAYS(TO_DAYS(birthday)) FROM stu;
```

### 差值计算

计算天数差值，忽略时间部分

```sql
SELECT now(),DATEDIFF(now(),birthday) from stu;
```

计算时间差值，忽略天数

```sql
SELECT now(),TIMEDIFF(time(birthday),time(now())) from stu;
```

### 指定单位差值

支持的单位有 YEAR/MONTH/WEEK/DAY/HOUR/MINUTE/SECOND等。下面是获取学生来到人生经历的天数。

```sql
select sname,TIMESTAMPDIFF(day,birthday,NOW()) from stu;
```

## 基本查询

MYSQL内部将日期按数值进行处理，下面是查找'1990-02-22 09:00:00' 日期可以写成数值形式

```sql
SELECT * FROM users WHERE birthday  = 19900222090000
```

查找在 1990~1999年出生的同学

```sql
SELECT * FROM stu WHERE birthday BETWEEN '1990-01-01' AND '1999-12-31';
```

获取年龄最大的同学

```sql
SELECT * FROM stu ORDER BY birthday ASC LIMIT 1;
# 更准确的查询
SELECT * FROM stu 
WHERE birthday =(SELECT birthday FROM stu ORDER BY birthday ASC LIMIT 1);
```

查询在1班或2班1990年出生的同学

```sql
SELECT * FROM stu WHERE class_id IN(1,2) AND year(birthday)=1999;
```

90后最喜欢上的班级

```sql
SELECT count(id) as total,class_id from stu 
WHERE LEFT(birthday,4) >= 1990 AND YEAR(birthday)<=2000 
GROUP BY class_id
ORDER BY total DESC
LIMIT 1; 
```

大于20岁的女生最多的班级

```sql
SELECT count(id),class_id FROM stu 
WHERE TIMESTAMPDIFF(YEAR,birthday,now())>20 AND sex=2
GROUP BY class_id
ORDER BY count(id) DESC
LIMIT 1;
```

## 时间计算

| 函数      | 说明                                                         |
| --------- | ------------------------------------------------------------ |
| ADDTIME   | 添加时间（负数为减少），只对时间有效                         |
| TIMESTAMP | 添加时间（负数为减少），只对时间有效                         |
| DATE_ADD  | 根据单位添加时间，支持单位有YEAR/MONTH/DAY/HOUR/MINUTE/SECOND/HOUR_MINUTE/DAY_HOUR/DAY_MINUTE/DAY_SECOND/HOUR_MINUTE/HOUR_SECOND（负数时等于DATE_SUB) |
| DATE_SUB  | DATE_ADD的反函数                                             |
| LAST_DAY  | 指定月最后一天日期                                           |

七小时前的时间

```sql
select ADDTIME(now(),'-7:00:00')
```

七天后的日期

```sql
SELECT DATE_ADD(now(),INTERVAL 7 DAY);
```

20小时10分钟后的日期

```sql
SELECT DATE_ADD(NOW(),INTERVAL '20:10' HOUR_MINUTE);
```

2天8小时后的日期

```sql
SELECT DATE_ADD(NOW(),INTERVAL '2 8' DAY_HOUR);
```

获取本月最后一天日期

```sql
SELECT LAST_DAY(now());
```

获取本月的第一天日期

```sql
SELECT DATE_SUB(now(),INTERVAL DAYOFMONTH(now())-1 DAY);
```

获取本月发表的文章

```sql
SELECT * FROM article 
WHERE created_at >=DATE_SUB(now(),INTERVAL DAYOFMONTH(now()) DAY) 
AND created_at <=LAST_DAY(now());
```

> 因为使用大量函数会造成性能下降，所以推荐在后台程序中算出时间后再进行比对

获取三个月内发表的文章

```sql
SELECT * FROM article 
WHERE publish_time >=DATE_SUB(now(),INTERVAL -3 MONTH) ;

# 如果从前上个月的一号开始获取
SELECT * from article 
WHERE publish_time >= DATE_FORMAT(DATE_SUB(now(),INTERVAL 3 MONTH),'%Y-%m-01');
```

获取上个月的最后一天

```sql
SELECT LAST_DAY(DATE_SUB(NOW(),INTERVAL 1 MONTH));
# 或直接通过明确日期
SELECT * FROM article WHERE publish_time>='2019-01-01' AND publish_time<CURDATE();
```

下个月的第一天

```sql
SELECT DATE_ADD(LAST_DAY(NOW()),INTERVAL 1 DAY);
```

查看出生超过20年的同学

```sql
SELECT * FROM stu WHERE birthday < DATE_SUB(NOW(),INTERVAL 20 YEAR);
```

本周二的日期，使用DAYOFWEEK时周二为3

```sql
SELECT now(),DATE_ADD(NOW(),INTERVAL 3-DAYOFWEEK(NOW()) DAY);
```

本周星期日

```sql
SELECT date_add(now(),INTERVAL 6-WEEKDAY(now()) DAY) 

SELECT date_add(now(),INTERVAL 1-DAYOFWEEK(now())+7 day) 
```

上周的星期日

```sql
SELECT date_add(now(),INTERVAL 1-DAYOFWEEK(now()) day) 
```

查看三周前的周二

```sql
SELECT now(),
DATE_SUB(DATE_ADD(NOW(),INTERVAL 3-DAYOFWEEK(NOW()) DAY),INTERVAL 21 DAY);

# 或
SELECT date_add(now(),INTERVAL 3-DAYOFWEEK(now())-21 DAY )
```

上周一的日期

```sql
SET @week = DATE_SUB(NOW(),interval 1 week);
SELECT DATE_ADD(@week,INTERVAL 0-WEEKDAY(@week) day);

#或
SELECT date_add(now(),INTERVAL 2-DAYOFWEEK(now())-7 DAY )
```

获取本月迟到的同学

```sql
select * from attendance 
WHERE created_at >= date_sub(NOW(),INTERVAL DAYOFMONTH(now())-1 DAY)
AND time(created_at)>'08:30:00';
```

本月迟到超过2次的同学

```sql
select stu_id from attendance 
WHERE created_at >= date_sub(NOW(),INTERVAL DAYOFMONTH(now())-1 DAY)
AND time(created_at)>'08:30:00'
GROUP BY stu_id
HAVING count(id)>=2;
```

本周周一的日期

```sql
SELECT DATE_ADD(now(),INTERVAL 0-WEEKDAY(now()) day);
```

获取本周迟到的学生编号

```sql
set @begin =DATE_FORMAT(date_add(now(),INTERVAL 0-WEEKDAY(now()) day),'%Y-%m-%d');
select stu_id from attendance 
WHERE created_at >= @begin
AND time(created_at)>'08:00:00'
GROUP BY stu_id;
```

获取上周打卡记录

```sql
set @week = DATE_SUB(now(),INTERVAL 1 WEEK);
SELECT stu_id FROM attendance
WHERE created_at>=DATE_ADD(@week,interval 0-WEEKDAY(@week) day)
AND created_at<=DATE_ADD(@week,interval 4-WEEKDAY(@week) day);
```

获取本周发表的文章

```sql
SELECT * FROM article WHERE created_at >=DATE_ADD(now(),INTERVAL 0-WEEKDAY(now()) day);
```

周日来校学习的同学

```sql
SELECT * from attendance
WHERE date(created_at) = date(date_add(now(),INTERVAL 6 - WEEKDAY(now()) day));
```