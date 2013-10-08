angular.module('kmApp')
//============================================================
//
// View Contact
//
//============================================================
.directive('cbdViewContact', [function () {
	return {
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/views/view-contact.partial.html',
		replace: true,
		transclude: false,
		scope: {
			document: "=ngModel",
			locale: "=",
			target: "@linkTarget"
		},
		controller: ['$scope', function ($scope) {
		}]
	}
}])
.directive('cbdViewContactReference', [function () {
	return {
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/views/view-contact-reference.partial.html',
		replace: true,
		transclude: false,
		scope: {
			document: "=ngModel",
			locale: "=",
			target: "@linkTarget"
		},
		controller: ['$scope', function ($scope) {
		}]
	}
}]);
