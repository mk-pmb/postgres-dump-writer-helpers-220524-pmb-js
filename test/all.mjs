// -*- coding: utf-8, tab-width: 2 -*-

import 'usnam-pmb';
import pTapeAllInList from 'p-tape-all-in-list';

import pgDumpWriter from '../src/index.mjs';

import insertFruitNamesTests from './insertFruitNames.mjs';

pTapeAllInList({
  extraApi: { pgDumpWriter },
}, [
  ...insertFruitNamesTests,
]);
