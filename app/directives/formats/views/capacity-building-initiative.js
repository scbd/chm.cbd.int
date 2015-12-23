define(['app', 'angular', 'text!./capacity-building-initiative.html', 'utilities/km-storage', 'lodash'], function(app, angular, template, _){

	app.directive('viewCapacityBuildingInitiative', ["IStorage", "$http", "Enumerable", "$filter", "$q", function (storage, $http, Enumerable, $filter, $q) {
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
				$scope.options  = {

					regions       : function() { return $q.all([$http.get("/api/v2013/thesaurus/domains/countries/terms", { cache: true }),
															    $http.get("/api/v2013/thesaurus/domains/regions/terms",   { cache: true })]).then(function(o) {
															    	return Enumerable.From($filter('orderBy')(o[0].data, 'name')).Union(
																		   Enumerable.From($filter('orderBy')(o[1].data, 'name'))).ToArray();
															   }); }
				};


				//====================
				//
				//====================
				$scope.$watch("document.organizations", function(_new)
				{
					$scope.organizations = angular.fromJson(angular.toJson(_new || []));

					if($scope.organizations)
						$scope.loadReferences($scope.organizations);
				});

				//====================
				//
				//====================
				$scope.loadReferences = function(targets) {

					angular.forEach(targets, function(ref){

						storage.documents.get(ref.identifier, { cache : true})
							.success(function(data){
								ref.document = data;
							})
							.error(function(error, code){
								if (code == 404 && $scope.allowDrafts == "true") {

									storage.drafts.get(ref.identifier, { cache : true})
										.success(function(data){
											ref.document = data;
										})
										.error(function(){
											ref.document  = undefined;
											ref.error     = error;
											ref.errorCode = code;
										});
								}

								ref.document  = undefined;
								ref.error     = error;
								ref.errorCode = code;

							});
					});
				};
			}
		};
	}]);
});
