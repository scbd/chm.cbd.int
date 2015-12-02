define(['text!./results-list.html', 'app', 'lodash'], function(template, app, _) { 'use strict';

app.directive('resultsList',[ function () {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        require : '^reportingDisplay',
        scope: {

        },
          link : function ($scope, $element, $attr, reportingDisplayCtrl)
        {
            $scope.expanded = false;



        }//link
    }; // return
  }]);  //app.directive('searchFilterCountries
});// define
