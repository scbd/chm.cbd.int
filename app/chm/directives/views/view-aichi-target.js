angular.module('kmApp').compileProvider // lazy
.directive('viewAichiTarget', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-aichi-target.partial.html',
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "="
		},
		controller: ['$scope', 'IStorage', function ($scope, storage) {
			//====================
			//
			//====================
			$scope.$watch(function () { return angular.toJson($scope.document.resources); }, function (_new) {
				$scope.resources = angular.fromJson(angular.toJson($scope.document.resources))

				if ($scope.document.resources) {
					for (var idx = 0; idx < $scope.document.resources.length; idx++) {
						$scope.loadReferences($scope.document.resources[idx].references);
					}
				}
			});

			//====================
			//
			//====================
			$scope.$watch(function () { return angular.toJson($scope.document.champions); }, function (_new) {
				$scope.champions = angular.fromJson(angular.toJson($scope.document.champions))

				if ($scope.document.champions) {
					for (var idx = 0; idx < $scope.document.champions.length; idx++) {
						$scope.loadReferences($scope.document.champions[idx].organizations);
					}
				}
			});

			//====================
			//
			//====================
			$scope.$watch("document.strategicPlanIndicators", function (indicators) {
					$scope.strategicPlanIndicators = indicators ? angular.fromJson(angular.toJson(indicators)) : undefined;

					if ($scope.strategicPlanIndicators) {
						$scope.loadReferences($scope.strategicPlanIndicators, true);
					}
				});

			//====================
			//
			//====================
			$scope.$watch("document.otherStrategicPlanIndicators", function (indicators) {
				$scope.otherStrategicPlanIndicators = indicators ? angular.fromJson(angular.toJson(indicators)) : undefined;

				if ($scope.otherStrategicPlanIndicators) {
					$scope.loadReferences($scope.otherStrategicPlanIndicators, true);
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
}]);
