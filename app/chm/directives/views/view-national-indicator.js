angular.module('kmApp') // lazy
.directive('viewNationalIndicator', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-national-indicator.partial.html',
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			target  : "@linkTarget",
			allowDrafts : "@"
		},
		controller : ['$scope', "$q", "underscore", "IStorage", function ($scope, $q, _, storage)
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
		}]
	}
}])
