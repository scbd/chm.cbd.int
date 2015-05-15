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
        return function (date, unitOfTime) {

            if(!date)
                return "";

            if(unitOfTime)
                return moment(date).startOf(unitOfTime).fromNow();

            return moment(date).fromNow();
        };
    });
});
