angular.module('kmApp').compileProvider // lazy
.directive("facetBar", [function () {
    return {
        priority: 0,
        restrict: 'EAC',
        templateUrl: '/app/views/management/facet-bar.partial.html',
        replace: true,
        transclude: false,
        scope: {
            schemaList:'=',
            schemaFilter:'=',
            listUrl:'@',
            editUrl:'@'
        },
        link: function($scope) {
        },
        controller : ['$scope','$rootScope', 'authentication', '$location',
         function ($scope, $rootScope, $http, authentication, $location)
        {

            //==============================
            //
            //==============================
            function userGovernment() {

                // if($scope.isAdmin() && $scope.government)
                //      return $scope.government.toLowerCase();

                if(authentication.user().government){
                    $scope.showNational = true;
                    return authentication.user().government.toLowerCase();
                }
            }
            //==============================
            //
            //==============================
            $scope.nationalReportsFilter = function(entity){
                return entity && entity.type=='nationalReports';
            }
            $scope.nationalProgressFilter = function(entity){
                return entity && entity.type=='Progress';
            }
            $scope.nationalActivitiesFilter = function(entity){
                return entity && entity.type=='Activities';
            }
            $scope.nationalReferenceFilter = function(entity){
                return entity && entity.type=='Reference';
            }
            $scope.nationalSCBDFilter = function(entity){
                return entity && entity.type=='SCBD';
            }

        }]
    }
}]);
