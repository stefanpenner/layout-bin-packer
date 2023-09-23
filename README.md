# Layout Bin Packer [![CI](https://github.com/stefanpenner/layout-bin-packer/actions/workflows/main.yml/badge.svg)](https://github.com/stefanpenner/layout-bin-packer/actions/workflows/main.yml)

This library provides the algorithms a list or grid rendering implementation would need for efficient placement of incrementally rendered elements.

**Included Algorithms**

* **SHELF-NF** (shelf next fit): for rendering elements whos dimensions vary, but are known ahead of time.
* **Fixed:** for rendering elements whos dimensions do not vary but are known ahead of time.

**What about my favorite Algorithm?**

If you favorite Algorithm can be implemented as a subclass of https://github.com/stefanpenner/layout-bin-packer/blob/master/lib/layout-bin-packer/bin.js we would love to consider a PR adding it to our collection.

**Can this library run in my favorite enviroment?**
If that environment runs modern JavaScript, then most likely yes.
Officially the library only runs tests on Node.js and Browser, but given it's implementation it should work work (or easily be made to work) in other JavaScript environments... But let us know!

#### Developing

* `yarn build` build project
* `yarn test` run tests
* `yarn test:browser` run tests in browser
