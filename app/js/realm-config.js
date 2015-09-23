define(['app'], function(app){

    var realmConfigurations =
                        [
                            //Production
                            {'host':'chm.cbd.int', 'realm' : 'CHM', 'roles': [{'User':'User'},{'Administrator':'Administrator'},{'ChmNationalAuthorizedUser':'ChmNationalAuthorizedUser'},{'ChmNationalFocalPoint':'ChmNationalFocalPoint'},{'ChmAdministrator':'ChmAdministrator'},{'ChmNrNationalAuthorizedUser':'ChmNrNationalAuthorizedUser'},{'ChmRmNAU':'ChmRmNAU'},{'ChmNrNationalFocalPoint':'ChmNrNationalFocalPoint'},{'ChmRmFocalPoint':'ChmRmFocalPoint'}] },

                            //Development
                            {'host':'localhost', 'realm' : 'CHM-DEV', 'roles': [{'User':'User'},{'Administrator':'Administrator'},{'ChmNationalAuthorizedUser':'ChmNationalAuthorizedUser-dev'},{'ChmNationalFocalPoint':'ChmNationalFocalPoint-dev'},{'ChmAdministrator':'ChmAdministrator-dev'},{'ChmNrNationalAuthorizedUser':'ChmNrNationalAuthorizedUser-dev'},{'ChmRmNAU':'ChmRmNAU-dev'},{'ChmNrNationalFocalPoint':'ChmNrNationalFocalPoint-dev'},{'ChmRmFocalPoint':'ChmRmFocalPoint-dev'}] },
                            
							{'host':'127.0.0.1', 'realm' : 'CHM-DEV', 'roles':  [{'User':'User'},{'Administrator':'Administrator'},{'ChmNationalAuthorizedUser':'ChmNationalAuthorizedUser-dev'},{'ChmNationalFocalPoint':'ChmNationalFocalPoint-dev'},{'ChmAdministrator':'ChmAdministrator-dev'},{'ChmNrNationalAuthorizedUser':'ChmNrNationalAuthorizedUser-dev'},{'ChmRmNAU':'ChmRmNAU-dev'},{'ChmNrNationalFocalPoint':'ChmNrNationalFocalPoint-dev'},{'ChmRmFocalPoint':'ChmRmFocalPoint-dev'}] },
                            
							{'host':'dev-chm.cbd.int', 'realm' : 'CHM-DEV', 'roles':  [{'User':'User'},{'Administrator':'Administrator'},{'ChmNationalAuthorizedUser':'ChmNationalAuthorizedUser-dev'},{'ChmNationalFocalPoint':'ChmNationalFocalPoint-dev'},{'ChmAdministrator':'ChmAdministrator-dev'},{'ChmNrNationalAuthorizedUser':'ChmNrNationalAuthorizedUser-dev'},{'ChmRmNAU':'ChmRmNAU-dev'},{'ChmNrNationalFocalPoint':'ChmNrNationalFocalPoint-dev'},{'ChmRmFocalPoint':'ChmRmFocalPoint-dev'}] },,

                        ];



    app.value("realmConfiguration", realmConfigurations);

});
