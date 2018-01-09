# demo-egg-oracle

demo for eggjs use oracle client

## 接口实现

### Create RDS instance

```js
const db = rds({
  user: 'USER',
  password: 'PASSWORD',
  connectString: '127.0.0.1:1521/tns',
  // 其他参数
});
// need open pool.
await client.createPool();
```

### Insert

- insert 只能是对象（一条记录），不能是数组（多条记录）。

```js
let row = {
  test01: 'test2',
  test02: 'test2',
  test03: 'test2',
  test04: 'test2',
}
const result = await this.app.oracle.insert('test', row);
// result is affectedRows :
// 1
```

### Update

- update 条件有： `options.where` 、`options.columns`
- `options.where` 为空时，默认 where 条件为： `id`
- `options.columns` 不为空时，只更新 columns 所列且不包含在 where 内的栏位 

```js
let row = {
  test01: 'test3',
  test02: 'test3',
  test03: 'test3',
}
const result = await this.app.oracle.update('test', row, {
  where: {
    test01: 'test2'
  }
});
// result is affectedRows :
// 1
```

### Get

- get 获取第一条记录

```js
const tests = await this.app.oracle.get('test');
// SELECT * FROM (SELECT t.* ,ROW_NUMBER() OVER( ORDER BY ' ' ) AS NUM FROM test t ) tt WHERE NUM BETWEEN 0 AND 1
// result is rows 
```

### Select

- select 获取符合条件的所有记录
- 条件有：`options.where` 、`options.order` 、`options.limit` ……

```js
const tests = await this.app.oracle.select('test');
// result is rows 
const tests = await this.app.oracle.select('test', {
  where: {
    test01: ['3','4']
  },
  columns: ['test01', 'test02']
});
// SELECT test01,test02 FROM test WHERE test01 BETWEEN '3' AND '4'  ORDER BY ' '
```

### Delete

- delete 删除符合条件的记录

```js
const result = await this.app.oracle.delete('test', {
  test01: 'test2'
});
// result is affectedRows :
// 1
```

### Count

- count 获取符合条件的记录笔数

```js
const tests = await this.app.oracle.count('test');
// result is a number 
```

### Transactions

自动提交，报错回滚

```js
const result = await this.app.oracle.transaction(async function(conn) {
  const test1 = await conn.insert('test', {
    test01: 'test4',
    test02: 'test4',
    test03: 'test4',
    test04: 'test4',
  })
  const test2 = await conn.query('select test01,test02 from test where test01=:test01', ['3']);
  const count = await conn.count('test');
  // dont need commit, its autoCommit, when error throw will autoRollback!
  // after run, you can open http://127.0.0.1:7001/count to valid!
  // await conn.commit();
  return {
    test1, count, test2
  };
});
```

### Busness

和 transaction 的区别在于：需要手动提交！！

```js
const result = await this.app.oracle.busness(async function(conn) {
  const test1 = await conn.insert('test', {
    test01: 'test4',
    test02: 'test4',
    test03: 'test4',
    test04: 'test4',
  })
  const test2 = await conn.query('select test01,test02 from test where test01=:test01', ['3']);
  const count = await conn.count('test');
  // commit is very important !!!
  // if dont commit() : after run, you can open http://127.0.0.1:7001/count to valid! (default is rollback)
  await conn.commit(); 
  return {
    test1, count, test2
  };
});
```

### Raw Queries

```js
const result = await this.app.oracle.query('select test01,test02 from test where test01=:test01', ['3']);
```

## 参考

接口定义照抄: [ali-rds][rds] 和 [egg-mysql][mysql] （小有修改）

网站模板: [egg-boilerplate-simple][tmpl]

## [模板][tmpl]

```bash
# 建站
$ npm i -g egg-init
$ egg-init --type simple egg-oracle
$ cd egg-oracle
$ npm i
$ npm run dev
$ open http://localhost:7001

# 本地开发
$ npm i
$ npm run dev 
$ DEBUG=rds.* npm run dev 
$ open http://localhost:7001/
# 结束本地开发： 直接关闭命令行窗口!!! (Ctrl + C 结束命令并没有关闭 ORACLE POOL !!!)

# 部署
$ npm start
$ npm stop
# 代码风格检查
$ npm run lint
# 单元测试
$ npm test
# 自动检测依赖更新
$ npm run autod
```

## ORACLE 事务管理

- [node-oracle][oracle] 通过 `commit()`, `rollback()` 来控制事务;
- 如果 `autoCommit` 设置为 true, `commit` 发生在每次 `execute()` 结束时。 为了最大化性能的考虑， 可以在事务中的最后一次 `execute()` 时设置 `autoCommit`。
- 当 `connection` 释放的时候， 进行中的事务都将被回滚。因此，一个通过 `pool` 管理获得新连接都将在一个新的事务下进行。

[rds]: https://github.com/ali-sdk/ali-rds
[mysql]: https://github.com/eggjs/egg-mysql
[tmpl]: https://github.com/eggjs/egg-boilerplate-simple
[oracle]: https://github.com/oracle/node-oracledb