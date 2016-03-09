define(['app', 'lodash', 'linqjs', 'URIjs/URI', "jquery", 'ngCookies'], function(app, _, Enumerable, URI, $) { 'use strict';

app.filter("lstring", function() {
	return function(ltext, locale) {

		if(!ltext)
			return "";

		if(_.isString(ltext))
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
			return "";

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
					_.each(oRefTerm.narrowerTerms, function(identifier) {
						var oNarrower = oTermsMap[identifier];

						if (oNarrower) {
							oBroader.narrowerTerms = oBroader.narrowerTerms || [];
							oNarrower.broaderTerms = oNarrower.broaderTerms || [];

							oBroader.narrowerTerms.push(oNarrower);
							oNarrower.broaderTerms.push(oBroader);
						}
					}); //jshint ignore:line
				}
			}

			return Enumerable.From(oTerms).Where("o=>!o.broaderTerms").ToArray();
		}
	};
}]);

app.filter("term", ["$http","$filter", function($http, $filter) {

	var termsCache = {};

	return function(term, locale) {

		if(!term)
			return "";

		if(term.customValue)
			return $filter('lstring')(term.customValue, locale);

		var identifier = _.isString(term) ? term : term.identifier;

        if(!identifier)
            return "";

		if(!termsCache[identifier]) {

			return (termsCache[identifier] = $http.get('/api/v2013/thesaurus/terms/'+encodeURI(identifier), { cache:true }).then(function(res) {

				termsCache[identifier] = res.data.title;

				return $filter('lstring')(res.data.title, locale);

			}).catch(function(){

				termsCache[identifier] = identifier || "UNKNOWN-TERM";

				return identifier;
			}));
		}

		if(termsCache[identifier] && termsCache[identifier].then)
			return "";

		return $filter('lstring')(termsCache[identifier] || identifier || "", locale);
	};
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
