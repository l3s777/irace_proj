app.controller('RunController', ['$rootScope', '$scope', '$mdDialog', function($rootScope, $scope, $mdDialog) {

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
    "aliveCandidates": 50,
    "numberInstances": 10,
    "numberEvaluations": 20
  };

  $scope.task_detail = [{}];

  $scope.d3ParallelCoordinatesPlotData = '';
  $scope.d3BoxPlotData = [];

  // check the minimum value for alive candidates
  $scope.currentAliveCandidatess = function() {};
  // check the maximum instances in execution
  $scope.currentNumberInstances = function() {};
  // experiments so far / current bugdet
  $scope.currentNumberEvaluations = function() {};

  $scope.readData = function() {
    // TODO get from working path the files for outputs
    $scope.iteration_data = scanIterationData("/Users/lesly/Desktop/testrunning/iteration_data.iout.txt");
    $scope.task_data = scanTaskData('/Users/lesly/Desktop/testrunning/task_data.iout.txt');
    $scope.task_detail = scanTaskDetail('/Users/lesly/Desktop/testrunning/task_detail.cvs.txt');

    // read data for PARALLEL COORDINATES
    $scope.d3ParallelCoordinatesPlotData = readFileParCoordinates();
    console.log($scope.d3ParallelCoordinatesPlotData);

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

  function readFileParCoordinates() {
    console.log("reading readFileParCoordinates");
    $scope.d3ParallelCoordinatesPlotData = "";
    console.log($scope.d3ParallelCoordinatesPlotData);
    return "run/testParallel.csv";
  }

  // live running
  setTimeout(function () {
        $scope.$apply(function () {
            $scope.readData();
        });
  }, 2000);
}]);
