var {TransactionScheduler} = require('../index');
var MVCCMap = require('../util/mvcc-map');

// TODO: we need a "read-your-own-writes" checker for this guy in particular, because
// this needs to short-circuit gets with the record's writeset.
module.exports = class SnapshotScheduler extends TransactionScheduler {
  constructor() {
    super();
    this.state = new MVCCMap();
    this.curTimestamp = 0;
  }

  initializeTransactionRecord(t) {
    t.writes = new Map();
    t.ts = this.curTimestamp++;
  }

  onAbort(t) {
    t.ts = this.curTimestamp++;
    t.writes = new Map();
  }

  get(t, item) {
    if (t.writes.has(item)) {
      return t.writes.get(item);
    }
    return this.state.get(item, t.ts);
  }

  set(t, item, value) {
    t.writes.set(item, value);
  }

  attemptCommit(t) {
    let commitTime = this.curTimestamp++;
    // First, check if there have been any writes to any values we want to write to.
    for (let [k, _] of t.writes) {
      if (this.state.mostRecentValue(k) >= t.ts) {
        this.abort(t);
        return;
      }
    }

    // Now we are able to send out our writes. It's slightly unrealistic that
    // this is done atomically in this way, but in reality there are ways to
    // work around that.
    for (let [k, v] of t.writes) {
      this.state.set(k, v, commitTime);
    }
  }
};
