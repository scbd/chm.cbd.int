(function() { 'use strict';

window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
  baseUrl : '/app',
  paths: {
    'app'              : 'js/app',
    'authentication'   : 'services/authentication',
    'angular'          : 'libs/angular/angular.min',
    'angular-route'    : 'libs/angular-route/angular-route.min',
    'angular-cookies'  : 'libs/angular-cookies/angular-cookies.min',
    'angular-animate'  : 'libs/angular-animate/angular-animate.min',
    'angular-sanitize' : 'libs/angular-sanitize/angular-sanitize.min',
    'domReady'         : 'libs/requirejs-domready/domReady',
    'bootstrap'        : 'libs/bootstrap/dist/js/bootstrap.min',
    'underscore'       : 'libs/underscore/underscore',
    'URIjs'            : 'libs/uri.js/src',
    'linqjs'           : 'libs/linqjs/linq.min',
    'leaflet'          : 'libs/leaflet/dist/leaflet',
    'angular-growl'    : 'libs/angular-growl/build/angular-growl.min',
    'ngProgress'       : 'libs/ngprogress/build/ngProgress.min',
    'jquery'           : 'libs/jquery/jquery',
    'scrollUp'         : 'libs/scrollup/dist/jquery.scrollUp.min',
    'moment'           : 'libs/moment/moment',
    'leaflet-directive': 'js/libs/leaflet/angular-leaflet-directive',
    'angular-strap'    : 'js/libs/angularStrap/0.7.4/angular-strap.min',
  },
  shim: {
    'angular'          : { 'deps': ['jquery'], 'exports': 'angular' },
    'angular-route'    : { 'deps': ['angular'] },
    'angular-cookies'  : { 'deps': ['angular'] },
    'angular-animate'  : { 'deps': ['angular'] },
    'angular-sanitize' : { 'deps': ['angular'] },
//  'angular-moment'   : { 'deps': ['moment'] },
    'ngProgress'       : { 'deps': ['angular'] },
    'bootstrap'        : { 'deps': ['jquery'] },
    'linqjs'           : { 'deps': [], 'exports' : 'Enumerable' },
    'leaflet-directive': { 'deps': ['angular', 'leaflet'] },
    'angular-strap'    : { 'deps': ['angular', 'js/libs/angularStrap/0.7.4/datepicker/bootstrap-datepicker'] },
  }
});

require(['angular' ,'bootstrap', 'domReady'], function (ng) {

  // NOTE: place operations that need to initialize prior to app start here using the `run` function on the top-level module

  require(['domReady!', 'app', 'js/routes', 'index.html'], function (document) {
    ng.bootstrap(document, ['kmApp']);
    ng.resumeBootstrap();
  });
});

})();
