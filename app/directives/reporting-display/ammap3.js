define(['text!./ammap3.html', 'app', 'lodash','ammap3','ammap3WorldLow','ammap-theme','ammap-resp'], function(template, app, _,ammap3) { 'use strict';

app.directive('ammap3',[ function () {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        require : ['^reportingDisplay','^ammap3'],
        scope: {
              items: '=ngModel',
        },
          link : function ($scope, $element, $attr, requiredDirectives)
        {
               var reportingDIsplay = requiredDirectives[0];
               var ammap3= requiredDirectives[1];
               $scope.$watch('items',function(){ammap3.progressColorMap();});
               initMap();
               //ammap3.writeMap($scope.mapData);
               ammap3.initAsslegend();
               ammap3.writeMap();
               console.log(ammap3);
               $scope.map.addListener("clickMapObject", function(event) {
                        alert('here');
                        console.log(event.mapObject);
               });
               //=======================================================================
               //
               //=======================================================================
               function initMap () {
                  $scope.mapData ={

                      "type": "map",
                      "theme": "light",
                      "responsive": {
                          "enabled": true
                        },
                      "dataProvider": {
                        "map": "worldLow",
                        "getAreasFromMap": true
                      },
                      "areasSettings": {
                        "autoZoom": true,
                        "selectedColor": "#423f3f",
                        "rollOverColor":"#423f3f",
                        "selectable": true,
                        "color": "#428bca",


                      },
                      "smallMap": {},
                      "export": {
                        "enabled": true,
                        "position": "bottom-right"
                      },
                    };//
                }//$scope.initMap
          },//link
          controller : ["$scope", function($scope) {

              //=======================================================================
              //
              //=======================================================================
              function writeMap(mapData) {
                    if(!mapData) mapData= getMapData();
                    $scope.map = AmCharts.makeChart( "mapdiv", mapData); //jshint ignore:line
                    $scope.map.write("mapdiv");
              }

              //=======================================================================
              //
              //=======================================================================
              function progressColorMap() {

                    var countryMap={};
                    var changed=null;
                    _.each($scope.items,function(docs,countyCode){
                            var doc =docs[0]; // get first from sorted list
                                if(doc.schema_s=='nationalAssessment')
                                {
                                      if(!changed)hideAreas();
                                      changeAreaColor(countyCode,progressToColor(doc.progress_EN_t));
                                      changed=1;//flag not to recolor entire map again
                                }

                    });
                    $scope.map.validateData(); // updates map with color changes
              }//progressColorMap

              // //=======================================================================
              // //
              // //=======================================================================
              function changeAreaColor(id,color) {
                          getMapObject(id).colorReal=color;
               }//getMapObject

              // //=======================================================================
              // // changes color of all un colored areas
              // //=======================================================================
              function hideAreas() {
                    // Walkthrough areas
                    _.each($scope.map.dataProvider.areas,function(area){
                          area.colorReal='#dddddd';
                    });
               }//getMapObject

              // //=======================================================================
              // //
              // //=======================================================================
              function getMapObject(id) {
                   var index = _.findIndex($scope.map.dataProvider.areas, function(area) {

                          return area.id === id.toUpperCase();
                    });

                    return $scope.map.dataProvider.areas[index];
               }//getMapObject

              //=======================================================================
              //
              //=======================================================================
              function progressToColor(progress) {

                  switch(progress.trim())
                  {
                      case "On track to exceed target":
                          return '#1074bc';
                      case "On track to achieve target":
                          return '#109e49';
                      case "Progress towards target but at an  insufficient rate":
                          return '#fec210';
                      case "No significant change":
                          return '#ee1d23';
                      case "Moving away from target":
                          return '#6c1c67';
                  }

              }//readQueryString



              //=======================================================================
              //
              //=======================================================================
              function getMapData() {

                    return $scope.mapData;
              }

              //=======================================================================
              //
              //=======================================================================
              function setMapData(name,value) {
                    if(name && !value)$scope.mapData=name;
                    else
                      $scope.mapData[name]=value;
              }

              //=======================================================================
              //
              //=======================================================================
              function setLegendMapData(name,value) {
                    if(name && !value)$scope.mapData.legend=name;
                    else
                      $scope.mapData.legend[name]=value;
              }//setLegendMapData

              //=======================================================================
              //
              //=======================================================================
              function setResponsiveMapData(name,value) {
                    if(name && !value)$scope.mapData.responsive=name;
                    else
                      $scope.mapData.responsive[name]=value;
              }//setLegendMapData

              //=======================================================================
              //
              //=======================================================================
              function initAsslegend() {
                  setLegendMapData( {
                    "width": "100%",
                    "marginRight": 27,
                    "marginLeft": 27,
                    "equalWidths": false,
                    "backgroundAlpha": 0.5,
                    "backgroundColor": "#FFFFFF",
                    "borderColor": "#ffffff",
                    "borderAlpha": 1,
                    "top": 358,
                    "left": 0,
                    "horizontalGap": 10,
                    "data": [ {
                      "title": "Exceed Target",
                      "color": "#1074bc",
                      "description":"desc1"
                    }, {
                      "title": "Meet Target",
                      "color": "#109e49",
                        "description":"desc2"
                    }, {
                      "title": "Insuffient Rate",
                      "color": "#fec210",
                        "description":"desc3"
                    }, {
                      "title": "No Progress",
                      "color": "#ee1d23",
                        "description":"desc4"
                    },
                    {
                      "title": "Moving Away",
                      "color": "#6c1c67",
                        "description":"desc5"
                    }
                   ]
                 });

            }// initAsslegend




              this.writeMap=writeMap;
              this.getMapData =getMapData;
              this.setMapData =setMapData;
              this.setLegendMapData=setLegendMapData;
              this.setResponsiveMapData=setResponsiveMapData;
              this.initAsslegend=initAsslegend;
              this.progressColorMap=progressColorMap;
          }],
    }; // return
  }]);  //app.directive('searchFilterCountries
});// define
