/* Directives */

angular.module('myApp.directives', [])

.directive('appVersion', ['version',
    function(version) {
        return function(scope, elm, attrs) {
            elm.text(version);
        };
    }
])

.directive('MyDirective', [
    function() {
        return {
            restrict: 'E',
            replace: true,
            controller: 'MainController',
            template: '<p>hi</p>'
        };
    }
]);