
# plistlib

Node.js plist parser and writer. By Dallin Lauritzen.

## Install

Install using NPM

`npm install plistlib`

## API

There are currently only two useful methods exposed by the module. `load` and `save`. Both are shown in the example below.

``` javascript
var plistlib = require('plistlib');

plistlib.load('in.plist', function(err, plist) {
    // plist is a JavaScript object. All values are strings.

    plistlib.save('out.plist', plist, function(err) {
    	// The plist is now saved to out.plist
    });
});
```
