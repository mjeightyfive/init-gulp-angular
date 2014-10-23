angular.module('myApp.services', [])

.value('version', '0.1')

.service('dataService', ['$http',
    function($http) {

        return {
            async: function() {
                return $http.get('data.json');
            }
        };
    }
]);