(function() {
	var app = angular.module("kmApp")

	// Allow lazy module to load in test mode (can call .dicrective)
	app.compileProvider = app.compileProvider || app; 
})();

