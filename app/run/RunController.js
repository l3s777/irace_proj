app.controller('RunController', ['$rootScope', '$scope', '$mdDialog', 'FileParser', '$interval', function($rootScope, $scope, $mdDialog, FileParser, $interval) {

  $scope.scenarioname = $rootScope.scenario;

  var app2 = require('electron').remote;
  var dialog = app2.dialog;
  var fs = require('fs');
  var mpath = require('path');

  // graphics controls
  var d3 = require("d3");

  $scope.iteration_data = {
    "iteration": 1,
    "budget": 1,
    "totCandidates": 1
  };

  $scope.task_data = {
    "aliveCandidates": 1,
    "numberInstances": 1,
    "numberEvaluations": 1
  };

  $scope.task_detail = [{}];

  $scope.d3ParallelCoordinatesPlotData = '';
  $scope.d3BoxPlotData = [];

  // dynamic
  // $interval(function(){
  //     $scope.readData();
  // }, 1000, 10);

  $scope.readData = function() {
    var workingPath = "/Users/lesly/irace-setup"; // TODO get the user's path
    $scope.iteration_data = scanIterationData(workingPath + "/iteration_data.iout");
    $scope.task_data = scanTaskData(workingPath +  "/task_data.iout");
    $scope.task_detail = scanTaskDetail(workingPath + "/task_detail.cvs");

    // read data for PARALLEL COORDINATES
    $scope.d3ParallelCoordinatesPlotData = workingPath + "/task-candidates.txt";
    // testing ready d3BoxPlotData
    // TODO review when it is running dynamically (height sometimes returning NaN)
    $scope.d3BoxPlotData = FileParser.parseIraceTestElitesFile(workingPath + "/task-results.txt");

    // $scope.d3Candidates = FileParser.parseIraceFrequencyFile(workingPath + "/task-frequency.txt");
    $scope.d3Candidates = FileParser.parseIraceFrequencyFile("/Users/lesly/Desktop"+ "/task-frequency.txt");

    // BarPlot for Categorical and Ordinal
    $scope.d3BarPlotDataV = $scope.d3Candidates.co;
    console.log($scope.d3BarPlotDataV);
    // KernelGraph for Integer and Real
    $scope.d3DensityPlotDataV = $scope.d3Candidates.ir; // represented by Kernel Density Estimation
    console.log($scope.d3DensityPlotDataV);

    $scope.task_best = scanTaskBestDetail(workingPath + "/task-bests.txt");
    // line chart for kendal
    $scope.kendallValues = FileParser.parseIraceKendallFile(workingPath + "/task-kendall.txt");
  };

  function scanIterationData(filename) {
    fs.readFile(filename, 'utf8', function(err, data) {
      if (err) {
        throw err;
        console.log(err);
      }

      var lines = data.split('\n');
      var output = [];
      var cnt = 0;
      lines.forEach(function(line) {
        if(line[0] != '#') {
          output[cnt]= line;
          cnt++;
        }
      });
      var iData = {
        "iteration": output[0],
        "budget": output[1],
        "totCandidates": output[2]
      };
      $scope.iteration_data = iData;
      $scope.$apply();
    });
  }

  function scanTaskData(filename) {
    fs.readFile(filename, 'utf8', function(err, data) {
      if (err) {
        throw err;
        console.log(err);
      }

      var lines = data.split('\n');
      var output = [];
      var cnt = 0;
      lines.forEach(function(line) {
        if(line[0] != '#') {
          output[cnt]= line;
          cnt++;
        }
      });
      var tData = {
        "aliveCandidates": output[0],
        "numberInstances": output[1],
        "numberEvaluations": output[2]
      };
      $scope.task_data = tData;
      $scope.$apply();
    });
  }

  function scanTaskDetail(filename) {
    var params = [];
    fs.readFile(filename, 'utf8', function(err, data) {
      if (err) {
        throw err;
        console.log(err);
      }

      var lines = data.split('\n');
      var output = [];
      var cnt = 0;
      lines.forEach(function(line) {
        if(line[0] != "#") {
          output[cnt]= line;
          cnt++;
          // var words = line.split("\t");
          var words = line.split(/\s+/);
          if(words[0]) {
            var task = {
              "numberInstance": words[0],
              "numberCandidate": words[1],
              "mean": words[2],
              "time": words[3],
              "w": words[4]
            };
            params.push(task);
          }
        }
      });
      $scope.task_detail = params;
      $scope.$apply();
    });
  }

  // instances for task_best
  function scanTaskBestDetail(filename) {
    var params = [];
    fs.readFile(filename, 'utf8', function(err, data) {
      if (err) {
        throw err;
        console.log(err);
      }

      var lines = data.split('\n');
      var output = [];
      var cnt = 0;
      lines.forEach(function(line) {
        if(line[0] != "#") {
          output[cnt]= line;
          cnt++;
          var words = line.split(/\s+/);
          if(words[0]) {
            var task = {
              "name": words[0],
              "value": words[1]
            };
            params.push(task);
          }
        }
      });
      $scope.task_best = params;
      $scope.$apply();
    });
  }

}]);
