define(['app'], function(app) { 'use strict';

    var urlLangRegex       = /^\/(en|ar|fr|es|ru|zh)(\/|$)/;
    app.provider('locale', [function() {

        this.$get = ['$window', function( $window) {
        
            var location = $window.location;
            var lang = location.pathname.match(urlLangRegex);
            
            if(lang)
                return lang[1];

            return 'en';

        }];
    }]);

    app.service('localeService', ['$window', function( $window) {

        this.urlHasLocale = function () {
                var location = $window.location;
                var lang = location.pathname.match(urlLangRegex);
                
                if(lang)
                    return true;
                
                return false;
        };
    }]);
});
