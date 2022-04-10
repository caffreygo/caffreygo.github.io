# 数据类型

## 字符串

### 数据类型

下面是mysql支持的字符串类型

| 类型       | 大小                | 用途                            |
| :--------- | :------------------ | :------------------------------ |
| CHAR       | 0-255字节           | 定长字符串                      |
| VARCHAR    | 0-65535 字节        | 变长字符串                      |
| TINYBLOB   | 0-255字节           | 不超过 255 个字符的二进制字符串 |
| TINYTEXT   | 0-255字节           | 短文本字符串                    |
| BLOB       | 0-65 535字节        | 二进制形式的长文本数据          |
| TEXT       | 0-65 535字节        | 长文本数据                      |
| MEDIUMBLOB | 0-16 777 215字节    | 二进制形式的中等长度文本数据    |
| MEDIUMTEXT | 0-16 777 215字节    | 中等长度文本数据                |
| LONGBLOB   | 0-4 294 967 295字节 | 二进制形式的极大文本数据        |
| LONGTEXT   | 0-4 294 967 295字节 | 极大文本数据                    |

char类型是定长类型，比如定义了20长度的`char`类型，只存一个字符也占用20个长度，char好处是处理速度快，缺点是空间占用大，把手机号、邮箱、密码等长度相对固定的设置为char类型是不错的选择。

varchar类型与char相反，使用空间受内容影响，可以把文章标题、介绍等设置为 varchar类型更合适。

>字符串分**二进制**与**非二进制**类型，二进制用于储存图片、声音等文件，非二进制用于储存文本数据。
>
>非二进制文本受字符集和校对规则影响。

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/mysql/dataType/field.png)

### 字符集

字符集(Character set)是多个字符的集合，字符集种类较多，每个字符集包含的字符个数不同。常用的字符集有GBK、BIG5、UTF8。

UTF8字符包含文字内容更广，如韩文、日文、德文兼容度更高，也是推荐使用的字符集。

**下面是查看服务器支持的字符集**

```sql
SHOW CHARACTER SET;
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/mysql/dataType/charset.png)

表不设置字符集继承数据库，字段不设置字符集继承表的

### 校对规则

是在字符集内用于字符比较和排序的一套规则，以`_ci`结束的为大小写不敏感、`_bin`结束的为不区分大小写。

> 校对规则就是针对字符串类型排序或者比较的一套规则算法 📌

**下面是查看系统支持的校对规则**

```sql
show COLLATION;
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/mysql/dataType/collation.png)

当使用不区分大小写的校对规则时A与a是相同的，否则则不相同，这会影响到排序与比对。

如果使用`utf8_bin` 校对规则时，下面的查询将匹配不到大写的`PHP`

```sql
select * from class WHERE cname = 'php';
```

> 修改表校对规则，对表的原字段将不影响，只对新增字段影响。

### 常用函数

**大小写转换** `UPPER()  LOWER()`

```sql
SELECT UPPER(cname) as cname,LOWER(description) as `desc` from class;
```

**Left&right** `LEFT()  RIGHT()`

left与right函数用于取左或右指定数量的字符，下面是取班级介绍前8个字符并用`…` 连接。

```sql
SELECT CONCAT(LEFT(description,8),'...') FROM class;
```

**mid** `MID()`

从中间取字符串，参数二为起始，参数三为取的字符数量。下面是获取从第二个字符取两个字符值为`hp`的。

```sql
select *  from class where mid(cname,2,2) = 'hp';
```

**substring**  `SUBSTRING()`

从指定位置开始向右取所有字符串，下面是获取从第二个位置开始的字符值为`hp`的记录。

```sql
select * from class where SUBSTRING(cname,2) = 'hp';
```

**char_length**

获取字符串长度

```sql
SELECT CHAR_LENGTH(cname) from class;
```

**concat**

连接字符串使用

```sql
SELECT concat('编号:',id) as id,concat('班级:',cname) as name FROM class; 
```

将所有班级前加上`你们好`

```sql
UPDATE class SET cname = CONCAT('你们好:',cname);
```

截取班级介绍，超过8个字符的后面连接`…`

```sql
IF(confition, then, else)
```

```sql
SELECT if(CHAR_LENGTH(cname)>8,CONCAT(LEFT(cname,8),'...'),cname) as name FROM class;
```

cdn网址更新

```sql
UPDATE class set cname = CONCAT('https://cdn.com', mid(cname, 10)) where id >= 10;
```

### 正则表达式

Mysql支持正则表达式操作 `REGEXP`，可用于处理复杂的匹配操作。

**查找第二个字符为`h`的字符串**

```sql
SELECT * FROM class WHERE cname REGEXP '^.h';
```

查找班级名称中包含`php` 或 `mysql`的记录

```sql
SELECT * FROM class WHERE cname REGEXP 'php|mysql';
```

所有介绍中包含php与mysql的课程名前加上`你们好`

```sql
update class set cname = REPLACE(cname,cname,concat('你们好：',cname)) 
where description REGEXP  'php|mysql'; 
```

### LIKE

