define(['text!./results-list.html', 'app', 'lodash'], function(template, app, _) {
  'use strict';

  app.directive('resultsList', [function() {
    return {
      restrict: 'E',
      template: template,

      scope: {
        show: '=show',
        items: '=ngModel',
        totalRecords: '=count' // total count of all children subquires needed for 0 result combinations
      },
      link: function($scope, $element, $attr) {

          $scope.expanded = false;
          $scope.schemaNameMap = {
            'nationalReport6': 'Sixth National Report',
            'nationalAssessment': 'National Assessments',
            'nationalReport': 'National Reports',
            'nbsaps': 'Nat. Bio. Strategies and Action Plans',
            'nationalIndicator': 'National Indicators',
            'nationalTarget': 'National Targets',
            'resourceMobilisation': 'Financial Resource Mobilization',
            'draft':'Draft Documents',
            'public':'Published Documents',
          };
          $scope.$watch('items', function() {
            init();
          });
          $scope.$watch('show', function() {
            showCountry($scope.show);
          }, true);

          //=======================================================================
          //
          //=======================================================================
          function init() {
            $scope.numCountries = _.size($scope.items);
            if (!$scope.totalRecords) $scope.totalRecords = 0;
            $scope.numRecords = _.clone($scope.totalRecords);
          } //

          //=======================================================================
          //
          //=======================================================================
          function adjustCounts(showCountry) {

            if (showCountry !== 'show') {

              $scope.numCountries = 1;
              $scope.numRecords = countRecords(showCountry);
            }
          } //adjustCounts

          //=======================================================================
          //
          //=======================================================================
          function countRecords(showCountry) {
            var count = 0;
            _.each($scope.items, function(country) {
              if (country.identifier.toUpperCase() === showCountry.toUpperCase())
                _.each(country.docs, function(schema) {
                  _.each(schema, function(doc) { // jshint ignore:line
                    count++;
                  });
                });
            });
            return count;
          } //countRecords

          //=======================================================================
          //
          //=======================================================================
          function showCountry(showCountry) {
            if (showCountry === 'show' || !showCountry) return showAllCountry();
            _.each($scope.items, function(country) {
              if (country.identifier.toUpperCase() === showCountry.toUpperCase()) {
                country.hidden = 0;
                country.expanded = 1;
                adjustCounts(showCountry);
                _.each(country.docs, function(schema) {
                  schema.expandedDoc = 1;
                });
              } else
                country.hidden = 1;
            });
          } //showCountry

          //=======================================================================
          //
          //=======================================================================
          function showAllCountry() {
            _.each($scope.items, function(country) {
              country.hidden = false;
              country.expanded = 0;
              _.each(country.docs, function(schema) {
                schema.expandedDoc = 0;
              });
            });
            $scope.numCountries = _.size($scope.items);
            $scope.numRecords = _.clone($scope.totalRecords);

          } //showAllCountry

          //=======================================================================
          //
          //=======================================================================
          $scope.closeAllCountries = function(keepOpen) {

              _.each($scope.items, function(country) {
                if(!country.identifier) country.identifier =country._id;
                if (country.identifier == keepOpen)
                  country.expanded = true;
                else
                  country.expanded = false;
              });

            }; //$scope.closeAllCountries

          //=======================================================================
          //
          //=======================================================================
          $scope.toggleHide = function(show) {

              if (show)
                show = false;
              else
                show = true;
              return show;
            }; //$scope.closeAllCountries

        } //link
    }; // return
  }]); //app.directive('searchFilterCountries


}); // define
