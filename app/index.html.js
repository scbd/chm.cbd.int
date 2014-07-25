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

define(['app', 'authentication', 'scrollUp'], function(app) {
    'use strict';

    $(function () {
        $.scrollUp({ scrollText: 'scroll to top' });
    });

    app.controller('TemplateController', ['$scope', '$window', '$browser', '$document', '$location', 'authentication', function($scope, $window, $browser, $document, $location, authentication) {

        if ($location.protocol() == "http" && $location.host() == "chm.cbd.int")
            $window.location = "https://chm.cbd.int/";

        $scope.$root.pageTitle = { text: "not set" };

        //============================================================
        //
        //
        //============================================================
		function setCookie (name, value, days, path) {

            var cookieString = $window.escape(name) + '=';

            if(value) cookieString += $window.escape(value);
            else      days = -1;

            if(path)
                cookieString += '; path=' + path;

            if(days || days === 0) {

                var expirationDate = new Date();

                expirationDate.setDate(expirationDate.getDate() + days);

                cookieString += '; expires=' + expirationDate.toUTCString();
            }

            $document[0].cookie = cookieString;
        }

        //============================================================
        //
        //
        //============================================================
        $scope.signIn = function () {
            $location.url('/management/signin')
        };

        //============================================================
        //
        //
        //============================================================
        $scope.signOut = function () {
            authentication.signOut();
            $location.path('/');
        };

        //========================================
        //
        //========================================
        $scope.doSearch = function () {
            $location.url('/database/').search('q', $scope.searchQuery);
            $scope.searchQuery = '';
        }


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
        $scope.actionSignin = function () {
            var client_id    = $window.encodeURIComponent('55asz2laxbosdto6dfci0f37vbvdu43yljf8fkjacbq34ln9b09xgpy1ngo8pohd');
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/oauth2/callback');
            $window.location.href = 'https://accounts.cbd.int/oauth2/authorize?client_id='+client_id+'&redirect_uri='+redirect_uri+'&scope=all';
        };

        //============================================================
        //
        //
        //============================================================
        $scope.actionSignOut = function () {
            document.cookie = 'authenticationToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
            $window.location.href = 'https://accounts.cbd.int/signout?redirect_uri='+redirect_uri;
        };

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

        //============================================================
        //
        //
        //============================================================
        $window.addEventListener('message', function receiveMessage(event)
        {
            if(event.origin!='https://accounts.cbd.int')
                return;

            var message = JSON.parse(event.data);

            if(message.type=='ready')
                event.source.postMessage('{"type":"getAuthenticationToken"}', event.origin);

            if(message.type=='authenticationToken') {
                if(message.authenticationToken && !$browser.cookies().authenticationToken) {
                    setCookie('authenticationToken', message.authenticationToken, 7, '/');
                    $window.location.href = $window.location.href;
                }
                if(!message.authenticationToken && $browser.cookies().authenticationToken) {
                    authentication.signOut();
                    $window.location.href = $window.location.href;
                }
            }
        }, false);

        var qAuthenticationFrame = $document.find('#authenticationFrame');

        if(qAuthenticationFrame.size())
            qAuthenticationFrame[0].contentWindow.postMessage('{"type":"getAuthenticationToken"}', 'https://accounts.cbd.int');

     }]);
});
