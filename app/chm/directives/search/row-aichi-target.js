define(['text!./row-aichi-target.html','app'], function(template, app) { 'use strict';

    app.directive('rowAichiTarget', function () {
        return {
            restrict: 'EAC',
            template: template
        };
    });
});
