define(['app', 'angular', 'underscore', 'text!./national-indicator.html', 'utilities/km-storage'], function(app, angular, _, template){

app.directive('viewNationalIndicator',  ["$q", "IStorage", function ($q, storage) {
	return {
		restrict   : 'EAC',
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
			//===============
			//
			//===============
			$scope.$watch("document.strategicPlanIndicators", function(refs) {

				if(refs){
					$q.when(loadReferences(refs)).then(function(result){
						$scope.strategicPlanIndicators = result;
					});
				}
			});

			//===============
			//
			//===============
			function loadReferences(refs) {

				if (!refs)
					return;

				return $q.all(_.map(refs, function(ref) {
					return storage.documents.get(ref.identifier, { info: "", cache: true })
						.then(function(res) {
							return res.data;
						});
				}));
			}
		}
	};
}]);
});
