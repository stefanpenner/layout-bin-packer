import {
  default as Bin,
  rangeError
} from './bin';
import Entry from './entry';

export default function ShelfFirst(content, width) {
  this._super$constructor(content, width);
  this._positionEntries = [];
}

ShelfFirst.prototype = Object.create(Bin.prototype);
ShelfFirst.prototype._super$constructor = Bin;
ShelfFirst.prototype.isGrid = function ShelfFirst_isGrid(width) {
  if (width != null && width !== this.width) {
    this.flush(0);
    this.width = width;
  }
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

ShelfFirst.prototype.height = function (width) {
  if (width != null && width !== this.width) {
    this.flush(0);
    this.width = width;
  }

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
  var length = this.length();

  if (length === 0 || index > length) {
    rangeError(length, index);
  }

  if (width !== this.width) {
    this.flush(0);
    this.width =  width;
  }

  return this._entryAt(index).position;
};

ShelfFirst.prototype.visibleStartingIndex = function (topOffset, width, visibleHeight) {
  if (topOffset <= 0 ) { return 0; }

  if (width != null && width!== this.width) {
    this.flush(0);
    this.width = width;
  }
  topOffset = Math.min(topOffset, this.maxContentOffset(width, visibleHeight));

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
