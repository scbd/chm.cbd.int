angular.module('kmApp') // lazy
.directive('viewDatabase', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-database.partial.html',
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			target  : "@linkTarget"
		},
		controller : ['$scope', function ($scope) 
		{
		}]
	}
}]);
