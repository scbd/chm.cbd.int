define(['text!./amchart3.html', 'app', 'lodash', 'amchart3', 'amchart3-serial', 'amchart3-pie', 'amchart3-theme-light'], function(template, app, _) { //
  'use strict';

  app.directive('amchart3', ['$timeout', function($timeout) {
    return {
      restrict: 'E',
      template: template,
      replace: true,
      require: ['^amchart3'],
      scope: {
        items: '=ngModel',
        chartData: '=chartData'
      },
      link: function($scope, $element, $attr, requiredDirectives) {

        $scope.$watch('chartData', function() {
          initChart();
        });

        $scope.showPie = 1;
        $scope.showChart = 0;


        $scope.setType = function(type) {

          switch (type) {
            case 'line':
              $scope.chart.graphs[0].type = 'line';
              $scope.chart.graphs[0].lineAlpha = 1;
              $scope.chart.graphs[0].fillAlphas = 0;
              $scope.chart.validateNow();
              break;
            case 'area':
              $scope.chart.graphs[0].type = 'line';
              $scope.chart.graphs[0].lineAlpha = 1;
              $scope.chart.graphs[0].fillAlphas = 0.3;
              $scope.chart.validateNow();
              break;
            case 'column':
              $scope.chart.graphs[0].type = 'column';
              $scope.chart.graphs[0].lineAlpha = 0;
              $scope.chart.graphs[0].fillAlphas = 0.5;
              $scope.chart.validateNow();
              break;
            case 'table':
              $scope.showTable = 1;
              $scope.showPie = 0;
              $scope.showChart = 0;
              return;;
            case 'pie':
              $scope.showPie = 1;
              $scope.showChart = 0;
              $scope.showTable = 0;

              buildPie();
              $scope.chartPie.animateAgain();


              return;
          }
          $scope.showTable = 0;
          $scope.showPie = 0;
          $scope.showChart = 1;
          $scope.chart.invalidateSize();
          $scope.chart.animateAgain();
        };

        // =======================================================================
        //
        // =======================================================================
        function initChart() {
          if ($scope.chartData.length === 0) return;

          $scope.chart = AmCharts.makeChart("chartdiv", {
            "theme": "light",
            "type": "serial",
            "dataProvider": $scope.chartData,
            "startDuration": 2,
            "valueAxes": [{
              "gridColor": "#FFFFFF",
              "gridAlpha": 0.2,
              "dashLength": 0
            }],
            "gridAboveGraphs": false,
            "startDuration": 1,
            "graphs": [{
              "balloonText": "[[category]]: <b>[[value]]</b>",
              "fillColorsField": "color",
              "fillAlphas": 1,
              "lineAlpha": 0.1,
              "type": "column",
              "valueField": "number"
            }],
            "depth3D": 20,
            "angle": 30,
            "chartCursor": {
              "categoryBalloonEnabled": false,
              "cursorAlpha": 0,
              "zoomable": false
            },
            "categoryField": "country",
            "categoryAxis": {
              "gridPosition": "start",
              "labelRotation": 90
            },
            "export": {
              "enabled": true
            },
            "categoryField": "report"
          });
          // create pie chart
          buildPie();
        } //$scope.initMap

        // =======================================================================
        // hack becasue renaimate does not work with pie
        // =======================================================================
        function buildPie() {
          $timeout(function() {
            $scope.chartPie = AmCharts.makeChart("chartdivpie", {
              "type": "pie",
              "theme": "light",
              "dataProvider": $scope.chartData,
              "valueField": "number",
              "titleField": "report",
              "outlineAlpha": 0.4,
              "depth3D": 15,
              "colorField": "color",
              "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
              "angle": 30,
              "export": {
                "enabled": true
              }
            });
            _.each($scope.chartPie.dataProvider, function(slice, index) {
              slice.color = $scope.chartData[index].color;
            });
          });
        } //buildPie

        $scope.sortTable = function(term) {
          if ($scope.sortTerm == term) {
            $scope.orderList = !$scope.orderList;
          } else {
            $scope.sortTerm = term;
            $scope.orderList = true;
          }
        };
      }, //link

      controller: ["$scope", function($scope) {


      }],
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
