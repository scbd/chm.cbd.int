define(['app', 'text!./national-report.html'], function(app, template){

app.directive('viewNationalReport', [function () {
	return {
		restrict : 'E',
		template : template,
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
});
