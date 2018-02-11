define(['app', 'text!./document-history.html', 'utilities/km-storage'], function(app, template){
    
    app.directive('documentHistory', ['IStorage', '$q', function (storage, $q) {
        return {
            restrict   : 'E',
            template   : template,
            replace    : true,
            transclude : false,
            scope: {
                document: "=ngModel",
                locale  : "="
            },
            link: function($scope){
                
                $scope.$watch('document.header.identifier', function(newVal, oldVal){
                    if(newVal && newVal!=oldVal){
                        $q.when(storage.documentVersions.get(newVal))
                          .then(function(data){
                              $scope.documentHistory = data.data.Items;
                          })
                    }
                });
            }
        };
    }]);
    });
    