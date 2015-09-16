 var swagger = require('swagger-node-express');
 var app = require('./app');
 var card = require('./routes/card');

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


module.exports = swagger;