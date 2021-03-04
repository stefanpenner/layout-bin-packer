import {
  default as Bin,
  rangeError
} from './bin';
import Entry from './entry';

export default class ShelfFirst extends Bin {
  constructor(content, width) {
    super(content, width);
    this._positionEntries = [];
  }

  isGrid(width) {
    if (width != null && width !== this.width) {
      this.flush(0);
      this.width = width;
    }
    const length = this.length();
    let entry;

    // TODO: cache/memoize

    for (let i = 0; i < length; i++) {
      entry = this._entryAt(i);
      if (entry.position.x > 0) {
        return true;
      }
    }

    return false;
  }

  height(width) {
    if (width != null && width !== this.width) {
      this.flush(0);
      this.width = width;
    }

    const length = this.length();
    if (length === 0) { return 0; }

    // find tallest in last row, add to Y
    let tallest = 0;
    let currentY = 0;
    let entry;

    for (let i = length - 1; i >= 0; i--) {
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
  }

  flush(position) {
    const positionEntries = this._positionEntries;
    if (positionEntries.length > position) {
      positionEntries.length = position;
    }
  }

  numberVisibleWithin(topOffset, width, height, withPadding) {
    if (width !== this.width) {
      this.flush(0);
      this.width = width;
    }

    const startingIndex = this.visibleStartingIndex(topOffset, width, height);

    return this._numberVisibleWithin(startingIndex, height, withPadding);
  }

  _entryAt(index) {
    const length = this.length();
    const width = this.width;

    if (index >= length) {
      rangeError(length, index);
    }

    let entry;
    let startingIndex;

    const entriesLength = this._positionEntries.length;

    let y, x, i;
    let rowHeight = 0;
    let rowWidth = 0;

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

    for (let i = startingIndex; i < index + 1; i++) {
      const currentHeight = this.heightAtIndex(i);
      const currentWidth = this.widthAtIndex(i);

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
  }

  _numberVisibleWithin(startingIndex, height, withPadding) {
    let count = 0;
    let entry, position;

    const length = this.length();
    let currentY = 0;
    let yOffset = 0;

    if (startingIndex > 0 && startingIndex < length) {
      yOffset = this._entryAt(startingIndex).position.y;
    } else {
      yOffset = 0;
    }

    let firstRowHeight;
    for (let i = startingIndex; i < length; i++) {
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
  }

  position(index, width) {
    const length = this.length();

    if (length === 0 || index > length) {
      rangeError(length, index);
    }

    if (width !== this.width) {
      this.flush(0);
      this.width = width;
    }

    return this._entryAt(index).position;
  }

  visibleStartingIndex(topOffset, width, visibleHeight) {
    if (topOffset <= 0) { return 0; }

    if (width != null && width !== this.width) {
      this.flush(0);
      this.width = width;
    }
    topOffset = Math.min(topOffset, this.maxContentOffset(width, visibleHeight));

    const height = this.height();
    const length = this.length();
    if (length <= 1) { return 0; }

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
    let index = length;
    let bottom = height;
    let previousIndex;

    for (; ;) {
      // Try to find an item that straddles the top offset
      // or is flush with it
      const averageHeight = bottom / index;

      // Guess the index based off the average height
      index = Math.min(Math.floor(topOffset / averageHeight), length - 1);
      if (previousIndex === index) {
        return index;
      }

      let entry = this._entryAt(index);
      let position = entry.position;

      let top = position.y;
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
  }
}
