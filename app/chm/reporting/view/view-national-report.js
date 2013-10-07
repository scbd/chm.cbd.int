var module = angular.module('kmApp').compileProvider; // lazy

//============================================================
//
// View National Report
//
//============================================================
module.directive('chmViewNationalReport', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/reporting/view/view-national-report.partial.html',
		replace: true,
		transclude: false,
		scope: {
			document: "=ngModel",
			locale: "=",
			target: "@linkTarget",
			allowDrafts: "@"
		},
		controller: ['$scope', 'authHttp', '$q', function ($scope, $http, $q)
		{

			
		}]
	}
}]);
