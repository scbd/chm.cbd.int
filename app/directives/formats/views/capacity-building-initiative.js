define(['app', 'angular', 'text!./capacity-building-initiative.html', './organization-reference', 'utilities/km-storage', 'lodash','directives/forms/km-value-ml'], function(app, angular, template, _){

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

				$scope.implementingOrganizations  = [];
				//====================
				//
				//====================
				$scope.$watch("document.implementingAgencies", function(newVal)
				{
					var orgs = angular.fromJson(angular.toJson(newVal || []));
					var loadRecords = [];
					angular.forEach(orgs, function(org){
						loadRecords.push($scope.loadRecords(org.identifier));
					});

					$q.all(loadRecords).then(function(data){
						$scope.implementingOrganizations  = data;
					});
				});

				$scope.executingOrganizations = [];
				//====================
				//
				//====================
				$scope.$watch("document.executingAgencies", function(newVal)
				{
					var orgs = angular.fromJson(angular.toJson(newVal || []));
					var loadRecords = [];
					angular.forEach(orgs, function(org){
						loadRecords.push($scope.loadRecords(org.identifier));
					});

					$q.all(loadRecords).then(function(data){
						$scope.executingOrganizations  = data;
					});
				});

				$scope.collaboratingOrganizations = [];
				//====================
				//
				//====================
				$scope.$watch("document.collaboratingPartners", function(newVal)
				{
					var orgs = angular.fromJson(angular.toJson(newVal || []));
					var loadRecords = [];
					angular.forEach(orgs, function(org){
						loadRecords.push($scope.loadRecords(org.identifier));
					});

					$q.all(loadRecords).then(function(data){
						$scope.collaboratingOrganizations  = data;
					});
				});

				$scope.coreFundingOrganizations = [];
				//====================
				//
				//====================
				$scope.$watch("document.coreFundingSources", function(newVal)
				{
					var orgs = angular.fromJson(angular.toJson(newVal || []));
					var loadRecords = [];
					angular.forEach(orgs, function(org){
						loadRecords.push($scope.loadRecords(org.identifier));
					});

					$q.all(loadRecords).then(function(data){
						$scope.coreFundingOrganizations  = data;
					});
				});

				$scope.coFinancingOrganizations = [];
				//====================
				//
				//====================
				$scope.$watch("document.coFinancingSources", function(newVal)
				{
					var orgs = angular.fromJson(angular.toJson(newVal || []));
					var loadRecords = [];
					angular.forEach(orgs, function(org){
						loadRecords.push($scope.loadRecords(org.identifier));
					});

					$q.all(loadRecords).then(function(data){
						$scope.coFinancingOrganizations  = data;
					});
				});

				$scope.$watch("document.geographicScope", function(newVal)
				{
					if(newVal == undefined || newVal == null){ $scope.geographicScope = undefined;}
					else {
						$scope.geographicScope = Object.keys( newVal ).map( v => ({ [v] : newVal[v] }) )[0];
					}
				});

				$scope.$watch("document.geographicScope.customValue", function(newVal)
				{
					if(newVal == undefined || newVal == null){ $scope.customValue = undefined;}
					else {
						$scope.customValue = Object.keys( newVal ).map( v => ({ [v] : newVal[v] }) )[0];
					}
				});
				//============================================================
				//
				//============================================================
				$scope.loadRecords = function(identifier) {

					if (identifier) { //lookup single record
						var deferred = $q.defer();

						storage.documents.get(identifier)
							.then(function(r) {
								deferred.resolve(r.data);
							}, function(e) {
								if (e.status == 404) {
									storage.drafts.get(identifier)
										.then(function(r) { deferred.resolve(r.data);},
											function(e) { deferred.reject (e);});
								}
								else {
									deferred.reject (e);
								}
							});
						return deferred.promise;
					}
				};

			}
		};
	}]);
});
