var _       = require('../../libs/lodash/lodash.min');
var request = require('superagent-promise');
var config  = require('../../../../server-config.js');

function Sql(database)
{
    this.getRecord = function(table, id) {

        return request
            .get(config.sql.baseUrl + "/db/"+database+'/'+table+'/'+id)
            .set('Accept', 'application/json')
            .timeout(30*1000)
            .end()
            .then(function (res) {

                if(res.status == 404) return null;
                if(res.status != 200) throw res.body;

                return res.body;
            });
    };


    function query(rawSqlQuery, firstOne){

        if(rawSqlQuery.parameters)
            rawSqlQuery.parameters = nullify(rawSqlQuery.parameters);

        return request
            .post(config.sql.baseUrl + "/db/"+database)
            .query({ fo : (firstOne ? 1 : 0) })
            .set('Accept', 'application/json')
            .timeout(30*1000)
            .send(rawSqlQuery)
            .end()
            .then(function (res) {

                if(res.status != 200)                  throw res.body;
                if(firstOne && res.text==="null"     ) return null;
                if(firstOne && res.text==="undefined") return undefined;

                return res.body;
            });
    }

    this.query  = query;
    this.single = function(rawSqlQuery) {
        return query(rawSqlQuery, true);
    };
}

function nullify(obj) {

    _.forEach(obj, function(value, key){

        if(value===undefined)
            obj[key] = null;
    });

    return obj;
}

module.exports = Sql;
