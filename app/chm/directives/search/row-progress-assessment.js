define(['text!./row-progress-assessment.html','app'], function(template, app) { 'use strict';

    app.directive('rowProgressAssessment', function () {
        return {
            restrict: 'EAC',
            template: template
        };
    });
});
