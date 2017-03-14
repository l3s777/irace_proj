app.controller('RunController', ['$rootScope', '$scope', '$mdDialog', 'FileParser', '$interval', function($rootScope, $scope, $mdDialog, FileParser, $interval) {

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
  $scope.scenario.parameters = $rootScope.params;

  var app2 = require('electron').remote;
  var dialog = app2.dialog;
  var fs = require('fs');
  var mpath = require('path');

  // graphics controls
  var d3 = require("d3");

  $scope.iteration_data = {
    "iteration": 0,
    "budget": 0,
    "totCandidates": 0
  };

  $scope.task_data = {
    "aliveCandidates": 0,
    "numberInstances": 0,
    "numberEvaluations": 0
  };

  $scope.task_detail = [{}];

  $scope.d3ParallelCoordinatesPlotData = '';
  $scope.d3BoxPlotData = [];

  // dynamic
  $interval(function(){
      $scope.readData();
  }, 1000, 10);

  $scope.readData = function() {
    var workingPath = "/Users/lesly/irace-setup"; // TODO get the user's path
    $scope.iteration_data = scanIterationData(workingPath + "/iteration_data.iout");
    $scope.task_data = scanTaskData(workingPath +  "/task_data.iout");
    $scope.task_detail = scanTaskDetail(workingPath + "/task_detail.cvs");

    // read data for PARALLEL COORDINATES
    if(workingPath + "/task-candidates.txt") {
      $scope.d3ParallelCoordinatesPlotData = workingPath + "/task-candidates.txt";
    } else console.log("error for task-candidates.txt");

    // testing ready d3BoxPlotData
    // TODO review when it is running dynamically (height sometimes returning NaN)
    if(workingPath + "/task-results.txt") {
      $scope.d3BoxPlotData = FileParser.parseIraceTestElitesFile(workingPath + "/task-results.txt");
    } else console.log("error for task-results.txt");

    if(workingPath + "/task-frequency.txt") {
      $scope.d3Candidates = FileParser.parseIraceFrequencyFile(workingPath + "/task-frequency.txt");
      // $scope.d3Candidates = FileParser.parseIraceFrequencyFile("/Users/lesly/Desktop"+ "/task-frequency.txt");

      // BarPlot for Categorical and Ordinal
      $scope.d3BarPlotDataV = $scope.d3Candidates.co;
      // console.log($scope.d3BarPlotDataV);
      // KernelGraph for Integer and Real
      $scope.d3DensityPlotDataV = $scope.d3Candidates.ir; // represented by Kernel Density Estimation
      console.log($scope.d3DensityPlotDataV);

      if($scope.d3DensityPlotDataV) {
        $scope.d3DensityPlotDataV = help2();
      }
    } else console.log("error for task-frequency.txt");

    if(workingPath + "/task-bests.txt") {
      $scope.task_best = scanTaskBestDetail(workingPath + "/task-bests.txt");
    } else console.log("error for task-bests.txt");

    // line chart for kendal
    if(workingPath + "/task-kendall.txt") {
      $scope.kendallValues = FileParser.parseIraceKendallFile(workingPath + "/task-kendall.txt");
    } else console.log("error for task-kendall.txt");

  };

  function help2() {
    var resultDensityData = [];
    $scope.scenario.parameters.forEach(function(param) {

      // iterate over all Density params
      var lengData = $scope.d3DensityPlotDataV.length;
      for(var i=0; i < lengData; i++) {
        if(param.name === $scope.d3DensityPlotDataV[i].param) {

          var paramObj = {
                  "param": $scope.d3DensityPlotDataV[i].param, // undefined?
                  "type": $scope.d3DensityPlotDataV[i].type,
                  "values": $scope.d3DensityPlotDataV[i].values,
                  "range": param.values
          };
          resultDensityData.push(paramObj);
          continue;
        }
      }
    });
    // console.log($scope.d3DensityPlotDataV);
    return resultDensityData;
  }

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
