define(['text!./results-list.html', 'app', 'lodash'], function(template, app, _) { 'use strict';

app.directive('resultsList',['$timeout', function ($timeout) {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        require : '^reportingDisplay',
        scope: {
          title: '@title',
          items: '=ngModel',
          facet: '@facet',
          numRecords: '=count' // total count of all children subquires needed for 0 result combinations
        },
          link : function ($scope, $element, $attr, reportingDisplayCtrl)
        {
            $scope.expanded = false;
            $scope.schemaNameMap={

                'nationalAssessment':'National Assesment'

            };
            $scope.$watch('items',function(){init();});

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
              $scope.fixURI =function (uri) {
//console.log(uri);


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
