var app = angular.module('kmApp', ['ngRoute', 'ngSanitize', 'kmAuthentication', 'kmUtilities', 'formControls', 'kmStorage',
    '$strap.directives', 'leaflet-directive', 'ngProgress']);

//(function() {

app.config(['$routeProvider', '$locationProvider', '$compileProvider', "$controllerProvider", function ($routeProvider, $locationProvider, $compileProvider, $controllerProvider, $q) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    app.controllerProvider = $controllerProvider;
    app.routeProvider = $routeProvider;
    app.compileProvider = $compileProvider;
    //  app.filterProvider     = $filterProvider;
    //  app.provide            = $provide;

    var getUser = function ($q, $http, authentication) {

        return $q.when(authentication.loadCurrentUser(true));
    };

    $routeProvider.
 		when('/', { controller: HomePageController, templateUrl: '/app/views/index.html', resolve: { user: getUser } }).
 		when('/database/', { controller: InnerPageController, templateUrl: '/app/views/database/index.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/database/countries/', { controller: InnerPageController, templateUrl: '/app/views/database/countries.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/database/countries/:code', { controller: InnerPageController, templateUrl: '/app/views/database/country.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/database/record', { controller: InnerPageController, templateUrl: '/app/views/database/record.html', resolve: { user: getUser } }).

 		when('/management/', { controller: InnerPageController, templateUrl: '/app/views/empty.html', resolve: { user: getUser } }).
 		when('/management/', { controller: ManagementPageController, templateUrl: '/app/views/management/index.html', resolve: { user: getUser } }).
 		when('/management/register', { controller: ManagementPageController, templateUrl: '/app/views/management/register.html', resolve: { user: getUser } }).
 		when('/management/requests', { controller: ManagementPageController, templateUrl: '/app/views/management/index.html', resolve: { user: getUser } }).
 		//when('/management/national-reporting/:country?', { controller: ManagementPageController, templateUrl: '/app/views/management/national-reporting.html', resolve: { user: getUser }, reloadOnSearch: false }).
        when('/management/national-reporting/:schema?', { controller: ManagementPageController, templateUrl: '/app/views/management/national-reporting.html', resolve: { user: getUser }, reloadOnSearch: false }).
        when('/management/my-records/:schema?', { controller: ManagementPageController, templateUrl: '/app/views/management/my-records.html', resolve: { user: getUser } }).
 		when('/management/my-drafts', { controller: ManagementPageController, templateUrl: '/app/views/management/my-drafts.html', resolve: { user: getUser } }).
 		when('/management/signin', { controller: ManagementPageController, templateUrl: '/app/views/management/signin.html', resolve: { user: getUser } }).

 		when('/management/edit/resource', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/resource.html', resolve: { user: getUser } }).
 		when('/management/edit/national-reporting/nationalReport', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/nationalReport.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/national-reporting/nationalTarget', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/nationalTarget.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/national-reporting/nationalIndicator', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/nationalIndicator.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/national-reporting/progressAssessment', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/progressAssessment.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/national-reporting/implementationActivity', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/implementationActivity.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/national-reporting/nationalSupportTool', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/nationalSupportTool.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/national-reporting/aichiTarget', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/aichi-target.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/marineEbsa', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/marine-ebsa.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/caseStudy', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/case-study.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/caseStudyHwb', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/case-study-hwb.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/resourceMobilisation', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/resource-mobilisation.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/strategicPlanIndicator', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/strategic-plan-indicator.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/organization', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/organization.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/contact', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/contact.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/edit/database', { controller: ManagementPageController, templateUrl: '/app/views/management/edit/database.html', resolve: { user: getUser }, reloadOnSearch: false }).

 		when('/management/tasks', { controller: ManagementPageController, templateUrl: '/app/views/management/tasks/tasks.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/tasks/:id', { controller: ManagementPageController, templateUrl: '/app/views/management/tasks/tasks-id.html', resolve: { user: getUser }, reloadOnSearch: false }).
 		when('/management/tasks/:id/:activity', { controller: ManagementPageController, templateUrl: '/app/views/management/tasks/tasks-id-activity.html', resolve: { user: getUser }, reloadOnSearch: false }).

		when('/network/', { controller: NetworkPortalPageController, templateUrl: '/app/views/404.html', resolve: { user: getUser } }).
 		when('/resources/', { controller: ResourcesPortalPageController, templateUrl: '/app/views/404.html', resolve: { user: getUser } }).

 		when('/about/', { controller: AboutPortalPageController, templateUrl: '/app/views/about.html', resolve: { user: getUser } }).
 		when('/help/404', { controller: AboutPortalPageController, templateUrl: '/app/views/404.html', resolve: { user: getUser } }).
 		when('/help/403', { controller: AboutPortalPageController, templateUrl: '/app/views/403.html', resolve: { user: getUser } }).

 		when('/settings/profile', { controller: ManagementPageController, templateUrl: '/app/views/settings/profile.html', resolve: { user: getUser } }).
 		when('/settings/password', { controller: ManagementPageController, templateUrl: '/app/views/settings/password.html', resolve: { user: getUser } }).
 		when('/settings/changePassword', { controller: ManagementPageController, templateUrl: '/public/accounts.cbd.int/change-password.html', resolve: { user: getUser } }).

		otherwise({ redirectTo: '/help/404' });

    function HomePageController($scope, $rootScope, $route, $browser, $location, $window, user, authentication) {

        $rootScope.homePage = true;
        $rootScope.userGovernment = user.government;
        $rootScope.navigation = [];
        $rootScope.navigationTree = [];

        $scope.email = $browser.cookies().lastLoginEmail || "";
        $scope.rememberMe = !!$browser.cookies().lastLoginEmail;

        //========================================
        //
        //========================================
        $scope.signIn = function () {

            var sEmail = $scope.email;
            var sPassword = $scope.password;

            authentication.signIn(sEmail, sPassword).then(
                function (data) { // Success
                    $scope.setCookie("lastLoginEmail", $scope.rememberMe ? sEmail : undefined, 365, '/');
                    authentication.loadCurrentUser().then(function () { $location.path("/management"); });
                },
                function (error) { // Error
                    $scope.password = "";
                    $scope.isLoading = false;
                    $scope.isForbidden = error.errorCode == 403;
                    $scope.isNoService = error.errorCode == 404;
                    $scope.isError = error.errorCode != 403 && error.errorCode != 404;
                    $scope.error = error.error;
                    throw error;
                });
        };

        //========================================
        //
        //========================================
        $scope.setCookie = function (name, value, days, path) {
            var sCookieString = escape(name) + "=";

            if (value) sCookieString += escape(value)
            else days = -1

            if (path)
                sCookieString += "; path=" + path;

            if (days || days == 0) {
                var oExpire = new Date();

                oExpire.setDate(oExpire.getDate() + days);

                sCookieString += "; expires=" + oExpire.toUTCString();
            }

            $window.document.cookie = sCookieString
        };
    }

    function InnerPageController($rootScope, $scope, $route, user) {

        $rootScope.homePage = false;
        $rootScope.userGovernment = user.government;
        $rootScope.portal = 'database';
        $rootScope.navigation = [
            { url: '/database/', title: 'Search' },
            { url: '/database/countries/', title: 'Parties and Country Profiles' }
        ];


        var subMenu = '';
        switch ($scope.currentPath()) {
            case '/database/': {
                subMenu = 'Search';
                break;
            }
            case '/database/countries/': {
                subMenu = 'Parties and Country Profiles';
                break;
            }
            default: subMenu = '';
        }

        $rootScope.navigationTree = {
            mainMenu: 'Finding Information', subMenu: subMenu
        };
    }

    function NetworkPortalPageController($rootScope, $scope, $route, user, $window, $timeout) {

        $rootScope.homePage = false;
        $rootScope.userGovernment = user.government;
        $rootScope.portal = 'network';
        $rootScope.navigation = [];

        $timeout(function () {
            $window.parent.Mercury.trigger('reinitialize');

            console.log('reinitialized');
        }, 1000);


        $rootScope.navigationTree = {
            mainMenu: 'Network', subMenu: ''
        };
        //jQuery($window.parent).on('mercury:ready', function() {});
    }

    function ResourcesPortalPageController($rootScope, $scope, $route, user) {

        $rootScope.homePage = false;
        $rootScope.userGovernment = user.government;
        $rootScope.portal = 'resources';
        $rootScope.navigation = [];
        $rootScope.navigationTree = {
            mainMenu: 'Resources', subMenu: ''
        };
    }

    function AboutPortalPageController($rootScope, $scope, $route, user) {

        $rootScope.homePage = false;
        $rootScope.userGovernment = user.government;
        $rootScope.portal = 'about';
        $rootScope.navigation = [];

        $rootScope.navigationTree = {
            mainMenu: 'About', subMenu: ''
        };
    }

    function ManagementPageController($rootScope, $scope, $route, $location, siteMapUrls, navigation, user) {

        if ($route.current.originalPath != siteMapUrls.user.signIn)
            navigation.securize();

        $rootScope.homePage = false;
        $rootScope.userGovernment = user.government;
        $rootScope.portal = 'management';
        $rootScope.navigation = [
            { url: '/management/', title: 'My Dashboard' },
            { url: '/management/register', title: 'Register a new record' },
            { url: '/management/my-records', title: 'Edit a published record' },
            { url: '/management/my-drafts', title: 'Edit a draft record' },
        ];

        var subMenu = '';
        switch ($scope.currentPath()) {
            case '/management/': {
                subMenu = 'My Dashboard';
                break;
            }
            case '/management/register': {
                subMenu = 'Register a new record';
                break;
            }
            case '/management/my-records': {
                subMenu = 'Edit a published record';
                break;
            }
            case '/management/my-drafts': {
                subMenu = 'Edit a draft record';
                break;
            }
            default: subMenu = '';
        }

        $rootScope.navigationTree = {
            mainMenu: 'Registering Information', subMenu: subMenu
        };
    }
}]);

app.value("realm", "CHM");
app.value("schemaTypes", ["aichiTarget", "contact", "caseStudy", "database", "implementationActivity", "marineEbsa", "nationalIndicator", "nationalReport", "nationalSupportTool", "nationalTarget", "organization", "progressAssessment", "resource", "resourceMobilisation", "strategicPlanIndicator"])
app.value("siteMapUrls", {

    management: {
        home: "/management",
        drafts: "/management/my-drafts",
        records: "/management/my-records",
        workflows: "/management"
    },

    errors: {
        notFound: "/help/404",
        notAuthorized: "/help/403"
    },

    user: {
        signIn: "/management/signin",
        signUp: "/user/sign-up",
        account: "/user/my-account"
    }
});

app.service("navigation", ["$q", "$location", "$timeout", "underscore", "authentication", "siteMapUrls", function ($q, $location, $timeout, _, authentication, siteMapUrls) {

    return {
        securize: function (roles) {
            return authentication.loadCurrentUser(true).then(function (user) {

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
        }
    };

}])

function PageController($scope, $window, $location, authentication, $browser) {

    $(function () {
        $.scrollUp({ scrollText: 'scroll to top' });
    });

    //if($location.protocol()=="http" && !$location.host().match(/(.*\.local)|(^localhost)$/)
    if ($location.protocol() == "http" && $location.host() == "chm.cbd.int")
        $window.location = "https://chm.cbd.int/";

    //========================================
    //
    //========================================
    $scope.doSearch = function () {
        $location.url('/database/').search('q', $scope.searchQuery);
        $scope.searchQuery = '';
    }

    //========================================
    //
    //========================================
    $scope.signOut = function () {
        authentication.signOut();
        $location.path('/');
    };

    $scope.goHome = function () { $location.path('/'); };

    $scope.currentPath = function () { return $location.path(); };

    $scope.hideSubmitInfoButton = function() { return $scope.currentPath()=="/management/register"; };

    //============================================================
    //
    //
    //============================================================
   function setCookie (name, value, days, path) {

        var cookieString = escape(name) + "=";

        if(value) cookieString += escape(value);
        else      days = -1;

        if(path)
            cookieString += "; path=" + path;

        if(days || days == 0) {

            var expirationDate = new Date();

            expirationDate.setDate(expirationDate.getDate() + days);

            cookieString += "; expires=" + expirationDate.toUTCString();
        }

        document.cookie = cookieString
    };



    //============================================================
    //
    //
    //============================================================
    function receiveMessage(event)
    {
        if(event.origin!='https://accounts.cbd.int')
            return;

        var message = JSON.parse(event.data);

        if(message.type=='ready')
            event.source.postMessage('{"type":"getAuthenticationToken"}', event.origin);

        if(message.type=='authenticationToken') {
            if(message.authenticationToken && !$browser.cookies().authenticationToken) {
                setCookie('authenticationToken', message.authenticationToken, 7, '/');
                $window.location.href = window.location.href;
            }
            if(!message.authenticationToken && $browser.cookies().authenticationToken) {
                authentication.signOut();
                //$window.location.href = $window.location.href;
            }
        }
    }

    window.addEventListener('message', receiveMessage, false);

    $(document).ready(function(){

        $("#authenticationFrame").bind("load", function() {
            var iframe = angular.element(document.querySelector('#authenticationFrame'))[0];
            iframe.contentWindow.postMessage('{"type":"getAuthenticationToken"}', 'https://accounts.cbd.int');
        });
    });
}

//============================================================
//
//============================================================
app.filter('integer', function () {
    return function (number, base, length) {

        var text = Number(number).toString(base || 10);

        if (text.length < (length || 0))
            text = '00000000000000000000000000000000'.substr(0, length - text.length) + text;

        return text;
    };
});

//============================================================
//
//============================================================
app.filter('schemaName', function () {
    return function (schema) {

        if (schema == "focalPoint") return "National Focal Point";
        if (schema == "authority") return "Competent National Authority";
        if (schema == "caseStudy") return "Case Study";
        if (schema == "contact") return "Contact";
        if (schema == "database") return "National Database";
        if (schema == "resource") return "Virtual Library Resource";
        if (schema == "organization") return "Organization";
        if (schema == "measure") return "National Regulation";
        if (schema == "marineEbsa") return "Ecologically or Biologically Significant Areas (EBSAs)";
        if (schema == "aichiTarget") return "Aichi Target";
        if (schema == "strategicPlanIndicator") return "Strategic Plan Indicator";
        if (schema == "nationalIndicator") return "National Indicator";
        if (schema == "nationalTarget") return "National Target";
        if (schema == "progressAssessment") return "Progress Assessment";
        if (schema == "nationalReport") return "National Report";
        if (schema == "implementationActivity") return "Implementation Activity";
        if (schema == "nationalSupportTool") return "Guidance and Support Tools";
        if (schema == "resourceMobilisation") return "Resource Mobilisation";
        if (schema == "absCheckpoint") return "Checkpoint";
        if (schema == "absCheckpointCommunique") return "Checkpoint Communiqué";
        if (schema == "absPermit") return "Permit";

        return (schema || "") + "*"
    };
});




//jQuery(window).on('mercury:ready', function() {
//jQuery(document).ready(function() {
//	angular.bootstrap(window.document.body, ['kmApp']);
//});
