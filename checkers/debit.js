// The debit checker attempts to remove money from an account, but only if
// doing so will not reduce the sum of both accounts to below zero.
// This is supposed to provoke write skew.

var {write, read, fail} = require('../index');
var {ok, err} = require('../result');

let debit = () => {
  return function*() {
    let a = yield read('a');
    let b = yield read('b');

    let sum = a + b;
    if (sum < 0) {
      yield fail('sum of accounts was below zero!');
      return;
    }

    if (Math.random() < 0.5) {
      if (sum >= 30) {
        yield write('a', a - 30);
      }
    } else {
      if (sum >= 50) {
        yield write('b', b - 50);
      }
    }
  };
};

// Boost up the accounts too so that we can have more attempts to break it.
let credit = () => {
  return function*() {
    let a = yield read('a');
    let b = yield read('b');

    let sum = a + b;
    if (sum < 0) {
      yield fail('sum of accounts was below zero!');
      return;
    }

    if (a + b < 30) {
      yield write('a', a + 15);
      yield write('b', b + 15);
    }
  };
};

let initialize = () => {
  return function*() {
    yield write('a', 30);
    yield write('b', 30);
  };
};

module.exports = function debitChecker(schedulerConstructor) {
  let s = new schedulerConstructor();
  s.add(initialize());
  s.run();

  for (let i = 0; i < 50; i++) {
    s.add(debit());
    s.add(credit());
  }
  s.run();
  if (s.failed) {
    return err(s.failMsg);
  }
  return ok(s.stats());
};
