// dependencies
var DecisionTree = require('decision-tree');
var divide = require('divide');

// TODO validate the data for veryfing accuracyg

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
  // validate
  if (typeof data === 'undefined') throw new Error('A data set is required.');
  if (typeof target === 'undefined') throw new Error('A target class is required.');
  if (typeof features === 'undefined') throw new Error('A set of features is required.');

  data = divide.ratio(data, 0.75);

  try {
    classifier = new DecisionTree(data[0], target, features);
  } catch (e) {
    console.debug(e);
  }

  try {
    var accuracy = classifier.evaluate(data[1]);
  } catch (e) {
    console.debug(e);
  }

  // return accuracy;
  return 1;
};

module.exports = {
  train: train,
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
};
