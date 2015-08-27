import Bin from './bin';

export default function FixedGrid(content, elementWidth, elementHeight) {
  this._elementWidth =  elementWidth;
  this._elementHeight =  elementHeight;

  this._super$constructor(content);
}

FixedGrid.prototype = Object.create(Bin.prototype);
FixedGrid.prototype._super$constructor = Bin;

FixedGrid.prototype.flush = function (/* index, to */) {

};

FixedGrid.prototype.isGrid = function (width) {
  return (Math.floor(width / this.widthAtIndex(0)) || 1) > 1;
};

FixedGrid.prototype.visibleStartingIndex = function (topOffset, width, height) {
  topOffset = Math.min(topOffset, this.maxContentOffset(width, height));
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

FixedGrid.prototype.widthAtIndex = function (/* index */) {
  return this._elementWidth;
};

FixedGrid.prototype.heightAtIndex = function (/* index */) {
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

  return {x:x, y:y};
};

FixedGrid.prototype.height = function (visibleWidth) {
  if (typeof visibleWidth !== 'number') {
    throw new TypeError('height depends on the first argument of visibleWidth(number)');
  }
  var length = this.length();
  if (length === 0) { return 0; }

  var columnCount = Math.max(Math.floor(visibleWidth/this.widthAtIndex(0), 1));
  columnCount = columnCount > 0 ? columnCount : 1;
  var rows = Math.ceil(length/columnCount);
  var totalHeight = rows * this.heightAtIndex(0);

  return totalHeight;
};
