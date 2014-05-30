/* dependencies */
var brain = require('brain');
var net = new brain.NeuralNetwork();

/* constants */
var SPLIT_RATIO = 0.25;

/* data */
var data = require('csv-to-json').parse('./training_set.csv'); // parsing entry data to json
var headers = (data.constructor === Array) ? Object.keys(data[0]) : null; // columns
var t_set = data.slice(0, SPLIT_RATIO * data.length); // training set
var v_set = data.slice(SPLIT_RATIO * data.length); // validation set



// net.train([
// 	{ input: { st_us: 1, sf_uk: 1 }, output: { TAX_EXT: 1 } },
//         { input: { st_uk: 1, sf_us: 1 }, output: { TAX_EXT: 1 } },
//         { input: { st_us: 1, sf_us: 1 }, output: { TAX_INT: 1 } },
//         { input: { st_uk: 1, sf_uk: 1 }, output: { TAX_INT: 1 } },
// ]);

// var test = net.run({st_fr: 1, sf_uk: 1});
// console.log(test);