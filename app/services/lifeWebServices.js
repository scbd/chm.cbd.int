/* jshint sub:true */

define(['app', 'lodash',"utilities/solr"], function (app,_) { 'use strict';

	app.factory('lifeWebServices',  ["$http", '$q','solr', function($http,$q,solr) {


		//============================================================
		//
		//
		//============================================================
		function formatIDQuery(ids) {

			if(!_.isArray(ids))return;
			var qParams='';

			_.each(ids, function (item) {
				qParams = qParams +'identifier_s:'+item.identifier+' OR ';
			});//_.each(ids

			return qParams;
		}// getEventTypes



		//============================================================
		//
		//
		//============================================================
		function getDonors(query) {
				if(query){
					var q= '(name_t:'+query+'* OR identifier_s:'+query+'*) AND schema_s:lwDonor)';
					var rows = 10;
				}
				else{
					var q= '(schema_s:lwDonor)';
					var rows = 500;
				}
				var  queryParameters = {
								'q': q,
								'fl': 'name_s,title_s, identifier_s',
								'wt': 'json',
								'start': 0,
								'rows': rows,
								'sort': 'name_s ASC',

				};


				//return defer;
				return $http.get('https://api.cbd.int/api/v2013/index/select', { params: queryParameters })
					.then(function (data) {

						if(rows==500){

							var tempData=[];
							_.each(data.data.response.docs,function (item,key){
								tempData.push({identifier:item.identifier_s,title:item.title_s,selected:0});
							});
							data.data.response.docs=tempData;
							return tempData;
						}
						return {'data':data.data.response.docs};
				});


		};// getEventTypes



		//============================================================
		//
		//
		//============================================================
		function getEventTypes(query) {
				return $http.get('/api/v2013/thesaurus/domains/ED902BF7-E9A8-42E8-958B-03B6899FCCA6/terms', {chache: true  }).then(function(data) {
						//dataResults = processData(data);
						return data;
				});// return
		};// getEventTypes



		//============================================================
		//
		//============================================================
		function getAichiTargets(query) {

			return $http.get('/api/v2013/thesaurus/domains/AICHI-TARGETS/terms', {chache: true  }).then(function(data) {

					var i = data.data.length;
					while (i--) {
						data.data[i].title_s = data.data[i].identifier+" "+data.data[i].name.replace(/\./g,' ').replace(/[0-9]/g, '');
						if( data.data[i].identifier == 'AICHI-TARGET-01' ||
							data.data[i].identifier == 'AICHI-TARGET-02' ||
							data.data[i].identifier == 'AICHI-TARGET-03' ||
							data.data[i].identifier == 'AICHI-TARGET-04' ||
							data.data[i].identifier == 'AICHI-TARGET-07' ||
							data.data[i].identifier == 'AICHI-TARGET-08' ||
							data.data[i].identifier == 'AICHI-TARGET-16' ||
							data.data[i].identifier == 'AICHI-TARGET-17' ||
							data.data[i].identifier == 'AICHI-TARGET-18' ||
							data.data[i].identifier == 'AICHI-TARGET-19' ||
							data.data[i].identifier == 'AICHI-TARGET-20'
						)
						data.data.splice(i,1);
					}

			return data;
			});// return
		};// getAichiTargets(query)



		/*****************************************************************
		* is an item already in the array
		*******************************************************************/
		function inArray(array,item) {
			var present = false;
			_.each(array, function (testItem) {
							if(item.identifier===testItem.identifier){
								present = 1;
							}//function
			})//angular.forEach
			return present;
		}//inArray



		//============================================================
		//
		//============================================================
		function getContributionsClimateChange() {
				     var deferred = $q.defer();
								deferred.resolve([
											{identifier: 'ecoservices1', title: 'Climate Change Mitigation' },
											{identifier: 'ecoservices2', title: 'Climate Change Adaptation'},
											{identifier: 'ecoservices3', title: 'Freshwater Security',},
											{identifier: 'ecoservices4', title: 'Food Security',},
											{identifier: 'ecoservices5', title: 'Human Health',},
											{identifier: 'ecoservices6', title: 'Cultural and Spiritual Access',},
											{identifier: 'ecoservices7', title: 'Income Generation',}
								]);
     			 return deferred.promise;
		};// getEventTypes



		//============================================================
		//
		//============================================================
		function getRoles() {
				     var deferred = $q.defer();
								deferred.resolve([
										{title: 'Community Engagement', identifier: 'community_engagement',},
										{title: 'Implementation', identifier: 'implementation',},
										{title: 'Monitoring', identifier: 'monitoring',},
										{title: 'Partner Coordination', identifier: 'partner_coordination',},
										{title: 'Project Management', identifier: 'project_management',},
										{title: 'Strategic Planning', identifier: 'strategic_planning',},
										{title: 'Technical Support', identifier: 'technical_support',},
										{title: 'Other', identifier: '5B6177DD-5E5E-434E-8CB7-D63D67D5EBED',},
									]);
     			 return deferred.promise;
		};// getEventTypes



		//============================================================
		//
		//============================================================
		function getCss() {
				     var deferred = $q.defer();
								deferred.resolve([
											{key: 'ecoservices1', title: 'Climate Change Mitigation', help: 'Please indicate information about <a translation-url href="https://www.cbd.int/doc/publications/cbd-value-nature-en.pdf">carbon sequestration and/or storage benefits</a> from this project. If specific figures are currently available, please include them here.', },
											{key: 'ecoservices2', title: 'Climate Change Adaptation', help: 'Please indicate information about <a translation-url href="http://adaptation.cbd.int/">climate change adaptation</a> benefits from this project, such as storm barriers, flood control, protection against sea level rise, enabling specific mobility in the face of climate change, etc.',},
											{key: 'ecoservices3', title: 'Freshwater Security',},
											{key: 'ecoservices4', title: 'Food Security',},
											{key: 'ecoservices5', title: 'Human Health',},
											{key: 'ecoservices6', title: 'Cultural and Spiritual Access',},
											{key: 'ecoservices7', title: 'Income Generation',},
										]);
     			 return deferred.promise;
		};// getEventTypes



		/*****************************************************************
		* returns promise
		*******************************************************************/
		function getAichiDescription(id){
					var aichiDescriptions = {
							'AICHI-TARGET-05': {title: "Aichi Target 5", key: "aichi_5", help: "By 2020, the rate of loss of all natural habitats, including forests, is at least halved and where feasible brought close to zero, and degradation and fragmentation is significantly reduced.",link:'https://www.cbd.int/doc/strategic-plan/targets/T5-quick-guide-en.pdf'},
							'AICHI-TARGET-06': {title: "Aichi Target 6", key: "aichi_6", help: "By 2020, all fish and invertebrate stocks and aquatic plants are managed and harvested sustainably, legally and applying ecosystem based approaches, so that overfishing is avoided, recovery plans and measures are in place for all depleted species, fisheries have no significant adverse impacts on threatened species and vulnerable ecosystems and the impacts of fisheries on stocks, species and ecosystems are within safe ecological limits.", link:'https://www.cbd.int/doc/strategic-plan/targets/T6-quick-guide-en.pdf'},
							'AICHI-TARGET-09': {title: "Aichi Target ", key: "aichi_9", help: "By 2020, invasive alien species and pathways are identified and prioritized, priority species are controlled or eradicated, and measures are in place to manage pathways to prevent their introduction and establishment.",link:"https://www.cbd.int/doc/strategic-plan/targets/T9-quick-guide-en.pdf"},
							'AICHI-TARGET-10': {title: "Aichi Target 10", key: "aichi_10", help: "By 2015, the multiple anthropogenic pressures on coral reefs, and other vulnerable ecosystems impacted by climate change or ocean acidification are minimized, so as to maintain their integrity and functioning. ",link:'https://www.cbd.int/doc/strategic-plan/targets/T10-quick-guide-en.pdf'},
							'AICHI-TARGET-11': {title: "Aichi Target 11", key: "aichi_11", help: "By 2020, at least 17 percent of terrestial and inland water, and 10 percent of coastal and marine areas, especially areas of particular importane for biodiversity and ecosystem services, are conserved through effectively and equitably managed, ecologically representative and well-connected systems of protected areas and other effective area-based conservation measures, and integrated into the wider landscapes and seascapes.", link:'https://www.cbd.int/doc/strategic-plan/targets/T11-quick-guide-en.pdf'},
							'AICHI-TARGET-12': {title: "Aichi Target 12", key: "aichi_12", help: "By 2020, the extinction of known threatened species has been prevented and their conservation status, particularly of those most in decline, has been improved and sustained.",link:"https://www.cbd.int/doc/strategic-plan/targets/T12-quick-guide-en.pdf"},
							'AICHI-TARGET-13': {title: "Aichi Target 13", key: "aichi_13", help: "By 2020, the genetic diversity of cultivated plants and farmed and domesticated animals and of wild relatives, including other socio-economically as well as culturally valuable species, is maintained, and strategies have been developed and implemented for minimizing genetic erosion and safeguarding their genetic diversity.",link:"https://www.cbd.int/doc/strategic-plan/targets/T13-quick-guide-en.pdf"},
							'AICHI-TARGET-14': {title: "Aichi Target 14", key: "aichi_14", help: "By 2020, ecosystems that provide essential services, including services related to water, and contribute to health, livelihoods and well-being, are restored and safeguarded, taking into account the needs of women, indigenous and local communities,and the poor and vulnerable.",link:"https://www.cbd.int/doc/strategic-plan/targets/T14-quick-guide-en.pdf"},
							'AICHI-TARGET-15': {title: "Aichi Target 15", key: "aichi_15", help: "By 2020, ecosystem resilience and the contribution of biodiversity to carbon stocks has been enhanced, through conservation and restoration, including restoration of at least 15 percent of degraded ecosystems, thereby contributing to climate change mitigation and adaptation and to combating desertification.",link:"https://www.cbd.int/doc/strategic-plan/targets/T15-quick-guide-en.pdf"},
							'AICHI-TARGET-OTHER': {title: "Contribution to other Aichi Targets", key: "5B6177DD-5E5E-434E-8CB7-D63D67D5EBED", help: "Please describe contributions to any other Aichi Targets"},
							};
					return aichiDescriptions[id];
		} //



		//============================================================
		// s
		//
		//============================================================
		function getCountries(query) {


					return $http.get('/api/v2013/thesaurus/domains/countries/terms', { cache: true }).then(function(data) {
							return data;
					});// return

		};// getCountries



		//============================================================
		//
		//
		//============================================================
		function getProjects(query) {

			var  queryParameters = {
							'q': '(title_t:'+query+'* OR identifier_s:'+query+'*) AND schema_s:lwProject',
							//'q' : '(title_t:"' + query + '*") AND schema_s:lwProject',
							'fl': 'title_s, identifier_s',
							'wt': 'json',
							'start': 0,
							'rows': 10,

							//'cb': new Date().getTime()
			};


			//return defer;
			return $http.get('https://api.cbd.int/api/v2013/index/select', { params: queryParameters })
				.then(function (data) {

					return {'data':data.data.response.docs};

				});
		};// getProjects



		//============================================================
		//
		//
		//============================================================
		function getFeaturedProjects() {

			var  queryParameters = {
							'q': '( schema_s:lwProject AND featured_d:[* TO *])',
							//'q' : '(title_t:"' + query + '*") AND schema_s:lwProject',
							'fl': 'featured_d',
							'wt': 'json',
							'start': 0,
							'rows': 6,

							//'cb': new Date().getTime()
			};


			//return defer;
			return $http.get('https://api.cbd.int/api/v2013/index/select', { params: queryParameters })
				.then(function (data) {

					return {'data':data.data.response.docs};

				});
		};// getProjects



		//============================================================
		//
		//
		//============================================================
		function getOrganizations(query) {

			var  queryParameters = {
							'q': '(title_t:'+query+'* OR identifier_s:'+query+'*) AND schema_s:organization',
							'fl': 'title_s, identifier_s',
							'wt': 'json',
							'start': 0,
							'rows': 10,
			};
			//return defer;
			return $http.get('https://api.cbd.int/api/v2013/index/select', { params: queryParameters })
				.then(function (data) {
					return {'data':data.data.response.docs};
				});
		};// getOrganizations



		return {
			getEventTypes : getEventTypes,
			getCountries : getCountries,
			getProjects : getProjects,
			getOrganizations:getOrganizations,
			getAichiTargets:getAichiTargets,
			getAichiDescription:getAichiDescription,
			getContributionsClimateChange:getContributionsClimateChange,
			getRoles:getRoles,
			getDonors:getDonors,
			inArray:inArray,
			getFeaturedProjects:getFeaturedProjects,
		};


	}]);//app factory
}); //define
