var rifParse;
rifParse = (function () {
    var handlers = {
        object: function (tokens, index, rif) {
            var value = tokens[index].value;
            rif.objects = rif.objects || {};
            rif.objects[value] = {};
            return index + 1;
        },
        responses: function (tokens, index, rif) {
            var value = tokens[index].value;
            rif.responses = rif.responses || {};
            rif.responses[value] = {};
            return index + 2;
        }
    };

    return function (tokens) {
        var rif = {};
        for (var index = 0; index < tokens.length;) {
            var token = tokens[index].token;
            if (handlers[token]) {
                index = (handlers[token])(tokens, index, rif);
            } else {
                console.log("no handler for token " + token);
                break;
            }
        }
        return rif;
    };
})();
