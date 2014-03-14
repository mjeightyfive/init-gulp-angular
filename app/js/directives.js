'use strict';

/* Directives */

angular.module('myApp.directives', [])
	
	.directive('appVersion', ['version', function(version) {
		return function(scope, elm, attrs) {
			elm.text(version);
		}
	}])

	.directive('multiTab', [function() {
		return {
			restrict: 'E',
			replace: true,
			controller: 'MultiTabController',
			template: '\
				<ul class="nav nav-tabs">\
					<li ng-repeat="day in week">\
						<a href="#">{{ day.name }}<i class="fa fa-times"></i></a>\
					</li>\
				</ul>\
			'
		}
	}])

