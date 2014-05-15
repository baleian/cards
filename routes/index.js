
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.apiportal = function (req, res) {
    var configs = require('../configs');
    res.render('apiportal', { host: configs.host, port: configs.port, swagger_path: configs.swagger_path });
};