define(['app', 'underscore', 'linqjs', 'URIjs/URI'], function(app, _, Enumerable, URI) { 'use strict';

console.log("LOADED km-utilities");

app.filter("lstring", function() {
	return function(ltext, locale) {

		if(!ltext)
			return "";

		if(angular.isString(ltext))
			return ltext;

		var sText;

		if(!sText && locale)
			sText = ltext[locale];

		if(!sText)
			sText = ltext.en;

		if(!sText) {
			for(var key in ltext) {
				sText = ltext[key];
				if(sText)
					break;
			}
		}

		return sText||"";
	};
});

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

app.filter("truncate", function() {
	return function(text, maxSize, suffix) {

		if (!maxSize)
			return text;

		if (!suffix)
			suffix = "";

		if(!text)
			return "".su;

		if (text.length > maxSize)
			text = text.substr(0, maxSize) + suffix;

		return text;
	};
});

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

app.factory('underscore', [function() {
	return _;
}]);

app.factory('Enumerable', [function() {
	return Enumerable;
}]);

app.factory('URI', [function() {
	return URI;
}]);

app.factory('Thesaurus', ["Enumerable", function() {
	return {
		buildTree : function(terms) {
			var oTerms    = [];
			var oTermsMap = {};

			Enumerable.From(terms).ForEach(function(value) {
				var oTerm = {
					identifier : value.identifier,
					name       : value.name
				};

				oTerms.push(oTerm);
				oTermsMap[oTerm.identifier] = oTerm;
			});

			for (var i = 0; i < oTerms.length; ++i) {
				var oRefTerm = terms [i];
				var oBroader = oTerms[i];

				if (oRefTerm.narrowerTerms && oRefTerm.narrowerTerms.length > 0) {
					angular.forEach(oRefTerm.narrowerTerms, function(identifier) {
						var oNarrower = oTermsMap[identifier];

						if (oNarrower) {
							oBroader.narrowerTerms = oBroader.narrowerTerms || [];
							oNarrower.broaderTerms = oNarrower.broaderTerms || [];

							oBroader.narrowerTerms.push(oNarrower);
							oNarrower.broaderTerms.push(oBroader);
						}
					});
				}
			}

			return Enumerable.From(oTerms).Where("o=>!o.broaderTerms").ToArray();
		}
	}
}]);

app.factory('localization', ["$browser", function($browser) {
	return {
		locale: function(newLocale) {

			var internal_SetLocale = function(newLocale) {

				if (!/^[a-z]{2,3}$/.test(newLocale))
					throw "invalid locale";

				var oExpire = new Date();

				oExpire.setFullYear(oExpire.getFullYear() + 1);

				document.cookie = "Preferences=Locale=" + escape(newLocale) + "; path=/; expires="+oExpire.toGMTString();
			}

			if (newLocale)
				internal_SetLocale(newLocale);

			var sPreferences = $browser.cookies().Preferences;
			var sLocale      = "en";
			var oLocaleRegex = /;?Locale=([a-z]{2,3});?/

			if (sPreferences && oLocaleRegex.test(sPreferences))
				sLocale = $browser.cookies().Preferences.replace(oLocaleRegex, "$1");
			else
				internal_SetLocale(sLocale);

			return sLocale;
		}
	}
}]);


});
