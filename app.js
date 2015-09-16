var express = require('express');
var routes = require('./routes');
var card = require('./routes/card');
var http = require('http');
var path = require('path');
var configs = require('./configs');
var app = express();

// swagger cross domain setting
var cors = require('cors');
var corsOptions = {
    credentials: true,
    origin: function(origin,callback) {
        if(origin===undefined) {
            callback(null,false);
        } else {
            // change wordnik.com to your allowed domain.
            var match = origin.match("^(.*)?.wordnik.com(\:[0-9]+)?");
            var allowed = (match!==null && match.length > 0);
            callback(null,allowed);
        }
    }
};
app.use(cors(corsOptions));
//

// all environments
app.set('port', process.env.PORT || configs.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// request error handle
app.use(function (err, req, res, next) {
    if (err.http_status) {
        if (err.body) {
            res.send(err.body, err.http_status);
        } else {
            res.send(err.http_status);
        }
    } else {
        next(err);
    }
});


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/apiportal', routes.apiportal);
/*
 app.get('/card/:card_id', card.find);
 app.get('/card', card.list);
 app.post('/card', card.create);
 app.put('/card', card.modify());
 app.delete('/card/:card_id', card.delete);
 app.post('/card/:card_id/relation', card.relation);
 */



module.exports = app;