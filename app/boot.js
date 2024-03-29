var cdnHost = 'https://cdn.cbd.int/';

require.config({
    waitSeconds: 120,
    baseUrl : 'app/',
    paths: {
      'authentication'      : 'services/authentication',
      'angular'             : 'libs/angular-flex/angular-flex',
      'ngRoute'             : 'libs/angular-route/angular-route.min',
      'ngSanitize'          : 'libs/angular-sanitize/angular-sanitize.min',
      'ngCookies'           : 'libs/angular-cookies/angular-cookies.min',
      'ngDialog'            : 'libs/ng-dialog/js/ngDialog.min',
      'text'                : 'libs/requirejs-text/text',
      'css'                 : 'libs/require-css/css.min',
      'json'                : 'libs/requirejs-plugins/src/json',
      'bootstrap'           : 'libs/bootstrap/dist/js/bootstrap.min',
      'lodash'              : 'libs/lodash/lodash.min',
      'URIjs'               : 'libs/uri.js/src',
      'linqjs'              : 'libs/linqjs/linq.min',
      'leaflet'             : 'https://cdn.jsdelivr.net/npm/leaflet@1.9.3/dist/leaflet',
      'proj4leaflet'        : 'https://cdn.jsdelivr.net/npm/proj4leaflet@1.0.2/src/proj4leaflet',
      'proj4'               : 'https://cdn.jsdelivr.net/npm/proj4@2.9.2/dist/proj4',
      'dompurify'           : 'https://cdn.jsdelivr.net/npm/dompurify@3.0.1/dist/purify.min',
      'jquery'              : 'libs/jquery/dist/jquery.min',
      'moment'              : 'libs/moment/moment',
      'leaflet-directive'   : 'js/libs/leaflet/angular-leaflet-directive',
      'ng-breadcrumbs'      : 'libs/ng-breadcrumbs/dist/ng-breadcrumbs.min',
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
      'amchart3-theme-light': 'libs/amcharts3/amcharts/themes/light',
      'scbd-angularjs-services'   : 'libs/scbd-angularjs-services/scbd-services',
      'scbd-angularjs-filters'    : 'libs/scbd-angularjs-services/filters/scbd-filters',
      'socket.io'                 : 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.min',
      'ngInfiniteScroll'          : 'libs/ngInfiniteScroll/build/ng-infinite-scroll',
      'webui-popover'             : 'libs/webui-popover/dist/jquery.webui-popover.min',
      'printThis'                 : 'libs/printThis/printThis',
      'pdfjs-dist/build/pdf'      : 'views/psd-viewer/pdfjs/pdf',
      'pdfjs-dist/build/pdf.worker' : 'views/psd-viewer/pdfjs/build/pdf.worker',        
      'pdf-object'                 : 'libs/pdfobject/pdfobject',
      'rangy-selectionsave'       : 'libs/rangy/rangy-selectionsaverestore.min',
      'textAngularSetup'          : 'libs/textAngular/dist/textAngularSetup',
      'textAngular'               : 'libs/textAngular/dist/textAngular.min',
      'ngMeta'          : cdnHost + 'ng-meta@1.0.3/dist/ngMeta.min',
      'tableexport'     : cdnHost + 'tableexport@4.0.10/dist/js/tableexport',
      'blobjs'          : cdnHost + 'blobjs@1.1.1/Blob.min',
      'file-saverjs'    : cdnHost + 'file-saverjs@1.3.6/FileSaver.min',
      'xlsx'            : cdnHost + 'xlsx@0.13.4/dist/xlsx',
      'jszip'           : cdnHost + 'xlsx@0.13.4/dist/jszip',  
    },
    shim: {
      'libs/angular/angular.min'     : { deps: ['jquery'] },
      'angular'                  : { deps: ['libs/angular/angular.min'] },
      'ngRoute'                  : { deps: ['angular'] },
      'ngSanitize'               : { deps: ['angular'] },
      'ngCookies'                : { deps: ['angular'] },
      'ngDialog'                 : { deps: ['angular', 'css!libs/ng-dialog/css/ngDialog.min', 'css!libs/ng-dialog/css/ngDialog-theme-default.css'] },
      'leaflet-directive'        : { deps: ['angular', 'leaflet']},
      'ng-breadcrumbs'           : { deps: ['angular'] },
      'bootstrap'                : { deps: ['jquery'] },
      'linqjs'                   : { deps: [], exports : 'Enumerable' },
      'leaflet'                  : { deps: ['css!https://cdn.jsdelivr.net/npm/leaflet@1.9.3/dist/leaflet.css'], exports : 'L' },
      'proj4leaflet'             : { deps: ['leaflet', 'proj4'], exports : 'L' },
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
      'ammap-export'             : { deps: ['ammap3']},
      'scbd-branding'            : { 'deps': ['angular']},
      'scbd-angularjs-services'  : { 'deps': ['angular']},
      'scbd-angularjs-filters'   : { 'deps': ['angular']},
      'webui-popover'            : { 'deps': ['jquery', 'css!libs/webui-popover/dist/jquery.webui-popover.min']},
      'pdfjs-dist/build/pdf'     : { 'deps': ['angular']}, 
      'pdf-object'               : { 'deps': ['angular']},
      'rangy-selectionsave'      : { 'deps': ['rangy-core']},
      'textAngularSetup'         : { 'deps': ['angular']},
      'textAngular'              : { 'deps': ['angular', 'textAngularSetup']},
      'ngInfiniteScroll'         : { 'deps': ['angular']},
      'ngMeta'                   : { 'deps': ['angular']},
      'xlsx'                     : { 'deps': ['jszip'],'exports': 'XLSX'},

    },
    packages: [
        { name: 'scbd-branding'          , location : 'components/scbd-branding' },
        { name: 'scbd-angularjs-services', location : 'components/scbd-angularjs-services/services' },
        { name: 'scbd-angularjs-filters',  location : 'components/scbd-angularjs-services/filters' },
        { name: 'moment',  location : 'libs/moment', main:'moment' }
    ],
    urlArgs: function(id, url){
      var version = window.appVersion;
      if(~url.indexOf('app/libs/'))
        version = window.appDependencyCacheBuster;

      return (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + version
  }
});

define('rangy-core', ['libs/rangy/rangy-core.min'], function (rangyCore) {
  window.rangy = rangyCore;
  return rangyCore;
});

// BOOT
require(['angular', 'app', 'bootstrap', 'routes', 'index', 
    /* Pre-Boot Dependencies */
    'directives/forms/km-rich-textbox-custom-controls'
  ], function(ng, app) {
      ng.element(document).ready(function () {
         ng.bootstrap(document, [app.name]);
    });
});
