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
        $scope.queries = {
            'resourceMobilisation': {
              'schema_s': ['resourceMobilisation'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            }
          };
          //=======================================================================
          //
          //=======================================================================
          $scope.loadRecords = function() {


            reportingDisplayCtrl.addSubQuery(_.cloneDeep($scope.queries),'resourceMobilisation');
            reportingDisplayCtrl.search();
          }; // flatten

        } //link
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
