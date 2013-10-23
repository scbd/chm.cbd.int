angular.module('kmApp').compileProvider // lazy
.directive('viewImplementationActivity', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-implementation-activity.partial.html',
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
			$scope.$watch("document.aichiTargets", function(refs) {
				if ($scope.document) {
					$scope.aichiTargets = angular.fromJson(angular.toJson($scope.document.aichiTargets))

					if ($scope.aichiTargets)
					{
						$scope.loadReferences($scope.aichiTargets);
					}
				}
			});

			//===============
			//
			//===============
			$scope.$watch("document.nationalIndicators", function(refs) {
				if ($scope.document) {
					$scope.nationalIndicators = angular.fromJson(angular.toJson($scope.document.nationalIndicators))

					if ($scope.nationalIndicators)
					{
						$scope.loadReferences($scope.nationalIndicators);
					}
				}
			});

			//===============
			//
			//===============
			$scope.$watch("document.nationalTargets", function(refs) {
				if ($scope.document) {
					$scope.nationalTargets = angular.fromJson(angular.toJson($scope.document.nationalTargets))

					if ($scope.nationalTargets)
					{
						$scope.loadReferences($scope.nationalTargets);
					}
				}
			});

			//====================
			//
			//====================
			$scope.$watch("document.partners", function (_new) {
				if ($scope.document) {
					$scope.partners = angular.fromJson(angular.toJson($scope.document.partners))

					if ($scope.partners)
					{
						$scope.loadReferences($scope.partners);
					}
				}
			});

			//====================
			//
			//====================
			$scope.loadReferences = function (targets, infoOnly) {

				angular.forEach(targets, function (ref) {

					var oOptions = { cache: true };

					if (infoOnly)
						oOptions.info = true;

					storage.documents.get(ref.identifier, oOptions)
						.success(function (data) {
							ref.document = data;
						})
						.error(function (error, code) {
							if (code == 404 && $scope.allowDrafts == "true") {

								storage.drafts.get(ref.identifier, oOptions)
									.success(function (data) {
										ref.document = data;
									})
									.error(function (draftError, draftCode) {
										ref.document = undefined;
										ref.error = error;
										ref.errorCode = code;
									});
							}

							ref.document = undefined;
							ref.error = error;
							ref.errorCode = code;

						});
				});
			}


		}]
	}
}])