angular.module('kmCBD')
//============================================================
//
// View Contact
//
//============================================================
.directive('cbdViewDatabase', [function () {
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
