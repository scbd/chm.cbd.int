
module.exports = function(req, res){

    var isValidHost = ['chm.cbd.int'].includes(req.headers['hosts']);

    var text = isValidHost ? 'Allow: /' : 'Disallow: /';

    res.contentType('text/plain');
    res.end('User-agent: *\n' + text);
}
