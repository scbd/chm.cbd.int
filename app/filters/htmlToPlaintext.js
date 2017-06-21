define(['app'], function(app) {

  var decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(Array.isArray(str)) str=str[0];
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      str = str.replace('<div>', ' ');
      str = str.replace('</div>', ' ');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();
  app.filter('htmlToPlaintext', function() {
      return function(text) {
        return  text ? decodeEntities(text) : '';
      };
    }
  );

});