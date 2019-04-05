define(['app', 'text!./km-form-languages.html','jquery'], function(app, template) { 'use strict';

	app.directive('kmFormLanguages', [function ()
	{
		return {
			restrict: 'EAC',
			template: template,
			replace: true,
			transclude: true,
			scope: {
				binding : '=ngModel',
			},
			link : function ($scope, $element, $attr) {

				if($attr.single=='true')
					$element.find('#ddlLanguage').removeAttr('multiple')
				$scope.locales = [
					{identifier:"ar", name:"Arabic"  },
					{identifier:"en", name:"English" },
					{identifier:"es", name:"Spanish" },
					{identifier:"fr", name:"French"  },
					{identifier:"ru", name:"Russian" },
					{identifier:"zh", name:"Chinese" }
				];

				$scope.isVisible = function() {
					return $scope.binding!==undefined && $scope.binding!==null;
				};
				
			}
		};
	}]);
});
