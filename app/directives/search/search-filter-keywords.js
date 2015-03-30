define(['text!./search-filter-keywords.html', 'app'], function(template, app) { 'use strict';

    app.directive('searchFilterKeywords', function () {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        // require : "?ngModel",
        scope: {
            // placeholder: '@',
            // ngDisabledFn : '&ngDisabled',
            title: '@title',
            value: '=ngModel',
            query: '=query',
            // locales    : '=',
            // rows       : '=',
            // required   : "@"
        },
        controller: ["$scope", function ($scope) {

            $scope.value = $scope.value||'';

            $scope.updateQuery = function () {
                $scope.query.q = '';
            };

            $scope.$watch('value', function () {
                $scope.query = $scope.value == '' ? '*:*' : '(title_t:"' + $scope.value + '*" OR description_t:"' + $scope.value + '*" OR text_EN_txt:"' + $scope.value + '*")';// jshint ignore:line
            });
        }]
    };
    });
});