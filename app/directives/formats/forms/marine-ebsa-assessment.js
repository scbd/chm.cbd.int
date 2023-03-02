define(['text!./marine-ebsa-assessment.html', 'app', 'angular', 'lodash', 'leaflet-directive', 'linqjs', 'jquery', 'authentication', 'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation'], function(template, app, angular, _, L, Enumerable, $) { 'use strict';

app.directive('marineEbsaAssessment', [ function () {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		require : "?ngModel",
		scope: {
			binding : "=ngModel",
			locales : "="
		},
		link : function($scope, e, a, ngModelCtrl)
		{
			$scope.assessments = [
				{ selected: false, code: "criteria1", title: "C1: Uniqueness or rarity" },
				{ selected: false, code: "criteria2", title: "C2: Special importance for life-history stages of species" },
				{ selected: false, code: "criteria3", title: "C3: Importance for threatened, endangered or declining species and/or habitats" },
				{ selected: false, code: "criteria4", title: "C4: Vulnerability, fragility, sensitivity, or slow recovery" },
				{ selected: false, code: "criteria5", title: "C5: Biological productivity" },
				{ selected: false, code: "criteria6", title: "C6: Biological diversity" },
				{ selected: false, code: "criteria7", title: "C7: Naturalness" }
			];

			$scope.$watch("binding",     load, true);
			$scope.$watch("assessments", save, true);

			//==================================
			//
			//==================================
			function load(binding) {

				binding = binding || [];

				_.each($scope.assessments, function(assessment){

					var criteria = _.findWhere(binding, { identifier : assessment.code });

					assessment.selected = !!criteria;

					if(criteria) {
						assessment.level         = criteria.level;
						assessment.justification = criteria.justification;
					}
				});
			}

			//==================================
			//
			//==================================
			function save() {

				var binding = $scope.binding || [];


				_.each($scope.assessments, function(assessment){

					var criteria = _.findWhere(binding, { identifier : assessment.code });

					if(assessment.selected) {

						if(!criteria) { // Add missing
							criteria = { identifier : assessment.code };
							binding.push(criteria);

							binding.sort(function(a,b){

								if(a.identifier == b.identifier) return  0;
								if(a.identifier  < b.identifier) return -1;
								return  1;
							});
						}

						criteria.level         = assessment.level;
						criteria.justification = assessment.justification;
					}
					else if(criteria) {

						var index = binding.indexOf(criteria);

						binding.splice(index, 1);
					}

					if(_.isEmpty(binding))
						binding = undefined;

					try { ngModelCtrl.$setViewValue(binding); } catch(e) {}
				});
			}
		}
	};
}]);
});
