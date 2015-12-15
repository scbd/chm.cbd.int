define(['text!./filter-all.html', 'app', 'lodash','angular','jquery'], function(template, app, _,angular,$) { 'use strict';

app.directive('filterAll',['$http','Thesaurus','$timeout', function ($http,thesaurus,$timeout) {
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




          //  $scope.$watch('items',function(){reportingDisplayCtrl.updateTerms(termsMap,$scope.items,$scope.facet);});

            // //=======================================================================
            // //
            // //=======================================================================
            // function buildTermsAndQuery() {
            //
            //
            //   $scope.terms = searchCtrl.updateTerms($scope.terms,$scope.items,$scope.facet);
            //   searchCtrl.buildChildQuery($scope.terms,$scope.items,$scope.facet);
            // }//buildTermsAndQuery()




              //=======================================================================
              //
              //=======================================================================
              $scope.loadRecords = function () {


                reportingDisplayCtrl.addSubQuery('all','(schema_s:nationalReport OR schema_s:nationalAssessment OR schema_s:resourceMobilisation OR (schema_s:nationalReport AND reportType_s:B0EBAE91-9581-4BB2-9C02-52FCF9D82721) OR schema_s:nationalIndicator OR schema_s:nationalTarget)  AND _latest_s:true AND _state_s:public ',true);

                reportingDisplayCtrl.search();

              };// flatten

        }//link
    }; // return
  }]);  //app.directive('searchFilterCountries
});// define
