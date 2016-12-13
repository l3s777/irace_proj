app.controller('SetupController', ['$rootScope', '$scope', '$mdDialog', function($rootScope, $scope, $mdDialog) {
  // Initialize the scope variables
  var self = $scope;
  // reading external file for parameteres
  $scope.cfg = {};

  // Dependencies
  var app2 = require('electron').remote;
  var dialog = app2.dialog;
  var fs = require('fs');

  // Execute commands
  var sys = require('util');
  var exec = require('child_process').exec;
  var child;

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

  $rootScope.scenario = $scope.scenario.name;

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
        "value": false,
        "numCores": 2
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

  $scope.full_iraceparams = [
    { "name": "scenarioFile",
      "type": "p",
      "short": "-s",
      "long": "--scenario",
      "default": "./scenario.txt",
      "description": "File that describes the configuration scenario setup and other irace settings."
    },
    { "name": "debugLevel",
      "type": "i",
      "short": "",
      "long": "--debug-level",
      "default": 0,
      "description": "A value of 0 silences all debug messages. Higher values provide more verbose debug messages."
    },
    { "name": "seed",
      "type": "i",
      "short": "",
      "long": "--seed",
      "default": "NA",
      "description": "Seed of the random number generator (must be a positive integer, NA means use a random seed)."
    },
    { "name": "execDir",
      "type": "p",
      "short": "",
      "long": "--exec-dir",
      "default": "./",
      "description": "Directory where the programs will be run."
    },
    { "name": "logFile",
      "type": "p",
      "short": "-l",
      "long": "--log-file",
      "default": "./irace.Rdata",
      "description": "File to save tuning results as an R dataset, either absolute path or relative to execDir."
    },
    { "name": "elitist",
      "type": "b",
      "short": "-e",
      "long": "--elitist",
      "default": 1,
      "description": "Enable/disable elitist irace."
    },
    { "name": "elitistNewInstances",
      "type": "i",
      "short": "",
      "long": "--elitist-new-instances",
      "default": 1,
      "description": "Number of instances added to the execution list before previous instances in elitist irace."
    },
    { "name": "elitistLimit",
      "type": "i",
      "short": "",
      "long": "--elitist-limit",
      "default": 2,
      "description": "Limit for the elitist race, number statistical test without elimination peformed. Use 0 for no limit."
    },
    { "name": "targetRunner",
      "type": "p",
      "short": "",
      "long": "--target-runner",
      "default": "./target-runner",
      "description": "The script called for each configuration that launches the program to be tuned. See templates/."
    },
    { "name": "targetRunnerRetries",
      "type": "i",
      "short": "",
      "long": "--target-runner-retries",
      "default": 0,
      "description": "Number of times to retry a call to target-runner if the call failed."
    },
    { "name": "targetRunnerData",
      "type": "i",
      "short": "",
      "long": "--target-runner-retries",
      "default": 0,
      "description": "Number of times to retry a call to target-runner if the call failed."
    },
    { "name": "targetRunnerParallel",
      "type": "x",
      "short": "",
      "long": "",
      "default": "",
      "description": ""
    },
    { "name": "targetEvaluator",
      "type": "p",
      "short": "",
      "long": "--target-evaluator",
      "default": "",
      "description": "Optional script that provides a numeric value for each configuration. See templates/target-evaluator.tmpl"
    },
    { "name": "deterministic",
      "type": "b",
      "short": "",
      "long": "--deterministic",
      "default": 0,
      "description": "If the target algorithm is deterministic, configurations will be evaluated only once per instance."
    },
    { "name": "parallel",
      "type": "i",
      "short": "",
      "long": "--parallel",
      "default": 0,
      "description": "Number of calls to targetRunner to execute in parallel. 0 or 1 mean disabled."
    },
    { "name": "loadBalancing",
      "type": "b",
      "short": "",
      "long": "--load-balancing",
      "default": 1,
      "description":  "Enable/disable load-balancing when executing experiments in parallel. Load-balancing makes better use of computing resources, but increases communication overhead. If this overhead is large, disabling load-balancing may be faster."
    },
    { "name": "mpi",
      "type": "b",
      "short": "",
      "long": "--mpi",
      "default": 0,
      "description":  "Enable/disable MPI. Use Rmpi to execute targetRunner in parallel (parameter parallel is the number of slaves)."
    },
    { "name": "sgeCluster",
      "type": "b",
      "short": "",
      "long": "--sge-cluster",
      "default": 0,
      "description":  "Enable/disable SGE cluster mode. Use qstat to wait for cluster jobs to finish (targetRunner must invoke qsub)."
    },
    { "name": "maxExperiments",
      "type": "i",
      "short": "",
      "long":  "--max-experiments" ,
      "default": 0,
      "description": "The maximum number of runs (invocations of targetRunner) that will be performed. It determines the maximum budget of experiments for the tuning."
    },
    { "name": "maxTime",
      "type": "i",
      "short": "",
      "long": "--max-time",
      "default": 0,
      "description": "Maximum total execution time for the executions of targetRunner (targetRunner must return two values: [cost] [time] )."
    },
    { "name": "budgetEstimation",
      "type": "r",
      "short": "",
      "long": "--budget-estimation",
      "default": 0.02,
      "description": "Fraction of the budget used to estimate the mean computation time of a configuration."
    },
    { "name": "testNbElites",
      "type": "i",
      "short": "",
      "long": "--test-num-elites",
      "default": 1,
      "description": "Number of elite configurations returned by irace that will be tested if test instances are provided."
    },
    { "name": "testIterationElites",
      "type": "b",
      "short": "",
      "long": "--test-iteration-elites",
      "default": 0,
      "description":  "Enable/disable testing the elite configurations found at each iteration."
    },
    { "name": "testInstancesDir",
      "type": "p",
      "short": "",
      "long": "--test-instances-dir",
      "default": "",
      "description": "Directory where testing instances are located, either absolute or relative to current directory."
    },
    { "name": "testInstancesFile",
      "type": "p",
      "short": "",
      "long": "--test-instances-file",
      "default": "",
      "description": "File containing a list of test instances and optionally additional parameters for them."
    },
    { "name": "sampleInstances",
      "type": "b",
      "short": "",
      "long": "--sample-instances",
      "default": 1,
      "description": "Sample the instances or take them always in the same order."
    },
    { "name": "nbIterations",
      "type": "i",
      "short": "",
      "long": "--iterations",
      "default": 0,
      "description": "Number of iterations."
    },
    { "name": "nbExperimentsPerIteration",
      "type": "i",
      "short": "",
      "long": "--experiments-per-iteration",
      "default": 0,
      "description": "Number of experiments per iteration."
    },
    { "name": "nbConfigurations",
      "type": "i",
      "short": "",
      "long": "--num-configurations",
      "default": 0,
      "description": "The number of configurations that should be sampled and evaluated at each iteration."
    },
    { "name": "mu",
      "type": "i",
      "short": "",
      "long": "--mu",
      "default": 5,
      "description": "This value is used to determine the number of configurations to be sampled and evaluated at each iteration."
    },
    { "name": "minNbSurvival",
      "type": "i",
      "short": "",
      "long": "--min-survival",
      "default": 0,
      "description": "The minimum number of configurations that should survive to continue one iteration."
    },
    { "name": "softRestart",
      "type": "b",
      "short": "",
      "long": "--soft-restart",
      "default": 1,
      "description": "Enable/disable the soft restart strategy that avoids premature convergence of the probabilistic model."
    },
    { "name": "softRestartThreshold",
      "type": "r",
      "short": "",
      "long": "--soft-restart-threshold",
      "default": "NA",
      "description": "Soft restart threshold value for numerical parameters. If NA, it computed as 10^-digits."
    },
    { "name": "parameterFile",
      "type": "p",
      "short": "-p",
      "long": "--parameter-file",
      "default": "./parameters.txt",
      "description": "File that contains the description of the parameters to be tuned. See the template."
    },
    { "name": "digits",
      "type": "i",
      "short": "",
      "long": "--digits",
      "default": 4,
      "description": "Indicates the number of decimal places to be considered for the real parameters."
    },
    { "name": "forbiddenFile",
      "type": "p",
      "short": "",
      "long": "--forbidden-file",
      "default": "",
      "description": "File containing a list of logical expressions that cannot be true for any evaluated configuration. If empty or NULL, do not use a file."
    },
    { "name": "configurationsFile",
      "type": "p",
      "short": "",
      "long": "--configurations-file",
      "default": "",
      "description": "File containing a list of initial configurations. If empty or NULL do not use a file."
    },
    { "name": "trainInstancesDir",
      "type": "p",
      "short": "",
      "long": "--train-instances-dir",
      "default": "./Instances",
      "description": "Directory where tuning instances are located; either absolute path or relative to current directory."
    },
    { "name": "trainInstancesFile",
      "type": "p",
      "short": "",
      "long": "--train-instances-file",
      "default": "",
      "description": "File containing a list of instances and optionally additional parameters for them."
    },
    { "name": "testType",
      "type": "s",
      "short": "",
      "long": "--test-type",
      "default": "F-test",
      "description": "Specifies the statistical test type: F-test (Friedman test), t-test (pairwise t-tests with no correction), t-test-bonferroni (t-test with Bonferroni's correction for multiple comparisons), t-test-holm (t-test with Holm's correction for multiple comparisons)."
    },
    { "name": "firstTest",
      "type": "i",
      "short": "",
      "long": "--first-test",
      "default": 5,
      "description": "Specifies how many instances are seen before the first elimination test. It must be a multiple of eachTest."
    },
    { "name": "eachTest",
      "type": "i",
      "short": "",
      "long": "--each-test",
      "default": 1,
      "description": "Specifies how many instances are seen between elimination tests."
    },
    { "name": "confidence",
      "type": "r",
      "short": "",
      "long": "--confidence",
      "default": 0.95,
      "description": "Confidence level for the elimination test."
    },
    { "name": "recoveryFile",
      "type": "p",
      "short": "",
      "long": "--recovery-file",
      "default": "",
      "description": "Previously saved log file to recover the execution of irace, either absolute path or relative to the current directory.  If empty or NULL, recovery is not performed."
    }
  ];

  // Welcome screen
  angular.element(document).ready(function () {
    $scope.scenario.parameters = [{"active": true}];
    $scope.scenario.constraints = [{"active": true}];
    $scope.scenario.candidates = {
      "parameters": [],
      "instances": []
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
  // $scope.openScenario = function() {
  //   console.log("when it opens");
  // };

  $scope.saveScenario = function() {
    // save all the scenario
    console.log("time to save info");
    if($scope.scenario.name) {
      if($scope.scenario.parameters) { //if there are parameters to save
        if($scope.scenario.constraints) {
          if($scope.scenario.candidates) {
            if($scope.scenario.instances) {
              if($scope.scenario.targetrunner) {
                if($scope.scenario.irace_params) {

                  console.log("passed validations");

                  // all data is ready to be saved
                  var contentParameters = $scope.prepareExportParams();
                  var contentConstrains = $scope.prepareExportConstrains();
                  var contentCandidates = $scope.prepareExportCandidates();
                  var contentTargetRunner = $scope.scenario.targetrunner;
                  var contentIraceParams = $scope.prepareExportIraceSetup();

                  // save for user
                  var userPath = dialog.showOpenDialog({
                      properties: ['openDirectory']
                  });
                  // saving data in user provided path
                  fs.writeFile(userPath+"/params.txt", contentParameters, function(err) {
                    if(err) alert(err);
                  });
                  fs.writeFile(userPath+"/constraints.txt", contentConstrains, function(err) {
                    if(err) alert(err);
                  });
                  fs.writeFile(userPath+"/candidates.txt", contentCandidates, function(err) {
                    if(err) alert(err);
                  });
                  fs.writeFile(userPath+"/targetrunner.txt", contentTargetRunner, function(err) {
                    if(err) alert(err);
                  });
                  fs.writeFile(userPath+"/iracesetup.txt", contentIraceParams, function(err) {
                    if(err) alert(err);
                  });

                } else dialog.showErrorBox("File save error", "It cannot save with empty irace parameters");
              } else dialog.showErrorBox("File save error", "It cannot save with empty target runner path");
            } else dialog.showErrorBox("File save error", "It cannot save with empty instances");
          } else dialog.showErrorBox("File save error", "It cannot save with empty initial candidates");
        } else dialog.showErrorBox("File save error", "It cannot save with empty forbidden combinations");
      } else dialog.showErrorBox("File save error", "It cannot save with empty parameters");
    } else {
      // show alert to introduce name for the scenario
      console.log("intro name");
      dialog.showErrorBox("File save error", "Please, insert a name for the scenario");
    }

  };

  $scope.summaryBeforeRun = function(ev) {
    var content = $scope.prepareExportIraceSetup();
    // TODO check if all configuration has been saved
    console.log(content);
    $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title('Summary')
        .textContent(content)
        .ok('OK')
        .targetEvent(ev)
    );
  };

  //---------------------
  // Params
  //---------------------
  $scope.addParam = function() {
    $scope.scenario.parameters.push({
      'active': true,
      "name": "param_name",
      "switch": "",
      "type": "c",
      "          ": "(1,2,3)",
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
    var auxparams = [];
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
            auxparams.push(param.name);
          }
        }
      });
      $scope.scenario.parameters = params;
      $scope.$apply();
    });

    // save same params in candidates
    $scope.scenario.candidates.parameters = auxparams;
  }

  $scope.prepareExportParams = function() {
    var content = cfg.file_options.parameters_header;
    $scope.scenario.parameters.forEach(function(param) {
      if(param.active) {
        if(param.switch) var aux = param.switch;
        else var aux = "\"" + " " + "\"";
        content += param.name + "\t" + aux + "\t" + param.type + "\t" + param.values;
        if(param.conditions) content += "\t| " + param.conditions;
        else content += "\t"
        content += "\n";
      }
    });
    return content;
  }

  $scope.exportParameters = function() {
    var content = $scope.prepareExportParams();
    // choose where to save
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

  $scope.prepareExportConstrains = function () {
    var content = cfg.file_options.constraints_header;
    $scope.scenario.constraints.forEach(function(constraint) {
      if(constraint.active) {
        content += constraint.expression + "\n";
      }
    });
    return content;
  };

  $scope.exportConstraints = function() {
    var content = $scope.prepareExportConstrains();
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
    if($scope.scenario.candidates.parameters.length > 1) {
      while(aux_cont <= $scope.scenario.candidates.parameters.length) {
        aux_candidates.push("");
        aux_cont++;
      }
      $scope.scenario.candidates.instances.push({
          'n' : "new_candidate ",
          'values': aux_candidates,
          'active': true
      });
    } else dialog.showErrorBox("Cannot add candidate", "First add labels.");
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

  $scope.prepareExportCandidates = function() {
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

    return content;
  };

  $scope.exportCandidates = function() {
    var content = $scope.prepareExportCandidates();

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
  $scope.browseTrainingInstances = function(index) {
    dialog.showOpenDialog(function(filename) {
      if(filename) {
        $scope.scenario.instances.training[index] = filename[0];
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
          // TODO review why it charges from second line
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

  $scope.prepareExportTrainingInstances = function() {
    var content = cfg.file_options.instances_header;
    content += "#training instances" + "\n";
    $scope.scenario.instances.training.forEach(function(inst) {
      if (inst) {
          content += inst + "\n";
      }
    });
    return content;
  }

  $scope.exportTrainingInstances = function() {
    var content = $scope.prepareExportTrainingInstances()

    dialog.showSaveDialog(function(filename) {
      if(filename) {
        fs.writeFile(filename, content, function(err) {
          if(err) alert(err);
        });
      }
    });
  };

  // Testing Instances
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

  $scope.browseTestsInstances = function(index) {
    dialog.showOpenDialog(function(filename) {
      if(filename) {
        $scope.scenario.instances.tests[index] = filename[0];
        $scope.$apply();
      }
    });
  };

  $scope.prepareExportTestingInstances = function() {
    var content = cfg.file_options.instances_header;
    content += "#testing instances" + "\n";
    $scope.scenario.instances.tests.forEach(function(t) {
      if (t) {
          content += t + "\n";
      }
    });
    return content;
  }

  $scope.exportTestingInstances = function() {
    var content =   $scope.prepareExportTestingInstances();

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
  $scope.prepareExportIraceSetup = function() {
    // export parameters set up to an independent file
    var content = cfg.file_options.irace_params_header;

    // TODO retrieve users home path
    var path = "/Users/lesly/irace-setup";
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    }

    content += "#path: " + path + "\n";
    content += cfg.file_options.iraceparams_header;

    $scope.full_iraceparams.forEach(function(value) {
      if(value.name==="parameterFile") {
        content += value.name + " = " + "\"" + path+"/params.txt" + "\"" +  "\n";
      } else if(value.name==="execDir") {
        content += value.name + " = " + "\"" + path+"/" + "\"" + "\n";
      } else if(value.name==="logFile") {
        content += value.name + " = " + "\"" + path+"/irace.Rdata" + "\"" + "\n";
      } else if(value.name==="configurationsFile") {
        content += value.name + " = " + "\"" + path+"/candidates.txt" + "\"" + "\n";
      } else if(value.name==="targetRunner") {
        content += value.name + " = " + "\"" + $scope.scenario.targetrunner + "\"" +  "\n";
      } else if(value.name==="targetRunnerParallel") {
        content += value.name + " = " + "NULL" +  "\n";
      } else if(value.name === "targetEvaluator") {
        content += value.name + " = " + "\"" + "" + "\"" + "\n";
      } else if(value.name === "maxExperiments") {
        //TODO check if $scope given value is NULL if so, just retreive from default values
        if($scope.irace_parameters.maxExperiments.value===0) content += value.name + " = " + 100 + "\n";
        else content += value.name + " = " + $scope.irace_parameters.maxExperiments.value + "\n";
      } else if(value.name === "maxTime") {
        content += value.name + " = " + $scope.irace_parameters.maxTime.value + "\n";
      } else if(value.name==="budgetEstimation") {
        content += value.name + " = " + $scope.irace_parameters.budgetEstimation.value + "\n";
      } else if(value.name==="testInstancesFile") {
        content += value.name + " = " + "\"" + path + "/test_instances.txt" + "\"" + "\n";
      } else if(value.name==="trainInstancesDir") {
        content += value.name + " = " + "\"" + "" + "\"" + "\n";
      } else if(value.name==="trainInstancesFile") {
        content += value.name + " = " + "\"" + path + "/training_instances.txt" + "\"" + "\n";
      } else if(value.name==="testNbElites") {
        content += value.name + " = " + $scope.irace_parameters.testNbElites.value + "\n";
      } else if(value.name==="testIterationElites") {
        if($scope.irace_parameters.testIterationElites.value) content += value.name + " = " + 1 + "\n";
        else  content += value.name + " = " + 0 + "\n";
      } else if(value.name === "digits") {
        content += value.name + " = " + $scope.irace_parameters.digits.value + "\n";
      } else if(value.name === "debugLevel") {
        content += value.name + " = " + 0 + "\n";
      } else if(value.name === "nbIterations") {
        content += value.name + " = " + $scope.irace_parameters.nbIterations.value + "\n";
      } else if(value.name=="nbExperimentsPerIteration") {
        content += value.name + " = " + $scope.irace_parameters.nbExperimentsPerIteration.value + "\n";
      } else if(value.name==="sampleInstances") {
        if($scope.irace_parameters.sampleInstances.value) content += value.name + " = " + 1 + "\n";
        else content += value.name + " = " + 1 + "\n";
      } else if(value.name==="testType") {
        content += value.name + " = "+ "\"" + "F-test"+ "\"" + "\n";
      } else if(value.name==="firstTest") {
        // TODO put real value from "default"
        content += value.name + " = " + 5 + "\n";
        console.log(value.name);
        console.log(value.default);
      } else if(value.name === "eachTest" ) {
        // TODO put real value from "default"
        console.log(value.name);
        console.log(value.default);
        content += value.name + " = " + 1 + "\n";
      } else if(value.name === "minNbSurvival") {
        content += value.name + " = " + $scope.irace_parameters.minNbSurvival.value + "\n";
      } else if(value.name==="nbConfigurations") {
        content += value.name + " = " + $scope.irace_parameters.nbConfigurations.value + "\n";
      } else if(value.name==="mu") {
        content += value.name + " = " + $scope.irace_parameters.mu.value + "\n";
      } else if(value.name==="seed") {
        content += value.name + " = " + $scope.irace_parameters.seed.value + "\n";
      } else if (value.name==="parallel") {
        if($scope.irace_parameters.parallel.value) {
          console.log("parallel");
          console.log($scope.irace_parameters.parallel.value);
          console.log($scope.irace_parameters.parallel.numCores);
          // parallel active so number of cores
          content += value.name + " = " + $scope.irace_parameters.parallel.value + "\n";
        } else content += value.name + " = " + 0 + "\n";
     } else if(value.name==="loadBalancing") {
       if($scope.irace_parameters.loadBalancing.value)  content += value.name + " = " + 1 + "\n";
       else content += value.name + " = " + 0 + "\n";
     } else if(value.name==="sgeCluster") {
         if ($scope.irace_parameters.sgeCluster.value) content += value.name + " = " + 1 + "\n";
         else content += value.name + " = " + 0 + "\n";
     } else if(value.name==="mpi") {
       if($scope.irace_parameters.mpi.value) content += value.name + " = " + 1 + "\n";
       else content += value.name + " = " + 0 + "\n";
     } else if(value.name==="softRestart") {
       if($scope.irace_parameters.softRestart.value) content += value.name + " = " + 1 + "\n";
       else content += value.name + " = " + 0 + "\n";
     } else if(value.name==="recoveryFile") {
       content += value.name + " = "+ "\"" + ""+ "\"" + "\n";
     } else if(value.name==="elitist") {
       if($scope.irace_parameters.elitist.value) content += value.name + " = " + 1 + "\n";
       else content += value.name + " = " + 0 + "\n";
     } else if(value.name==="elitistNewInstances") {
       content += value.name + " = " + $scope.irace_parameters.elitistNewInstances.value + "\n";
     } else if(value.name==="elitistLimit") {
       content += value.name + " = " + $scope.irace_parameters.elitistLimit.value + "\n";
     } else if (value.name==="deterministic") {
       if($scope.irace_parameters.deterministic.value) content += value.name + " = " + 1 + "\n";
       else content += value.name + " = " + 0 + "\n";
     } else if(value.name==="testInstancesDir") {
       content += value.name + " = " + "\"" + $scope.irace_parameters.testInstancesDir.value + "\"" + "\n";
     } else if (value.name === "softRestartThreshold") {
       content += value.name + " = " + $scope.irace_parameters.softRestartThreshold.value + "\n";
    }

    });
     content += "## END of configuration file";
    return content;
  };

  $scope.exportIraceSetup = function() {

    // all data is ready to be saved
    var contentParameters = $scope.prepareExportParams();
    var contentConstrains = $scope.prepareExportConstrains();
    var contentCandidates = $scope.prepareExportCandidates();
    var contentTrainingInstances = $scope.prepareExportTrainingInstances();
    var contentTestInstances = $scope.prepareExportTestingInstances();
    var contentTargetRunner = $scope.scenario.targetrunner;
    var contentIraceSetup = $scope.prepareExportIraceSetup();

    // save it locally for running "internally"
    // create folder and add all files
    // TODO extract users home path
    var path = "/Users/lesly/irace-setup";
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    }

    fs.writeFile(path+"/params.txt", contentParameters, function(err) {
      if(err) alert(err);
    });
    fs.writeFile(path+"/constraints.txt", contentConstrains, function(err) {
      if(err) alert(err);
    });
    fs.writeFile(path+"/candidates.txt", contentCandidates, function(err) {
      if(err) alert(err);
    });
    fs.writeFile(path+"/training_instances.txt", contentTrainingInstances, function(err) {
      if(err) alert(err);
    });
    fs.writeFile(path+"/test_instances.txt", contentTestInstances, function(err) {
      if(err) alert(err);
    });
    fs.writeFile(path+"/targetrunner.txt", contentTargetRunner, function(err) {
      if(err) alert(err);
    });
    fs.writeFile(path+"/tune-conf.txt", contentIraceSetup, function(err) {
      if(err) alert(err);
    });

    // executing
    var execCommand = "/Library/Frameworks/R.framework/Versions/3.3/Resources/library/irace/bin/irace --scenario ~/irace-setup/tune-conf.txt  >> ~/irace-setup/result.txt";

    // running proccess from HomeController
    // var exec = require('child_process').exec, child;

    child = exec(execCommand,
        function (error, stdout, stderr) {
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            dialog.showErrorBox("Error", stderr);
            if (error !== null) {
                 console.log('exec error: ' + error);
            }
        }
    );
  };

  $scope.insertPathTestInstancesDir = function() {
    dialog.showOpenDialog(function(filename) {
      if(filename) {
        $scope.irace_parameters.testInstancesDir.value = filename[0];
        $scope.$apply();
      }
    });
  }

  $scope.insertPathTestInstancesFile = function() {
    dialog.showOpenDialog(function(filename) {
      if(filename) {
        $scope.irace_parameters.testInstancesFile.value = filename[0];
        $scope.$apply();
      }
    });
  }

}]);
