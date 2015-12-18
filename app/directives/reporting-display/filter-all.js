define(['text!./filter-all.html', 'app'], function(template, app) {
  'use strict';
  app.directive('filterAll', [function() {
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

            reportingDisplayCtrl.addSubQuery('all','schema_s', 'nationalReport');
            reportingDisplayCtrl.addSubQuery('all','schema_s', 'nationalAssessment');
            reportingDisplayCtrl.addSubQuery('all','schema_s', 'resourceMobilisation');
            reportingDisplayCtrl.addSubQuery('all','schema_s', 'nationalIndicator');
            reportingDisplayCtrl.addSubQuery('all','schema_s', 'nationalTarget');
            reportingDisplayCtrl.addSubQuery('all','_latest_s', 'true');
            reportingDisplayCtrl.addSubQuery('all','_state_s', 'public');
            reportingDisplayCtrl.search();
          }; // loadRecords
        } //link
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
