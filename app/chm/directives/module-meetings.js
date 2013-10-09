angular.module('kmApp').compileProvider // lazy
.directive('meetings', ['authHttp', function ($http) {
    return {
        priority: 0,
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/module-meetings.partial.html',
        replace: true,
        transclude: false,
        scope: {
            cmsParamsFn: "&cmsParams"
        },
        link: function ($scope) {
            $scope.meetings = [];
            $scope.currentPage = 0;
            $scope.pageSize = $scope.cmsParamsFn().pageSize || 20;
            $scope.showPager = $scope.cmsParamsFn().showPager || false;
            $scope.fullListUrl = $scope.cmsParamsFn().fullListUrl;
        },
        controller: ['$scope', 'authHttp', 'underscore', function ($scope, $http, _) {
            $http.get('/api/v2013/index/', 
                {
                    params: {
                           q: "schema_s:meeting AND theme_ss:" + ($scope.cmsParamsFn().theme.code || "*"),
                          fq: $scope.cmsParamsFn().filterQuery || "",
                        sort: $scope.cmsParamsFn().sortOrder || "",
                        rows: $scope.cmsParamsFn().maxItems || 1000,
                        fl  : ""
                    }
                }).success(function (data) {
                    $scope.meetings = data.response.docs;
                });

            $http.get("/api/v2013/thesaurus/domains/countries/terms", { cache: true })
                .success(function (data) {
                    $scope.countries = data;
                });

            $scope.getCountryName = function (code) {
                if ($scope.countries) {
                    var oCountry = _.find($scope.countries, function (t) { return t.identifier == code });

                    if (oCountry)
                        return oCountry.title || oCountry.name;
                }

                return code;
            }

            $scope.numberOfPages = function () {
                return Math.ceil($scope.meetings.length / $scope.pageSize);
            }

            $scope.isPagerVisible = function () {
                return ($scope.showPager === true) && ($scope.meetings.length > $scope.pageSize);
            }

            $scope.hasRecords = function () {
                return $scope.meetings.length > 0;
            }

            $scope.disablePrevious = function () {
                return $scope.currentPage == 0;
            }

            $scope.disableNext = function () {
                return $scope.currentPage >= $scope.meetings.length / $scope.pageSize - 1
            }
        }]
    }
}]);