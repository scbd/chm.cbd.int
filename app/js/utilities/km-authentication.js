angular.module('kmAuthentication', [])
	.factory('authHttp', ["$http", "$browser", function($http, $browser) {
		return {
			"get"    : function(url,       config) { return $http.get   (url,       this.addAuth(config)); },
			"head"   : function(url,       config) { return $http.head  (url,       this.addAuth(config)); },
			"delete" : function(url,       config) { return $http.delete(url,       this.addAuth(config)); },
			"jsonp"  : function(url,       config) { return $http.jsonp (url,       this.addAuth(config)); },
			"post"   : function(url, data, config) { return $http.post  (url, data, this.addAuth(config)); },
			"put"    : function(url, data, config) { return $http.put   (url, data, this.addAuth(config)); },

			addAuth : function(config) {
			
				if(!config)         config         = {};
				if(!config.headers) config.headers = {};

				if($browser.cookies().authenticationToken) config.headers.Authorization = "Ticket "+$browser.cookies().authenticationToken;
				else                                       config.headers.Authorization = undefined;

				return config;
			}
		};
	}])

	.factory('authentication', ["$browser", "$location", "$rootScope", "$http", "authHttp", function($browser, $location, $rootScope, $http, authHttp) {

		return {
			//==============================
			//
			//==============================
			serviceUrls : {
					token : function(needSecure) { return ( !$location.host().match(/(.*\.local)|(^localhost)$/) ? (needSecure ? "https://"+$location.host():"") : "") + "/api/v2013/authentication/token"},
					user  : function()           { return "/api/v2013/authentication/user"; }
			},

			//==============================
			//
			//==============================
			user : function(newUser) {
				if (newUser === null)
					newUser = { userID: 1, name: "anonymous", email: "@anonymous", government : null, isAuthenticated: false, roles: [] };

				if (newUser && !angular.equals($rootScope.user, newUser)) {
					$rootScope.user = newUser;
					$rootScope.$broadcast("user", newUser);
				}

				return $rootScope.user;
			},

			//==============================
			//
			//==============================
			token: function(token) {
				if (token)          document.cookie = "authenticationToken=" + escape(token) + "; path=/";
				if (token === null) document.cookie = "authenticationToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

				return $browser.cookies().authenticationToken;
			},

			//==============================
			//
			//==============================
			signIn: function(email, password) {
				var _self = this;

				var onErrorFn = function(error, errorCode)
				{
					//Delete token & set user as anonymous
					_self.token(null);
					_self.user (null);

					if(errorFn)
						errorFn(error, errorCode)
				}

				return $http.post(_self.serviceUrls.token(true), { "email": email, "password": password }).then(
					function(success) {
						var token = success.data;

						return $http.get(_self.serviceUrls.user(), { headers: { Authorization: "Ticket " + token.authenticationToken } }).then(
							function(success) {
								var user = success.data;

								_self.token(token.authenticationToken);

							    //_self.user(user);                                 // service should be SCOPE/UI independent
							    //$rootScope.$broadcast("signIn", _self.user());    // service should be SCOPE/UI independent

								return { token: token, user: _self.user() }
							},
							function(error) {
								throw { error:error.data, errorCode : error.status };
							});
					},
					function(error) {
						throw { error:error.data, errorCode : error.status };
					});
			},

			//==============================
			//
			//==============================
			signOut: function() {
				var _self = this;

				var onCompleteFn = function() {
					_self.token(null);
					_self.user (null);
					$rootScope.$broadcast("signOut", _self.user());
				};

				var oConfig = { timeout : 2000 };
				var oToken  = _self.token();
				
				if (oToken)
					oConfig.headers = { Authorization: "Ticket " + oToken };

				return $http.delete (_self.serviceUrls.token(false), oConfig).then(onCompleteFn, onCompleteFn);
			},

			//==============================
			//
			//==============================
			loadCurrentUser : function() {
				var _self = this;

				return authHttp.get(_self.serviceUrls.user()).then(
					function(success) {
						_self.user(success.data);
						return success.data;
					},
					function(error) {
						throw { error: error.data, errorCode: error.status };
					});
			}
		};
	}])
