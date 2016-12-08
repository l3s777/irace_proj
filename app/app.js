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

// (function () {
//     'use strict';
//
//     var _template = './app';
//
//     angular.module('app', [
//       'ngRoute',
//       'ngMaterial',
//       'ngAnimate'])
//     .config(['$routeProvider', function ($routeProvider) {
//             $routeProvider
//             .when('/setup', {
//                 templateUrl: _template + 'setup/setup.html',
//                 controller: 'SetupController',
//             })
//             .otherwise({ redirectTo: '/' });
//         }
//     ]);
// })();
