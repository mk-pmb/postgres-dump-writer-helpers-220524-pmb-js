// -*- coding: utf-8, tab-width: 2 -*-

import basics from './basics.mjs';
import fmtCreateSimpleTable from './fmtCreateSimpleTable.mjs';
import fmtInsert from './fmtInsert.mjs';
import makeFileMappedSqlWriter from './makeFileMappedSqlWriter.mjs';
import stmtStream from './stmtStream.mjs';

const EX = {
  ...basics,
  fmtCreateSimpleTable,
  fmtInsert,
  makeFileMappedSqlWriter,
  stmtStream,
};


export default EX;
