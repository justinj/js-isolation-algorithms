var assert = require('assert');
var TwoPhaseLockingScheduler = require('./schedulers/two-phase-locking-scheduler');
var NoCoordinationScheduler = require('./schedulers/no-coordination-scheduler');
var SnapshotScheduler = require('./schedulers/snapshot-scheduler');
var {write, read} = require('./index');

var {ok, err} = require('./result');

var incrementChecker = require('./checkers/increment');
var accountsChecker = require('./checkers/accounts');
var debitChecker = require('./checkers/debit');
var readWritesChecker = require('./checkers/read-writes');

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

const NUM_RUNS = 1;

function runChecker(schedulerConstructor, checker) {
  let results = {
    runs: 0,
    failures: 0,
    aborts: 0,
  };

  for (let i = 0; i < NUM_RUNS; i++) {
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

const SCHEDULERS = [
  TwoPhaseLockingScheduler,
  NoCoordinationScheduler,
  SnapshotScheduler,
];

const CHECKERS = [
  incrementChecker,
  accountsChecker,
  debitChecker,
  readWritesChecker,
];

SCHEDULERS.forEach(scheduler => {
  describe(scheduler.name, () => {
    CHECKERS.forEach(checker => {
      it(`runs the ${checker.name} checker`, () => {
        let result = runChecker(scheduler, checker);
        assert.equal(result.failures, 0);
      });
    });
  });
});

// describe('2pl', () => {
//   it('runs the increment checker', () => {
//     let result = runChecker(TwoPhaseLockingScheduler, incrementChecker);
//     assert.equal(result.failures, 0);
//   });

//   it('runs the accounts checker', () => {
//     let result = runChecker(TwoPhaseLockingScheduler, accountsChecker);
//     assert.equal(result.failures, 0);
//   });

//   it('runs the debit checker', () => {
//     let result = runChecker(TwoPhaseLockingScheduler, debitChecker);
//     assert.equal(result.failures, 0);
//   });

//   it('runs the read-writes checker', () => {
//     let result = runChecker(TwoPhaseLockingScheduler, readWritesChecker);
//     assert.equal(result.failures, 0);
//   });
// });

// describe('snapshot', () => {
//   it('runs the increment checker', () => {
//     let result = runChecker(SnapshotScheduler, incrementChecker);
//     assert.equal(result.failures, 0);
//   });

//   it('runs the accounts checker', () => {
//     let result = runChecker(SnapshotScheduler, incrementChecker);
//     assert.equal(result.failures, 0);
//   });

//   it('runs the debit checker', () => {
//     // This fails (as it should).
//     let result = runChecker(SnapshotScheduler, debitChecker);
//     assert.equal(result.failures, 0);
//   });

//   it('runs the read-writes checker', () => {
//     // This fails (as it should).
//     let result = runChecker(SnapshotScheduler, readWritesChecker);
//     assert.equal(result.failures, 0);
//   });
// });
