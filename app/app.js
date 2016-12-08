var app = angular.module('app', ['ngMaterial', 'ngRoute']);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/setup', {
        templateUrl: 'setup/setup.html',
        controller: 'SetupController'
      }).
      otherwise({
        redirectTo: 'index.html'
      });
  }]);
