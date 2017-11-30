const WRITE = 'WRITE';
const READ = 'READ';
const FAIL = 'FAIL';

const write = (item, value) => ({type: WRITE, item, value});
const read = (item, def = undefined) => ({type: READ, item, def});
const fail = message => ({type: FAIL, message});

// We stuff these on the transaction record so we can safely expose the
// transaction record to the implementor and allow them to modify it.
const _constructor_ = Symbol('constructor');
const _transaction_ = Symbol('transaction');
const _nextValue_ = Symbol('nextValue');
const _complete_ = Symbol('complete');
const _returnValue_ = Symbol('returnValue');
const _isAborted_ = Symbol('isAborted');

// A Transaction is a function which returns an iterator.

class TransactionScheduler {
  constructor() {
    this.aborts = 0;
    this.transactions = [];
  }

  add(transaction) {
    let transactionRecord = {
      [_constructor_]: transaction,
      [_nextValue_]: undefined,
      [_complete_]: false,
      [_returnValue_]: undefined,
      [_isAborted_]: false,
    };
    this.transactions.push(transactionRecord);
    this.initializeTransactionRecord(transactionRecord);
    transactionRecord[_transaction_] = transactionRecord[_constructor_]();
    return transactionRecord;
  }

  // Abort any running instance of the given transaction and start it over.
  abort(transactionRecord) {
    transactionRecord[_isAborted_] = true;
    this.aborts++;
    transactionRecord[_transaction_] = transactionRecord[_constructor_]();
    this.onAbort(transactionRecord);
  }

  stats() {
    return {
      aborts: this.aborts,
    };
  }

  stepTransaction(t) {
    let {done, value} = t[_transaction_].next(t[_nextValue_]);
    if (!done) {
      switch (value.type) {
        case WRITE:
          this.set(t, value.item, value.value);
          break;
        case READ:
          let next = this.get(t, value.item);
          if (next === undefined) {
            next = value.def;
          }
          t[_nextValue_] = next;
          break;
        case FAIL:
          this.failed = true;
          this.failMsg = value.message;
          this.transactions = [];
          break;
      }
    } else {
      this.attemptCommit(t);
      if (t[_isAborted_]) {
        t[_isAborted_] = false;
        return;
      }
      t[_returnValue_] = value;
      t[_complete_] = true;
      this.transactions = this.transactions.filter(
        transaction => transaction !== t,
      );
    }
  }

  step() {
    let tIdx = Math.floor(Math.random() * this.transactions.length);
    this.stepTransaction(this.transactions[tIdx]);
  }

  run() {
    while (this.transactions.length > 0) {
      this.step();
    }
  }

  // execute serially runs a transaction.
  execute(transaction) {
    let record = this.add(transaction);
    while (!record[_complete_]) {
      this.stepTransaction(record);
    }
    return record[_returnValue_];
  }

  // Overridable
  onAbort(transactionRecord) {}
  attemptCommit(transactionRecord) {}
  initializeTransactionRecord(transactionRecord) {}
  get(transactionRecord, item) {}
  set(transactionRecord, item, value) {}
}

module.exports = {
  TransactionScheduler,
  write,
  read,
  fail,
};
