define(['app', 'angular', 'lodash', 'text!./km-inputtext-list.html','jquery'], function(app, angular, _, template) { 'use strict';

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
			link: function ($scope)
			{
				$scope.texts = [];

				ensureLastEmpty();

				//==============================
				//
				//==============================
				$scope.$watch('binding', function(){


					var oldTexts = _($scope.texts  ).pluck('value').compact().value();
					var newTexts = _($scope.binding)               .compact().value();

					newTexts = _.isEmpty(newTexts) ? undefined : newTexts;
					oldTexts = _.isEmpty(oldTexts) ? undefined : oldTexts;

					if(areEquals(newTexts, oldTexts)) {
						return;
					}

					$scope.texts = _.map(newTexts || [], function(t){
						return { value : t };
					});

					ensureLastEmpty();

				}, true); //force deep watching

				//==============================
				//
				//==============================
				$scope.$watch('texts', function(){

					ensureLastEmpty();

					var newTexts = _($scope.texts  ).pluck('value').compact().value();
					var oldTexts = _($scope.binding)               .compact().value();

					newTexts = _.isEmpty(newTexts) ? undefined : newTexts;
					oldTexts = _.isEmpty(oldTexts) ? undefined : oldTexts;

					if(areEquals(newTexts, oldTexts)) {
						return;
					}

					//Update the binding

					var newBinding;

					if(newTexts) {

						newBinding = $scope.binding || [];
						newBinding.length = newTexts.length;             //clear the array;

						for(var i=0; i<newTexts.length;i++)
							newBinding[i] = newTexts[i];
					}

					$scope.binding = newBinding;

				}, true); //force deep watching

				//==============================
				//
				//==============================
				function ensureLastEmpty() {

					var last = _.last($scope.texts||[]);

					if(!last || last.value)
						$scope.texts.push({value : ''});
				}

				//==============================
				//
				//==============================
				function areEquals(a, b) {

					a = a||[];
					b = b||[];

					if(a.length!=b.length)
						return false;

					return a.join('|') == b.join('|');
				}

				//==============================
				//
				//==============================
				$scope.remove = function (index)
				{
					$scope.texts.splice(index, 1);
				};

				//==============================
				//
				//==============================
				$scope.isRequired = function()
				{
					return $scope.required && _($scope.texts).pluck('value').compact().isEmpty();
				};
			}
		};
	}]);
});
