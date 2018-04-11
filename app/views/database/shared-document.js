define(['app', 'directives/formats/views/form-loader'], function(app) { 
    'use strict';

    return ['$scope', '$http', '$q', '$route', function($scope, $http, $q, $route){

        var qs = $route.current.params;
        if(qs.code){
            $scope.status = 'loading'
            $q.when($http.get('/api/v2018/document-sharing/'+ qs.code))
                .then(function(result){
                    
                    if(result.status == 200){
                        $scope.sharedData = result.data;
                        $scope.document = result.data.sharedData.document.body;
                        
                    }
                })
                .finally(function(){
                    $scope.status = 'ready'
                })
        }
        else{
            $scope.message = "missing code"
        }

    }]

});
