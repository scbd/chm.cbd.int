define(['require', 'app', 'text!./edit-form-loader.html','lodash', 'authentication', 'utilities/km-storage', 'utilities/km-utilities', 'scbd-angularjs-services/locale'], function(require, app, template,_){

app.directive('editFormLoader', ["$rootScope", 'IStorage', "authentication", "locale", "$q", "$location", "$compile", "$route", "navigation","$http", function ($rootScope,    storage,   authentication,   locale,   $q,   $location,   $compile, $route, navigation,$http) {
	return {
		restrict: 'E',
		template: template,
		replace: true,
		transclude: false,
		scope: {},
		link: function($scope, $element) {
			//

			var formHolder = $element.find("#form-placeholder:first");

			//==================================
			//
			//==================================
			$scope.init = function () {
		
				$scope.directiveName  = snake_case($route.current.params.schema);
				require(['./'+$scope.directiveName], function(d){

					var directiveHtml = '<DIRECTIVE ></DIRECTIVE>'.replace(/DIRECTIVE/g, 'edit-' + $scope.directiveName );

					$scope.$apply(function(){
						formHolder.append($compile(directiveHtml)($scope));
					});
				});
			};


			//==================================
			//
			//==================================
			function snake_case(name, separator) {
			  separator = separator || '-';
			  return name.replace(/[A-Z]|[0-9]/g, function(letter, pos) {
			    return (pos ? separator : '') + letter.toLowerCase();
			  });
			}

			$scope.init();
		}
	};
}]);
});
