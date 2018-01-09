'use strict';

/**
 * Module dependencies.
 */

const debug = require('debug')('rds:operator');

module.exports = Operator;

/**
 * Operator Interface
 */
function Operator() {}

const proto = Operator.prototype;

proto._query = function(sql, values, options) {
  throw new Error('SubClass must impl operator._query');
};

proto.query = async function(sql, values={}, options={}) {
  debug('query %j %j %j', sql, values || '', options || '');
  try {
    const result = await this._query(sql, values, options);
    const rows = result.rows;
    // debug('query get %d rows', rows.length);
    return rows || result;
  } catch (err) {
    err.stack = err.stack + '\n    sql: ' + sql;
    debug('query error: %s', err);
    throw err;
  };
};

proto.queryOne = async function(sql, values, options) {
  const rows = await this.query(sql, values, options);
  return rows && rows[0] || null;
};

proto.count = async function(table, where) {
  const sql = 'SELECT COUNT(*) as count FROM '+ table +' '+ this._where(where);
  debug('count(%j, %j) \n=> %j', table, where, sql);
  const rows = await this.query(sql);
  return rows[0].COUNT;
};

proto.select = async function(table, options) {
  options = options || {};
  const sql = this._limit(
    this._select(options.columns) ,
    'FROM ' + table + ((!options.columns) ? ' t ' : ' ') ,
    this._where(options.where) ,
    this._orders(options.orders) ,
    options.limit, options.offset
  );
  debug('select(%j, %j) \n=> %j', table, options, sql);
  return await this.query(sql);
};

proto.get = async function(table, where, options) {
  options = options || {};
  options.where = where;
  options.limit = 1;
  options.offset = 0;
  const rows = await this.select(table, options);
  return rows && rows[0] || null;
};

proto.insert = async function(table, row, options) {
  // only can insert object, not array!
  options = options || {};
  if (!options.columns) {
    options.columns = Object.keys(row);
  }
  const strs = [];
  for (let i = 0; i < options.columns.length; i++) {
    strs.push("'" + row[options.columns[i]].toString() + "'");
  }

  const sql = 'INSERT INTO '+table+' ('+options.columns.concat()+') VALUES (' + strs.join(', ') + ')';
  debug('insert(%j, %j, %j) \n=> %j', table, row, options, sql);
  return await this.query(sql);  
};

proto.update = async function(table, row, options) {
  options = options || {};
  if (!options.columns) {
    options.columns = Object.keys(row);
  }
  if (!options.where) {
    if (!('id' in row)) {
      throw new Error('Can not auto detect update condition, please set options.where, or make sure obj.id exists');
    }
    options.where = {
      id: row.id,
    };
  }

  const sets = [];
  for (let i = 0; i < options.columns.length; i++) {
    const column = options.columns[i];
    if (column in options.where) {
      continue;
    }
    sets.push(column + "='" + row[column].toString() + "'");
  }

  const sql = 'UPDATE ' + table + ' SET ' +
    sets.join(', ') +
    this._where(options.where);
  debug('update(%j, %j, %j) \n=> %j', table, row, options, sql);
  return await this.query(sql);
};

proto.delete = async function(table, where) {
  const _whe = this._where(where);
  if (!_whe) {
    throw new Error('Its very dangerous!!! Canot delete without where condition, please set options.where. ');
  }
  const sql = 'DELETE FROM '+ table +' '+ this._where(where);
  debug('delete(%j, %j) \n=> %j', table, where, sql);
  return await this.query(sql);
};

proto._where = function(where) {
  if (!where) {
    return '';
  } else {
    const whe = [];
    for (const key in where) {
      const val = where[key];
      if (Array.isArray(val)) {
        if ((val.length === 2)) {
          whe.push(key + " BETWEEN '" + val[0] +"' AND '" + val[1] + "' ");
        } else {
          whe.push(key + " in (" + val.join(',') + ") ");
        }
      } else {
        whe.push(key + " = '" + val + "' ");
      }
    }
    return 'WHERE ' + whe.join(' AND ')
  }
};

proto._select = function(columns) {
  let sql;
  if (!columns) {
    sql = 'SELECT t.* ' ;
  } else {
    if (typeof columns === "object") {
      if (Array.isArray(columns)) { // array
        sql = 'SELECT '+ columns.join(',') +' ' ;
      } else {  // object
        sql = 'SELECT '+ Object.keys(columns).join(',') +' ' ;        
      }
    } else {  // as string
      sql = 'SELECT '+ columns.toString() +' ' ;
    }
  }
  return sql;
};

proto._orders = function(orders) {
  if (!orders) {
    return " ORDER BY ' ' ";
  } else {
    let sql;
    if (typeof orders === "object") {
      if (Array.isArray(orders)) { // array
        // orders format: ['name desc', 'name', 'name asc']
        sql = orders.join(',') ;
      } else {  // object
        // orders format: {name: 'desc', name: '', name: 'asc' }
        for (const key in orders) {
          const val = orders[key];
          if (typeof val === 'function') {
            continue;
          }
          sql += key +' '+ val;
        }
      }
    } else {  // as string
      sql = orders.toString();
    }
    return ' ORDER BY ' + sql.toUpperCase();
  }
};

proto._limit = function(select, from, where, order, limit, offset) {
  if (!limit || typeof limit !== 'number') {
    return select + from + where + order;
  } else {
    if (typeof offset !== 'number') {
      offset = 0;
    }
    limit = limit + offset;
    const sql = 'SELECT * FROM ('  
      + select + ',ROW_NUMBER() OVER('+ order +') AS NUM '+ from + ') tt ' 
      + 'WHERE NUM BETWEEN ' + offset + ' AND ' + limit; 
    return sql;
  }
};
