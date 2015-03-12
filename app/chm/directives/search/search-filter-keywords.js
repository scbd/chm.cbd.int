angular.module('kmApp').compileProvider.directive('searchFilterKeywords', function ($http) {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/search-filter-keywords.partial.html?'+(new Date().getTime()),
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
        link: function ($scope, element, attrs, ngModelController) {
        },
        controller: ["$scope", function ($scope) {

            $scope.value = $scope.value||'';

            $scope.updateQuery = function () {
                $scope.query.q = '';
            };

            $scope.$watch('value', function () {
                $scope.query = $scope.value == '' ? '*:*' : '(title_t:"' + $scope.value + '*" OR description_t:"' + $scope.value + '*" OR text_EN_txt:"' + $scope.value + '*")';
            });
        }]
    }
})
