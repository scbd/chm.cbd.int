define(['text!./search-filter-countries.html','app', 'filters/commonFilters'], function(template, app) { 'use strict';

    app.directive('searchFilterCountries', ["$http",'$timeout', function ($http,  $timeout) {
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

            $scope.alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M',
                               'N','O','P','Q','R','S','T','U','V','W','X','Y','Z','ALL'];

            $scope.expanded = false;
            $scope.terms = [];
            $scope.termsModal = {};
            $scope.selectedIndex=$scope.alphabet.length-1;
            $scope.sLetter='';
            var rawCountries = null;

            buildTermsAndQuery();
            $scope.$watch('items',function(){searchCtrl.updateTerms($scope.terms,$scope.items,$scope.facet,rawCountries);});

            //=======================================================================
      			//
      			//=======================================================================
            function buildTermsAndQuery() {

                    if(!rawCountries){
                        $http.get('/api/v2013/thesaurus/domains/countries/terms').success(function (data) {
                            rawCountries = data;
                            $scope.terms = searchCtrl.updateTerms($scope.terms,$scope.items,$scope.facet,data);
                            searchCtrl.buildChildQuery($scope.terms,$scope.items,$scope.facet,data);
                        });
                    }else{
                        $scope.terms=searchCtrl.updateTerms($scope.terms,$scope.items,$scope.facet,rawCountries); // save terms to avoid multiple server quiries for same data
                        searchCtrl.buildChildQuery($scope.terms,$scope.items,$scope.facet,rawCountries);
                    }
            }//buildTermsAndQuery()

            //=======================================================================
      			//
      			//=======================================================================
            $scope.refresh = function (item,forceDelete){

                    searchCtrl.refresh(item,forceDelete,$scope.terms,$scope.items,$scope.facet,rawCountries);
            };//$scope.refresh

      			// =======================================================================
            // Jquery to find modal and executes the event on when opened calling our callback
            // which our call back then calls $timeout whcih will ensure an angular context.
            // Better then apply call as onlly exectues when the digest is done.
            //
      			// =======================================================================
            $element.find("#dialogSelectCountries").on('show.bs.modal', function(){

                    $timeout(function(){ //Ensure angular context
                            buildTermsAndQuery();
                            $scope.termsModal=JSON.parse(JSON.stringify($scope.terms));// unbinded display for modal
                    });
            });//$element.find("#dialogSelect").on('show.bs.modal', function(){

            // =======================================================================
            //
        		// =======================================================================
            $scope.selectedLetter= function(index) {

                   $scope.sLetter = $scope.alphabet[index];
                   $scope.selectedIndex = index;
            };//$scope.selectedLetter

            // =======================================================================
            //
        		// =======================================================================
            $scope.deleteItem = function (scope) {
                var item=null;

                if(scope.item === undefined)
                  item = scope;
                else{
                  item = scope.item;
                  item.selected = !item.selected;
                }

                searchCtrl.deleteSubQuery($scope.facet,item.identifier) ;
                searchCtrl.buildChildQuery($scope.terms,$scope.items,$scope.facet,rawCountries);
            };//$scope.deleteItem
        }//link
    }; // return
  }]);  //app.directive('searchFilterCountries
});// define
