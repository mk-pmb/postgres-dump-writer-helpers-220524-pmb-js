// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import isStr from 'is-string';

import basics from './basics.mjs';


const { quoteId, quoteStr } = basics;


function addCategListItem(d, k, i) {
  if (!k) { return; }
  const o = getOwn(d, k);
  d[k] = (o ? [...o, i] : [i]); // eslint-disable-line no-param-reassign
}


const EX = function fmtCreateSimpleTable(tblNamePart, colsSpec, customOpt) {
  const opt = { ...EX.dfOpt, ...customOpt };
  const autoComboUniques = {};

  const tblName = opt.tableNamePrefix + tblNamePart;
  const seqName = tblName + '_' + opt.seqColName + '_seq';

  let code = '';
  if (opt.dropTable) {
    code += 'DROP TABLE IF EXISTS ' + quoteId(tblName) + ';\n';
  }
  if (opt.addSeqCol) {
    if (opt.dropSeq) {
      code += 'DROP SEQUENCE IF EXISTS ' + quoteId(seqName) + ';\n';
    }
    code += ('CREATE SEQUENCE ' + quoteId(seqName)
      + ' INCREMENT 1'
      + ' MINVALUE ' + opt.seqColMin
      + ' MAXVALUE ' + opt.seqColMax
      + ' CACHE 1;\n');
  }
  if (code) { code += '\n'; }

  const tblFullNameQ = quoteId(opt.schemaName) + '.' + quoteId(tblName);
  code += 'CREATE TABLE ' + tblFullNameQ + ' (\n';
  if (opt.addSeqCol) {
    code += ('    ' + quoteId(opt.seqColName)
      + ' serial DEFAULT nextval(' + quoteStr(seqName) + ') NOT NULL,\n');
  }

  function indexLike(h, c, n, t) {
    return (h + quoteId(tblName + '_' + c.join('_')) + n
      + c.map(quoteId).join(', ') + t);
  }

  let extraIndexes = '';
  Object.keys(colsSpec || false).forEach(function addCol(cName) {
    let cSpec = colsSpec[cName];
    if (!cSpec) { return; }
    if (isStr(cSpec)) { cSpec = EX.parseColSpecStr(cSpec, cName); }
    addCategListItem(autoComboUniques, cSpec.autoUniqueGroup, cName);
    code += ('    ' + quoteId(cName) + ' ' + cSpec.type
      + (cSpec.required ? ' NOT NULL' : '') + ',\n');
    if (cSpec.indexAlgo) {
      extraIndexes += ('CREATE INDEX ' + quoteId(tblName + '_' + cName)
        + ' ON ' + tblFullNameQ + ' USING ' + cSpec.indexAlgo
        + ' (' + quoteId(cName) + ');\n');
    }
  });

  Object.values(autoComboUniques).forEach(function addAU(colNames) {
    code += indexLike('    CONSTRAINT ', colNames, ' UNIQUE (', '),\n');
  });

  code += ('    CONSTRAINT ' + quoteId(tblName + '_pkey')
    + ' PRIMARY KEY (' + quoteId(opt.seqColName) + ')\n'
    + ') WITH (oids = false);\n');

  code += extraIndexes;











  return code;
};


Object.assign(EX, {

  dfOpt: {
    schemaName: 'public',
    tableNamePrefix: '',
    dropTable: true,
    addSeqCol: true,
    dropSeq: true,
    seqColName: 'pg_row_id',
    seqColMin: 1,
    seqColMax: (2 ** 31) - 1,
  },


  typeAlias: Object.assign(function a(t) { return getOwn(a, t, t); }, {
    'char*': 'character varying',
    ts: 'timestamptz',
  }),


  parseColSpecStr(s, n) {
    const l = s.split(/\s+/).filter(Boolean);
    const t = EX.typeAlias(l.shift());
    const c = {
      type: t,
      required: true,
    };
    l.forEach(function parseExtras(x) {
      if (x === '?') {
        c.required = false;
        return;
      }
      if (x === 'B') {
        c.indexAlgo = 'btree';
        return;
      }
      if (x.startsWith('¹')) {
        c.autoUniqueGroup = (x.slice(1) || n);
        return;
      }
      const e = ('Unsupported column type modifier '
        + quoteStr(x) + ' for column ' + quoteStr(n));
      throw new Error(e);
    });
    return c;
  },


});


export default EX;
