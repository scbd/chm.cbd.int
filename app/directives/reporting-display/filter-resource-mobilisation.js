define(['app','text!./filter-resource-mobilisation.html'], function(app,template) {
  'use strict';
  app.directive('filterResourceMobilisation', [function() {
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

            reportingDisplayCtrl.addSubQuery('resourceMobilisation', 'schema_s:resourceMobilisation AND _latest_s:true AND _state_s:public ', true);
            reportingDisplayCtrl.search();
          }; // flatten

        } //link
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
