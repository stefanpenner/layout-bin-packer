import Entry from './entry';

// I don't think this should have args
export default function Bin(content, width) {
  this.width = width || 0;
  this.content = content;
}

function mustImplement(name) {
  return function() {
    throw new TypeError("MustImplement: " + name );
  };
}

// abstract
Bin.prototype.objectAt = function (collection, index) {
  return collection[index];
};

// abstract: return coordinates of element at index.
//
// @param index: index of the element in content
// @param width: viewport width.
// @returns {x, y} coordinates of element at index.
//
// May reset cached viewport width.
Bin.prototype.position = mustImplement('position');

// abstract: reset internal state to be anchored at index.
// @param index: index of the element in content
Bin.prototype.flush = mustImplement('flush');

// abstract: return total content height given viewport width.
// @param width: viewport width
//
// May reset cached viewport width.
Bin.prototype.height = mustImplement('height');

// abstract: true if layout places more than one object on a line.
Bin.prototype.isGrid = mustImplement('isGrid');

export function rangeError(length, index) {
  throw new RangeError("Parameter must be within: [" + 0 + " and " + length + ") but was: " + index);
}

// abstract: returns number of elements in content.
Bin.prototype.length = function () {
  return this.content.length;
};

// maximum offset of content wrt to viewport
// The amount by which content (after being layed out) is taller than
// the viewport.
Bin.prototype.maxContentOffset = function Bin_maxContentOffset(width, height) {
  var contentHeight = this.height(width);
  var maxOffset = Math.max(contentHeight - height, 0);
  return maxOffset;
}

// abstract: returns index of first visible item.
// @param topOffset: scroll position
// @param width: width of viewport
// @param height: height of viewport
//
Bin.prototype.visibleStartingIndex = mustImplement('visibleStartingIndex');

// abstract: returns number of items visible in viewport.
// @param topOffset: scroll position
// @param width: width of viewport
// @param height: height of viewport
Bin.prototype.numberVisibleWithin = mustImplement('numberVisibleWithin');

Bin.prototype.heightAtIndex = function (index) {
  return this.content[index].height;
};

Bin.prototype.widthAtIndex = function (index) {
  return this.content[index].width;
};
