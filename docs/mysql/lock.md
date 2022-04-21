# 锁机制

🔖 因为MySQL支持多线程方式，所以可以同时处理多个客户端请求。有时为了防止客户端同时修改数据，我们使用**锁操作**完成。

> 比如一个用户在修改数据，另一个用户也要修改该条数据，我们可以让第一个用户独占这个表记录，等他操作完再让第二个用户操作。

`SET autocommit = 0` : 全局开启事务，必须commit才能提交。

## 储存引擎

`InnoDB` 是主流储存引擎并支持行级锁的，有更高的并发处理性能，下面来演示**行锁**的运行过程。`MyIsam`引擎在最新版本的MYSQL中已经废弃所以不过多讨论了。

## 事务处理

### 行锁

::: tips 行锁

- 表锁开销大，锁表慢
- 行锁高并发下可并行处理，性能更高
- 行锁是针对『 索引』加的锁，在通过索引检索时才会应用行锁，否则使用表锁
- 👷 在事务执行过程中，随时都可以执行锁定，锁在执行 COMMIT或者ROLLBACK的时候释放

::: 

1. A事务执行以下代码但不提交

   ```sql
   BEGIN;
   UPDATE stu SET sname = 'hello' WHERE id=1;
   ```

2. B事务执行以下代码，可以正常执行

   ```sql
   BEGIN;
   update stu set sname = 'Michael' where id=3
   COMMIT;
   ```

3. 但B事务更新与A事务**相同的记录**则无法操作，执行过程发生阻塞

   ```sql
   BEGIN;
   UPDATE stu SET sname = 'world' WHERE id=1;
   ...
   ```

4. 当A执行执行`COMMIT` 提交后，解锁记录行这时B事务继续执行

   ```sql
   ...
   COMMIT;
   ...
   # 最终id为1的sname被更新为world
   ```

### 非索引阻塞

🚨 使用**非索引字段**筛选时，将造成全表锁定即表级锁，应该避免这种情况发生，提升数据库的并发性能。

1. 事务A执行以下代码，因为`sname`字段没有添加索引，造成锁定整个表

   ```sql
   BEGIN;
   UPDATE stu SET sname = 'hello' WHERE sname ='李华';
   ```

2. 现在事务B更新**任何一条**记录都会造成阻塞，因为现在是**表锁**状态

   ```sql
   BEGIN;
   update stu set sname = '小明' where id=1;
   -- 阻塞中...
   ```

3. 将 `sname`字段添加索引后，行锁功能就又有效了

### 范围锁

🚨 查询没有指定明确范围时也会造成大量记录的锁定

1. 事务A筛选时使用了范围区间，将会造成表锁

   ```sql
   BEGIN;
   UPDATE goods SET num=200 WHERE id>1 AND id<3; 
   ```

2. 事务B将不能修改表中的ID大于2的记录

   ```sql
   BEGIN;
   update goods set num =1 where id=2;
   -- 阻塞中...
   ```

   但可以更改ID为1的记录

   ```sql
   update goods set num =1 where id=1;
   ```

3. 执行添加时因为不在id为 1~3的范围内所以可以添加，但如果添加时指定ID为2将会阻塞。

   ```sql
   # 新插入的数据id不在范围内，会正常执行
   insert into goods (name,num) values('西瓜',200);
   
   # 如果此时没有id为4的数据，想要进行插入，也是不行的
   insert into goods (name,num, id) values('西瓜',200, 2);
   ```

> 🔐 例如范围是id>5，那么后续的id大于5的数据的修改或者插入都是会阻塞的
>
> 🔥 目标是锁的范围或者说粒度，越小越好，这样用户的吞吐量才能更大

## 悲观锁

🔖 悲观锁指对数据被外界修改持**保守态度**，在整个数据处理过程中，将数据处于锁定状态，可以很好地解决并发事务的更新丢失问题。

下面演示商城下单情况，要用户购买商品后我们要减少库存，如果在高并发情况下多个用户同时修改库存表，会造成库存数据异常，使用悲观锁可以解决这个问题。

1. 事务A执行悲观锁操作后，其他事务执行同一代码时将阻塞 `FOR UPDATE`

   ```sql
   BEGIN;
   SELECT * FROM goods WHERE id=1 FOR UPDATE;
   UPDATE goods SET num=num-2 WHERE id=1; 
   ...
   ```

2. 事务B执行以下代码将不能查询库存，必须等事务A提交或回滚事务

   ```sql
   BEGIN;
   ## B事务中查询中也要使用 FOR UPDATE 悲观锁
   SELECT * FROM goods WHERE id=1 FOR UPDATE;
   -- 阻塞中...
   ```

3. 事务A提交后，事务B会得到事务A操作后的结果

   ```sql
   ...
   COMMIT;
   ...
   ```

## 乐观锁

🔖 在每次去拿数据的时候认为别人不会修改，不对数据上锁，但是在提交更新的时候会判断在此期间数据是否被更改，如果被更改则提交失败。

下面使用版本字段来实现乐观锁操作，并实现更改商品库存的案例。

1. 事务A查询商品库存，获取了商品记录，记录中有VERSION字段用于记录版本号（目前为0）

   ```sql
   BEGIN;
   SELECT * FROM goods WHERE id = 1;
   ```

2. 事务B同时查询，也获取了版本号为0的记录

   ```sql
   BEGIN;
   SELECT * FROM goods WHERE id = 1;
   ```

3. 事务A更改库存，并增加版本号

   ```sql
   UPDATE goods SET num=num-10,VERSION =VERSION+1 WHERE VERSION=0;
   ```

4. 事务B更改数据，但使用的是事务B查询到的0号版本，因为事务A已经提交版本号为1，造成事务B修改失败，保证了数据的完整性。(通过版本号约束修改的条件)

   ```sql
   UPDATE goods SET num=num-10,VERSION =VERSION+1 WHERE VERSION=0;
   ```

> 乐观锁是在后期，如果数据真的发生错乱的时候，再进行处理

## 表锁机制

🚑️ 针对一些**不支持事务**的处理引擎可以使用**锁表**的方式控制业务。

### 读锁READ

为表设置读锁后，当前会话和其他会话都不可以修改数据，但**可以读取**表数据。

1. 会话A对表goods设置了读锁，将不能修改该表，也不能操作其他表

   ```sql
   LOCK TABLE goods READ;
   # 可以读表
   SELECT * FROM goods;
   
   # 数据修改失败，不能更新read lock的表
   UPDATE goods SET num=300 WHERE id=1;
   SELECT * FROM stu;
   ```

2. 因为会话A对表`goods`设置了读锁，所以会话B也不能修改

   ```sql
   # 可以读表
   SELECT * FROM goods;
   
   update goods set num=200 where id=1;
   -- 阻塞...
   ```

3. 会话A解锁表后，其他会话又可以继续操作表了

   ```sql
   UNLOCK TABLES;
   ```

### 写锁WRITE

为表设置了写锁后，当前会话可以修改，查询表，其他会话将无法操作。

1. 会话A对表goods和stu设置写锁，本会话可以正常操作表， 并不能操作其他表

   ```sql
   # 可以一次性锁定多个表
   LOCK TABLE goods WRITE，stu WRITE;
   INSERT INTO goods (name,num )VALUES('李华教程',300);
   ```

2. 会话B读取/写入表数据都将阻塞

   ```sql
   select * from goods;
   -- 阻塞...
   ```

3. 会话A解锁表数据后，其他会话都可以正常操作了

   ```sql
   UNLOCK TABLES;
   ```