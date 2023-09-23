(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    factory(require('../dist/layout-bin-packer'), require('qunitjs'));
  } else {
    factory(root.Bin, root.QUnit);
  }
})(this, function(Bin, QUnit) {
  var test = QUnit.test;

  QUnit.module('Bin');

  test('position asserts must implement', function(assert) {
    function assertMustImplementAbstract(method) {
      assert.throws(
        function() { new Bin.Bin([], 100)[method](); },
        'MustImplement: ' + method);
    }
    assertMustImplementAbstract('position');
    assertMustImplementAbstract('flush');
    assertMustImplementAbstract('height');
    assertMustImplementAbstract('isGrid');
  });

  QUnit.module('ShelfFirst');

  var contentB = [
  /* y:   0 */ { width: 50, height: 50 }, { width: 60, height: 50 }, // y:   0
  /* y:  50 */ { width: 100, height: 25 },                            // y:  50
  /* y:  75 */ { width: 50, height: 50 }, { width: 50, height: 50 }, // y:  75
  /* y: 125 */ { width: 50, height: 50 }, { width: 50, height: 50 }, // y: 125
  /* y: 175 */ { width: 50, height: 50 }                              // y: 175
  ];

  test('test something about shelf first', function(assert) {
    var bin = new Bin.ShelfFirst(contentB, 100);

    assert.deepEqual(bin.position(0, 100), {
      x: 0,
      y: 0
    });

    assert.deepEqual(bin.position(1, 100), {
      x: 0,
      y: 50
    });

    assert.deepEqual(bin.position(2, 100), {
      x: 0,
      y: 100
    });

    assert.equal(bin.isGrid(), true);
  });

  var content = [
  /* y:   0 */ { width: 50, height: 50 }, { width: 50, height: 50 }, // y:   0
  /* y:  50 */ { width: 100, height: 25 },                            // y:  50
  /* y:  75 */ { width: 50, height: 50 }, { width: 50, height: 50 }, // y:  75
  /* y: 125 */ { width: 50, height: 50 }, { width: 50, height: 50 }, // y: 125
  /* y: 175 */ { width: 50, height: 50 }                              // y: 175
  ];

  test('test something else about shelf first', function(assert) {
    var bin = new Bin.ShelfFirst(content, 100);

    assert.equal(bin.isGrid(), true);
    assert.equal(bin.isGrid(50), false);

    assert.deepEqual(bin.position(0, 100), {
      x: 0,
      y: 0
    });

    assert.deepEqual(bin.position(1, 100), {
      x: 50,
      y: 0
    });

    assert.deepEqual(bin.position(2, 100), {
      x: 0,
      y: 50
    });

    assert.deepEqual(bin.position(3, 100), {
      x: 0,
      y: 75
    });

    assert.deepEqual(bin.position(4, 100), {
      x: 50,
      y: 75
    });

    assert.deepEqual(bin.position(5, 100), {
      x: 0,
      y: 125
    });

    assert.deepEqual(bin.position(6, 100), {
      x: 50,
      y: 125
    });

    assert.deepEqual(bin.position(7, 100), {
      x: 0,
      y: 175
    });

    assert.equal(bin.height(), 225);
    assert.equal(bin.height(50), 375);

    assert.equal(bin.maxContentOffset(100, 225), 0);
    assert.equal(bin.maxContentOffset(100, 175), 50);
    assert.equal(bin.maxContentOffset(100, 50), 175);
    assert.equal(bin.maxContentOffset(50, 375), 0);
    assert.equal(bin.maxContentOffset(50, 225), 150);
    assert.equal(bin.maxContentOffset(50, 50), 325);

    assert.equal(bin.visibleStartingIndex(-10, 100, 100), 0);

    assert.equal(bin.visibleStartingIndex(0, 100, 100), 0);

    assert.equal(bin.visibleStartingIndex(50, 100, 100), 2);
    assert.equal(bin.visibleStartingIndex(50, 100, 500), 0);
    assert.equal(bin.visibleStartingIndex(75, 100, 100), 3);

    assert.equal(bin.visibleStartingIndex(100, 100, 100), 3);
    assert.equal(bin.visibleStartingIndex(125, 100, 100), 5);

    assert.equal(bin.visibleStartingIndex(150, 100, 100), 5);
    assert.equal(bin.visibleStartingIndex(175, 100, 50), 7);

    assert.equal(bin.visibleStartingIndex(49, 100, 100), 0);

    assert.equal(bin.visibleStartingIndex(200, 100, 50), 7);
    assert.equal(bin.visibleStartingIndex(200, 100, 100), 5);
    assert.equal(bin.visibleStartingIndex(400, 100, 50), 7);
    assert.equal(bin.visibleStartingIndex(400, 100, 100), 5);

    // index 0; given viewport { height: 50 , width: 100}
    assert.equal(bin.numberVisibleWithin(0, 100, 50), 2);
    assert.equal(bin.numberVisibleWithin(50, 100, 50), 3);
    assert.equal(bin.numberVisibleWithin(75, 100, 50), 2);
    assert.equal(bin.numberVisibleWithin(125, 100, 50), 2);
    assert.equal(bin.numberVisibleWithin(175, 100, 50), 1);

    // with padding
    assert.equal(bin.numberVisibleWithin(0, 100, 50, true), 5);
    assert.equal(bin.numberVisibleWithin(50, 100, 50, true), 5);
    assert.equal(bin.numberVisibleWithin(75, 100, 50, true), 5);
    assert.equal(bin.numberVisibleWithin(125, 100, 50, true), 3);
    assert.equal(bin.numberVisibleWithin(175, 100, 50, true), 1);

    assert.throws(function() {
      assert.deepEqual(bin.position(8, 100), {
        x: 0,
        y: 175
      });
    }, /Parameter must be within: \[0 and 8\) but was: 8/);

    // dimension change width: 99
    // var content = [
    // /* index: 0, y:   0 */ { width:  50, height:  50 },
    // /* index: 1, y:  50 */ { width:  50, height:  50 },
    // /* index: 2, Y: 100 */ { width: 100, height:  25 },
    // /* index: 3, y: 125 */ { width:  50, height:  50 },
    // /* index: 4, y: 175 */ { width:  50, height:  50 },
    // /* index: 5, y: 225 */ { width:  50, height:  50 },
    // /* index: 6, y: 275 */ { width:  50, height:  50 },
    // /* index: 7, y: 325 */ { width:  50, height:  50}
    // ];

    assert.deepEqual(bin.position(7, 99), {
      x: 0,
      y: 325
    });

    assert.deepEqual(bin.position(2, 200), {
      x: 100,
      y: 0
    });

    assert.deepEqual(bin.position(3, 200), {
      x: 0,
      y: 50
    });
  });

  QUnit.module('FixedGrid');

  test('testing fixed grid', function(assert) {
    var fixed = new Bin.FixedGrid(content, 10, 10);

    assert.deepEqual(fixed.position(0, 20), {
      x: 0,
      y: 0
    });

    assert.deepEqual(fixed.position(1, 20), {
      x: 10,
      y: 0
    });

    assert.deepEqual(fixed.position(2, 20), {
      x: 0,
      y: 10
    });

    assert.deepEqual(fixed.position(3, 20), {
      x: 10,
      y: 10
    });

    assert.deepEqual(fixed.height(20), 40);

    assert.ok(fixed.isGrid(20));
    assert.ok(!fixed.isGrid(10));

    assert.equal(fixed.maxContentOffset(10, 80), 0);
    assert.equal(fixed.maxContentOffset(10, 50), 30);
    assert.equal(fixed.maxContentOffset(20, 50), 0);
    assert.equal(fixed.maxContentOffset(20, 20), 20);

    assert.equal(fixed.visibleStartingIndex(0, 20, 20), 0);
    assert.equal(fixed.visibleStartingIndex(10, 10, 70), 1);
    assert.equal(fixed.visibleStartingIndex(10, 20, 20), 2);
    assert.equal(fixed.visibleStartingIndex(10, 30, 20), 3);
    assert.equal(fixed.visibleStartingIndex(10, 40, 20), 0);
    assert.equal(fixed.visibleStartingIndex(20, 20, 20), 4);
    assert.equal(fixed.visibleStartingIndex(30, 20, 20), 4);
    assert.equal(fixed.visibleStartingIndex(30, 20, 10), 6);

    assert.equal(fixed.visibleStartingIndex(0, 20, 20), 0);
    assert.equal(fixed.visibleStartingIndex(0, 20, 20), 0);


    // index 0; given viewport { height: 20, width: 20 }
    assert.equal(fixed.numberVisibleWithin(0, 20, 20), 4);
    assert.equal(fixed.numberVisibleWithin(10, 20, 20), 4);
    assert.equal(fixed.numberVisibleWithin(20, 20, 20), 4);

    // with padding
    assert.equal(fixed.numberVisibleWithin(0, 20, 20, true), 6);
    assert.equal(fixed.numberVisibleWithin(10, 20, 20, true), 6);
    assert.equal(fixed.numberVisibleWithin(20, 20, 20, true), 4);
  });

  test('widthAtIndex and heightAtIndex match fixed width and height', function(assert) {
    var fixed = new Bin.FixedGrid(content, 10, 20);
    assert.equal(fixed.widthAtIndex(0), 10);
    assert.equal(fixed.heightAtIndex(0), 20);
  });

  QUnit.module('more ShelfFirst tests');

  test('something', function(assert) {
    var bin = new Bin.ShelfFirst([
      { width: 50, height: 100 },
      { width: 50, height: 25 },
      { width: 50, height: 100 }
    ], 100);

    bin.position(0, 100);
    bin.position(1, 100);
    assert.deepEqual(bin.position(2, 100), {
      x: 0,
      y: 100,
    });
  });

  test('something else', function(assert) {
    var bin = new Bin.ShelfFirst([
      { width: 5, height: 5 },
      { width: Infinity, height: 5 },
      { width: 5, height: 5 }
    ], 100);

    assert.deepEqual(bin.position(0, 100), {
      x: 0,
      y: 0,
    });

    assert.deepEqual(bin.position(1, 100), {
      x: 0,
      y: 5,
    }); // this one has inifinit width

    assert.deepEqual(bin.position(2, 100), {
      x: 0,
      y: 10,
    });
  });

  test('and something else', function(assert) {
    var bin = new Bin.ShelfFirst([
      /*0*/{ height: 100, width: 100 },
      /*1*/{ height: 100, width: 100 },
      /*2*/{ height: 25, width: Infinity },
      /*3*/{ height: 100, width: 100 },
      /*4*/{ height: 100, width: Infinity },
      /*5*/{ height: 100, width: Infinity },
      /*6*/{ height: 25, width: 100 },
      /*7*/{ height: 25, width: 100 },
      /*8*/{ height: 100, width: 100 },
      /*9*/{ height: 25, width: 100 }
    ], 200);

    assert.deepEqual(bin.position(0, 200), {
      x: 0,
      y: 0,
    });

    assert.deepEqual(bin.position(1, 200), {
      x: 100,
      y: 0,
    });

    assert.deepEqual(bin.position(2, 200), {
      x: 0,
      y: 100,
    }); // This one has Infinite width

    assert.deepEqual(bin.position(3, 200), {
      x: 0,
      y: 125,
    });

    assert.deepEqual(bin.position(4, 200), {
      x: 0,
      y: 225,
    }); // This one has Infinite width

    assert.deepEqual(bin.position(5, 200), {
      x: 0,
      y: 325,
    }); // This one has Infinite width

    assert.deepEqual(bin.position(6, 200), {
      x: 0,
      y: 425,
    });

    assert.deepEqual(bin.position(7, 200), {
      x: 100,
      y: 425,
    });

    assert.deepEqual(bin.position(8, 200), {
      x: 0,
      y: 450,
    });

    assert.deepEqual(bin.position(9, 200), {
      x: 100,
      y: 450,
    });

    assert.deepEqual(bin.height(), 550);
    assert.ok(bin.isGrid(), true);
    assert.deepEqual(bin.position(9, 100), {
      x: 0,
      y: 675,
    });
    assert.ok(!bin.isGrid());

    var bin = new Bin.ShelfFirst([], 100);

    assert.throws(function() {
      bin.position(0, 100);
    }, RangeError);
  });
});
