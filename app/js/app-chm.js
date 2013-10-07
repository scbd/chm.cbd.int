var app = angular.module("kmApp",           [ "kmAuthentication", "kmUtilities", "centralPortal", 'kmCBD', 'kmInputs', "$strap.directives" ]);
// angular.module("kmCms",           [ "kmAuthentication"]);
// angular.module("kmCBD",           [ "kmUtilities", "kmStorage", "kmInputs" ]);
// angular.module("kmAuthentication",[]);
// angular.module("kmUtilities",     []);
// angular.module("kmStorage",       []);
// angular.module("kmInputs",        []);

//(function() {

app.config(['$routeProvider', '$locationProvider', '$compileProvider', function($routeProvider, $locationProvider, $compileProvider, $q) {

//	app.controllerProvider = $controllerProvider;
    app.routeProvider      = $routeProvider;
    app.compileProvider    = $compileProvider;
//  app.filterProvider     = $filterProvider;
//  app.provide            = $provide;
	
	var init = function($q, $http, authentication) {
		
		if(authentication.user())
			return authentication.user();

    	return authentication.loadCurrentUser();
    };

	$routeProvider.
 		when('/', { controller:HomePageController, templateUrl:'/app/views/index.html', resolve: { initialized : init } }).
 		when('/database/', { controller:InnerPageController, templateUrl:'/app/views/database.html', resolve: { initialized : init } }).
 		when('/management/', { controller:InnerPageController, templateUrl:'/app/views/empty.html', resolve: { initialized : init } }).
 		when('/network/', { controller:InnerPageController, templateUrl:'/app/views/network.html', resolve: { initialized : init } }).
 		when('/resources/', { controller:InnerPageController, templateUrl:'/app/views/resources.html', resolve: { initialized : init } }).
 		when('/about/', { controller:InnerPageController, templateUrl:'/app/views/about.html', resolve: { initialized : init } }).
 		when('/help/404', { controller:InnerPageController, templateUrl:'/app/views/404.html', resolve: { initialized : init } }).
 		//when('/edit/:projectId', { controller:InnerPageController, templateUrl:'detail.html', resolve: { initialized : init } }).
 		//when('/new', { controller:InnerPageController, templateUrl:'detail.html', resolve: { initialized : init } }).

 		when('/database/record'             , { controller:ManagementPageController, templateUrl:'/app/views/database/record.html'             , resolve: { initialized : init } }).

 		when('/management/signin', { controller:ManagementPageController, templateUrl:'/app/views/management/signin.html'             , resolve: { initialized : init } }).
 		
 		when('/management'                   , { controller:ManagementPageController, templateUrl:'/app/views/management/index.html'             , resolve: { initialized : init } }).
 		when('/management/register'          , { controller:ManagementPageController, templateUrl:'/app/views/management/register.html'          , resolve: { initialized : init } }).
 		when('/management/national-reporting', { controller:ManagementPageController, templateUrl:'/app/views/management/national-reporting.html', resolve: { initialized : init }, reloadOnSearch: false }).
 		when('/management/my-records'        , { controller:ManagementPageController, templateUrl:'/app/views/management/my-records.html'        , resolve: { initialized : init } }).
 		when('/management/my-drafts'         , { controller:ManagementPageController, templateUrl:'/app/views/management/my-drafts.html'         , resolve: { initialized : init } }).
 		
 		when('/management/edit/resource', { controller:ManagementPageController, templateUrl:'/app/views/cbdEditResource.html', resolve: { initialized : init } }).
 		when('/management/edit/nationalReport', { controller:ManagementPageController, templateUrl:'/app/views/management/edit/nationalReport.html', resolve: { initialized : init }, reloadOnSearch: false }).
 		when('/management/edit/nationalTarget', { controller:ManagementPageController, templateUrl:'/app/views/management/edit/nationalTarget.html', resolve: { initialized : init }, reloadOnSearch: false }).
 		when('/management/edit/nationalIndicator', { controller:ManagementPageController, templateUrl:'/app/views/management/edit/nationalIndicator.html', resolve: { initialized : init }, reloadOnSearch: false }).
 		when('/management/edit/progressAssessment', { controller:ManagementPageController, templateUrl:'/app/views/management/edit/progressAssessment.html', resolve: { initialized : init }, reloadOnSearch: false }).
 		when('/management/edit/implementationActivity', { controller:ManagementPageController, templateUrl:'/app/views/management/edit/implementationActivity.html', resolve: { initialized : init }, reloadOnSearch: false }).
 		otherwise({redirectTo:'/help/404'});

 		function HomePageController($scope, $rootScope, $route, $browser, $location, $window, authentication) {

 			$rootScope.homePage = true;
 			$rootScope.userGovernment = 'ca';
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

		function InnerPageController($rootScope, $scope, $route, authentication) {

			$rootScope.homePage = false;
			$rootScope.userGovernment = 'ca';
			$rootScope.portal = 'database';
			$rootScope.navigation = [
				{ url: '/database', title: 'Search', active: true },
				{ url: '/database/parties', title: 'List of Parties' },
				{ url: '/database/countries', title: 'Country Profiles' }
			];
		}

		function ManagementPageController($rootScope, $scope, $route, authentication) {

			$rootScope.homePage = false;
			$rootScope.userGovernment = 'ca';
			$rootScope.portal = 'management';
			$rootScope.navigation = [
				{ url: '/management'           , title: 'My Dashboard'           , active: $route.current.loadedTemplateUrl=='/app/views/management/index.html' },
				{ url: '/management/register'  , title: 'Register a new record'  , active: $route.current.loadedTemplateUrl=='/app/views/management/register.html' },
				{ url: '/management/my-records', title: 'Edit a published record', active: $route.current.loadedTemplateUrl=='/app/views/management/my-records.html' },
				{ url: '/management/my-drafts' , title: 'Edit a draft record'    , active: $route.current.loadedTemplateUrl=='/app/views/management/my-drafts.html' },
			];
		}

		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');
}]);

function PageController($scope, $window, $location, authentication) {

	//if($location.protocol()=="http" && !$location.host().match(/(.*\.local)|(^localhost)$/)
	if($location.protocol()=="http" && $location.host()=="chm.cbd.int")
		$window.location = "https://chm.cbd.int/";

    //========================================
	//
	//========================================
    $scope.doSearch = function (searchQuery) {
    	console.log('aaa');
    	$location.url('/database/?q='+searchQuery);
    }

    //========================================
	//
	//========================================
	$scope.signOut = function () {
		authentication.signOut();
		$location.path('/');
	};

	$scope.goHome = function() { $location.path('/'); };
}