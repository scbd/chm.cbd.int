define(['app', 'underscore', 'text!views/index.html', 'text!views/database/index.html',  'providers/extended-route', 'services/navigation'], function(app, _, rootTemplate, searchTemplate) { 'use strict';

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/',                                         { template:    rootTemplate,                                   label :'CHM',                resolveController: 'views/index',          resolveUser: true }).
            when('/database',                                 { template:    searchTemplate,                                 label :'Database',           resolveController: 'views/database/index', resolveUser: true, reloadOnSearch : false }).
            when('/database/countries',                       { templateUrl: 'views/database/countries.html',                label :'Countries',          resolveController: true }).
            when('/database/countries/:code',                 { templateUrl: 'views/database/country.html',                  label :'Profile',            resolveController: true }).
            when('/database/record',                          { templateUrl: 'views/database/record.html',                   label :'Record',             resolveController: true, resolveUser: true  }).

            when('/management',                               { templateUrl: 'views/management/index.html',                  label : 'Management Centre', resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/national-reporting/:schema?',   { templateUrl: 'views/management/national-reporting.html',     label : 'National Reporting',resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/list/:schema?',                 { templateUrl: 'views/management/record-list.html',            label : 'My Records',        resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/requests',                      { templateUrl: 'views/management/tasks/index.html',            label : 'Requests',          resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/requests/:id',                  { templateUrl: 'views/management/tasks/tasks-id.html',         label : 'Request',           resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/requests/:id/:activity',        { templateUrl: 'views/management/tasks/tasks-id-activity.html',label : 'Activity',          resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/register',                      { redirectTo:  '/management/' }).

            when('/signin',                                   { templateUrl: 'views/users/signin.html',                                                   resolveController: true, resolveUser: true }).

        //  when('/management/meetings',                          { templateUrl: 'views/management/meetings/index.html',                 resolveController: true, resolveUser: true }).
        //  when('/management/meetings/:meetingId/documents',     { templateUrl: 'views/management/meetings/documents/index.html',       resolveController: true, resolveUser: true }).
        //  when('/management/meetings/:meetingId/documents/:id', { templateUrl: 'views/management/meetings/documents/document-id.html', resolveController: true, resolveUser: true }).

            when('/management/edit/aichiTarget',              { templateUrl: 'views/management/edit/aichi-target.html',             label : 'Edit Aichi Target',            resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/edit/caseStudy',                { templateUrl: 'views/management/edit/case-study.html',               label : 'Edit Case Study',              resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/edit/caseStudyHwb',             { templateUrl: 'views/management/edit/case-study-hwb.html',           label : 'Edit Case Study HWB',          resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/edit/contact',                  { templateUrl: 'views/management/edit/contact.html',                  label : 'Edit Contact',                 resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/edit/database',                 { templateUrl: 'views/management/edit/database.html',                 label : 'Edit Database',                resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/edit/implementationActivity',   { templateUrl: 'views/management/edit/implementation-activity.html',  label : 'Edit ImplementationActivity',  resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/edit/marineEbsa',               { templateUrl: 'views/management/edit/marine-ebsa.html',              label : 'Edit EBSA',                    resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/edit/nationalIndicator',        { templateUrl: 'views/management/edit/national-indicator.html',       label : 'Edit National Indicator',      resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/edit/nationalReport',           { templateUrl: 'views/management/edit/national-report.html',          label : 'Edit National Report',         resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/edit/nationalSupportTool',      { templateUrl: 'views/management/edit/national-support-tool.html',    label : 'Edit National SupportTool',    resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/edit/nationalTarget',           { templateUrl: 'views/management/edit/nationalTarget.html',           label : 'Edit National Target',         controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/organization',             { templateUrl: 'views/management/edit/organization.html',             label : 'Edit Organization',            controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/progressAssessment',       { templateUrl: 'views/management/edit/progressAssessment.html',       label : 'Edit Progress Assessment',     controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/resource',                 { templateUrl: 'views/management/edit/resource.html',                 label : 'Edit V-L Resource',            resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/edit/resourceMobilisation',     { templateUrl: 'views/management/edit/resource-mobilisation.html',    label : 'Edit Resource Mobilisation',   controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/strategicPlanIndicator',   { templateUrl: 'views/management/edit/strategic-plan-indicator.html', label : 'Edit Indicator',               controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).

            when('/help/404',                                 { templateUrl: 'views/404.html',  label : 'Not found',  controller: [function(){}], resolveUser: true }).
            when('/help/403',                                 { templateUrl: 'views/403.html',  label : 'Forbidden',  controller: [function(){}], resolveUser: true }).
            otherwise({ redirectTo: '/help/404' });


    }]);

    //============================================================
    //
    //
    //============================================================
    function securize(roles)
    {
        return ["$location", "authentication", "siteMapUrls", function ($location, authentication, siteMapUrls) {

            return authentication.getUser().then(function (user) {

                if (!user.isAuthenticated) {

                    console.log("securize: force sign in");

                    if (!$location.search().returnUrl)
                        $location.search({ returnUrl: $location.url() });

                    $location.path(siteMapUrls.user.signIn);

                }
                else if (roles && !_.isEmpty(roles) && _.isEmpty(_.intersection(roles, user.roles))) {

                    console.log("securize: not authorized");

                    $location.search({ path: $location.url() });
                    $location.path(siteMapUrls.errors.notAuthorized);
                }

                return user;
            });
        }];
    }

    //============================================================
    //
    //
    //============================================================
    function legacyResolver(deps)
    {
        return ['$q', function($q) {

            var deferred = $q.defer();

            require(deps, function () {
                deferred.resolve();
            });

            return deferred.promise;
        }];
    }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    //============================================================
    //
    //
    //============================================================
    function LEGACY_ManagementPageController($rootScope, $scope, $route, $location, siteMapUrls, navigation, user) {

        $rootScope.homePage = false;
        $rootScope.userGovernment = user.government;
        $rootScope.portal = 'management';
        $rootScope.navigation = [
        { url: '/management/',           title: 'My Dashboard' },
        { url: '/management/register',   title: 'Register a new record' },
        { url: '/management/my-records', title: 'Edit a published record' },
        { url: '/management/my-drafts',  title: 'Edit a draft record' },
        ];

        var subMenu = '';  // use ng-breadcrumbs instead

        switch ($location.path()) {
            case '/management/': {
                subMenu = 'My Dashboard';  // use ng-breadcrumbs instead
                break;
            }
            case '/management/register': {
                subMenu = 'Register a new record';  // use ng-breadcrumbs instead
                break;
            }
            case '/management/my-records': {
                subMenu = 'Edit a published record';  // use ng-breadcrumbs instead
                break;
            }
            case '/management/my-drafts': {
                subMenu = 'Edit a draft record';  // use ng-breadcrumbs instead
                break;
            }
            default: subMenu = '';  // use ng-breadcrumbs instead
        }

        $rootScope.navigationTree = {
            mainMenu: 'Registering Information', subMenu: subMenu  // use ng-breadcrumbs instead
        };
    }
    LEGACY_ManagementPageController.$inject = ['$rootScope', '$scope', '$route', '$location', 'siteMapUrls', 'navigation', 'user'];
});
