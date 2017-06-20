app.controller('HomeController', ['$rootScope', '$scope', '$mdDialog', function($rootScope, $scope, $mdDialog) {

  // Dependencies
  var app2 = require('electron').remote;
  var dialog = app2.dialog;
  var fs = require('fs');

  var userPathWorkspace, userPathIRACE;

  $scope.pathForWorkspace = function() {
    userPathWorkspace = dialog.showOpenDialog({
        properties: ['openDirectory']
    });
  }

  $scope.pathForIrace = function() {
    userPathIRACE = dialog.showOpenDialog({
        properties: ['openDirectory']
    });
  }

  $scope.validate = function() {
    if(userPathWorkspace) {
      if(userPathIRACE) {
        $rootScope.pathWorkspace = userPathWorkspace;
        $rootScope.userPathIRACE = userPathIRACE;

        // $window.open('#setup');
      }
    } else {
      dialog.showErrorBox("Error","Set the workspace and IRACE installation paths, please.");
    }
  }
}]);
