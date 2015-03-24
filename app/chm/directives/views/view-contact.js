angular.module('kmApp') // lazy
.directive('viewContact', [function () {
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
}]);


angular.module('kmApp') // lazy
.directive('viewContactReference', [function () {
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
