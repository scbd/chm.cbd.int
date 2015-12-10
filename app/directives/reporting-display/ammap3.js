define(['text!./ammap3.html', 'app', 'lodash','ammap3','ammap3WorldHigh','ammap-theme'], function(template, app, _,ammap3) { 'use strict';

app.directive('ammap3',['$timeout',  function ($timeout) {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        require : ['^reportingDisplay','^ammap3'],
        scope: {
              items: '=ngModel',
              schema:'=schema',
              zoomTo:'=zoomTo'
        },
          link : function ($scope, $element, $attr, requiredDirectives)
        {
               var reportingDIsplay = requiredDirectives[0];
               var ammap3= requiredDirectives[1];
               $scope.legendTitle= "All Reporting to the CBD";
               $scope.leggends={
                 aichiTarget:[
                   {id:0, title:'No Data', visible:true, color:'#dddddd'},
                   {id:1, title:'Moving Away', visible:true, color:'#6c1c67'},
                   {id:2, title:'No Progress', visible:true, color:'#ee1d23'},
                   {id:3, title:'Insufficient Rate', visible:true, color:'#fec210'},
                   {id:4, title:'Meet Target', visible:true, color:'#109e49'},
                   {id:5, title:'Exceeded Target', visible:true, color:'#1074bc'},
               ],
               nationalReport:[

                 {id:0, title:'Not Reported', visible:true, color:'#dddddd'},
                 {id:1, title:'Reported', visible:true, color:'#428bca'},

               ],
               default:[
                 {id:0, title:'Not Reported', visible:true, color:'#dddddd'},
                 {id:1, title:'Reported', visible:true, color:'#428bca'},
               ],
             };
               $scope.$watch('items',function(){ammap3.generateMap($scope.schema);});
               $scope.$watch('zoomTo',function(){zoomTo();});//
               initMap();

               ammap3.writeMap();

               $scope.map.addListener("clickMapObject", function(event) {
                        $timeout(function(){
                            reportingDIsplay.showCountryResultList(event.mapObject.id);
                        });
               });

                $scope.map.addListener("homeButtonClicked", function(event) {
                    $timeout(function(){
                        reportingDIsplay.showCountryResultList('show');
                    });
                });

               //=======================================================================
               //
               //=======================================================================
               function zoomTo() {
                    if($scope.zoomTo[0] && $scope.zoomTo[0]!=='eur')
                      $scope.map.clickMapObject(ammap3.getMapObject($scope.zoomTo[0]));
               };//$scope.legendHide

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
                        "map": "worldHigh",
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
            function generateMap(schema) {

                  switch (schema){

                      case 'nationalAssessment':
                          progressColorMap();
                      return;
                      case 'nationalReport':
                          nationalReportMap();
                      return;
                    //  default:
                    //      ammap3.allRecordsMap();

                  }
            } //$scope.legendHide




            //=======================================================================
            //
            //=======================================================================
            function restLegend(legend) {

                    _.each(legend,function(legendItem){
                        legendItem.visible=true;
                    });
            };//$scope.legendHide

            //=======================================================================
            //
            //=======================================================================
            $scope.legendHide = function (legendItem) {
                    _.each($scope.map.dataProvider.areas,function(area){
                          if(legendItem.color===area.originalColor && area.mouseEnabled==true){
                                area.colorReal='#FFFFFF';
                                area.mouseEnabled=false;
                          }else if(legendItem.color===area.originalColor && area.mouseEnabled==false){
                                area.colorReal=legendItem.color;
                                area.mouseEnabled=true;
                          }
                    });
                    if(legendItem.visible)
                        legendItem.visible=false;
                    else
                        legendItem.visible=true;
                    $scope.map.validateData();
            };//$scope.legendHide

            //=======================================================================
            //
            //=======================================================================
            function toggleLegend(legend,color) {
                    var index = _.findIndex(legend, function(legendItem) {
                        return legendItem.color == 'color';
                    });
                    legend[index].visible=false;

            }//toggleLeggend

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

                    if(_.isEmpty($scope.items))hideAreas();
                    restLegend($scope.leggends.aichiTarget);
                    $scope.legendTitle=""; // rest legend title
                    var changed=null;
                    _.each($scope.items,function(country){
                          _.each(country.docs,function(schema,schemaName){
                                if(schemaName=='nationalAssessment')
                                {

                                      if(schema.length >= 1 &&  country.identifier!='eur')  // must account for va
                                      {

aichiMap(country,schema,changed);

                                      }
                                }
                          });
                    });
                    $scope.map.validateData(); // updates map with color changes

              }//progressColorMap

              //=======================================================================
              //
              //=======================================================================
              function aichiMap(country,schema,changed) {
                var doc =schema[0];
                if(!changed)hideAreas();
                changeAreaColor(country.identifier,progressToColor(progressToNumber(doc.progress_EN_t)));
                buildProgressBaloon(country.identifier,progressToNumber(doc.progress_EN_t),doc.nationalTarget_EN_t);
                changed=1;//flag not to recolor entire map again
                if(!$scope.legendTitle)$scope.legendTitle=aichiTargetReadable(doc.nationalTarget_EN_t)+" Assessments" ;
              }

              //=======================================================================
              //
              //=======================================================================
              function nationalReportMap() {

                    hideAreas();
                    restLegend($scope.leggends.aichiTarget);
                    $scope.legendTitle=""; // rest legend title
                    var changed=null;
                    _.each($scope.items,function(country){

                          _.each(country.docs,function(schema,schemaName){
                                if(schemaName=='nationalReport')
                                {
                                      if(schema.length >= 1  && country.identifier!='eur')  // must account for va
                                      {
                                          var doc =schema[0];//get first doc from sorted list
                              //if(!changed)hideAreas();
                                          changeAreaColor(country.identifier,'#428bca');
                                        //  buildProgressBaloon(country.identifier,progressToNumber(doc.progress_EN_t),doc.nationalTarget_EN_t);
                                          buildNRBaloon(country.identifier,country);
                                          changed=1;//flag not to recolor entire map again
                                          if(!$scope.legendTitle)$scope.legendTitle=doc.reportType_EN_t;
                                      }
                                }
                          });
                    });
                    $scope.map.validateData(); // updates map with color changes

              }//progressColorMap

              // //=======================================================================
              // //
              // //=======================================================================
              function changeAreaColor(id,color) {
//console.log('id',id);
                        var area =  getMapObject(id);
                        area.colorReal=area.originalColor=color;

               }//getMapObject

               // //=======================================================================
               // //
               // //=======================================================================
               function aichiTargetReadable(target) {

                        return target.replace("-", " ").replace("-", " ").toLowerCase().replace(/\b./g, function(m){ return m.toUpperCase(); });
                }//aichiTargetReadable

               // //=======================================================================
               // // c
               // //=======================================================================
               function buildProgressBaloon(id,progress,target) {
                            var area = getMapObject(id);
                            area.balloonText="<div class='panel panel-default' ><div class='panel-heading' style='font-weight:bold; font-size:large;''><i class='flag-icon flag-icon-"+id+"'></i>&nbsp;"+area.title+"</div> <div class='panel-body' style='text-align:left;'><img style='float:right;width:60px;hight:60px;' src='"+getProgressIcon(progress)+"' >"+getProgressText(progress,target)+"</div> </div>";
//console.log('id',area);
                }//getMapObject

                // //=======================================================================
                // // c
                // //=======================================================================
                function buildNRBaloon(id,country) {
                             var area = getMapObject(id);
                             area.balloonText="<div class='panel panel-default' ><div class='panel-heading' style='font-weight:bold; font-size:large;''><i class='flag-icon flag-icon-"+id+"'></i>&nbsp;"+area.title+"</div> <div class='panel-body' style='text-align:left;'>"+country.docs.nationalReport[0].reportType_EN_t+"</div>";
 //console.log('id',area);
                 }//getMapObject

                // //=======================================================================
                // // c
                // //=======================================================================
                function getProgressIcon(progress) {

                             switch (progress){
                                  case 1:
                                  return 'app/img/ratings/36A174B8-085A-4363-AE11-E34163A9209C.png';
                                  case 2:
                                  return 'app/img/ratings/2D241E0A-1D17-4A0A-9D52-B570D34B23BF.png';
                                  case 3:
                                  return 'app/img/ratings/486C27A7-6BDF-460D-92F8-312D337EC6E2.png';
                                  case 4:
                                  return 'app/img/ratings/E49EF94E-0590-486C-903B-68C5E54EC089.png';
                                  case 5:
                                  return 'app/img/ratings/884D8D8C-F2AE-4AAC-82E3-5B73CE627D45.png';
                             }
                }//getProgressIcon(progress)

                // //=======================================================================
                // //
                // //=======================================================================
                function getProgressText(progress,target) {

                             switch (progress){
                                  case 1:
                                  return 'Moving away from '+aichiTargetReadable(target)+' (things are getting worse rather than better).';
                                  case 2:
                                  return 'No significant overall progress towards '+aichiTargetReadable(target)+' (overall, we are neither moving towards the '+aichiTargetReadable(target)+' nor moving away from it).';
                                  case 3:
                                  return 'Progress towards '+aichiTargetReadable(target)+' but at an insufficient rate (unless we increase our efforts the '+aichiTargetReadable(target)+' will not be met by its deadline).';
                                  case 4:
                                  return 'On track to achieve '+aichiTargetReadable(target)+' (if we continue on our current trajectory we expect to achieve the '+aichiTargetReadable(target)+' by 2020).';
                                  case 5:
                                  return 'On track to exceed '+aichiTargetReadable(target)+' (we expect to achieve the '+aichiTargetReadable(target)+' before its deadline).';
                             }
                }//getProgressIcon(progress)

              // //=======================================================================
              // // changes color of all un colored areas
              // //=======================================================================
              function hideAreas(color) {
                    // Walkthrough areas
                    if(!color) color= '#dddddd';
                    _.each($scope.map.dataProvider.areas,function(area){
                          area.colorReal=area.originalColor=color;
                          area.mouseEnabled=true;
                          area.balloonText='[[title]]'
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
              function progressToNumber(progress) {

                  switch(progress.trim())
                  {
                      case "On track to exceed target":
                          return 5;
                      case "On track to achieve target":
                          return 4;
                      case "Progress towards target but at an  insufficient rate":
                          return 3;
                      case "No significant change":
                          return 2;
                      case "Moving away from target":
                          return 1;
                  }

              }//readQueryString

              //=======================================================================
              //
              //=======================================================================
              function progressToColor(progress) {

                  switch(progress)
                  {
                      case 5:
                          return '#1074bc';
                      case 4:
                          return '#109e49';
                      case 3:
                          return '#fec210';
                      case 2:
                          return '#ee1d23';
                      case 1:
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





              this.getMapObject=getMapObject;
              this.writeMap=writeMap;
              this.getMapData =getMapData;
              this.setMapData =setMapData;
              this.setLegendMapData=setLegendMapData;
              this.setResponsiveMapData=setResponsiveMapData;
              this.generateMap=generateMap;
              this.progressColorMap=progressColorMap;
          }],
    }; // return
  }]);  //app.directive('searchFilterCountries
});// define
