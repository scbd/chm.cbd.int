define(['app', 'angular', 'lodash', 'text!./aichi-target-dossier.html', 'utilities/km-storage'], function(app, angular, _, template){

app.directive('viewAichiTargetDossier', ['IStorage', function (storage) {
	return {
		restrict   : 'EAC',
		template : template,
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			allowDrafts : "@",
			target : "@linkTarget"
		},
		link : function ($scope) {

		}
	};
}]);
});
