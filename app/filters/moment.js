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
        return function (date, unitOfTime) {

            if(!date)
                return "";

            if(unitOfTime)
                return moment(date).startOf(unitOfTime).fromNow();

            return moment(date).fromNow();
        };
    });
});
