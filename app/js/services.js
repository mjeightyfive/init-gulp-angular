'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
	
	.value('version', '0.1')

	.service('dataService', [ '$http', function ($http) {

		return {
		    async: function() {
		      return $http.get('data.json');
		    }
		};

		// var getData = function (url) {
	 // 		console.log('url ' + url);
	 //        var d;

		//     $http({
		//         method: 'GET',
		//         url: url,
		//         dataType: 'json'
		//     }).
		//     success(function (data, status, headers, config) {
		//         console.log('success');
		//         d = data;
		//     }).
		//     error(function (data, status, headers, config) {
		//         console.log('error');
		//     });	        
	 
	 //        return {
	 //            getData: d
	 //        };
	 
	 //    };
	}]);