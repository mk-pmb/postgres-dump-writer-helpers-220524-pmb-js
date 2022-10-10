// -*- coding: utf-8, tab-width: 2 -*-

import equal from 'equal-pmb';

const namedEqual = equal.named.deepStrictEqual;

function initStream(prototype, impl, userOverrides) {
  return Object.assign(Object.create(prototype), {
    nRecTotal: 0,
    curStmt: false,
  }, impl, userOverrides);
};


const EX = {

  fromNativeWriteStream(wriSt, userOverrides) {
    const origStm = this;
    return initStream(origStm, {
      appendRaw(x) { return wriSt.write(x); },
      end() {
        origStm.end.call(this);
        wriSt.end();
      },
    }, userOverrides);
  },

  makeStringArray(userOverrides) {
    const origStm = this;
    return initStream(origStm, {
      stmtPadEnd: '',
      stmts: [],
      buf: '',
      appendRaw(x) { this.buf += x; },
      endCurrentStatement() {
        origStm.endCurrentStatement.call(this);
        this.stmts.push(this.buf);
        this.buf = '';
      },
    }, userOverrides);
  },

  maxRecPerStmt: 800,
  stmtPadEnd: '\n\n',

  endCurrentStatement() {
    const stm = this;
    const cur = stm.curStmt;
    stm.curStmt = false;
    if (!cur) { return; }
    stm.appendRaw(';');
    const { stmtPadEnd } = stm;
    if (stmtPadEnd) { stm.appendRaw(stmtPadEnd); }
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
    cur.nRec += 1;
    cur.maxMoreRec -= 1;
    const canMore = (cur.maxMoreRec >= 1);
    // console.debug('stmtStream add', { canMore }, stm);
    if (!canMore) { stm.endCurrentStatement(); }
  },

  end() {
    const stm = this;
    stm.endCurrentStatement();
    // console.debug('stmtStream end', stm);
  },

};


export default EX;
