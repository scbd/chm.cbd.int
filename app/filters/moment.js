define(['app', 'moment'], function(app, moment) { 'use strict';


    //============================================================
    //
    //============================================================
    app.filter('moment', function () {
        return function (date, format) {

            if(!date)
                return "";

            var day = moment(date);

            if(format)
                return day.format(format);

            return day.format();
        };
    });

    //============================================================
    //
    //============================================================
    app.filter('fromNow', function () {
        return function (date) {

            if(!date)
                return "";

            return moment(date).fromNow();
        };
    });
});
