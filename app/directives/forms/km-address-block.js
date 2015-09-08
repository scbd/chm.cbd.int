define(['app', 'text!./km-address-block.html','directives/forms/form-controls'], function(app, template) { 'use strict';

	app.directive('kmAddressBlock', ['lifeWebApiCalls',function (lifeWebApiCalls)
	{
		return {
			restrict: 'E',
			template: template,
			scope: {
				ngModel   : '=ngModel',
				locales    : '=',
				rows       : '=',
				required   : "@",
				ngChange   : "&"
			},
			link: function ($scope, $element, $attrs,ngModelController)
			{
	
				$scope.attr       = $attrs;
				$scope.forceNoLanguage   = $attrs.forceNoLanguage  !== undefined && $attrs.forceNoLanguage   !== null;
			    $scope.forceSingleString = $attrs.forceSingleString  !== undefined && $attrs.forceSingleString   !== null;
console.log('$attrs',$attrs);			
console.log('$scope.forceNoLanguage',$scope.forceNoLanguage );
console.log('forceSingleString',$scope.forceSingleString );
				
						//============================================================
						// 
						//============================================================
						function forceSingleString(data,query) {					
									return $filter('filter')(data, query,false);
						};// getEventTypes	


			}
		};
	}]);
});
