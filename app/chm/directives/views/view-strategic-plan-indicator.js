angular.module('kmApp').compileProvider // lazy
.directive('viewStrategicPlanIndicator', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-strategic-plan-indicator.partial.html',
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			target  : "@linkTarget",
			allowDrafts : "@"
		},
		controller: ['$scope', 'IStorage', function ($scope, storage) {



			//====================
			//
			//====================
			$scope.$watch("document.organizations", function (_new) {
				if ($scope.document) {
					$scope.organizations = angular.fromJson(angular.toJson($scope.document.organizations))

					if ($scope.organizations)
						$scope.loadReference($scope.organizations);
				}
			});



			//====================
			//
			//====================
			$scope.loadReference = function (ref) {

				storage.documents.get(ref.identifier, { cache: true })
					.success(function (data) {
						ref.document = data;
					})
					.error(function (error, code) {
						if (code == 404 && $scope.allowDrafts == "true") {

							storage.drafts.get(ref.identifier, { cache: true })
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
			}

			//====================
			//
			//====================
			$scope.canShowIcon = function () {
				return $scope.document!=undefined && !jQuery.isEmptyObject($scope.icon);
			};

		}]
	}
}]);
