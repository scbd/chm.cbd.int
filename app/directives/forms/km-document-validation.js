define(['app', 'text!./km-document-validation.html'], function(app, template) { 'use strict';

	app.directive('kmDocumentValidation', ["$timeout", function ($timeout)
	{
		return {
			restrict: 'EAC',
			template: template,
			replace: true,
			transclude: true,
			scope: {
				report : '=ngModel',
			},
			link: function ($scope, $element) {

				//====================
				//
				//====================
				$scope.jumpTo = function(field) {

					var qLabel = $element.parents("[km-tab]:last").parent().find("form[name='editForm'] label[for='" + field + "']:first");
					var sTab   = qLabel.parents("[km-tab]:first").attr("km-tab");

					if (sTab) {
						var qBody = $element.parents("body:last");

						$scope.$parent.tab = sTab;
						//$scope.$parent.selectedIndex = sTab;

						$timeout(function jumpTo(){
							qBody.stop().animate({ scrollTop : qLabel.offset().top-50 }, 300);
						});
					}
				};

				//====================
				//
				//====================
				$scope.getLabel = function(field) {

					var qLabel = $element.parents("[km-tab]:last").parent().find("form[name='editForm'] label[for='" + field + "']:first");

					if (qLabel.size() != 0)// jshint ignore:line
						return qLabel.text();

					return field;
				};


				//====================
				//
				//====================
				$scope.isValid = function() {
					return $scope.report && (!$scope.report.errors || $scope.report.errors.length == 0);// jshint ignore:line
				};

				//====================
				//
				//====================
				$scope.hasErrors = function() {
					return $scope.report && $scope.report.errors && $scope.report.errors.length != 0;// jshint ignore:line
				};

				//====================
				//
				//====================
				$scope.getTranslation = function(code) {
					if (code==null || code==""            ) return "Unknown error"; // jshint ignore:line
					if (code == "Error.Mandatory"         ) return "Field is mandatory";
					if (code == "Error.InvalidValue"      ) return "The value specified is invalid";
					if (code == "Error.InvalidProperty"   ) return "This value cannot be specified";
					if (code == "Error.UnspecifiedLocale" ) return "A language is use but not speficied in your document";
					if (code == "Error.UnexpectedTerm"    ) return "A specified term cannot be used";
					if (code == "Error.InvalidType"       ) return "The fields type is invalid";
					return code;
				};
			}
		};
	}]);

});
