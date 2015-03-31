angular.module('kmApp') // lazy
.directive('viewNationalReport', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-national-report.partial.html',
		replace: true,
		transclude: false,
		scope: {
			document: "=ngModel",
			locale: "=",
			target: "@linkTarget",
			allowDrafts: "@"
		}
	};
}]);
