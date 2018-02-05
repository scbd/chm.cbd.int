define(['app', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage'], function(app) {
  'use strict';

  app.factory('editFormUtility', ["IStorage", "IWorkflows", "$q", "realm", "$route", function(storage, workflows, $q, realm, $route) {

    var schemasWorkflowTypes = {
      "aichiTarget"               : { name: "publishReferenceRecord", version: undefined },
      "dossier"                   : { name: "publishReferenceRecord", version: undefined },
      "contact"                   : { name: "publishReferenceRecord", version: undefined },
      "caseStudy"                 : { name: "publishReferenceRecord", version: undefined },
      "marineEbsa"                : { name: "publishReferenceRecord", version: undefined },
      "strategicPlanIndicator"    : { name: "publishReferenceRecord", version: undefined },
      "resource"                  : { name: "publishReferenceRecord", version: undefined },
      "capacityBuildingInitiative": { name: "publishReferenceRecord", version: undefined },
      "organization"              : { name: "publishReferenceRecord", version: undefined },
      "lwCampaigns"               : { name: "publishReferenceRecord", version: undefined },
      "lwProject"                 : { name: "publishReferenceRecord", version: undefined },
      "lwDonor"                   : { name: "publishReferenceRecord", version: undefined },
      "event"                     : { name: "publishReferenceRecord", version: undefined },      
      "database"                  : { name: "publishNationalRecord", version: "0.4" },
      "implementationActivity"    : { name: "publishNationalRecord", version: "0.4" },
      "nationalIndicator"         : { name: "publishNationalRecord", version: "0.4" },
      "nationalReport"            : { name: "publishNationalRecord", version: "0.4" },
      "nationalSupportTool"       : { name: "publishNationalRecord", version: "0.4" },
      "nationalTarget"            : { name: "publishNationalRecord", version: "0.4" },
      "nationalAssessment"        : { name: "publishNationalRecord", version: "0.4" },
      "resourceMobilisation"      : { name: "publishNationalRecord", version: "0.4" },
      "resourceMobilisation2020"  : { name: "publishNationalRecord", version: "0.4" },      
      "nationalReport6"           : { name: "publishNationalRecord", version: "0.4" },
    };

    var _self = {

      //==================================
      //
      //==================================
      load: function(identifier, expectedSchema) {

        return storage.drafts.get(identifier, {
          info: ""
        }).then(
          function(success) {
            return success;
          },
          function(error) {
            if (error.status == 404)
              return storage.documents.get(identifier, {
                info: ""
              });
            throw error;
          }).then(
          function(success) {
            var info = success.data;

            if (expectedSchema && info.type != expectedSchema)
              throw {
                data: {
                  error: "Invalid schema type"
                },
                status: "badSchema"
              };

            var hasDraft = !!info.workingDocumentCreatedOn;
            var securityPromise = hasDraft ?
              storage.drafts.security.canUpdate(info.identifier, info.type) :
              storage.drafts.security.canCreate(info.identifier, info.type);

            return securityPromise.then(
              function(isAllowed) {
                if (!isAllowed)
                  throw {
                    data: {
                      error: "Not allowed"
                    },
                    status: "notAuthorized"
                  };

                var documentPromise = hasDraft ?
                  storage.drafts.get(identifier) :
                  storage.documents.get(identifier);

                return documentPromise.then(
                  function(success) {
                    return success.data;
                  });
              });
          });
      },

      //==================================
      //
      //==================================
      draftExists: function(identifier) {

        return storage.drafts.get(identifier, {
          info: ""
        }).then(function() {
          return true;
        }, function(error) {
          if (error.status == 404)
            return false;
          throw error;
        });
      },

      //==================================
      //
      //==================================
      saveDraft: function(document) {

        var identifier = document.header.identifier;
        var metadata = {};

        if (document.government)
          metadata.government = document.government.identifier;

        return _self.draftExists(identifier).then(
          function(hasDraft) {

            var securityPromise = hasDraft ?
              storage.drafts.security.canUpdate(identifier, document.header.schema, metadata) :
              storage.drafts.security.canCreate(identifier, document.header.schema, metadata);

            return securityPromise.then(
              function(isAllowed) {
                if (!isAllowed)
                  throw {
                    error: "Not authorized to save draft"
                  };

                return storage.drafts.put(identifier, document);
              });
          });
      },

      //==================================
      //
      //==================================
      documentExists: function(identifier) {

        return storage.documents.get(identifier).then(function() {
          return true;
        }, function(error) {
          if (error.status == 404)
            return false;
          throw error;
        });
      },


      //==================================
      //
      //==================================
      canPublish: function(document) {

        var identifier = document.header.identifier;
        var schema = document.header.schema;
        var metadata = {};

        if (document.government)
          metadata.government = document.government.identifier;

        // Check if document exists

        return _self.documentExists(identifier).then(function(exists) {

          // Check user security on document

          var qCanWrite = exists ? storage.documents.security.canUpdate(identifier, schema, metadata) :
            storage.documents.security.canCreate(identifier, schema, metadata);

          return qCanWrite;

        });
      },

      //==================================
      //
      //==================================
      publish: function(document) {

        var identifier = document.header.identifier;
        var schema = document.header.schema;
        var metadata = {};

        if (document.government)
          metadata.government = document.government.identifier;

        // Check if document exists

        return _self.documentExists(identifier).then(function(exists) {

          // Check user security on document

          var qCanWrite = exists ? storage.documents.security.canUpdate(identifier, schema, metadata) :
            storage.documents.security.canCreate(identifier, schema, metadata);

          return qCanWrite;

        }).then(function(canWrite) {

          if (!canWrite)
            throw {
              error: "Not allowed"
            };

          //Save document
          var processRequest;
          if ($route.current.params.workflowId) {
            // if the user is editing a locked record, remove the lock, update draft,
            // lock the draft and then update the workflow status.
            var metadata = {};
            processRequest = storage.drafts.locks.get(document.header.identifier, {
                lockID: ''
              })
              .then(function(lockInfo) {
                return storage.drafts.locks.delete(document.header.identifier, lockInfo.data[0].lockID)
                  .then(function() {
                    return storage.drafts.put(document.header.identifier, document);
                  })
                  .then(function(draftInfo) {
                    return storage.drafts.locks.put(document.header.identifier, {
                      lockID: lockInfo.data[0].lockID
                    });
                  }).then(function(draftInfo) {
                    console.log(draftInfo);

                  });
              })
              .then(function(data) {
                return workflows.updateActivity($route.current.params.workflowId, 'publishRecord', {
                  action: 'approve'
                })
              });
          } else {
            processRequest = storage.drafts.put(identifier, document).then(function(draftInfo) {
              return createWorkflow(draftInfo); // return workflow info
            }); //editFormUtility.publish(document);
          }
          return $q.when(processRequest);
        });
      },

      //==================================
      //
      //==================================
      publishRequest: function(document) {

        var identifier = document.header.identifier;
        var schema = document.header.schema;
        var metadata = {};

        if (document.government)
          metadata.government = document.government.identifier;

        // Check if doc & draft exists

        return _self.draftExists(identifier).then(function(exists) {

          // Check user security on drafts

          var qCanWrite = exists ?
            storage.drafts.security.canUpdate(identifier, schema, metadata) :
            storage.drafts.security.canCreate(identifier, schema, metadata);

          return qCanWrite;

        }).then(function(canWrite) {

          if (!canWrite)
            throw {
              error: "Not allowed"
            };

          //Save draft
          return storage.drafts.put(identifier, document);

        }).then(function(draftInfo) {
          return createWorkflow(draftInfo); // return workflow info
        });
      },


      //==================================
      //
      //==================================
      deleteDocument: function(document, additionalInfo) {

        var draftInfo = {
          identifier 				: document.identifier,
          documentID			 	: document.documentID,
          workingDocumentTitle	: document.title,
          workingDocumentSummary	: document.summary,
          workingDocumentMetadata	: document.metadata
        };
        var workflowType = {
          name : 'deleteRecord', version : "0.4"
        }	
        
        return createWorkflow(draftInfo, additionalInfo, workflowType); // return workflow info
    
      }
    };

    function createWorkflow(draftInfo, additionalInfo, type){
      if(!type)
         type = schemasWorkflowTypes[draftInfo.type];
  
      if(!type)
        throw "No workflow type defined for this record type: " + draftInfo.type;
  
      var workflowData = {
        "realm": realm,
        "documentID": draftInfo.documentID,
        "identifier": draftInfo.identifier,
        "title": draftInfo.workingDocumentTitle,
        "abstract": draftInfo.workingDocumentSummary,
        "metadata": draftInfo.workingDocumentMetadata,
        "additionalInfo": additionalInfo
      };

      return workflows.create(type.name, type.version, workflowData); // return workflow info
    }


    return _self;

  }]);

});
