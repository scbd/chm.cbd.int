define(['text!./row-national-assessment.html','app'], function(template, app) { 'use strict';

    app.directive('rowNationalAssessment', function () {
        return {
            restrict: 'EAC',
            template: template
        };
    });
});
