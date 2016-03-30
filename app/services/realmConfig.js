define(['app', 'lodash', 'providers/realm'], function (app,_) { 'use strict';

	app.factory('realmConfig',  ["realm", function(realm) {

        var nationalRoles = [
            'NFP-CBD',
            'ChmNrNationalFocalPoint',
            'ChmNrNationalAuthorizedUser',
            'ChmRmFocalPoint',
            'ChmRmNAU'
        ];

    	var realmConfigurations = {
    	    'CHM': { //Production
                //no overrides
    	    },
    	    'CHM-DEV': { //Development / Test
    	        overrides: {
    	            'ChmAdministrator':            'ChmAdministrator-dev',
    	            'ChmNrNationalFocalPoint':     'ChmNrNationalFocalPoint-dev',
    	            'ChmNrNationalAuthorizedUser': 'ChmNrNationalAuthorizedUser-dev',
    	            'ChmRmFocalPoint':             'ChmRmFocalPoint-dev',
    	            'ChmRmNAU':                    'ChmRmNAU-dev',
    	        }
    	    }
    	};
        //======================================================
        //
        //
        //======================================================
        function getNationalRoles() {
            return nationalRoles;
        }

        //======================================================
        //
        //
        //======================================================
        function getRoleName(role) {

            var config = realmConfigurations[realm];

            if (!config) {
                config = {};
                console.log('Realm not configured');
            }

            if (config.overrides && config.overrides[role])
                return config.overrides[role];

            return role;
        }

        //======================================================
        //
        //
        //======================================================
        function isInAnyRole(user, roles) {

            roles = _.union(roles, _.map(roles, getRoleName));

            return !!_.intersection(roles || [], user.roles).length;

        }

        //======================================================
        //
        //
        //======================================================
        function isAdministrator(user) {
            return isInAnyRole(user, ["Administrator"]);
        }


        //======================================================
        //
        //
        //======================================================
        function isChmAdministrator(user) {
            return isInAnyRole(user, ["Administrator", "ChmAdministrator"]);
        }

        //======================================================
        //
        //
        //======================================================
        function isNationalUser(user) {
            return isInAnyRole(user, nationalRoles);
        }

        //======================================================
        //
        //
        //======================================================
        function isChmPublishingAuthority(user) {
            return isInAnyRole(user, ["NFP-CBD"]);
        }

        //======================================================
        //
        //
        //======================================================
        function isChmNrPublishingAuthority(user) {
            return isChmPublishingAuthority(user) || isInAnyRole(user, ["ChmNrNationalFocalPoint"]);
        }

        //======================================================
        //
        //
        //======================================================
        function isChmNrUser(user) {
            return isChmNrPublishingAuthority(user) || isInAnyRole(user, ["ChmNrNationalAuthorizedUser"]);
        }

        //======================================================
        //
        //
        //======================================================
        function isChmRmPublishingAuthority(user) {
            return isChmPublishingAuthority(user) || isInAnyRole(user, ["ChmRmFocalPoint"]);
        }

        //======================================================
        //
        //
        //======================================================
        function isChmRmUser(user) {
            return isChmRmPublishingAuthority(user) || isInAnyRole(user, ["ChmRmNAU"]);
        }

        //======================================================
        //
        //
        //======================================================
        function isScbdStaff(user) {
            return isInAnyRole(user, ["ScbdStaff"]);
        }

        //======================================================
        //
        //
        //======================================================
        function isUser(user) {
            return isInAnyRole(user, ["User"]);
        }

        return {
            nationalRoles: getNationalRoles,
            getRoleName: getRoleName,
            isAdministrator: isAdministrator,
            isChmAdministrator: isChmAdministrator,
            isChmPublishingAuthority: isChmPublishingAuthority,
            isNationalUser: isNationalUser,
            isChmRmPublishingAuthority: isChmRmPublishingAuthority,
            isChmRmUser: isChmRmUser,
            isChmNrPublishingAuthority: isChmNrPublishingAuthority,
            isChmNrUser: isChmNrUser,
            isScbdStaff: isScbdStaff,
            isUser: isUser
        };
    }]);
}); //define
