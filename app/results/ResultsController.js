app.controller('ResultsController', ['$rootScope', '$scope', '$mdDialog', 'FileParser', '$interval', function($rootScope, $scope, $mdDialog, FileParser, $interval) {

  // imports
  var app2 = require('electron').remote;
  var dialog = app2.dialog;
  var fs = require('fs');
  var mpath = require('path');
  // graphics controls
  var d3 = require("d3");

  // Execute commands
  const os = require('os');
  var sys = require('util');
  var exec = require('child_process').exec;
  var child;

  $scope.scenario = {
    "name": '',
    "parameters": [],
    "constraints": [],
    "candidates": {},
    "instances":{},
    "targetrunner": "",
    "irace_params": []
  };

  $scope.scenario.name = $rootScope.scenario;
  var workingPath = $rootScope.running_path;

  $scope.results = {
    "iterations": 0,
    "candidates": 0,
    "instances": 0,
    "evaluations": 0,
    "time": 0
  };

  $scope.candidates_best = [];
  $scope.d3ParallelCoordinatesPlotData = '';

  $scope.readData = function() {
    // lunch R script
    var summaryPath = "../assets/files/summary.R";
    fs.readFile(summaryPath, 'utf8', function(err, data) {
      if (err) {
        throw err;
        console.log(err);
      }

      var execCommand = "Rscript " + data + " irace.Rdata " +  " output.txt ";
      console.log(execCommand);

      child = exec(execCommand,
              function (error, stdout, stderr) {
                console.log("exec");
                if(stderr) {
                  // dialog.showErrorBox("Error", stderr);
                  console.log('stderr: ' + stderr);
                }
              });
    });

    var resultsPath = workingPath + "/output.txt";
    console.log(resultsPath);

    if (fs.existsSync(resultsPath)) {
      // VALIDATE if path were created
      $scope.results = scanResultsData(resultsPath);

      // CANDIDATES
      console.log(workingPath);
      console.log(resultsPath);
      scanFileReturnPath(workingPath, resultsPath);
      // table
      var pathCandidateResults = workingPath + "/task-candidates_result.txt";
      // parallel candidates
      if (fs.existsSync(pathCandidateResults)) {
        scanDataTable(workingPath + "/task-candidates_result.txt");
        $scope.d3ParallelCoordinatesPlotData = pathCandidateResults;
      }

      // task frequency
      // scanFileReturnTaskFrequencyPath(workingPath, resultsPath);
      var path_freq = workingPath + "/task-frequency_result.txt";
      if (fs.existsSync(path_freq)) {
        $scope.d3Candidates = FileParser.parseIraceFrequencyFile(path_freq);
        // BarPlot for Categorical and Ordinal
        $scope.d3BarPlotDataV = $scope.d3Candidates.co;
        // Kernel Density Estimation
        $scope.d3DensityPlotDataV = $scope.d3Candidates.ir;
        $scope.d3DensityPlotDataV = help();
      }

      // # Iteration configurations
      // scanFileIterationsResults(workingPath, resultsPath);
    }
  };

  function scanResultsData(filename) {
    if(filename) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          throw err;
          console.log(err);
        }

        var lines = data.split('\n');
        var output = [];
        var cnt = 0;
        lines.forEach(function(line) {
          if(cnt < 6) {
            var words = line.split(":");
            output[cnt] = words[1];
            cnt++;
          }
        });
        var rData = {
          "iterations": output[0],
          "candidates": output[1],
          "instances": output[2],
          "evaluations": output[3],
          "time": output[4]
        };
        $scope.results = rData;
        $scope.$apply();
      });
    } else console.log("scanResultsData: file not found");
  };

  function scanFileReturnPath(workingPath, filename) {
    if(filename) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          throw err;
          console.log(err);
        }

        var ourFileC = false;
        var ourFileF = false;
        var lines = data.split('\n');

        var output_candidates = [];
        var cnt_c = 0;

        var output_freq = [];
        var cnt_f = 0;

        lines.forEach(function(line) {
          // find end of file
          if(line == "# Parameter Frequency:") {
            ourFileC = false;
          }
          // save important data
          if(ourFileC) {
            // output[cnt] = line + "\n";
            output_candidates[cnt_c] = line;
            cnt_c++;
          }
          // find # Final configurations
          if(line == "# Final configurations:") {
            ourFileC = true;
          }

          // find end of file
          if(line == "# Iteration configurations:") {
            ourFileF = false;
          }
          // save important data
          if(ourFileF) {
            output_freq[cnt_f] = line;
            cnt_f++;
          }
          // find # Final configurations
          if(line == "# Parameter Frequency:") {
            ourFileF = true;
          }

        });

        // Candidates
        var contentC = "";
        output_candidates.forEach(function(o) {
          contentC += o + "\n";
        });
        workingPathC = workingPath + "/task-candidates_result.txt";
        // write new file
        fs.writeFile(workingPathC, contentC, function(err) {
          console.log("created path: " + workingPathC);
          if(err) alert(err);
        });

        // Frequencies
        var contentF = "";
        output_freq.forEach(function(o) {
          contentF += o + "\n";
        });
        workingPathF = workingPath + "/task-frequency_result.txt";
        // write new file
        fs.writeFile(workingPathF, contentF, function(err) {
          console.log("created path: " + workingPathF);
          if(err) alert(err);
        });

        $scope.$apply();
      });
    } else console.log("scanFileReturnCandidatesPath: file not found");
  };

  $scope.getFiltered = function(obj, idx) {
    return !((obj._index = idx) % 3);
  }

  // instances for task_best
  function scanDataTable(filename) {
    if(filename) {
      var cand = [];
      var indcand = [];
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          throw err;
          console.log(err);
        }

        var lines = data.split('\n');
        var output = [];
        var cnt = 0;
        lines.forEach(function(line) {
          var words = line.split(",");
          cand[cnt] = words;
          cnt++;
        });
        $scope.candidates_best = cand;
        $scope.$apply();

        // console.log($scope.candidates_best);
      });
    } else console.log("scanDataTable: file not found");

  }

  function help() {
    var resultDensityData = [];
    // iterate over all Density params
    var lengData = $scope.d3DensityPlotDataV.length;

    for(var i=0; i < lengData; i++) {
      // iterating over each object
      var ob = $scope.d3DensityPlotDataV[i];
      console.log(ob);
      // var init = parseFloat(ob.x_values_bp[0]);
      var init = ob.x_values_bp[0];
      var l = ob.x_values_bp.length;
      var ed = ob.x_values_bp[l-1];

      var task = [];

      if (ob.x_values_pd[0] === "NONE" || ob.x_values_pd[0] === 'NONE') {
        var aux = {
          x: ob.x_values_pd[0],
          y: ob.y_values_pd[0]
        };
        task.push(aux);
      } else {
        for(var j=0; j < ob.x_values_pd.length; j++) {

          if(parseFloat(ob.x_values_pd[j]) >= init) {
            if(parseFloat(ob.x_values_pd[j]) <= ed) {
              var aux = {
                x: parseFloat(ob.x_values_pd[j]),
                y: parseFloat(ob.y_values_pd[j])
              };
              task.push(aux);
            }
          }
        }
      }

      var paramObj = {
        "param": ob.param,
        "type": ob.type,
        "x_values_bp": ob.x_values_bp,
        "y_values_bp": ob.y_values_bp,
        "line": task
      };

      resultDensityData.push(paramObj);
      paramObj = {};
      task = [];
    }
    return resultDensityData;
  }
}]);