在 `LIKE` 表达式中 `%` 用于匹配任意多个字符，`_` 用于匹配一个字符。

查找第二个字符为 `h` 的班级。

```sql
SELECT *  FROM class WHERE cname LIKE '_h%';
```

## 数值类型

**整型**

| MySQL数据类型 | 范围（有符号）                       | 范围（无符号）                  |
| ------------- | ------------------------------------ | ------------------------------- |
| tinyint(m)    | 1个字节 范围(-128~127)               | (0，255)                        |
| smallint(m)   | 2个字节 范围(-32768~32767)           | (0，65 535)                     |
| mediumint(m)  | 3个字节 范围(-8388608~8388607)       | (0，16 777 215)                 |
| int(m)        | 4个字节 范围(-2147483648~2147483647) | (0，4 294 967 295)              |
| bigint(m)     | 8个字节 范围(+-9.22*10的18次方)      | (0，18 446 744 073 709 551 615) |

- 取值范围如果加了unsigned，则最大值翻倍，如tinyint unsigned的取值范围为(0~256)。
- m的含义不是允许字段的长度，而是显示长度，在为字段设置 `zerofill` 时有效。

**添加有前导零的字段**

```sql
ALTER TABLE class ADD stu_count smallint(6) ZEROFILL default null;
```

**在命令行查看（有些GUI软件不显示前导零)，结果如下：**

```sql
+----+-------+--------------------------------------------+-----------+
| id | cname | description                                | stu_count |
+----+-------+--------------------------------------------+-----------+
|  4 | Mysql | 数据库                                     |    000001 |
|  5 | PHP   | 后盾人教你使用PHP快速开发网站              |      NULL |
+----+-------+--------------------------------------------+-----------+
```

**浮点型**

| 类型    | 大小                               | 范围（有符号）                                               | 范围（无符号）                                               |
| :------ | :--------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| FLOAT   | 4 字节                             | (-3.402 823 466 E+38，-1.175 494 351 E-38)，0，(1.175 494 351 E-38，3.402 823 466 351 E+38) | 0，(1.175 494 351 E-38，3.402 823 466 E+38)                  |
| DOUBLE  | 8 字节                             | (-1.797 693 134 862 315 7 E+308，-2.225 073 858 507 201 4 E-308)，0，(2.225 073 858 507 201 4 E-308，1.797 693 134 862 315 7 E+308) | 0，(2.225 073 858 507 201 4 E-308，1.797 693 134 862 315 7 E+308) |
| DECIMAL | DECIMAL(M,D) ，m<65 是总个数，d<30 | 依赖于M和D的值                                               | 依赖于M和D的值                                               |

下面是检测浮点数精度的示例

```sql
alter table class add e FLOAT(10,2);
update class set e = 12345678.66 where id=11;
```

::: tip 查看结果时会发布浮点数结果不精确

- float：2^23 = 8388608，一共七位，这意味着最多能有7位有效数字，但绝对能保证的为6位，即float的精度为6~7位有效数字
- double：2^52 = 4503599627370496，一共16位，double的精度为15~16位
- 浮点型在数据库中存放的是近似值，而定点类型在数据库中存放的是精确值
- decimal(m,d) 参数m<65 是总个数，d<30且 d<m 是小数位
- 对货币等对精度敏感的数据，应该用定点数decimal存储

::: 

## ENUM/SET

### ENUM

 📗 ENUM 类型因为只允许在集合中取得一个值，有点类似于单选项。在处理相互排拆的数据时容易让人理解，比如人类的性别。换个枚举最大可以有 65535 个成员值

```sql
ALTER TABLE stu ADD sex ENUM('男','女') DEFAULT NULL;
```

可以使用索引或值添加enum数据

```sql
INSERT INTO stu (sname,class_id,sex) VALUES('李岗',1,'男');
INSERT INTO stu (sname,class_id,sex) VALUES('李玉',1,2);
```

可以使用值与索引检索ENUM

```sql
SELECT * from stu WHERE sex='女';
SELECT * from stu WHERE sex=2;
```

### SET

 📗 SET 类型与 ENUM 类型相似但不相同。SET 类型可以从预定义的集合中取得任意数量的值。一个 SET 类型最多可以包含 64 项元素。

使用SET类型添加文章属性字段

```sql
ALTER TABLE article ADD flag SET('推荐','置顶','图文','热门');
```

添加数据

```sql
INSERT INTO article (title,status,flag)VALUES('后盾人',1,'图文,推荐,置顶');
```

使用 `find_in_set` 查找数据

```sql
SELECT * FROM article WHERE find_in_set('图文',flag);
```

使用`like` 查找数据

```sql
SELECT * FROM article WHERE flag like '%置顶%'
```

#### 二进制比较

可以使用二进制方式对SET类型进行模糊筛选。

| SET成员 | 十进制值 | 二进制值 |
| ------- | -------- | -------- |
| 推荐    | 1        | 0001     |
| 置顶    | 2        | 0010     |
| 图文    | 4        | 0100     |
| 热门    | 8        | 1000     |

获取包含图文与推荐的文章

```sql
SELECT * FROM article WHERE flag & 5;
```