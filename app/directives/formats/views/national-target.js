define(['app', 'text!./national-target.html', 'lodash', 'utilities/km-storage',
'directives/forms/km-value-ml'], function(app, template, _){

app.directive('viewNationalTarget', ["$q", "IStorage", function ($q, storage) {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			target  : "@linkTarget",
			allowDrafts : "@"
		},
		link : function ($scope)
		{

			if(!$scope.target)
				$scope.target = '_blank';
		}
	};
}]);
});
