define(['app'], function(app) { 'use strict';
app.filter("trunc", function() {
 return function(text, maxSize, suffix) {

   if (!maxSize)
     return text;

   if (!suffix)
     suffix = "";

   if(!text)
     return "";

   if (text.length > maxSize)
     text = text.substr(0, maxSize) + suffix;

   return text;
 };
});
});