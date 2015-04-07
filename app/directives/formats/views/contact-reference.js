
define(['app', 'text!./contact-reference.html'], function(app, template){

app.directive('viewContactReference', [function () {
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
