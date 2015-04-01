angular.module('kmApp') // lazy
.directive('viewNationalSupportTool', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-national-support-tool.partial.html',
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
			$scope.$watch("document.aichiTargets", function (refs) {
				if(refs){
					$q.when(loadReferences(refs, { info : true })).then(function(result){
						$scope.aichiTargets = result;
					});
				}
			});

			//===============
			//
			//===============
			$scope.$watch("document.otherAichiTargets", function (refs) {
				if(refs){
					$q.when(loadReferences(refs, { info : true })).then(function(result){
						$scope.otherAichiTargets = result;
					});
				}
			});

			//===============
			//
			//===============
			$scope.$watch("document.nationalTargets", function (refs) {
				if(refs){
					$q.when(loadReferences(refs, { info : true })).then(function(result){
						$scope.nationalTargets = result;
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
		}]
	}
}])
