define(['text!./filter-assesment.html', 'app', 'lodash','angular','jquery'], function(template, app, _,angular,$) { 'use strict';

app.directive('filterAssesment',['$http','Thesaurus','$timeout', function ($http,thesaurus,$timeout) {
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
            var progresses = $http.get("/api/v2013/thesaurus/domains/EF99BEFD-5070-41C4-91F0-C051B338EEA6/terms", { cache: true }).then(function (o) { return o.data; });
            var termsMap =[];

            $scope.termsModal = {};
            $scope.aichiTargets=[];
            $scope.disabledTarget=0;
  buildTermsAndQuery();
            $scope.$watch('items',function(){reportingDisplayCtrl.updateTerms(termsMap,$scope.items,$scope.facet);});

            //=======================================================================
            //
            //=======================================================================
            function buildTermsAndQuery() {

                  //  if(_.isEmpty(termsMap)){ // get terms once and save
                        getAichiTargets().then(function (data) {

                            $scope.aichiTargets=_.toArray(_.indexBy(data.data, 'number_d'));
                    //        $scope.terms=reportingDisplayCtrl.updateTerms($scope.terms,$scope.items,$scope.facet,$scope.aichiTargets,1);
                    //        reportingDisplayCtrl.buildChildQuery($scope.terms,$scope.items,$scope.facet,$scope.aichiTargets);

                        });//getAichiTargets
                //    }else{
//console.log('termsMap',termsMap);
              //              $scope.terms = reportingDisplayCtrl.updateTerms($scope.terms,$scope.items,$scope.facet,$scope.aichiTargets,1);
              //              reportingDisplayCtrl.buildChildQuery($scope.terms,$scope.items,$scope.facet,$scope.aichiTargets);
              //      }
            }//buildTermsAndQuery()

            //============================================================
        		//
        		//
        		//============================================================
        		function getAichiTargets() {

          			var  queryParameters = {
          							'q': 'schema_s:aichiTarget',
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
