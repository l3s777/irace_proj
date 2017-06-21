app.controller('HomeController', ['$rootScope', '$scope', '$mdDialog', function($rootScope, $scope, $mdDialog) {

  // Dependencies
  var app2 = require('electron').remote;
  var dialog = app2.dialog;
  var fs = require('fs');

  $scope.userPathWorkspace = "";
  $scope.userPathIRACE = "";

  $scope.pathForWorkspace = function() {
    $scope.userPathWorkspace = dialog.showOpenDialog({
        properties: ['openDirectory']
    });
  }

  $scope.pathForIrace = function() {
    $scope.userPathIRACE = dialog.showOpenDialog({
        properties: ['openDirectory']
    });
  }

  $scope.validate = function() {
    if($scope.userPathWorkspace) {
      if($scope.userPathIRACE) {
        $rootScope.pathWorkspace = $scope.userPathWorkspace;
        $rootScope.userPathIRACE = $scope.userPathIRACE;

      }
    } else {
      dialog.showErrorBox("Error","Set the workspace and IRACE installation paths, please.");
    }
  }
}]);
