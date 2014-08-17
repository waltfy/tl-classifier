// dependencies 
var DecisionTree = require('decision-tree');
var divide = require('divide');

var classifier = {};

// TODO validate the data for veryfing accuracyg

/**
 * splitData() 
 */
// var splitData = function (json, ratio) {
//   ratio = (typeof ratio !== 'undefined' && ratio.constructor === Number) ? ratio : 0.75; // sets ratio default
//   return divide.ratio(json, ratio);
// };

/**
 * splitData() 
 */
var init = function (json, className, features) {
  if (typeof json === 'undefined') throw new Error('JSON not present');
  var json = divide.ratio(json, 0.75);

  try {
    classifier = new DecisionTree(json[0], className, features);    
  } catch (e) {
    console.debug(e);
  }

  try {
    var accuracy = classifier.evaluate(json[1]);
  } catch (e) {
    debugger;
    console.debug(e);
  }
  
  // return accuracy;
  return 1;
};

module.exports = {
  init: init,
  classify: function (obj) {
    var result;
    try {
      result = classifier.predict(obj);
      console.log('result', result);
    } catch (e) {
      console.debug('could not classify, RETRAIN');
      // console.log(e);
    } finally {
      return result;
    }
  }
}