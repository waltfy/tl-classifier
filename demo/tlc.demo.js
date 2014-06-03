console.debug('TLC DEMO');

var tlc = require('../lib/tlc');
var table = document.getElementById('classify_attr').getElementsByTagName('tbody')[0];
var data = null;

var setData = function (json) {
  data = json;
};

//var csv is the CSV file with headers
function csvJSON (csv) {
 
  var lines=csv.split("\n");
 
  var result = [];
 
  var headers=lines[0].split(",");
 
  for(var i=1;i<lines.length;i++){
 
    var obj = {};
    var currentline=lines[i].split(",");
 
    for(var j=0;j<headers.length;j++){
      obj[headers[j]] = currentline[j];
    }
 
    result.push(obj);
 
  }
  
  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  console.debug('access to files... OK');
} else {
  console.debug('access to files... FAILED');
}

var createRadioButton = function (group, value) {
  var input = document.createElement("input");
  input.type = 'radio';
  input.name = group;
  input.value = value;
  return input;
};

var renderTable = function () {
  table.innerHTML = '';
  var arr = Object.keys(data[0]);
  for (var i in arr) {
    var row = table.insertRow(table.rows.length);
    var attr = row.insertCell(0);
    var input = row.insertCell(1);
    var output = row.insertCell(2);
    row.id = 'row_' + i;
    attr.innerHTML = arr[i];
    // input type="radio" name="group1" value="Milk"> Milk<br>
    ;
    input.appendChild(createRadioButton(row.id, 'input'));
    output.appendChild(createRadioButton(row.id, 'output'));
  }
};

var handleFileSelect = function (e) {
  var files = e.target.files; // FileList object
  
  var reader = new FileReader();
  reader.readAsText(files[0]);

  reader.onload = (function (file) {
    return function (e) {
      var json = JSON.parse(csvJSON(e.target.result));
      setData(json);
      renderTable();
    };
  })(files[0]);
};

var trainDecisionTree = function () {
  var rows = table.rows;
  if (rows.length === 0) return alert('No data to be trained');
  var input = [],
      output = null;

  for (var i = 0; i < rows.length; i++) {
    var cells = rows[i].cells;
    for (var j = 0; j < cells.length; j++) {
      var radio = cells[j].getElementsByTagName('input')[0];
      if (typeof radio !== 'undefined' && radio.checked) {
        if (radio.value === 'input') {
          input.push(cells[0].innerHTML);
        } else {
          output = cells[0].innerHTML;
        }
      }
    }
  }
  var start = Date.now();
  var accuracy = tlc.init(data, output, input);
  var end = Date.now();
  document.getElementById('results').innerHTML = "<p>Trained in: " + (end - start) + "ms</p><p>Accuracy: " + (accuracy * 100).toFixed(0) + "%</p>";
};

document.getElementById('files').addEventListener('change', handleFileSelect, false);
document.getElementById('train').addEventListener('click', trainDecisionTree, false);