define(['app', 'text!./km-document-validation.html'], function(app, template) { 'use strict';

	app.directive('kmDocumentValidation', ["$timeout", function ($timeout)
	{
		return {
			restrict: 'EAC',
			template: template,
			replace: true,
			transclude: true,
			require : "?^mdTabs",
			scope: {
				report : '=ngModel',
			},
			link: function ($scope, $element, attribs, mdTabsCtrl) {

				//====================
				//
				//====================
				function lookup(field){

					return $element.parents("form[name='editForm']:first").find("label[for='" + field + "']:first");
				}

				//====================
				//
				//====================
				$scope.jumpTo = function(field) {

					if(!mdTabsCtrl) {
						return;
					}

					var qLabel = lookup(field);
					var tabId  = qLabel.parents("md-tab-content:first").attr("id") || "";

					var tabIndex = parseInt(tabId.replace(/.*-(\d+)$/, "$1"))-1;

					if(tabIndex>=0)
					{
						mdTabsCtrl.select(tabIndex);

						var qBody = $element.parents("body:last");

						$timeout(function jumpTo(){
							qBody.stop().animate({ scrollTop : qLabel.offset().top-50 }, 300);
						},100);
					}
				};

				//====================
				//
				//====================
				$scope.getLabel = function(field) {

					var qLabel = lookup(field);

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
