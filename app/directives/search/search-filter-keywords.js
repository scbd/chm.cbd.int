define(['text!./search-filter-keywords.html', 'app'], function(template, app) { 'use strict';

    app.directive('searchFilterKeywords', ['$location', function ($location) {

    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        require : '^search',
        scope: {

            title: '@title',
            value: '=ngModel',
            query: '=query',

        },
      link : function ($scope, $element, $attr, searchCtrl)//jshint ignore:line
      {
            applyKeywords($scope.value || $location.search().keywords || '');

            $scope.$watch('value', function (keywords) {

                $location.replace();
                $location.search("keywords", keywords || null);
                applyKeywords(keywords);
            });

            function applyKeywords(keywords)
            {
                $scope.value = keywords;
                if(keywords)
                    searchCtrl.addSubQuery('keywords','(title_t:"' + keywords + '*" OR description_t:"' + keywords + '*" OR text_EN_txt:"' + keywords + '*")',true);
                else
                    searchCtrl.deleteAllSubQuery('keywords');
                searchCtrl.search();
            }

      }//link
    }; // return
  }]);  //app.directive('
});// define
