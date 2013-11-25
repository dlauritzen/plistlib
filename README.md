
# plistlib

Node.js plist parser and writer. By Dallin Lauritzen.

## Install

Install using NPM

`npm install plistlib`

## API

``` javascript
var plistlib = require('plistlib');

// Load or save a file
plistlib.load('in.plist', function(err, plist) {
    // plist is a JavaScript object. All values are strings.

    plistlib.save('out.plist', plist, function(err) {
    	// The plist is now saved to out.plist
    });
});

// You can also parse in-memory buffers and strings
plistlib.loadString(s, function(err, plist) { /* ... */ });
plistlib.loadBuffer(b, function(err, plist) { /* ... */ });

// Output to a string instead of a file. This method is synchronous
var content = plistlib.toString(plist);
```
