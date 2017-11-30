const nullEntry = {
  v: undefined,
  from: -Infinity,
};

class MVCCEntry {
  constructor() {
    this.value = nullEntry;
  }

  getAtTime(t) {
    let entry = this.value;
    while (entry.from > t) {
      entry = entry.next;
    }
    return entry.v;
  }

  setAtTime(value, t) {
    this.value = {
      v: value,
      from: t,
      next: this.value,
    };
  }

  truncate(t) {
    let entry = this.value;
    if (entry === nullEntry) {
      return;
    }

    while (entry.next.from > t) {
      entry = entry.next;
    }
    entry.next = nullEntry;
  }

  mostRecent(t) {
    return this.value.from;
  }
}

module.exports = class MVCCMap {
  constructor() {
    this.entries = new Map();
  }

  _getEntry(item) {
    if (!this.entries.has(item)) {
      this.entries.set(item, new MVCCEntry());
    }
    return this.entries.get(item);
  }

  get(item, t) {
    return this._getEntry(item).getAtTime(t);
  }

  set(item, value, t) {
    this._getEntry(item).setAtTime(value, t);
  }

  truncate(t) {
    for (let [_, entry] of this.entries) {
      entry.truncate(t);
    }
  }

  mostRecentValue(item, t) {
    return this._getEntry(item).mostRecent(t);
  }
};
