define(['app', 'ng-breadcrumbs'], function (app) {
app.directive('portalNav', function () {
    return {
    restrict: 'EAC',
    replace: true,
    templateUrl: '/app/directives/nav/portal-nav.html',
    link: ['$scope', '$q', '$element', function ($scope, $q, $element) {

    }]
    , controller: ['$scope','$rootScope', '$q','$element','$http', '$filter','breadcrumbs',
            function ($scope, $rootScope, $q, $element, $http, $filter, breadcrumbs) {

      $scope.breadcrumbs     = breadcrumbs;
      $scope.$root.pageTitle = { text: "" };


      }]};//end controller
  });
});
