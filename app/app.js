(function () {
    'use strict';

    var _template = '';

    angular.module('app', [
      'ngRoute',
      'ngMaterial',
      'ngAnimate'])
    .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
            .when('/setup', {
                templateUrl: _template + 'setup/setup.html',
                controller: 'SetupController',
            })
            .otherwise({ redirectTo: '/' });
        }
    ]);
})();
