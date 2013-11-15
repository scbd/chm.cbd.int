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
        },
        controller: ['$scope' , '$filter', '$location', 'URI', function ($scope, $filter, $location, URI) {

            $scope.document = $scope.user;
            $scope.options  = {
                countries                   : function() { return $http.get("/api/v2013/thesaurus/domains/countries/terms",            { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); },
            };

            //==============================
            //
            //==============================
            $scope.getPhones = function () 
            {
                if($scope.document.phones==undefined)
                {
                    $scope.document.phones = [];
                }

                if($scope.document.phones.length==0)
                    $scope.document.phones.push({value : "", type: ""});

                var sLastValue = $scope.document.phones[$scope.document.phones.length-1].value; 
                var sLastType  = $scope.document.phones[$scope.document.phones.length-1].type; 
                var sLastExt   = $scope.document.phones[$scope.document.phones.length-1].ext; 

                //NOTE: IE can set value to 'undefined' for a moment
                if((sLastValue && sLastValue!="") ||
                   (sLastType && sLastType!="")   ||
                   (sLastExt && sLastExt!="") )
                    $scope.document.phones.push({value : ""});

                return $scope.document.phones;
            };

            //==============================
            //
            //==============================
            $scope.removePhone = function(index) 
            {
                $scope.document.phones.splice(index, 1);
            }

            //==============================
            //
            //==============================
            $scope.getFaxes = function () 
            {
                if($scope.document.faxes==undefined)
                {
                    $scope.document.faxes = [];
                }

                if($scope.document.faxes.length==0)
                    $scope.document.faxes.push({value : "", type: ""});

                var sLastValue = $scope.document.faxes[$scope.document.faxes.length-1].value; 
                var sLastExt = $scope.document.faxes[$scope.document.faxes.length-1].ext; 

                //NOTE: IE can set value to 'undefined' for a moment
                if((sLastValue && sLastValue!="") ||
                   (sLastExt && sLastExt!="") )
                    $scope.document.faxes.push({value : ""});

                return $scope.document.faxes;
            };

            //==============================
            //
            //==============================
            $scope.removeFaxe = function(index) 
            {
                $scope.document.faxes.splice(index, 1);
            }

            //==============================
            //
            //==============================
            $scope.getEmails = function () 
            {
                if($scope.document.emails==undefined)
                {
                    $scope.document.emails = [];
                }

                if($scope.document.emails.length==0)
                    $scope.document.emails.push({value : ""});

                var sLastValue = $scope.document.emails[$scope.document.emails.length-1].value; 

                //NOTE: IE can set value to 'undefined' for a moment
                if(sLastValue && sLastValue!="")
                    $scope.document.emails.push({value : ""});

                return $scope.document.emails;
            };

            //==============================
            //
            //==============================
            $scope.removeEmail = function(index) 
            {
                $scope.document.emails.splice(index, 1);
            }
        }]
    }
}]);