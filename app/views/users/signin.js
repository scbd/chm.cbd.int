define(['app', 'angular', 'directives/users/signin'], function() { 'use strict';
	return ['$scope', 'user', function ($scope, user) {
		$scope.user = user;
    }];
});
