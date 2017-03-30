define(['text!./national-assessment-dialog.html', 'app', './national-assessment'], 
function(template, app) { 'use strict';
app.directive("editNationalAssessmentDialog", [function() {
		return {
			restrict: 'EA',
			template: template,
			replace: false,
			scope: {
				qs:'=',
				closeDialog : '&'
			},
			link: function($scope, $element, $attr) {
				$scope.queryString = $scope.qs;
				$scope.container = $scope.container;

				$scope.query = function(){
					return $scope.qs;
				}
				
				$scope.callCloseDialog = function(){
					$scope.closeDialog();
				}
			}
		};
	}]);
});