// -*- coding: utf-8, tab-width: 2 -*-

import equal from 'equal-pmb';

const namedEqual = equal.named.deepStrictEqual;


const isoTimestampRgx = new RegExp(('^'
  + '(²²-²-²)'
  + 'T'
  + '(²:²:²)'
  + '(?:\\.\\d+|)'
  + '(Z|[\+\-]²:²)'
  + '$').replace(/²/g, '\\d\\d'), '');
const safeIdRgx = /^\w+$/;


const EX = {

  timestampFromIsoFmt(orig) {
    const m = isoTimestampRgx.exec(orig);
    if (!m) { throw new Error('Unsupported date format: ' + orig); }
    return (m[1] + 'T' + m[2] + m[3]);
  },

  quoteId(id) {
    const safe = (safeIdRgx.exec(id || '') || false)[0];
    if (id === safe) { return '"' + id + '"'; }
    throw new Error('Identifier contains suspicious characters: ' + id);
  },

  quoteStr(s) { return "'" + String(s || '').replace(/'/g, "''") + "'"; },

  quoteVal(x) {
    if (x === null) { return 'NULL'; }
    if (x === undefined) { return 'NULL'; }
    const t = typeof x;
    if (t === 'string') { return EX.quoteStr(x); }
    if ((t === 'number') && Number.isFinite(x)) { return String(x); }
    if ((t === 'object') && x) {
      const j = JSON.stringify(x);
      namedEqual('Object decoded from JSON', JSON.parse(j), x);
      return EX.quoteStr(j);
    }
    throw new TypeError('Unsupported value type: ' + t);
  },

};





export default EX;
