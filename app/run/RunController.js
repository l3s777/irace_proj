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

  var workingPath = $rootScope.running_path;

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
  // $interval(function(){
  //     $scope.readData();
  // }, 5000, 10);

  $scope.readData = function() {

    // VALIDATE if path were created
    $scope.iteration_data = scanIterationData(workingPath + "/iteration_data.iout");
    $scope.task_data = scanTaskData(workingPath +  "/task_data.iout");
    $scope.task_detail = scanTaskDetail(workingPath + "/task_detail.cvs");

    // read data for PARALLEL COORDINATES
    var path_candidates = workingPath + "/task-candidates.txt";
    if (fs.existsSync(path_candidates)) {
        $scope.d3ParallelCoordinatesPlotData = path_candidates;
    }

    // d3BoxPlotData
    var path_results = workingPath + "/task-results.txt";
    if (fs.existsSync(path_results)) {
        $scope.d3BoxPlotData = FileParser.parseIraceTestElitesFile(path_results);
    }

    // frequencies
    var path_freq = workingPath + "/task-frequency.txt";
    if (fs.existsSync(path_freq)) {
        $scope.d3Candidates = FileParser.parseIraceFrequencyFile(path_freq);

        // BarPlot for Categorical and Ordinal
        $scope.d3BarPlotDataV = $scope.d3Candidates.co;

        // KernelGraph for Integer and Real
        $scope.d3DensityPlotDataV = $scope.d3Candidates.ir; // represented by Kernel Density Estimation
        $scope.d3DensityPlotDataV = help();
    }

    var path_bests = workingPath + "/task-bests.txt";
    if (fs.existsSync(path_bests)) {
        $scope.task_best = scanTaskBestDetail(path_bests);
    }

    // line chart for kendal
    var path_kendall = workingPath + "/task-kendall.txt";
    if (fs.existsSync(path_kendall)) {
        $scope.kendallValues = FileParser.parseIraceKendallFile(path_kendall);
    }
  };

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

  $scope.getFiltered = function(obj, idx) {
    return !((obj._index = idx) % 3);
  }

  function scanIterationData(filename) {
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
    } else console.log("scanIterationData: file not found");
  }

  function scanTaskData(filename) {
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
    } else console.log("scanTaskData: file not found");
  }

  function scanTaskDetail(filename) {
    if(filename) {
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
    } else console.log("scanTaskDetail: file not found");
  }

  // instances for task_best
  function scanTaskBestDetail(filename) {
    if(filename) {
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
    } else console.log("scanTaskBestDetail: file not found");
  }

}]);
