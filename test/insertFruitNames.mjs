// -*- coding: utf-8, tab-width: 2 -*-

import equal from 'equal-pmb';

const tbl = 'fruit_names';


export default [

  function insertFruitNamesSingle(t) {
    t.plan(1);
    const rec = { id: 11, fruit: 'apple' };
    const query = t.pgDumpWriter.fmtInsert({ TABLE: tbl, ...rec });
    const want = ('INSERT INTO "fruit_names" ("id", "fruit") VALUES'
      + " (11, 'apple');");
    t.equal(query, want);
  },

  function insertFruitNamesBatch(t) {
    t.plan(1);
    const recs = [
      { id: 11, fruit: 'apple' },
      { id: 22, fruit: 'banana' },
      { id: 33, fruit: 'cherry' },
      { id: 44, fruit: 'date' },
      { id: 55, fruit: 'etrog' },
      { id: 66, fruit: 'fig' },
      { id: 77, fruit: 'guava' },
      { id: 88, fruit: 'huckleberry' },
    ];
    const streamOpts = {
      maxRecPerStmt: 3,
    };
    const queries = t.pgDumpWriter.fmtInsert.batches(tbl, recs, streamOpts);
    const head = 'INSERT INTO "fruit_names" ("id", "fruit") VALUES¶';
    const want = [
      "(11, 'apple'),¶(22, 'banana'),¶(33, 'cherry');",
      "(44, 'date'),¶(55, 'etrog'),¶(66, 'fig');",
      "(77, 'guava'),¶(88, 'huckleberry');",
    ].map(w => (head + w).replace(/¶/g, '\n  '));
    equal.lists(queries, want);
    t.same(queries, want);
  },


];
