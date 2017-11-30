// The increment checker checks for serializability over a single database item.

var assert = require('assert');
var {write, read} = require('../index');
var {ok, err} = require('../result');

let increment = item => {
  return function*() {
    let value = yield read(item, 0);
    yield write(item, value + 1);
  };
};

let readItem = item => {
  return function*() {
    return yield read(item, 0);
  };
};

module.exports = function incrementChecker(schedulerConstructor) {
  let s = new schedulerConstructor();
  for (let i = 0; i < 100; i++) {
    s.add(increment('a'));
  }
  s.run();
  let result = s.execute(readItem('a'));
  if (result !== 100) {
    return err(`result of 100 increments was ${result}`);
  }
  return ok(s.stats());
};
