// The read writes checker ensures that a transaction can read something it has previously written.

var {write, read, fail} = require('../index');
var {ok, err} = require('../result');

let writeThenRead = () => {
  let value = Math.floor(Math.random() * 10);

  return function*() {
    yield write('a', value);
    let result = yield read('a');

    if (result !== value) {
      yield fail(`wrote ${value}, read ${result}`);
    }
  };
};

module.exports = function testReadWrites(schedulerConstructor) {
  s = new schedulerConstructor();
  for (let i = 0; i < 100; i++) {
    s.add(writeThenRead());
  }

  s.run();
  if (s.failed) {
    return err(s.failMsg);
  }
  return ok(s.stats());
};
