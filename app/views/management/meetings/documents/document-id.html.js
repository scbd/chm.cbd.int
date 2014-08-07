define(['app', 'authentication'], function() { 'use strict';

    return ['$scope', '$route', 'authHttp', function($scope, $route, $http) {

        console.log('meetings/document-id', $scope, $route);
    }];
});
