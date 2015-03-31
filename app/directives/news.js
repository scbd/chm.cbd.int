define(['text!./news.html','app', 'authentication'], function(template, app) { 'use strict';

﻿app.directive('news', ['$http', function($http){
    return {
        priority: 0,
        restrict: 'EAC',
        template: template,
        replace: true,
        transclude: false,
        scope: {
            cmsParamsFn: "&cmsParams"
        },
        link: function ($scope) {
            $scope.docs        = [];
            $scope.currentPage = 0;
            $scope.pageSize    = $scope.cmsParamsFn().pageSize   || 20;
            $scope.showPager   = $scope.cmsParamsFn().showPager  || false;
            $scope.fullListUrl = $scope.cmsParamsFn().fullListUrl;

            $http.get('/api/v2013/index/', {
                params: {
                    q: "schema_s:news and theme_ss:" + $scope.cmsParamsFn().theme || "*",
                    fq: $scope.cmsParamsFn().filterQuery || "",
                    sort: $scope.cmsParamsFn().sortOrder || "",
                    rows: $scope.cmsParamsFn().maxItems || 1000,
                    fl: "id,date_dt,title_t,url_ss,thumbnail_s"
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
                return $scope.docs.length;
            };


            $scope.disablePrevious = function () {
                return $scope.currentPage === 0;
            };

            $scope.disableNext = function () {
                return $scope.currentPage >= $scope.docs.length / ($scope.pageSize - 1);
            };
        }
    };
}]);
});
