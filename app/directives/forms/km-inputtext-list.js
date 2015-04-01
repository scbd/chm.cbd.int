define(['app', 'angular', 'jquery', 'text!./km-inputtext-list.html'], function(app, angular, $, template) { 'use strict';

	app.directive('kmInputtextList', [function ()
	{
		return {
			restrict: 'EAC',
			template: template,
			replace: true,
			transclude: false,
			require : "?ngModel",
			scope: {
				placeholder : "@",
				binding     : "=ngModel",
				required    : "@"
			},
			link: function ($scope, $element, attrs, ngModelController)
			{
				$scope.skipLoad = false;
				$scope.texts    = [];
				$scope.$watch('binding', $scope.load);
				$scope.$watch('binding', function() {
					ngModelController.$setViewValue($scope.binding);
				});

				//==============================
				//
				//==============================
				$scope.load = function ()
				{
					if($scope.skipLoad)
					{
						$scope.skipLoad = false;
						return;
					}

					var oBinding = $scope.binding || [];

					$scope.texts = [];

					angular.forEach(oBinding, function(text)
					{
						$scope.texts.push({value : text});
					});
				};

				//==============================
				//
				//==============================
				$scope.remove = function (index)
				{
					$scope.texts.splice(index, 1);

					$scope.save();
				};

				//==============================
				//
				//==============================
				$scope.save = function ()
				{
					var oNewBinding = [];
					var oText       = $scope.texts;

					angular.forEach(oText, function(text)
					{
						if($.trim(text.value)!="")// jshint ignore:line
							oNewBinding.push($.trim(text.value));
					});

					$scope.binding  = !$.isEmptyObject(oNewBinding) ? oNewBinding : undefined;
					$scope.skipLoad = true;
				};

				//==============================
				//
				//==============================
				$scope.getTexts = function ()
				{
					if($scope.texts.length==0)// jshint ignore:line
						$scope.texts.push({value : ""});

					var sLastValue = $scope.texts[$scope.texts.length-1].value;

					//NOTE: IE can set value to 'undefined' for a moment
					if(sLastValue && sLastValue!="")// jshint ignore:line
						$scope.texts.push({value : ""});

					return $scope.texts;
				};

				//==============================
				//
				//==============================
				$scope.isRequired = function()
				{
					return $scope.required!=undefined && $.isEmptyObject($scope.binding);// jshint ignore:line
				};
			}
		};
	}]);
});
