// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';

const EX = Object.assign(function a(t) { return getOwn(a, t, t); }, {

  'char*': 'character varying',

  ts:       'timestamptz(3)', // default = match JavaScript's Date precision.
  ts_sec:   'timestamptz(0)',
  ts_micro: 'timestamptz(6)',
  ts_milli: 'timestamptz(3)',
  // ts_nano:  'timestamptz(9)', // beyond pg's time precision.


});


export default EX;
