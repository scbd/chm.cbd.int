define(['app', 'directives/formats/views/form-loader', 'scbd-angularjs-services/locale'], function(app) { 
    'use strict';

    return ['$scope', '$http', '$q', '$route', 'locale', function($scope, $http, $q, $route, locale){

        $scope.options = { locale : locale, currentDate : new Date()};
        var qs = $route.current.params;
        if(qs.code){
            $scope.status = 'loading'
            $q.when($http.get('/api/v2018/document-sharing/'+ qs.code))
                .then(function(result){
                    
                    if(result.status == 200){
                        $scope.sharedData = result.data;
                        $scope.document = result.data.sharedData.document.body;
                        
                        $scope.status = 'ready'
                    }
                })
                .catch(function(error){
                    $scope.status = 'error'
                    $scope.error  = error.data;
                })
                .finally(function(){
                })
        }
        else{
            $scope.message = "missing code"
        }

        if(qs.print){
            $scope.printMode = true;
            $scope.options = { locale : '*'};
        }
    }]

});
