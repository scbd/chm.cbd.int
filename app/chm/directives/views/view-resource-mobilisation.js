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
		controller: ['$scope', 'IStorage', function ($scope, storage) {
			//==================================
			//
			//==================================
			$scope.isValueDirectlyRelated = function (resource) {

				if (!resource || !resource.category)
					return false;

				var qStatus = Enumerable.From([resource.category]);

				return qStatus.Any(function (o) { return o.identifier == "4BE226BA-E72F-4A8A-939E-6FCF0FA76CE4" });
			}

			//==================================
			//
			//==================================
			$scope.isValueIndirectlyRelated = function (resource) {
				if (!resource || !resource.category)
					return false;

				var qStatus = Enumerable.From([resource.category]);

				return qStatus.Any(function (o) { return o.identifier == "4B931A40-8032-41BD-BBD7-B16905E41DF2" });
			}

			//==================================
			//
			//==================================
			$scope.isValueDireclyAndIndirectlyRelated = function (resource) {
				if (!resource || !resource.category)
					return false;

				var qStatus = Enumerable.From([resource.category]);

				return qStatus.Any(function (o) { return o.identifier == "2BBC9278-A50C-4B3C-AF2C-BBC103405DE4" });
			}

			//==================================
			//
			//==================================
			$scope.getTotalDirected = function (financiaResources) {
				var value = 0;
				angular.forEach(financiaResources, function (resource, i) {
					if ($scope.isValueDirectlyRelated(resource) &&
						$.isNumeric(resource.amount)) {
						value += parseInt(resource.amount);
					}
				});

				return value
			}

			//==================================
			//
			//==================================
			$scope.getTotalIndirected = function (financiaResources) {
				var value = 0;
				angular.forEach(financiaResources, function (resource, i) {
					if ($scope.isValueIndirectlyRelated(resource) &&
						$.isNumeric(resource.amount)) {
						value += parseInt(resource.amount);
					}
				});

				return value
			}

			//==================================
			//
			//==================================
			$scope.getTotalDirectedAndIndirectly = function (financiaResources) {
				var value = 0;
				angular.forEach(financiaResources, function (resource, i) {
					if ($scope.isValueDireclyAndIndirectlyRelated(resource) &&
						$.isNumeric(resource.amount)) {
						value += parseInt(resource.amount);
					}
				});
				return value
			}

			//==================================
			//
			//==================================
			$scope.getOverallTotal = function (financiaResources) {
				var value = 0;
				angular.forEach(financiaResources, function (resource, i) {
					if ($.isNumeric(resource.amount)) {
						value += parseInt(resource.amount);
					}
				});
				return value
			}
			//==================================
			//
			//==================================
			$scope.getValueForConfidence = function (confidence) {
				if (confidence) {
					if (confidence.identifier == "D8BC6348-D1F9-4DA4-A8C0-7AE149939ABE") { return 3; } //high
					else if (confidence.identifier == "42526EE6-68F3-4E8A-BC2B-3BE60DA2EB32") { return 2; } //medium
					else if (confidence.identifier == "6FBEDE59-88DB-45FB-AACB-13C68406BD67") { return 1; } //low
				}
				else { return 0; }
			}

			//==================================
			//
			//==================================
			$scope.confidenceAverage = function (financialResources) {
				var value = 0;
				var nbItems = 0;
				angular.forEach(financialResources, function (resource, i) {
					if (resource.amount) {
						value += $scope.getValueForConfidence(resource.confidence)
						nbItems++;
					}
				});
				if (value == 0) { return "No value selected"; }
				value = value / nbItems;
				if (value > 2) { return "High"; }
				else if (value > 1) { return "Medium"; }
				else { return "Low"; }
			}
		}]
	}
}]);
