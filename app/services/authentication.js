/* jshint sub:true */

define(['app', 'angular'], function (app, ng) { 'use strict';

	app.factory('authentication', ["$http", "$rootScope", "$q", "$window", "$document", function($http, $rootScope, $q, $window, $document) {

		var pToken;
		var currentUser = null;

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

			return $q.when(getToken()).then(function(token) {

				if(!token) {
					return anonymous();
				}

				return $http.get('/api/v2013/authentication/user', { headers: { Authorization: "Ticket " + token } }).then(function(r){
					return r.data;
				});

			}).catch(function() {

				return anonymous();

			}).then(function(user){

				setUser(user);

				return user;
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

			return $http.post("/api/v2013/authentication/token", {

				"email": email,
				"password": password

			}).then(function(res) {

				var token  = res.data;

				return $q.all([token, $http.get('/api/v2013/authentication/user', { headers: { Authorization: "Ticket " + token.authenticationToken } })]);

			}).then(function(res) {

				var token = res[0];
				var user  = res[1].data;

				setToken(token.authenticationToken, (email||"").toLowerCase());
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
			setUser (null);

			return $q.when(getUser()).then(function(user) {

				$rootScope.$broadcast('signOut', user);

				return user;
			});
		}

		//============================================================
	    //
	    //
	    //============================================================
		function setUser(user) {

			currentUser     = user || undefined;
			$rootScope.user = user || anonymous();
		}

		//============================================================
        //
        //
        //============================================================
		function getToken() {

			var authenticationFrame = $document.find('#authenticationFrame')[0];

			if(!authenticationFrame) {
				pToken = pToken || null;
			}

			if(pToken!==undefined) {
				return $q.when(pToken || null);
			}

			pToken = null;

			var defer = $q.defer();

			var receiveMessage = function(event)
	        {
	            if(event.origin!='https://accounts.cbd.int')
	                return;

	            var message = JSON.parse(event.data);

	            if(message.type=='authenticationToken') {
					defer.resolve(message.authenticationToken || null);

					if(message.authenticationEmail)
						$rootScope.lastLoginEmail = message.authenticationEmail;
	            }
				else {
					defer.reject('unsupported message type');
				}
	        };

			$window.addEventListener('message', receiveMessage);

			pToken = defer.promise.then(function(t){

				pToken = t;

				return t;

			}).catch(function(error){

				pToken = null;

				console.error(error);

				throw error;

			}).finally(function(){

				$window.removeEventListener('message', receiveMessage);

			});

			authenticationFrame.contentWindow.postMessage(JSON.stringify({ type : 'getAuthenticationToken' }), 'https://accounts.cbd.int');

			return pToken;
		}

		//============================================================
	    //
	    //
	    //============================================================
		function setToken(token, email) { // remoteUpdate:=true

			pToken = token || undefined;

			var authenticationFrame = $document.find('#authenticationFrame')[0];

			if(authenticationFrame) {

				var msg = {
					type : "setAuthenticationToken",
					authenticationToken : token,
					authenticationEmail : email
				};

				authenticationFrame.contentWindow.postMessage(JSON.stringify(msg), 'https://accounts.cbd.int');
			}

			if(email){
				$rootScope.lastLoginEmail = email;
			}
		}



		return {
			getUser  : getUser,
			getToken : getToken,
			signIn   : signIn,
			signOut  : signOut,
			user     : LEGACY_user,
		};

	}]);

	app.factory('authHttp', ["$http", "$q", "authentication", "realm", function($http, $q, authentication, realm) {

		//==================================================
		//
		// $http wrapper which add Authorization-Ticket to request headers
		//
		//==================================================
		function authHttp(config) {

			config               = config               || {};
			config.headers       = config.headers       || {};
			config.headers.realm = config.headers.realm || realm;

			return wrap$http($q.when(authentication.getToken()).then(function(token) {

				if(token) config.headers.Authorization = "Ticket " + token;
				else      config.headers.Authorization = undefined;

				return config;

			}).then(function(c){

				return $http(c);

			}));
		}

		authHttp["get"   ] = function(url,       config) { return authHttp(ng.extend(config || {}, { method : "GET"   , url : url })); };
		authHttp["head"  ] = function(url,       config) { return authHttp(ng.extend(config || {}, { method : "HEAD"  , url : url })); };
		authHttp["delete"] = function(url,       config) { return authHttp(ng.extend(config || {}, { method : "DELETE", url : url })); };
		authHttp["jsonp" ] = function(url,       config) { return authHttp(ng.extend(config || {}, { method : "JSONP" , url : url })); };
		authHttp["patch" ] = function(url, data, config) { return authHttp(ng.extend(config || {}, { method : "PATCH" , url : url, data : data })); };
		authHttp["post"  ] = function(url, data, config) { return authHttp(ng.extend(config || {}, { method : "POST"  , url : url, data : data })); };
		authHttp["put"   ] = function(url, data, config) { return authHttp(ng.extend(config || {}, { method : "PUT"   , url : url, data : data })); };

		return authHttp;

		//==================================================
		//
		// Add .success && .error to clone $http
		//
		//==================================================
		function wrap$http(p)
		{
			return ng.extend(p, {

				success : function(fn) { //fn(data, status, headers, config) { ... }
					return wrap$http(p.then(function(r) {
						fn(r.data, r.status, r.headers, r.config);
						return r;
					}));
				},
				error : function(fn) { //fn(data, status, headers, config) { ... }
					return wrap$http(p.catch(function(r) {
						fn(r.data, r.status, r.headers, r.config);
						return r;
					}));
				}
			});
		}

	}]);
});
