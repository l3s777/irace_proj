app.controller('ResultsController', ['$rootScope', '$scope', '$mdDialog', 'FileParser', '$interval', function($rootScope, $scope, $mdDialog, FileParser, $interval) {

  // imports
  var app2 = require('electron').remote;
  var dialog = app2.dialog;
  var fs = require('fs');
  var mpath = require('path');
  // graphics controls
  var d3 = require("d3");

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
    var workingPath = $rootScope.running_path;
    var resultsPath = workingPath + "/output.txt";
    console.log(resultsPath);

    // VALIDATE if path were created
    $scope.results = scanResultsData(resultsPath);

    // CANDIDATES
    scanFileReturnPath(workingPath, resultsPath);
    // table
    scanDataTable(workingPath + "/task-candidates_result.txt")
    // parallel candidates
    $scope.d3ParallelCoordinatesPlotData = workingPath + "/task-candidates_result.txt";

    // task frequency
    // scanFileReturnTaskFrequencyPath(workingPath, resultsPath);
    var path_freq = workingPath + "/task-frequency_result.txt";
    $scope.d3Candidates = FileParser.parseIraceFrequencyFile(path_freq);
    // console.log($scope.d3Candidates);
    // BarPlot for Categorical and Ordinal
    $scope.d3BarPlotDataV = $scope.d3Candidates.co;
    // Kernel Density Estimation
    $scope.d3DensityPlotDataV = $scope.d3Candidates.ir;

    // # Iteration configurations
    // scanFileIterationsResults(workingPath, resultsPath);


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
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          throw err;
          console.log(err);
        }

        var lines = data.split('\n');
        var output = [];
        var cnt = 0;
        lines.forEach(function(line) {
          cand[cnt] = line;
          cnt++;
        });
        $scope.candidates_best = cand;
        $scope.$apply();
      });
    } else console.log("scanDataTable: file not found");

  }
}]);
