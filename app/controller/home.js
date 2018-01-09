'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }

  async insert() {
    let row = {
      test01: 'test2',
      test02: 'test2',
      test03: 'test2',
      test04: 'test2',
    }
    const result = await this.app.oracle.insert('test', row);
    this.ctx.body = result;
  }

  async update() {
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
    this.ctx.body = result;
  }

  async delete() {
    const result = await this.app.oracle.delete('test', {
      test01: 'test2'
    });
    this.ctx.body = result;
  }

  async query() {
    const result = await this.app.oracle.query('select test01,test02 from test where test01=:test01', ['3']);
    this.ctx.body = result;
  }

  async busness() {
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
    this.ctx.body = result;
  }

  async transaction() {
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
    this.ctx.body = result;
  }

  async select() {
    const tests = await this.app.oracle.select('test');
    this.ctx.body = tests;
  }

  async count() {
    const tests = await this.app.oracle.count('test');
    this.ctx.body = tests;
  }

  async get() {
    const tests = await this.app.oracle.get('test');
    this.ctx.body = tests;
  }

  async select2() {
    const tests = await this.app.oracle.select('test', {
      where: {
        test01: ['3','4']
      },
      columns: ['test01', 'test02']
    });
    this.ctx.body = tests;
  }

}

module.exports = HomeController;
