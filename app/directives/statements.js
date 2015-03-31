define(['text!./statements.html', 'app'], function(template, app) { 'use strict';

app.directive('statements', ['$http', function($http) {

    return {
        priority: 0,
        restrict: 'EAC',
        template: template,
        replace: true,
        transclude: false,
        scope: {
            pageSize: "@",
            showPager: "@",
            fullListUrl: "@",
            theme: "@",
            sortOrder: "@",
            maxItems: "@"
        },
        link: function ($scope) {
            $scope.docs = [];
            $scope.currentPage = 0;
            $scope.pageSize    = parseInt($scope.pageSize || 20);
            $scope.showPager   = $scope.showPager == "true";

            $http.get('/api/v2013/index/',
                {
                    params: {
                        q: "schema_s:statement AND theme_ss:" + $scope.theme || "*",
                        sort: $scope.sortOrder || "date_dt desc",
                        rows: parseInt($scope.maxItems || 1000),
                        fl  : "id, symbol_s, title_t, date_dt"
                    }
                }).success(function (data) {
                    $scope.docs = data.response.docs;
                });

            $scope.numberOfPages = function () {
                return Math.ceil($scope.docs.length / $scope.pageSize);
            };

            $scope.isPagerVisible = function () {
                return $scope.showPager === true && $scope.docs.length > $scope.pageSize;
            };

            $scope.hasRecords = function () {
                return $scope.docs.length > 0;
            };

            $scope.disablePrevious = function () {
                return $scope.currentPage === 0;
            };

            $scope.disableNext = function () {
                return $scope.currentPage >= $scope.docs.length / $scope.pageSize - 1;
            };
        }
    };
}]);
});
