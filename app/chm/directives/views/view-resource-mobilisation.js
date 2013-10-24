angular.module('kmApp').compileProvider // lazy
.directive('viewResourceMobilisation', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-resource-mobilisation.partial.html',
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "="
		},
		controller: ['$scope', 'IStorage', "underscore", function ($scope, storage, _) {

			$scope.directlyRelated             = "4BE226BA-E72F-4A8A-939E-6FCF0FA76CE4";
			$scope.indirectlyRelated           = "4B931A40-8032-41BD-BBD7-B16905E41DF2";
			$scope.direclyAndIndirectlyRelated = "2BBC9278-A50C-4B3C-AF2C-BBC103405DE4";

			//==================================
			//
			//==================================
			$scope.getSum = function (resources, target) {

				if(target) {
					resources = _.filter(resources, function(o) {
						return o && o.category && o.category.identifier==target;
					});
				}

				var values = _.map(resources, function(o) {
					return o.amount||0;
				});

				return values.length 
					 ? _.reduce(values, function(res, val) { return res+val })
					 : 0;
			}

			//==================================
			//
			//==================================
			$scope.confidenceAverage = function (resources) {

				var values = _.compact(_.map(resources, function (resource) {

					if (resource && resource.confidence && resource.confidence.identifier == "D8BC6348-D1F9-4DA4-A8C0-7AE149939ABE") return 3; //high
					if (resource && resource.confidence && resource.confidence.identifier == "42526EE6-68F3-4E8A-BC2B-3BE60DA2EB32") return 2; //medium
					if (resource && resource.confidence && resource.confidence.identifier == "6FBEDE59-88DB-45FB-AACB-13C68406BD67") return 1; //low

					return 0
				}));

				var value = 0;

				if(values.length) {
					value = Math.round(_.reduce(values, function(memo, value) { return memo + value; }) / values.length);
				}

				if ( value == 3) return "High";
				if ( value == 2) return "Medium";
				if ( value == 1) return "Low";
				
				return "No value selected";
			}
		}]
	}
}]);
