define(['app', 'underscore', 'providers/extended-route', 'js/support'], function(app, _) { 'use strict';

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/',                                         { templateUrl: '/app/views/index.html',                             resolveController: true,                                 resolveUser: true }).
            when('/database/',                                { templateUrl: '/app/views/database/index.html',                    resolveController: true,                                 resolveUser: true }).
            when('/database/countries/',                      { templateUrl: '/app/views/database/countries.html',                       controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/database/countries/:code',                 { templateUrl: '/app/views/database/country.html',                         controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/database/record',                          { templateUrl: '/app/views/database/record.html',                          controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'directives/forms/form-controls', 'leaflet-directive']) } }).


            when('/management/',                              { templateUrl: '/app/views/management/register.html',                      controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage']) } }).
            when('/management/register',                      { redirectTo:  '/management/' }).
            when('/management/requests',                      { templateUrl: '/app/views/management/index.html',                         controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage']) } }).
            when('/management/national-reporting/:schema?',   { templateUrl: '/app/views/management/national-reporting.html',            controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/management/my-records/:schema?',           { templateUrl: '/app/views/management/my-records.html',                    controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/management/list/:schema?',                 { templateUrl: '/app/views/management/record-list.html',                   controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/management/my-drafts',                     { templateUrl: '/app/views/management/my-drafts.html',                     controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities']) } }).

            when('/management/tasks',                         { templateUrl: '/app/views/management/tasks/tasks.html',                   controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/management/tasks/:id',                     { templateUrl: '/app/views/management/tasks/tasks-id.html',                controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/management/tasks/:id/:activity',           { templateUrl: '/app/views/management/tasks/tasks-id-activity.html',       controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['utilities/km-utilities']) } }).

            when('/management/signin',                        { templateUrl: '/app/views/management/signin.html',                 resolveController: true, resolveUser: true }).

        //  when('/management/meetings',                          { templateUrl: '/app/views/management/meetings/index.html',                 resolveController: true, resolveUser: true }).
        //  when('/management/meetings/:meetingId/documents',     { templateUrl: '/app/views/management/meetings/documents/index.html',       resolveController: true, resolveUser: true }).
        //  when('/management/meetings/:meetingId/documents/:id', { templateUrl: '/app/views/management/meetings/documents/document-id.html', resolveController: true, resolveUser: true }).

            when('/management/edit/aichiTarget',              { templateUrl: '/app/views/management/edit/aichi-target.html',             controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/caseStudy',                { templateUrl: '/app/views/management/edit/case-study.html',               controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/caseStudyHwb',             { templateUrl: '/app/views/management/edit/case-study-hwb.html',           controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/contact',                  { templateUrl: '/app/views/management/edit/contact.html',                  controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/database',                 { templateUrl: '/app/views/management/edit/database.html',                 controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/implementationActivity',   { templateUrl: '/app/views/management/edit/implementationActivity.html',   controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/marineEbsa',               { templateUrl: '/app/views/management/edit/marine-ebsa.html',              controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls', 'leaflet-directive']) } }).
            when('/management/edit/nationalIndicator',        { templateUrl: '/app/views/management/edit/nationalIndicator.html',        controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/nationalReport',           { templateUrl: '/app/views/management/edit/nationalReport.html',           controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/nationalSupportTool',      { templateUrl: '/app/views/management/edit/nationalSupportTool.html',      controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/nationalTarget',           { templateUrl: '/app/views/management/edit/nationalTarget.html',           controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/organization',             { templateUrl: '/app/views/management/edit/organization.html',             controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/progressAssessment',       { templateUrl: '/app/views/management/edit/progressAssessment.html',       controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/resource',                 { templateUrl: '/app/views/management/edit/resource.html',                 controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/resourceMobilisation',     { templateUrl: '/app/views/management/edit/resource-mobilisation.html',    controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).
            when('/management/edit/strategicPlanIndicator',   { templateUrl: '/app/views/management/edit/strategic-plan-indicator.html', controller: LEGACY_ManagementPageController,      resolveUser: true, resolve : { securized : securize(), dependencies : legacyResolver(['chm/services/editFormUtility.js', 'directives/forms/form-controls']) } }).

            when('/about/',                                   { templateUrl: '/app/views/about.html',                                    controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/network/',                                 { templateUrl: '/app/views/404.html',                                      controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/resources/',                               { templateUrl: '/app/views/404.html',                                      controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { dependencies : legacyResolver(['utilities/km-utilities']) } }).

            when('/help/404',                                 { templateUrl: '/app/views/404.html',                                      controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { dependencies : legacyResolver(['utilities/km-utilities']) } }).
            when('/help/403',                                 { templateUrl: '/app/views/403.html',                                      controller: LEGACY_InnerPageController,           resolveUser: true, resolve : { dependencies : legacyResolver(['utilities/km-utilities']) } }).

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


    //============================================================
    //
    //
    //============================================================
    function LEGACY_ManagementPageController($rootScope, $scope, $route, $location, siteMapUrls, navigation, user) {

        if ($route.current.originalPath != siteMapUrls.user.signIn)
            navigation.securize();

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
});
