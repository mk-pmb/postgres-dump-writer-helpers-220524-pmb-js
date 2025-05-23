// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import isStr from 'is-string';

import adviseOnPgDataTypes from './adviseOnPgDataTypes.mjs';
import basics from './basics.mjs';
import pgTypeAliases from './pgTypeAliases.mjs';


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
  const tblFullNameQ = quoteId(opt.schemaName) + '.' + quoteId(tblName);

  let code = '';
  if (opt.dropTable) {
    code += ('DROP TABLE IF EXISTS ' + tblFullNameQ
      + (opt.dropCascade ? ' CASCADE' : '') + ';\n');
  }
  if (code) { code += '\n'; }

  code += 'CREATE TABLE ' + tblFullNameQ + ' (\n';

  if (opt.primKeyName) {
    code += ('    ' + quoteId(opt.primKeyName)
      + ' ' + opt.primKeyType + ' PRIMARY KEY,');
  }

  function indexLike(h, c, n, t) {
    return (h + quoteId(tblName + '_' + c.join('_')) + n
      + c.map(quoteId).join(', ') + t);
  }

  const allColNames = [];
  allColNames.quoted = [];
  let extraIndexes = '';
  Object.keys(colsSpec || false).forEach(function addCol(cName) {
    let cSpec = colsSpec[cName];
    if (!cSpec) { return; }
    if (isStr(cSpec)) { cSpec = EX.parseColSpecStr(cSpec, cName); }
    addCategListItem(autoComboUniques, cSpec.autoUniqueGroup, cName);
    if (allColNames.length) { code += ','; }
    allColNames.push(cName);
    const quotedColName = quoteId(cName);
    allColNames.quoted.push(quotedColName);
    code += ('\n    ' + quotedColName + ' ' + cSpec.pgType
      + (cSpec.required ? ' NOT NULL' : ''));
    if (cSpec.indexAlgo) {
      extraIndexes += ('CREATE INDEX ' + quoteId(tblName + '_' + cName)
        + ' ON ' + tblFullNameQ + ' USING ' + cSpec.indexAlgo
        + ' (' + quotedColName + ');\n');
    }
  });
  allColNames.quoted.glued = allColNames.quoted.join(', ');

  Object.values(autoComboUniques).forEach(function addAU(colNames) {
    code += indexLike(',\n    CONSTRAINT ', colNames, ' UNIQUE (', ')');
  });

  code += ') WITH (oids = false);\n';
  code += extraIndexes;
  code += EX.noDuplicateRows(opt.noDuplicateRows,
    { tblName, tblFullNameQ, allColNames });











  return code;
};


Object.assign(EX, {

  dfOpt: {
    schemaName: 'public',
    tableNamePrefix: '',
    dropTable: true,
    dropCascade: true, // also DROP anything that would prevent DROPping.
    primKeyName: 'pg_row_id',
    primKeyType: 'serial',
  },


  parseColSpecStr(s, n) {
    const [simplifiedTypeName, ...simplifiedTypeFlags] = s.split(/\s+/);
    const pgType = pgTypeAliases(simplifiedTypeName);
    const ignoredAdvice = [];
    const colSpec = {
      pgType,
      required: true,
    };
    function colSet(k, v) { colSpec[k] = v; }
    simplifiedTypeFlags.forEach(function parseExtras(x) {
      if (x === '?') { return colSet('required', false); }
      if (x === 'B') { return colSet('indexAlgo', 'btree'); }
      const f = x.slice(0, 1);
      const y = x.slice(1);
      if (f === '¹') { return colSet('autoUniqueGroup', y || n); }
      if (f === '!') { return ignoredAdvice.push(y); }
      const e = ('Unsupported column type modifier '
        + quoteStr(x) + ' for column ' + quoteStr(n));
      throw new Error(e);
    });
    adviseOnPgDataTypes.fatal({
      ignore: ignoredAdvice,
      trace: 'Column "' + n + '":',
    }, pgType);
    return colSpec;
  },


  noDuplicateRows(optNoDupes, st) {
    /* I'd have loved to enable optNoDupes by default, but it's rather
      difficult (see `avoiding_dupe_rows.md` for why), so currently we
      can only do it for very easy tables. */
    let algo = optNoDupes;
    if (!algo) { return ''; }
    if (algo === true) { algo = 'BTREE'; }
    const { tblName, tblFullNameQ, allColNames } = st;
    const idxBaseName = tblName + '_no_duplicate_rows_';
    const idxNameQ = quoteId(idxBaseName + 'index');
    const chkNameQ = quoteId(idxBaseName + 'check');
    let code = '';
    code += ('CREATE INDEX ' + idxNameQ + ' ON ' + tblFullNameQ
      + '\n    USING ' + algo + ' (' + allColNames.quoted.glued + ');\n');
    code += ('ALTER TABLE ' + tblFullNameQ + ' ADD CONSTRAINT ' + chkNameQ
      + '\n    UNIQUE (' + allColNames.quoted.glued + ');\n');
    return code;
  },


});


export default EX;
