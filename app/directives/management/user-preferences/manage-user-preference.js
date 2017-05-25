define(['app', 'lodash', 'text!./manage-user-preference.html', 'ngDialog',
    'scbd-angularjs-services/generic-service'
    , './filter-user-preference'
], function (app, _, template) {

    app.directive("manageUserPreference", ['$rootScope', 'ngDialog', function ($rootScope, ngDialog) {

        return {
            restrict: "EA",
            template: template,
            replace: true,
            scope: {
                runQuery: '&',
                collection  :  '@',
            },
            controller: ['$rootScope', '$scope', '$http', 'IGenericService', 'realm', '$timeout', function ($rootScope, $scope, $http, IGenericService, realm, $timeout) {

                $scope.user = $rootScope.user;                

                function loadSavedFilters(){
                    if($scope.user && $scope.user.isAuthenticated){
                        var query = {};
                        if($scope.collectionFilter)
                            query = JSON.parse($scope.collectionFilter);
                            
                        query.realm  = realm;
                        IGenericService.query('v2016', 'me/' + $scope.collection, query)
                        .then(function (data) {
                            $scope.userFilters = data
                        });
                    }
                }
                $rootScope.$on('signIn', function(evt, user){
                    $scope.user = user;
                    loadSavedFilters()
                });

                $scope.runUserQuery = function (record) {
                    if ($scope.runQuery)
                        $scope.runQuery({ filter: record });
                }

                $scope.confirmDelete = function(record){
                    $scope.loading = true;                                            
                    $http.delete('/api/v2016/me/' + $scope.collection + '/' + record._id)
                    .then(function () {
                        $scope.userFilters.splice($scope.userFilters.indexOf(record), 1);
                    });
                    $scope.loading = false;     
                }
                
                $scope.addEdit = function(existingFilter){
                    if($rootScope.user && !$rootScope.user.isAuthenticated){
                        var signIn = $scope.$on('signIn', function(evt, data){
                                $scope.addEdit();
                                signIn();
                        });

                        $('#loginDialog').modal("show");
                    }
                    else{           
                        ngDialog.open({
                                        className : 'ngdialog-theme-default wide',
                                        template : 'newFilterDialog',
                                        scope : $scope,
                                        controller : ['$scope', function($scope){                                                
                                                if(existingFilter){
                                                    $scope.document = angular.copy(existingFilter);
                                                    $timeout(function(){
                                                        $scope.setSearchFilters(existingFilter.filters);
                                                    },100);
                                                }
                                        }]
                        });

                    }
                }


                $scope.setFilter = function(filter){
                    if(!$scope.setFilters)
                        $scope.setFilters = [];

                    $scope.setFilters.push(filter);
                }

                $scope.removeFilter = function(filter){
                    if(!$scope.setFilters)
                        return;
                        
                    $scope.setFilters = _.filter($scope.setFilters, function(fil){return fil.id!=filter.id});
                }
                $scope.getFiler = function(filter){
                    
                }

                $scope.save = function(document){
                    
                    $scope.errors = [];
                    if(!document || document.queryTitle == ''){
                        $scope.errors.push('Please enter title of the alert')
                    }
                    if(!document || !$scope.setFilters || _.isEmpty($scope.setFilters)){                                                        
                        $scope.errors.push('Please select at least one filter')
                    }
                    if($scope.errors && $scope.errors.length > 0){
                        $("#dialog-errors").animate({
                            scrollTop: 0
                        }, 600);
                        return;
                    }

                    $scope.loading = true;
                    var operation;
                    
                    document.isSystemAlert = false;
                    document.filters = $scope.setFilters;                                           
                    document.realm = realm;
                    if(!document._id)
                        operation = IGenericService.create('v2016', 'me/'  + $scope.collection, document);
                    else
                        operation = IGenericService.update('v2016', 'me/'  + $scope.collection, document._id, document);

                    operation.then(function (data) {
                            $scope.setFilters = [];
                            $scope.closeDialog();
                            if(!document._id)
                                document._id = data.id;      
                            updateRecord(document); 
                    })
                    .catch(function(error){
                            $scope.errors.push('error occurred while saving.')
                    })
                    .finally(function(){$scope.loading=false});
                }
                $scope.closeDialog = function(){
                    ngDialog.close();                                            
                }

                function updateRecord(document, delay){
                    if(!$scope.userFilters)
                        $scope.userFilters = [];
                        var existing = _.findWhere($scope.userFilters, {'_id' : document._id});
                        if(!existing){
                            $scope.userFilters.push(document);
                            existing = document;
                        }                                                       
                            existing.pendingStatus = true;                  
                            IGenericService.get('v2016', 'me/'  + $scope.collection, document._id)
                        .then(function(data){
                            existing = _.extend(existing, data);                                    
                            existing.pendingStatus = false;
                        })
                        .catch(function(err){
                            if(err && err.status == 404){
                                delay = (delay||0) + 1000
                                $timeout(updateRecord(document, delay), delay);
                            }
                        }); 
                }
                loadSavedFilters();
            }]
        };
    }]);
});