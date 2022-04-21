# 事务处理

🔖 事务是保证**多个SQL**操作的一致性，如果一条失败全部SQL也将失效。

::: tip 业务分析

- 事务是保证多个SQL操作的一致性，如果一条失败全部SQL也将失效。
- 实际业务中大多数是对多个表操作，比如当发表文章时需要将文章的基本信息发到文章基础表和文章内容添加到文章内容表，这种情况不使用事务也没有关系，如果出现数据异常重新添加就可以了
- 但牵涉到货币的情况就必须使用事务了，必须保证货币处理是准确的
- 当然有些公司要求所有查询都使用事务，这就遵照公司要求完成就可以了

:::

## 储存引擎

查看引擎

```sql
SHOW ENGINES;
```

### InnoDB

支持事务的引擎建议使用 `InnoDB`。如果旧表是其他引擎，使用下面语句更改为`InnoDB`引擎。

```sql
ALTER TABLE stu ENGINE=InnoDB;
```

## 提交模式

### 自动提交

Mysql的提交默认是自动提交，即发送一条执行一条。

在 `DBeaver` 执行以下SQL后，在另一个 `Sequel Pro` 会立刻看到结果。

```sql
INSERT INTO stu (class_id,sname,sex)VALUES(2,'张帝','女');
```

在 `Sequel Ace` 里即可看到结果，这为自动提交。

### 事务提交

#### 事务单独开启

::: tip 事务的开启与结束

- START TRANSACTION / BEGIN 开启事务

- COMMIT 提交事务
- ROLLBACK 回滚事务

:::

```sql{1,3}
START TRANSACTION;
INSERT INTO stu (class_id,sname,sex)VALUES(2,'张帝','女');
COMMIT;
```

例如执行一下sql语句，只会插入一条数据：

```sql
# begin至rollback之间的内容被不会真正执行操作数据
begin;
insert into stu(sname, class_id, sex) VALUES('bad', 2, 2);
rollback;
# 正常sql执行
insert into stu(sname, class_id, sex) VALUES('good', 2, 2);
```

#### 全局开启事务

如果所有SQL都使用事务操作，我们可以通过 `SET AUTOCOMMIT=0` 关闭自动提交来开启事务机制，这样所有语句都是事务类型。

```sql
-- 关闭自动提交
SET AUTOCOMMIT = 0;

# sql的处理在未commit的情况下，不会真正操作到数据库
INSERT INTO stu (class_id,sname,sex)VALUES(2,'李清','女');
COMMIT;

-- 开启自动提交
SET AUTOCOMMIT = 1;
```

## 事务隔离

### 并发问题

::: tip 当高并发访问会遇到多个事务的隔离问题，可能会出现以下：

1. 脏读：事务A读取了事务B更新的数据，然后B回滚操作，那么A读取到的数据是脏数据。
2. 不可重复读：事务 A 多次读取同一数据，事务 B 在事务A多次读取的过程中，对数据作了更新并提交，导致事务A多次读取同一数据时，结果不一致。
3. 幻读：系统管理员A将数据库中所有学生的成绩从具体分数改为ABCDE等级，但是系统管理员B就在这个时候插入了一条具体分数的记录，当系统管理员A改结束后发现还有一条记录没有改过来，就好像发生了幻觉一样，这就叫幻读。

::: 

> 不可重复读的和幻读很容易混淆，不可重复读侧重于修改，幻读侧重于新增或删除。解决不可重复读的问题只需锁住满足条件的行，解决幻读需要锁表

### 隔离级别

| 事务隔离级别                 | 脏读 | 不可重复读 | 幻读 | 说明                                                         |
| ---------------------------- | ---- | ---------- | ---- | ------------------------------------------------------------ |
| 读未提交（read-uncommitted） | 是   | 是         | 是   | 最低的事务隔离级别，一个事务还没提交时，它做的变更就能被别的事务看到 |
| 不可重复读（read-committed） | 否   | 是         | 是   | 保证一个事务提交后才能被另外一个事务读取。另外一个事务不能读取该事务未提交的数据。 |
| 可重复读（repeatable-read）  | 否   | 否         | 是   | 多次读取同一范围的数据会返回第一次查询的快照，即使其他事务对该数据做了更新修改。事务在执行期间看到的数据前后必须是一致的。 |
| 串行化（serializable）       | 否   | 否         | 否   | 事务 100% 隔离，可避免脏读、不可重复读、幻读的发生。花费最高代价但最可靠的事务隔离级别。 |

### 查询级别

🚀 mysql8 版本查询隔离级别

