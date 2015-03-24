angular.module('kmApp') // lazy
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
         function ($scope, $rootScope, authentication, $location)
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
            $scope.nationalFinanceFilter = function(entity){
                return entity && entity.type=='Finance';
            }

            $scope.getURL = function(schema){
                if(schema)
                    if(schema.type=='nationalReports'){
                        return $scope.editUrl + '/nationalReport?type='  + schema.editType +
                            (schema.identifier=='nationalStrategicPlan' ? '&reportType=B0EBAE91-9581-4BB2-9C02-52FCF9D82721' : '');
                    }
                    else
                        return $scope.editUrl + '/' + schema.identifier;

            }

            $scope.isActiveMenu = function(schema){
                if(schema && $location)
                    if(schema.type=='nationalReports'){
                        var qType = $location.search().type
                        if(qType){
                            return ($location.url().indexOf("/" + schema.identifier) >= 0) && qType == schema.type;
                        }
                        else
                            return $location.url().indexOf("/" + schema.identifier) >= 0
                    }
                    else
                        return $location.url().indexOf("/" + schema.identifier) >= 0

            }

        }]
    }
}]);
