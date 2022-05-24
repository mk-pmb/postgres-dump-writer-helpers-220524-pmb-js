// -*- coding: utf-8, tab-width: 2 -*-

import equal from 'equal-pmb';

const namedEqual = equal.named.deepStrictEqual;


const EX = {

  fromNativeWriteStream(wriSt) {
    return Object.assign(Object.create(this), {
      getNativeStream() { return wriSt; },
      appendRaw(x) { return wriSt.write(x); },
      nRecTotal: 0,
      curStmt: false,
    });
  },

  maxRecPerStmt: 800,

  endCurrentStatement() {
    const stm = this;
    const cur = stm.curStmt;
    stm.curStmt = false;
    if (!cur) { return; }
    stm.appendRaw(';\n\n');
  },

  appendGluedRecord(how) {
    const stm = this;
    const {
      head,
      headDescr,
      neck,
      valuesGlued,
      ...other
    } = how;
    const badOpt = Object.keys(other).join(', ');
    if (badOpt) { throw new Error('Unsupported option(s): ' + badOpt); }

    let cur = stm.curStmt;
    if (cur) {
      const forSt = ' for stream ' + String(stm.name || stm);
      namedEqual((headDescr || 'Statement head') + forSt, cur.head, head);
      stm.appendRaw(',\n');
    } else {
      cur = {
        head,
        nRec: 0,
        maxMoreRec: stm.maxRecPerStmt,
      };
      stm.curStmt = cur;
      stm.appendRaw(head);
      stm.appendRaw(neck);
    }

    stm.appendRaw('  ');
    stm.appendRaw(valuesGlued);
    stm.nRecTotal += 1;
    if (cur.maxMoreRec >= 1) {
      cur.nRec += 1;
      cur.maxMoreRec -= 1;
    } else {
      stm.endCurrentStatement();
    }
  },

  end() {
    const stm = this;
    stm.endCurrentStatement();
    stm.getNativeStream().end();
  },

};


export default EX;
