define(['app', 'lodash', 'linqjs', 'URIjs/URI', "jquery", 'ngCookies', 'scbd-angularjs-filters'], function(app, _, Enumerable, URI, $) { 'use strict';

app.filter('integer', function () {
    return function (number, base, length) {

        var text = Number(number).toString(base || 10);

        if (text.length < (length || 0))
            text = '00000000000000000000000000000000'.substr(0, length - text.length) + text;

        return text;
    };
});

app.filter("orderPromiseBy", ["$q", "$filter", function($q, $filter) {
	return function(promise, expression, reverse) {
		return $q.when(promise).then(function(collection){
			return $filter("orderBy")(collection, expression, reverse);
		});
	};
}]);

app.filter("markdown", ["$window", "htmlUtility", function($window, html) {
	return function(srcText) {
		if (!$window.marked)//if markdown is not install then return escaped html! to be safe!
			return '<div style="word-break: break-all; word-wrap: break-word; white-space: pre-wrap;">'+html.encode(srcText)+'</div>';
		return $window.marked(srcText, { sanitize: true });
	};
}]);

app.factory("htmlUtility", function() {
	return {
		encode: function(srcText) {
			return $('<div/>').text(srcText).html();
		}
	};
});

app.factory('guid', function() {
	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	return function() {
		return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4()).toUpperCase();
	};
});

app.factory('Enumerable', [function() {
	return Enumerable;
}]);

app.factory('URI', [function() {
	return URI;
}]);

app.factory('localization', ["$cookies", function($cookies) {
	return {
		locale: function(newLocale) {

			var internal_SetLocale = function(newLocale) {

				if (!/^[a-z]{2,3}$/.test(newLocale))
					throw "invalid locale";

				var oExpire = new Date();

				oExpire.setFullYear(oExpire.getFullYear() + 1);

				document.cookie = "Preferences=Locale=" + escape(newLocale) + "; path=/; expires="+oExpire.toGMTString(); //jshint ignore:line
			};

			if (newLocale)
				internal_SetLocale(newLocale);

			var sPreferences = $cookies.getAll("Preferences");
			var sLocale      = "en";
			var oLocaleRegex = /;?Locale=([a-z]{2,3});?/;

			if (sPreferences && oLocaleRegex.test(sPreferences))
				sLocale = sPreferences.replace(oLocaleRegex, "$1");
			else
				internal_SetLocale(sLocale);

			return sLocale;
		}
	};
}]);

});
