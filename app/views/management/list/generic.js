define(['app', 'authentication', 'directives/management/generic-record-list'], function() { 'use strict';

    return ['$scope', '$route', '$http', function($scope, $route, $http) {

        $scope.schema = $route.current.schema;

        load();

        //======================================================
        //
        //
        //======================================================
        function load() {

            delete $scope.error;

            $http.get("/api/v2013/documents?collection=my&$filter=type eq '" + $scope.schema + "'").then(function(res){

                $scope.records = res.data.Items;

            }).catch(function(res){

                $scope.records = [];
                $scope.error   = res.data || res;

                console.error($scope.error);
            });

        }

    }];
});
