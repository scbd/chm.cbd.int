var events = require('events');
var util = require('util');
var when = require('../../libs/when/when');
var whenguard = require('../../libs/when/guard');
var TDSRequest = require('tedious').Request;
var ConnectionPool = require('tedious-connection-pool');
var crypto = require('crypto');

var ids = 0;
var connectionPools = {};

var SqlDatabase = function(connectionConfig) {

    var db   = connectionConfig.options.database;
    var hash = crypto.createHash('md5').update(JSON.stringify(connectionConfig)).digest('hex');
    var connectionPool = connectionPools[hash];

    if(!connectionPool) {

        var poolConfig = {};

        connectionPool        = new ConnectionPool(poolConfig, connectionConfig);
        connectionPool.db     = db;
        connectionPool.id     = ++ids;
        connectionPools[hash] = connectionPool;

        console.log("SQL connection pool created. DB:", db, "ID:", connectionPool.id);
    } else {
        console.log("SQL connection pool not created.");
    }

    //============================================================
    //
    //
    //============================================================
    function _getConnection() {

        var deferred = when.defer();
console.log(connectionPool);
        connectionPool.requestConnection(function (error, connection) {

            if(connection && !connection.id)
                connection.id = ++ids;

            if(error) {
                console.log('SQL POOL FAILED: ', db, connection.id, error);
                deferred.reject(error);
                return;
            }

            connection.on('connect', function (error) {

                if(error) {
                    console.log('SQL CONNECT FAILED: ', db, connection.id, error);
                    deferred.reject(error);
                    return;
                }

                deferred.resolve(connection);

            });

            connection.on('error', function (error) {

                console.log('SQL ERROR: ', db, connection.id, error);
            });

        });

        return deferred.promise.otherwise(function(error){

            console.log('ERROR _getConnection:', error);
            throw error;

        });
    }

    //============================================================
    //
    //
    //============================================================
    this.query = function (statement, callback) {

        var connection = _getConnection();

        return when.join(connection, statement).then(function (resolved) {

            var rows = [];

            var connection = resolved[0];
            var statement = resolved[1];

            var deferred = when.defer();

            var request = new TDSRequest(statement, function (error, rowCount) {

                connection.close();

                if(error) {
                    deferred.reject(error);
                    return;
                }

                if(callback) {

                    var guardedCallback = whenguard(whenguard.n(1), callback);

                    when.map(rows, function onrow (row) {

                        return guardedCallback(row);

                    }).then(function done () {

                        deferred.resolve(rowCount);

                    }).catch(function (error) {

                        deferred.reject(error);
                    });

                } else {

                    deferred.resolve(rowCount);
                }
            });

            request.on('row', function (columns) {

                var row = {};

                columns.forEach(function (column) {
                    row[column.metadata.colName] = column.value;
                });

                rows.push(row);
            });

            connection.execSql(request);

            return deferred.promise;
        });
    };

    //============================================================
    //
    //
    //============================================================
    this.single = function (statement) {

        var connection = _getConnection();

        return when.join(connection, statement).then(function (resolved) {

            var connection = resolved[0];
            var statement = resolved[1];

            var deferred = when.defer();

            var request = new TDSRequest(statement, function (error, rowCount) {

                connection.close();

                if(error) {
                    deferred.reject(error);
                    return;
                }

                if(rowCount==0)
                    deferred.resolve(null);
            });

            request.on('row', function (columns) {

                var row = { };

                columns.forEach(function (column) {
                    row[column.metadata.colName] = column.value;
                });

                deferred.resolve(row);
            });

            connection.execSql(request);

            return deferred.promise;
        });
    };
};

util.inherits(SqlDatabase, events.EventEmitter);

module.exports = SqlDatabase;
