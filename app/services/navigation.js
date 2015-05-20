// FROM https://github.com/angular/angular.js/blob/v1.1.4/src/ng/directive/ngView.js
define(['app', 'lodash'], function(app, _) { 'use strict';

    app.value("realm", "CHM");
    app.value("schemaTypes", ["aichiTarget", "contact", "caseStudy", "database", "implementationActivity", "marineEbsa", "nationalIndicator", "nationalReport", "nationalSupportTool", "nationalTarget", "organization", "progressAssessment", "resource", "resourceMobilisation", "strategicPlanIndicator"]);
    app.value("siteMapUrls", { //legacy

        management: {
            home: "/management",
            drafts: "/management/my-drafts",
            records: "/management/my-records",
            workflows: "/management"
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

            if (schema == "focalPoint") return "National Focal Point";
            if (schema == "authority") return "Competent National Authority";
            if (schema == "caseStudy") return "Case Study";
            if (schema == "contact") return "Contact";
            if (schema == "database") return "National Database";
            if (schema == "resource") return "Virtual Library Resource";
            if (schema == "organization") return "Organization";
            if (schema == "measure") return "National Regulation";
            if (schema == "marineEbsa") return "Ecologically or Biologically Significant Areas (EBSAs)";
            if (schema == "aichiTarget") return "Aichi Target";
            if (schema == "strategicPlanIndicator") return "Strategic Plan Indicator";
            if (schema == "nationalIndicator") return "National Indicator";
            if (schema == "nationalTarget") return "National Target";
            if (schema == "progressAssessment") return "Progress Assessment";
            if (schema == "nationalReport") return "National Report";
            if (schema == "implementationActivity") return "Implementation Activity";
            if (schema == "nationalSupportTool") return "Guidance and Support Tools";
            if (schema == "resourceMobilisation") return "Resource Mobilisation";
            if (schema == "absCheckpoint") return "Checkpoint";
            if (schema == "absCheckpointCommunique") return "Checkpoint Communiqué";
            if (schema == "absPermit") return "Permit";

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

            editUrl : function(schema, uid){

                var url = '/submit/';

                if(_(['nationalReport', 'nationalTarget', 'nationalIndicator', 'progressAssessment', 'nationalSupportTool', 'implementationActivity']).contains(schema)) {
                    url = '/submit/online-reporting/';
                }

                url += schema + '/' + (uid || 'new');

                return url;
            },

            //======================================================
            //
            //
            //======================================================
            toLocalUrl : function toLocalUrl(url) {
                
                if(_(url).startsWith("http://chm.cbd.int/" )) url = url.substr("http://chm.cbd.int" .length);
                if(_(url).startsWith("https://chm.cbd.int/")) url = url.substr("https://chm.cbd.int".length);

                return url;
            }

        };
    }]);

});
