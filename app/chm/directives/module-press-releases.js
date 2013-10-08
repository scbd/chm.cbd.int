var module = angular.module('kmApp').compileProvider; // lazy

//==================================================
// ABS Press Releases
//==================================================
module.directive('pressreleases', ['authHttp', function ($http) {
    return {
        priority: 0,
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/module-press-releases.partial.html',
        replace: true,
        transclude: false,
        scope: {
            cmsParamsFn: "&cmsParams"
        },
        link: function ($scope) {
            $scope.docs        = [];
            $scope.currentPage = 0;
            $scope.pageSize    = $scope.cmsParamsFn().pageSize || 20;
            $scope.showPager   = $scope.cmsParamsFn().showPager || false;
            $scope.fullListUrl = $scope.cmsParamsFn().fullListUrl;
        },
        controller: ['$scope', 'authHttp', function ($scope, $http) {
            $http.get('/api/v2013/index/',
                {
                    params: {
                        q: "schema_s:pressRelease AND theme_ss:" + $scope.cmsParamsFn().theme.code || "*",
                        fq: $scope.cmsParamsFn().filterQuery || "",
                        sort: $scope.cmsParamsFn().sortOrder || "date_dt desc",
                        rows: $scope.cmsParamsFn().maxItems || 1000,
                        fl: ""
                    }
                }).success(function (data) {
                    $scope.docs = data.response.docs;
                })

            $scope.numberOfPages = function () {
                return Math.ceil($scope.docs.length / $scope.pageSize);
            }

            $scope.isPagerVisible = function () {
                return $scope.showPager === true && $scope.docs.length > $scope.pageSize;
            }

            $scope.hasRecords = function () {
                return $scope.docs.length > 0;
            }

            $scope.disablePrevious = function () {
                return $scope.currentPage == 0;
            }

            $scope.disableNext = function () {
                return $scope.currentPage >= $scope.docs.length / $scope.pageSize - 1
            }
        }]
    }
}]);