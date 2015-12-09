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
          numRecords: '=count' // total count of all children subquires needed for 0 result combinations
        },
          link : function ($scope, $element, $attr, reportingDisplayCtrl)
        {
            $scope.expanded = false;
            $scope.schemaNameMap={

                'nationalAssessment':'National Assessments',
                'nationalReport':'National Reports'

            };
            $scope.$watch('items',function(){init();});
            $scope.$watch('show',function(){showCountry($scope.show);});

            //=======================================================================
    				//
    				//=======================================================================
    				function init() {
                  $scope.numCountries=_.size($scope.items);
                  if(!$scope.numRecords)$scope.numRecords=0;
    				}//

            //=======================================================================
    				//
    				//=======================================================================
    				function showCountry(showCountry) {

                  if(showCountry==='show') return showAllCountry();

                  _.each($scope.items,function(country){
                      if(country.identifier.toUpperCase()==showCountry.toUpperCase())
                          country.hidden=false;
                      else
                          country.hidden=true;
                  });

    				}//
            //=======================================================================
            //
            //=======================================================================
            function showAllCountry() {
                  _.each($scope.items,function(country){
                          country.hidden=false;
                  });

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
});// define
