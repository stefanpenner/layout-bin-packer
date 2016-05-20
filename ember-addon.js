var path = require('path');

module.exports = {
  name: 'layout-bin-packer',
  init: function () {
    this._super.apply(this, arguments);
    this.treePaths.addon = 'lib/layout-bin-packer';
  },
  treeFor: function (name) {
    // ensure only the addon module tree is processed
    if (name === 'addon') {
      return this._super.treeFor.apply(this, arguments);
    }
  }
};
