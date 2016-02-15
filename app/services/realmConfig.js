define(['app', 'lodash', 'providers/realm'], function (app,_) { 'use strict';

	app.factory('realmConfig',  ["realm", function(realm) {


    	var realmConfigurations = {
    	    'CHM': { //Production
                //no overrides
    	    },
    	    'CHM-DEV': { //Development / Test
    	        overrides: {
    	            'ChmNationalAuthorizedUser':   'ChmNationalAuthorizedUser-dev',
    	            'ChmNationalFocalPoint':       'ChmNationalFocalPoint-dev',
    	            'ChmAdministrator':            'ChmAdministrator-dev',
    	            'ChmNrNationalAuthorizedUser': 'ChmNrNationalAuthorizedUser-dev',
    	            'ChmRmNAU':                    'ChmRmNAU-dev',
    	            'ChmNrNationalFocalPoint':     'ChmNrNationalFocalPoint-dev',
    	            'ChmRmFocalPoint':             'ChmRmFocalPoint-dev',
    	        }
    	    }
    	};

        //======================================================
        //
        //
        //======================================================
        function getRoleName(role) {

            var config = realmConfigurations[realm];

            if(!config)
                throw 'Realm not configured';

            if(config.overrides && config.overrides[role])
                return config.overrides[role];

            return role;
        }

        //======================================================
        //
        //
        //======================================================
        function isAdministrator(user) {
                        return (user.roles.indexOf(getRoleName("Administrator")) >=0);
        }// isAdministrator(user)

        //======================================================
        //
        //
        //======================================================
        function isChmAdministrator(user) {
                        return (user.roles.indexOf(getRoleName("ChmAdministrator")) >=0);
        }// isChmAdministrator(user)


        //======================================================
        //
        //
        //======================================================
        function isUser(user) {
                        return (user.roles.indexOf(getRoleName("User")) >=0);
        }// isUser(user)

        //======================================================
        //
        //
        //======================================================
        function isChmNationalAuthorizedUser(user) {
                        return (user.roles.indexOf(getRoleName("ChmNationalAuthorizedUser")) >=0);
        }// isChmNationalAuthorizedUser(user)

        //======================================================
        //
        //
        //======================================================
        function isChmNationalFocalPoint(user) {
                        return (user.roles.indexOf(getRoleName("ChmNationalFocalPoint")) >=0);
        }// isChmNationalFocalPoint(user)

        //======================================================
        //
        //
        //======================================================
        function isChmNrNationalAuthorizedUser(user) {
                        return (user.roles.indexOf(getRoleName("ChmNrNationalAuthorizedUser")) >=0);
        }// isChmNrNationalAuthorizedUser(user)


        //======================================================
        //
        //
        //======================================================
        function isChmRmNAU(user) {
                        return (user.roles.indexOf(getRoleName("ChmRmNAU")) >=0);
        }// isChmRmNAU(user)


        //======================================================
        //
        //
        //======================================================
        function isChmNrNationalFocalPoint(user) {
                        return (user.roles.indexOf(getRoleName("ChmNrNationalFocalPoint")) >=0);
        }// isChmNrNationalFocalPoint(user)

        //======================================================
        //
        //
        //======================================================
        function isChmRmFocalPoint(user) {
                        return (user.roles.indexOf(getRoleName("ChmRmFocalPoint")) >=0);
        }// isChmRmFocalPoint(user)

        //======================================================
        //
        //
        //======================================================
        function isScbdStaff(user) {
                        return (user.roles.indexOf(getRoleName("ScbdStaff")) >=0);
        }// ScbdStaff(user)

         //======================================================
        //
        //
        //======================================================
        function isNFPCBD(user) {
                        return (user.roles.indexOf(getRoleName("NFP-CBD")) >=0);
        }// isNFPCBD(user)


           return {
                    getRoleName : getRoleName,
                    isAdministrator:isAdministrator,
                    isChmRmFocalPoint:isChmRmFocalPoint,
                    isChmNrNationalFocalPoint:isChmNrNationalFocalPoint,
                    isChmRmNAU:isChmRmNAU,
                    isChmNrNationalAuthorizedUser:isChmNrNationalAuthorizedUser,
                    isChmNationalFocalPoint:isChmNationalFocalPoint,
                    isChmNationalAuthorizedUser:isChmNationalAuthorizedUser,
                    isUser:isUser,
                    isChmAdministrator:isChmAdministrator,
                    isNFPCBD:isNFPCBD,
                    isScbdStaff:isScbdStaff
            };
	}]);//app factory


}); //define
