/* globals escape */
/* jshint sub:true */

define(['app'], function (app) { 'use strict';

	app.factory('authentication', ["$http", "$browser", "$rootScope", "$q", function($http, $browser, $rootScope, $q) {

		var currentUser = null;
		var LEGACY_currentUser = anonymous();

		//============================================================
	    //
	    //
	    //============================================================
		function anonymous() {
			return { userID: 1, name: 'anonymous', email: 'anonymous@domain', government: null, userGroups: null, isAuthenticated: false, isOffline: true, roles: [] };
		}

		//============================================================
	    //
	    //
	    //============================================================
		function getUser() {

			if(currentUser)
				return $q.when(currentUser);

			var promise = $http.get('/api/v2013/authentication/user', { headers: { Authorization: "Ticket " + $browser.cookies().authenticationToken } });

			return promise.then(function(response) {

				return setUser(response.data);

			}).catch(function onerror () {

				return setUser(anonymous());

			});
		}

		//==============================
		//
		//==============================
		function LEGACY_user() {

		    console.warn("authentication.user() is DEPRECATED. Use: getUser()");

			return $rootScope.user;
		}

		//============================================================
	    //
	    //
	    //============================================================
		function signIn(email, password) {

			return $q.when(signOut()).then(function() {

				return $http.post("/api/v2013/authentication/token", { "email": email, "password": password });

			}).then(function(success) {

				var token  = success.data;

				return $q.all([token, $http.get('/api/v2013/authentication/user', { headers: { Authorization: "Ticket " + token.authenticationToken } })]);

			}).then(function(success) {

				var token = success[0];
				var user  = success[1].data;

				setToken(token.authenticationToken);
				setUser (user);

				$rootScope.$broadcast('signIn', user);

				return user;

			}).catch(function(error) {

				throw { error:error.data, errorCode : error.status };

			});
		}

		//============================================================
	    //
	    //
	    //============================================================
		function signOut () {

			setToken(null);

			var oldUser = currentUser;
			var newUser = setUser(null);

			if(oldUser && oldUser.isAuthenticated)
				$rootScope.$broadcast('signOut', newUser);

			return newUser;
		}

		//============================================================
	    //
	    //
	    //============================================================
		function setToken(token) {

			if (token) document.cookie = "authenticationToken=" + escape(token) + "; path=/";
			else       document.cookie = "authenticationToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

			return $browser.cookies().authenticationToken;
		}

		//============================================================
	    //
	    //
	    //============================================================
		function setUser(user) {

			currentUser        = user || undefined;
			LEGACY_currentUser = user || anonymous();

			if(!user)
				$rootScope.user = user || anonymous();

			return LEGACY_currentUser;
		}

		return {
			getUser: getUser,
			user:    LEGACY_user,
			signIn:  signIn,
			signOut: signOut,
			reset:   function() { setUser(null); }
		};

	}]);

	app.factory('authHttp', ["$http", "$browser", "realm", function($http, $browser, realm) {

		function addAuthentication(config) {

			if(!config)         config         = {};
			if(!config.headers) config.headers = {};
			if(!config.headers.realm) config.headers.realm = realm;


			if($browser.cookies().authenticationToken) config.headers.Authorization = "Ticket "+$browser.cookies().authenticationToken;
			else                                       config.headers.Authorization = undefined;

			return config;
		}

		function authHttp(config) {
			return $http(addAuthentication(config));
		}

		authHttp["get"   ] = function(url,       config) { return authHttp(angular.extend(config||{}, { 'method' : "GET"   , 'url' : url })); };
		authHttp["head"  ] = function(url,       config) { return authHttp(angular.extend(config||{}, { 'method' : "HEAD"  , 'url' : url })); };
		authHttp["delete"] = function(url,       config) { return authHttp(angular.extend(config||{}, { 'method' : "DELETE", 'url' : url })); };
		authHttp["jsonp" ] = function(url,       config) { return authHttp(angular.extend(config||{}, { 'method' : "JSONP" , 'url' : url })); };
		authHttp["patch" ] = function(url, data, config) { return authHttp(angular.extend(config||{}, { 'method' : "PATCH" , 'url' : url, 'data' : data })); };
		authHttp["post"  ] = function(url, data, config) { return authHttp(angular.extend(config||{}, { 'method' : "POST"  , 'url' : url, 'data' : data })); };
		authHttp["put"   ] = function(url, data, config) { return authHttp(angular.extend(config||{}, { 'method' : "PUT"   , 'url' : url, 'data' : data })); };

		return authHttp;
	}]);
});
