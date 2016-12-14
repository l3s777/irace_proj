app.controller('RunController', ['$rootScope', '$scope', '$mdDialog', function($rootScope, $scope, $mdDialog) {

  $scope.scenarioname = $rootScope.scenario;

  // TODO set up $scope + important data from it
  console.log(__dirname);
  console.log($scope.scenarioname);
  var app2 = require('electron').remote;
  var dialog = app2.dialog;
  var fs = require('fs');

  // parallel coordinates
  var d3 = require('d3');
  // var jsdom = require("jsdom");
  //
  // var document = jsdom.jsdom(),
  // var svg = d3.select(document.body).append("svg");

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
  // const {ipcRenderer} = require("electron");
  // var color = d3.scaleOrdinal(d3.schemeCategory20);
  // var svg = d3.select("#svg");
  // var svg_height = svg.attr("height");
  // var svg_width = svg.attr("width");
  // graph = ipcRenderer.sendSync("actionGetData", "JSON");
  // var simulation = d3.forceSimulation()
  //     .force("link", d3.forceLink().id(function(d) { return d.name; }))
  //     .force("charge", d3.forceManyBody())
  //     .force("center", d3.forceCenter(svg_width / 2, svg_height / 2));
  // var link = svg.append("g")
  //     .attr("class", "links")
  //     .selectAll("line")
  //     .data(graph.connections)
  //     .enter().append("line")
  //     .attr("stroke-width", function(d) { return 1; });
  // var links = svg.append("g")
  //     .attr("class", "links")
  //     .selectAll("line")
  //     .data(graph.connections)
  //     .enter().append("line");
  // var node = svg.append("g")
  //     .attr("class", "nodes")
  //     .selectAll("circle")
  //     .data(graph.ifs)
  //     .enter().append("circle")
  //     .attr("r", 5)
  //     .attr("fill", function(d) {
  //         var vlan = 0;
  //         if (d.vlan !== null)
  //         {
  //             for (var i = 1; i - 1 < graph.vlans.length; i += 1)
  //             {
  //                 if (graph.vlans[i - 1].name === d.vlan)
  //                 {
  //                     vlan = i;
  //                     break;
  //                 }
  //             }
  //         }
  //         return color(vlan);
  //     });
  // node.append("title").text(function(d) { return d.name; });
  // simulation.nodes(graph.ifs).on("tick", ticked);
  // simulation.force("link").links(graph.connections);
  // function ticked() {
  //     link
  //         .attr("x1", function(d) { return d.source.x; })
  //         .attr("y1", function(d) { return d.source.y; })
  //         .attr("x2", function(d) { return d.target.x; })
  //         .attr("y2", function(d) { return d.target.y; });
  //     node
  //         .attr("cx", function(d) { return d.x; })
  //         .attr("cy", function(d) { return d.y; });
  // }


}]);
