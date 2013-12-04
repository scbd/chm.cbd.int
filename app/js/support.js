// FROM https://github.com/angular/angular.js/blob/v1.1.4/src/ng/directive/ngView.js

angular.module('kmApp').directive('ngxView', ['$http', '$templateCache', '$route', '$anchorScroll', '$compile', '$controller',
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

angular.module('kmApp').directive("ngxDragstart", ["$parse", function ($parse) {
    return function (scope, element, attr) {
        var fn = $parse(attr["ngxDragstart"]);
        element.bind("dragstart", function (event) {
            return scope.$apply(function(event) {
                return fn(scope, { $event: event });
            });
        });
    };
}]);

angular.module('kmApp').directive("ngxDragend", ["$parse", function ($parse) {
    return function (scope, element, attr) {
        var fn = $parse(attr["ngxDragend"]);
        element.bind("dragend", function (event) {
            return scope.$apply(function (event) {
                return fn(scope, { $event: event });
            });
        });
    };
}]);

angular.module('kmApp').directive("ngxDrop", ["$parse", function ($parse) {
    return function (scope, element, attr) {
        var fn = $parse(attr["ngxDrop"]);
        element.bind("drop", function (event) {
            return scope.$apply(function (event) {
                return fn(scope, { $event: event });
            });
        });
    };
}]);

angular.module('kmApp').directive("ngxDragover", ["$parse", function ($parse) {
    return function (scope, element, attr) {
        var fn = $parse(attr["ngxDragover"]);
        element.bind("dragover", function (event) {
            return scope.$apply(function (event) {
                return fn(scope, { $event: event });
            });
        });
    };
}]);

angular.module('kmApp').directive("ngxDragleave", ["$parse", function ($parse) {
    return function (scope, element, attr) {
        var fn = $parse(attr["ngxDragleave"]);
        element.bind("dragleave", function (event) {
            return scope.$apply(function (event) {
                return fn(scope, { $event: event });
            });
        });
    };
}]);