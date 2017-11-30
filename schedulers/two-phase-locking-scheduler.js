var {TransactionScheduler} = require('../index');

module.exports = class TwoPhaseLockingScheduler extends TransactionScheduler {
  constructor() {
    super();
    this.state = {};
    this.owners = {};
  }

  acquireLock(t, item) {
    if (this.owners.hasOwnProperty(item) && this.owners[item] !== t) {
      // Unable to acquire lock.
      return false;
    }
    this.owners[item] = t;
    // We also need to keep track of all the items a given transaction has a lock on.
    t.locks.add(item);
    return true;
  }

  freeLocks(t) {
    // Make sure we free all of the locks this transaction currently has.
    t.locks.forEach(item => {
      delete this.owners[item];
    });
    t.locks = new Set();
  }

  // Override
  initializeTransactionRecord(t) {
    t.locks = new Set();
  }

  // Override
  attemptCommit(t) {
    this.freeLocks(t);
  }

  // Override
  onAbort(t) {
    this.freeLocks(t);
  }

  // Override
  get(transactionRecord, item) {
    let hasLock = this.acquireLock(transactionRecord, item);
    if (!hasLock) {
      this.abort(transactionRecord);
      return;
    }
    return this.state[item];
  }

  // Override
  set(t, item, value) {
    let hasLock = this.acquireLock(t, item);
    if (!hasLock) {
      this.abort(t);
    } else {
      this.state[item] = value;
    }
  }
};
