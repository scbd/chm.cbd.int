define(['app', 'text!./national-assessment.html', "lodash"], function(app, template, _){

app.directive('viewNationalAssessment', ["$q", "IStorage", function ($q, storage) {
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
			$scope.$watch("document.aichiTarget", function(refs) {
				if(refs){
					$q.when(loadReferences([refs], { info : true })).then(function(result){
						console.log(result);
						$scope.aichiTarget = result;
					});
				}
			});

			//===============
			//
			//===============
			$scope.$watch("document.nationalIndicators", function(refs) {
				if(refs){
					$q.when(loadReferences(refs, { info : true })).then(function(result){
						$scope.nationalIndicators = result;
					});
				}
			});

			//===============
			//
			//===============
			$scope.$watch("document.nationalTarget", function(refs) {
				if(refs){
					$q.when(loadReferences([refs], { info : true })).then(function(result){
						$scope.nationalTarget = result;
					});
				}
			});

			//===============
			//
			//===============
			$scope.$watch("document.strategicPlanIndicators", function(refs) {
				if(refs){
					$q.when(loadReferences(refs, { info : true })).then(function(result){
						$scope.strategicPlanIndicators = result;
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
