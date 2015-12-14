define(['text!./filter-nbsap.html', 'app', 'lodash','angular','jquery'], function(template, app, _,angular,$) { 'use strict';

app.directive('filterNbsap',['$http','Thesaurus','$timeout', function ($http,thesaurus,$timeout) {
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






          //=======================================================================
          //
          //=======================================================================
          $scope.loadRecords = function () {


            reportingDisplayCtrl.addSubQuery('nbsaps','schema_s:nationalReport AND reportType_s:B0EBAE91-9581-4BB2-9C02-52FCF9D82721  AND _latest_s:true AND _state_s:public ',true);

            reportingDisplayCtrl.search();

          };// flatten

        }//link
    }; // return
  }]);  //app.directive('searchFilterCountries
});// define
