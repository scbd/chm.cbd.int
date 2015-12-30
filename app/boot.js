window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
    waitSeconds: 120,
    baseUrl : '/app',
    paths: {
      'authentication'      : 'services/authentication',
      'angular'             : 'libs/angular-flex/angular-flex',
      'ngRoute'             : 'libs/angular-route/angular-route.min',
      'ngSanitize'          : 'libs/angular-sanitize/angular-sanitize.min',
      'domReady'            : 'libs/requirejs-domready/domReady',
      'text'                : 'libs/requirejs-text/text',
      'bootstrap'           : 'libs/bootstrap/dist/js/bootstrap.min',
      'lodash'              : 'libs/lodash/lodash.min',
      'URIjs'               : 'libs/uri.js/src',
      'linqjs'              : 'libs/linqjs/linq.min',
      'leaflet'             : 'libs/leaflet/dist/leaflet',
      'jquery'              : 'libs/jquery/dist/jquery.min',
      'moment'              : 'libs/moment/moment',
      'leaflet-directive'   : 'js/libs/leaflet/angular-leaflet-directive',
      'ng-breadcrumbs'      : 'js/libs/ng-breadcrumbs/dist/ng-breadcrumbs.min',
      'bootstrap-datepicker': 'libs/bootstrap-datepicker/js/bootstrap-datepicker',
      'ionsound'            : 'libs/ionsound/js/ion.sound.min',
      'jqvmap'              : 'js/libs/jqvmap/jqvmap/jquery.vmap',
      'jqvmapworld'         : 'js/libs/jqvmap/jqvmap/maps/jquery.vmap.world',
      'ngAnimate'           : 'libs/angular-animate/angular-animate.min',
      'ngAria'              : 'libs/angular-aria/angular-aria.min',
      'ngMaterial'          : 'libs/angular-material/angular-material.min',
      'ngSmoothScroll'      : 'libs/ngSmoothScroll/angular-smooth-scroll.min',
      'ammap3WorldHigh'     : 'directives/reporting-display/worldEUHigh',
      'ammap3'              : 'libs/ammap3/ammap/ammap',
      'ammap-theme'         : 'libs/ammap3/ammap/themes/light',
      'ammap-resp'          : 'libs/ammap3/ammap/plugins/responsive/responsive',
      'ammap-export'        : 'libs/ammap3/ammap/plugins/export/export.min',
      'ammap-ex-fabric'     : 'libs/ammap3/ammap/plugins/export/libs/fabric.js/fabric.min',
      'ammap-ex-filesaver'  : 'libs/ammap3/ammap/plugins/export/libs/FileSaver.js/FileSaver.min',
      'ammap-ex-pdfmake'    : 'libs/ammap3/ammap/plugins/export/libs/pdfmake/pdfmake.min',
      'ammap-ex-vfs-fonts'  : 'libs/ammap3/ammap/plugins/export/libs/pdfmake/vfs_fonts',
      'ammap-ex-jszip'      : 'libs/ammap3/ammap/plugins/export/libs/jszip/jszip.min',
      'ammap-ex-xlsx'       : 'libs/ammap3/ammap/plugins/export/libs/xlsx/xlsx.min',
      'amchart3'            : 'libs/amcharts3/amcharts/amcharts',
      'amchart3-serial'     : 'libs/amcharts3/amcharts/serial',
      'amchart3-pie'        : 'libs/amcharts3/amcharts/pie',
      'amchart3-theme-light': 'libs/amcharts3/amcharts/themes/light'
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
      'ammap3WorldHigh'          : { deps: ['ammap3'] },
      'ammap-theme'              : { deps: ['ammap3']},
      'ammap-resp'               : { deps: ['ammap3']},
      'amchart3-serial'          : { deps: ['amchart3']},
      'amchart3-pie'             : { deps: ['amchart3']},
      'amchart3-theme-light'     : { deps: ['amchart3']},
    },
});

// BOOT

require(['angular', 'domReady!', 'bootstrap', 'app', 'routes', 'index'], function(ng, doc){

    ng.bootstrap(doc, ['kmApp']);
    ng.resumeBootstrap();

});
