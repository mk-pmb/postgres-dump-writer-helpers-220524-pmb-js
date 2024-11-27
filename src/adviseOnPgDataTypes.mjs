// -*- coding: utf-8, tab-width: 2 -*-

import isStr from 'is-string';


function keysWithTruthyValues(o) {
  return Object.entries(o).map(([k, v]) => (v && k)).filter(Boolean);
}


const EX = function adviseOnPgDataTypes(opt, pgType) {
  if (isStr(opt)) { throw new TypeError('"opt" must be an object or false.'); }
  if (!opt) { return EX(true, pgType); }
  const a = {};
  if (pgType.startsWith('timestamp')) {
    if (!pgType.includes('tz')) {
      a.tsTz = ('should use a time zone!'
        + ' Otherwise, TZ offsets in the input will be silently discarded!'
        + ' Despite the type name, the TZ will only be used for conversions,'
        + ' and will not really be saved, so it will not cost more bytes.');
      // Postgres v17 docs, ch. 8.5.3. "Time Zones"
    }
    if (!pgType.includes('(')) {
      a.tsFrac = ('should specify the number of digits for fractional seconds'
        + ' for a more reliable output format.');
    }
  }
  let { ignore } = opt;
  if (ignore) {
    if (!Array.isArray(ignore)) { ignore = keysWithTruthyValues(ignore); }
    ignore.forEach(k => delete a[k]);
  }
  return (Object.keys(a).length && a);
};


Object.assign(EX, {

  fatal(opt, pgType) {
    let a = EX(opt, pgType);
    if (!a) { return; }
    a = Object.keys(a).sort().map(k => (a[k] + ' [' + k + ']'));
    a = (a.length >= 2 ? ['', ...a].join('\n    • ') : ' ' + (a[0] || ''));
    const { trace } = opt || false;
    a = (trace || '(unspecified column):') + a;
    throw new Error(a);
  },





});


export default EX;
