const mongoose = require('mongoose');
const keys = require('../config/keys');
const exec = mongoose.Query.prototype.exec;
const redis = require('redis');
const client = redis.createClient(keys.redisUrl);
const util = require('util');
client.hget = util.promisify(client.hget);

mongoose.Query.prototype.cache =  function (options = {}) {
  this.hashKey = JSON.stringify(options.key || '');
  this.useCache = true;
  return this;
}

mongoose.Query.prototype.exec = async function () {
  if(!this.useCache){
    return exec.apply(this, arguments);
  }
  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection:
    this.mongooseCollection.name
  }));

  const cacheValue = await client.hget(this.hashKey, key);
  console.log('cacheValue', cacheValue);

  if (cacheValue) {
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc) ?
      doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  const queryResult = await exec.apply(this, arguments);
  console.log('queryResult', queryResult);
  client.hset(this.hashKey,key, JSON.stringify(queryResult),'EX', 10);
  return queryResult;
}

module.exports ={
  clearHash(key){
    client.del(JSON.stringify(key));
  }
}