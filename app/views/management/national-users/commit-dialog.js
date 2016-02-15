define(['lodash'], function(_) {

    return ['$scope', '$http', '$q', 'user', 'grantRoles', 'revokeRoles', 'roles', 'government', function ($scope, $http, $q, user, rolesToGrant, rolesToRevoke, roles, government) {

        var _ctrl = this;

        _ctrl.user  = user;
        _ctrl.roles = roles;
        _ctrl.government = government;
        _ctrl.rolesToGrant  = _.map(rolesToGrant,  function(roleId) { return { roleId : roleId }; });
        _ctrl.rolesToRevoke = _.map(rolesToRevoke, function(roleId) { return { roleId : roleId }; });

        _ctrl.save = function() {

            _ctrl.loading = true;

            $q.when(_ctrl.user).then(function(user) {

                _ctrl.user.loading=true;

                if(!user.userID)
                    return createUser(user);

                return user;

            }).then(function(user) {

                if(user.government!=government) {
                    return setUserGovernment(user, government);
                }

                return user;

            }).then(function(user) {

                _ctrl.user = user;
                _ctrl.user.success = true;
                delete _ctrl.user.loading;

                return user;

            }).then(function(user) {

                var grantActions = _.map(_ctrl.rolesToGrant, function (r) {
                    return grantRole(user.userID, r);
                });

                var revokeActions = _.map(_ctrl.rolesToRevoke, function (r) {
                    return revokeRole(user.userID, r);
                });


                return $q.all(grantActions.concat(revokeActions));

            }).then(function(roles) {

                var success = !roles.length || _.every(roles, function(r) {
                    return r.success;
                });

                if(success)
                    $scope.closeThisDialog();

            }).catch(function(err){

                _ctrl.error = err.data || err;

                console.log(err);

            }).finally(function(){

                delete _ctrl.loading;
            });
        };


        //========================
        //
        //========================
        function createUser(user) {

            delete user.error;
            delete user.success;

            user.loading = true;

            return $http.post('https://api.cbd.int/api/v2013/users/national', user).then(function(res){

                user = res.data;
                return user;

            }).catch(function(err){

                user.error = err.data || err;
                throw user.error;

            });
        }

        //========================
        //
        //========================
        function setUserGovernment(user, government) {

            delete user.error;
            delete user.success;

            user.loading = true;

            var patchData = {
                userID : user.userID,
                government : government
            };

            return $http.patch('https://api.cbd.int/api/v2013/users/national', patchData).then(function(res){

                user = res.data;
                return user;

            }).catch(function(err){

                user.error = err.data || err;
                throw user.error;

            });
        }

        //========================
        //
        //========================
        function grantRole(userId, role) {

            delete role.error;
            delete role.success;

            role.loading = true;

            return $http.put('https://api.cbd.int/api/v2013/users/'+userId+'/roles/'+role.roleId, {}).then(function(){

                role.success = true;
                return role;

            }).catch(function(err){

                role.error = err.data || err;
                return role;

            }).finally(function(){

                delete role.loading;

            });
        }

        //========================
        //
        //========================
        function revokeRole(userId, role) {

            delete role.error;
            delete role.success;

            role.loading = true;

            return $http.delete('https://api.cbd.int/api/v2013/users/'+userId+'/roles/'+role.roleId).then(function(){

                role.success = true;
                return role;

            }).catch(function(err){

                role.error = err.data || err;
                return role;

            }).finally(function(){

                delete role.loading;

            });
        }

	}];
});
