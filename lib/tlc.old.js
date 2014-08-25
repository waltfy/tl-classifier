// dependencies
var DecisionTree = require('decision-tree');
var csvjson = require('csvjson');
var divide = require('divide');
var fs = require('fs');

// vars
var data,
    headers = {};

/**
 * Separates the data into a training set and a validation set.
 *
 * @param data, `Array`. JSON array containing transcation rows.
 * @param ratio, (0.75). `Number`. Optional value between 0 and 1, set to determine the split between training and validation sets.
 */
var getHeaders = function (data) {
  return (data.constructor === Array) ? Object.keys(data[0]) : null; // columns
};

/**
 * Separates the data into a training set and a validation set.
 *
 * @param data, `Array`. JSON array containing transcation rows.
 * @param ratio, (0.75). `Number`. Optional value between 0 and 1, set to determine the split between training and validation sets.

 */
var splitData = function (data, ratio) {
  ratio = (typeof ratio !== 'undefined' && ratio.constructor === Number) ? ratio : 0.75; // sets ratio default
  var result = {};
  var split = divide.ratio(data, ratio);
  result.t_set = split[0]; // training set
  result.v_set = split[1]; // validation set
  return result;
};

/**
 * prepareTrainingSet() processes set prior to training
 *
 * @param headers <Object> the input and output fields to be set
 */
var prepare = function () {
  console.time('prepared training set');
  data.t_set.forEach(function (r, i) {
    var row = {};
    row.input = {};
    row.output = {};

    headers.input.forEach(function (attr) {
      row.input[attr + '-' + r[attr]] = 1;
    });

    headers.output.forEach(function (attr) {
      if (r[attr] !== '') row.output[attr + '-' + r[attr]] = 1;
    });

    data.t_set[i] = row;
  });
  console.timeEnd('prepared training set');
};

/**
 * train() wrapper around brain.net.train
 *
 */
var train = function () {
  prepare();
};

/**
 * validate() validates the neural network
 *
 * @param headers <Object> the input and output fields to be set
 * @param accuracy <Number> minimum accuracy to be obtained, in order to assure quality of classification
 */
var validate = function () {
  console.time('validated');

  data.v_set.forEach(function (r, i) {
    var input = {};
    headers.input.forEach(function (attr) {
      input[attr + '-' + r[attr]] = 1;
    });
    console.log(input);
    var result = net.run(input);
    console.log("expected TAX_RATE_CODE:", r.TAX_RATE_CODE);
    for (var k in result) {
      if (result[k] > 0.5) {
        console.log('\t', k, ' – ', (result[k] * 100).toFixed(2) + '%');
      }
    }
  });
  console.timeEnd('validated');
};

/**
 * init() initialises the classifier
 *
 * @param csv <String> file path to the csv file
 */
var init = function (csv) {
  // converts the data to json, then splits the result into training set and validation set
  console.time('initialised');
  data = splitData(csvjson.toObject('./data.csv').output);
  console.timeEnd('initialised');
  // console.log('training_set:', data.t_set.length, 'validation set:', data.v_set.length);
};

module.exports = {
  init: init,
  run: function (headers) {
    train();
    validate();
  }
}
