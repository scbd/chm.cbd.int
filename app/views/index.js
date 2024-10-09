define(['app', 'angular', 'authentication', 'utilities/km-utilities', 'directives/news', 'directives/meetings', "utilities/solr","services/realmConfig"], function() { 'use strict';

	return ['$scope', '$rootScope', '$route', '$browser', '$location', '$window', 'user', 'authentication', 'solr', 'realm', '$http', '$q',
     function ($scope, $rootScope, $route, $browser, $location, $window, user, authentication, solr, realm, $http, $q) {

        $rootScope.homePage = true;
        $rootScope.userGovernment = user.government;
        $rootScope.navigation = [];
        $rootScope.navigationTree = [];

        $scope.email = $rootScope.lastLoginEmail || "";
        $scope.ortUrl     = window.location.origin.replace('chm', 'ort')



		//========================================
		//
		//========================================
		$scope.goto = function (path, type) {
            if(type == 'nationalReport6')
                path = path + $scope.nationalReport6.identifier_s; 
			$location.path(path);
		}

        //========================================
        //
        //========================================
        $scope.signIn = function () {

            var sEmail = $scope.email;
            var sPassword = $scope.password;

            authentication.signIn(sEmail, sPassword).then(function () { // Success

				$scope.isForbidden = false;
				$scope.password = "";
                authentication.getUser().then(function () { $location.path("/submit"); });

			}).catch(function (error) { // Error

				$scope.isUnavailable = error.errorCode != 403;
				$scope.isForbidden = error.errorCode == 403;
				$scope.password = "";
            });
        };

        function validateNR6(){
            
            if(user.government){

                var qSchema = " AND (schema_s:nationalReport6)";
                var government = " AND government_s:" + user.government;
                var q = '(realm_ss:' + realm.toLowerCase() + ' ' + qSchema + government + ')';

                var qsOtherSchemaFacetParams =
                {
                    "q"  : q,
                    "rows" : 10,
                    "fl"    : 'identifier_s, title_s, _workflow_s, _state_s',
                    "s"     : 'updatedOn_dt desc'               
                };

                var nationalReport6Query     = $http.get('/api/v2013/index/select', { params : qsOtherSchemaFacetParams});

                $q.when(nationalReport6Query).then(function(results) {
                    if(results.data.response.numFound > 0){
                        $scope.nationalReport6 = results.data.response.docs[0]
                        if($scope.nationalReport6._workflow_s)
                          $scope.nationalReport6.identifier_s =  $scope.nationalReport6._workflow_s.replace('workflow-','')            
                    }
                    else
                        $scope.nationalReport6 = { identifier_s : 'new'}
                }).then(null, function(error) {
                    console.log(error );
                });
            }
            else
                $scope.nationalReport6 = { identifier_s : 'new'};
        }

        validateNR6();
    }];
});
