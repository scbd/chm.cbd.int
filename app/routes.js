define(['app', 'lodash', 'text!views/index.html', 'text!views/database/index.html',  'providers/extended-route', 'services/navigation', 'services/realmConfig'], function(app, _, rootTemplate, searchTemplate) { 'use strict';

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/',                                         { template:    rootTemplate,                                   label :'CHM',                resolveController: 'views/index',          resolveUser: true }).
            when('/database',                                 { template:    searchTemplate,                                 label :'Database',           resolveController: 'views/database/index', resolveUser: true, reloadOnSearch : false }).
            when('/database/countries',                       { templateUrl: 'views/database/countries.html',                label :'Countries',          resolveController: true }).
            when('/database/countries/:code',                 { templateUrl: 'views/database/country.html',                  label :'Profile',            resolveController: true }).
            when('/database/record/:documentid?',             { templateUrl: 'views/database/record.html',                   label :'Record',             resolveController: true, resolveUser: true  }).

            when('/search',                                   { templateUrl: 'views/search/search.html',               label :'Search',               resolveController: true, reloadOnSearch : false}).
            when('/search/online-reporting',                  { templateUrl: 'views/search/online-reporting.html',     label :'CBD Implementation',   resolveController: true}).
            when('/search/financial-reporting',               { templateUrl: 'views/search/financial-reporting.html',  label :'CBD Implementation',   resolveController: true}).
            when('/search/reporting-map',                     { templateUrl: 'views/search/reporting-map.html',        label :'CBD Implementation',   resolveController: true, reloadOnSearch : false}).
            when('/search/financial-analyzer',                { templateUrl: 'views/reporting/resource-mobilization/index.html', label :'Financial Reporting Framework Analyzer', resolveController: true }).
            // SUBMIT SECTION

            when('/submit',                                             { templateUrl: 'views/management/submit.html',                          label: 'Management Center',    resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/online-reporting',                            { templateUrl: 'views/management/select/online-reporting.html',         label: 'Progress in achieving national and/or Aichi Biodiversity Targets',      resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/online-reporting/resourceMobilization',       { redirectTo:  '/submit/online-reporting/resourceMobilisation' }).
            when('/submit/online-reporting/:schema',                    { templateUrl: 'views/management/record-list.html',                     label: 'List',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/resourceMobilisation',                        { redirectTo:  '/submit/online-reporting/resourceMobilisation' }).
            when('/submit/resourceMobilization',                        { redirectTo:  '/submit/online-reporting/resourceMobilisation' }).
            when('/submit/:schema',                                     { templateUrl: 'views/management/record-list.html',                     label: 'List',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).

            // when('/submit/undbAction/new',                              { template:    '<div></div>',                                   label :'UNDB',           resolveController: 'views/management/edit/undb-action',          resolveUser: true }).
            when('/submit/undbAction/:uid',                             { template:    '<div></div>',                                   label :'UNDB',           resolveController: 'views/management/edit/undb-action',          resolveUser: true }).
            // when('/submit/undbPartner/new',                             { template:    '<div></div>',                                   label :'UNDB',           resolveController: 'views/management/edit/undb-partner',          resolveUser: true }).
            when('/submit/undbPartner/:uid',                            { template:    '<div></div>',                                   label :'UNDB',           resolveController: 'views/management/edit/undb-partner',          resolveUser: true }).

            when('/submit/cbd-reporting/national/',                     { templateUrl: 'views/management/cbdReporting/national.html',         label: 'Reporting on Progress in Achieving National Targets',      resolveController: true, resolveUser: true, resolve : { securized : securize() } }).

    //      when('/submit/online-reporting/:schema/:id',                <= final implementation goal
            when('/submit/nationalReport/new',          { templateUrl: 'views/management/edit/national-report.html',            label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/nationalReport/:uid',         { templateUrl: 'views/management/edit/national-report.html',            label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/resourceMobilisation/new',    { templateUrl: 'views/management/edit/resource-mobilisation.html',      label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/resourceMobilisation/:uid',   { templateUrl: 'views/management/edit/resource-mobilisation.html',      label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).

            when('/submit/online-reporting/nationalTarget/new',          { templateUrl: 'views/management/edit/national-target.html',            label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/online-reporting/nationalTarget/:uid',         { templateUrl: 'views/management/edit/national-target.html',            label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/online-reporting/nationalIndicator/new',       { templateUrl: 'views/management/edit/national-indicator.html',         label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/online-reporting/nationalIndicator/:uid',      { templateUrl: 'views/management/edit/national-indicator.html',         label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/online-reporting/nationalAssessment/new',      { templateUrl: 'views/management/edit/national-assessment.html',        label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/online-reporting/nationalAssessment/:uid',     { templateUrl: 'views/management/edit/national-assessment.html',        label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/online-reporting/nationalSupportTool/new',     { templateUrl: 'views/management/edit/national-support-tool.html',      label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/online-reporting/nationalSupportTool/:uid',    { templateUrl: 'views/management/edit/national-support-tool.html',      label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/online-reporting/implementationActivity/new',  { templateUrl: 'views/management/edit/implementation-activity.html',    label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/online-reporting/implementationActivity/:uid', { templateUrl: 'views/management/edit/implementation-activity.html',    label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).

            when('/submit/nationalReport6/new',          { templateUrl: 'views/management/edit/national-report-6.html',            label: 'Sixth national report',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/nationalReport6/:uid',         { templateUrl: 'views/management/edit/national-report-6.html',            label: 'Sixth national report',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).


            when('/submit/:schema',                                     { templateUrl: 'views/management/record-list.html',                     label: 'List',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
    //      when('/submit/:schema/:id',                                 <= final implementation goal
            when('/submit/aichiTarget/new',                              { templateUrl: 'views/management/edit/aichi-target.html',               label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/aichiTarget/:uid',                             { templateUrl: 'views/management/edit/aichi-target.html',               label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/caseStudy/new',                                { templateUrl: 'views/management/edit/case-study.html',                 label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/caseStudy/:uid',                               { templateUrl: 'views/management/edit/case-study.html',                 label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/marineEbsa/new',                               { templateUrl: 'views/management/edit/marine-ebsa.html',                label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/marineEbsa/:uid',                              { templateUrl: 'views/management/edit/marine-ebsa.html',                label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/organization/new',                             { templateUrl: 'views/management/edit/organization.html',               label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/organization/:uid',                            { templateUrl: 'views/management/edit/organization.html',               label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/resource/new',                                 { templateUrl: 'views/management/edit/resource.html',                   label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/resource/:uid',                                { templateUrl: 'views/management/edit/resource.html',                   label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).

            when('/submit/strategicPlanIndicator/new',                   { templateUrl: 'views/management/edit/strategic-plan-indicator.html',   label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/strategicPlanIndicator/:uid',                  { templateUrl: 'views/management/edit/strategic-plan-indicator.html',   label: 'Form',                  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).

            when('/submit/capacityBuildingInitiative/new',               { templateUrl: 'views/management/edit/capacity-building-initiative.html', label: 'Form',                resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/capacityBuildingInitiative/:uid',              { templateUrl: 'views/management/edit/capacity-building-initiative.html', label: 'Form',                resolveController: true, resolveUser: true, resolve : { securized : securize() } }).

            when('/management/requests',                      { templateUrl: 'views/management/tasks/index.html',            label : 'User Notifications and Requests',          resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/requests/:id',                  { templateUrl: 'views/management/tasks/tasks-id.html',         label : 'User Notifications and Requests',           resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/requests/:id/:activity',        { templateUrl: 'views/management/tasks/tasks-id-activity.html',label : 'Activity',          resolveController: true, resolveUser: true, resolve : { securized : securize() } }).

            when('/management/national-users', { templateUrl: 'views/management/national-users/index.html',label : 'National Users',  resolveController: true, resolve : { user : securizeNational(['Administrator', 'ChmAdministrator']) } }).

            when('/signin',                                             { templateUrl: 'views/users/signin.html',                                                   resolveController: true, resolveUser: true }).

            //lifeWeb Routes
            when('/lifeWeb',                                             { templateUrl: 'views/management/lifeWeb/life-web-select.html',         label: 'LifeWeb Online Reporting',   resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/lwEvent/new',                                  { templateUrl: 'views/management/edit/lw-event.html',                   label: 'Form',                       resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/lwEvent/:uid',                                 { templateUrl: 'views/management/edit/lw-event.html',                   label: 'Form',                       resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/lwProject/new',                                { templateUrl: 'views/management/edit/lw-project.html',                 label: 'Form',                       resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/lwProject/:uid',                               { templateUrl: 'views/management/edit/lw-project.html',                 label: 'Form',                       resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/lwDonor/new',                                  { templateUrl: 'views/management/edit/lw-donor.html',                   label: 'Form',                       resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/lwDonor/:uid',                   { templateUrl: 'views/management/edit/lw-donor.html',                   label: 'Form',                       resolveController: true, resolveUser: true, resolve : { securized : securize() } }).

            when('/stats/resourceMobilisation',           { templateUrl: 'views/management/stats/resource-mobilisation.html',  resolveController: true, resolveUser: true, resolve : { securized : securize(['ScbdStaff','Administrator','ChmAdministrator']) } }).

            //Dossier Routes
            when('/submit/dossier/new',                   { templateUrl: 'views/management/edit/aichi-target-dossier.html',    label: 'Form',                       resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/submit/dossier/:uid',                  { templateUrl: 'views/management/edit/aichi-target-dossier.html',    label: 'Form',                       resolveController: true, resolveUser: true, resolve : { securized : securize() } }).

            when('/help/404',                                 { templateUrl: 'views/404.html',  label : 'Not found',  controller: [function(){}], resolveUser: true }).
            when('/help/403',                                 { templateUrl: 'views/403.html',  label : 'Forbidden',  controller: [function(){}], resolveUser: true }).
            otherwise({ redirectTo: '/help/404' });


    }]);

    //============================================================
    //
    //
    //============================================================
    function securize(roles, requireGovernment)
    {
        var requireRoles  = !_.isEmpty(roles);

        return ["$location", "authentication", "siteMapUrls", 'realmConfig', function ($location, authentication, siteMapUrls, realmConfig) {

            return authentication.getUser().then(function (user) {

                if (!user.isAuthenticated) {

                    if (!$location.search().returnUrl)
                        $location.search({ returnUrl: $location.url() });

                    $location.path(siteMapUrls.user.signIn);

                    throw "securize: force sign in";
                }

                roles = _.union(roles||[], _.map(roles||[], realmConfig.getRoleName)); // Remap on test/training;

                if(requireRoles && !_.intersection(roles||[], user.roles).length) {
                    $location.search({ path: $location.url() });
                    $location.path(siteMapUrls.errors.notAuthorized);
                    throw "securize: not authorized";
                }

                if(requireGovernment && !user.government) {
                    $location.search({ path: $location.url() });
                    $location.path(siteMapUrls.errors.notAuthorized);
                    throw "securize: no government";
                }

                return user;
            });
        }];
    }

    //============================================================
    //
    //
    //============================================================
    function securizeNational(roles) {

        return ['$injector', 'realmConfig', function ($injector, realmConfig) {

            roles = (roles || []).concat(realmConfig.nationalRoles());

            return $injector.invoke(securize(roles, true), {});
        }];
    }
});
