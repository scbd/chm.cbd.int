﻿angular.module('kmApp')

.factory('editFormUtility', ["IStorage", "IWorkflows", "$q", "realm", function(storage, workflows, $q, realm) {

	var schemasWorkflowTypes  = {
		"aichiTarget"            : { name : "publishReferenceRecord", version : undefined },
		"contact"                : { name : "publishReferenceRecord", version : undefined },
		"caseStudy"              : { name : "publishReferenceRecord", version : undefined },
		"marineEbsa"             : { name : "publishReferenceRecord", version : undefined },
		"strategicPlanIndicator" : { name : "publishReferenceRecord", version : undefined },
		"resource"               : { name : "publishReferenceRecord", version : undefined },
		"organization"           : { name : "publishReferenceRecord", version : undefined },

		"database"               : { name : "publishNationalRecord", version : "0.4" },
		"implementationActivity" : { name : "publishNationalRecord", version : "0.4" },
		"nationalIndicator"      : { name : "publishNationalRecord", version : "0.4" },
		"nationalReport"         : { name : "publishNationalRecord", version : "0.4" },
		"nationalSupportTool"    : { name : "publishNationalRecord", version : "0.4" },
		"nationalTarget"         : { name : "publishNationalRecord", version : "0.4" },
		"progressAssessment"     : { name : "publishNationalRecord", version : "0.4" },
		"resourceMobilisation"   : { name : "publishNationalRecord", version : "0.4" }
	};

	var _self = {

		//==================================
		//
		//==================================
		load: function(identifier, expectedSchema) {

			return storage.drafts.get(identifier, { info: "" }).then(
				function(success) {
					return success;
				},
				function(error) {
					if (error.status == 404)
						return storage.documents.get(identifier, { info: "" });
					throw error;
				}).then(
				function(success) {
					var info = success.data;

					if (expectedSchema && info.type!=expectedSchema)
						throw { data: { error: "Invalid schema type" }, status:"badSchema"}

					var hasDraft = !!info.workingDocumentCreatedOn;
					var securityPromise = hasDraft
						? storage.drafts.security.canUpdate(info.identifier, info.type)
						: storage.drafts.security.canCreate(info.identifier, info.type);

					return securityPromise.then(
						function(isAllowed) {
							if (!isAllowed)
								throw { data: { error: "Not allowed" }, status: "notAuthorized" };

							var documentPromise = hasDraft
								? storage.drafts.get(identifier)
								: storage.documents.get(identifier);

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

			return storage.drafts.get(identifier, { info: "" }).then(function(success) {
				return true;
			},function(error) {
				if (error.status == 404)
					return false
				throw error;
			});
		},

		//==================================
		//
		//==================================
		saveDraft: function(document) {

			var identifier = document.header.identifier;
			var schema     = document.header.schema;
			var metadata   = {};

			if (document.government)
				metadata.government = document.government.identifier;

			return _self.draftExists(identifier).then(
				function(hasDraft) {

					var securityPromise = hasDraft
						? storage.drafts.security.canUpdate(identifier, document.header.schema, metadata)
						: storage.drafts.security.canCreate(identifier, document.header.schema, metadata);

					return securityPromise.then(
						function(isAllowed) {
							if (!isAllowed)
								throw { error: "Not authorized to save draft" };

							return storage.drafts.put(identifier, document);
						});
				});
		},

		//==================================
		//
		//==================================
		documentExists: function(identifier) {

			return storage.documents.get(identifier, { info: "" }).then(function(success) {
				return true;
			},function(error) {
				if (error.status == 404)
					return false
				throw error;
			});
		},

		//==================================
		//
		//==================================
		publish: function(document) {
debugger;

			var identifier = document.header.identifier;
			var schema     = document.header.schema;
			var metadata   = {};

			if (document.government)
				metadata.government = document.government.identifier;

			// Check if document exists

			return _self.documentExists(identifier).then(function(exists) {

				// Check user security on document

				var qCanWrite = exists
							  ? storage.documents.security.canUpdate(identifier, schema, metadata)
							  : storage.documents.security.canCreate(identifier, schema, metadata);

				return qCanWrite;

			}).then(function(canWrite) {

				if(!canWrite)
					throw { error : "Not allowed" };

				//Save document

				return storage.documents.put(identifier, document);	// return documentInfo
			});
		},

		//==================================
		//
		//==================================
		publishRequest: function(document) {
debugger;
			var identifier = document.header.identifier;
			var schema     = document.header.schema;
			var metadata   = {};

			if (document.government)
				metadata.government = document.government.identifier;

			// Check if doc & draft exists

			return _self.draftExists(identifier).then(function(exists) {

				// Check user security on drafts

				var qCanWrite = exists
						? storage.drafts.security.canUpdate(identifier, schema, metadata)
						: storage.drafts.security.canCreate(identifier, schema, metadata);

				return qCanWrite

			}).then(function(canWrite) {

				if(!canWrite)
					throw { error : "Not allowed" };

				//Save draft 
				return storage.drafts.put(identifier, document);

			}).then(function(draftInfo) {

				var type = schemasWorkflowTypes[draftInfo.type];

				if(!type)
					throw "No workflow type defined for this record type: " + draftInfo.type;

				var workflowData = { 
					"realm"      : realm, 
					"identifier" : draftInfo.identifier, 
					"title"      : draftInfo.workingDocumentTitle,
					"abstract"   : draftInfo.workingDocumentSummary,
					"metadata"   : draftInfo.workingDocumentMetadata
				};

				return workflows.create(type.name, type.version, workflowData); // return workflow info
			});
		}
	}

	return _self;

}])

