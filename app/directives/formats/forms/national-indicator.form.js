define(['text!./national-indicator.form.html', 'app', 'angular', 'lodash','authentication', 'directives/forms/form-controls'], function(template, app, angular, _) { 'use strict';

app.directive("formNationalIndicator", ["$http", "authentication", "$filter", '$location', function ($http, authentication, $filter, $location) {
    return {
        restrict: 'E',
        template: template,
        replace: true,
        transclude: false,
        scope: {
            document : "=ngModel"
        },
        link: function ($scope) {

            $scope.options = {};

            $http.get("/api/v2013/thesaurus/domains/countries/terms",  { cache: true }).then(function (o) {
                $scope.options.countries = $filter('orderBy')(o.data, 'title|lstring');
            });

            $http.get("/api/v2013/index", { params: { q:"schema_s:strategicPlanIndicator", fl:"identifier_s,title_t", sort:"title_s ASC", rows : 99999 }}).then(function(o) {
                $scope.options.strategicPlanIndicators = _.map(o.data.response.docs, function(o) {
                    return { identifier:o.identifier_s, title : o.title_t };
                });
            });

			//==================================
			//
			//==================================
			$scope.defaultGovernment = function() {

				var qsGovernment = $location.search().government;

				if (qsGovernment)
					qsGovernment = qsGovernment.toLowerCase();

				return authentication.getUser().government || qsGovernment;
			};
        }
    };
}]);
});
