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
   
      for(var j = 0; j < headers.length; j++){
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
    
    return result; //JavaScript object
    // return JSON.stringify(result); //JSON
  }

  var Tester = React.createClass({
    getInitialState: function () {
      return { output: null, confidence: null }
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

      var createHeaders = function (attr) {
        return <th>{attr}</th>
      };

      var createFields = function (attr) {
        return <td><input onChange={self.handleChange.bind(self, attr)} type='text' /></td>
      };

      return (
        <div>
          <p>4. Input some data and see the results.</p>
          <table>
            <thead>
              <tr>
                {this.props.features.map(createHeaders)}
                <th>{this.props.outputClass}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {this.props.features.map(createFields)}
                <td><input type='text' readOnly value={this.state.output} /></td>
                <td><input type='text' readOnly value={this.state.confidence} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    }
  });

  var Trainer = React.createClass({
    render: function () {
      return (
        <div>
          <p>3. <button onClick={this.props.train}>Train</button> the classifier.</p>
          <p>{this.props.accuracy ? 'Accuracy: ' + (this.props.accuracy * 100).toFixed(0) + '%' : ''}</p>
          <p>{this.props.timeTaken ? 'Time(ms): ' + (this.props.timeTaken) + 'ms' : ''}</p>
          <hr />
        </div>
      )
    }
  });

  var AttrDefiner = React.createClass({
    render: function () {

      var self = this;

      var createRow = function (attr, i) {
        return (
          <tr key={i}>
            <td>{attr}</td>
            <td><input type='radio' name={attr} value='input'/></td>
            <td><input type='radio' name={attr} value='output'/></td>
          </tr>
        );
      };

      return (
        <div>
          <p>2. Select the attributes in order to determine an output.</p>
          <table>
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Input</th>
                <th>Output</th>
              </tr>
            </thead>
            <form onChange={this.props.setCategory} >
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
      var files = e.target.files; // FileList object
  
      var reader = new FileReader();

      reader.onload = (function (file, ctx) {
        return function (e) {
          var json = csvJSON(e.target.result);
          ctx.props.setData(json);
        };
      })(files[0], this);

      reader.readAsText(files[0]);
    },
    render: function () {
      return (
        <div>
          <p>1. Please select a csv <input type='file' accept='.csv' onChange={this.onChange} /></p>
          <hr />
        </div>
      );
    }
  });

  var App = React.createClass({
    getInitialState: function () {
      return { data: [], headers: {}, accuracy: null, timeTaken: null, features: [], outputClass: '' }
    },
    reset: function (e) {
      e.preventDefault();
      console.debug('resetting application');
    },
    train: function (e) {
      e.preventDefault();
      var headers = this.state.headers,
          outputClass = null,
          features = [];


      Object.keys(this.state.headers).forEach(function (attr) {
        if (headers[attr] === 'input') {
          features.push(attr);
        }

        if (headers[attr] === 'output') {
          outputClass = attr;
        }
      });

      var start = Date.now();
      var accuracy = tlc.init(this.state.data, outputClass, features);
      var end = Date.now();
      this.setState({ accuracy: accuracy, time: (end - start), features: features, outputClass: outputClass });
    },
    setHeaders: function (data) {
      var headers = {};
      Object.keys(data[0]).forEach(function (attr) {
        headers[attr] = null;
      });
      this.setState({ headers: headers });
    },
    setCategory: function (e) {
      var headers = this.state.headers;
      headers[e.target.name] = e.target.value;
      this.setState({ headers: headers });
    },
    setData: function (data) {
      var self = this;
      this.setState({ data: data }, function () {
        self.setHeaders(self.state.data);
      });
    },
    render: function () {
      var state = this.state;
      return (
        <div>
          <button onClick={ this.reset } >Reset</button>
          <h1>{this.props.fileSupport ? 'TaxLogic Classifier Prototype' : 'Your browser does not support this demo.' }</h1>
          <DataLoader setData={ this.setData } />
          <AttrDefiner headers={ state.headers } setCategory={ this.setCategory } />
          <Trainer train={this.train} accuracy={state.accuracy} timeTaken={state.time}/>
          <Tester outputClass={state.outputClass} features={state.features}/>
        </div>
      );
    }
  });

  // checks for file reader support
  var supportsFileReader = (window.File !== 'undefined' && window.FileReader !== 'undefined' && window.FileList !== 'undefined' && window.Blob !== 'undefined');
  React.renderComponent(<App fileSupport={supportsFileReader} />, window.TLC_APP);

})(window);