describe("Unit: Singin directive", function() {

    var module = angular.mock.module;
    var elm, scope, linkFn, input;

    beforeEach(module('kmApp','partialTemplateCache')); // partialTemplates (from ng-html2js preprocessor) 

    beforeEach(inject(function($rootScope, $compile) {
        elm    = angular.element('<signin></signin>');
        scope  = $rootScope.$new();
        linkFn = $compile(elm);
        scope.$digest(); // have to digest to bring html from templateCache
    }));


    it('Test value copied from model to HTML element',function() {
        inject(function($controller)  {
            linkFn(scope); // <== this will create a new scope (since our directive creates 
                           // new scope), runs the controller with it, and bind 
                           // the element to that new scope

            scope.$digest();

            var qEmail      = elm.find('[ng-model="email"]'     );
            var qPassword   = elm.find('[ng-model="password"]'  );
            var qRememberMe = elm.find('[ng-model="rememberMe"]');

            //check value are empty

            expect(qEmail     .val()).toEqual("");
            expect(qPassword  .val()).toEqual("");
            expect(qRememberMe.is(':checked')).toBe(false);

            // Update values

            scope.email      = "user@domain";
            scope.password   = "password!";
            scope.rememberMe = true;

            scope.$digest();

            expect(qEmail     .val()).toEqual("user@domain");
            expect(qPassword  .val()).toEqual("password!");
            expect(qRememberMe.is(':checked')).toBe(true);

        });
    });

    it('Test value copied from HTML element to model',function() {
        inject(function($controller)  {
            linkFn(scope); // <== this will create a new scope (since our directive creates 
                           // new scope), runs the controller with it, and bind 
                           // the element to that new scope

            var qEmail      = elm.find('[ng-model="email"]'     );
            var qPassword   = elm.find('[ng-model="password"]'  );
            var qRememberMe = elm.find('[ng-model="rememberMe"]');

            scope.$digest();

            //test value are empty

            expect(qEmail     .val()).toEqual("");
            expect(qPassword  .val()).toEqual("");
            expect(qRememberMe.is(':checked')).toBe(false);

            // set new value

            qEmail     .val("user@domain2");
            qPassword  .val("password!!");
            qRememberMe.val(true);

            qEmail     .trigger('input');
            qPassword  .trigger('input');
            qRememberMe.trigger('click');

            scope.$digest();

            expect(scope.email     ).toEqual("user@domain2");
            expect(scope.password  ).toEqual("password!!");
            expect(scope.rememberMe).toBe(true);
        });
    });
});