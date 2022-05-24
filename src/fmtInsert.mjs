// -*- coding: utf-8, tab-width: 2 -*-

import basics from './basics.mjs';

const doNothing = Boolean;


const EX = function fmtInsert(rec, ...merge) {
  if (merge.length) { return EX(Object.assign({}, rec, ...merge)); }
  const cols = Object.keys(rec).filter(k => /^[a-z]/.test(k));
  const colNamesGlued = cols.map(basics.quoteId).join(', ');
  const insHead = ('INSERT INTO ' + basics.quoteId(rec.TABLE)
    + ' (' + colNamesGlued + ')');
  const valuesQuoted = cols.map(c => basics.quoteVal(rec[c]));
  const valuesGlued = '(' + valuesQuoted.join(', ') + ')';
  const insFull = (insHead + ' VALUES ' + valuesGlued + ';');
  (rec.PRINT || doNothing)(insFull);
  if (rec.STREAM) {
    rec.STREAM.appendGluedRecord({
      head: insHead,
      headDescr: 'Column names list',
      neck: ' VALUES\n',
      valuesGlued,
    });
  }
  return insFull;
};






export default EX;
