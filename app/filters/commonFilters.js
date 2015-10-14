define(['app','lodash', ], function (app,_) { 'use strict';

    //##################################################################
      app.filter('filterByLetter', function () {
          return function (arr, letter) {
              if (!arr)
                  return null;


             if(!letter || letter==='ALL' )
                return arr;

              return _.filter(arr,function(item) {
//
                return item.name.charAt(0) === letter;
              });
          };
      });


}); //define
