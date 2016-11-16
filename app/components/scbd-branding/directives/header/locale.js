define(['app',
 'text!./locale.html',
  'css!./locale',
  'scbd-angularjs-services/authentication',
],
function(app, template, $) {
     app.directive('localeHeader', function() {
         return { restrict: 'E' ,
                  priority: 0,// child of header
                  scope: {
                       ngModel: '=',
                     },
                  template: template,
                  controller: ['$scope', '$window', '$location','authentication',
                  function($scope, $window, $location,authentication) {
                  // code for seling locale

                  }],//controller
        };//return
     });//directive
});
