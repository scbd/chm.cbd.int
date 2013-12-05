angular.module('kmStorage')
.factory('IWorkflows', ["authHttp", "$q", function($http, $q) {
	return new function()
	{
		var self        = this;

		//===========================
		//
		//===========================
		this.create = function(type, data) {
			return $http.post("/api/v2013/workflows", { type : type, data : data }).then(
				function(resp) {
					return resp.data;
				}
			)
		};

		//===========================
		//
		//===========================
		this.get = function(id) {
			return $http.get("/api/v2013/workflows/"+id).then(
				function(resp){
					return resp.data;
				});
		};

		//===========================
		//
		//===========================
		this.updateActivity = function(id, activityName, data) {
			return $http.put("/api/v2013/workflows/"+id+"/activities/"+activityName, data).then(
				function(resp){
					return resp.data;
				});
		};

		//===========================
		//
		//===========================
		this.cancelActivity = function(id, activityName, data) {
			return $http.delete("/api/v2013/workflows/"+id+"/activities/"+activityName, data).then(
				function(resp){
					return resp.data;
				});
		};

		//===========================
		//
		//===========================
		this.cancel = function(id) {
			return $http.delete("/api/v2013/workflows/").then(
				function(resp){
					return resp.data;
				});
		};

		//===========================
		//
		//===========================
		this.query  = function(query) {
			return $http.get("/api/v2013/workflows/", { params : { q : JSON.stringify(query) } }).then(function(resp){
				return resp.data;
			});
		};
	}
}]);
