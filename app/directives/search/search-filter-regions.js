define(['text!./search-filter-regions.html', 'app', 'lodash','angular'], function(template, app, _,angular) { 'use strict';
    app.directive('searchFilterRegions', ['$http','Thesaurus','$timeout', function ($http,thesaurus,$timeout) {
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
            var termsMap = [];
            var classes= [];
            $scope.expanded = false;
            $scope.terms = [];
            $scope.termsModal = {};

            buildTermsAndQuery();
            $scope.$watch('items',function(){searchCtrl.updateTerms(termsMap,$scope.items,$scope.facet);}); // ensure binding gets done at end in order to display facits

            //=======================================================================
      			//
      			//=======================================================================
            $scope.refresh = function (item, forceDelete){

                  searchCtrl.refresh(item,forceDelete,termsMap,$scope.items,$scope.facet);
            };//$scope.refresh

            //=======================================================================
      			//
      			//=======================================================================
            function buildTermsAndQuery() {

                  if(_.isEmpty(termsMap))  // reduce server calls and computation by saving
                  {
                      $http.get('/api/v2013/thesaurus/domains/regions/terms', { cache:true }).then(function (response) {

                          var termsTree = thesaurus.buildTree(response.data);

                          termsMap = flatten(termsTree, {});

                          classes   = _.filter(termsTree, function where (o) { return !!o.narrowerTerms && o.identifier!='1796f3f3-13ae-4c71-a5d2-0df261e4f218'; });

                          _.values(termsMap).forEach(function (term) {
                              term.name = term.name.replace('CBD Regional Groups - ', '');
                              term.name = term.name.replace('Inland water ecosystems - ', '');
                              term.name = term.name.replace('Large marine ecosystems - ', '');

                              term.name = term.name.replace('Mountains - All countries', 'Mountains');
                              term.name = term.name.replace('Global - All countries', 'Global');
                              term.name = term.name.replace('Americas - All countries', 'Americas');
                              term.name = term.name.replace('Africa - All countries', 'Africa');
                              term.name = term.name.replace('Asia - All countries', 'Asia');
                              term.name = term.name.replace('Europe - All countries', 'Europe');
                              term.name = term.name.replace('Oceania - All countries', 'Oceania');

                              term.name = term.name.replace('Mountains - ', '');
                              term.name = term.name.replace('Global - ', '');
                              term.name = term.name.replace('Americas - ', '');
                              term.name = term.name.replace('Africa - ', '');
                              term.name = term.name.replace('Asia - ', '');
                              term.name = term.name.replace('Europe - ', '');
                              term.name = term.name.replace('Oceania - ', '');

                              term.name = term.name.replace('regions', '<All Regions>');
                              term.name = term.name.replace('groups', '<All Groups>');

                              term.selected = false;
                              term.count = 0;
                          });

                          $scope.allTerms = _.values(termsMap);
                          $scope.terms = classes;
                          termsMap = searchCtrl.updateTerms(termsMap,$scope.items,$scope.facet);
                          searchCtrl.buildChildQuery(termsMap,$scope.items,$scope.facet);                      

                      });//http
                } else{
                          $scope.allTerms = _.values(termsMap);
                          $scope.terms = classes;
                          termsMap = searchCtrl.updateTerms(termsMap,$scope.items,$scope.facet);
                          searchCtrl.buildChildQuery(termsMap,$scope.items,$scope.facet);
                }
            }//buildTermsAndQuery()

            // =======================================================================
            // Jquery to find modal and executes the event on when opened calling our callback
            // which our call back then calls $timeout whcih will ensure an angular context.
            // Better then apply call as onlly exectues when the digest is done.
            //
      			// =======================================================================
            $element.find("#dialogSelectRegions").on('show.bs.modal', function(){

                $timeout(function(){ //Ensure angular context
                        buildTermsAndQuery();
                        $scope.termsModal=angular.copy($scope.terms);// unbinded display for modal for first view
                });
            });//$element.find("#dialogSelect").on('show.bs.modal', function(){

            // =======================================================================
            //
        		// =======================================================================
            function flatten(items, collection) {

                items.forEach(function (item) {
                    item.selected = false;
                    collection[item.identifier] = item;
                    if(item.narrowerTerms)
                        flatten(item.narrowerTerms, collection);
                });
                return collection;
            } // flatten

        }//link
    }; // return
  }]);  //app.directive('searchFilterRegions
});// define
