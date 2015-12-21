define(['text!./filter-assessment.html', 'app', 'lodash'], function(template, app, _) {
  'use strict';

  app.directive('filterAssessment', ['$http', 'Thesaurus', '$location', function($http, thesaurus, $location) {
    return {
      restrict: 'EAC',
      template: template,
      replace: true,
      require: '^reportingDisplay',
      scope: {
        title: '@title',
        items: '=ngModel',
      },
      link: function($scope, $element, $attr, reportingDisplayCtrl) {

          $scope.aichiTargets = [];
          $scope.disabledTarget = 0;
          $scope.classPanelCollapse = "panel-collapse";
          $scope.classCollapse = "collapse";

          $scope.queries = {
            'AICHI-TARGET-01': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-01"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-02': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-02"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-03': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-03"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-04': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-04"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-05': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-05"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-06': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-06"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-07': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-07"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-08': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-08"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-09': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-09"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-10': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-10"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-11': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-11"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-12': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-12"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-13': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-13"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-14': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-14"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-15': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-15"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-16': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-16"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-17': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-17"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-18': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-18"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-19': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-19"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },
            'AICHI-TARGET-20': {
              'schema_s': ['nationalAssessment'],
              'nationalTarget_EN_t': ['"AICHI-TARGET-20"'],
              '_latest_s': ['true'],
              '_state_s': ['public']
            },

          };



          getAichiTargets().then(function(data) {

            $scope.aichiTargets = _.toArray(_.indexBy(data.data, 'number_d'));
            makeLocalIcons($scope.aichiTargets);
            var filter = _([$location.search().filter]).flatten().compact().value()[0];
            if (filter.indexOf('AICHI-TARGET') > -1) {
              var term = _.find($scope.aichiTargets, function(term) {
                return term.identifier_s === filter;
              });
              $scope.classCollapse = "in";
              $scope.toggleTarget($scope.aichiTargets, term);
            }
          }); //getAichiTargets


          //============================================================
          //
          //
          //============================================================
          function getAichiTargets() {

            var queryParameters = {
              'q': 'schema_s:aichiTarget',
              'fl': '*',
              'wt': 'json',
              'start': 0,
              'rows': 20,
            };
            //return defer;
            return $http.get('https://api.cbd.int/api/v2013/index/select', {
              params: queryParameters,
              cache: true
            }).then(function(data) {
              return {
                'data': data.data.response.docs
              };
            });

          } // getOrganizations

          // //=======================================================================
          // //
          // //=======================================================================
          $scope.aichiTargetReadable = function(target) {

            return target.replace("-", " ").replace("-", " ").toLowerCase().replace(/\b./g, function(m) {
              return m.toUpperCase();
            });
          }; //aichiTargetReadable

          // //=======================================================================
          // //
          // //=======================================================================
          $scope.aichiTargetNumber = function(target) {

            return target.substring(target.length - 2);
          }; //aichiTargetReadable

          // //=======================================================================
          // //
          // //=======================================================================
          $scope.toggleTarget = function(targets, target) {

            _.each(targets, function(targ) {

              if (targ.identifier_s === target.identifier_s) {
                targ.selected = false;
                targ.selectedIcon = _.clone(targ.localIconBW);
              } else {
                targ.selectedIcon = targ.localIcon;
                targ.selected = true;
              }
            });


          }; //aichiTargetReadable

          // //=======================================================================
          // //
          // //=======================================================================
          function makeLocalIcons(targets) {

            _.each(targets, function(target) {
              target.localIcon = "app/images/targets/" + $scope.aichiTargetNumber(target.identifier_s) + ".png";
              target.localIconBW = "app/images/targets_bw/" + $scope.aichiTargetNumber(target.identifier_s) + ".png";
              target.selected = true;
              target.selectedIcon = "app/images/targets/" + $scope.aichiTargetNumber(target.identifier_s) + ".png";
            });

          } //aichiTargetReadable

          //============================================================
          //
          //
          //============================================================
          function disableSiblings(target) {

            $scope.disabledTarget = target;
            console.log('target', target);
          } // getOrganizations


          //=======================================================================
          //
          //=======================================================================
          $scope.loadAssements = function(aichiNumber) {

            var query = {};
            $scope.schema = aichiNumber;
            query[aichiNumber] = $scope.queries[aichiNumber];

            reportingDisplayCtrl.addSubQuery(_.cloneDeep(query), aichiNumber);
            reportingDisplayCtrl.search();

          }; // flatten

        } //link
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
