'use strict';

const debug = require('debug')('rds:oracleClient');
const util = require('util');
const oracledb = require('oracledb');
const Operator = require('./operation');
// const Operator = require('./operator');
const RDSConnection = require('./connection');

module.exports = RDSClient;

oracledb.outFormat = oracledb.OBJECT;

function RDSClient(options) {
  if (!(this instanceof RDSClient)) {
    return new RDSClient(options);
  }
  Operator.call(this);
  this.options = options;
}

util.inherits(RDSClient, Operator);

const proto = RDSClient.prototype;

proto.createPool = async function() {
  if (!this.pool) {
    try {
      this.pool = await oracledb.createPool(this.options);
      debug('pool Created.')
    } catch (err) {
      if (err.name === 'Error') {
        err.name = 'RDSClientCreatePoolError';
      }
      throw err;
    }
  } else {
    debug('pool founded. ')
  }
}

proto.getConnection = async function() {
  try {
    const conn = await this.pool.getConnection();
    debug('connect created. ')
    return new RDSConnection(conn);
    // return conn;
  } catch (err) {
    if (err.name === 'Error') {
      err.name = 'RDSClientGetConnectionError';
    }
    throw err;
  }
};

proto._query = async function(sql, values, options) {
  const conn = await this.getConnection();
  let result;
  try {
    result = await conn._query(sql, values, options);
    await conn.commit();
  } catch (err) {
    throw err;
  } finally {
    await conn.release();
  }
  return result;
};

proto.busness = async function(scope) {
  const conn = await this.getConnection();
  let result;
  try {
    result = await scope(conn);
  } catch (err) {
    throw err;
  } finally {
    await conn.release();
  }
  return result;
};

proto.transaction = async function(scope) {
  const conn = await this.getConnection();
  let result;
  try {
    result = await scope(conn);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.release();
  }
  return result;
};

proto.end = async function() {
  return await this.pool.end();
};

