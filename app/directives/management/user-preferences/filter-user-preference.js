define(['text!./filter-user-preference.html', 'app', 'lodash'], function(template, app, _) { 'use strict';

    app.directive('filterUserPreference',["$q", "$http", function ($q, $http) {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        link : function ($scope){
            var countryRegionsLoaded = false;
            $scope.searchFilters = [
                { id: 'focalPoint'              ,   title: 'National Focal Points'         , type:'national' },
                { id: 'nationalReport6'         ,   title: 'Sixth National Report'         , type:'national' },
                { id: 'nationalReport'          ,   title: 'National Reports and NBSAPs'   , type:'national' },
                { id: 'nationalTarget'          ,   title: 'National Targets'              , type:'national' },
                { id: 'nationalIndicator'       ,   title: 'National Indicators'           , type:'national' },
                { id: 'nationalAssessment'      ,   title: 'Progress Assessments'          , type:'national' },
                { id: 'implementationActivity'  ,   title: 'Implementation Activities'     , type:'national' },
                { id: 'nationalSupportTool'     ,   title: 'Guidance and Support Tools'    , type:'national' },
                { id: 'resourceMobilisation'    ,   title: 'Financial Reporting Framework: Reporting on baseline and progress towards 2015' , type:'national' },
                { id: 'resourceMobilisation2020',   title: 'Financial Reporting Framework: Reporting on progress towards 2020',               type:'national' },             
                { id: 'event'                     , title: 'Events'                        , type:'reference' },
                { id: 'organization'              , title: 'Organizations'                 , type:'reference' },
                { id: 'resource'                  , title: 'Virtual Library Resources'     , type:'reference' },
                { id: 'capacityBuildingInitiative', title: 'Capacity-building Initiatives' , type:'reference' },
                { id: 'aichiTarget'             ,   title: 'Aichi Biodiversity Targets'    , type: 'reference' },
                { id: 'strategicPlanIndicator'  ,   title: 'Strategic Plan Indicators'     , type: 'reference' },
                { id: 'marineEbsa'              ,   title: 'Marine EBSAs'                  , type: 'reference' },
                { id: 'caseStudy'               ,   title: 'Case Studies'                  , type: 'reference' },
                { id: 'notification',               title: 'Notifications'                 , type: 'scbd' },
                { id: 'pressRelease',               title: 'Press Releases'                , type: 'scbd' },
                { id: 'statement'   ,               title: 'Statements'                    , type: 'scbd' },
                { id: 'announcement',               title: 'Announcements'                 , type: 'scbd' },
                { id: 'meeting'                 ,   title: 'Meetings'                      , type: 'scbd' },
                { id: 'meetingDocument'         ,   title: 'Documents'                     , type: 'scbd' },
                { id: 'decision'                ,   title: 'Decisions'                     , type: 'scbd' },
                { id: 'recommendation'          ,   title: 'Recommendations'               , type: 'scbd' }
            ];
            
            $scope.setSearchFilters = function(filters){
                $scope.loading = true;
                $q.when(loadCountryregions())
                .then(function(){
                    // console.log(filters);
                    _.map($scope.searchFilters, function(filter){filter.isSelected=false});
                    _.each(filters, function(filter){
                        var searchFilter =_.findWhere($scope.searchFilters, {id : filter.id})
                        if(searchFilter){
                            $scope.saveFilter(searchFilter);
                            searchFilter.isSelected = true;
                        }
                    });
                    $scope.loading = false;
                })
            }
            $scope.saveFilter = function(filter){
                filter.isSelected = !filter.isSelected;
                if(filter.isSelected)
                    $scope.setFilter({
                        "type" : filter.type,
                        "name" : filter.title,
                        "id" : filter.id,
                        "filterID" : filter.id
                    });
                else
                    $scope.removeFilter(filter);
            }

            function loadCountryregions(){
                if(countryRegionsLoaded)
                    return $q.when(countryRegionsLoaded);
                 var regions = $http.get('/api/v2013/thesaurus/domains/regions/terms')
                 var countries = $http.get('/api/v2013/thesaurus/domains/countries/terms')
                 return $q.all([countries, regions])
                        .then(function (results) {
                            _.map(results[0].data, function(region) { $scope.searchFilters.push({title : region.name, id : region.identifier, type:'country'})});
                            _.map(results[1].data, function(region) { $scope.searchFilters.push({title : region.name, id : region.identifier, type:'region'})});
                            countryRegionsLoaded = true;
                            $scope.searchFilters = _.uniq($scope.searchFilters);
                        });
            }
            // loadCountryregions();
          }//link
        }; // return
    }]); 
  });// define;
