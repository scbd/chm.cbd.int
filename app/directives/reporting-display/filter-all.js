define(['text!./filter-all.html', 'app','lodash'], function(template, app,_) {
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
        $scope.queries = {
              'all': {
                'schema_s': [
                  'nationalReport',
                  'nationalAssessment',
                  'resourceMobilisation',
                  'nationalIndicator',
                  'nationalTarget'
                ],
              '_latest_s':['true'],
              '_state_s':['public']
            }
        };
          //=======================================================================
          //
          //=======================================================================
          $scope.loadRecords = function() {

            reportingDisplayCtrl.addSubQuery(_.cloneDeep($scope.queries),'all');
            reportingDisplayCtrl.search();
          }; // loadRecords
        } //link
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
