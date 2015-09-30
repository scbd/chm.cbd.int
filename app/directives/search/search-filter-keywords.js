define(['text!./search-filter-keywords.html', 'app'], function(template, app) { 'use strict';

    app.directive('searchFilterKeywords', ['$location', function ($location) {

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
        link: function ($scope) {

            applyKeywords($scope.value || $location.search().keywords || '');

            $scope.updateQuery = function () {
                $scope.query.q = '';
            };

            $scope.$watch('value', function (keywords) {

                $location.replace();
                $location.search("keywords", keywords || null);

                applyKeywords(keywords);
            });

            function applyKeywords(keywords)
            {
                $scope.value = keywords;

                $scope.query = !keywords ? '*:*' : '(title_t:"' + keywords + '*" OR description_t:"' + keywords + '*" OR text_EN_txt:"' + keywords + '*")';
            }
        }
    };
}]);

});
