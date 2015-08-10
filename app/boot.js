window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
    waitSeconds: 120,
    baseUrl : '/app',
    paths: {
      'authentication'   : 'services/authentication',
      'angular'          : 'libs/angular-flex/angular-flex',
      'ngRoute'          : 'libs/angular-route/angular-route.min',
      'ngSanitize'       : 'libs/angular-sanitize/angular-sanitize.min',
      'domReady'         : 'libs/requirejs-domready/domReady',
      'text'             : 'libs/requirejs-text/text',
      'bootstrap'        : 'libs/bootstrap/dist/js/bootstrap.min',
      'lodash'           : 'libs/lodash/lodash.min',
      'URIjs'            : 'libs/uri.js/src',
      'linqjs'           : 'libs/linqjs/linq.min',
      'leaflet'          : 'libs/leaflet/dist/leaflet',
      'jquery'           : 'libs/jquery/dist/jquery.min',
      'moment'           : 'libs/moment/moment',
      'leaflet-directive': 'js/libs/leaflet/angular-leaflet-directive',
      'ng-breadcrumbs'   : 'libs/ng-breadcrumbs/dist/ng-breadcrumbs.min',
      'bootstrap-datepicker': 'libs/bootstrap-datepicker/js/bootstrap-datepicker',
      'ionsound'         : 'libs/ionsound/js/ion.sound.min',
      'jqvmap'           : 'js/libs/jqvmap/jqvmap/jquery.vmap',
      'jqvmapworld'      : 'js/libs/jqvmap/jqvmap/maps/jquery.vmap.world',
      'ngAnimate'        : 'libs/angular-animate/angular-animate.min',
      'ngAria'           : 'libs/angular-aria/angular-aria.min',
      'ngMaterial'       : 'libs/angular-material/angular-material.min',
      'ngSmoothScroll'   : 'libs/ngSmoothScroll/angular-smooth-scroll.min',


    },
    shim: {
      'libs/angular/angular'     : { deps: ['jquery'] },
      'angular'                  : { deps: ['libs/angular/angular'] },
      'ngRoute'                  : { deps: ['angular'] },
      'ngSanitize'               : { deps: ['angular'] },
      'leaflet-directive'        : { deps: ['angular', 'leaflet'], exports : 'L' },
      'ng-breadcrumbs'           : { deps: ['angular'] },
      'bootstrap'                : { deps: ['jquery'] },
      'linqjs'                   : { deps: [], exports : 'Enumerable' },
      'leaflet'                  : { deps: [], exports : 'L' },
      'bootstrap-datepicker'     : { deps: ['bootstrap'] },
      'jqvmap'                   : { deps: ['jquery'] },
      'jqvmapworld'              : { deps: ['jqvmap'] },
      'ionsound'                 : { deps: ['jquery'] },
      'ngAnimate'                : { deps: ['angular'] },
      'ngAria'                   : { deps: ['angular'] },
      'ngMaterial'               : { deps: ['angular', 'ngAnimate', 'ngAria'] },
      'ngSmoothScroll'           : { deps: ['angular'] },

    },
});

// BOOT

require(['angular', 'domReady!', 'bootstrap', 'app', 'routes', 'index'], function(ng, doc){

    ng.bootstrap(doc, ['kmApp']);
    ng.resumeBootstrap();

});
