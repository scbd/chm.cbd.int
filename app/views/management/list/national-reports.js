define(['app', 'authentication'], function() { 'use strict';

    return ['$scope', '$route', '$http', function($scope, $route, $http) {

        $scope.reportType = $route.current.reportType;

        load();

        //======================================================
        //
        //
        //======================================================
        function load() {

            delete $scope.error;

            var url = "";

            if($scope.reportType=="nr")    url = "/api/v2013/documents?collection=my&$filter=type eq 'nationalReport'";
            if($scope.reportType=="nbspa") url = "/api/v2013/documents?collection=my&$filter=type eq 'nationalReport'";
            if($scope.reportType=="other") url = "/api/v2013/documents?collection=my&$filter=type eq 'nationalReport'";

            $http.get(url).then(function(res){

                $scope.records = res.data.Items;

            }).catch(function(res){

                $scope.records = [];
                $scope.error   = res.data || res;

                console.error($scope.error);
            });

        }

    }];
});
