define(['app'], function (app, moment, schemaName, schemaShortName) {
  app.directive("translationUrl", ['$browser', function($browser){
    return {
      restrict : 'A',
      link :  function($scope, $element, $attrs){

        var lastPath;
        // console.log($attrs.ngClick);
        if(!$attrs.ngClick){
          $attrs.$observe('href', function(){
            // console.log($attrs)        			
            var langRegex 			= new RegExp('^\/(ar|en|es|fr|ru|zh)');
            var externalUrlRegex 	= new RegExp('^(http|https|mailto|www)/i');
            var startWithRegex	 	= new RegExp('^\/');

            if(lastPath != $attrs.href && !langRegex.test($attrs.href) && startWithRegex.test($attrs.href)){
              lastPath = $browser.baseHref() + $attrs.href.replace(/^\//, ''); 
              $attrs.$set('href', lastPath);
            };
          })
        }
      }
    };		
  }]);

});