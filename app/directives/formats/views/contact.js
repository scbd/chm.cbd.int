
define(['app', 'text!./contact.html'], function(app, template){

app.directive('viewContact', [function () {
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
