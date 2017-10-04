"use strict";

const UINT64 = require('cuint/lib/uint64');

let debug = function () {};
try {
  debug = require('debug')('m3u8parse');
} catch (err) {}

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

// AttrList's are currently handled without any implicit knowledge of key/type mapping
function ParseAttrList(input) {
  // TODO: handle newline escapes in quoted-string's
  const re = /(.+?)=((?:\".*?\")|.*?)(?:,|$)/g;
  let match, attrs = {};

  while ((match = re.exec(input)) !== null) {
    attrs[match[1].toLowerCase()] = match[2];
  }

  debug('parsed attributes', attrs);
  return attrs;
}

function StringifyAttrList(attrs) {
  let res = '';

  for (let key in attrs) {
    let value = attrs[key];
    if (value !== undefined && value !== null) {
      // TODO: sanitize attr values?
      let comma = (res.length !== 0) ? ',' : '';
      res += `${comma}${key.toUpperCase()}=${value}`;
    }
  }

  return res;
}

function AttrList(attrs) {
  if (!(this instanceof AttrList)) {
    return new AttrList(attrs);
  }

  if (typeof attrs === 'string') {
    attrs = ParseAttrList(attrs);
  }

  for (let attr in attrs) {
    let value =  attrs[attr] || '';
    this[attr] = value.toString();
  }
}

// no validation is performed on these helpers and they never fail on invalid input
Object.defineProperties(AttrList.prototype, {
  decimalInteger: { value: function(attrName, value) {
    let name = attrName.toLowerCase();
    if (arguments.length > 1) {
      if (Buffer.isBuffer(value)) {
        if (value.length) {
          this[name] = new UINT64(value.toString('hex'), 16).toString(10);
        } else {
          this[name] = '0';
        }
      } else {
        this[name] = '' + Math.floor(value);
      }
    }
    try {
      let stringValue = new UINT64(this[name] || '0').toString(16);
      stringValue = ((stringValue.length & 1) ? '0' : '') + stringValue;
      return new Buffer(stringValue, 'hex');
    } catch (e) {
      return new Buffer();
    }
  }},

  hexadecimalInteger: { value: function(attrName, value) {
    let name = attrName.toLowerCase();
    if (arguments.length > 1) {
      if (Buffer.isBuffer(value)) {
        if (value.length) {
          let hexValue = value.toString('hex');
          this[name] = '0x' + (hexValue[0] === '0' ? hexValue.slice(1) : hexValue);
        } else {
          this[name] = '0x0';
        }
      } else {
        this[name] = '0x' + Math.floor(value).toString(16);
      }
    }
    let stringValue = (this[name] || '0x').slice(2);
    stringValue = ((stringValue.length & 1) ? '0' : '') + stringValue;
    return new Buffer(stringValue, 'hex');
  }},

  decimalIntegerAsNumber: { value: function(attrName, value) {
    let name = attrName.toLowerCase();
    if (arguments.length > 1) {
      this.decimalInteger(name, value);
    }

    let intValue = parseInt(this[name], 10);
    if (intValue > MAX_SAFE_INTEGER) {
      return Number.POSITIVE_INFINITY;
    }
    return intValue;
  }},

  hexadecimalIntegerAsNumber: { value: function(attrName, value) {
    let name = attrName.toLowerCase();
    if (arguments.length > 1) {
      this.hexadecimalInteger(name, value);
    }

    let intValue = parseInt(this[name], 16);
    if (intValue > MAX_SAFE_INTEGER) {
      return Number.POSITIVE_INFINITY;
    }
    return intValue;
  }},

  decimalFloatingPoint: { value: function(attrName, value) {
    let name = attrName.toLowerCase();
    if (arguments.length > 1) {
      this[name] = '' + value;
    }
    return parseFloat(this[name]);
  }},

  signedDecimalFloatingPoint: { value: function(attrName, value) {
    let name = attrName.toLowerCase();
    if (arguments.length > 1) {
      this[name] = '' + value;
    }
    return parseFloat(this[name]);
  }},

  quotedString: { value: function(attrName, value) {
    let name = attrName.toLowerCase();
    if (arguments.length > 1) {
      this[name] = '"' + value + '"';
    }
    let val = this[name];
    return val ? val.slice(1, -1) : undefined;
  }},

  enumeratedString: { value: function(attrName, value) {
    let name = attrName.toLowerCase();
    if (arguments.length > 1) {
      this[name] = value;
    }
    return this[name];
  }},

  decimalResolution: { value: function(attrName, value) {
    let name = attrName.toLowerCase();
    if (arguments.length > 1) {
      value = value || {};
      this[name] = '' + Math.floor(value.width) + 'x' + Math.floor(value.height);
    }
    let res = /^(\d+)x(\d+)$/.exec(this[name]);
    if (res === null) {
      return undefined;
    }
    return { width: parseInt(res[1], 10), height: parseInt(res[2], 10) };
  }},
});

Object.defineProperty(AttrList.prototype, 'toString', {
  value: function() {
    return StringifyAttrList(this);
  }
});

module.exports = AttrList;
