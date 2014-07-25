/* globals escape */
/* jshint sub:true */

define(['app'], function (app) {
	'use strict';

	app.factory('authentication', ["$http", "$browser", "$rootScope", function($http, $browser, $rootScope) {

		var currentUser = null;
		var LEGACY_currentUser = null;

		//============================================================
	    //
	    //
	    //============================================================
		function getUser () {

			if(currentUser)
				return currentUser;

			currentUser = $http.get('/api/v2013/authentication/user', { headers: { Authorization: "Ticket " + $browser.cookies().authenticationToken } }).then(function onsuccess (response) {

				LEGACY_currentUser = response.data;

				return LEGACY_currentUser;

			}, function onerror () {

				LEGACY_currentUser = { userID: 1, name: 'anonymous', email: 'anonymous@domain', government: null, userGroups: null, isAuthenticated: false, isOffline: true, roles: [] };

				return LEGACY_currentUser;
			});

			return currentUser;
		}

		//==============================
		//
		//==============================
		function LEGACY_user() {
            console.log("authentication.user() is DEPRECATED. Use: getUser()");
			return $rootScope.user;
		}

		//============================================================
	    //
	    //
	    //============================================================
		function signIn(email, password) {

			signOut();

			return $http.post("/api/v2013/authentication/token", { "email": email, "password": password }).then(function(success) {

				var token  = success.data;

				return $http.get('/api/v2013/authentication/user', { headers: { Authorization: "Ticket " + token.authenticationToken } }).then(
					function(success) {
						var user = success.data;

						setToken(token.authenticationToken);

						return user;
					},
					function(error) {
						throw { error:error.data, errorCode : error.status };
					});
			},
			function(error) {
				throw { error:error.data, errorCode : error.status };
			});
		}

		//============================================================
	    //
	    //
	    //============================================================
		function signOut () {

			setToken(null);
			reset();
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
		function reset () {

			currentUser = undefined;
		}

		return {
			getUser: getUser,
			user: LEGACY_user,
			signIn:  signIn,
			signOut: signOut,
			reset:   reset };

	}]);

	app.factory('authHttp', ["$http", "$browser", function($http, $browser) {

		function addAuthentication(config) {

			if(!config)         config         = {};
			if(!config.headers) config.headers = {};

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
		authHttp["post"  ] = function(url, data, config) { return authHttp(angular.extend(config||{}, { 'method' : "POST"  , 'url' : url, 'data' : data })); };
		authHttp["put"   ] = function(url, data, config) { return authHttp(angular.extend(config||{}, { 'method' : "PUT"   , 'url' : url, 'data' : data })); };

		return authHttp;
	}]);
});
