angular.module('kmApp').compileProvider // lazy
.directive('myProfile', ["$rootScope", "$http", "authHttp", "$browser", "authentication", "URI", function ($rootScope, $http, authHttp, $browser, authentication, URI) {
    return {
        priority: 0,
        restrict: 'EAC',
        templateUrl: '/app/shared/directives/users/my-profile.partial.html',
        replace: true,
        transclude: false,
        scope: false,
        link: function ($scope, $element, $attr, $ctrl) {
            $scope.init();
        },
        controller: ['$scope' , '$filter', '$location', 'URI', function ($scope, $filter, $location, URI) {

            $scope.document = $scope.user;
            $scope.options  = {
                countries                   : function() { return $http.get("/api/v2013/thesaurus/domains/countries/terms",            { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); },
            };

            //==================================
            //
            //==================================
            $scope.init = function() {
                $http.get('/api/v2013/users/'+$scope.user.userID).
                success(function (data, status, headers, config) {
                    $scope.document = data;
                    $scope.loadPhones();
                    $scope.loadFaxes();
                    $scope.loadEmails();
                    //debugger;
                  }).
                  error(function (data, status, headers, config) {
                    // ...
                  });
            }

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
                $scope.phones = angular.toJson($scope.document.phones);
            }

            //==============================
            //
            //==============================
            $scope.savePhones = function ()
            {
                $scope.document.phones = angular.fromJson($scope.phones);                
            }

            //==============================
            //
            //==============================
            $scope.removePhone = function(index) 
            {
                $scope.phones.splice(index, 1);
                savePhones();
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
                $scope.phones = angular.toJson($scope.document.phones);
            }

            //==============================
            //
            //==============================
            $scope.saveFaxes = function ()
            {
                $scope.document.phones = angular.fromJson($scope.phones);                
            }

            //==============================
            //
            //==============================
            $scope.removeFaxe = function(index) 
            {
                $scope.faxes.splice(index, 1);
                saveFaxes();
            }

            //==============================
            //
            //==============================
            $scope.getEmails = function () 
            {
                if($scope.emails==undefined)
                {
                    $scope.emails = [];
                }

                if($scope.emails.length==0)
                    $scope.emails.push({value : ""});

                var sLastValue = $scope.emails[$scope.emails.length-1].value; 

                //NOTE: IE can set value to 'undefined' for a moment
                if(sLastValue && sLastValue!="")
                    $scope.emails.push({value : ""});

                return $scope.emails;
            };

            //==============================
            //
            //==============================
            $scope.loadEmails = function ()
            {
                $scope.phones = angular.toJson($scope.document.phones);
            }

            //==============================
            //
            //==============================
            $scope.saveEmails = function ()
            {
                $scope.document.phones = angular.fromJson($scope.phones);                
            }

            //==============================
            //
            //==============================
            $scope.removeEmail = function(index) 
            {
                $scope.emails.splice(index, 1);
                saveEmails();
            }

            //==================================
            //
            //==================================
            $scope.onPostSave = function(data) {
                $http.post('/api/v2013/users/',
                    angular.toJson($scope.document)).then(
                    function(resp)
                    {
                        return resp.data;
                    }
                )
            };

        }]
    }
}]);