angular.module('kmCBD')
//============================================================
//
// View Contact
//
//============================================================
.directive('chmViewResourceMobilisation', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/forms/form-resource-mobilisation.partial.html',
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
		}]
	}
}]);
