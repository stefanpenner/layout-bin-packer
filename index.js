// I don't think this should have args
function Bin(content, width) {
  this.width = width || 0;
  this.content = content;
}

function mustImplement(name) {
  return function() {
    throw TypeError("MustImplement: " + name );
  };
}

function Position(x, y) {
  this.x = x;
  this.y = y;
}

// @param height: "known to have atleast this might height available"
function Entry(height, width, x, y) {
  this.height   = height;
  this.width    = width;
  this.position = new Position(x, y);
}

// abstract
Bin.prototype.objectAt = function (collection, index) {
  return collection[index];
};

// abstract
Bin.prototype.position = mustImplement('position');

// abstract
Bin.prototype.flush = mustImplement('flush');

// abstract
Bin.prototype.height = mustImplement('position');

// abstract
Bin.prototype.isGrid = mustImplement('isGrid');

function rangeError(length, index) {
  throw new RangeError("Parameter must be within: [" + 0 + " and " + length + ") but was: " + index);
}

function insufficientArguments(actual, expected) {
  throw new TypeError("Insufficent Arguments expected: " + expected + " but got " + actual + "");
}

// abstract
Bin.prototype.length = function () {
  return this.content.length;
};

// abstract
Bin.prototype.visibleStartingIndex = mustImplement('visibleStartingIndex');

Bin.prototype.numberVisibleWithin = mustImplement('numberVisibleWithin');

Bin.prototype.heightAtIndex = function (index) {
  return this.content[index].height;
};

Bin.prototype.widthAtIndex = function (index) {
  return this.content[index].width;
};

function ShelfFirst(content, width) {
  this._super$constructor(content, width);
  this._positionEntries = [];
}

ShelfFirst.prototype = Object.create(Bin.prototype);
ShelfFirst.prototype._super$constructor = Bin;
ShelfFirst.prototype.isGrid = function ShelfFirst_isGrid(width) {
  var length = this.length();
  var entry;

  // TODO: cache/memoize

  for (var i = 0; i < length; i++) {
    entry = this._entryAt(i);
    if (entry.position.x > 0) {
      return true;
    }
  }

  return false;
};

ShelfFirst.prototype.height = function () {
  var length = this.length();
  if (length === 0) { return 0; }

  // find tallest in last row, add to Y
  var tallest  = 0;
  var currentY = 0;
  var entry;

  for (var i = length - 1; i >= 0; i--) {
    entry = this._entryAt(i);

    if (currentY > entry.position.y) {
      break; // end of last row
    } else if (tallest < entry.height) {
      tallest = entry.height;
    } else {
      // do nothing
    }

    currentY = entry.position.y;
  }

  return currentY + tallest;
};

ShelfFirst.prototype.flush = function (position) {
  var positionEntries = this._positionEntries;
  var length = positionEntries.length;

  if (positionEntries.length > position) {
    positionEntries.length = position;
  }
};

ShelfFirst.prototype.numberVisibleWithin = function (topOffset, width, height, withPadding) {
  if (width !== this.width) {
    this.flush(0);
    this.width = width;
  }

  var startingIndex = this.visibleStartingIndex(topOffset, width, height);

  return this._numberVisibleWithin(startingIndex, height, withPadding);
};

ShelfFirst.prototype._entryAt = function _entryAt(index) {
  var length = this.length();
  var width = this.width;

  if (index >= length) {
    rangeError(length, index);
  }

  var entry;
  var entries = this._positionEntries;
  var entriesLength = entries.length;
  var startingIndex;

  var y, x, i;
  var rowHeight = 0;
  var rowWidth = 0;

  if (index < entriesLength) {
    return this._positionEntries[index];
  } else if (entriesLength === 0) {
    startingIndex = 0;
    y = 0;
  } else {
    startingIndex = entriesLength - 1;
    entry = this._positionEntries[startingIndex];
    rowWidth = entry.position.x + entry.width;
    rowHeight = entry.height;
    y = entry.position.y;
    startingIndex++;
  }

  for (i = startingIndex; i < index + 1; i++) {
    var currentHeight = this.heightAtIndex(i);
    var currentWidth = this.widthAtIndex(i);

    if (entry && (currentWidth + rowWidth) > width) {
      // new row
      y = entry.position.y + entry.height;
      x = 0;
      rowWidth = 0;
      rowHeight = currentHeight;
    } else {
      x = rowWidth;
    }

    if (currentHeight > rowHeight) {
      rowHeight = currentHeight;
    }

    entry = this._positionEntries[i] = new Entry(rowHeight, currentWidth, x, y);

    rowWidth = x + currentWidth;
  }

  return entry;
};

ShelfFirst.prototype._numberVisibleWithin = function (startingIndex, height, withPadding) {
  var width = this.width;
  var count = 0;
  var length = this.length();
  var entry, position;
  var currentY = 0;
  var yOffset = 0;

  if (startingIndex > 0 && startingIndex < length) {
    yOffset = this._entryAt(startingIndex).position.y;
  } else {
    yOffset = 0;
  }

  var firstRowHeight;
  for (var i = startingIndex; i < length; i++) {
    entry = this._entryAt(i);
    position = entry.position;

    if (currentY === position.y) {
      // same row
    } else {
      currentY = position.y - yOffset;
      if (withPadding && !firstRowHeight) {
        firstRowHeight = entry.height;
      }
    }

    if (currentY < height) {
      count++;
    } else if (withPadding) {
      withPadding = false;
      height += Math.max(firstRowHeight, entry.height) + 1;
      count++;
    } else {
      break;
    }
  }

  return count;
};

