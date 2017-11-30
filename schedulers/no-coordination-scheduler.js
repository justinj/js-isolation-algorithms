var {TransactionScheduler} = require('../index');

// This Scheduler does not perform any coordination. All transactions can see
// the work of other transactions.
module.exports = class NoCoordinationScheduler extends TransactionScheduler {
  constructor() {
    super();
    this.state = {};
  }

  get(transactionRecord, item) {
    return this.state[item];
  }

  set(transactionRecord, item, value) {
    this.state[item] = value;
  }
};
