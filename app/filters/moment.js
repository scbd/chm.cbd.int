define(['app', 'moment'], function(app, moment) { 'use strict';


    //============================================================
    //
    //============================================================
    app.filter('datetime', function () {
        return function (date, format) {

            format = format || "YYYY-MM-DD HH:MM";

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
