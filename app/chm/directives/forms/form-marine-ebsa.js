angular.module('kmApp').compileProvider // lazy
.directive('chmViewMarineEbsa', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/forms/form-marine-ebsa.partial.html',
		//ERD : This is the only solution I've found to make sure the leaflet displays properly
		//replace    : true,
		//transclude : false,
		scope: {
			document: "=ngModel",
			locale: "=",
		},
		controller : ['$scope', 'authHttp', '$q', function ($scope, $http, $q) 
		{
			$scope.gisMapLayers  = null;
			$scope.gisMapCenter = null;

			$scope.$watch("document.gisMapCenter", function(gisMapCenter) {
				$scope.gisMapCenter = angular.fromJson(angular.toJson(gisMapCenter))
			});

			$scope.$watch("document.gisFiles", function(gisFiles) {
				var qLinks = gisFiles || [];
				var qGis = [];

				angular.forEach(qLinks, function(link) {
					qGis.push($http.get(link.url).then(function (res) { return L.geoJson(res.data) }));
				});

				$q.all(qGis).then(function (layers) {
					$scope.gisMapLayers = layers;
				})
			});


			//==================================
			//
			//==================================
			$scope.showApproved = function () {
				//return document.status == 'approved';
				return true;
			}

			//==================================
			//
			//==================================
			$scope.showRecommendedToCop = function () {
				//return document.status == 'recommendedToCop';
				return true;
			}

			//==================================
			//
			//==================================
			$scope.showRecommendedToSbstta = function () {
				//return document.status == 'recommendedToSbstta';
				return true;
			}

			//==================================
			//
			//==================================
			$scope.showRecommendedToWorkshop = function () {
				//return document.status == 'recommendedToWorkshop';
				return true;
			}

			//==================================
			//
			//==================================
			$scope.showRecommendedToAny = function () {
				//return document.status == 'recommendedToAny';
				return true;
			}
			
		}]
	}
}]);
