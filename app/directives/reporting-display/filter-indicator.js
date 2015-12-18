define(['app','text!./filter-indicator.html'], function(app,template) {
  'use strict';
  app.directive('filterIndicator', [function() {
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

            reportingDisplayCtrl.addSubQuery('schema_s', 'nationalIndicator');
            reportingDisplayCtrl.addSubQuery('_latest_s', 'true');
            reportingDisplayCtrl.addSubQuery('_state_s', 'public');
            reportingDisplayCtrl.search();
          }; // loadRecords

        } //link
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
