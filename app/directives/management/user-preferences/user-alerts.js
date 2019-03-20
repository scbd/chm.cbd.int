define(['app',
    "text!./user-alerts.html",
    'lodash',
    'moment',
    'ngDialog',
     './filter-user-preference',
    'components/scbd-angularjs-services/services/generic-service'], function (app, template, _, moment) {

    app.directive("userAlerts", ['$rootScope', 'ngDialog', function ($rootScope, ngDialog) {

        return {
            restrict: "EA",
            template: template,
            replace: true,
            scope: {
                runQuery: '&',
                collection: '@',
                runQueryInPage: '@',
                collectionFilter: '@?'
            },
            link: function ($scope, element, attrs) {},
            controller: ['$rootScope', '$scope', '$http', 'IGenericService', 'realm', '$timeout', '$location', '$route', '$element', 
                function ($rootScope, $scope, $http, IGenericService, realm, $timeout, $location, $route, $element) {

                   
                    $scope.user = $rootScope.user;
                    $scope.skipKeywordsFilter = false;
                    $scope.skipTextFilter = false;
                    $scope.systemAlertsSubscription = [];

                    $scope.skipKeywordsFilter = true;
                    $scope.skipTextFilter = true;
                
                   
                    
                    //==============================================================
                    $scope.setFilter = function(filter){
                        if(!$scope.setFilters)
                            $scope.setFilters = [];
                        if(!_.includes($scope.setFilters, {id:filter.id}))
                            $scope.setFilters.push(filter);
                    }

                    //==============================================================
                    $scope.removeFilter = function(filter){
                        if(!$scope.setFilters)
                            return;
                            
                        $scope.setFilters = _.filter($scope.setFilters, function(fil){return fil.id!=filter.id});
                    }

                    //==============================================================
                    function loadSavedFilters() {
                        if ($scope.user && $scope.user.isAuthenticated) {
                            var query = {};
                            if ($scope.collectionFilter)
                                query = JSON.parse($scope.collectionFilter);

                            query.realm = realm.value;
                            IGenericService.query('v2016', 'me/subscriptions', query)
                                .then(function (data) {
                                    // if ($scope.collection == "search-queries" && $scope.user.government) {
                                    //     _.first(systemSearches).filters[0].query += $scope.user.government;
                                    //     $scope.userFilters = _.union(systemSearches, data);
                                    // } else
                                        $scope.userFilters = data;
                                });
                        }
                    }
 
                    //==============================================================
                    $rootScope.$on('signIn', function (evt, user) {
                        $scope.user = user;
                        loadSavedFilters();
                    });

                    //==============================================================
                    $scope.runUserQuery = function (record) {
                        if ($scope.runQuery)
                            $scope.runQuery({
                                filter: record
                            });
                    };

                     //==============================================================
                     $scope.runSystemFilter = function () {
                        $scope.runFilter(systemSearches[0].filters);
                     }

                    //==============================================================
                    $scope.runFilter = function (id) {
                        if(id) {
                            if(!$scope.runQueryInPage){
                                window.open(
                                        '/database/run-query/' + id,
                                        '_blank' 
                                    ); 
                            }
                            else
                            {
                                window.location.href =  '/database/run-query/' + id;
                            }
                        }
                    };


                   

                    

                    //==============================================================
                    $scope.emailSubscribe = function (record, flag) {
                     
                        if (record) {
                            
                            record.sendEmail = flag;

                            operation = IGenericService.update('v2016', 'me/subscriptions', record._id, record);

                            operation.then(function (data) {
                                
                                if (!record._id)
                                    record._id = data.id;

                                //updateRecord(record);
                            });
                        }
                    };

                    //==============================================================
                    $scope.hasUserEmailSubscribed = function (record) {
                     
                        if (record) {
                            
                            if(record.sendEmail){
                                return true;
                            }
                        }
                        return false;
                    };


                    

                    //==============================================================
                    $scope.confirmDelete = function (record) {
                        $scope.loading = true;
                        $http.delete('/api/v2016/me/subscriptions/' + record._id)
                            .then(function () {
                                $scope.userFilters.splice($scope.userFilters.indexOf(record), 1);
                            });
                        $scope.loading = false;
                    };

                    //==============================================================
                    $scope.addEdit = function (existingFilter) {
                        $scope.setFilters = [];
                        if (existingFilter && !existingFilter._id)
                            return;
                        if ($rootScope.user && !$rootScope.user.isAuthenticated) {
                            var signIn = $scope.$on('signIn', function (evt, data) {
                                $scope.addEdit();
                                signIn();
                            });

                            $('#loginDialog').modal("show");
                        } else {

                            var collection = $scope.collection;

                            ngDialog.open({
                                className: 'ngdialog-theme-default wide',
                                template: 'newFilterDialog',
                                scope : $scope,
                                controller: ['$scope', 'IGenericService', '$timeout', 'realm', function ($scope, IGenericService, $timeout, realm) {

                                    if (existingFilter) {
                                        $scope.document = angular.copy(existingFilter);
                                        $timeout(function () {
                                            $scope.setSearchFilters(existingFilter.filters);
                                        }, 100);
                                    }

                                    $scope.save = function (document) {
                                        $scope.errors = [];
                                        if (!document || document.queryTitle == '') {
                                            $scope.errors.push('Please enter title of the alert')
                                        }
                                        if (!document || !$scope.setFilters || _.isEmpty($scope.setFilters)) {
                                            $scope.errors.push('Please select at least one filter')
                                        }
                                        if ($scope.errors && $scope.errors.length > 0) {
                                            $("#dialog-errors").animate({
                                                scrollTop: 0
                                            }, 600);
                                            return;
                                        }

                                        $scope.loading = true;
                                        var operation;

                                        document.isSystemAlert = false;
                                        document.filters = _.values($scope.setFilters);
                                        document.realm = realm;
                                        if (!document._id)
                                            operation = IGenericService.create('v2016', 'me/subscriptions', document);
                                        else
                                            operation = IGenericService.update('v2016', 'me/subscriptions', document._id, document);

                                        operation.then(function (data) {
                                            $scope.closeDialog();
                                            if (!document._id)
                                                document._id = data.id;
                                            updateRecord(document);
                                        });
                                    };
                                    $scope.closeDialog = function () {
                                        ngDialog.close();
                                    };

                                }]
                            });
                            
                            //==============================================================
                            function updateRecord(document, delay) {
                                if (!$scope.userFilters)
                                    $scope.userFilters = [];
                                var existing = _.find($scope.userFilters, {
                                    '_id': document._id
                                });
                                if (!existing) {
                                    $scope.userFilters.push(document);
                                    existing = document;
                                }
                                existing.pendingStatus = true;
                                IGenericService.get('v2016', 'me/subscriptions', document._id)
                                    .then(function (data) {
                                        existing = _.extend(existing, data);
                                        existing.pendingStatus = false;
                                    })
                                    .catch(function (err) {
                                        if (err && err.status == 404) {
                                            delay = (delay || 0) + 1000
                                            $timeout(updateRecord(document, delay), delay);
                                        }
                                    });
                            }
                        }
                    };


                    loadSavedFilters();
                }
            ]
        };
    }]);
});