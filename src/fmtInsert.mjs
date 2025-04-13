// -*- coding: utf-8, tab-width: 2 -*-

import basics from './basics.mjs';
import stmtStream from './stmtStream.mjs';

const doNothing = Boolean;


const EX = function fmtInsert(rec, ...merge) {
  if (merge.length) { return EX(Object.assign({}, rec, ...merge)); }
  const cols = Object.keys(rec).filter(k => /^[a-z]/.test(k));
  const slots = (rec.SLOTS || false);
  const colNamesGlued = cols.map(basics.quoteId).join(', ');
  const insHead = ('INSERT INTO ' + basics.quoteId(rec.TABLE)
    + ' (' + colNamesGlued + ')');
  const valueEncoder = (slots ? basics.makeSlotifier(slots) : basics.quoteVal);
  const valuesQuoted = cols.map(c => valueEncoder(rec[c]));
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


Object.assign(EX, {

  batches(tableName, recOrRecs, streamOpts) {
    const pgStream = stmtStream.makeStringArray(streamOpts);
    const ovr = { TABLE: tableName, STREAM: pgStream };
    [].concat(recOrRecs).forEach(rec => EX({ ...rec, ...ovr }));
    pgStream.end();
    return pgStream.stmts;
  },


});



export default EX;
