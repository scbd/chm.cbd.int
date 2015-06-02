window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
    waitSeconds: 120,
    baseUrl : '/app',
    paths: {
      'authentication'   : 'services/authentication',
      'angular'          : 'libs/angular-flex/angular-flex',
      'ngRoute'          : 'libs/angular-route/angular-route',
      'ngSanitize'       : 'libs/angular-sanitize/angular-sanitize',
      'domReady'         : 'libs/requirejs-domready/domReady',
      'text'             : 'libs/requirejs-text/text',
      'bootstrap'        : 'libs/bootstrap/bootstrap',
      'lodash'           : 'libs/lodash/lodash',
      'URIjs'            : 'libs/uri.js',
      'linqjs'           : 'libs/linqjs/linq',
      'leaflet'          : 'libs/leaflet/leaflet',
      'jquery'           : 'libs/jquery/jquery',
      'moment'           : 'libs/moment/moment',
      'leaflet-directive': 'js/libs/leaflet/angular-leaflet-directive',
      'ng-breadcrumbs'   : 'libs/ng-breadcrumbs/ng-breadcrumbs.min',
      'bootstrap-datepicker': 'libs/bootstrap-datepicker/bootstrap-datepicker',
      'ionsound'            : 'libs/ionsound/ion.sound',
      'jqvmap'                : 'js/libs/jqvmap/jqvmap/jquery.vmap',
      'jqvmapworld'           : 'js/libs/jqvmap/jqvmap/maps/jquery.vmap.world',
      'ngAnimate'             : 'libs/angular-animate/angular-animate',
      'ngAria'                : 'libs/angular-aria/angular-aria',
      'ngMaterial'            : 'libs/angular-material/angular-material',


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

    },
});

// BOOT

require(['angular', 'domReady!', 'bootstrap', 'app', 'routes', 'index'], function(ng, doc){

    ng.bootstrap(doc, ['kmApp']);
    ng.resumeBootstrap();

});
