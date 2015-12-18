define(['text!./filter-report.html', 'app', 'lodash','angular','jquery'], function(template, app, _,angular,$) { 'use strict';

app.directive('filterReport',['$http','Thesaurus','$timeout', function ($http,thesaurus,$timeout) {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        require : '^reportingDisplay',
        scope: {
              title: '@title',
              items: '=ngModel',
              facet: '@facet',
              count: '=count' // total count of all children subquires needed for 0 result combinations
        },
          link : function ($scope, $element, $attr, reportingDisplayCtrl)
        {
            $scope.expanded = false;
            var termsMap =[];
            $scope.termsModal = {};

            $scope.terms = [{
              id: 'B3079A36-32A3-41E2-BDE0-65E4E3A51601',
              title: '5th National Report',
              count:0,
              selected: 0
            }, {
              id: '272B0A17-5569-429D-ADF5-2A55C588F7A7',
              title: '4th National Report',
              count:0,
              selected: 0
            }, {
              id: 'DA7E04F1-D2EA-491E-9503-F7923B1FD7D4',
              title: '3rd National Report',
              count:0,
              selected: 0
            }, {
              id: 'A49393CA-2950-4EFD-8BCC-33266D69232F',
              title: '2nd National Report',
              count:0,
              selected: 0
            }, {
              id: 'F27DBC9B-FF25-471B-B624-C0F73E76C8B3',
              title: '1st National Report',
              count:0,
              selected: 0
            }];


          //  $scope.$watch('items',function(){reportingDisplayCtrl.updateTerms(termsMap,$scope.items,$scope.facet);});
reportingDisplayCtrl.updateTerms(termsMap,$scope.items,$scope.facet);
            // //=======================================================================
            // //
            // //=======================================================================
            // function buildTermsAndQuery() {
            //
            //
            //   $scope.terms = searchCtrl.updateTerms($scope.terms,$scope.items,$scope.facet);
            //   searchCtrl.buildChildQuery($scope.terms,$scope.items,$scope.facet);
            // }//buildTermsAndQuery()


            //=======================================================================
            //
            //=======================================================================
            $scope.termsNotSelected = function () {
                  _.each($scope.terms, function (term) {
                      term.selected=0;
                  });
            };//buildTermsAndQuery()



              //=======================================================================
              //
              //=======================================================================
              $scope.loadReports = function (type) {

                if(type)
                  reportingDisplayCtrl.addSubQuery('reportType_s',type);
                reportingDisplayCtrl.addSubQuery('schema_s', 'nationalReport');
                reportingDisplayCtrl.addSubQuery('_latest_s', 'true');
                reportingDisplayCtrl.addSubQuery('_state_s', 'public');
                reportingDisplayCtrl.search();
              };// flatten

        }//link
    }; // return
  }]);  //app.directive('searchFilterCountries
});// define
