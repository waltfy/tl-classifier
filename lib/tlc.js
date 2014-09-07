// dependencies
var DecisionTree = require('decision-tree');
var divide = require('divide');

/**
 * validate() validates each row and attribute for the data set
 *
 * data Array - the data set
 * @return return type description
 */
var validate = function (data, target, features) {
  console.log('validate() ====================');
  var toValidate = features.concat(target);

  console.time('validating');
  toValidate.forEach(function (attribute) {
    data.forEach(function (item, i) {
      var curr = item[attribute];
      if (!curr || curr === '' || curr.length === 0) {
        console.log('isEmpty ====================');
        data.splice(i, 1);
      }
    });
  });
  console.timeEnd('validating');
};

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
  // validating arguments
  if (typeof data === 'undefined') throw new Error('A data set is required.');
  if (typeof target === 'undefined') throw new Error('A target class is required.');
  if (typeof features === 'undefined') throw new Error('A set of features is required.');

  var classifier;
  var accuracy = null;
  validate(data, target, features);

  try {
    classifier = new DecisionTree(data, target, features);
  } catch (e) {
    console.error('error classifying:', e);
  }

  return classifier;
};

module.exports = {
  train: train,
  classify: function (classifier, obj) {
    var result;
    console.log('classify() ====================');
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
