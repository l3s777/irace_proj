app.controller('SetupController', ['$scope', '$mdDialog', function($scope, $mdDialog) {
  // Initialize the scope variables
  var self = $scope;
  // reading external file for parameteres
  $scope.cfg = {};

  // Dependencies
  var app2 = require('electron').remote;
  var dialog = app2.dialog;
  var fs = require('fs');

  fs.readFile('./app/config.json', 'utf8', function(err, data) {
    if (err) throw err;
    cfg = angular.fromJson(data);
  });

  self.refresh = function() {
    self.$apply();
  }

  // setting up scenario
  $scope.scenario = {
    "name": '',
    "parameters": [],
    "constraints": [],
    "candidates": {},
    "instances":{},
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
          "name": "Ordinal",
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

  // Welcome screen
  angular.element(document).ready(function () {
    $scope.scenario.parameters = [{"active": true}];
    $scope.scenario.constraints = [{"active": true}];
    $scope.scenario.candidates = {
      "parameters": [],
      "instances": [{"active": true}]
    };
    $scope.scenario.instances = {
      "training": [""],
      "tests": [""]
    };
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
      "name": "param_name",
      "switch": "",
      "type": "c",
      "values": "(1,2,3)",
      "conditions": ""
    });
  };

  $scope.importParameters = function() {
    dialog.showOpenDialog(function(filename) {
      if(filename) {
        $scope.scenario.parameters = scanParameters(filename[0]);
        $scope.$apply();
      }
    });
  }

  function scanParameters(filename) {
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
          var words = line.split("\t");
          if(words[0]) {
            if(words[1]=="undefined") var switchParam="";
            else var switchParam = words[1];
            console.log(words[4]);
            if(words[4]) {
                if(words[4].includes("undefined")) var condition = "";
                else var condition = words[4].split("| ")[1];
            } else var condition = "";
            var param = {
              "name": words[0],
              "switch": switchParam,
              "type": words[2],
              "values": words[3],
              "conditions": condition,
              "active": true
            };
            params.push(param);
          }
        }
      });
      $scope.scenario.parameters = params;
      $scope.$apply();
    });
  }

  $scope.exportParameters = function() {
    var content = cfg.file_options.parameters_header;
    $scope.scenario.parameters.forEach(function(param) {
      if(param.active) {
        content += param.name + "\t" + param.switch + "\t" + param.type + "\t" + param.values;
        if(param.condition != "") content += "\t| " + param.conditions;
        content += "\n";
      }
    });
    dialog.showSaveDialog(function(filename) {
      if(filename) {
        fs.writeFile(filename, content, function(err) {
          if(err) alert(err);
        });
      }
    });
  };

  //---------------------
  // Constraints
  //---------------------
  $scope.addConstraint = function() {
    $scope.scenario.constraints.push({
      'active': true,
      "expression": "new_constraint"
    });
  };

  $scope.importConstraints = function() {
    dialog.showOpenDialog(function(filename) {
      if(filename) {
        $scope.scenario.constraints = scanConstraints(filename[0]);
        $scope.$apply();
      }
    });
  };

  function scanConstraints(filename) {
    var constraints = [];
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
          var constraint = {
            "expression": line,
            "active": true
          };
          constraints.push(constraint);
        }
      });
      $scope.scenario.constraints = constraints;
      $scope.$apply();
    });
  }

  $scope.exportConstraints = function() {
    var content = cfg.file_options.constraints_header;
    $scope.scenario.constraints.forEach(function(constraint) {
      if(constraint.active) {
        content += constraint.expression + "\n";
      }
    });
    dialog.showSaveDialog(function(filename) {
      if(filename){
        fs.writeFile(filename, content, function(err) {
          if(err) alert(err);
        });
      }
    });
  };


  //---------------------
  // Initial candidates
  //---------------------
  $scope.addCandidateInst = function() {
    var aux_candidates = [];
    var aux_cont = 1;
    // TODO adding a control
    if($scope.scenario.candidates) {
      while(aux_cont <= $scope.scenario.candidates.pre_instances[0].length) {
        aux_candidates.push("");
        aux_cont++;
      }
      $scope.scenario.candidates.instances.push({
          'n' : "new_candidate ",
          'values': aux_candidates,
          'active': true
      });
    } else console.log("dialog alert");
  };

  $scope.importCandidates = function() {
    dialog.showOpenDialog(function(filename) {
      if(filename) {
          $scope.scenario.candidates = scanCandidates(filename[0]);
          $scope.$apply();
      }
    });
  };

  function scanCandidates(filename) {
    var candidates = [];
    var candidates_param = [];
    var candidates_inst = [];

    fs.readFile(filename, 'utf8', function(err, data) {
      if (err) {
        throw err;
        console.log(err);
      }
      var lines = data.split('\n');
      var output = [];
      var cnt = 0;
      lines.forEach(function(line) {
        if(line[0] != "#") { // first line header
          if(cnt == 0) {
            candidates_param = line.split("\t");
          }
          else {
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
        console.log(pre_instance);
        var instance_obj = {
          'n' : "Candidate " + c,
          'values': pre_instance,
          'active': true
        };
        $scope.scenario.candidates.instances.push(instance_obj);
        c++;
      });
      $scope.$apply();
    });
  }

  $scope.exportCandidates = function() {

    var content = cfg.file_options.candidates_header;
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
    dialog.showSaveDialog(function(filename) {
      if(filename) {
        fs.writeFile(filename, content, function(err) {
          if(err) alert(err);
        });
      }
    });


  };


  //---------------------
  // Instances
  //---------------------
  $scope.browseTrainingInstances = function() {
    dialog.showOpenDialog(function(filename) {
      if(filename) {
        $scope.scenario.instances.training[$scope.scenario.instances.training.length-1] = filename[0];
        $scope.$apply();
      }
    });
  };

  $scope.addTrainingInstance = function() {
    $scope.scenario.instances.training.push("newpath");
  };

  $scope.addPollTrainingInstances = function() {
    dialog.showOpenDialog(function(filename) {

      if(filename) {
        fs.readFile(filename[0], 'utf8', function(err, data) {
          if (err) {
            throw err;
            console.log(err);
          }
          var lines = data.split('\n');
          var output = [];
          var cnt = 0;
          lines.forEach(function(line) {
            if(line[0] != "#") {
              $scope.scenario.instances.training.push(line);
            }
          });
          $scope.$apply();
        });
      }
    });
  };

  $scope.exportTrainingInstances = function() {
    var content = cfg.file_options.instances_header;
    content += "#training instances" + "\n";
    $scope.scenario.instances.training.forEach(function(inst) {
      if (inst) {
          content += inst + "\n";
      }
    });

    dialog.showSaveDialog(function(filename) {
      if(filename) {
        fs.writeFile(filename, content, function(err) {
          if(err) alert(err);
        });
      }
    });
  };

  $scope.addTestsInstance = function() {
    $scope.scenario.instances.tests.push("newpath");
  };

  $scope.addPollTestsInstances = function() {
    dialog.showOpenDialog(function(filename) {

      if(filename) {
        fs.readFile(filename[0], 'utf8', function(err, data) {
          if (err) {
            throw err;
            console.log(err);
          }
          var lines = data.split('\n');
          var output = [];
          var cnt = 0;
          lines.forEach(function(line) {
            if(line[0] != "#") {
              $scope.scenario.instances.tests.push(line);
            }
          });
          $scope.$apply();
        });
      }
    });
  };

  $scope.browseTestsInstances = function() {
    dialog.showOpenDialog(function(filename) {
      if(filename) {
        $scope.scenario.instances.tests[$scope.scenario.instances.tests.length-1] = filename[0];
        $scope.$apply();
      }
    });
  };

  $scope.exportTrainingInstances = function() {
    var content = cfg.file_options.instances_header;
    content += "#testing instances" + "\n";
    $scope.scenario.instances.tests.forEach(function(t) {
      if (t) {
          content += t + "\n";
      }
    });

    dialog.showSaveDialog(function(filename) {
      if(filename) {
        fs.writeFile(filename, content, function(err) {
          if(err) alert(err);
        });
      }
    });
  };


  //---------------------
  // Target-runner
  //---------------------
  $scope.browseTargetRunner = function() {
    dialog.showOpenDialog(function(filename) {
      $scope.scenario.targetrunner = filename[0];
      $scope.$apply();
    });
  };

  $scope.validateTargetRunner = function(ev) {
    console.log("validate TargetRunner");
    // TODO validate link to TargetRunner
    $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title('Alert!')
        .textContent('Link validated. Result: TRUE')
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
    var content = cfg.file_options.irace_params_header + "\n";
    content += cfg.file_options.iraceparams_header + "\n";

    var aux_iraceparams = cfg.file_iraceparams;
    // TODO parse JSON into lines for iracesetup so we can save the data directly in the file.

    // choosing file where to save
    dialog.showSaveDialog(function(filename) {
      if(filename) {
        fs.writeFile(filename, content, function(err) {
          if(err) alert(err);
        });
      }
    });
  };

}]);
