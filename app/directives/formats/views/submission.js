define(['app', 'angular', 'text!./submission.html', 'lodash', './organization-reference', 'utilities/km-storage'], 
function(app, angular, template, _){

	app.directive('viewSubmission', ["IStorage", "$http", "Enumerable", "$filter", "$q", function (storage, $http, Enumerable, $filter, $q) {
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
				
				$scope.organization  = [];
				$scope.notifications  = [];
				//====================
				//
				//====================
				$scope.$watch("document.organization", function(newVal, oldVal)
				{
					if(newVal){
						if(newVal!=oldVal){
							var query = {
								q: "id:" + newVal.identifier,
								fl: "identifier_s,title_s,acronym_s,organizationType_s,address_s,emails_ss,websites_ss,phones_ss,city_s"
							};
							loadRecords(query).then(function(data){
							$scope.organization  = _.head(data);
							});
						}
					}
					else
						$scope.organization  = [];
				});
				//====================
				//
				//====================
				$scope.$watch("document.notifications", function(newVal, oldVal)
				{
					if(newVal){
						if(newVal!=oldVal){
							var query = {
								q: "identifier_s:(" + _.map(newVal, 'identifier').join(' ') + ')',
								fl: "identifier_s,title_s,acronym_s,reference_s, symbol_s"
							};
							loadRecords(query).then(function(data){
								$scope.notifications  = data;
							});
						}
					}
					else
						$scope.notifications  = [];
				});

				//============================================================
				//
				//============================================================      
				function loadRecords(query) {
				
					return $http.get("https://api.cbd.int/api/v2013/index", {params: query,cache: true})
						.then(function (results) {
							return results.data.response.docs;
						});
				};

			}
		};
	}]);
});
