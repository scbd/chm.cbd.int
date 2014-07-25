// FROM https://github.com/angular/angular.js/blob/v1.1.4/src/ng/directive/ngView.js
define(['app'], function(app) { 'use strict';

    app.value("realm", "CHM");
    app.value("schemaTypes", ["aichiTarget", "contact", "caseStudy", "database", "implementationActivity", "marineEbsa", "nationalIndicator", "nationalReport", "nationalSupportTool", "nationalTarget", "organization", "progressAssessment", "resource", "resourceMobilisation", "strategicPlanIndicator"]);
    app.value("siteMapUrls", { //legacy

        management: {
            home: "/management",
            drafts: "/management/my-drafts",
            records: "/management/my-records",
            workflows: "/management"
        },

        errors: {
            notFound: "/help/404",
            notAuthorized: "/help/403"
        },

        user: {
            signIn: "/management/signin",
            signUp: "/user/sign-up",
            account: "/user/my-account"
        }
    });


    //============================================================
    //
    //============================================================
    app.filter('schemaName', function () {
        return function (schema) {

            if (schema == "focalPoint") return "National Focal Point";
            if (schema == "authority") return "Competent National Authority";
            if (schema == "caseStudy") return "Case Study";
            if (schema == "contact") return "Contact";
            if (schema == "database") return "National Database";
            if (schema == "resource") return "Virtual Library Resource";
            if (schema == "organization") return "Organization";
            if (schema == "measure") return "National Regulation";
            if (schema == "marineEbsa") return "Ecologically or Biologically Significant Areas (EBSAs)";
            if (schema == "aichiTarget") return "Aichi Target";
            if (schema == "strategicPlanIndicator") return "Strategic Plan Indicator";
            if (schema == "nationalIndicator") return "National Indicator";
            if (schema == "nationalTarget") return "National Target";
            if (schema == "progressAssessment") return "Progress Assessment";
            if (schema == "nationalReport") return "National Report";
            if (schema == "implementationActivity") return "Implementation Activity";
            if (schema == "nationalSupportTool") return "Guidance and Support Tools";
            if (schema == "resourceMobilisation") return "Resource Mobilisation";
            if (schema == "absCheckpoint") return "Checkpoint";
            if (schema == "absCheckpointCommunique") return "Checkpoint Communiqué";
            if (schema == "absPermit") return "Permit";

            return (schema || "") + "*";
        };
    });

    //============================================================
    //
    //============================================================
    app.directive('ngxView', ['$http', '$templateCache', '$route', '$anchorScroll', '$compile', '$controller',
                   function(   $http,   $templateCache,   $route,   $anchorScroll,   $compile,   $controller) {
      return {
        restrict: 'ECA',
        terminal: true,
        priority: 500, //																		<<<<==== ADDED (from 1.2.0-rc.2)
        link: function(scope, element, attr) {
          var lastScope,
              onloadExp = attr.onload || ''; //													<<<<==== UPDATED
              // animate = $animator(scope, attr); 												<<<<==== REMOVED

          scope.$on('$routeChangeSuccess', update);
          update();


          function destroyLastScope() {
            if (lastScope) {
              lastScope.$destroy();
              lastScope = null;
            }
          }

          function clearContent() {
            // animate.leave(element.contents(), element); 										<<<<==== REMOVED
            destroyLastScope();
          }

          function update() {
            var locals = $route.current && $route.current.locals,
                template = locals && locals.$template;

            if (template) {
              clearContent();
              // animate.enter(jqLite('<div></div>').html(template).contents(), element); 	    <<<<==== REMOVED
              element.html(template); // 													    <<<<==== ADDED (from 1.1.3)

              var link = $compile(element.contents()),
                  current = $route.current,
                  controller;

              lastScope = current.scope = scope.$new();
              if (current.controller) {
                locals.$scope = lastScope;
                controller = $controller(current.controller, locals);
                element.children().data('$ngControllerController', controller);
              }

              link(lastScope);
              lastScope.$emit('$viewContentLoaded');
              lastScope.$eval(onloadExp);

              // $anchorScroll might listen on event...
              $anchorScroll();
            } else {
              clearContent();
            }
          }
        }
      };
    }]);

    app.directive("ngxDragstart", ["$parse", function ($parse) {
        return function (scope, element, attr) {
            var fn = $parse(attr["ngxDragstart"]);
            element.bind("dragstart", function (event) {
                return scope.$apply(function(event) {
                    return fn(scope, { $event: event });
                });
            });
        };
    }]);

    //============================================================
    //
    //============================================================
    app.directive("ngxDragend", ["$parse", function ($parse) {
        return function (scope, element, attr) {
            var fn = $parse(attr["ngxDragend"]);
            element.bind("dragend", function (event) {
                return scope.$apply(function (event) {
                    return fn(scope, { $event: event });
                });
            });
        };
    }]);

    //============================================================
    //
    //============================================================
    app.directive("ngxDrop", ["$parse", function ($parse) {
        return function (scope, element, attr) {
            var fn = $parse(attr["ngxDrop"]);
            element.bind("drop", function (event) {
                return scope.$apply(function (event) {
                    return fn(scope, { $event: event });
                });
            });
        };
    }]);

    //============================================================
    //
    //============================================================
    app.directive("ngxDragover", ["$parse", function ($parse) {
        return function (scope, element, attr) {
            var fn = $parse(attr["ngxDragover"]);
            element.bind("dragover", function (event) {
                return scope.$apply(function (event) {
                    return fn(scope, { $event: event });
                });
            });
        };
    }]);

    //============================================================
    //
    //============================================================
    app.directive("ngxDragleave", ["$parse", function ($parse) {
        return function (scope, element, attr) {
            var fn = $parse(attr["ngxDragleave"]);
            element.bind("dragleave", function (event) {
                return scope.$apply(function (event) {
                    return fn(scope, { $event: event });
                });
            });
        };
    }]);
});
