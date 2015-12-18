define(['text!./filter-nbsap.html', 'app'], function(template, app) {
  'use strict';

  app.directive('filterNbsap', [function() {
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

            reportingDisplayCtrl.addSubQuery('schema_s', 'nationalReport');
            reportingDisplayCtrl.addSubQuery('reportType_s', 'B0EBAE91-9581-4BB2-9C02-52FCF9D82721');
            reportingDisplayCtrl.addSubQuery('_latest_s', 'true');
            reportingDisplayCtrl.addSubQuery('_state_s', 'public');
            reportingDisplayCtrl.search();
          }; // loadRecords

        } //link
    }; // return
  }]); //app.directive('sfilterNbsap
}); // define
