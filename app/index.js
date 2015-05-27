require(['jquery'], function($) {
    $("#ctl06_menuSubcbd" ).mouseover(function () { $("#ctl06_menuTopcbd").addClass("hover"); }).mouseout(function () { $("#ctl06_menuTopcbd").removeClass("hover"); });
    $("#ctl06_menuSubcpb" ).mouseover(function () { $("#ctl06_menuTopcpb").addClass("hover"); }).mouseout(function () { $("#ctl06_menuTopcpb").removeClass("hover"); });
    $("#ctl06_menuSubprog").mouseover(function () { $("#ctl06_menuTopprog").addClass("hover"); }).mouseout(function () { $("#ctl06_menuTopprog").removeClass("hover"); });
    $("#t-masterNavi *"   ).removeClass('t-navSelected');$("#ctl06_menuSubinfo").mouseover(function () { $("#ctl06_menuTopinfo").addClass("hover"); }).mouseout(function () { $("#ctl06_menuTopinfo").removeClass("hover"); });
    $("#ctl06_menuSubscbd").mouseover(function () { $("#ctl06_menuTopscbd").addClass("hover"); }).mouseout(function () { $("#ctl06_menuTopscbd").removeClass("hover"); });
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////

define(['app', 'authentication', 'ng-breadcrumbs','directives/users/notifications'], function(app) {
    'use strict';

    app.controller('TemplateController', ['$scope', '$rootScope', '$window', '$location', 'authentication', 'breadcrumbs', '$mdToast' ,'$timeout',  function($scope, $rootScope, $window, $location, authentication, breadcrumbs, $mdToast, $timeout) {

        if ($location.protocol() == "http" && $location.host() == "chm.cbd.int")
            $window.location = "https://chm.cbd.int/";

        $scope.breadcrumbs     = breadcrumbs;
        $scope.$root.pageTitle = { text: "" };
        $rootScope.placeholderRecords=[];

        $scope.$on("$routeChangeSuccess", function(){
            $scope.routeLoaded = true;
        });

        //============================================================
        //
        //
        //============================================================
        $scope.$on('signOut', function(){
            $location.url('/');
        });

        //============================================================
        //
        //
        //============================================================
        $scope.signIn = function () {
            $location.url('/signin');
        };

        //============================================================
        //
        //
        //============================================================
        $scope.signOut = function () {
            authentication.signOut();
        };

        //========================================
        //
        //========================================
        $scope.doSearch = function () {
            $location.url('/database/').search('q', $scope.searchQuery);
            $scope.searchQuery = '';
        };


        $scope.goHome               = function() { $location.path('/'); };
        $scope.currentPath          = function() { return $location.path(); };
        $scope.hideSubmitInfoButton = function() { return $location.path()=="/management/register"; };


        //////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////

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
            $scope.showSimpleToast(msg);
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

     }]);
});
