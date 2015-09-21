define(['app', 'lodash'], function (app) { 'use strict';

	app.factory('realmConfig',  ["$http","$location", function($http,$location) {		
		
	var realmConfigurations =
                        [
                            //Production
                            {'host':'chm.cbd.int', 'realm' : 'CHM', 'roles': [{'User':'User'},{'Administrator':'Administrator'},{'ChmNationalAuthorizedUser':'ChmNationalAuthorizedUser'},{'ChmNationalFocalPoint':'ChmNationalFocalPoint'},{'ChmAdministrator':'ChmAdministrator'},{'ChmNrNationalAuthorizedUser':'ChmNrNationalAuthorizedUser'},{'ChmRmNAU':'ChmRmNAU'},{'ChmNrNationalFocalPoint':'ChmNrNationalFocalPoint'},{'ChmRmFocalPoint':'ChmRmFocalPoint'},{'ScbdStaff':'ScbdStaff'},{'NFP-CBD':'NFP-CBD'}] },

                            //Development
                            {'host':'localhost', 'realm' : 'CHM-DEV', 'roles': [{'User':'User'},{'Administrator':'Administrator'},{'ChmNationalAuthorizedUser':'ChmNationalAuthorizedUser-dev'},{'ChmNationalFocalPoint':'ChmNationalFocalPoint-dev'},{'ChmAdministrator':'ChmAdministrator-dev'},{'ChmNrNationalAuthorizedUser':'ChmNrNationalAuthorizedUser-dev'},{'ChmRmNAU':'ChmRmNAU-dev'},{'ChmNrNationalFocalPoint':'ChmNrNationalFocalPoint-dev'},{'ChmRmFocalPoint':'ChmRmFocalPoint-dev'},{'ScbdStaff':'ScbdStaff'},{'NFP-CBD':'NFP-CBD'}] },
                            
                            {'host':'127.0.0.1', 'realm' : 'CHM-DEV', 'roles':  [{'User':'User'},{'Administrator':'Administrator'},{'ChmNationalAuthorizedUser':'ChmNationalAuthorizedUser-dev'},{'ChmNationalFocalPoint':'ChmNationalFocalPoint-dev'},{'ChmAdministrator':'ChmAdministrator-dev'},{'ChmNrNationalAuthorizedUser':'ChmNrNationalAuthorizedUser-dev'},{'ChmRmNAU':'ChmRmNAU-dev'},{'ChmNrNationalFocalPoint':'ChmNrNationalFocalPoint-dev'},{'ChmRmFocalPoint':'ChmRmFocalPoint-dev'},{'ScbdStaff':'ScbdStaff'},{'NFP-CBD':'NFP-CBD'}] },
        
                            {'host':'dev-chm.cbd.int', 'realm' : 'CHM-DEV', 'roles':  [{'User':'User'},{'Administrator':'Administrator'},{'ChmNationalAuthorizedUser':'ChmNationalAuthorizedUser-dev'},{'ChmNationalFocalPoint':'ChmNationalFocalPoint-dev'},{'ChmAdministrator':'ChmAdministrator-dev'},{'ChmNrNationalAuthorizedUser':'ChmNrNationalAuthorizedUser-dev'},{'ChmRmNAU':'ChmRmNAU-dev'},{'ChmNrNationalFocalPoint':'ChmNrNationalFocalPoint-dev'},{'ChmRmFocalPoint':'ChmRmFocalPoint-dev'},{'ScbdStaff':'ScbdStaff'},{'NFP-CBD':'NFP-CBD'}] },,

                        ];	
                        
        var extendProdRolesToDev = false;
		
        //======================================================
        //
        //
        //======================================================        
        function getRoleName(roleName) {
                if (roleName) {
                    var realmConfig = _.where(realmConfigurations, {
                        host: $location.$$host
                    });              
                    if (realmConfig.length > 0) {
                        var role = _.find(realmConfig[0].roles, function(key) {
                               
                            return _.keys(key)[0] == roleName;
                        });
                        // console.log(realmConfig, role)
                        if (role)
                            return _.values(role)[0];
                        else
                            throw roleName + ' role is not configured for realm ' + realmConfig[0].realm + ', please update app\js\realmConfig.js';
                    } else
                        throw 'Realm not configured, please update app\js\realmConfig.js';
                }
            };//  function getRoleName(roleName) {
            								

        //======================================================
        //
        //
        //======================================================        
        function isAdministrator(user) {                      
                        return (user.roles.indexOf(getRoleName("Administrator")) >=0);
        };// isAdministrator(user) 
        
        //======================================================
        //
        //
        //======================================================        
        function isChmAdministrator(user) {                      
                        return (user.roles.indexOf(getRoleName("ChmAdministrator")) >=0);
        };//isChmAdministrator(user) 
        
                
        //======================================================
        //
        //
        //======================================================        
        function isUser(user) {                      
                        return (user.roles.indexOf(getRoleName("User")) >=0);
        };// isUser(user) 
        
        //======================================================
        //
        //
        //======================================================        
        function isChmNationalAuthorizedUser(user) {                      
                        return (user.roles.indexOf(getRoleName("ChmNationalAuthorizedUser")) >=0);
        };// isChmNationalAuthorizedUser(user)  
   
        //======================================================
        //
        //
        //======================================================        
        function isChmNationalFocalPoint(user) {                      
                        return (user.roles.indexOf(getRoleName("ChmNationalFocalPoint")) >=0);
        };// isChmNationalFocalPoint(user) 
        
        //======================================================
        //
        //
        //======================================================        
        function isChmNrNationalAuthorizedUser(user) {                      
                        return (user.roles.indexOf(getRoleName("ChmNrNationalAuthorizedUser")) >=0);
        };// isChmNrNationalAuthorizedUser(user) 
        
        
        //======================================================
        //
        //
        //======================================================        
        function isChmRmNAU(user) {                      
                        return (user.roles.indexOf(getRoleName("ChmRmNAU")) >=0);
        };// isChmRmNAU(user) 
        
        
        //======================================================
        //
        //
        //======================================================        
        function isChmNrNationalFocalPoint(user) {                      
                        return (user.roles.indexOf(getRoleName("ChmNrNationalFocalPoint")) >=0);
        };// isChmNrNationalFocalPoint(user) 
        
        //======================================================
        //
        //
        //======================================================        
        function isChmRmFocalPoint(user) {                      
                        return (user.roles.indexOf(getRoleName("ChmRmFocalPoint")) >=0);
        };// isChmRmFocalPoint(user)  
 
        //======================================================
        //
        //
        //======================================================        
        function isScbdStaff(user) {                      
                        return (user.roles.indexOf(getRoleName("ScbdStaff")) >=0);
        };// ScbdStaff(user)   
        
         //======================================================
        //
        //
        //======================================================        
        function isNFPCBD(user) {                      
                        return (user.roles.indexOf(getRoleName("NFP-CBD")) >=0);
        };// isNFPCBD(user)   
 
  
         //======================================================
        //
        //
        //======================================================        
        function setProdRolesToDev(val) {

        };//setProdRolesToDev(val) {
            
            
            								
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