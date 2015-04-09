define(['app', 'angular', 'lodash', 'jquery', 'text!./km-reference.html'], function(app, angular, _, $, template) { 'use strict';

	app.directive('kmReference', [function ()
	{
		return {
			restrict: 'EAC',
			template: template,
			replace: false,
			transclude: true,
			require : "?ngModel",
			scope: {
				binding   : '=ngModel',
				loaderFn  : "&loader",
				orderByFn : "&orderBy"
			},
			link: function ($scope, $element, $attr, ngModelController)
			{
				//Init
				$scope.references = [];
				$scope.multiple = $attr.multiple!==undefined;
				$.extend($scope.editor, {
					references  : null,
					visible     : false
				});

				//Watchers

				$scope.$watch("binding", $scope.load);
				$scope.$watch('binding', function() {
					ngModelController.$setViewValue($scope.binding);
				});

				$scope.$watch("editor.visible", function(_new, _old)
				{
					if(_new!=_old &&  _new) $element.find("#editReference").modal("show");
					if(_new!=_old && !_new) $element.find("#editReference").modal("hide");
				});

				$scope.editor = {};

				//====================
				//
				//====================
				$scope.load = function()
				{
					$scope.references = [];

					if($scope.binding)
					{
						var oBinding = $scope.binding;

						if (!angular.isArray(oBinding))
							oBinding = [oBinding];

						$scope.references = $scope.clone(oBinding);

						angular.forEach(oBinding, function(binding, index)
						{
							$scope.references[index].__loading = true;
							$scope.references[index].__binding = binding;

							$scope.loaderFn({ identifier : binding.identifier })
								  .then(function(data)  { $scope.load_onSuccess(index, data); },
										function(error) { $scope.load_onError  (index, error.data, error.status); });
						});
					}
				};

				//====================
				//
				//====================
				$scope.load_onSuccess = function(index, data)
				{
					var oBinding = $scope.references[index].__binding;

					$scope.references[index] = data;
					$scope.references[index].__binding   = oBinding;
					$scope.references[index].__loading   = false;
					$scope.references[index].__hasError  = false;
					$scope.references[index].__error     = undefined;
					$scope.references[index].__errorCode = undefined;
				};

				//====================
				//
				//====================
				$scope.load_onError = function(index, error, status)
				{
					$scope.references[index].__error = error || "unknown error";
					$scope.references[index].__errorCode = status;
					$scope.references[index].__loading = false;
				};

				//====================
				//
				//====================
				$scope.save = function()
				{
					var oNewBinding = [];

					angular.forEach($scope.references, function(ref)
					{
						if(ref.__binding)
							oNewBinding.push(ref.__binding);
					});

					if ($.isEmptyObject(oNewBinding))
						oNewBinding = undefined;

					if (oNewBinding && !$scope.multiple)
						oNewBinding = oNewBinding[0];

					$scope.binding = oNewBinding;
				};

				//====================
				//
				//====================
				$scope.remove = function(reference)
				{
					var index= $scope.references.indexOf(reference);

					if(index>=0)
						$scope.references.splice(index, 1);

					$scope.save();
				};

				//====================
				//
				//====================
				$scope.loadAllReferences = function(reload)
				{
					if($scope.editor.references && !reload)
						return;

					$scope.isLoading = true;

					$scope.loaderFn({ identifier: null }).then(
						function(data) {
							$scope.isLoading = false;
							$scope.editor.references = $scope.clone(data);
						},
						function(err) {
							$scope.isLoading = false;
							$scope.editor.error = err;
						});
				};

				//====================
				//
				//====================
				$scope.clone = function(data)
				{
					return angular.fromJson(angular.toJson(data)); //clone;
				};

				//====================
				//
				//====================
				$scope.addReference = function()
				{
					$scope.loadAllReferences();
					$scope.editor.clearChecks();
					$scope.editor.search  = null;
					$scope.editor.visible = true;
				};

				//====================
				//
				//====================
				$scope.editor.save = function()
				{
					$.each($scope.editor.references, function(index, ref)
					{
						var oNewRef = $scope.clone(ref); //clone;

						oNewRef.__binding = { identifier: ref.identifier };
						oNewRef.__checked = undefined;

						if (ref.__checked) {
							if (!$scope.multiple)
								$scope.references = [];

							$scope.references.push(oNewRef);
							$scope.save();

							if (!$scope.multiple)
								return false;
						}
					});

					$scope.editor.close();
				};

				//====================
				//
				//====================
				$scope.editor.clearChecks = function()
				{
					if(!$scope.editor.references)
						return;

					angular.forEach($scope.editor.references, function(value) {
						value.__checked = false;
					});
				};

				//====================
				//
				//====================
				$scope.editor.close = function()
				{
					$scope.editor.search  = null;
					$scope.editor.visible = false;
				};

				//====================
				//
				//====================
				$scope.editor.filterExcludeSelected = function(ref)
				{
					return !_.findWhere($scope.references, { identifier: ref.identifier });
				};

				//====================
				//
				//====================
				$scope.editor.sortReference = function(ref)
				{
					if($scope.orderByFn)
						return $scope.orderByFn({reference : ref});
				};
			}
		};
	}]);

});
