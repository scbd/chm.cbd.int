var _           = require('../app/libs/lodash/lodash.min');
var request     = require('../app/libs/request/request');
var when        = require('../app/libs/when/when');
var whenKeys    = require('../app/libs/when/keys');
//var config      = require('../../server-config');
var SqlDatabase = require('../app/js/libs/sqldatabase.js');
var thesaurus   = require('../app/js/libs/thesaurus.js');

var config =
var sqldatabase = new SqlDatabase(config.connectionStrings['cbd']);

var headers = { 'Accept': 'application/json', 'Content-Type': 'application/json;Charset=utf-8', 'Realm':'CHM-DEV','Authorization': '' };

var documentUrl   = 'https://chm.cbd.int/api/v2013/documents/';

var nrReports = {
                   first : {
                               code : "NR-01",
                               identifier: "F27DBC9B-FF25-471B-B624-C0F73E76C8B3",
                               title : "First National Report"
                           },
                   second: {
                               code: "NR-02",
                               identifier: "A49393CA-2950-4EFD-8BCC-33266D69232F",
                               title : "Second National Report"
                           },
                   third:  {
                               code: "NR-03",
                               identifier: "DA7E04F1-D2EA-491E-9503-F7923B1FD7D4",
                               title : "Third National Report"
                           },
                   fourth: {
                               code: "NR-04",
                               identifier: "272B0A17-5569-429D-ADF5-2A55C588F7A7",
                               title : "Fourth National Report"
                           },
                   fifth:  {
                               code: "NR-05",
                               identifier: "B3079A36-32A3-41E2-BDE0-65E4E3A51601",
                               title : "Fifth National Report"
                            }
                };


var nr = nrReports.fifth;

var sqlDocs = " SELECT DOC_ID, DOC_CD, DOC_CTR_CD , DOC_YN, DOC_TX_EN, DOC_TYP_CD, DOC_DESC_EN, CONVERT(NVARCHAR(10),DOC_RECV_DT, 127) DOC_RECV_DT, DOC_STS_CD, DOC_NR_ADOPT_YMD, DOC_NR_ADOPT_BY, DOC_GUID " +
              " FROM T_DOC " +
              " WHERE DOC_SRC_CD = 'NR' AND DOC_YN = 1 AND DOC_RECV_DT IS NOT NULL AND DOC_TYP_CD = '"+nr.code+"' ";


var sqlTitles = "SELECT TX_CD2, TX_EN, TX_ES, TX_FR, TX_AR, TX_RU, TX_ZH FROM T_TX WHERE TX_CTG_CD='52'";

var countryList   = thesaurus.getTerms('Countries');
var documentLinks = getLinks();

when(sqldatabase.query(sqlDocs, function(row) {

    var countryName = '';
    var links = [];

    when.join(countryList, documentLinks).then(function(r){

        countryName = (_.findWhere(r[0], { identifier: row.DOC_CTR_CD } )).title.en;
        links = _.where(r[1], {code: row.DOC_CD});


    }).then(function(){
        return  when(buildDoc(row, countryName, links));
    }).then(function(doc){

        //console.log(doc);

        return when(
                    request({ method: 'PUT', uri: documentUrl + doc.header.identifier + '?schema=nationalReport', body: JSON.stringify(doc), headers: headers }, function (error, response, data) {
                        if (error)
                            console.log(error);
                        else {
                            //console.log(data);
                            console.log("Imported DocumentID: ", row.DOC_ID);
                        }
                    }));

        //return storage.documents.put(doc.header.identifier, doc,{ schema:"nationalReport" });

    }).otherwise(function (error) {

        console.log('error: error syncing doc ' + row.DOC_ID);
        console.log(error);
    });

})).then(function (count) {
    console.log('DONE - ' + count);
}).otherwise(function (error) {
    console.log(error);
});




//============================================================
//
//
//============================================================
function buildDoc(row, countryName, links) {

    var docTitle         = nr.title;
    var reportIdentifier = nr.identifier;

    var doc           = {};
    var country       = countryName;
    var documentLinks = [];

    doc.header = {
            identifier : row.DOC_GUID,
            schema : 'nationalReport',
            languages : ['en']
        },

    doc.government    = { identifier: row.DOC_CTR_CD};
    doc.title         = { en: country + ' - ' + docTitle };
    doc.reportType    = { identifier: nr.identifier};
    doc.startDate     = row.DOC_RECV_DT; // need to format date

    if(row.DOC_STS_CD||'' != '')
        doc.status = getStatus(row);

    _.each(links, function(elem){  documentLinks.push(_.omit(elem, 'code')); });

    doc.documentLinks = documentLinks;

    return  whenKeys.all(doc).then(function (doc) {
                return doc;
            }).otherwise(function(error){
                console.log(error);
            });
}



