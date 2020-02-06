
module.exports = function(req, res){
    require('superagent')
            .get(`https://attachments.cbd.int/sitemap-chm.xml`)
            .pipe(res);
}
