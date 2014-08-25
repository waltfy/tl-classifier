/** @jsx React.DOM */
var TLC_APP = (function () {

  var tlc = require('../../lib/tlc');

  function csvJSON (csv) {

    var lines = csv.split("\n");

    var result = [];

    var headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++){

      var obj = {};
      var currentline = lines[i].split(",");

      for (var j = 0; j < headers.length; j++){
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }

    return result; // POJO
    // return JSON.stringify(result); // JSON
  }

  var Tester = React.createClass({

    getInitialState: function () {
      return { output: null };
    },

    classify: function () {
      var input = {},
          self = this;

      this.props.features.forEach(function (attr) {
        input[attr] = self.state[attr+'_val'];
      });

      this.setState({output: tlc.classify(input)});
    },

    handleChange: function (attr, e) {
      var st = {};
      st[attr+'_val'] = e.target.value;
      this.setState(st, this.classify);
    },

    render: function () {

      var self = this;

      var createHeaders = function (attr, i) {
        return <th key={ i }>{ attr }</th>;
      };

      var createFields = function (attr, i) {
        return <td key={ i }><input onChange={ self.handleChange.bind(self, attr) } type='text' /></td>;
      };

      return (
        <div>
          <p>4. Input some data and see the results.</p>
          <table>
            <thead>
              <tr>
                {this.props.features.map(createHeaders)}
                <th>{this.props.outputClass || 'Output'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {this.props.features.map(createFields)}
                <td><input type='text' readOnly value={this.state.output} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  });

  var Trainer = React.createClass({
    render: function () {
      var props = this.props;
      console.log('props:', props);
      return (
        <div>
          <p>3. <button onClick={props.train}>Train</button> the classifier.</p>
          <p>{props.accuracy ? 'Accuracy: ' + (props.accuracy * 100).toFixed(0) + '%' : ''}</p>
          <p>{props.timeTaken ? 'Training Time(ms): ' + (props.timeTaken) + 'ms' : ''}</p>
          <hr />
        </div>
      );
    }
  });

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
            <td>{ isOutput ? '' : <input type='checkbox' value={ attr } onChange={ props.setInput } checked={ item.selected }/> }</td>
            <td>{ item.selected ? '' : <input type='radio' value={ attr } name='output' onChange={ props.setOutput } checked={ isOutput } /> }</td>
          </tr>
        );
      };

      return (
        <div>
          <p>2. Select the attributes in order to determine an output. <button onClick={ this.props.setOutput } value={null}>Clear Output</button></p>
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
                { Object.keys(this.props.headers).map(createRow) }
              </tbody>
            </form>
          </table>
          <hr />
        </div>
      );
    }
  });

  var DataLoader = React.createClass({
    onChange: function (e) {
      e.preventDefault();

      var reader = new FileReader();
      var files = e.target.files; // FileList object

      reader.onload = (function (file, ctx) {
        return function (e) {
          var json = csvJSON(e.target.result);
          ctx.props.loadData(json);
        };
      })(files[0], this);

      reader.readAsText(files[0]);
    },

    render: function () {
      return (
        <div>
          <p>1. Please select a csv <input type='file' accept='.csv' onChange={ this.onChange } /></p>
          <hr />
        </div>
      );
    }
  });

  var App = React.createClass({
    getInitialState: function () {
      return {
        data: [],
        headers: {},
        output: null,
        accuracy: null,
        timeTaken: null,
        features: []
      };
    },

    reset: function (e) {
      console.debug('should reset the application');
    },

    train: function (e) {
      var state = this.state;
      var headers = state.headers,
          output = state.output;

      var features = Object.keys(state.headers).filter(function (attr) {
        return state.headers[attr].selected;
      });

      var start = Date.now();
      var accuracy = tlc.train(this.state.data, output, features);
      var end = Date.now();
      this.setState({ accuracy: accuracy, timeTaken: (end - start), features: features });
    },

    /**
     * getHeaders() retrieves the headers from a dataset
     *
     * data       Array - the data to be processed
     * content    Anything - the value for each key in the object returned
     * returns    Array - the headers in the desired format
     */
    getHeaders: function (data, content) {
      var headers = {};
      content = (typeof content !== 'undefined') ? content : {}; // sets default for content
      // picks a sample row and extracts the keys, setting it to an object
      Object.keys(data[0]).forEach(function (attr) {
        headers[attr.trim()] = Object.create(content); // create a new object for each header
      });
      return headers;
    },

    // setInput() handles the change of checkboxes for each attribute
    setInput: function (e) {
      var headers = this.state.headers;
      headers[e.target.value].selected = e.target.checked;
      this.setState({ headers: headers });
    },

    // setOutput() handles the change of radio button for output
    setOutput: function (e) {
      this.setState({ output: e.target.value });
    },

    // loadData() handles the loading of the dataset, and is responsible for adding it to the state
    loadData: function (data) {
      this.setState({ data: data, headers: this.getHeaders(data, { selected: false }) });
    },

    render: function () {
      var state = this.state;
      return (
        <div>
          <button onClick={ this.reset }>Reset</button>
          <h1>{ this.props.fileSupport ? 'TaxLogic Classifier Prototype' : 'Your browser does not support this demo.' }</h1>
          <DataLoader loadData={ this.loadData } />
          <AttributePicker headers={ state.headers } output={ state.output } setInput={ this.setInput } setOutput={ this.setOutput } />
          <Trainer train={ this.train } accuracy={ state.accuracy } timeTaken={ state.timeTaken }/>
          <Tester outputClass={ state.outputClass } features={ state.features }/>
        </div>
      );
    }
  });

  // checks for file reader support
  var supportsFileReader = (window.File !== 'undefined' && window.FileReader !== 'undefined' && window.FileList !== 'undefined' && window.Blob !== 'undefined');

  // mount the app
  React.renderComponent(<App fileSupport={supportsFileReader} />, window.TLC_APP);

})(window);
