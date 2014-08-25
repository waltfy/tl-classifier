// dependencies
var DecisionTree = require('decision-tree');
var divide = require('divide');

var classifier;

/**
 * train() trains the decision tree given a data set
 *
 * data       Array - data set to be used to train and evaluate the Decision Tree
 * target     String - attribute to be classified
 * features   Array - list of attributes used to train the decision tree
 *
 * returns    Object - the current classifier.
 */
var train = function (data, target, features) {
  // FIXME ensure that we have not empty fields on the data, this will cause us trouble while classifying
  // validating arguments
  if (typeof data === 'undefined') throw new Error('A data set is required.');
  if (typeof target === 'undefined') throw new Error('A target class is required.');
  if (typeof features === 'undefined') throw new Error('A set of features is required.');

  var accuracy = null;
  data = divide.ratio(data, 0.66);

  try {
    classifier = new DecisionTree(data[0], target, features);
  } catch (e) {
    console.debug('error classifying:', e);
  }

  try {
    // TODO validate the data for veryfing accuracy.
    accuracy = classifier.evaluate(data[1]);
  } catch (e) {
    console.debug('error evaluating accuracy', e);
  }

  // return accuracy;
  return accuracy;
};

module.exports = {
  train: train,
  classify: function (obj) {
    var result;
    console.log('classifier:', classifier);
    try {
      result = classifier.predict(obj);
      console.log('result ->', result);
    } catch (e) {
      console.debug('could not classify, RETRAIN');
      // console.log(e);
    } finally {
      return result;
    }
  }
};
