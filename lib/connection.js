'use strict';

/**
 * Module dependencies.
 */

const util = require('util');
// const Operator = require('./operator');
const Operator = require('./operation');

module.exports = RDSConnection;

function RDSConnection(conn) {
  Operator.call(this);
  this.conn = conn;
};

util.inherits(RDSConnection, Operator);

const proto = RDSConnection.prototype;

proto.release = function() {
  return this.conn.close();
};

proto._query = function(sql, values={}, options={}) {
  return this.conn.execute(sql, values, options);
};

proto.commit = function() {
  return this.conn.commit();
};

proto.rollback = function() {
  return this.conn.rollback();
};
