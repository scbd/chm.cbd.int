define(['app', 'angular', 'underscore', 'text!./aichi-target.html', 'utilities/km-storage'], function(app, angular, _, template){

app.directive('viewAichiTarget', ["$http", 'IStorage', '$q', function ($http, storage, $q) {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			allowDrafts : "@",
			target : "@linkTarget"
		},
		link : function ($scope) {

			//====================
			//
			//====================
			$scope.$watch("document.resources", function (resources) {
				$scope.resources = resources ? angular.fromJson(angular.toJson(resources)) : undefined;

				if ($scope.resources) {
					for (var idx = 0; idx < $scope.resources.length; idx++) {
						loadReferences($scope.resources[idx].references, true);
					}
				}
			});

			//====================
			//
			//====================
			$scope.$watch("document.champions", function (champions) {
				$scope.champions = champions ? angular.fromJson(angular.toJson(champions)) : undefined;

				if ($scope.champions) {
					for (var idx = 0; idx < $scope.champions.length; idx++) {
						loadReferences($scope.champions[idx].organizations);
					}
				}
			});

			//====================
			//
			//====================
			$scope.$watch("document.strategicPlanIndicators", function (indicators) {
				if(indicators){

					$q.when(loadFromIndex(indicators)).then(function(result) {
						$scope.strategicPlanIndicators = result;
					});
				}
			});

			//====================
			//
			//====================
			$scope.$watch("document.otherStrategicPlanIndicators", function (indicators) {
				if(indicators){

					$q.when(loadFromIndex(indicators)).then(function(result) {
						$scope.otherStrategicPlanIndicators = result;
					});
				}
			});

			//====================
			//
			//====================
			function loadFromIndex(references)	{

				var query = {
					q: "identifier_s:("+_.pluck(references, "identifier").join(" ")+")",
					fl: "identifier_s,title_t",
					rows: 99999999
				};

				return $http.get("/api/v2013/index", { params: query, cache:true }).then(function(response) {
					return response.data.response.docs;
				});
			}

			//====================
			//
			//====================
			function loadReferences(targets, infoOnly) {

				if(!targets)
					return;

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
				});
			}
		}
	};
}]);
});
