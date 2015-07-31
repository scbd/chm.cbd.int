define(['app','jquery'], function(app) { 'use strict';

	app.directive('kmTab', ["$timeout", function ($timeout)
	{
		return {
			restrict: 'A',
			link: function ($scope, $element, $attr)
			{
				//==============================
				//
				//==============================
				$scope.$watch("tab", function (tab){

					var isCurrentTab = $attr.kmTab==tab;

					if(isCurrentTab) $element.show();
					else             $element.hide();

					if(isCurrentTab) {

						var qBody   = $element.parents("body:last");
						var qTarget = $element.parents("div:first").find("form[name='editForm']:first");

						if(qBody.scrollTop() > qTarget.offset().top) {
							$timeout(function()	{
								if (!qBody.is(":animated"))
									qBody.stop().animate({ scrollTop:  qTarget.offset().top-100 }, 300);
							});
						}
					}
				});
			}
		};
	}]);
});
