var app = angular.module('kmApp', [ 'ngRoute', 'ngSanitize', 'kmAuthentication', 'kmUtilities', 'formControls', 'kmStorage', '$strap.directives', 'ngProgress', 'leaflet-directive' ]);

//(function() {

app.config(['$routeProvider', '$locationProvider', '$compileProvider', function($routeProvider, $locationProvider, $compileProvider, $q) {

	$locationProvider.html5Mode(true);
	$locationProvider.hashPrefix('!');

//	app.controllerProvider = $controllerProvider;
    app.routeProvider      = $routeProvider;
    app.compileProvider    = $compileProvider;
//  app.filterProvider     = $filterProvider;
//  app.provide            = $provide;
	
	var getUser = function($q, $http, authentication) {
		
		return $q.when(authentication.loadCurrentUser(true));
    };

	$routeProvider.
 		when('/', 							{ controller:HomePageController, templateUrl:'/app/views/index.html', 				resolve: { user : getUser } }).
 		when('/database/', 					{ controller:InnerPageController, templateUrl:'/app/views/database/index.html', 	resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/database/countries/', 		{ controller:InnerPageController, templateUrl:'/app/views/database/countries.html', resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/database/countries/:code', 	{ controller:InnerPageController, templateUrl:'/app/views/database/country.html', 	resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/database/record',            { controller:InnerPageController, templateUrl:'/app/views/database/record.html',    resolve: { user : getUser } }).

 		when('/management/'                  , { controller:InnerPageController,      templateUrl:'/app/views/empty.html'                        , resolve: { user : getUser } }).
 		when('/management/'                  , { controller:ManagementPageController, templateUrl:'/app/views/management/index.html'             , resolve: { user : getUser } }).
 		when('/management/register'          , { controller:ManagementPageController, templateUrl:'/app/views/management/register.html'          , resolve: { user : getUser } }).
 		when('/management/national-reporting/:country?', { controller:ManagementPageController, templateUrl:'/app/views/management/national-reporting.html', resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/my-records'        , { controller:ManagementPageController, templateUrl:'/app/views/management/my-records.html'        , resolve: { user : getUser } }).
 		when('/management/my-drafts'         , { controller:ManagementPageController, templateUrl:'/app/views/management/my-drafts.html'         , resolve: { user : getUser } }).
 		when('/management/signin'			 , { controller:ManagementPageController, templateUrl:'/app/views/management/signin.html'            , resolve: { user : getUser } }).
 		
 		when('/management/edit/resource', 				{ controller:ManagementPageController, templateUrl:'/app/views/management/edit/resource.html'					, resolve: { user : getUser } }).
 		when('/management/edit/nationalReport', 		{ controller:ManagementPageController, templateUrl:'/app/views/management/edit/nationalReport.html'				, resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/edit/nationalTarget', 		{ controller:ManagementPageController, templateUrl:'/app/views/management/edit/nationalTarget.html'				, resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/edit/nationalIndicator', 		{ controller:ManagementPageController, templateUrl:'/app/views/management/edit/nationalIndicator.html'			, resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/edit/progressAssessment', 	{ controller:ManagementPageController, templateUrl:'/app/views/management/edit/progressAssessment.html'			, resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/edit/implementationActivity', { controller:ManagementPageController, templateUrl:'/app/views/management/edit/implementationActivity.html'		, resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/edit/nationalSupportTool', 	{ controller:ManagementPageController, templateUrl:'/app/views/management/edit/nationalSupportTool.html'		, resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/edit/aichiTarget', 			{ controller:ManagementPageController, templateUrl:'/app/views/management/edit/aichi-target.html'				, resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/edit/marineEbsa',             { controller:ManagementPageController, templateUrl:'/app/views/management/edit/marine-ebsa.html'                , resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/edit/caseStudy', 				{ controller:ManagementPageController, templateUrl:'/app/views/management/edit/case-study.html'					, resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/edit/resourceMobilisation',	{ controller:ManagementPageController, templateUrl:'/app/views/management/edit/resource-mobilisation.html'		, resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/edit/strategicPlanIndicator',	{ controller:ManagementPageController, templateUrl:'/app/views/management/edit/strategic-plan-indicator.html'	, resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/edit/organization',			{ controller:ManagementPageController, templateUrl:'/app/views/management/edit/organization.html'				, resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/edit/contact',				{ controller:ManagementPageController, templateUrl:'/app/views/management/edit/contact.html'					, resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/edit/database',				{ controller:ManagementPageController, templateUrl:'/app/views/management/edit/database.html'					, resolve: { user : getUser }, reloadOnSearch: false }).

 		when('/management/tasks',			{ controller:ManagementPageController, templateUrl:'/app/views/management/tasks/index.html'	, resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/tasks/:id',		{ controller:ManagementPageController, templateUrl:'/app/views/management/tasks/task.html'	, resolve: { user : getUser }, reloadOnSearch: false }).

		when('/network/', 					{ controller:NetworkPortalPageController  , templateUrl:'/app/views/404.html', 				resolve: { user : getUser } }).
 		when('/resources/', 				{ controller:ResourcesPortalPageController, templateUrl:'/app/views/404.html',				resolve: { user : getUser } }).

 		when('/about/',						{ controller:AboutPortalPageController    , templateUrl:'/app/views/about.html', 			resolve: { user : getUser } }).
 		when('/help/404',					{ controller:AboutPortalPageController    , templateUrl:'/app/views/404.html', 				resolve: { user : getUser } }).
 		when('/help/403',					{ controller:AboutPortalPageController    , templateUrl:'/app/views/403.html', 				resolve: { user : getUser } }).

 		when('/settings/profile', 			{ controller:ManagementPageController, templateUrl:'/app/views/settings/profile.html'          , resolve: { user : getUser } }).
 		when('/settings/password', 			{ controller:ManagementPageController, templateUrl:'/app/views/settings/password.html'         , resolve: { user : getUser } }).
 		when('/settings/changePassword',	{ controller:ManagementPageController, templateUrl:'/public/accounts.cbd.int/change-password.html'         , resolve: { user : getUser } }).

		otherwise({redirectTo:'/help/404'});

 		function HomePageController($scope, $rootScope, $route, $browser, $location, $window, user, authentication) {

 			$rootScope.homePage = true;
			$rootScope.userGovernment = user.government;
 			$rootScope.navigation = [];

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
				{ url: '/database/'          , title: 'Search' },
				{ url: '/database/countries/', title: 'Parties and Country Profiles' }
			];
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

			//jQuery($window.parent).on('mercury:ready', function() {});
		}

		function ResourcesPortalPageController($rootScope, $scope, $route, user) {

			$rootScope.homePage = false;
			$rootScope.userGovernment = user.government;
			$rootScope.portal = 'resources';
			$rootScope.navigation = [];
		}

		function AboutPortalPageController($rootScope, $scope, $route, user) {

			$rootScope.homePage = false;
			$rootScope.userGovernment = user.government;
			$rootScope.portal = 'about';
			$rootScope.navigation = [];
		}

		function ManagementPageController($rootScope, $scope, $route, $location, siteMapUrls, navigation, user) {

			if($route.current.originalPath!=siteMapUrls.user.signIn)
				navigation.securize();

			$rootScope.homePage = false;
			$rootScope.userGovernment = user.government;
			$rootScope.portal = 'management';
			$rootScope.navigation = [
				{ url: '/management/'          , title: 'My Dashboard' },
				{ url: '/management/register'  , title: 'Register a new record' },
				{ url: '/management/my-records', title: 'Edit a published record' },
				{ url: '/management/my-drafts' , title: 'Edit a draft record' },
			];
		}
}]);

app.value("realm", "CHM");
app.value("schemaTypes", [ "aichiTarget", "contact", "caseStudy", "database", "implementationActivity", "marineEbsa", "nationalIndicator", "nationalReport", "nationalSupportTool", "nationalTarget", "organization", "progressAssessment", "resource", "resourceMobilisation", "strategicPlanIndicator"])
app.value("siteMapUrls", {

	management : {
		home      : "/management",
		drafts    : "/management/my-drafts",
		records   : "/management/my-records",
		workflows : "/management"
	},

	errors: {
		notFound      : "/help/404",
		notAuthorized : "/help/403"
	},

	user : {
		signIn  : "/management/signin",
		signUp  : "/user/sign-up",
		account : "/user/my-account"
	}
});

app.service("navigation", ["$q", "$location", "$timeout", "underscore", "authentication", "siteMapUrls", function($q, $location, $timeout, _, authentication, siteMapUrls){

	return {
		securize : function(roles)
		{
			return authentication.loadCurrentUser(true).then(function(user) {
	
				if(!user.isAuthenticated) {
					
					console.log("securize: force sign in");
					
					if(!$location.search().returnUrl)
						$location.search({returnUrl : $location.url() });
	
					$location.path(siteMapUrls.user.signIn);

				}
				else if(roles && !_.isEmpty(roles) && _.isEmpty(_.intersection(roles, user.roles))) {

					console.log("securize: not authorized");

					$location.search({path : $location.url() });
					$location.path(siteMapUrls.errors.notAuthorized);
				}

				return user;
			});
		}
	};

}])

function PageController($scope, $window, $location, authentication) {

	$(function () {
		$.scrollUp({ scrollText: 'scroll to top' });
	});

	//if($location.protocol()=="http" && !$location.host().match(/(.*\.local)|(^localhost)$/)
	if($location.protocol()=="http" && $location.host()=="chm.cbd.int")
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

	$scope.goHome = function() { $location.path('/'); };
	
	$scope.currentPath = function () { return $location.path(); };
}

//============================================================
//
//============================================================
app.filter('integer', function() {
	return function(number, base, length) {

		var text = Number(number).toString(base||10);

		if (text.length < (length||0))
			text = '00000000000000000000000000000000'.substr(0, length - text.length) + text;

		return text;
	};
});

//jQuery(window).on('mercury:ready', function() {
//jQuery(document).ready(function() {
//	angular.bootstrap(window.document.body, ['kmApp']); 
//});
