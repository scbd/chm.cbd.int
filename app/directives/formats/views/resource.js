define(['app', 'angular', 'text!./resource.html', 'utilities/km-storage'], function(app, angular, template){

	app.directive('viewResource', ["IStorage", function (storage) {
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
