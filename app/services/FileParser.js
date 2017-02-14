'use strict';

app.service('FileParser', function () {
  // Globals
  var fs = require('fs');
  var app2 = require('electron').remote;
  var dialog = app2.dialog;

  this.parseIraceTestElitesFile = function(path) {

		var data = fs.readFileSync(path, 'utf8');
		if (!data) dialog.showErrorBox('Error', 'Unable to open file: ' + path);

    var lines = data.trim().split('\n');

    var tokens = [];
    var bar_i = lines[0].split(' ').length;
    var bar_j = lines.length;

    var iterations = [];
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
		return iterations;
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
