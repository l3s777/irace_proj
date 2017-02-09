'use strict';

app.service('FileParser', function () {
  // Globals
  var fs = require('fs');
  var app2 = require('electron').remote;
  var dialog = app2.dialog;

  this.parseIraceTestElitesFile = function(path) {

		var data = fs.readFileSync(path, 'utf8');
		if (!data) dialog.showErrorBox('Error', 'Unable to open file: ' + path);

		var lines = data.trim().split('\n'),
			iterations = [],
			tokens = [];

		lines.forEach(function(l, lindex) {
      // console.log(l);
			if(lindex > 0) {
				tokens = l.split(' ');
				tokens.forEach(function (t, tindex) {
          if (tindex > 0) {
						if (!iterations[tindex - 1]) {
							iterations[tindex - 1] = [];
						}
						iterations[tindex - 1].push(t);
					}
				});
			}
		});
    console.log(iterations);
		return iterations;
	};
});
