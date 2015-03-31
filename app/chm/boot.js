window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
    waitSeconds: 120,
    baseUrl : '/app',
    paths: {
      'app'              : 'chm/app',
      'authentication'   : 'services/authentication',
      'angular'          : 'libs/angular-flex/angular-flex',
      'ngRoute'          : 'libs/angular-route/angular-route.min',
      'ngSanitize'       : 'libs/angular-sanitize/angular-sanitize.min',
      'domReady'         : 'libs/requirejs-domready/domReady',
      'text'             : 'libs/requirejs-text/text',
      'bootstrap'        : 'libs/bootstrap/dist/js/bootstrap.min',
      'underscore'       : 'libs/underscore/underscore',
      'URIjs'            : 'libs/uri.js/src',
      'linqjs'           : 'libs/linqjs/linq.min',
      'leaflet'          : 'libs/leaflet/dist/leaflet',
      'jquery'           : 'libs/jquery/dist/jquery.min',
      'scrollUp'         : 'libs/scrollup/dist/jquery.scrollUp.min',
      'moment'           : 'libs/moment/moment',
      'leaflet-directive': 'js/libs/leaflet/angular-leaflet-directive',
      'bootstrap-datepicker': 'libs/bootstrap-datepicker/js/bootstrap-datepicker',
    },
    shim: {
      'libs/angular/angular.min' : { deps: ['jquery'] },
      'angular'                  : { deps: ['libs/angular/angular.min'] },
      'ngRoute'                  : { deps: ['angular'] },
      'ngSanitize'               : { deps: ['angular'] },
      'leaflet-directive'        : { deps: ['angular', 'leaflet'] },
      'bootstrap'                : { deps: ['jquery'] },
      'scrollUp'                 : { deps: ['jquery'] },
      'linqjs'                   : { deps: [], exports : 'Enumerable' },
      'bootstrap-datepicker'     : { deps: ['bootstrap'] },
    },
});

// BOOT

require(['angular', 'domReady!', 'bootstrap', 'app', 'chm/routes', 'index'], function(ng, doc){

    ng.bootstrap(doc, ['kmApp']);
    ng.resumeBootstrap();

});