ShelfFirst.prototype.position = function position(index, width) {
  var length = this.length;

  if (length === 0 || index > length) {
    rangeError(length, index);
  }

  if (width !== this.width) {
    this.flush(0);
    this.width =  width;
  }

  return this._entryAt(index).position;
};

ShelfFirst.prototype.visibleStartingIndex = function (topOffset, width) {
  if (topOffset === 0 ) { return 0; }

  if (width!== this.width) {
    this.flush(0);
    this.width = width;
  }

  var height = this.height();
  var length = this.length();

  // Start searching using the last item in the list
  // and the bottom of the list for calculating the average height.

  // This algorithm is necessary for efficiently finding
  // the starting index of a list with variable heights
  // in less than O(n) time.

  // Ideally, the performance will be O(log n).
  // The algorithm implemented assumes that the best case
  // is a list of items with all equal heights.
  // Lists with consistent distributions should arrive
  // at results fairly quickly as well.
  var index = length;
  var bottom = height;
  var previousIndex;

  for (;;) {
    // Try to find an item that straddles the top offset
    // or is flush with it
    var averageHeight = bottom / index;

    // Guess the index based off the average height
    index = Math.min(Math.floor(topOffset / averageHeight), length - 1);
    if (previousIndex === index) {
      return index;
    }

    var entry = this._entryAt(index);
    var position = entry.position;

    var top = position.y;
    bottom = top + entry.height;

    previousIndex = index;

    if (bottom > topOffset) {
      // Walk backwards until we find an item that won't be shown
      while (bottom >= topOffset) {
        previousIndex = index;
        index--;

        if (index === -1) {
          break;
        }
        entry = this._entryAt(index);
        position = entry.position;
        bottom = position.y + entry.height;
      }

      return previousIndex;
    } else if (topOffset === bottom) {
      // Walk forwards until we find the next one- it should be close
      while (bottom <= topOffset) {
        index++;
        entry = this._entryAt(index);
        position = entry.position;
        bottom = position.y + entry.height;
      }
      return index;
    }
  }

  return -1;
};

function FixedGrid(content, elementWidth, elementHeight) {
  this._elementWidth =  elementWidth;
  this._elementHeight =  elementHeight;

  this._super$constructor(content);
}

FixedGrid.prototype = Object.create(Bin.prototype);
FixedGrid.prototype._super$constructor = Bin;

FixedGrid.prototype.flush = function (index /*, to */) {

};

FixedGrid.prototype.isGrid = function (width) {
  return (Math.floor(width / this.widthAtIndex(0)) || 1) > 1;
};

FixedGrid.prototype.visibleStartingIndex = function (topOffset, width) {
  var columns = Math.floor(width / this.widthAtIndex(0)) || 1;

  return Math.floor(topOffset / this.heightAtIndex(0)) * columns;
};

FixedGrid.prototype.numberVisibleWithin = function (topOffset, width, height, withPadding) {
  var startingIndex = this.visibleStartingIndex(topOffset, width, height);
  var columns = Math.floor(width / this.widthAtIndex(0)) || 1;
  var length = this.length();

  var rowHeight = this.heightAtIndex(0);
  var rows = Math.ceil(height / rowHeight);

  var maxNeeded = rows * columns;

  if (withPadding) {
    maxNeeded += columns;
  }

  var potentialVisible = length - startingIndex;

  return Math.max(Math.min(maxNeeded, potentialVisible), 0);
};

FixedGrid.prototype.widthAtIndex = function (index) {
  return this._elementWidth;
};

FixedGrid.prototype.heightAtIndex = function (index) {
  return this._elementHeight;
};

FixedGrid.prototype.position = function (index, width) {
  var length = this.length();
  if (length === 0 || index > length) {
    rangeError(length, index);
  }

  var columns = Math.floor(width / this.widthAtIndex(index)) || 1;

  var x = index % columns * this.widthAtIndex(index) | 0;
  var y = Math.floor(index / columns) * this.heightAtIndex(index);

  return new Position(x, y);
};

FixedGrid.prototype.height = function (visibleWidth) {
  if (typeof visibleWidth !== 'number') {
    throw TypeError('height depends on the first argument of visibleWidth(number)');
  }
  var length = this.length();
  if (length === 0) { return 0; }

  var columnCount = Math.max(Math.floor(visibleWidth/this.widthAtIndex(0), 1));
  columnCount = columnCount > 0 ? columnCount : 1;
  var rows = Math.ceil(length/columnCount);
  var totalHeight = rows * this.heightAtIndex(0);

  return totalHeight;
};

Bin.FixedGrid = FixedGrid;

Bin.Position = Position;
Bin.Entry = Entry;
Bin.ShelfFirst = ShelfFirst;

/* global define:true module:true window: true */
if (typeof define === 'function' && define['amd']) {
  define(function() { return Bin; });
} else if (typeof module !== 'undefined' && module['exports']) {

  module['exports'] = Bin;
} else if (typeof this !== 'undefined') {
  this['Bin'] = Bin;
}
