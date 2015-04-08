define(['app', 'angular', 'underscore', 'text!./organization-reference.html', 'utilities/km-storage'], function(app, angular, template){

app.directive('viewOrganizationReference', [function () {
	return {
		restrict: 'E',
		template: template,
		replace: true,
		transclude: false,
		scope: {
			document: "=ngModel",
			locale: "=",
			target: "@linkTarget"
		}
	};
}]);
});
