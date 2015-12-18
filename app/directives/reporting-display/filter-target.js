define(['app', 'text!./filter-target.html'], function(app, template) {
  'use strict';
  app.directive('filterTarget', [function() {
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

            reportingDisplayCtrl.addSubQuery('schema_s', 'nationalTarget');
            reportingDisplayCtrl.addSubQuery('_latest_s', 'true');
            reportingDisplayCtrl.addSubQuery('_state_s', 'public');
            reportingDisplayCtrl.search();
          }; // loadRecords

        } //link
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