//============================================================
//
//  return array of documentLinks
//============================================================
function getLinks() {

    var sqlFiles =  " SELECT FILE_DOC_CD, FILE_NM, FILE_URL, FILE_TX_EN, FILE_FMT_CD, FILE_LG_CD FROM T_DOC_FILE " +
                    " WHERE FILE_YN = 1 AND FILE_NR_TYPE_CD = '"+nr.code+"' " +
                    " ORDER BY FILE_DOC_CD, FILE_LG_CD, FILE_FMT_CD, " +
                    " CASE WHEN CHARINDEX('Part',FILE_TX_EN) > 0 THEN CAST(REPLACE(IsNUll(FILE_TX_EN, 999), 'Part ', 999) AS INT)  ELSE 999 END, " +
                    " FILE_URL ";

    var baseUrl       = "http://www.cbd.int";
    var documentLinks = [];

    var deferred = when.defer();

    var query = sqldatabase.query(sqlFiles, function (row) {

        var link     = {};
        var filename = row.FILE_NM.toUpperCase();
        var suffix   = ".WWW";

        link.code = row.FILE_DOC_CD;

        if(filename.slice(-suffix.length) == suffix){
            link.name = row.FILE_TX_EN;
            link.url =row.FILE_URL;
        }
        else
        {
            link.name = row.FILE_TX_EN || row.FILE_NM;
            link.url = baseUrl + row.FILE_URL;
        }

        documentLinks.push(link);
    });


    when(query)
    .then(function(){

        deferred.resolve(documentLinks);

    }).otherwise(function(error){
        console.log("Error: ", error);
    })

   return deferred.promise;
}



//============================================================
//
//
//============================================================
function uploadFile(fileUrl, docGuid) {
    var identifier    = docGuid;

    var attachmentSrc = 'http://www.cbd.int' + fileUrl; // /doc/world/au/au-nr-01-en.pdf
    var attachmentDst = '/api/v2013/documents/' + identifier + '/attachments/'  + path.basename(attachmentSrc);


    //var streamSrc     = request.get({ method: 'GET', uri: attachmentSrc }); // get file stream from API
    //var streamDst     = request({ method: 'PUT', uri: 'http://chm.cbd.int' + attachmentDst, headers: headers }); // save attachment in storage

    //var operation = streamSrc.pipe(streamDst);

    var deferred = when.defer();



    setTimeout(function(){

        // console.log(headers);
        // console.log(headers);
        // console.log(headers);
        // console.log(fileUrl,docGuid,attachmentSrc, attachmentDst)
        deferred.resolve(true);

    }, 2000);


    return deferred.promise;
}

//============================================================
//
//
//============================================================
function getStatus(doc) {

    var status = (doc.DOC_STS_CD || '').toLowerCase();

    if(status.indexOf('final') != -1){

        if(doc.DOC_NR_ADOPT_YMD && doc.DOC_NR_ADOPT_BY)
            return { identifier: "851B10ED-AE62-4F28-B178-6D40389CC8DB"}

        return { identifier: "1C37E358-5295-46EB-816C-0A7EF2437EC9"};
    }

    if(status.indexOf('draft') != -1)
        return { identifier: "9D17F3A2-EC92-4D31-81EF-A12521873D7F"};
}


//============================================================
//
//
//============================================================
 // function getCountries() {
 //    var countries = [];

 //    var deferred = when.defer();
 //    var sqlCountries = "Select CTR_CD, CTR_NM_EN FROM T_CTR WHERE CTR_YN = 1";

 //    var query = when(sqldatabase.query(sqlCountries, function(row) {
 //                    //console.log(row);
 //                    countries.push({code:row.CTR_CD, name:row.CTR_NM_EN});

 //                })).otherwise(function(error){
 //                        console.log(error);
 //                });

 //    when(query).then(function(){
 //        return countries;
 //    })
 // }


//============================================================
//
// save with promises
//============================================================
function save(doc) {
    var fs = require('fs');

    var deferred = when.defer();

    fs.writeFile("C:/Projects/Temp/Node/indicators/" + doc.header.identifier + ".json", JSON.stringify(doc), function (err) {
        if (err) {
            console.log(err);
        } else {
            setTimeout(function () {
                deferred.resolve(doc);
            }, 1000);
        }
    });

    return deferred.promise;
}
