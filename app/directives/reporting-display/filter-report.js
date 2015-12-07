define(['text!./filter-report.html', 'app', 'lodash','angular','jquery'], function(template, app, _,angular,$) { 'use strict';

app.directive('filterReport',['$http','Thesaurus','$timeout', function ($http,thesaurus,$timeout) {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        require : '^reportingDisplay',
        scope: {
              title: '@title',
              items: '=ngModel',
              facet: '@facet',
              count: '=count' // total count of all children subquires needed for 0 result combinations
        },
          link : function ($scope, $element, $attr, reportingDisplayCtrl)
        {
            $scope.expanded = false;
            var termsMap =[];
            $scope.termsModal = {};

            $scope.terms = [{
              id: '272B0A17-5569-429D-ADF5-2A55C588F7A7',
              title: '5th National Report',
              count:0,
              selected: false
            }, {
              id: 'DA7E04F1-D2EA-491E-9503-F7923B1FD7D4',
              title: '4th National Report',
              count:0,
              selected: false
            }, {
              id: 'A49393CA-2950-4EFD-8BCC-33266D69232F',
              title: '3rd National Report',
              count:0,
              selected: false
            }, {
              id: 'F27DBC9B-FF25-471B-B624-C0F73E76C8B3',
              title: '2nd National Report',
              count:0,
              selected: false
            }, {
              id: '5471756B-6B33-46AD-9D51-15443C5E5315',
              title: '1st National Report',
              count:0,
              selected: false
            }];


            $scope.$watch('items',function(){reportingDisplayCtrl.updateTerms(termsMap,$scope.items,$scope.facet);});

            //=======================================================================
            //
            //=======================================================================
            function buildTermsAndQuery() {


              $scope.terms = searchCtrl.updateTerms($scope.terms,$scope.items,$scope.facet);
              searchCtrl.buildChildQuery($scope.terms,$scope.items,$scope.facet);
            }//buildTermsAndQuery()

            //============================================================
        		//
        		//
        		//============================================================
        		function getAichiTargets() {

          			var  queryParameters = {
          							'q': 'schema_s:nationalReport',
          							'fl': '*',
          							'wt': 'json',
          							'start': 0,
          							'rows': 20,
          			};
          			//return defer;
          			return $http.get('https://api.cbd.int/api/v2013/index/select', { params: queryParameters, cache:true })				.then(function (data) {
                					return {'data':data.data.response.docs};
                });

        		}// getOrganizations

            // //=======================================================================
            // //
            // //=======================================================================
            $scope.aichiTargetReadable = function (target) {

                     return target.replace("-", " ").replace("-", " ").toLowerCase().replace(/\b./g, function(m){ return m.toUpperCase(); });
             };//aichiTargetReadable

             // //=======================================================================
             // //
             // //=======================================================================
             $scope.aichiTargetNumber = function (target) {

                      return target.substring(target.length-2);
              };//aichiTargetReadable

              // //=======================================================================
              // //
              // //=======================================================================
              $scope.toggleTarget= function (targets,target) {

                    _.each(targets,function (targ){

                          if(targ.identifier_s===target.identifier_s){
                            targ.selected=false;
                            targ.selectedIcon = _.clone(targ.localIconBW);
                          } else{targ.selectedIcon=targ.localIcon, targ.selected=true;}
                    });


               };//aichiTargetReadable

              // //=======================================================================
              // //
              // //=======================================================================
              function makeLocalIcons (targets) {

                       _.each(targets, function(target){
                         target.localIcon="app/images/targets/"+$scope.aichiTargetNumber(target.identifier_s)+".png";
                         target.localIconBW="app/images/targets_bw/"+$scope.aichiTargetNumber(target.identifier_s)+".png";
                         target.selected=true;
                         target.selectedIcon="app/images/targets/"+$scope.aichiTargetNumber(target.identifier_s)+".png";
                       });

               }//aichiTargetReadable

            //============================================================
        		//
        		//
        		//============================================================
        		function disableSiblings(target) {

                  $scope.disabledTarget=target;
                  console.log('target',target);
        		}// getOrganizations



              //=======================================================================
              //
              //=======================================================================
              $scope.loadAssements = function (aichiNumber) {

                if(aichiNumber)
                    reportingDisplayCtrl.addSubQuery('nationalAssessment','schema_s:nationalAssessment AND _latest_s:true AND _state_s:public AND nationalTarget_EN_t:"'+aichiNumber+'"',true);
                else
                    reportingDisplayCtrl.deleteAllSubQuery('nationalAssessments');
                reportingDisplayCtrl.search();

              };// flatten

        }//link
    }; // return
  }]);  //app.directive('searchFilterCountries
});// define
