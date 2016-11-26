(function () {
    'use strict';

    var _templateBase = '';

    angular.module('app', [
      'ngRoute',
      'ngMaterial',
      'ngAnimate'])
    .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
            .when('/setup', {
                templateUrl: _templateBase + '/setup.html',
                controller: 'ctrl',
            })
            .otherwise({ redirectTo: '/' });
        }
    ]);

})();
