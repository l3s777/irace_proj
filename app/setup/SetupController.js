angular.module('app', ['ngMaterial', 'ngRoute'])
.controller('ctrl', ['$scope', '$mdDialog', '$http', function($scope, $mdDialog, $http) {
  // Initialize the scope variables
  // reading external file for parameteres
  $scope.cfg = {};

  // setting up scenario
  $scope.scenario = {
    "name": '',
    "parameters": [],
    "constraints": [],
    "candidates": {},
    "instances":[],
    "targetrunner": "",
    "irace_params": []
  };

  $scope.parameters = {
    "categories": {
        "i": {
          "name": "Integer",
          "value": "i"
        },
        "r": {
          "name": "Real",
          "value": "r"
        },
        "c": {
          "name": "Categorical",
          "value": "c"
        },
        "o": {
          "name": "Order",
          "value": "o"
        }
    }
  };

  $scope.irace_parameters = {
      "seed": {
        "value": "1234567"
      },
      "elitist": {
        "value": true
      },
      "elitistNewInstances": {
        "value": 1
      },
      "elitistLimit": {
        "value": 2
      },
      "deterministic": {
        "value": false
      },
      "parallel": {
        "value": false
      },
      "loadBalancing": {
        "value": true
      },
      "mpi": {
        "value": false
      },
      "sgeCluster": {
        "value": false
      },
      "budgetSelectionNumberIter": {
        "value": true
      },
      "budgetSelectionTime": {
        "value": false
      },
      "maxExperiments": {
        "value": 0
      },
      "maxTime": {
        "value": 0
      },
      "budgetEstimation": {
        "value": 0.02
      },
      "testNbElites": {
        "value": 1
      },
      "testIterationElites": {
        "value": false
      },
      "testInstancesDir": {
        "value": ""
      },
      "testInstancesFile": {
        "value": ""
      },
      "sampleInstances": {
        "value": true
      },
      "nbIterations": {
        "value": 0
      },
      "nbExperimentsPerIteration": {
        "value": 0
      },
      "nbConfigurations": {
        "value": 0
      },
      "mu": {
        "value": 5
      },
      "minNbSurvival": {
        "value": 0
      },
      "softRestart": {
        "value": true
      },
      "softRestartThreshold": {
        "value": "NA"
      },
      "digits": {
        "value": 4
      }
  };

  $scope.iraceparamsBudget = [
     { label: 'Number of evaluations', value: 'iterations' },
     { label: 'Execution time', value: 'time' }
  ];
  $scope.group='iterations';

  // Welcome screen
  angular.element(document).ready(function () {
    $scope.scenario.parameters = [{"active": true}];
    $scope.scenario.constraints = [{"active": true}];
    $scope.scenario.candidates = {
      "parameters": [],
      "instances": [{"active": true}]
    };
    $scope.scenario.instances = [{}];
    $scope.scenario.irace_params = [];
  });

  //----------------------
  // Scenario
  //----------------------

  // TODO
  // self.openScenario = function() {
  //   console.log("when it opens");
  // };

  $scope.insertPath = function(){

  }

  // $scope.saveScenario = function() {
  //   // save all the scenario
  //   console.log("time to save info");
  // };

  //---------------------
  // Params
  //---------------------
  $scope.addParam = function() {
    $scope.scenario.parameters.push({
      'active': true,
      "name": "param name",
      "switch": "param switch",
      "type": "c",
      "values": "(1-100)",
      "conditions": ""
    });
  };

  $scope.exportParameters = function() {
    // exporta parameters set up as independent file
    console.log("export params");
    var content = "#name     switch     cat     value     condition\n";
    $scope.scenario.parameters.forEach(function(param) {
      if(param.active) {
        content += param.name + "\t" + param.switch + "\t" + param.type + "\t" + param.values;
        if(param.condition != "") content += "\t| " + param.conditions;
        content += "\n";
      }
    });
    console.log(content);
    // TODO when add scenario.parameters, create object by default
  };

  $scope.importParameters = function() {
    var params_aux = [];
    // reading data from file
    var f = document.getElementById('file').files[0];
    // verifying file was selected
    if(f) {
      var r = new FileReader();
      r.onloadend = function(e) {
        var data = e.target.result;
        console.log(data);
        //send your binary data via $http or $resource or do anything else with it
        var lines = data.split('\n');
        var output = [];
        var cnt = 0;
        lines.forEach(function(line) {
          if(line[0] != "#") {
            output[cnt]= line;
            cnt++;
            var words = line.split("\t");
            if(words[0]) {
              if(words[4]) var condition = words[4].split("| ")[1];
              else var condition = "";
              var param = {
                "name": words[0],
                "switch": words[1],
                "type": words[2],
                "values": words[3],
                "conditions": condition,
                "active": true
              };
              params_aux.push(param);
            }
          }
        });
        $scope.scenario.parameters = params_aux;
        $scope.$apply();
      }
      r.readAsBinaryString(f);
    }
  }


  //---------------------
  // Constraints
  //---------------------
  $scope.importConstraints = function() {
    var constraints = [];

    var f = document.getElementById('file_constrains').files[0];
    var r = new FileReader();
    r.onloadend = function(e) {
      var data = e.target.result;

      var lines = data.split('\n');
      var output = [];
      var cnt = 0;
      lines.forEach(function(line) {
        console.log(line);
        if(line[0] != "#") {
          output[cnt]= line;
          cnt++;
          var constraint = {
            "expression": line,
            "active": true
          };
          constraints.push(constraint);
        }
      });
      $scope.scenario.constraints = constraints;
      $scope.$apply();
    }
    r.readAsBinaryString(f);
  };

  $scope.exportConstraints = function() {
    // export parameters set up to an independent file
    var content = "#constraint\n";
    $scope.scenario.constraints.forEach(function(constraint) {
      if(constraint.active) {
        content += constraint.expression + "\n";
      }
      console.log(content);
    });
  };


  //---------------------
  // Initial candidates
  //---------------------
  $scope.importCandidates = function() {
    var candidates_param = [];
    var candidates_inst = [];

    var f = document.getElementById('file_candidates').files[0];
    var r = new FileReader();

    r.onloadend = function(e) {
      var data = e.target.result;

      var lines = data.split('\n');
      var output = [];
      var cnt = 0;
      lines.forEach(function(line) {
        if(line[0] != "#") {
          // first line contains the name of all parameters
          if(cnt == 0) {
            candidates_param = line.split("\t");
          } else {
            candidates_inst[cnt-1] = line.split("\t");
          }
          cnt++;
        }
      });
      $scope.scenario.candidates = {
        "parameters": candidates_param,
        "pre_instances": candidates_inst
      };
      $scope.scenario.candidates.instances = $scope.scenario.candidates.instances || [] ;
      var c = 1;
      $scope.scenario.candidates.pre_instances.forEach(function(pre_instance) {
        var instance_obj = {
          'n' : "Candidate " + c,
          'values': pre_instance,
          'active': true
        };
        $scope.scenario.candidates.instances.push(instance_obj);
        c++;
      });
      $scope.$apply();
    }
    r.readAsBinaryString(f);

  };

  $scope.exportCandidates = function() {
    console.log("exportCandidates");

    var content = "### Initial candidates \n";
    var aux = " ";

    $scope.scenario.candidates.parameters.forEach(function(candidate_param) {
      if (candidate_param) {
          content += candidate_param + "\t";
      }
    });
    content += "\n";
    $scope.scenario.candidates.instances.forEach(function(candidate_inst) {
      if(candidate_inst.values) {
        if(candidate_inst.active) {
          candidate_inst.values.forEach(function(candidate_inst_){
            aux += candidate_inst_ + "\t"
          });
          content += aux;
          aux = " ";
          content += "\n";
        }
      }
    });

    console.log("saving candidates");
    console.log(content);
    // electron.dialog.showSaveDialog(function(filename) {
    //   fs.writeFile(filename, content, function(err) {
    //     if(err) alert(err);
    //   });
    // });


  };


  //---------------------
  // Instances
  //---------------------
  $scope.browseInstances = function() {
    console.log("browse the instance");
      var instancesPathGroup = [];

      var f = document.getElementById('file_instancebrowse').files[0];

      console.log("f");
      console.log(f);
      console.log(f.name);

      var instancePath = {
        "expression": f.name
      };
      instancesPathGroup.push(instancePath);

      $scope.scenario.instances = instancesPathGroup;

  };

  $scope.exportInstances = function() {
    console.log("time to export instances");
    // TODO
  };


  //---------------------
  // Target-runner
  //---------------------
  $scope.browseTargetRunner = function() {
    console.log("time for targetrunners");
    var f = document.getElementById('file_targetrunner').files[0];
    $scope.scenario.targetrunner = f.name;
    console.log(f.name);
  };

  $scope.validateTargetRunner = function(ev) {
    console.log("validate TargetRunner");
    // TODO validate link to TargetRunner

    $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title('Alert!')
        .textContent('Link validated. State: TRUE')
        .ariaLabel('Alert!')
        .ok('OK')
        .targetEvent(ev)
    );
  };

  //---------------------
  // IRACE params
  //---------------------
  $scope.exportIraceSetup = function() {
    // export parameters set up to an independent file
    var content = "#constraint\n";
    $scope.scenario.constraints.forEach(function(constraint) {
      if(constraint.active) {
        content += constraint.expression + "\n";
      }
      console.log(content);
    });
  };

}]);
