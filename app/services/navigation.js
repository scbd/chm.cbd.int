// FROM https://github.com/angular/angular.js/blob/v1.1.4/src/ng/directive/ngView.js
define(['app', 'lodash', 'providers/realm'], function(app, _) { 'use strict';

    app.value("schemaTypes", ["aichiTarget", "contact", "caseStudy", "database", "implementationActivity", "marineEbsa", "nationalIndicator", "nationalReport", "nationalSupportTool", "nationalTarget", "organization", "nationalAssessment", "resource", "capacityBuildingInitiative", "resourceMobilisation", "resourceMobilisation2020", "strategicPlanIndicator"]);
    app.value("siteMapUrls", { //legacy

        management: {
            home: "/submit",
            drafts: "/submit/my-drafts",
            records: "/submit/my-records",
            workflows: "/submit"
        },

        errors: {
            notFound: "/help/404",
            notAuthorized: "/help/403"
        },

        user: {
            signIn: "/signin",
            signUp: "/user/sign-up",
            account: "/user/my-account"
        }
    });


    //============================================================
    //
    //============================================================
    app.filter('schemaName', function () {
        return function (schema) {
            if(!schema)
                return;

            if (schema == "focalPoint")                 return "National Focal Point";
            if (schema == "caseStudy")                  return "Case Study";
            if (schema == "resource")                   return "Virtual Library Resource";
            if (schema == "organization")               return "Organization";
            if (schema == "marineEbsa")                 return "Ecologically or Biologically Significant Areas (EBSAs)";
            if (schema == "aichiTarget")                return "Aichi Target";
            if (schema == "strategicPlanIndicator")     return "Strategic Plan Indicator";
            if (schema == "nationalIndicator")          return "National Indicator";
            if (schema == "nationalTarget")             return "National Target";
            if (schema == "nationalAssessment")         return "Progress Assessment";
            if (schema == "nationalReport")             return "National Report";
            if (schema == "implementationActivity")     return "Implementation Activity";
            if (schema == "nationalSupportTool")        return "Guidance and Support Tools";
            if (schema == "resourceMobilisation")       return "Financial Reporting Framework: Reporting on baseline and progress towards 2015";
            if (schema == "resourceMobilisation2020")   return "Financial Reporting Framework: Reporting on progress towards 2020";
            if (schema == "lwProject")                  return "LifeWeb Projects";
            if (schema == "lwEvent")                    return "LifeWeb Events";
            if (schema == "lwDonor")                    return "LifeWeb Donors";
            if (schema == "dossier")                    return "Aichi Target Dossiers";
            if (schema == "undbAction")                 return "UNDB Action (United Nations Decade on Biodiversity) -depreciated please use Event)" ;
            if (schema == "undbPartner")                return "UNDB Partner (United Nations Decade on Biodiversity) -depreciated please use Actor";
            if (schema == "bbiRequest")                 return "Request for Assistance (Bio-Bridge Initiative)";
            if (schema == "bbiProfile")                 return "Provider of Assistance (Bio-Bridge Initiative)";
            if (schema == "bbiOpportunity")             return "Opportunity (Bio-Bridge Initiative)";
            if (schema == "bbiContact")                 return "Contact (Bio-Bridge Initiative)";
            if (schema == "undbActor")                  return "Actor (United Nations Decade on Biodiversity)";
            if (schema == "undbParty")                  return "Country Profile (United Nations Decade on Biodiversity)";

            if (schema == "event") return "Event";
            if (schema == "nationalReport6") return "Sixth National Report";

            if(schema.toLowerCase()=="focalpoint"				  ) return "ABS National Focal Point";
      		if(schema.toLowerCase()=="authority"				  ) return "Competent National Authority";
      		if(schema.toLowerCase()=="contact"					  ) return "Contact";
      		if(schema.toLowerCase()=="database"					  ) return "National Website or Database";
      		if(schema.toLowerCase()=="resource"					  ) return "Virtual Library Resource";
      		if(schema.toLowerCase()=="organization"				  ) return "Organization";
      		if(schema.toLowerCase()=="measure" 					  ) return "Legislative, Administrative or Policy Measure";
      		if(schema.toLowerCase()=="abscheckpoint"			  ) return "Checkpoint";
      		if(schema.toLowerCase()=="abscheckpointcommunique"	  ) return "Checkpoint Communiqué";
      		if(schema.toLowerCase()=="abspermit"				  ) return "Internationally Recognized Certificate of Compliance";
            if(schema.toLowerCase()=="meetingdocument"			  ) return "Meeting Document";
            if(schema.toLowerCase()=="pressrelease"				  ) return "Press Release";
      		if(schema.toLowerCase()=="news"						  ) return "News";
      		if(schema.toLowerCase()=="new"						  ) return "What's New";
            if(schema.toLowerCase()=="statement"			      ) return "Statement";
            if(schema.toLowerCase()=="absnationalreport"		  ) return "Interim National Report on the Implementation of the Nagoya Protocol";
            if(schema.toLowerCase()=="modelcontractualclause"	  ) return "Model Contractual Clauses, Codes of Conduct, Guidelines, Best Practices and/or Standard";
            if(schema.toLowerCase()=="communityprotocol"		  ) return "Community Protocol and Procedures and Customary Law";
            if(schema.toLowerCase()=="meeting"					  ) return "Meeting";
            if(schema.toLowerCase()=="notification"				  ) return "Notification";
            if(schema.toLowerCase()=="capacitybuildinginitiative" ) return "Capacity-building Initiative";
            if(schema.toLowerCase()=="capacitybuildingresource"   ) return "Capacity-building Resource";


            return (schema || "") + "*";
        };
    });

    app.service("navigation", ["$q", "$location", "$timeout", "authentication", "siteMapUrls", function ($q, $location, $timeout, authentication, siteMapUrls) {

        return {
            securize: function (roles) {
                return authentication.getUser().then(function (user) {

                    if (!user.isAuthenticated) {

                        console.log("securize: force sign in");

                        if (!$location.search().returnUrl)
                            $location.search({ returnUrl: $location.url() });

                        $location.path(siteMapUrls.user.signIn);

                    }
                    else if (roles && !_.isEmpty(roles) && _.isEmpty(_.intersection(roles, user.roles))) {

                        console.log("securize: not authorized");

                        $location.search({ path: $location.url() });
                        $location.path(siteMapUrls.errors.notAuthorized);
                    }

                    return user;
                });
            },

            editUrl : function(schema, uid, type){

                var url = '/submit/';

                if(_(['nationalReport', 'resourceMobilisation', 'resourceMobilisation2020']).contains(schema)) {
                    url = '/submit/';
                }

                if(_(['nationalTarget', 'nationalIndicator', 'nationalAssessment']).contains(schema)) {
                    url = '/submit/online-reporting/';
                }

                url += schema + '/' + (uid || 'new');

                if(type)
                    url += "?type=" + type;

                return url;
            },

            //======================================================
            //
            //
            //======================================================
            toLocalUrl : function toLocalUrl(url) {

                if(url){
                    url = url.replace(/^http(s)?:\/\/chm.cbd.int/, '')
                    url = url.replace(/^http(s)?:\/\/chm.cbddev.xyz/, '')
                    url = url.replace(/^http(s)?:\/\/chm-training.cbd.int/, '')
                }
                return url;
            }

        };
    }]);

});
