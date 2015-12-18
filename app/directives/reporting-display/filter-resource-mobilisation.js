define(['app','text!./filter-resource-mobilisation.html'], function(app,template) {
  'use strict';
  app.directive('filterResourceMobilisation', [function() {
    return {
      restrict: 'E',
      template: template,
      replace: true,
      require: '^reportingDisplay',
      scope: {
        title: '@title',
      },
      link: function($scope, $element, $attr, reportingDisplayCtrl) {

          //=======================================================================
          //
          //=======================================================================
          $scope.loadRecords = function() {

            reportingDisplayCtrl.addSubQuery('schema_s', 'resourceMobilisation');
            reportingDisplayCtrl.addSubQuery('_latest_s', 'true');
            reportingDisplayCtrl.addSubQuery('_state_s', 'public');
            reportingDisplayCtrl.search();
          }; // flatten

        } //link
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
