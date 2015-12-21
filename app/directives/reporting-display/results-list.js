define(['text!./results-list.html', 'app', 'lodash'], function(template, app, _) { 'use strict';

app.directive('resultsList',['$timeout', function ($timeout) {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        require : '^reportingDisplay',
        scope: {
          show: '=show',
          items:       '=ngModel',
          totalRecords: '=count' // total count of all children subquires needed for 0 result combinations
        },
          link : function ($scope, $element, $attr, reportingDisplayCtrl)
        {
            $scope.expanded = false;
            $scope.schemaNameMap={

                'nationalAssessment':'National Assessments',
                'nationalReport':'National Reports',
                'nbsaps':'Nat. Bio. Strategies and Action Plans',
                'nationalIndicator':'National Indicators',
                'nationalTarget':'National Targets',
                'resourceMobilisation':'Financial Resource Mobilization'
            };
            $scope.$watch('items',function(){console.log($scope.items);init();});
            $scope.$watch('show',function(){showCountry($scope.show);},true);
          //  $scope.home = function () {alert('here');reportingDisplayCtrl.showCountryResultList('show')};
            //=======================================================================
    				//
    				//=======================================================================
    				function init() {
                  $scope.numCountries=_.size($scope.items);
                  if(!$scope.totalRecords)$scope.totalRecords=0;
                  $scope.numRecords=_.clone($scope.totalRecords);
    				}//

            //=======================================================================
    				//
    				//=======================================================================
    				function adjustCounts(showCountry) {

                    if(showCountry!=='show'){

                      $scope.numCountries=1;
                      $scope.numRecords =countRecords(showCountry);
                    }
    				}//

            //=======================================================================
    				//
    				//=======================================================================
    				function countRecords(showCountry) {
                    var count = 0;
                    _.each($scope.items,function(country){
                          if(country.identifier.toUpperCase()===showCountry.toUpperCase())
                            _.each(country.docs, function(schema){
                              _.each(schema, function(doc){ // jshint ignore:line
                                    count++;
                              });
                            });
                    });
                    return count;
    				}//countRecords

            //=======================================================================
    				//
    				//=======================================================================
    				function showCountry(showCountry) {
                  if(showCountry==='show' || !showCountry) return showAllCountry();
                        _.each($scope.items,function(country){
                              if(country.identifier.toUpperCase()===showCountry.toUpperCase()){
                                  country.hidden=0;
                                  country.expanded=1;
                                  adjustCounts(showCountry);
                                  _.each(country.docs, function(schema){
                                          schema.expandedDoc=1;
                                  });
                              }
                              else
                                  country.hidden=1;
                        });
    				}//

            //=======================================================================
            //
            //=======================================================================
            function showAllCountry() {
                  _.each($scope.items,function(country){
                          country.hidden=false;
                          country.expanded=0;
                          _.each(country.docs, function(schema){
                                  schema.expandedDoc=0;
                          });
                  });
                  $scope.numCountries=_.size($scope.items);
                  $scope.numRecords=_.clone($scope.totalRecords);

            }//
              //=======================================================================
              //
              //=======================================================================
              $scope.zoomToCountry =function (id) {
//console.log(uri);
                    reportingDisplayCtrl.zoomToCountry(id);

              }//



            //=======================================================================
            //
            //=======================================================================
            $scope.closeAllCountries =function (keepOpen) {

                  _.each($scope.items,function(country){

                    if(country.identifier==keepOpen)
                        country.expanded=true;
                    else
                        country.expanded=false;
                  });

            }//

            //=======================================================================
    				//
    				//=======================================================================
    				$scope.toggleHide =function (show) {

                  if(show)
                        show=false;
                  else
                        show=true;
                  return show;

    				}//
            // //=======================================================================
    				// //
    				// //=======================================================================
    				// function initJQ() {
            //     $(function () {
            //
            //         $('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this country');
            //         $('.tree li.parent_li > span').on('click', function (e) {
            //             var children = $(this).parent('li.parent_li').find(' > ul > li');
            //             if (children.is(":visible")) {
            //
            //                 children.hide('fast');
            //                 $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
            //             } else {
            //                 children.show('fast');
            //                 $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
            //             }
            //             e.stopPropagation();
            //         });
            //     });
            // }//initJQ()


        }//link
    }; // return
  }]);  //app.directive('searchFilterCountries

  app.filter('orderObjectBy', function() {
    return function(items, field, reverse) {
      var filtered = [];
      _.each(items, function(item) {
        filtered.push(item);
      });
      filtered.sort(function (a, b) {
        return (a[field] > b[field] ? 1 : -1);
      });
      if(reverse) filtered.reverse();
      return filtered;
    };
  });

});// define
