define(['app', 'angular', 'text!./undb-action.html', 'jquery', 'utilities/km-storage'], function(app, angular, template, $){

app.directive('viewUndbAction', ['IStorage', function (storage) {
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
            $scope.$watch("document", function () {
                if($scope.document && $scope.document.country){
                    $scope.document.country = {identifier : $scope.document.country};
                }
            });            
		}
	};
}]);
});
