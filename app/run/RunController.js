app.controller('RunController', ['$rootScope', '$scope', '$mdDialog', function($rootScope, $scope, $mdDialog) {

  $scope.scenarioname = $rootScope.scenario;

  // TODO set up $scope + important data from it
  console.log(__dirname);
  // console.log($scope.scenarioname);
  var app2 = require('electron').remote;
  var dialog = app2.dialog;
  var fs = require('fs');

  // parallel coordinates
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

  // parallel coordinates


  // bars
  var svg = d3.select("svg"),
    margin = {top: 5, right: 5, bottom: 5, left: 5},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // var x = d3.scale.ordinal().rangeRound([0, width]).padding(0.1);
  var x = d3.scale.ordinal().domain([10, 0]);
  var y = d3.scale.linear().rangeRound([height, 0]);

  d3.tsv("run/data.tsv", function(d) {
    console.log("value in d");
    console.log(d.frequency);
    d.value = +d.frequency;
    return d;
  }, function(error, data) {
      if (error) throw error;
      console.log(data);

      x.domain(data.map(function(d) { return d.letter; }));
      y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

      g.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          // .call(d3.axisBottom(x));
          .call(d3.svg.axis().scale(x).orient("bottom"));

      g.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y).ticks(10, "%"))
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .text("Frequency");

      g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.letter); })
          .attr("y", function(d) { return y(d.frequency); })
          .attr("width", x.bandwidth())
          .attr("height", function(d) { return height - y(d.frequency); });
    });
}]);
