define(['app', 'text!./national-report-6.html', 'lodash', 'utilities/km-storage'], function(app, template, _){

app.directive('viewNationalReport6', ["$q", "IStorage", function ($q, storage) {
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

		},
		controller	:  ["$scope", "$http","$rootScope", "$q", "$location", "$filter", 'IStorage', "editFormUtility",
 						"navigation", "authentication", "siteMapUrls", "Thesaurus", "guid", "$route", 
			function ($scope, $http, $rootScope, $q, $location, $filter, storage, editFormUtility, navigation, authentication, siteMapUrls, thesaurus, guid, $route) {

				$scope.$watch('document.nationalTargets', function(newVal, old){
					
					if(!$scope.document)
						return;				
					
					var nationalTargets=[];
					_.each($scope.document.nationalTargets, function (mod) {
						if(mod.identifier)
							nationalTargets.push(storage.documents.get(mod.identifier));
					});					

					$q.all(nationalTargets)
					.then(function(results){					
						var documents = _.map(results, function(result){ return result.data || {}; });
						$scope.nationalTargets = documents;
					});
				});

				$scope.getNationalTargetTitle = function(identifier){

					if($scope.nationalTargets){
						var nationalTarget = _.find($scope.nationalTargets, function(target){
												return target && target.header.identifier == identifier; 
											});
						if(nationalTarget)
							return nationalTarget.title
					}	
				}
		}]
	};
}]);
});
