app.controller('RunController', ['$scope', '$mdDialog', function($scope, $mdDialog) {
  // console.log($scope);
  // TODO set up $scope + important data from it

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

  // check the minimum value for alive candidates
  $scope.currentAliveCandidatess = function() {

  };

  // check the maximum instances in execution
  $scope.currentNumberInstances = function() {

  };

  // experiments so far / current bugdet
  $scope.currentNumberEvaluations = function() {

  };
}]);
