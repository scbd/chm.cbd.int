define(['text!./modalComments.html', 'app', './linechart'], function(template, app) { 'use strict';

    //============================================================
    //
    //============================================================
    app.directive('modal', function () {
        return {
            restrict: 'EA',
            require: ['^linechart'],
            scope: {
                header             : ' @modalHeader',
                comments           : '=',
                name               : '@name'
            },
            template: template,
            transclude: true,

        };
    });

});
