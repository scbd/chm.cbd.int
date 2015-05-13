define(['app', 'text!./generic-record-list.html'], function(app, template) { 'use strict';

app.directive("genericRecordList", ["$location", '$route', function ($location, $route) {
	return {
		priority: 0,
		restrict: 'E',
		template: template,
		replace: true,
		transclude: false,
		scope: {
			records : "="
		},
		link: function($scope) {
			console.log("!");
			//TODO LOGIC
		}
	};
}]);
});
