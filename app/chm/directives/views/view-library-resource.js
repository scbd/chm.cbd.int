angular.module('kmApp') // lazy
.directive('viewLibraryResource', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-library-resource.partial.html',
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
