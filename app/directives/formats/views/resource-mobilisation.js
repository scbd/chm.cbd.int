define(['app', 'text!./resource-mobilisation.html', "lodash"], function(app, template, _){

app.directive('viewResourceMobilisation', [function () {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			target  : "@linkTarget",
			allowDrafts : "@"
		},
		link : function ($scope)
		{
			$scope.options  = {
				multipliers : 		[{identifier:'thousands',     title: {en:'in thousands'}}, 		   {identifier:'millions', title: {en:'in millions'}}],
				methodology : 		[{identifier:'oecd_dac',      title: {en:'OECD DAC Rio markers'}}, {identifier:'other', 	 title: {en:'Other'       }}],
				measures    : 		[{identifier:'no', 	          title: {en:'No' }}, 		  	       {identifier:'some', title: {en:'Some measures taken'}}, {identifier:'comprehensive', title: {en:'Comprehensive measures taken'}}],
				inclusions  : 		[{identifier:'notyet', 	      title: {en:'Not yet stared'}},
							   		 {identifier:'some', 	      title: {en:'Some inclusion achieved'}},
							   		 {identifier:'comprehensive', title: {en:'Comprehensive inclusion'}}],
				assessments : 		[{identifier:'notnecessary',  title: {en:'No such assessment necessary'}},
							   		 {identifier:'notyet', 	      title: {en:'Not yet started'}},
							   		 {identifier:'some', 		  title: {en:'Some assessments undertaken'}},
							   		 {identifier:'comprehensive', title: {en:'Comprehensive assessments undertaken'}}],
				domesticMethodology:[{identifier:'cmfeccabc',     title: {en:'Conceptual and Methodological Framework for Evaluating the Contribution of Collective Action to Biodiversity Conservation'}},
									 {identifier:'other', 	      title: {en:'Other'}}],
				yesNo : 			[{identifier:false,  		  title: {en:'No' }    },{identifier:true, 	title: {en:'Yes'}}]
			};

			//==================================
			//
			//==================================
			$scope.totalAverageAmount = function(){
				var odaAverage   = 0;
				var oofAverage   = 0;
				var otherAverage = 0;

				if($scope.document && $scope.document.internationalResources && $scope.document.internationalResources.baselineData && $scope.document.internationalResources.baselineData.baselineFlows)
				{
					odaAverage   = $scope.typeAverageAmount($scope.document.internationalResources.baselineData.baselineFlows,'odaAmount');
					oofAverage   = $scope.typeAverageAmount($scope.document.internationalResources.baselineData.baselineFlows,'oofAmount');
					otherAverage = $scope.typeAverageAmount($scope.document.internationalResources.baselineData.baselineFlows,'otherAmount');
				}

				return parseInt(odaAverage)+parseInt(oofAverage)+parseInt(otherAverage);
			};

			//==================================
			//
			//==================================
			$scope.typeAverageAmount = function(flows, type){
				if(!flows) return 0;

				var items;

				if(_.isEmpty(_.last(flows)) || !_.last(flows))
					items = _.initial(_.pluck(flows, type));
				else
					items = _.pluck(flows, type);

				if(items.length===0)
					return 0;

				var sum   = _.reduce(_.compact(items), function(memo, num){ return memo + parseInt(num || 0); }, 0);

				return Math.round(sum/items.length);
			};
			//==================================
			//
			//==================================
			$scope.confidenceAverage = function (resources) {

				var values = _.compact(_.map(resources, function (resource) {

					if (resource && resource.confidenceLevel && resource.confidenceLevel.identifier == "D8BC6348-D1F9-4DA4-A8C0-7AE149939ABE") return 3; //high
					if (resource && resource.confidenceLevel && resource.confidenceLevel.identifier == "42526EE6-68F3-4E8A-BC2B-3BE60DA2EB32") return 2; //medium
					if (resource && resource.confidenceLevel && resource.confidenceLevel.identifier == "6FBEDE59-88DB-45FB-AACB-13C68406BD67") return 1; //low

					return 0;
				}));

				var value = 0;

				if(values.length) {
					value = Math.round(_.reduce(values, function(memo, value) { return memo + value; }) / values.length);
				}

				if ( value == 3) return "High";
				if ( value == 2) return "Medium";
				if ( value == 1) return "Low";

				return "No value selected";
			};

			//==================================
			//
			//==================================
			$scope.getFundingGapYear = function(year){
				if(!year) return 0;

				if($scope.document && $scope.document.fundingNeedsData && $scope.document.fundingNeedsData.annualEstimates){

					var estimates = $scope.document.fundingNeedsData.annualEstimates;
					var estimate = _.findWhere(estimates, {year:year});

					if(estimate && estimate.fundingGapAmount)
						return estimate.fundingGapAmount;
				}
				return 0;
			};

			//==================================
			//
			//==================================
            $scope.isEmpty = function (item) {
                return _.isEmpty(item);
            };

			//==================================
			//
			//==================================
			$scope.getNationalPlansSourcesTotal = function(member, year){
				if(!year || !member) return 0;

				if($scope.document && $scope.document.nationalPlansData && $scope.document.nationalPlansData[member]){ // member = domesticSources or internationalSources

					var prop = "amount"+year;
					var sources = angular.fromJson($scope.document.nationalPlansData[member]); //jshint ignore:line

					if(_.initial(sources).length === 0)
						return 0;

					var amounts = _.pluck(sources, prop);

					var sum = 0;
					_.map(_.compact(amounts), function(num){
						sum = sum + parseInt(num);
					});

					return sum;
				}
				return 0;
			};

			//==================================
			//
			//==================================
			$scope.getNationalPlansRemainingGapByYear = function(year){
				if(!year) return 0;

				return $scope.getFundingGapYear(year) - ($scope.getNationalPlansSourcesTotal('domesticSources', year)  + $scope.getNationalPlansSourcesTotal('internationalSources', year)) ;
			};

			//==================================
			//
			//==================================
			$scope.hasValue = function(val){
				if(val === false || val === true)
					return true;

				return false;
			};
		}
	};
}]);
});
