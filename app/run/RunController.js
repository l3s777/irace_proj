app.controller('RunController', ['$rootScope', '$scope', '$mdDialog', 'FileParser', function($rootScope, $scope, $mdDialog, FileParser) {

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
  // $scope.d3LineData = '';

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
    // testing ready d3BoxPlotData
    $scope.d3BoxPlotData = FileParser.parseIraceTestElitesFile("./app/run/best-tests.txt");

    // testing for barChart
    barsForCandidateValues();
    // $scope.d3LineData = "./app/run/testLine.cvs"

    // line chart for kendal
    lineForKendal();

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
    $scope.d3ParallelCoordinatesPlotData = "";
    return "run/testParallel.csv";
  }

  function barsForCandidateValues() {
    // margins
    var margin = {top: 10, right: 30, bottom: 35, left: 30},
      width = 250 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], .02);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    var svg = d3.select("#bar").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("run/testCandidateValues.csv", function(error, data) {
      data.forEach(function(d) {
        d.name = d.name;
        d.value = +d.value;
      });

      svg.selectAll("*").remove();

      x.domain(data.map(function(d) { return d.name; }));
      y.domain([0, d3.max(data, function(d) { return d.value; })]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-90)" );

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Frequency");

      svg.selectAll("bar")
          .data(data)
          .enter().append("rect")
          .style("fill", "steelblue")
          .attr("x", function(d) { return x(d.name); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.value); })
          .attr("height", function(d) { return height - y(d.value); });

          });
  }

  function lineForKendal() {
  }

  // live running
  setTimeout(function () {
        $scope.$apply(function () {
            $scope.readData();
        });
  }, 2000);

}]);
