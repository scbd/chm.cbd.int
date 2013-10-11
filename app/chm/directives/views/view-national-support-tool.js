angular.module('kmApp').compileProvider // lazy
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
				$scope.aichiTargets = loadReferences(refs, { info : true });
			});

			//===============
			//
			//===============
			$scope.$watch("document.otherAichiTargets", function (refs) {
				$scope.otherAichiTargets = loadReferences(refs, { info : true });
			});

			//===============
			//
			//===============
			$scope.$watch("document.nationalTargets", function (refs) {
				$scope.nationalTargets = loadReferences(refs, { info: true });
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