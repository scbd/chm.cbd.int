define(['lodash', 'directives/management/register-facets', 'authentication', "directives/formats/views/form-loader",
 'utilities/km-workflows', 'utilities/km-storage', 'utilities/km-utilities', 'utilities/solr',
 'scbd-angularjs-services/locale'], function(_) { 'use strict';

return [ "$scope", "$timeout", "$http", "$route", "$location", "IStorage", "IWorkflows", "authentication", "solr", "$q", "locale",
function ($scope, $timeout, $http, $route, $location, IStorage, IWorkflows, authentication, solr, $q, locale)
{
	function load() {

		var workflowID   = $route.current.params.id;
		//var activityName = $route.current.params.activity;
		IWorkflows.get(workflowID).then(function(workflow){
			var activity;

			if(!!!(workflow)){
				$http.get("/api/v2016/bbi-requests/"+workflowID).then(
					function(resp){
						$scope.workflow=_.clone(resp.data);
						$scope.workflow.type={};
						$scope.workflow.type.name='publishReferenceRecord';
						$scope.workflow.schema="bbiRequest";
						$scope.activity={};
						$scope.activity.name='publishRecord';
						$scope.activity.schema='bbiRequest';
						$scope.document=_.clone(resp.data);
						$scope.document.header={};
						$scope.document.header.schema="bbiRequest";
						return resp.data;
						return $location.path('/help/404');
					});

			}else{

					if(workflow.closedOn)
						activity = _.last(workflow.activities)
					else
						activity = _.find(workflow.activities, function(activity){ return !activity.closedOn});

					if(!activity)
						return $location.path('/management/requests/'+$route.current.params.id);

					if(workflow.data.identifier && !workflow.closedOn) {
							IStorage.drafts.get(workflow.data.identifier).then(function(result){
								$scope.document = result.data || result;
								// if($scope.isAssignedToMe(activity)){
									verifyDependentRecordStatus(activity, $scope.document)
								// }
							});
					}
					else
						IStorage.documents.get(workflow.data.identifier).then(function(result){
							$scope.document = result.data || result;
						});

					$scope.workflow = workflow;
					$scope.activity = activity;
			}
		});
	}

	//==================================================
	//
	//
	//==================================================
	$scope.updateActivity = function(resultData) {
		if($scope.activity.schema==='bbiRequest')
		{
			if(resultData.action==='approve'){
					delete($scope.document.header);
					$scope.document.meta.status='public';

				  return $http.put("/api/v2016/bbi-requests/"+$route.current.params.id,$scope.document).then(
						function(resp){

						$location.url("/management/requests/"+$scope.workflow._id+'?schema=bbiRequest');
						return resp.data;
					}).catch(function(err){
						alert('Failed to aprove document');
						$scope.error=err;
					});
			}

		}
		IWorkflows.updateActivity($scope.workflow._id, $scope.activity.name, resultData).then(function(){

			$location.url("/management/requests/"+$scope.workflow._id);

		}).catch(function(error) {
			alert('no activity found',error);
			$scope.error=error;
		});
	};

	//==================================================
	//
	//
	//==================================================
	$scope.isAssignedToMe = function(activity) {
		if(activity.schema==='bbiRequest')
			return (!!_.intersection(authentication.user().roles, ["Administrator","ChmAdministrator", "BBiAdministrator","ChmDocumentValidationTeamMember"]).length);
		else
			return activity && _.contains(activity.assignedTo||[], authentication.user().userID||-1);

	};

	//==================================================
	//
	//
	//==================================================
	$scope.isOpen = function(element) {
		return !element.closedOn;
	};

	//==============================
	//
	//==============================
	$scope.formatWID = function (workflowID) {
		if(!workflowID)
			return '';
		return workflowID.replace(/(?:.*)(.{3})(.{4})$/g, "W$1-$2");
	};

	load();


	$scope.onlineReportingURL = function(schema){
		// console.log(schema);
		if(_.indexOf(['nationalReport','nationalAssessment','nationalTarget','nationalIndicator','nationalSupportTool','implementationActivity'],schema)>=0)
			return	 'online-reporting/';
		else
			return '';
	}

	$scope.getWorkflowId = function(item){
		return (item._workflow_s||'').replace(/workflow-/,'')
	}

	function verifyDependentRecordStatus(activity, document){
		var records = []
		if(document.header.schema == 'nationalReport6'){
			records = _.map(_.union(document.nationalTargets, _.map(document.progressAssessments, 'assessment')), 'identifier')
		}
		else if(document.header.schema == 'nationalAssessment'){
			records = [(document.nationalTarget||document.aichiTarget).identifier]
		}
		
		if(records.length >0){

			var qsParams =
			{
				"q"  : "NOT _state_s:public AND identifier_s:("+records.join(" ")+")",
				"fl" : "identifier_s, schema:schema_" + locale.toUpperCase() + "_t, title_t, _revision_i, _state_s, _latest_s, _workflow_s",
				"start" : 0,
				"rows"   : 100,
			};

			$q.when($http.get("/api/v2013/index", { params : qsParams }))
			.then(function(res) {
				if(res.data.response.docs.length > 0)
					$scope.pendingStatusRecords = res.data.response.docs;
			});
		}

	}

}];
});
