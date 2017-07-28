var _ = require('../../libs/lodash/lodash.min');
var request = require('request');
var when = require('../../libs/when/when');

var thesaurus = function() {

	var self = this;

  	//============================================================
	//
	//
	//============================================================
	this.getTerms = function (domain) {

		var deferred = when.defer();

		request( { method: 'GET', uri: 'https://absch.local/api/v2013/thesaurus/domains/'+encodeURIComponent(domain)+'/terms', json: true }, function (error, response, body) {
			return  (error || response.statusCode != 200) ? deferred.reject(error) : deferred.resolve(body);
		});

		return deferred.promise;
	};

	//============================================================
	//
	//
	//============================================================
	this.getTerm = _.memoize(function (term) {

		// if(term=="5E833A3F-87D1-4ADD-8701-9F1B76383017") term = "7CAC5B93-7E27-441F-BFEB-9E416D48B1BE"; // For commercial purposes
		// if(term=="60EA2F49-A9DD-406F-921A-8A1C9AA8DFDD") term = "A7769659-17DB-4ED4-B1CA-A3ADD9CBD3A4"; // For commercial purposes

		console.log('info: loading term ' + term);

		var termRow = _.findWhere(self.localTerms, { identifier: term });

		if(termRow) termRow.expandedRelatedTerms = [termRow.identifier];

		if(!termRow) {

			var deferred = when.defer();

			request( { method: 'GET', uri: 'http://chm.cbd.int/api/v2013/thesaurus/terms/'+encodeURIComponent(term)+'?relations', json: true }, function (error, response, body) {
				return (error || response.statusCode != 200) ? deferred.reject(error||body) : deferred.resolve(body);
			});

			termRow = deferred.promise;
		}

		return when(termRow, function(termRow) {

			var symbol   = termRow.identifier;
			var symbols  = termRow.expandedRelatedTerms;
			var title_ar = termRow.title.ar;
			var title_en = termRow.title.en;
			var title_es = termRow.title.es;
			var title_fr = termRow.title.fr;
			var title_ru = termRow.title.ru;
			var title_zh = termRow.title.zh;

			if(!title_en) title_en = title_es;
			if(!title_en) title_en = title_fr;

			if(!title_ar) title_ar = title_en;
			if(!title_es) title_es = title_en;
			if(!title_fr) title_fr = title_en;
			if(!title_ru) title_ru = title_en;
			if(!title_zh) title_zh = title_en;

			return {
				s: symbol,
				ss: symbols,
				CAR_s: JSON.stringify({ symbol: symbol, ar: title_ar }),
				CEN_s: JSON.stringify({ symbol: symbol, en: title_en }),
				CES_s: JSON.stringify({ symbol: symbol, es: title_es }),
				CFR_s: JSON.stringify({ symbol: symbol, fr: title_fr }),
				CRU_s: JSON.stringify({ symbol: symbol, ru: title_ru }),
				CZH_s: JSON.stringify({ symbol: symbol, zh: title_zh }),
				AR_t: title_ar,
				EN_t: title_en,
				ES_t: title_es,
				FR_t: title_fr,
				RU_t: title_ru,
				ZH_t: title_zh,
				title: { ar: title_ar, en: title_en, es: title_es, fr: title_fr, ru: title_ru, zh: title_zh }
			};
		}).otherwise(function(error) {
			console.log("Error loading term: '"+term+"'");
			return null;
			//throw error
		});
	});

	this.localTerms = [
		{ identifier: 'resource'				, title: { en: 'Virtual Library Resource' } },
		{ identifier: 'authority'				, title: { en: 'Competent National Authority' } },
		{ identifier: 'database'				, title: { en: 'National Database' } },
		{ identifier: 'measure'					, title: { en: 'National Measure' } },
		{ identifier: 'absCheckpoint'			, title: { en: 'Checkpoint' } },
		{ identifier: 'absCheckpointCommunique'	, title: { en: 'Checkpoint Communiqué' } },
		{ identifier: 'absPermit'				, title: { en: 'Permit' } },
		{ identifier: 'notification'			, title: { en: 'Notification' } },
		{ identifier: 'meetingDocument'			, title: { en: 'Meeting Document' } },
		{ identifier: 'pressRelease'			, title: { en: 'Press Release' } },
		{ identifier: 'statement'				, title: { en: 'Statement' } },
		{ identifier: 'meeting'					, title: { en: 'Meeting' } },
		{ identifier: 'event'					, title: { en: 'Event' } },
		{ identifier: 'decision'				, title: { en: 'Decision' } },
		{ identifier: 'recommendation'			, title: { en: 'Recommendations' } },
	//	{ identifier: 'CBD', title: { en: 'Convention on Biological Diversity' } },
	//	{ identifier: 'COP', title: { en: 'Conference of the Parties to the Convention on Biological Diversity' } },
		{ identifier: 'marineEbsa'				, title: { en: 'Marine EBSA' } },
		{ identifier: 'meetingDocument'			, title: { en: 'Meeting Document' } },
		{ identifier: 'nationalTarget'			, title: { en: 'National Target' } },
		{ identifier: 'nationalIndicator'		, title: { en: 'National Indicator' } },
		{ identifier: 'strategicPlanIndicator'	, title: { en: 'Strategic Plan Indicator' } },
		{ identifier: 'aichiTarget'				, title: { en: 'Aichi Biodiversity Target' } },
		{ identifier: 'implementationActivity'	, title: { en: 'Implementation Activity' } },
		{ identifier: 'nationalAssessment'		, title: { en: 'Progress Assessment' } },
		{ identifier: 'nationalReport'			, title: { en: 'National Report' } },
		{ identifier: 'organization'			, title: { en: 'ABS Related Organization' } },
		{ identifier: 'announcement'			, title: { en: 'Announcement' } },
		{ identifier: 'article'					, title: { en: 'Treaty Article' } },
		{ identifier: 'nationalSupportTool'		, title: { en: 'Guidance and Support Tools' } },
		{ identifier: 'caseStudy'				, title: { en: 'Case Study' } },
		{ identifier: 'resourceMobilisation'	, title: { en: 'Financial Reporting Framework: Reporting on baseline and progress towards 2015' } },
		{ identifier: 'resourceMobilisation2020', title: { en: 'Financial Reporting Framework: Reporting on progress towards 2020' } },
		{ identifier: 'dossier'					, title: { en: 'Aichi Target Dossier' } },

		{ identifier: 'XXVII8' , title: { en: 'Convention on Biological Diversity' } },
		{ identifier: 'XXVII8a', title: { en: 'Cartagena Protocol on Biosafety to the Convention on Biological Diversity' } },
		{ identifier: 'XXVII8b', title: { en: 'Nagoya Protocol on Access to Genetic Resources and the Fair and Equitable Sharing of Benefits Arising from their Utilization to the Convention on Biological Diversity' } },
		{ identifier: 'XXVII8c', title: { en: 'Nagoya - Kuala Lumpur Supplementary Protocol on Liability and Redress to the Cartagena Protocol on Biosafety' } },

		{ identifier: 'XXVII8-COP' 		, title: { en: 'Conference of the Parties to the Convention on Biological Diversity' } },
		{ identifier: 'XXVII8-SBSTTA' 	, title: { en: 'Subsidiary Body on Scientific, Technical and Technological Advice' } },
		{ identifier: 'XXVII8-WGRI' 	, title: { en: 'Ad Hoc Open-ended Working Group on the Review of Implementation of the Convention' } },
	 	{ identifier: 'XXVII8b-ICCP' 	, title: { en: 'Intergovernmental Committee for the Cartagena Protocol on Biosafety' } },
	 	{ identifier: 'XXVII8b-MOP' 	, title: { en: 'Conference of the Parties serving as the Meeting of the Parties (COP-MOP) to the Cartagena Protocol on Biosafety' } },
	 	{ identifier: 'XXVII8c-ICNP' 	, title: { en: 'Open-ended Ad Hoc Intergovernmental Committee for the Nagoya Protocol on ABS' } },

	 	{ identifier: 'CHM-FP'   , title: { en: 'Clearing-House Mechanism National Focal Point' } },
		{ identifier: 'CBD-FP1'  , title: { en: 'CBD National Focal Point' } },
		{ identifier: 'CBD-FP2'  , title: { en: 'CBD Secondary National Focal Point' } },
		{ identifier: 'GTI-FP'   , title: { en: 'Global Taxonomy Initiative National Focal Point' } },
		{ identifier: 'SBSTTA-FP', title: { en: 'SBSTTA Focal Point' } },
		{ identifier: 'TKBD-FP'  , title: { en: 'Traditional Knowledge National Focal Point' } },
		{ identifier: 'RM-FP'    , title: { en: 'Resource Mobilization Focal Point' } },
		{ identifier: 'ABS-IC'   , title: { en: 'National Focal Point to the Intergovernmental Committee for the Nagoya Protocol on ABS' } },
		{ identifier: 'NP-FP'    , title: { en: 'National Focal Point for the Nagoya Protocol on ABS' } },
		{ identifier: 'ABS-FP'   , title: { en: 'National Focal Point for the Nagoya Protocol on ABS' } },
		{ identifier: 'GSPC-FP'  , title: { en: 'Global Strategy for Plant Conservation National Focal Point' } },
		{ identifier: 'PA-FP'    , title: { en: 'Programme of Work on Protected Areas National Focal Point' } },
		{ identifier: 'BCH-FP'   , title: { en: 'BCH National Focal Point' } },
		{ identifier: 'CPB-FP1'  , title: { en: 'Cartagena Protocol National Focal Point' } },
		{ identifier: 'CPB-FP2'  , title: { en: 'Cartagena Protocol Secondary National Focal Point' } },
		{ identifier: 'lwProject', title: { en: 'Life Web Project' } },
		{ identifier: 'lwEvent', title: { en: 'Life Web Event' } },
		{ identifier: 'lwDonor', title: { en: 'Life Web Donor' } }
	];


	//============================================================
	//
	//
	//============================================================
	this.mapTerm = function (documents, key) {

		var terms = when.map(documents, function (document) { return document[key]; }).then(_.flatten).then(_.compact).then(_.uniq);

		return when.map(terms, function (term) { return self.getTerm(term); });
	}
};

module.exports = new thesaurus();
