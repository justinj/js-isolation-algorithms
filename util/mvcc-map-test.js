var assert = require('assert');
var MVCCMap = require('./mvcc-map');

describe('mvcc map', () => {
  describe('setting and getting values', () => {
    it('stores a single value', () => {
      let map = new MVCCMap();
      map.set('a', 4, 0);
      assert.equal(map.get('a', 0), 4);
    });

    it('overwrites the last value', () => {
      let map = new MVCCMap();
      map.set('a', 4, 0);
      map.set('a', 10, 1);
      assert.equal(map.get('a', 1), 10);
    });

    it('allows accessing a value that was set previously', () => {
      let map = new MVCCMap();
      map.set('a', 4, 0);
      map.set('a', 10, 1);
      assert.equal(map.get('a', 0), 4);
    });

    it('allows accessing multiple past values', () => {
      let map = new MVCCMap();
      map.set('a', 4, 0);
      map.set('a', 10, 3);
      map.set('a', 17, 6);
      assert.equal(map.get('a', 0), 4);
      assert.equal(map.get('a', 2), 4);
      assert.equal(map.get('a', 3), 10);
      assert.equal(map.get('a', 6), 17);
      assert.equal(map.get('a', 8), 17);
    });
  });

  describe('truncate', () => {
    it('clears out entries older than a particular timestamp', () => {
      let map = new MVCCMap();
      map.set('a', 4, 0);
      map.set('a', 10, 3);
      map.set('a', 17, 6);
      assert.equal(map.get('a', 1), 4);
      // Delete entries older than t=2
      map.truncate(2);
      assert.equal(map.get('a', 1), undefined);
    });
  });
});
