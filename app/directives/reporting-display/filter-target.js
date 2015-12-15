define(['app','text!./filter-target.html'], function(app,template) {
  'use strict';
  app.directive('filterTarget', [function() {
    return {
      restrict: 'EAC',
      template: template,
      replace: true,
      require: '^reportingDisplay',
      scope: {
        title: '@title',
        //items: '=ngModel',
      //  count: '=count' // total count of all children subquires needed for 0 result combinations
      },
      link: function($scope, $element, $attr, reportingDisplayCtrl) {

          //=======================================================================
          //
          //=======================================================================
          $scope.loadRecords = function() {

            reportingDisplayCtrl.addSubQuery('nationalTarget', 'schema_s:nationalTarget AND _latest_s:true AND _state_s:public ', true);
            reportingDisplayCtrl.search();
          }; // flatten

        } //link
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
