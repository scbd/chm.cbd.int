define(['app', 'lodash'], function(app, _) { 'use strict';

app.factory('solr', [function() {

	return {
		escape : escape,
		andOr : andOr,
		lstring : lstring
	};

	function escape(value) {

		if(value===undefined) throw "Value is undefined";
		if(value===null)      throw "Value is null";
		if(value==="")        throw "Value is null";

		if(_.isNumber(value)) value = value.toString();
		if(_.isDate  (value)) value = value.toISOString();

		//TODO add more types

		value = value.toString();

		value = value.replace(/\\/g,   '\\\\');
		value = value.replace(/\+/g,   '\\+');
		value = value.replace(/\-/g,   '\\-');
		value = value.replace(/\&\&/g, '\\&&');
		value = value.replace(/\|\|/g, '\\||');
		value = value.replace(/\!/g,   '\\!');
		value = value.replace(/\(/g,   '\\(');
		value = value.replace(/\)/g,   '\\)');
		value = value.replace(/\{/g,   '\\{');
		value = value.replace(/\}/g,   '\\}');
		value = value.replace(/\[/g,   '\\[');
		value = value.replace(/\]/g,   '\\]');
		value = value.replace(/\^/g,   '\\^');
		value = value.replace(/\"/g,   '\\"');
		value = value.replace(/\~/g,   '\\~');
		value = value.replace(/\*/g,   '\\*');
		value = value.replace(/\?/g,   '\\?');
		value = value.replace(/\:/g,   '\\:');

		return value;
	}

	function andOr(query, sep) {

		sep = sep || 'AND';

		if(_.isArray(query)) {

			query = _.map(query, function(criteria){

				if(_.isArray(criteria)) {
					return andOr(criteria, sep=="AND" ? "OR" : "AND");
				}

				return criteria;
			});

			query = '(' + query.join(' ' + sep + ' ') + ')';
		}

		return query;
	}


	function lstring(value) {

		var fields = _.drop(arguments, 1);

		return _.reduce(['en', 'es', 'fr', 'ru', 'zh', 'ar'], function(text, locale){

			text[locale] = _.reduce(fields, function(v, f) {
				return v || value[f.replace('*', locale.toUpperCase())] || "";
			}, "");

			if(!text[locale])
				delete text[locale];

			return text;

		}, {});
	}

}]);
});
