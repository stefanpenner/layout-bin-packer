import Bin from './bin';

export default class FixedGrid extends Bin {
  constructor(content, elementWidth, elementHeight) {
    super(content);

    this._elementWidth = elementWidth;
    this._elementHeight = elementHeight;
  }

  flush(/* index, to */) {

  }

  isGrid(width) {
    return (Math.floor(width / this.widthAtIndex(0)) || 1) > 1;
  }

  visibleStartingIndex(topOffset, width, height) {
    topOffset = Math.min(topOffset, this.maxContentOffset(width, height));
    const columns = Math.floor(width / this.widthAtIndex(0)) || 1;

    return Math.floor(topOffset / this.heightAtIndex(0)) * columns;
  }

  numberVisibleWithin(topOffset, width, height, withPadding) {
    const startingIndex = this.visibleStartingIndex(topOffset, width, height);
    const columns = Math.floor(width / this.widthAtIndex(0)) || 1;
    const length = this.length();

    const rowHeight = this.heightAtIndex(0);
    const rows = Math.ceil(height / rowHeight);

    let maxNeeded = rows * columns;

    if (withPadding) {
      maxNeeded += columns;
    }

    const potentialVisible = length - startingIndex;

    return Math.max(Math.min(maxNeeded, potentialVisible), 0);
  }

  widthAtIndex(/* index */) {
    return this._elementWidth;
  }

  heightAtIndex(/* index */) {
    return this._elementHeight;
  }

  position(index, width) {
    const length = this.length();
    if (length === 0 || index > length) {
      rangeError(length, index);
    }

    const columns = Math.floor(width / this.widthAtIndex(index)) || 1;

    const x = index % columns * this.widthAtIndex(index) | 0;
    const y = Math.floor(index / columns) * this.heightAtIndex(index);

    return { x, y };
  }

  height(visibleWidth) {
    if (typeof visibleWidth !== 'number') {
      throw new TypeError('height depends on the first argument of visibleWidth(number)');
    }
    const length = this.length();
    if (length === 0) { return 0; }

    let columnCount = Math.max(Math.floor(visibleWidth / this.widthAtIndex(0), 1));
    columnCount = columnCount > 0 ? columnCount : 1;
    const rows = Math.ceil(length / columnCount);
    const totalHeight = rows * this.heightAtIndex(0);

    return totalHeight;
  }
}
