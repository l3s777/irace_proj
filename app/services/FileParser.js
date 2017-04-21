'use strict';

app.service('FileParser', function () {
  // Globals
  var fs = require('fs');
  var app2 = require('electron').remote;
  var dialog = app2.dialog;

  this.parseIraceTestElitesFile = function(path) {
    var iterations = [];
    if(path) {
      var data = fs.readFileSync(path, 'utf8');
      // TODO action when data is null
  		if (!data) dialog.showErrorBox('Error', 'Unable to open file: ' + path);

      var lines = data.trim().split('\n');

      var tokens = [];
      var bar_i = lines[0].split(' ').length;
      var bar_j = lines.length;


      for(var x = 0; x < bar_i; x++){
          iterations[x] = [];
          for(var y = 0; y < bar_j; y++){
              iterations[x][y] = 0;
          }
      }

      lines.forEach(function(l, lindex) {
        tokens = l.split(' ');
        tokens.forEach(function(t, tindex) {
          iterations[tindex][lindex] = parseInt(t);
        });
      });
    } else console.log("parseIraceTestElitesFile: path not found");
		return iterations;
	};

  this.parseIraceFrequencyFile = function(path) {

		var data = fs.readFileSync(path, 'utf8');
		if (!data) dialog.showErrorBox('Error', 'Unable to open file: ' + path);

    // reading each line from the file
    var lines = data.trim().split('\n');
    var tokens = [];
    var values_co = [];
    var values_ir = [];
    var result = {
      "co" : [],
      "ir" : []
    };

    var isCorO = false;
    var setYvalues = false;
    var setCorO = false;

    var isRorI = false;
    var setRorI = false;

    var param, type, x_values, y_values, values;
    lines.forEach(function(l) {

      if(l[0] != "#") { // first line with # is reference
        tokens = l.split(' ');

        if(isRorI) {
          values = tokens;
          setRorI = true;
          isRorI = false;
        }

        if(setYvalues) { // set values in Y
          y_values = tokens;
          isCorO = false;
          setYvalues = false;
          setCorO = true;
        }

        if(isCorO) { // set values in X
          x_values = tokens;
          setYvalues = true;
        }

        if(tokens[0] === "parameter") {
          param = tokens[1];
        }
        if(tokens[0] === "type") {
          type = tokens[1];
          if(type === "c" || type === "o") {
            isCorO = true;
          }
          if(type === "i" || type === "r") {
            isRorI = true;
          }
        }

        if(setCorO) {
          // console.log("setting value for C or O");
          var paramObj = {
                  "param": param, // undefined?
                  "type": type,
                  "x_values": x_values,
                  "y_values": y_values
          };
          values_co.push(paramObj);
          setCorO = false;
        }

        // R or I
        if(setRorI) {
          // console.log("setting value for R or I");
          var paramObj = {
                  "param": param, // undefined?
                  "type": type,
                  "values": values
          };
          values_ir.push(paramObj);
          setRorI = false;
        }
      }
    });
    result = {
      "co" : values_co,
      "ir" : values_ir
    } ;

    return result;
	};

  this.parseIraceKendallFile = function(path) {

		var data = fs.readFileSync(path, 'utf8');
		if (!data) dialog.showErrorBox('Error', 'Unable to open file: ' + path);

    var lines = data.trim().split('\n');
    var kendallArray = [];

    lines.forEach(function(line) {
      var items = line.split(',');
      // TODO check what to do when NA && NaN
      if(items[1]==="NA" || items[1]==="NaN") {
        // TODO change... just for testing
        var aux = {
          t: items[0],
          v: 0
        };
      } else {
        var aux = {
          t: items[0],
          v: items[1]
        };
      }

      kendallArray.push(aux);
		});

    return kendallArray;

	};
});
