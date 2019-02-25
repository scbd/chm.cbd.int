define(['app', 'text!./filter-national-assessment.html', 'lodash'], function(app, template, _) {
  'use strict';
  app.directive('filterNationalAssessment', [function() {
    return {
      restrict: 'E',
      template: template,
      replace: true,
      require: '^reportingDisplay',
      scope: {
        title: '@title',
      },
      link: function($scope, $element, $attr, reportingDisplayCtrl) {
          $scope.queries = {
            'nationalAssessment': {
              'schema_s': ['nationalAssessment'],
              '_latest_s': ['true'],
              '_state_s': ['public'],
              'type_s'    : ['national']
            }
          };
          //=======================================================================
          //
          //=======================================================================
          $scope.loadRecords = function() {

            reportingDisplayCtrl.addSubQuery(_.cloneDeep($scope.queries), 'nationalAssessment');
            reportingDisplayCtrl.search();
          }; // loadRecords

        } //link
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
