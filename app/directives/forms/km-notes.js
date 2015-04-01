define(['app', 'angular', 'jquery', 'text!./km-notes.html'], function(app, angular, $, template) { 'use strict';

	app.directive('kmNotes',  ["$http", "$filter", function ($http, $filter) {
	    return {
	        restrict: 'EAC',
			template: template,
	        replace: true,
	        transclude: false,
	        require: "?ngModel",
	        scope: {
	            placeholder: "@",
	            binding: "=ngModel",
	            rows: '=',
	            required: "@"
	        },
	        link: function ($scope, $element, attrs, ngModelController) {
	            $scope.timestamp = Date.now();
	            $scope.skipLoad = false;
	            $scope.texts = [];
	            $scope.$watch('binding', $scope.load);
	            $scope.$watch('binding', function () {
	                ngModelController.$setViewValue($scope.binding);
	            });

                //==============================
                //
                //==============================
                $scope.load = function () {
                    if ($scope.skipLoad) {
                        $scope.skipLoad = false;
                        return;
                    }

                    $http.get("/api/v2013/authentication/user/", { cache: true }).success(function (data) {
                        $scope.user = data;
                    });

                    var oBinding = $scope.binding || [];

                    $scope.texts = [];

                    angular.forEach(oBinding, function (text) {
                        $scope.texts.push({ value: text });
                    });
                };

                //==============================
                //
                //==============================
                $scope.remove = function (index) {
                    $scope.texts.splice(index, 1);

                    $scope.save();
                };

                //==============================
                //
                //==============================
                $scope.save = function () {
                    var oNewBinding = [];
                    var oText = $scope.texts;

                    angular.forEach(oText, function (text) {
                        if ($.trim(text.value) != "") // jshint ignore:line
                            oNewBinding.push($.trim(text.value));
                    });

                    if ($scope.newtext) {
                        if ($.trim($scope.newtext) != "") { // jshint ignore:line
                            var timestamp = $filter('date')(Date.now(), 'medium');
                            oNewBinding.push("[ " + $scope.user.name + " | " + timestamp + " ] - " + $.trim($scope.newtext));
                        }
                    }

                    $scope.binding = !$.isEmptyObject(oNewBinding) ? oNewBinding : undefined;
                    $scope.skipLoad = true;
                };

                //==============================
                //
                //==============================
                $scope.isRequired = function () {
                    return $scope.required != undefined && $.isEmptyObject($scope.binding); // jshint ignore:line
                };
            }
        };
    }]);
});
