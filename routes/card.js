function RequestError (_http_status, _body) {
    this.http_status = _http_status;
    this.body = _body;
};

var card_list = {};


exports.find = function (req, res) {
    var card_id = req.params.card_id;

    var result = card_list[card_id];

    if (!result) {
        throw new RequestError(404);
    }

    res.send(result, 200);
};

exports.list = function (req, res) {
    var name = req.query.name;
    var phone = req.query.phone;
    var email = req.query.email;

    var result = [];
    for (var i in card_list) {
        if (!card_list.hasOwnProperty((i))) {
            continue;
        }

        if (name && card_list[i].name != name) {
            continue;
        }

        if (phone && card_list[i].phone != phone) {
            continue;
        }

        if (email && card_list[i].email != email) {
            continue;
        }

        result.push(card_list[i]);
    };

    if (result.length == 0) {
        throw new RequestError(404);
    }

    res.send(result, 200);
};

exports.create = function (req, res) {
    var card_id = req.body.card_id;
    var phone = req.body.phone;
    var relations = req.body.relations;

    if (!card_id || !phone) {
        throw new RequestError(400);
    }

    if (phone) {
        if (!/^\d+$/.test(phone)) {
            throw new RequestError(403, { code: 10101, message: 'phone must be numeric.' });
        }
    }

    if (card_list[card_id]) {
        throw new RequestError(403, { code: 10102, message: 'Already exist card_id.' })
    }

    if (relations) {
        relations.forEach(function (item) {
            if (!card_list[item]) {
                throw new RequestError(403, { code: 10103, message: 'Not valid relations.' })
            }
        });
    }

    card_list[card_id] = req.body;
    res.send(201);
};

exports.modify = function (req, res) {
    var card_id = req.body.card_id;
    var name = req.body.name;
    var phone = req.body.phone;

    if (JSON.stringify(card_list[card_id]) === JSON.stringify(req.body)) {
        res.send(304);

    } else {
        if (!card_id || !phone) {
            throw new RequestError(400);
        }

        if (!card_list[card_id]) {
            throw new RequestError(404);
        }

        if (phone) {
            if (!/^\d+$/.test(phone)) {
                throw new RequestError(400, { code: 10201, message: 'phone must be numeric.' });
            }
        }

        if (name != card_list[card_id].name) {
            throw new RequestError(403, { code: 10202, message: 'name can not be changed.' });
        }

        card_list[card_id] = req.body;
        res.send(204);
    }
};

exports.delete = function (req, res) {
    var card_id = req.params.card_id;

    if (!card_list[card_id]) {
        throw new RequestError(404);
    }

    delete card_list[card_id];
    res.send(204);
};

exports.relation = function (req, res) {
    var card_id = req.params.card_id;
    var relation_id = req.body.relation_id;

    if (!relation_id) {
        throw new RequestError(400);
    }

    if (!card_list[card_id]) {
        throw new RequestError(404);
    }

    if (!card_list[relation_id]) {
        throw new RequestError(403, { code: 10301, message: 'Not exist card_id.' });
    }

    if (!card_list[card_id].relations) {
        card_list[card_id].relations = [];
    }
    card_list[card_id].relations.push(relation_id);
    res.send(204);
};