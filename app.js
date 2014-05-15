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

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


var swagger = require('swagger-node-express');
var url = require('url');

swagger.setAppHandler(app);

swagger.addModels({
    Card: {
        id: 'Card',
        required: ['card_id', 'phone'],
        properties: {
            card_id: {
                type: 'integer',
                format: 'int64',
                description: '카드 고유 번호'
            },
            name: {
                type: 'string',
                description: '이름'
            },
            phone: {
                type: 'string',
                description: '전화번호 (numeric)'
            },
            email: {
                type: 'string',
                description: '이메일'
            },
            relations: {
                type: 'array',
                description: '관계자 명함 번호',
                items: {
                    type: 'integer',
                    format: 'int64'
                }
            }
        }
    }
});

swagger.addGet({
    spec: {
        summary: '명함 조회',
        notes: '명함 번호로 리소스를 가져온다.',
        path: '/card/{card_id}',
        method: 'GET',
        parameters: [swagger.pathParam("card_id", "조회할 명함 번호.", "string")],
        type: 'Card',
        errorResponses : [
            { code: 200, reason: 'OK' },
            { code: 404, reason: 'Not Found' }
        ],
        nickname: 'findCardById'
    },
    action: card.find
});

swagger.addGet({
    spec: {
        summary: '명함 리스트 조회',
        notes: '검색 조건에 해당되는 명함 리스트를 불러온다.',
        path: '/card',
        method: 'GET',
        parameters: [
            swagger.queryParam("name", "검색 이름", "string"),
            swagger.queryParam("phone", "검색 핸드폰번호", "string"),
            swagger.queryParam("email", "검색 이메일주소", "string")
        ],
        type: 'array',
        items: {
            $ref: 'Card'
        },
        errorResponses : [
            { code: 200, reason: 'OK' },
            { code: 404, reason: 'Not Found' }
        ],
        nickname: 'getCardList'
    },
    action: card.list
});

swagger.addPost({
    spec: {
        summary: '명함 생성',
        notes: '새로운 명함을 추가한다.',
        path: '/card',
        method: 'POST',
        parameters: [swagger.bodyParam("Card", "생성할 명함 리소스.", "Card")],
        errorResponses : [
            { code: 201, reason: 'Created' },
            { code: 400, reason: 'Bad Request' },
            { code: 400, reason: '(10101) phone must be numeric.' },
            { code: 403, reason: '(10102) Already exist card_id.' }
        ],
        nickname: 'findCardById'
    },
    action: card.create
});

swagger.addPut({
    spec: {
        summary: '명함 수정',
        notes: '명함을 리소스를 갱신한다.',
        path: '/card',
        method: 'PUT',
        parameters: [swagger.bodyParam("Card", "갱신할 정보.", "Card")],
        errorResponses : [
            { code: 204, reason: 'OK' },
            { code: 304, reason: 'No Changed' },
            { code: 400, reason: 'Bad Request' },
            { code: 400, reason: '(10201) phone must be numeric.' },
            { code: 403, reason: '(10202) name can not be changed.' }
        ],
        nickname: 'modifyCard'
    },
    action: card.modify
});

swagger.addDelete({
    spec: {
        summary: '명함 삭제',
        notes: '명함 번호로 리소스를 삭제한다.',
        path: '/card/{card_id}',
        method: 'DEKETE',
        parameters: [swagger.pathParam("card_id", "삭제할 명함 번호.", "string")],
        type: 'Card',
        errorResponses : [
            { code: 204, reason: 'OK' },
            { code: 404, reason: 'Not Found' }
        ],
        nickname: 'deleteCardById'
    },
    action: card.delete
});

swagger.addPost({
    spec: {
        summary: '명함 관계 설정',
        notes: '연관된 명함 번호를 추가한다.',
        path: '/card/{card_id}/relation',
        method: 'POST',
        parameters: [swagger.pathParam("card_id", "설정할 명함 번호.", "string"), swagger.formParam("relation_id", "관계자 명함 번호.", "string")],
        errorResponses : [
            { code: 204, reason: 'OK' },
            { code: 400, reason: 'Bad Request' },
            { code: 403, reason: '(10301) Not exist card_id.' },
            { code: 404, reason: 'Not Found' }
        ],
        nickname: 'setRelationCard'
    },
    action: card.relation
});

swagger.configureDeclaration("card", {
    authorizations : ["oauth2"],
    produces: ["application/json"]
});

swagger.configureSwaggerPaths('', configs.swagger_path, '');
swagger.configure('http://' + configs.host + ':' + app.get('port'), '1.0.0');