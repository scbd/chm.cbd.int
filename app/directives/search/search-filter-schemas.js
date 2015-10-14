define(['text!./search-filter-schemas.html', 'app', 'lodash'], function(template, app, _) { 'use strict';

    app.directive('searchFilterSchemas',[ "$timeout", function ($timeout) {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        require : '^search',
        scope: {
              title: '@title',
              items: '=ngModel',
              facet: '@facet',
              count: '=count' // total count of all children subquires needed for 0 result combinations
        },
    link : function ($scope, $element, $attr, searchCtrl)
        {

            $scope.terms = [];
            $scope.termsModal = {};
            $scope.expanded = false;
            //TODO - add in cbd managed records and check for login
            $scope.outreachRecords = [
                { identifier: 'notification', title: 'Notifications'  , count: 0 },
                { identifier: 'pressRelease', title: 'Press Releases' , count: 0 },
                { identifier: 'statement'   , title: 'Statements'     , count: 0 },
                { identifier: 'announcement', title: 'Announcements'  , count: 0 }
            ];

            $scope.referenceRecords = [
                // { identifier: 'treaty'                , title: 'Treaties'                , count: 0 },
                // { identifier: 'article'               , title: 'Treaty Articles'         , count: 0    },
                { identifier: 'event'                   , title: 'Related Events'                , count: 0 },
                { identifier: 'organization'            , title: 'Related Organizations'         , count: 0 },
                { identifier: 'resource'                , title: 'Virtual Library Resources'     , count: 0 }
            ];

             $scope.copRecords = [
                { identifier: 'aichiTarget'             , title: 'Aichi Biodiversity Targets'    , count: 0 },
                { identifier: 'strategicPlanIndicator'  , title: 'Strategic Plan Indicators'     , count: 0 },
                { identifier: 'marineEbsa'              , title: 'Marine EBSAs'                  , count: 0 },
                { identifier: 'caseStudy'               , title: 'Case Studies'                  , count: 0 }
            ];

            $scope.meetingRecords = [
                { identifier: 'meeting'                 , title: 'Meetings'                      , count: 0 },
                { identifier: 'meetingDocument'         , title: 'Meeting Documents'             , count: 0 },
                { identifier: 'decision'                , title: 'Decisions'                     , count: 0 },
                { identifier: 'recommendation'          , title: 'Recommendations'               , count: 0    }
            ];

            $scope.nationalRecords = [
                { identifier: 'focalPoint'              , title: 'National Focal Points'         , count: 0 },
                { identifier: 'nationalReport'          , title: 'National Reports and NBSAPs'   , count: 0 },
                { identifier: 'nationalTarget'          , title: 'National Targets'              , count: 0 },
                { identifier: 'nationalIndicator'       , title: 'National Indicators'           , count: 0 },
                { identifier: 'nationalAssessment'      , title: 'Progress Assessments'          , count: 0 },
                { identifier: 'implementationActivity'  , title: 'Implementation Activities'     , count: 0 },
                { identifier: 'nationalSupportTool'     , title: 'Guidance and Support Tools'    , count: 0 },
                {},
                { identifier: 'resourceMobilisation'    , title: 'Financial Reporting Framework' , count: 0 }
            ];

            $scope.cbdManagedRecords = [
                { identifier: 'lwDonor'                 , title: 'LifeWeb Donor'                 , count: 0 },
                { identifier: 'lwProject'               , title: 'LifeWeb Project'               , count: 0 },
                { identifier: 'lwEvent'                 , title: 'LifeWeb Event'                 , count: 0 },
            ];

            buildTermsAndQuery();
            $scope.$watch('items',function(){searchCtrl.updateTerms($scope.terms,$scope.items,$scope.facet);}); // ensure binding gets done at end in order to display facits

            //=======================================================================
      			//
      			//=======================================================================
            $scope.refresh = function (item,forceDelete){

                  searchCtrl.refresh(item,forceDelete,$scope.terms,$scope.items,$scope.facet);
            };//$scope.refresh

            //=======================================================================
      			//
      			//=======================================================================
            function buildTermsAndQuery() {

                  $scope.terms = _.union($scope.outreachRecords, $scope.referenceRecords, $scope.copRecords, $scope.meetingRecords, $scope.nationalRecords,$scope.cbdManagedRecords );
                  $scope.terms = searchCtrl.updateTerms($scope.terms,$scope.items,$scope.facet);
                  searchCtrl.buildChildQuery($scope.terms,$scope.items,$scope.facet);
            }//buildTermsAndQuery()

            // =======================================================================
            // Jquery to find modal and executes the event on when oped calling our callback
            // which our call back then calls $timeout whcih will ensure an angular context.
            // Better then apply call as onlly exectues when the digest is done.
            //
      			// =======================================================================
            $element.find("#dialogSelectSchemas").on('show.bs.modal', function(){

                  $timeout(function(){ //Ensure angular context
                        buildTermsAndQuery();
                        // make copy before self changes
                        $scope.termsModal.outreachRecords=JSON.parse(JSON.stringify($scope.outreachRecords));
                        $scope.termsModal.referenceRecords=JSON.parse(JSON.stringify($scope.referenceRecords));
                        $scope.termsModal.copRecords=JSON.parse(JSON.stringify($scope.copRecords));
                        $scope.termsModal.meetingRecords=JSON.parse(JSON.stringify($scope.meetingRecords));
                        $scope.termsModal.nationalRecords=JSON.parse(JSON.stringify($scope.nationalRecords));
                        $scope.termsModal.cbdManagedRecords=JSON.parse(JSON.stringify($scope.cbdManagedRecords));
                  });
            });//$element.find

          }//link
      }; // return
    }]);  //app.directive('searchFilterCountries
  });// define;
