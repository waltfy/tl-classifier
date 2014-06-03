// dependencies 
var DecisionTree = require('decision-tree');
// var csvjson = require('csvjson');
var divide = require('divide');
// var fs = require('fs');

var classifier = {};

var splitData = function (json, ratio) {
  ratio = (typeof ratio !== 'undefined' && ratio.constructor === Number) ? ratio : 0.75; // sets ratio default
  return divide.ratio(json, ratio);
};

var init = function (json, className, features) {
  // var json = csvjson.toObject('./test_data.csv').output;
  classifier = new DecisionTree(json, className, features);
  var accuracy = classifier.evaluate(splitData(json)[1]);
  if (accuracy < 0.9) throw new Error('Accuracy below 90%');
  else return accuracy;
};

module.exports = {
  init: init,
  classify: function (obj) {
    var result;
    try {
      result = classifier.predict(obj);
    } catch (e) {
      console.log(e);
    } finally {
      return result;
    }
  }
}