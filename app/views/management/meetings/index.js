define(['underscore', 'app', 'authentication'], function(_) { 'use strict';

    return ['$scope', '$http', function($scope, $http) {

        $scope.pages       = [];
        $scope.pageSize    = 50;
        $scope.currentPage =  0;

        $scope.$watch('currentPage', load);

        //==================================================
        //
        //
        //==================================================
        function load() {

            if($scope.currentPage===undefined)
                return;

            var qsParams = {
                sk : $scope.pageSize * $scope.currentPage,
                l  : $scope.pageSize
            };

            $http.get('/api/v2014/meetings', { params : { c : true } }).then(function(res){
                $scope.pages = _.range(0, Math.ceil(parseInt(res.data) / $scope.pageSize));
            });

            $http.get('/api/v2014/meetings', { params : qsParams, json:true }).then(function(res){
                $scope.meetings = res.data;
            });
        }

        //==================================================
        //
        //
        //==================================================
        $scope.setPage = function(page) {

            $scope.currentPage = Math.min(Math.max(page,0), $scope.pages.length-1);

        };

    }];
});
