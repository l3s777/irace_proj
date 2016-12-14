var app = angular.module('app', ['ngMaterial', 'ngRoute']);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'home/home.html',
        controller: 'HomeController'
      }).
      when('/setup', {
        templateUrl: 'setup/setup.html',
        controller: 'SetupController'
      }).
      when('/run', {
        templateUrl: 'run/run.html',
        controller: 'RunController'
      }).
      when('/', {
        templateUrl: 'home/home.html',
        controller: 'HomeController'
      }).
      otherwise({
        redirectTo: 'home/home.html'
      });
    }]
);
