define(['text!./ammap3.html', 'app', 'lodash', 'ammap3', 'ammap3WorldHigh', 'ammap-theme', 'ammap-export','ammap-ex-fabric','ammap-ex-filesaver','ammap-ex-pdfmake','ammap-ex-vfs-fonts','ammap-ex-jszip','ammap-ex-xlsx'], function(template, app, _) {
  'use strict';

  app.directive('ammap3', ['$timeout', function($timeout) {
    return {
      restrict: 'EAC',
      template: template,
      replace: true,
      require: ['^reportingDisplay', '^ammap3'],
      scope: {
        items: '=ngModel',
        schema: '=schema',
        zoomTo: '=zoomTo',
        debug: '=debug'

      },
      link: function($scope, $element, $attr, requiredDirectives) {

        var reportingDIsplay = requiredDirectives[0];
        var ammap3 = requiredDirectives[1];
        $scope.legendTitle = "All Reporting to the CBD";
        $scope.leggends = {
          aichiTarget: [{
            id: 0,
            title: 'No Data',
            visible: true,
            color: '#dddddd'
          }, {
            id: 1,
            title: 'Moving Away',
            visible: true,
            color: '#6c1c67'
          }, {
            id: 2,
            title: 'No Progress',
            visible: true,
            color: '#ee1d23'
          }, {
            id: 3,
            title: 'Insufficient Rate',
            visible: true,
            color: '#fec210'
          }, {
            id: 4,
            title: 'Meet Target',
            visible: true,
            color: '#109e49'
          }, {
            id: 5,
            title: 'Exceeded Target',
            visible: true,
            color: '#1074bc'
          }, ],
          nationalReport: [

            {
              id: 0,
              title: 'Not Reported',
              visible: true,
              color: '#dddddd'
            }, {
              id: 1,
              title: 'Reported',
              visible: true,
              color: '#428bca'
            },

          ],
          default: [{
            id: 0,
            title: 'Not Reported',
            visible: true,
            color: '#dddddd'
          }, {
            id: 1,
            title: 'Reported',
            visible: true,
            color: '#428bca'
          }, ],
        };
        //generates new map with new data
        $scope.$watch('items', function() {
          ammap3.generateMap($scope.schema);
        });
        //external zoomToMap
        $scope.$watch('zoomTo', function() {
          zoomTo();
        }); //
        initMap();

        ammap3.writeMap();

        $scope.$on('customHome', function(event) {
          $timeout(function() {
            $scope.map.clickMapObject($scope.map.dataProvider);
          });
        });

        $scope.map.addListener("clickMapObject", function(event) {
          //  $scope.$apply(function(){
          //      reportingDIsplay.showCountryResultList(event.mapObject.id);
          //  });
          //                 $scope.$apply();
          // reportingDIsplay.showCountryResultList(event.mapObject.id);
          var id = event.mapObject.id;
          if(event.mapObject.id === 'GL')
          {
              $scope.map.clickMapObject(ammap3.getMapObject('DK'));
              id = 'DK';
          }
          if(event.mapObject.id === 'FO')
          {
              $scope.map.clickMapObject(ammap3.getMapObject('DK'));
              id = 'DK';
          }
          if(event.mapObject.id === 'SJ')
          {
              $scope.map.clickMapObject(ammap3.getMapObject('NO'));
              id = 'NO';
          }
          if(event.mapObject.id === 'EH')
          {
              $scope.map.clickMapObject(ammap3.getMapObject('MA'));
              id = 'MA';
          }
          if(event.mapObject.id === 'TW')
          {
              $scope.map.clickMapObject(ammap3.getMapObject('CN'));
              id = 'CN';
          }

          $scope.$evalAsync(function() {
            reportingDIsplay.showCountryResultList(id);
          });

        }); //

        $scope.map.addListener("homeButtonClicked", function() {
          $timeout(function() {
            reportingDIsplay.showCountryResultList('show');
          });
        });

        if ($scope.debug) {
          $scope.map.addListener("click", function(event) {
            var info = event.chart.getDevInfo();
            $timeout(function() {
              console.log({
                "latitude": info.latitude,
                "longitude": info.longitude
              });
            });
          });
        }

        //=======================================================================
        //
        //=======================================================================
        function zoomTo() {
          if ($scope.zoomTo[0])
            $scope.map.clickMapObject(ammap3.getMapObject($scope.zoomTo[0]));
        } //$scope.legendHide

        //=======================================================================
        //
        //=======================================================================
        function initMap() {
          $scope.mapData = {
            "type": "map",
            "theme": "light",
            "responsive": {
              "enabled": true
            },

            "dataProvider": {
              "map": "worldEUHigh",
              "getAreasFromMap": true,
              "images": [{
                "label": "EU",
                "latitude": -5.02,
                "longitude": -167.66
              }],
            },
            "areasSettings": {
              "autoZoom": true,
              "selectedColor": "#7fc3f4",
              "rollOverColor": "#423f3f",
              "selectable": true,
              "color": "#428bca",
            },
            "smallMap": {},
            "export": {
              "libs": { "autoLoad": false},
              "enabled": true,
              "position": "bottom-right"
            },
          }; //
        } //$scope.initMap
      }, //link

      controller: ["$scope", function($scope) {
        //=======================================================================
        //
        //=======================================================================
        function generateMap(schema) {

          if (!schema) return;
          if (schema.indexOf('AICHI-TARGET-') > -1)
            progressColorMap(aichiMap);
          else
            progressColorMap(defaultMap);
        } //$scope.legendHide

        //=======================================================================
        //
        //=======================================================================
        function restLegend(legend) {

          _.each(legend, function(legendItem) {
            legendItem.visible = true;
          });
        } //$scope.legendHide

        //=======================================================================
        //
        //=======================================================================
        function progressToNumber(progress) {

          switch (progress.trim()) {
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
        } //progressToNumber(progress)

        //=======================================================================
        //
        //=======================================================================
        $scope.legendHide = function(legendItem) {
          var area2 ={};
          var area3 ={};

          _.each($scope.map.dataProvider.areas, function(area) {

                  if(area.id.toUpperCase()==='DK'){
                           area2 = getMapObject('gl');
                           //area2.originalColor = area.originalColor;
                           area2.colorReal = area.colorReal;
                           area2.mouseEnabled = area.mouseEnabled;
                           area3 = getMapObject('fo');
                           //area2.originalColor = area.originalColor;
                           area3.colorReal = area.colorReal;
                           area3.mouseEnabled = area.mouseEnabled;
                  }
                  if (area.id.toUpperCase() === 'NO') {
                    area2 = getMapObject('sj');
                    //area2.originalColor = area.originalColor;
                    area2.colorReal = area.colorReal;
                    area2.mouseEnabled = area.mouseEnabled;
                  }
                  if (area.id.toUpperCase() === 'MA') {
                    area2 = getMapObject('eh');
                    //area2.originalColor = area.originalColor;
                    area2.colorReal = area.colorReal;
                    area2.mouseEnabled = area.mouseEnabled;
                  }
                  if (area.id.toUpperCase() === 'CN') {
                    area2 = getMapObject('tw');
                    //area2.originalColor = area.originalColor;
                    area2.colorReal = area.colorReal;
                    area2.mouseEnabled = area.mouseEnabled;
                  }

                  if (legendItem.color === area.originalColor && area.mouseEnabled === true)  {
                    area.colorReal = '#FFFFFF';
                    area.mouseEnabled = false;

                  } else if (legendItem.color === area.originalColor && area.mouseEnabled === false ) {
                    area.colorReal = legendItem.color;
                    area.mouseEnabled = true;

                  }

          });
          if (legendItem.visible)
            legendItem.visible = false;
          else
            legendItem.visible = true;
          $scope.map.validateData();
        }; //$scope.legendHide

        //=======================================================================
        //
        //=======================================================================
        function toggleLegend(legend, color) { //jshint ignore:line

          var index = _.findIndex(legend, function(legendItem) {
            return legendItem.color == 'color';
          });
          legend[index].visible = false;
        } //toggleLeggend

        //=======================================================================
        //
        //=======================================================================
        function writeMap(mapData) {

          if (!mapData) mapData = getMapData();
          $scope.map = AmCharts.makeChart("mapdiv", mapData); //jshint ignore:line
          $scope.map.write("mapdiv");
        } // writeMap

        //=======================================================================
        //
        //=======================================================================
        function progressColorMap(mapTypeFunction) {

          hideAreas();
          $scope.legendTitle = ""; // rest legend title
          _.each($scope.items, function(country) {
            _.each(country.docs, function(schema) {
              if (mapTypeFunction) mapTypeFunction(country, schema, $scope.schema);
            });
          });
          $scope.map.validateData(); // updates map with color changes
        } //progressColorMap

        //=======================================================================
        //
        //=======================================================================
        function aichiMap(country, schema, schemaName) {
          var doc = schema[0];
          changeAreaColor(country.identifier, progressToColor(progressToNumber(doc.progress_EN_t)));
          buildProgressBaloon(country, progressToNumber(doc.progress_EN_t), doc.nationalTarget_EN_t);
          legendTitle(country, schema, schemaName);
          restLegend($scope.leggends.aichiTarget);
        } // aichiMap

        //=======================================================================
        //
        //=======================================================================
        function defaultMap(country, schema, schemaName) {

          changeAreaColor(country.identifier, '#428bca');
          buildBaloon(country);
          legendTitle(country, schema, schemaName);
          restLegend($scope.leggends.default);
        }

        //=======================================================================
        //
        //=======================================================================
        function legendTitle(country, schema, schemaName) {

          if (schemaName.indexOf('AICHI-TARGET-') > -1) {
            $scope.legendTitle = aichiTargetReadable(schema[0].nationalTarget_EN_t) + " Assessments";
          } else if (schemaName == 'nr5' || schemaName == 'nr4' || schemaName == 'nr3' || schemaName == 'nr2' || schemaName == 'nr1') {
            $scope.legendTitle = schema[0].reportType_EN_t;

          } else if (schemaName == 'nbsaps') {
            $scope.legendTitle = 'National Biodiversity Strategies and Action Plans';

          } else if (schemaName == 'nationalIndicator') {
            $scope.legendTitle = 'National Indicators';

          } else if (schemaName == 'nationalTarget') {
            $scope.legendTitle = 'National Targets';

          } else if (schemaName == 'resourceMobilisation') {
            $scope.legendTitle = 'Resource Mobilisation';
          } else if (schemaName == 'all') {
            $scope.legendTitle = 'All Reporting';
          }
        } //legendTitle

        // //=======================================================================
        // //
        // //=======================================================================
        function changeAreaColor(id, color,area) {
          if(!area)
            area = getMapObject(id);
            area.colorReal = area.originalColor = color;
          if(id.toUpperCase()==='DK'){
              var area2 = getMapObject('GL');
              area2.colorReal = area.colorReal;
              area2.originalColor = area.originalColor;
              var area3 = getMapObject('FO');
              area3.colorReal = area.colorReal;
              area3.originalColor = area.originalColor;
          }
          if (area.id.toUpperCase() === 'NO') {
            var area4 = getMapObject('SJ');
            area4.colorReal = area.colorReal;
            area4.originalColor = area.originalColor;
          }
          if (area.id.toUpperCase() === 'MA') {
            var area5 = getMapObject('EH');
            area5.colorReal = area.colorReal;
            area5.originalColor= area.originalColor;
          }
          if(area.id.toUpperCase()==='CN'){
            var area6 = getMapObject('TW');
            area6.colorReal = area.colorReal;
            area6.originalColor = area.originalColor;
          }
        } //getMapObject

        // //=======================================================================
        // //
        // //=======================================================================
        function aichiTargetReadable(target) {

          return target.replace("-", " ").replace("-", " ").toLowerCase().replace(/\b./g, function(m) {
            return m.toUpperCase();
          });
        } //aichiTargetReadable

        // //=======================================================================
        // // c
        // //=======================================================================
        function buildProgressBaloon(country, progress, target) {

          var area = getMapObject(country.identifier);
          area.balloonText = "<div class='panel panel-default' ><div class='panel-heading' style='font-weight:bold; font-size:medium; white-space: nowrap;'><i class='flag-icon flag-icon-" + country.identifier + " ng-if='country.isEUR'></i>&nbsp;";
          var euImg = "<img src='app/images/flags/Flag_of_Europe.svg' style='width:25px;hight:21px;' ng-if='country.isEUR'></img>&nbsp;";
          var balloonText2 = area.title + "</div> <div class='panel-body' style='text-align:left;'><img style='float:right;width:60px;hight:60px;' src='" + getProgressIcon(progress) + "' >" + getProgressText(progress, target) + "</div> </div>";
          if (country.isEUR)
            area.balloonText += euImg;
          area.balloonText += balloonText2;
        } //buildProgressBaloon

        // //=======================================================================
        // // c
        // //=======================================================================
        function buildBaloon(country) {

          var area = getMapObject(country.identifier);
          area.balloonText = "<div class='panel panel-default' ><div class='panel-heading' style='font-weight:bold; font-size:large;''>";
          var euImg = "<img src='app/images/flags/Flag_of_Europe.svg' style='width:25px;hight:21px;' ng-if='country.isEUR'></img>";
          if (country.isEUR)
            area.balloonText += euImg + area.title + "</div>";
          else
            area.balloonText += "<i class='flag-icon flag-icon-" + country.identifier + " ng-if='country.isEUR'></i>&nbsp;" + area.title + "</div>";
          var balloonBody = '';

          if (country.docs.nationalReport && !country.docs.nationalReport.length)
            delete country.docs.nationalReport;

          // console.log('Object.keys(country.docs).length',Object.keys(country.docs).length);
          if (Object.keys(country.docs).length == 1) {

            _.each(country.docs, function(schema, schemaName) {

              switch (schemaName) {
                case 'nationalReport':
                  if ($scope.schema !== 'all')
                    balloonBody = " <div class='panel-body' style='text-align:left;'>" + country.docs.nationalReport[0].reportType_EN_t + "</div>";
                  break;
                case 'nbsaps':
                  if ($scope.schema !== 'all')
                    balloonBody = " <div class='panel-body' style='text-align:left;'>" + country.docs.nbsaps[0].title_t + "</div>";
                  break;
                case 'nationalIndicator':
                  if ($scope.schema !== 'all')
                    balloonBody = " <div class='panel-body' style='text-align:left;'>" + country.docs.nationalIndicator[0].title_t + "</div>";
                  break;
                case 'nationalTarget':
                  if ($scope.schema !== 'all')
                    balloonBody = " <div class='panel-body' style='text-align:left;'>" + country.docs.nationalTarget[0].title_t + "</div>";
                  break;
                case 'resourceMobilisation':
                  if ($scope.schema !== 'all')
                    balloonBody = " <div class='panel-body' style='text-align:left;'>" + country.docs.resourceMobilisation[0].title_t + "</div>";
                  break;
              }
            }); //_.each
          }
          area.balloonText += balloonBody;
        } //getMapObject

        // //=======================================================================
        // // c
        // //=======================================================================
        function getProgressIcon(progress) {

          switch (progress) {
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
        } //getProgressIcon(progress)

        // //=======================================================================
        // //
        // //=======================================================================
        function getProgressText(progress, target) {

          switch (progress) {
            case 1:
              return 'Moving away from ' + aichiTargetReadable(target) + ' (things are getting worse rather than better).';
            case 2:
              return 'No significant overall progress towards ' + aichiTargetReadable(target) + ' (overall, we are neither moving towards the ' + aichiTargetReadable(target) + ' nor moving away from it).';
            case 3:
              return 'Progress towards ' + aichiTargetReadable(target) + ' but at an insufficient rate (unless we increase our efforts the ' + aichiTargetReadable(target) + ' will not be met by its deadline).';
            case 4:
              return 'On track to achieve ' + aichiTargetReadable(target) + ' (if we continue on our current trajectory we expect to achieve the ' + aichiTargetReadable(target) + ' by 2020).';
            case 5:
              return 'On track to exceed ' + aichiTargetReadable(target) + ' (we expect to achieve the ' + aichiTargetReadable(target) + ' before its deadline).';
          }
        } //getProgressText(progress, target)

        // //=======================================================================
        // // changes color of all un colored areas
        // //=======================================================================
        function hideAreas(color) {
          // Walkthrough areas
          if (!color) color = '#dddddd';
          _.each($scope.map.dataProvider.areas, function(area) {
            if (area.id !== 'divider1') {
              area.colorReal = area.originalColor = color;
              area.mouseEnabled = true;
              area.balloonText = '[[title]]';
            }
          });
        } //hideAreas(color)

        // //=======================================================================
        // //
        // //=======================================================================
        function getMapObject(id) {

          var index = _.findIndex($scope.map.dataProvider.areas, function(area) {
            return area.id === id.toUpperCase();
          });
          return $scope.map.dataProvider.areas[index];
        } //getMapObject

        //=======================================================================
        //
        //=======================================================================
        function progressToColor(progress) {

          switch (progress) {
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
        } //readQueryString

        //=======================================================================
        //
        //=======================================================================
        function getMapData() {

          return $scope.mapData;
        }

        //=======================================================================
        //
        //=======================================================================
        function setMapData(name, value) {
          if (name && !value) $scope.mapData = name;
          else
            $scope.mapData[name] = value;
        }

        function homeButton() {
          $scope.map.fire("homeButtonClicked", {
            type: "homeButtonClicked",
            chart: $scope.map
          });
        }

        this.homeButton = homeButton;
        this.getMapObject = getMapObject;
        this.getMapObject = getMapObject;
        this.writeMap = writeMap;
        this.getMapData = getMapData;
        this.setMapData = setMapData;
        this.generateMap = generateMap;
        this.progressColorMap = progressColorMap;
      }],
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
