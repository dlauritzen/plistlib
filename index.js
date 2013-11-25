
var _ = require('underscore');
var fs = require('fs');
var async = require('async');
var xml = require('xml');
var xmlParser = require('node-xml');

function printNode(n) {
	console.log(n);
	if (n.children.length) {
		console.log('>>');
		_.each(n.children, printNode);
		console.log('<<');
	}
}

exports.debug = function(doc) {
	_.each(doc.children, printNode);
}

exports.load = function(filename, done) {
	var parser = new xmlParser.SaxParser(function(cb) {

		// plist model
		var obj = null;
		var objStack = [];
		var currentObj = null;

		// xml model
		var document = null;
		var parent = null;
		var current = null;
		var previous = null;

		cb.onStartDocument(function() {
			// console.log('Start document');
			document = { parent: null, children: [], text: '' };
			parent = document;
		});
		
		cb.onEndDocument(function() {
			// console.log('End document');
			done(null, obj);
		});
		
		cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
			// console.log('Start element ' + elem);
			var tmp = {
				name: elem,
				// attrs: attrs,
				// prefix: prefix,
				// uri: uri,
				// namespaces: namespaces,
				text: '',
				parent: null,
				children: []
			}

			if (current) {
				tmp.parent = current;
				current = tmp;
				parent = current.parent;
			}
			else {
				tmp.parent = parent;
				current = tmp;
			}

			if (parent) {
				parent.children.push(current);
			}

			if (parent.name == 'plist' && _.isNull(obj)) {
				// "root" plist object
				if (current.name == 'dict') {
					obj = {};
				}
				else if (current.name == 'array') {
					obj = [];
				}
				currentObj = obj;
				objStack = [];
			}
			else if (current.name == 'dict') {
				objStack.push(currentObj);
				var parentObj = currentObj;
				currentObj = {}
				// console.log('Adding dict. Parent obj:');
				// console.log(parentObj);
				if (parent && parent.name == 'array') {
					// console.log('Adding unnamed dict.');
					parentObj.push(currentObj);
				}
				else if (parent && parent.name == 'dict') {
					// console.log('Adding dict ' + previous.text);
					parentObj[previous.text] = currentObj;
				}
				// console.log(parentObj);
			}
			else if (current.name == 'array') {
				objStack.push(currentObj);
				var parentObj = currentObj;
				currentObj = [];
				if (parent && parent.name == 'array') {
					// console.log('Adding unnamed array');
					parentObj.push(currentObj);
				}
				else if (parent && parent.name == 'dict') {
					// console.log('Adding array ' + previous.text);
					parentObj[previous.text] = currentObj;
				}
				// console.log(parentObj);
			}
			else if (current.name == 'true') {
				if (parent && parent.name == 'array') {
					currentObj.push(true);
				}
				else if (parent && parent.name == 'dict') {
					currentObj[previous.text] = true;
				}
			}
			else if (current.name == 'false') {
				if (parent && parent.name == 'array') {
					currentObj.push(false);
				}
				else if (parent && parent.name == 'dict') {
					currentObj[previous.text] = false;
				}
			}
		});
		
		cb.onEndElementNS(function(elem, prefix, uri) {
			// console.log('End element ' + elem);
			if (current.parent) {
				current = current.parent;
				parent = current.parent;
				previous = current.children[current.children.length - 1]; // last
			}
			else {
				current = null;
				parent = null;
			}

			if (elem == 'dict' || elem == 'array') {
				currentObj = objStack.pop();
				// console.log('Popped item');
			}
		});
		
		cb.onCharacters(function(chars) {
			// console.log('Text: ' + chars);
			if (!current) return;
			else {
				current.text += chars.trim();
			}

			if (current.name == 'string') {
				if (parent && parent.name == 'array') {
					// element of array
					currentObj.push(current.text);
				}
				else if (previous && previous.name == 'key') {
					// value of key
					if (current.name == 'string') {
						currentObj[previous.text] = current.text;
					}
				}
			}
		});
		
		cb.onCdata(function(cdata) {
		});
		
		cb.onComment(function(msg) {
		});
		
		cb.onWarning(function(msg) {
		});
		
		cb.onError(function(msg) {
		});
	});

	parser.parseFile(filename);
}

function addItem(item, parent) {
	if (_.isString(item) || _.isNumber(item)) {
		parent.push({ string: item });
	}
	else if (_.isArray(item)) {
		var arr = [];
		_.each(item, function(e) {
			addItem(e, arr);
		});
		parent.push({ array: arr });
	}
	else if (_.isObject(item)) {
		var dict = [];
		_.each(item, function(value, key) {
			dict.push({ key: key });
			addItem(value, dict);
		});
		parent.push({ dict: dict});
	}
	else if (_.isBoolean(item)) {
		if (item) {
			parent.push({ true: ''});
		}
		else {
			parent.push({ false: ''});
		}
	}
	else {
		console.log('Unexpected item: ' + item);
	}
}

exports.save = function(filename, data, done) {
	var xmlObj = { dict: [] };
	_.each(data, function(value, key) {
		if (value) {
			xmlObj.dict.push({ key: key });
			addItem(value, xmlObj.dict);
		}
	});
	var xmlStr = xml(xmlObj, { indent: "\t" }).replace(/<true><\/true>/g, "<true/>").replace(/<false><\/false>/g,"<false/>");
	var out = fs.createWriteStream(filename);
	out.write('<?xml version="1.0" encoding="UTF-8"?>\n', 'utf8');
	out.write('<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n', 'utf8');
	out.write('<plist version="1.0">\n', 'utf8');
	out.write(xmlStr, 'utf8');
	out.write('\n</plist>\n', 'utf8');
	out.end(done);
}
