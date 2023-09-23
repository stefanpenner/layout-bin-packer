import Entry from './entry';


function throwMustImplement(name) {
  throw new TypeError("MustImplement: " + name);
}

export function rangeError(length, index) {
  throw new RangeError(`Parameter must be within: [${0} and ${length}) but was: ${index}`);
}

// I don't think this should have args
export default class Bin {
  constructor(content, width = 0) {
    this.width = width;
    this.content = content;
  }

  objectAt(collection, index) {
    return collection[index];
  }

  length() {
    return this.content.length;
  }

  // maximum offset of content wrt to viewport
  // The amount by which content (after being layed out) is taller than
  // the viewport.
  maxContentOffset(width, height) {
    return Math.max(this.height(width) - height, 0);
  }

  heightAtIndex(index) {
    return this.content[index].height;
  }

  widthAtIndex(index) {
    return this.content[index].width;
  }


  // abstract: return coordinates of element at index.
  //
  // @param index: index of the element in content
  // @param width: viewport width.
  // @returns {x, y} coordinates of element at index.
  //
  // May reset cached viewport width.
  position() {
    throwMustImplement('position');
  }

  // abstract: reset internal state to be anchored at index.
  // @param index: index of the element in content
  flush() {
    throwMustImplement('flush');
  }

  // abstract: return total content height given viewport width.
  // @param width: viewport width
  //
  // May reset cached viewport width.
  height() {
    throwMustImplement('height');
  }

  // abstract: true if layout places more than one object on a line.
  isGrid() {
    throwMustImplement('isGrid');
  }

  // abstract: returns number of elements in content.
  // abstract: returns index of first visible item.
  // @param topOffset: scroll position
  // @param width: width of viewport
  // @param height: height of viewport
  //
  visibleStartingIndex() {
    throwMustImplement('visibleStartingIndex');
  }

  // abstract: returns number of items visible in viewport.
  // @param topOffset: scroll position
  // @param width: width of viewport
  // @param height: height of viewport
  numberVisibleWithin() {
    throwMustImplement('numberVisibleWithin');
  }
}

