/* Controllers */
'use strict';

angular.module('myApp.controllers', [])
    .controller('MainController', ['$scope',
        function($scope) {
            console.log('test', $scope);
            console.log('bla');
        }
    ])

;