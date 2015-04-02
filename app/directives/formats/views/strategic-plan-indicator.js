define(['app', 'angular', 'text!./strategic-plan-indicator.html', 'jquery', 'utilities/km-storage'], function(app, angular, template, $){

app.directive('viewStrategicPlanIndicator', ['IStorage', function (storage) {
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
		link : function ($scope) {

			//====================
			//
			//====================
			$scope.$watch("document.organizations", function () {
				if ($scope.document) {
					$scope.organizations = angular.fromJson(angular.toJson($scope.document.organizations));

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
								.error(function () {
									ref.document = undefined;
									ref.error = error;
									ref.errorCode = code;
								});
						}

						ref.document = undefined;
						ref.error = error;
						ref.errorCode = code;

					});
			};

			//====================
			//
			//====================
			$scope.canShowIcon = function () {
				return $scope.document!==undefined && !$.isEmptyObject($scope.icon);
			};

		}
	};
}]);
});