```sql
select @@global.transaction_isolation,@@transaction_isolation;
```

mysql8 以下版本查询隔离级别

```sql
select @@tx_isolation;
```

![](https://raw.githubusercontent.com/caffreygo/static/main/blog/mysql/transaction/isolation.png)

### 设置级别

设置会话隔离级别，影响当前连接

```sql
set session transaction isolation level read uncommitted;
```

设置全局隔离级别，影响全局连接

```sql
set global transaction isolation level read uncommitted;
```

### 脏读

🔖 为了演示效果将隔离级别设置为最低级 `read uncommitted`。脏读是一个事务**没有提交**时可被其他事务读取到。

1. 事务A执行更新操作

   ```sql
   set session transaction isolation level read UNCOMMITTED;
   BEGIN;
   UPDATE stu SET sname = 'new' WHERE id=2;
   ```

2. 因为使用了最低级别`read uncommitted`，事务B在事务A没有提交时就可以看到更新的数据

   如果事务A执行`ROLLBACK` 事务B的读到的数据就为**脏数据**。

   ```sql
   SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
   BEGIN;
   SELECT * FROM stu;
   ```

   ![](https://raw.githubusercontent.com/caffreygo/static/main/blog/mysql/transaction/uncommitted.png)

3. 将隔离级别设置为**除了** `read uncommitted`以外的值，再重复上面的例子，都可以有效避免脏读的问题。

### 不可重复读

::: tip 不可重复读

📌 指在事务中多次读取的数据出现不一致的情况，我们希望读取的数据在本事务中是一致的

- 事务A在执行过程中更新数据，事务B同时读取的数据没有脏数据。
- 但当事务A提交了事务后，事务B再读取时得到了最新的数据，这种情况为不可重复读。
- 所以要保证事务过程中的数据重复操作是一致的，不受其他事务影响，即避免不可重复读的产生。

:::

为了演示效果将隔离级别设置为低级别 `read committed`。

1. 事务A执行以下代码，但没有提交

   ```sql
   set session transaction isolation level READ COMMITTED;
   BEGIN;
   UPDATE stu SET sname = 'new' WHERE id=2;
   ```

2. 因为使用了 `read committed`级别，所以事务B不会读到脏数据

   ```sql
   SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
   BEGIN;
   SELECT * FROM stu;
   ```

   ![](https://raw.githubusercontent.com/caffreygo/static/main/blog/mysql/transaction/committed.png)

3. 事务A提交事务

   ```sql
   ...
   commit
   ...
   ```

   ![](https://raw.githubusercontent.com/caffreygo/static/main/blog/mysql/transaction/uncommitted.png)

4. 此时事务B**可以读取**到事务A提交的数据，这就是不能重复读取到同一个数据，即事务B读取结果受事务A影响。

   > 不可重复读：事务内同样的查询得到了不同的值，在事务期间被其他处理修改了

5. 将隔离机制设置为 `REPEATABLE READ` 就可以解决这类不可重复读的问题。

   ```sql
   set session transaction isolation level REPEATABLE READ;
   begin;
   select * from stu;
   # 这个时机，如果另外一个事务修改了数据并且提交，也就是表数据已经被「真正改变」
   # 当前事务之外的操作修改了数据......
   # 再次获取的还是之前的数据，相当于读取了当前事务开始时存的一个「快照」
   select * from stu;
   commit;
   ```

### 幻读

🔖 幻读和不可重复读都是读取了另一条已经提交的事务（这点就脏读不同），所不同的是不可重复读查询的都是同一个数据项，而幻读针对的是一批数据整体。

1. 事务A执行查询，假如查询结果是6条

   ```sql
   set session transaction isolation level REPEATABLE READ;
   BEGIN;
   SELECT * FROM stu;
   ```

2. 事务B执行添加

   ```sql
   set session transaction isolation level REPEATABLE READ;
   insert into stu (class_id,sname,sex) values(2,'Michael',1);
   commit;
   ```

3. 事务A执行更新，发现更新了7条（刚才查询时6条，但更新了七条，感觉像出现了幻觉）

   ```sql
   ...
   UPDATE stu SET balance = 200;
   ...
   ```

4. 切换隔离级别为 **SERIALIZABLE** 后，在事务A没有提交时，事务B是不能插入数据的（表现形式为等待）。

   ```sql
   set session transaction isolation level SERIALIZABLE;
   
   select @@global.transaction_isolation,@@transaction_isolation;
   ```

🔥 `serializable`在事务未提交时会进行锁表，需要等待当前事务结束才能进行其它事务的处理。