define(['app', 'angular', 'jquery', 'text!./km-inputtext-ml.html'], function(app, angular, $, template) { 'use strict';

	app.directive('kmTextboxMl', [function ()
	{
		return {
			restrict: 'EAC',
			template: template,
			replace: true,
			require : "?ngModel",
			scope: {
				placeholder: '@',
				ngDisabledFn : '&ngDisabled',
				binding    : '=ngModel',
				locales    : '=',
				rows       : '=',
				required   : "@",
				ngChange   : "&"
			},
			link: function ($scope, element, attrs, ngModelController)
			{
				$scope.text = {};
				$scope.$watch('locales', $scope.watchLocales);
				$scope.$watch('binding', $scope.watchBinding);
				$scope.$watch('binding', function() {
					try { ngModelController.$setViewValue($scope.binding); } catch(e) {}
				});

				//==============================
				//Remove value of not selected languages/empty languages
				//==============================
				$scope.watchLocales = function()
				{
					var oLocales = $scope.locales || [];
					var oBinding = $scope.binding || {};
					var oText    = $scope.text;

					angular.forEach(oLocales, function(locale) {
						oText[locale] = oBinding[locale] || oText[locale]; });
				};

				//==============================
				//Remove value of not selected languages/empty languages
				//==============================
				$scope.watchBinding = function()
				{
					var oLocales = $scope.locales || [];
					var oBinding = $scope.binding || {};
					var oText    = $scope.text;

					angular.forEach(oLocales, function(locale) {
						oText[locale] = oBinding[locale]; });
				};

				//==============================
				//Remove value of not selected languages/empty languages
				//==============================
				$scope.onchange = function()
				{
					var oLocales    = $scope.locales || [];
					var oText       = $scope.text    || {};
					var oNewBinding = {};

					angular.forEach(oLocales, function(locale)
					{
						if($.trim(oText[locale])!="")// jshint ignore:line
							oNewBinding[locale] = oText[locale];
					});

					$scope.binding = !$.isEmptyObject(oNewBinding) ? oNewBinding : undefined;
					$scope.ngChange();
				};

				//==============================
				//
				//==============================
				$scope.isRequired = function()
				{
					return $scope.required!=undefined && $.isEmptyObject($scope.binding); // jshint ignore:line
				};

				//==============================
				//
				//==============================
				$scope.isShowLocale = function()
				{
					return $scope.locales && $scope.locales.length>1;
				};
			}
		};
	}]);
});
