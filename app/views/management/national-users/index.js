define(['angular', 'lodash', 'require', 'ngDialog', 'services/realmConfig'], function(ng, _, require) { 'use strict';

    return ['$scope', '$http', '$q', 'ngDialog', 'user', 'realm', 'realmConfig', function($scope, $http, $q, ngDialog, authenticatedUser, realm, realmConfig) {

        var users;
        var roles;
        var manageableRoles;
        var government = authenticatedUser.government;

        $scope.edit                = edit;
        $scope.search              = search;
        $scope.hasRoleManageable   = hasRoleManageable;
        $scope.isRoleManageable    = isRoleManageable;
        $scope.isRoleNotManageable = function(id) { return !isRoleManageable(id); };

        init().then(function(){
            $scope.roles = roles;
            $scope.users = users;
        });

        return;

        //========================
        //
        //========================
        function init() {

            return $q.all([loadRoles(), loadUsers()]);
        }

        //========================
        //
        //========================
        function loadRoles() {

            // All Roles

            var q1 = $http.get('https://api.cbd.int/api/v2013/roles').then(function (res) {
                roles = _.reduce(res.data, function(ret, role){
                    ret[role.roleId] = role;
                    return ret;
                }, {});
            });

            // Manageable Roles

            var query = {
                isManageable : true,
                roles : realmConfig.nationalRoles()
            };

            var q2 = $http.get('https://api.cbd.int/api/v2013/roles', { params : { q : query } }).then(function (res) {
                manageableRoles = _.reduce(res.data, function(ret, role){
                    ret[role.roleId] = role;
                    return ret;
                }, {});

                $scope.manageableRoles = manageableRoles;
            });

            return $q.all([q1, q2]);
        }

        //========================
        //
        //========================
        function loadUsers() {

            // Users
            return $http.get('https://api.cbd.int/api/v2013/users/national').then(function (res) {
                users = res.data;
                return res.data;
            });
        }

        //===========================
        //
        //===========================
        function search() {

            return openDialog('./search-user-dialog', {

                className : 'ngdialog-theme-default wide',
                resolve : { government : _literal(authenticatedUser.government) }

            }).then(function(dialog) {

                return dialog.closePromise.then(function (r) { return r.value; });

            }).then(function(user){

                if(!user) throw "$BREAK";

                if(!user.userID) {
                    return openDialog('./edit-user-dialog', {
                        resolve : { user : _literal(user) }
                    }).then(function(dialog) {
                        return dialog.closePromise.then(function (r) { return r.value; });
                    });
                }

                return user;

            }).then(function(user){

                if(!user) throw "$BREAK";

                return edit(user);

            }).catch(function(err) {

                if(err=="$BREAK")
                    return;

                console.log("err");
            });
        }

        //===========================
        //
        //===========================
        function edit(editedUser) {

            var user = ng.fromJson(ng.toJson(editedUser||{})); // clean & clone object

            return openDialog('./edit-roles-dialog', {

                className : 'ngdialog-theme-default wide',
                resolve : { user : _literal(user), roles : _literal(roles), manageableRoles : _literal(manageableRoles) }

            }).then(function(dialog) {

                return dialog.closePromise.then(function (r) { return r.value; });

            }).then(function(user) {

                if(!user) throw "$BREAK";

                var rolesToGrant  = _.difference(user.roles, editedUser.roles);
                var rolesToRevoke = _.difference(editedUser.roles, user.roles);

                return openDialog('./commit-dialog', {
                    className : 'ngdialog-theme-default wide',
                    resolve : {
                        user : _literal(user),
                        government : _literal(government),
                        grantRoles : _literal(rolesToGrant),
                        revokeRoles : _literal(rolesToRevoke),
                        roles : _literal(roles)
                    }
                });

            }).then(function(dialog) {

                return dialog.closePromise;

            }).then(function(){

                return loadUsers();

            }).then(function(users){

                $scope.users = users;

            }).catch(function(err) {

                if(err=="$BREAK")
                    return;

                console.log(err.data || err);
            });
        }

        //========================
        //
        //========================
        function hasRoleManageable(user) {
            return _.some(user.roles, isRoleManageable);
        }

        //========================
        //
        //========================
        function isRoleManageable(roleId) {
            return manageableRoles && !!manageableRoles[roleId];
        }


        /////////////////////////////////////////////////////
        /////////////////////////////////////////////////////
        /////////////////////////////////////////////////////

        //===========================
        //
        //===========================
        function _literal(v) {
            return function() { return v; };
        }

        //===========================
        //
        //===========================
        function openDialog(dialog, options) {

            options = options || {};

            return $q(function(resolve, reject) {

                require(['text!'+dialog+'.html', dialog], function(template, controller) {

                    options.plain = true;
                    options.closeByDocument = false;
                    options.showClose = false;
                    options.template = template;
                    options.controller = controller;

                    if(!options.controllerAs) {
                        var controllerAs = dialog.lastIndexOf('/')<0 ? dialog : dialog.substr(dialog.lastIndexOf('/')+1);
                        options.controllerAs = _.camelCase(controllerAs)+'Ctrl';
                    }

                    var dialogWindow = ngDialog.open(options);

                    dialogWindow.closePromise.then(function(res){

                        if(res.value=="$escape")      delete res.value;
                        if(res.value=="$document")    delete res.value;
                        if(res.value=="$closeButton") delete res.value;

                        return res;
                    });

                    resolve(dialogWindow);

                }, reject);
            });
        }
    }];
});
