define(['text!./bbi-contact.html', 'app'
], function(template, app, angular, _) {
	'use strict';

	app.directive('viewBbiContact', [function() {
		return {
			restrict: 'E',
			template: template,
			replace: true,
			transclude: false,
			scope: {
				document: '=ngModel',
				locale	: '='
			},
			link: function($scope, $element) {

				
			}
		};
	}]);
});