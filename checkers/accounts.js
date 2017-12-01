// The accounts checker attempts to move money between accounts, maintaining a
// zero sum.

var {write, read} = require('../index');
var {ok, err} = require('../result');

let transfer = () => {
  let change = Math.floor(Math.random() * 100) - 50;

  return function*() {
    let a = yield read('a', 0);
    let b = yield read('b', 0);

    yield write('a', a + change);
    yield write('b', b - change);
  };
};

let fetchSum = () => {
  return function*() {
    let a = yield read('a', 0);
    let b = yield read('b', 0);

    return a + b;
  };
};

module.exports = function testAccounts(schedulerConstructor) {
  s = new schedulerConstructor();
  for (let i = 0; i < 100; i++) {
    s.add(transfer());
  }

  s.run();
  if (s.execute(fetchSum()) !== 0) {
    return err('sum was non-zero');
  }
  return ok(s.stats());
};
