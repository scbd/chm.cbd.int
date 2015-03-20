angular.module('kmApp').compileProvider // lazy
.directive('user', ["$rootScope", "$http", "authHttp", "$browser", "authentication", function ($rootScope, $http, authHttp, $browser, authentication) {
    return {
        priority: 0,
        restrict: 'EAC',
        templateUrl: '/app/directives/admin/user.partial.html?v'+new Date().getTime(),
        replace: true,
        transclude: false,
        scope: false,
        link: function ($scope, $element, $attr, $ctrl) {
            $scope.init();
        },
        controller: ['$scope' , '$filter', '$location', '$route', '$q', function ($scope, $filter, $location, $route, $q) {

            $scope.options  = {
                countries                   : function() { return $http.get("/api/v2013/thesaurus/domains/countries/terms",            { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); },
            };

            $http.get("/api/v2013/roles", { cache: true }).then(function(response) {
                $scope.roleList = $filter('orderBy')(response.data, 'name');
            });

            //==================================
            //
            //==================================
            $scope.init = function() {

                if($route.current.params.id=='new') {
                    $scope.initialRoles = [];
                } else {
                    $http.get('/api/v2013/users/'+$route.current.params.id).success(function (data, status, headers, config) {
                        $scope.document = data;
                        $scope.loadPhones();
                        $scope.loadFaxes();
                        $scope.loadEmails();
                    }).error(function (data, status, headers, config) {
                        alert('ERROR\r\n----------------\r\n'+data);
                    });

                    $http.get('/api/v2013/users/'+$route.current.params.id+'/roles').success(function (data, status, headers, config) {
                        $scope.roles = data;
                        $scope.initialRoles = data.slice(0); // clone array
                    }).error(function (data, status, headers, config) {
                        alert('ERROR\r\n----------------\r\n'+data);
                    });
                }
            };

            //==============================
            //
            //==============================
            $scope.getPhones = function ()
            {
                if($scope.phones==undefined)
                {
                    $scope.phones = [];
                }

                if($scope.phones.length==0)
                    $scope.phones.push({value : "", type: ""});

                var sLastValue = $scope.phones[$scope.phones.length-1].value;
                var sLastType  = $scope.phones[$scope.phones.length-1].type;
                var sLastExt   = $scope.phones[$scope.phones.length-1].ext;

                //NOTE: IE can set value to 'undefined' for a moment
                if((sLastValue && sLastValue!="") ||
                   (sLastType  && sLastType!="")  ||
                   (sLastExt   && sLastExt!="") )
                    $scope.phones.push({value : ""});

                return $scope.phones;
            };

            //==============================
            //
            //==============================
            $scope.loadPhones = function ()
            {
                $scope.phones = [];
                var phones = $scope.document.Phone ? $scope.document.Phone.split(';') : undefined;
                if(phones)
                {
                    $.each(phones, function( index, phone ) {
                        if(phone!=undefined && phone!='')
                        {
                            $scope.phones.push({value: phone})
                        }
                    });
                }
            }

            //==============================
            //
            //==============================
            $scope.savePhones = function ()
            {
                $scope.document.Phone = "";
                $.each($scope.phones, function( index, value ) {
                    if(value.value!=undefined && value.value!='')
                    {
                        $scope.document.Phone += value.value;
                        $scope.document.Phone += ';';
                    }
                });
            }

            //==============================
            //
            //==============================
            $scope.removePhone = function(index)
            {
                $scope.phones.splice(index, 1);
                $scope.savePhones();
            }

            //==============================
            //
            //==============================
            $scope.getFaxes = function ()
            {
                if($scope.faxes==undefined)
                {
                    $scope.faxes = [];
                }

                if($scope.faxes.length==0)
                    $scope.faxes.push({value : "", type: ""});

                var sLastValue = $scope.faxes[$scope.faxes.length-1].value;
                var sLastExt = $scope.faxes[$scope.faxes.length-1].ext;

                //NOTE: IE can set value to 'undefined' for a moment
                if((sLastValue && sLastValue!="") ||
                   (sLastExt && sLastExt!="") )
                    $scope.faxes.push({value : ""});

                return $scope.faxes;
            };

            //==============================
            //
            //==============================
            $scope.loadFaxes = function ()
            {
                $scope.faxes = [];
                var Faxes = $scope.document.Fax ? $scope.document.Fax.split(';') : undefined;
                if(Faxes)
                {
                    $.each(Faxes, function( index, faxe ) {
                        if(faxe!=undefined && faxe!='')
                        {
                            $scope.faxes.push({value: faxe})
                        }
                    });
                }
            }

            //==============================
            //
            //==============================
            $scope.saveFaxes = function ()
            {
                $scope.document.Fax = "";
                $.each($scope.faxes, function( index, value ) {
                    if(value.value!=undefined && value.value!='')
                    {
                        $scope.document.Fax += value.value;
                        $scope.document.Fax += ';';
                    }
                });
            }

            //==============================
            //
            //==============================
            $scope.removeFaxe = function(index)
            {
                $scope.faxes.splice(index, 1);
                $scope.saveFaxes();
            }

            //==============================
            //
            //==============================
            $scope.getEmails = function ()
            {
                if($scope.EmailsCc==undefined)
                {
                    $scope.EmailsCc = [];
                }

                if($scope.EmailsCc.length==0)
                    $scope.EmailsCc.push({value: ""});

                var sLastValue = $scope.EmailsCc[$scope.EmailsCc.length-1];

                //NOTE: IE can set value to 'undefined' for a moment
                if(sLastValue.value && sLastValue.value!="")
                    $scope.EmailsCc.push({value: ""});

                return $scope.EmailsCc;
            };

            //==============================
            //
            //==============================
            $scope.loadEmails  = function ()
            {
                $scope.EmailsCc = [];
                var emails = $scope.document.EmailsCc ? $scope.document.EmailsCc.split(';') : undefined;
                if(emails)
                {
                    $.each(emails, function( index, email ) {
                        if(email!=undefined && email!='')
                        {
                            $scope.EmailsCc.push({value: email})
                        }
                    });
                }
            }

            //==============================
            //
            //==============================
            $scope.saveEmails = function ()
            {
                $scope.document.EmailsCc = "";
                $.each($scope.EmailsCc, function( index, email ) {
                    if(email.value!=undefined && email.value!='')
                    {
                        $scope.document.EmailsCc += email.value;
                        $scope.document.EmailsCc += ';';
                    }
                });
            }

            //==============================
            //
            //==============================
            $scope.removeEmail = function(index)
            {
                $scope.EmailsCc.splice(index, 1);
                $scope.saveEmails();
            }

            //==================================
            //
            //==================================
            $scope.onPostSave = function(data) {

                if($route.current.params.id=='new') {

                    authHttp.post('/api/v2013/users/', angular.toJson($scope.document)).success(function (data, status, headers, config) {
                        $scope.actionUpdateRoles();

                    }).error(function (data, status, headers, config) {
                        $scope.error = data;
                    });

                } else {

                    authHttp.put('/api/v2013/users/'+$scope.document.UserID, angular.toJson($scope.document)).success(function (data, status, headers, config) {
                        $scope.actionUpdateRoles();
                    }).error(function (data, status, headers, config) {
                        $scope.error = data;
                    });
                }
            };

            //==================================
            //
            //==================================
            $scope.actionUpdateRoles = function(data) {

                var rolesToGrant  = _.difference($scope.roles, $scope.initialRoles);
                var rolesToRevoke = _.difference($scope.initialRoles, $scope.roles);

                var tasks = [];

                rolesToGrant.forEach(function grantRole (role) {
                    tasks.push(authHttp.put('/api/v2013/users/'+$scope.document.UserID+'/roles/'+role));
                });

                rolesToRevoke.forEach(function grantRole (role) {
                    tasks.push(authHttp.delete('/api/v2013/users/'+$scope.document.UserID+'/roles/'+role));
                });

                $q.all(tasks).then(function done () {
                    $location.path('/admin/users');
                });
            }

        }]
    }
}]);

angular.module('kmApp').compileProvider.directive('duallistbox', ["$timeout", function ($timeout) {
    return {
        priority: 0,
        restrict: 'AC',
        scope: false,
        link: function ($scope, $element, $attr, $ctrl) {
            var box = $element.bootstrapDualListbox({
                nonselectedlistlabel: 'Non-selected',
                selectedlistlabel: 'Selected',
                preserveselectiononmove: 'moved',
                moveonselect: false
            });

            var syncing;
            $element.bind("DOMSubtreeModified", function () { console.log('syncing');
                if(!syncing) {
                    syncing = true;
                    $timeout(function () {
                        box.trigger('bootstrapduallistbox.refresh');
                        syncing = false;
                    }, 250);
                }
            });
        },
        controller: ['$scope', function ($scope) {
        }]
    };
}]);
