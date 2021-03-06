define(['app', 'text!./km-date.html', 'bootstrap-datepicker','jquery'], function(app, template) { 'use strict';

	app.directive('kmDate', [function ()
	{
		return {
			restrict: 'EAC',
			template: template,
			replace: true,
			transclude: false,
			scope: {
				binding      : '=ngModel',
				placeholder  : '@',
				ngDisabledFn : '&ngDisabled',
				ngChange : '&',
			},
			    link : function(scope, element, attrs){
						
					scope.$watch('binding', function (newVal) {
						if(scope.ngChange)
							scope.ngChange();
						
					}) ;  
				}
			
		};
	}]);
});
