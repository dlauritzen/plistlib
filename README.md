
# plistlib

Node.js plist parser and writer. By Dallin Lauritzen.

## Install

Install using NPM

`npm install plistlib`

## Parsed Objects

The object structure returned from the `load` methods and expected as the parameter
for `save` and `toString` is a tree structure made of "type"/"value" dictionary pairs.

All the supported plist value types are detailed below.

### String

``` xml
<string>Hello</string>
```

becomes

``` javascript
{ type: 'string', value: 'Hello' }
```

### Integer

``` xml
<integer>123</integer>
```

becomes

``` javascript
{ type: 'integer', value: 123 }
```

### Array

``` xml
<array>
	<string>Cat</string>
</array>
```

becomes

``` javascript
{
	type: 'array',
	value: [
		{ type: 'string', value: 'Cat' }
	]
}
```

### Dict

``` xml
<dict>
	<key>A</key>
	<string>B</string>
</dict>
```

becomes

``` javascript
{
	type: 'dict',
	value: {
		A: { type: 'string', value: 'B' }
	}
}
```

### Nesting

Types can nest, so here's a fancier example.

``` xml
<dict>
	<key>Array Of Dicts</key>
	<array>
		<dict>
			<key>A</key>
			<string>B</string>
			<key>C</key>
			<integer>4</integer>
		</dict>
	</array>
</dict>
```

becomes

``` javascript
{
	type: 'dict',
	value: {
		"Array Of Dicts": {
			type: 'array',
			value: [
				{
					type: 'dict',
					value: {
						A: { type: 'string', value: 'B' },
						C: { type: 'integer', value: 4 }
					}
				}
			]
		}
	}
}
```

## API

``` javascript
var plistlib = require('plistlib');

// Load or save a file
plistlib.load('in.plist', function(err, plist) {
    // plist is a JavaScript object.

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
