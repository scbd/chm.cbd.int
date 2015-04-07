define(['app', 'underscore', 'text!views/index.html', 'text!views/database/index.html',  'providers/extended-route', 'services/navigation'], function(app, _, rootTemplate, searchTemplate) { 'use strict';

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/',                                         { template:    rootTemplate,                                   label :'CHM',                resolveController: 'views/index',                        resolveUser: true }).
            when('/database',                                 { template:    searchTemplate,                                 label :'Database',           resolveController: 'views/database/index',               resolveUser: true, reloadOnSearch : false }).
            when('/database/countries',                       { templateUrl: 'views/database/countries.html',                label :'Countries',                 controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/database/countries/:code',                 { templateUrl: 'views/database/country.html',                  excludeBreadcrumb : true,           controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/database/record',                          { templateUrl: 'views/database/record.html',                   label :'Record',             resolveController: true,                                 resolveUser: true  }).

            when('/management',                               { templateUrl: 'views/management/index.html',                  label : 'Management Centre', resolveController: true,                                 resolveUser: true, resolve : { securized : securize() } }).
            when('/management/register',                      { redirectTo:  '/management/' }).
            when('/management/national-reporting/:schema?',   { templateUrl: 'views/management/national-reporting.html',     label : 'National Reporting Tools', controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage']) } }).
            when('/management/list/:schema?',                 { templateUrl: 'views/management/record-list.html',            label : 'My Records',               controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage']) } }).

            when('/management/requests',                      { templateUrl: 'views/management/tasks/index.html',            label : 'Requests',                 controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage']) } }).
            when('/management/requests/:id',                  { templateUrl: 'views/management/tasks/tasks-id.html',         label : 'Request',                  controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage']) } }).
            when('/management/requests/:id/:activity',        { templateUrl: 'views/management/tasks/tasks-id-activity.html',label : 'Activity',                 controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage']) } }).

            when('/signin',                                   { templateUrl: 'views/users/signin.html',                                                   resolveController: true, resolveUser: true }).

        //  when('/management/meetings',                          { templateUrl: 'views/management/meetings/index.html',                 resolveController: true, resolveUser: true }).
        //  when('/management/meetings/:meetingId/documents',     { templateUrl: 'views/management/meetings/documents/index.html',       resolveController: true, resolveUser: true }).
        //  when('/management/meetings/:meetingId/documents/:id', { templateUrl: 'views/management/meetings/documents/document-id.html', resolveController: true, resolveUser: true }).

            when('/management/edit/aichiTarget',              { templateUrl: 'views/management/edit/aichi-target.html',             label : 'Edit Aichi Target',            controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/caseStudy',                { templateUrl: 'views/management/edit/case-study.html',               label : 'Edit Case Study',              controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/caseStudyHwb',             { templateUrl: 'views/management/edit/case-study-hwb.html',           label : 'Edit Case Study',              controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/contact',                  { templateUrl: 'views/management/edit/contact.html',                  label : 'Edit Contact',                 controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/database',                 { templateUrl: 'views/management/edit/database.html',                 label : 'Edit Database',                controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/implementationActivity',   { templateUrl: 'views/management/edit/implementationActivity.html',   label : 'Edit ImplementationActivity',  controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/marineEbsa',               { templateUrl: 'views/management/edit/marine-ebsa.html',              label : 'Edit EBSA',                    controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls', 'leaflet-directive']) } }).
            when('/management/edit/nationalIndicator',        { templateUrl: 'views/management/edit/nationalIndicator.html',        label : 'Edit NationalIndicator',       controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/nationalReport',           { templateUrl: 'views/management/edit/nationalReport.html',           label : 'Edit NationalReport',          controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/nationalSupportTool',      { templateUrl: 'views/management/edit/nationalSupportTool.html',      label : 'Edit National SupportTool',    controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/nationalTarget',           { templateUrl: 'views/management/edit/nationalTarget.html',           label : 'Edit National Target',         controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/organization',             { templateUrl: 'views/management/edit/organization.html',             label : 'Edit Organization',            controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/progressAssessment',       { templateUrl: 'views/management/edit/progressAssessment.html',       label : 'Edit Progress Assessment',     controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/resource',                 { templateUrl: 'views/management/edit/resource.html',                 label : 'Edit V-L Resource',            resolveController: true, resolveUser: true, resolve : { securized : securize() } }).
            when('/management/edit/resourceMobilisation',     { templateUrl: 'views/management/edit/resource-mobilisation.html',    label : 'Edit Resource Mobilisation',   controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).
            when('/management/edit/strategicPlanIndicator',   { templateUrl: 'views/management/edit/strategic-plan-indicator.html', label : 'Edit Indicator',               controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility', 'directives/forms/form-controls']) } }).

            when('/about',                                    { templateUrl: 'views/about.html',       label : 'About',      controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/network',                                  { templateUrl: 'views/404.html',         label : 'Network',    controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/resources',                                { templateUrl: 'views/404.html',         label : 'Resources',  controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { dependencies : legacyResolver(['utilities/km-utilities']) } }).

            when('/help/404',                                 { templateUrl: 'views/404.html',         label : 'Not found',  controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/help/403',                                 { templateUrl: 'views/403.html',         label : 'Forbidden',  controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { dependencies : legacyResolver(['utilities/km-utilities']) } }).

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
    function LEGACY_InnerPageController($rootScope, $scope, $route, $location, user) {

        $rootScope.homePage = false;
        $rootScope.userGovernment = user.government;
        $rootScope.portal = 'database';
        $rootScope.navigation = [
            { url: '/database/', title: 'Search' },
            { url: '/database/countries/', title: 'Parties and Country Profiles' }
        ];

        var subMenu = '';   // use ng-breadcrumbs instead
        switch ($location.path()) {
            case '/database/': {
                subMenu = 'Search';  // use ng-breadcrumbs instead
                break;
            }
            case '/database/countries/': {
                subMenu = 'Parties and Country Profiles';  // use ng-breadcrumbs instead
                break;
            }
            default: subMenu = '';  // use ng-breadcrumbs instead
        }

        $rootScope.navigationTree = {
            mainMenu: 'Finding Information', subMenu: subMenu   // use ng-breadcrumbs instead
        };
    }
    LEGACY_InnerPageController.$inject = ['$rootScope', '$scope', '$route', '$location', 'user'];


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
