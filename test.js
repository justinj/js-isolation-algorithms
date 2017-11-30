var assert = require('assert');
var TwoPhaseLockingScheduler = require('./schedulers/two-phase-locking-scheduler');
var SnapshotScheduler = require('./schedulers/snapshot-scheduler');
var {write, read} = require('./index');

var {ok, err} = require('./result');

var incrementChecker = require('./checkers/increment');
var accountsChecker = require('./checkers/accounts');

let combine = (a, b) => {
  let result = {};
  for (let k of Object.keys(a)) {
    result[k] = a[k];
  }

  for (let k of Object.keys(b)) {
    if (!result.hasOwnProperty(k)) {
      result[k] = 0;
    }
    result[k] += b[k];
  }

  return result;
};

function runChecker(schedulerConstructor, checker) {
  let results = {
    runs: 0,
    failures: 0,
    aborts: 0,
  };

  for (let i = 0; i < 1; i++) {
    results = combine(
      results,
      checker(schedulerConstructor)
        .andThen(e => {
          return ok(e);
        })
        .catch(e => {
          return ok({failures: 1});
        })
        .andThen(e => {
          return ok(combine(e, {runs: 1}));
        })
        .unwrap(),
    );
  }

  return results;
}

describe('2pl', () => {
  it('runs the increment checker', () => {
    let result = runChecker(TwoPhaseLockingScheduler, incrementChecker);
    assert.equal(result.failures, 0);
  });

  it('runs the accounts checker', () => {
    let result = runChecker(TwoPhaseLockingScheduler, accountsChecker);
    assert.equal(result.failures, 0);
  });
});

describe('snapshot', () => {
  it('runs the increment checker', () => {
    let result = runChecker(SnapshotScheduler, incrementChecker);
    assert.equal(result.failures, 0);
  });

  it('runs the accounts checker', () => {
    let result = runChecker(SnapshotScheduler, incrementChecker);
    assert.equal(result.failures, 0);
  });
});
