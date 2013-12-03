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
		
		if(authentication.user())
			return authentication.user();

    	return authentication.loadCurrentUser();
    };

	$routeProvider.
 		when('/', 				  { controller:HomePageController,        templateUrl:'/public/accounts.cbd.int/index.html', 	     resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management'       ,{ controller:InnerPageController,       templateUrl:'/public/accounts.cbd.int/signin.html', 	     resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/management/signin',{ controller:InnerPageController,       templateUrl:'/public/accounts.cbd.int/signin.html', 	     resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/signin/', 		  { controller:InnerPageController,       templateUrl:'/public/accounts.cbd.int/signin.html', 	     resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/signup/', 		  { controller:InnerPageController,       templateUrl:'/public/accounts.cbd.int/signup-step1.html', 	 resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/signup-step2/', 	  { controller:InnerPageController,       templateUrl:'/public/accounts.cbd.int/signup-step2.html', 	 resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/profile/', 		  { controller:InnerPageController,       templateUrl:'/app/views/404-temp.html'/*'/public/accounts.cbd.int/profile.html'*/, 	     resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/activate', 		  { controller:InnerPageController,       templateUrl:'/public/accounts.cbd.int/activate.html',       resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/password/', 		  { controller:InnerPageController,       templateUrl:'/app/views/404-temp.html'/*'/public/accounts.cbd.int/password.html'*/,       resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/recovery/', 		  { controller:InnerPageController,       templateUrl:'/public/accounts.cbd.int/recovery.html',       resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/twofactor/', 	  { controller:InnerPageController,       templateUrl:'/public/accounts.cbd.int/twofactor.html',      resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/activity/', 		  { controller:InnerPageController,       templateUrl:'/public/accounts.cbd.int/activity.html',       resolve: { user : getUser }, reloadOnSearch: false }).
      
 		when('/admin/users',      { controller:InnerPageController,       templateUrl:'/public/accounts.cbd.int/admin/users.html',    resolve: { user : getUser }, reloadOnSearch: false }).
 		when('/admin/users/:id',  { controller:InnerPageController,       templateUrl:'/public/accounts.cbd.int/admin/users-id.html', resolve: { user : getUser }, reloadOnSearch: false }).
 		
 		when('/help/offline',	  { controller:AboutPortalPageController, templateUrl:'/app/views/404-temp.html', 			         resolve: { user : getUser } }).
 		when('/help/404',		  { controller:AboutPortalPageController, templateUrl:'/app/views/404.html', 				         resolve: { user : getUser } }).
 		when('/help/403',		  { controller:AboutPortalPageController, templateUrl:'/app/views/403.html', 				         resolve: { user : getUser } }).


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

		function NetworkPortalPageController($rootScope, $scope, $route, user) {

			$rootScope.homePage = false;
			$rootScope.userGovernment = user.government;
			$rootScope.portal = 'network';
			$rootScope.navigation = [];
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

	if($location.protocol()=="http" && $location.host()=="accounts.cbd.int")
		$window.location = "https://accounts.cbd.int/";

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