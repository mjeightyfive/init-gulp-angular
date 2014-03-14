'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
	.controller('MyCtrl1', ['$scope', function ($scope) {

	        $scope.clock = {
	            now: new Date()
	        };

	        var updateClock = function () {
	            $scope.clock.now = new Date()
	        };

	        setInterval(function () {
	            $scope.$apply(updateClock);
	        }, 1000);

	        updateClock();
	    }
	])

	
    .controller('MultiTabController', [ '$scope', 'dataService', function ($scope, dataService) {

			dataService.async().then(function(d) {
				$scope.week = d.data;
			});
        }
    ])



    .controller('TabsDemoCtrl', [ '$scope', function ($scope) {

    }])



;