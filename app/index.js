define(['app', 'jquery', 'lodash', 'moment', 'authentication', 'ng-breadcrumbs',
'directives/users/notifications', 'services/realmConfig',
 'scbd-angularjs-services', 'scbd-angularjs-filters',
'scbd-branding/directives/footer', 'directives/nav/portal-branding',
'scbd-branding/directives/header/header', 'directives/nav/portal-nav',
'directives/forms/translation-url', 'scbd-angularjs-services/locale',
], function(app, $, _, moment) {
    'use strict';

    app.controller('TemplateController', ['$scope', '$rootScope', '$window', '$location', 'authentication', 'breadcrumbs', '$mdToast', 'realm', 'realmConfig', 'cfgUserNotification', 'locale',
     function($scope, $rootScope, $window, $location, authentication, breadcrumbs, $mdToast, realm, realmConfig, cfgUserNotification, locale) {

        if ($location.protocol() == "http" && $location.host() == "chm.cbd.int")
            $window.location = "https://chm.cbd.int/";

        $scope.lang = locale;
        //set default moment lang
        var lang = locale;
        if(lang=='zh')
            lang= 'zh-cn'; //moment has two ZH, use ZH-CN
        moment.locale(lang);
        if(lang == 'ar'){
            require(['css!/app/libs/bootstrap-rtl/dist/css/bootstrap-rtl.css', 'css!/app/css/custom-rtl.css']);
        }
        var basePath = (angular.element('base').attr('href')||'').replace(/\/+$/g, '');
        $rootScope.$on('$routeChangeSuccess', function(){
            $window.ga('set',  'page', basePath+$location.path());
            $window.ga('send', 'pageview');
        });
        $rootScope.placeholderRecords=[];

        $scope.goHome               = function() { $location.path('/'); };
        $scope.currentPath          = function() { return $location.path(); };
        $scope.hideSubmitInfoButton = function() { return $location.path()=="/management/register"; };

        $scope.$on('signOut', function(evt, data) {

            // var fields = logglyLogger.fields({ realm: realm.value, appVersion: appVersion })
            // fields.user = undefined;
            // logglyLogger.fields(fields)
            $window.location.reload();
        });

        if(cfgUserNotification){
            //TODO :convert to provider
            cfgUserNotification
            .notificationUrls = {
                                documentNotificationUrl     : '/management/requests',
                                viewAllNotificationUrl      : '/management/requests'
                            };
        }
        
        //////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////

        $scope.$on("$routeChangeSuccess", function(evt, current){
            $scope.routeLoaded = true;
            if(current.$$route)
                $("head > title").text(current.$$route.label || "Clearing-House Mechanism");
        });
        //============================================================
        //
        //
        //============================================================
        $rootScope.$watch('user', _.debounce(function(user) {

            if (!user)
                return;

            require(["_slaask"], function(_slaask) {

                if (user.isAuthenticated) {
                    _slaask.identify(user.name, {
                        'user-id' : user.userID,
                        'name' : user.name,
                        'email' : user.email,
                    });

                    if(_slaask.initialized) {
                        _slaask.slaaskSendUserInfos();
                    }
                }

                if(!_slaask.initialized) {
                    _slaask.init('ae83e21f01860758210a799872e12ac4');
                    _slaask.initialized = true;
                }
            });
        }, 1000));
        //============================================================
        //
        //
        //============================================================
        $scope.canManageNationalUser = false;

        $rootScope.$watch('user', function(user){

            $scope.canManageNationalUser = false;

            if(!user || !user.isAuthenticated || !user.government)
                return;

            var nationalRoles = _.map(['ChmAdministrator'].concat(realmConfig.nationalRoles()), function(role) {
                return realmConfig.getRoleName(role).toLowerCase();
            });

            $scope.canManageNationalUser = _.some(user.roles, function(role){
                return ~nationalRoles.indexOf(role.toLowerCase());
            });
        });

        //============================================================
        //
        //
        //============================================================
        $scope.actionSignup = function () {
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
            $window.location.href = 'https://accounts.cbd.int/signup?redirect_uri='+redirect_uri;
        };

        //============================================================
        //
        //
        //============================================================
        $scope.actionPassword = function () {
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
            $window.location.href = 'https://accounts.cbd.int/password?redirect_uri='+redirect_uri;
        };

        //============================================================
        //
        //
        //============================================================
        $scope.actionProfile = function () {
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
            $window.location.href = 'https://accounts.cbd.int/profile?redirect_uri='+redirect_uri;
        };


        //======================================================
        //
        //
        //======================================================

        $rootScope.$on("onPostWorkflow", function(evt, msg) {
            $scope.showToastConfirmReload(msg);
        });

        $rootScope.$on("onPostPublish", function(evt, msg) {
            $scope.showToastConfirmReload(msg);
        });

        $rootScope.$on("onPostClose", function(evt, msg) {
            $scope.showSimpleToast(msg);
        });

        $rootScope.$on("onSaveDraft", function(evt, msg) {
            $scope.showSimpleToast(msg);
        });

        $scope.showSimpleToast = function(msg)
        {
            $mdToast.show(
              $mdToast.simple()
                .content(msg)
                .position('top right')
                .hideDelay(3000)
            );


        }

        $scope.showToastConfirmReload = function(msg)
        {
            var toast = $mdToast.simple()
                  .content(msg)
                  .action('Refresh List')
                  .highlightAction(false)
                  .position('top right')
                  .hideDelay(20000);

            $mdToast.show(toast).then(function() {
                $scope.$broadcast("RefreshList");
            });

        }




        //======================================================
        //
        //
        //======================================================
        $rootScope.$on("ProcessingRecord", function(evt, recID, schema) {
            $rootScope.placeholderRecords.push({'recID':recID,'schema':schema});
        });

        $rootScope.$on('event:auth-emailVerification', function(evt, data){
            $scope.showEmailVerificationMessage = data.message;
        });

        function updateSize() {
            $rootScope.$applyAsync(function () {
                $rootScope.deviceSize = $('.device-size:visible').attr('size');
                console.log($rootScope.deviceSize);
                
            });
        }
        updateSize();
        angular.element($window).on('resize', updateSize);

     }]);

    app.directive(
            "mAppLoading",
            function( $animate ) {
                // Return the directive configuration.
                return({
                    link: link,
                    restrict: "C"
                });
                // I bind the JavaScript events to the scope.
                function link( scope, element, attributes ) {
                    // Due to the way AngularJS prevents animation during the bootstrap
                    // of the application, we can't animate the top-level container; but,
                    // since we added "ngAnimateChildren", we can animated the inner
                    // container during this phase.
                    // --
                    // NOTE: Am using .eq(1) so that we don't animate the Style block.
                    $animate.leave( element.children().eq( 1 ) ).then(
                        function cleanupAfterAnimation() {
                            // Remove the root directive element.
                            element.remove();
                            // Clear the closed-over variable references.
                            scope = element = attributes = null;
                        }
                    );
                }
            }
        );

});
