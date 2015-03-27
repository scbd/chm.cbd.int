define(['text!./row-meeting.html','app', 'moment'], function(template, app, moment) { 'use strict';

    app.directive('rowMeeting', function () {
        return {
            restrict: 'EAC',
            template: template,
            link: function ($scope) {
                $scope.formatDate = function formatDate (date) {
                    return moment(date).format('MMMM Do YYYY');
                };
            }
        };
    });

});
