var t = require('tap').test;
var tlc = require('../');

t('my test', function (t) {
  tlc.init('../training_set.csv');
  tlc.getContext();
  t.end();
});