define(['app', 'text!./database.html'], function(app, template){

app.directive('viewDatabase', [function () {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			target  : "@linkTarget"
		}
	};
}]);
});
