// -*- coding: utf-8, tab-width: 2 -*-

import nodeFs from 'fs';

import loMapValues from 'lodash.mapvalues';

import fmtInsert from './fmtInsert.mjs';
import stmtStream from './stmtStream.mjs';


const EX = function makeFileMappedSqlWriter(opt) {
  const wr = {
    destFilePathTemplate: ['', '.sql'],
    activeTableStreams: new Map(),
    ...opt,
  };
  loMapValues(EX.api, function bindApi(v, k) { wr[k] = v.bind(null, wr); });
  return wr;
};


EX.api = {

  writeRec(wr, rec) {
    const pgStream = wr.getOrStartTableFile(rec.TABLE);
    fmtInsert(rec, { STREAM: pgStream });
  },


  getOrStartTableFile(wr, tbl) {
    const ats = wr.activeTableStreams;
    const has = ats.get(tbl);
    if (has) { return has; }
    const destFilePath = wr.destFilePathTemplate.join(tbl);
    const fileStream = nodeFs.createWriteStream(destFilePath);
    const pgStream = stmtStream.fromNativeWriteStream(fileStream);
    ats.set(tbl, pgStream);
    return pgStream;
  },


  endAll(wr) {
    const ats = wr.activeTableStreams;
    ats.forEach(pgStream => pgStream.end());
    ats.clear();
  },


};





export default EX;
