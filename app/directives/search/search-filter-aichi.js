define(['text!./search-filter-aichi.html', 'app', 'lodash','angular'], function(template, app, _,angular) { 'use strict';

app.directive('searchFilterAichi',['$http','Thesaurus','$timeout', function ($http,thesaurus,$timeout) {
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
                        $http.get('/api/v2013/thesaurus/domains/0BB90152-BE5D-4A51-B090-D29906F65247/terms').success(function (data) {

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

                    searchCtrl.refresh(item,forceDelete,termsMap,$scope.items,$scope.facet);
            };//$scope.refresh

            // =======================================================================
            // Jquery to find modal and executes the event on when opened calling our callback
            // which our call back then calls $timeout whcih will ensure an angular context.
            // Better then apply call as onlly exectues when the digest is done.
            //
            // =======================================================================
            $element.find("#dialogSelectFacets").on('show.bs.modal', function(){

                    $timeout(function(){ //Ensure angular context
                            buildTermsAndQuery();
                            $scope.termsModal=angular.copy($scope.terms);// unbinded display for modal for first view
                    });

            });//$element.find("#dialogSelect").on('show.bs.modal', function(){

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
            }// flatten


          }//link
      }; // return
    }]);  //app.directive('searchFilterCountries
  });// define
