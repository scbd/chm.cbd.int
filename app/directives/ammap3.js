define(['text!./ammap3.html', 'app', 'lodash','ammap3','ammap3WorldLow'], function(template, app, _,ammap3) { 'use strict';

app.directive('ammap3',[ function () {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,

        scope: {

        },
          link : function ($scope, $element, $attr, searchCtrl)
        {
          var map = AmCharts.makeChart( "mapdiv", {

            "type": "map",
            "theme": "light",

            "dataProvider": {
              "map": "worldLow",
              "getAreasFromMap": true
            },
            "areasSettings": {
              "autoZoom": true,
              "selectedColor": "#CC0000"
            },
            "smallMap": {},
            "export": {
              "enabled": true,
              "position": "bottom-right"
            }
          } );
          map.write("mapdiv");

console.log('map',map);
        },//link

    }; // return
  }]);  //app.directive('searchFilterCountries
});// define
