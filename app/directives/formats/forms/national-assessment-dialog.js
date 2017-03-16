define(['text!./national-assessment-dialog.html', 'app', './national-assessment'], 
function(template, app) { 'use strict';
app.directive("editNationalAssessmentDialog", [function() {
		return {
			restrict: 'EA',
			template: template,
			replace: true,
			scope: {
				qs:'='
			},
			link: function($scope) {
				$scope.queryString = $scope.qs;

				console.log($scope.queryString);

				$scope.query = function(){
					return $scope.qs;
					console.log('from directive');
				}
			}
		};
	}]);
});