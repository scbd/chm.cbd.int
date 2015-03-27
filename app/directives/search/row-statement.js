define(['text!./row-statement.html','app', 'moment'], function(template, app, moment) { 'use strict';

    app.directive('rowStatement', function () {
        return {
            restrict: 'EAC',
            template: template,
            link : function ($scope) {
                $scope.formatDate = function formatDate (date) {
                    return moment(date).format('MMMM Do YYYY');
                };
                $scope.cleanTitle = function cleanTitle (text) {
                   return text;
                };
            }
        };
    });
});
