define(['underscore', 'app', 'authentication'], function(_) { 'use strict';

    return ['$scope', '$route', '$http', function($scope, $route, $http) {

        $scope.meetingId   = $route.current.params.meetingId;
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

            var apiUrl = '/api/v2014/meetings/'+encodeURIComponent($route.current.params.meetingId)+'/documents';

            $http.get(apiUrl, { params : { c : true } }).then(function(res){
                $scope.pages = _.range(0, Math.ceil(parseInt(res.data) / $scope.pageSize));
            });

            $http.get(apiUrl, { params : qsParams, json:true }).then(function(res){
                $scope.documents = res.data;
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
