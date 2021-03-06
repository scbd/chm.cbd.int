define(['text!./search-filter-themes.html', 'app', 'lodash','angular'], function(template, app, _,angular) { 'use strict';

	//==============================================
	//
	//
	//==============================================
	app.directive('searchFilterThemes',['$http','Thesaurus','$timeout', function ($http,thesaurus,$timeout) {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
				require : '^search',
        scope: {
              title: '@title',
              items: '=ngModel',
              facet: '@facet',
							count: '=count' // total count of all children subquires needed for 0 result combinations
        },
          link : function ($scope, $element, $attr, searchCtrl)
        {
            $scope.expanded = false;
            var termsMap =[];
						$scope.termsArray=[];
						$scope.terms = [];
            $scope.termsModal = {};

						buildTermsAndQuery();
            $scope.$watch('items',function(){searchCtrl.updateTerms(termsMap,$scope.items,$scope.facet);});

						//=======================================================================
      			//
      			//=======================================================================
            function buildTermsAndQuery() {
                    if(_.isEmpty(termsMap)){ // get terms once and save

												$http.get('/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms').success(function (data) {

														$scope.terms = thesaurus.buildTree(data);
														termsMap   = flatten($scope.terms, {});
														$scope.termsArray = _.values(termsMap);

														termsMap=searchCtrl.updateTerms(termsMap,$scope.items,$scope.facet);
                            searchCtrl.buildChildQuery(termsMap,$scope.items,$scope.facet);
												});

                    }else{
														termsMap = searchCtrl.updateTerms(termsMap,$scope.items,$scope.facet);
														searchCtrl.buildChildQuery(termsMap,$scope.items,$scope.facet);
                    }

            }//buildTermsAndQuery()

            //=======================================================================
      			//
      			//=======================================================================
            $scope.refresh = function (item,forceDelete){
							var term = item;

										term.indeterminate = !term.selected && (term.indeterminateCounterA + term.indeterminateCounterB) > 0;
										setBroaders(term.broaderTerms, term.selected);
										setNarrowers(term.narrowerTerms, term.selected);
			              searchCtrl.refresh(item,forceDelete,termsMap,$scope.items,$scope.facet);
            };//$scope.refresh

						// =======================================================================
						// Jquery to find modal and executes the event on when opened calling our callback
						// which our call back then calls $timeout whcih will ensure an angular context.
						// Better then apply call as onlly exectues when the digest is done.
						//
						// =======================================================================
						$element.find("#dialogSelectThemes").on('show.bs.modal', function(){

										$timeout(function(){ //Ensure angular context
														buildTermsAndQuery();

														$scope.termsModal=angular.copy($scope.terms);// unbinded display for modal for first view
for(var i =0; i<$scope.termsModal.length;i++){
	$scope.termsModal[i].count=0;
	for(var j =0; j<$scope.termsModal[i].narrowerTerms.length;j++)
		$scope.termsModal[i].count+=$scope.termsModal[i].narrowerTerms[j].count;

}
console.log($scope.items);
										},100);

						});//$element.find("#dialogSelect").on('show.bs.modal', function(){

						//=======================================================================
      			//
      			//=======================================================================
            function setBroaders(broaderTerms, selected) {

                if(!broaderTerms) return;

                broaderTerms.forEach(function (term) {
                    term.indeterminateCounterA = term.indeterminateCounterA + (selected ? 1 : -1);
                    term.indeterminate = !term.selected && (term.indeterminateCounterA + term.indeterminateCounterB) > 0;
                    setBroaders(term.broaderTerms, selected);
                });
            }//setBroaders(broaderTerms, selected)

						//=======================================================================
						//
						//=======================================================================
            function setNarrowers(narrowerTerms, selected) {

                if(!narrowerTerms) return;

                narrowerTerms.forEach(function (term) {
                    term.indeterminateCounterB = term.indeterminateCounterB + (selected ? 1 : -1);
                    term.indeterminate = !term.selected && (term.indeterminateCounterA + term.indeterminateCounterB) > 0;
                    setNarrowers(term.narrowerTerms, selected);
                });
            }//setNarrowers(narrowerTerms, selected)


						//=======================================================================
      			//
      			//=======================================================================
            function flatten(items, collection) {
                items.forEach(function (item) {
                    item.selected = false;
                    item.indeterminateCounterA = 0;
                    item.indeterminateCounterB = 0;
                    collection[item.identifier] = item;
                    if(item.narrowerTerms)
                        flatten(item.narrowerTerms, collection);
                });
                return collection;
            }//flatten(items, collection)

				}//link
    }; // return
  }]);  //app.directive('searchFilterCountries
});// define
