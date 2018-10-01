define(['app', 'text!./filter-resource-mobilisation2020.html','lodash'], function(app, template,_) {
  'use strict';
  app.directive('filterResourceMobilisation2020', [function() {
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
            'resourceMobilisation': {
              'schema_s': ['resourceMobilisation2020'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            }
          };
          //=======================================================================
          //
          //=======================================================================
          $scope.loadRecords = function() {

            reportingDisplayCtrl.addSubQuery(_.cloneDeep($scope.queries), 'resourceMobilisation2020');
            reportingDisplayCtrl.search();
          }; // flatten

        } //link
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
