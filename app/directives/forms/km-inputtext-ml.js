define(['app', 'angular', 'jquery', 'lodash', 'text!./km-inputtext-ml.html'], function(app, ng, $, _, template) { 'use strict';

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

				//==============================
				//
				//==============================
				$scope.$watch('binding', function(text) {

					text = text || {};

					_.forEach($scope.locales || _.keys(text), function(l){
						text[l] = text[l] || "";
					});

					$scope.text = _.defaults(text, $scope.text||{});

					updateText();

				}, true);

				//==============================
				//
				//==============================
				$scope.$watch('text',    updateText, true);
				$scope.$watch('locales', updateText, true);

				//==============================
				//
				//==============================
				function updateText(){

					var text = _(ng.extend($scope.binding || {}, $scope.text || {})).pick($scope.locales||[]).forEach(function(value, key, text){
						if(!value)
							delete text[key];
					}).value();

					if(_.isEmpty(text))
						text = undefined;

					try { ngModelController.$setViewValue(text); } catch(e) {}
				}

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
