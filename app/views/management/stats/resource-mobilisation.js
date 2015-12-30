define(['app', "directives/stats-display/amchart3","directives/stats-display/results-list",'authentication'], function() { 'use strict'; //"directives/stats-display/stats-display",

    return ['$scope',  '$http', '$timeout', '$filter','$rootScope',
     function($scope,  $http, $timeout, $filter,$rootScope ) {

        $scope.schema="resourcemobilization";
        $scope.chartData=[];
        $scope.government = userGovernment();
        
        $http.get("/api/v2013/thesaurus/domains/countries/terms", {cache: true}).then(function(o) {
            $scope.countries = $filter('orderBy')(o.data, 'title');
          return;
        });
        $timeout(function(){
          $http.get("/api/v2015/rm-stats/chart-data", {cache: true}).then(function(o) {

              $scope.chartData= o.data;
            return;
          });
        });

        $http.get("/api/v2015/rm-stats/source-docs", {cache: true}).then(function(o) {
            $scope.documents= o.data;
          return;
        });
        //==============================
        //
        //==============================
        function userGovernment() {
            if($rootScope.user.government){
                $scope.showNational = true;
                return $rootScope.user.government.toLowerCase();
            }
        }
    }];
});
