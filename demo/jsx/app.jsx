/** @jsx React.DOM */
var TLC_APP = (function () {

  var tlc = require('../../lib/tlc');

  /**
   * csvToJSON() takes a csv and returns a POJO
   *
   * csv      String - the csv string to be converted
   * returns  Object - representation of the csv as a POJO
   */
  function csvToJSON(csv) {

    function trim(str) {
      return str.trim();
    }

    var result = [];
    var lines = csv.split("\n");
    var headers = lines[0].split(",").map(trim);

    for (var i = 1; i < lines.length; i++){

      var obj = {};
      var currentline = lines[i].split(",").map(trim);

      for (var j = 0; j < headers.length; j++){
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }

    return result; // POJO
    // return JSON.stringify(result); // JSON
  }

  /** Handles the logic for testing the decision tree */
  var Tester = React.createClass({

    render: function () {

      var self = this;

      var createHeaders = function (attr, i) {
        return <th key={ i }>{ attr }</th>;
      };

      var createFields = function (attr, i) {
        return <td key={ i } ref={ attr }><input onChange={ self.props.setFeature.bind(self, attr) } type='text' /></td>;
      };

      return (
        <div>
          <p>4. Upload some data or enter it yourself and see the classifier in action. <DataLoader load={ this.props.load }/></p>
          <p>{ this.props.accuracy ? 'Accuracy: ' + (this.props.accuracy * 100).toFixed(0) + '%' : '' }</p>
          <table>
            <thead>
              <tr>
                { this.props.features.map(createHeaders) }
                <th>{ this.props.output || 'Output' }</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                { this.props.features.map(createFields) }
                <td><input type='text' readOnly value={ this.props.outputValue } /></td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  });

  /** Handles the logic for training the decision tree */
  var Trainer = React.createClass({
    render: function () {
      var props = this.props;

      return (
        <div>
          <p>3. <button onClick={ props.train }>Train</button> the classifier.</p>
          <p> {props.timeTaken ? 'Training Time(ms): ' + (props.timeTaken) + 'ms' : '' }</p>
          <hr />
        </div>
      );
    }
  });

  /** Handles the logic for selecting attributes as input or output */
  var AttributePicker = React.createClass({

    render: function () {
      var self = this;

      var createRow = function (attr, i) {
        var props = self.props;
        var item = props.headers[attr];
        var isOutput = (props.output === attr);

        return (
          <tr key={ i }>
            <td>{ attr }</td>
            // if is output or input do not show the opposite option
            <td>{ isOutput ? '' : <input type='checkbox' value={ attr } onChange={ props.setInput } checked={ item.selected }/> }</td>
            <td>{ item.selected ? '' : <input type='radio' value={ attr } name='output' onChange={ props.setOutput } checked={ isOutput }/> }</td>
          </tr>
        );
      };

      return (
        <div>
          <p>2. Select the attributes in order to determine an output. <button onClick={ this.props.setOutput } value={null}>Clear Output</button>.</p>
          <table>
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Input</th>
                <th>Output</th>
              </tr>
            </thead>
            <form>
              <tbody>
                { console.time('attribut selector loaded') }
                { Object.keys(this.props.headers).map(createRow) }
                { console.timeEnd('attribut selector loaded') }
              </tbody>
            </form>
          </table>
          <hr />
        </div>
      );
    }
  });

  /** Responsible for loading in the file */
  var DataLoader = React.createClass({
    onChange: function (e) {
      e.preventDefault();

      var reader = new FileReader();
      var files = e.target.files; // FileList object

      reader.onload = (function (file, ctx) {
        return function (e) {
          ctx.props.load(csvToJSON(e.target.result));
        };
      })(files[0], this);
      try {
        reader.readAsText(files[0]);
      } catch (err) {
        console.error('No file chosen');
      }
    },

    render: function () {
      return <input type='file' accept='.csv' onChange={ this.onChange } />;
    }
  });

  /** Top Level Component */
  var App = React.createClass({

    defaults : {
      data: [],
      headers: {},
      output: null,
      outputValue: null,
      accuracy: null,
      timeTaken: null,
      classifier: null,
      features: []
    },

    getInitialState: function () {
      return this.defaults;
    },

    /** resets the state of the application */
    reset: function (e) {
      var shouldReset = confirm('Are you sure you want to reset the state of the application?');
      if (shouldReset) {
        console.time('resetting TL-Classifier');
        this.setState(this.defaults);
        console.timeEnd('resetting TL-Classifier');
      }
    },

    /** responsible for training the classifier */
    train: function (e) {
      var state = this.state;
      var output = state.output;
      var features = state.features;

      if (!output) return alert('You must set a target value (i.e. output).');
      if (!features.length) return alert('You must select at least one input value');

      var start = Date.now();
      var classifier = tlc.train(this.state.data, output, features);
      var end = Date.now();

      this.setState({ classifier: classifier, timeTaken: (end - start), features: features });
    },

    classify: function () {
      var classifier = this.state.classifier;
      var features = this.state.features;
      var headers = this.state.headers;
      var c = {};

      features.forEach(function (attr) {
        c[attr] = headers[attr].value;
      });

      var predicted = tlc.classify(classifier, c);
      this.setState({ outputValue: predicted });
    },

    /**
     * setHeaders() retrieves the headers from a dataset
     *
     * data       Array - the data to be processed
     * content    Anything - the value for each key in the object returned
     * returns    Array - the headers in the desired format
     */
    setHeaders: function (data, content) {
      var headers = {};
      content = (typeof content !== 'undefined') ? content : {}; // sets default for content
      // picks a sample row and extracts the keys, setting it to an object
      Object.keys(data[0]).forEach(function (attr) {
        headers[attr.trim()] = Object.create(content); // create a new object for each header
      });
      return headers;
    },

    // sets the value of a feature in order to classify
    setFeature: function (attr, e) {
      var headers = this.state.headers;
      headers[attr].value = e.target.value;
      this.setState({ headers: headers }, this.classify);
    },

    // returns all selected input
    getFeatures: function () {
      var headers = this.state.headers;
      return Object.keys(headers).filter(function (attr) {
        return headers[attr].selected;
      });
    },

    // setInput() handles the change of checkboxes for each attribute
    setInput: function (e) {
      var headers = this.state.headers;
      headers[e.target.value].selected = e.target.checked;
      this.setState({ headers: headers, features: this.getFeatures() });
    },

    // setOutput() handles the change of radio button for output
    setOutput: function (e) {
      this.setState({ output: e.target.value });
    },

    // loadTrainingData() handles the loading of the dataset, and is responsible for adding it to the state
    loadTrainingData: function (data) {
      this.setState({ data: data, headers: this.setHeaders(data, { selected: false, value: null }) });
    },

    loadTestData: function (data) {
      var classifier = this.state.classifier;
      this.setState({ testData: data }, this.evaluateTestData);
    },

    evaluateTestData: function () {
      var classifier = this.state.classifier;
      if (!this.state.data) alert('You must uploaded and trained the classifier first');
      this.setState({ accuracy: classifier.evaluate(this.state.testData) });
    },

    render: function () {
      var state = this.state;
      return (
        <div>
          <button onClick={ this.reset }>Reset</button>
          <h1>{ this.props.fileSupport ? 'TaxLogic Classifier Prototype' : 'Your browser does not support this demo.' }</h1>
          <p>1. Upload a csv file containing the training data. <DataLoader load={ this.loadTrainingData }/></p>
          <hr />
          <AttributePicker headers={ state.headers } output={ state.output } setInput={ this.setInput } setOutput={ this.setOutput }/>
          <Trainer train={ this.train } accuracy={ state.accuracy } timeTaken={ state.timeTaken }/>
          <Tester accuracy={ this.state.accuracy } load={ this.loadTestData } output={ state.output } outputValue={ state.outputValue } features={ state.features } setFeature={ this.setFeature } classifier={ this.classifier }/>
        </div>
      );
    }
  });

  // checks for file reader support
  var supportsFileReader = (window.File !== 'undefined' && window.FileReader !== 'undefined' && window.FileList !== 'undefined' && window.Blob !== 'undefined');

  console.time('initalising TL-Classifier');
  React.renderComponent(<App fileSupport={supportsFileReader} />, window.TLC_APP);
  console.timeEnd('initalising TL-Classifier');


})(window);