define(['app', 'text!./national-target.html', 'lodash', 'utilities/km-storage'], function(app, template, _){

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
			//===============
			//
			//===============
			$scope.$watch("document.aichiTargets", function(refs) {
				if(refs){
					$q.when(loadReferences(refs, { info : true })).then(function(result){
						$scope.aichiTargets = result;
					});
				}
			});

			//===============
			//
			//===============
			$scope.$watch("document.otherAichiTargets", function(refs) {
				if(refs){
					$q.when(loadReferences(refs, { info : true })).then(function(result){
						$scope.otherAichiTargets = result;
					});
				}
			});

			//===============
			//
			//===============
			function loadReferences(refs, options) {

				if (!refs)
					return;

				options = _.extend(options || {}, { cache: true });

				return $q.all(_.map(refs, function(ref) {
					return storage.documents.get(ref.identifier, options)
						.then(function(res) {
							return res.data;
						});
				}));
			}
		}
	};
}]);
});
