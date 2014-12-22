var rifParse;
rifParse = (function () {
    var handlers = {
        object: function (context) {
            var value = context.tokens[context.index].value;
            var rif = context.rif;
            rif.objects = rif.objects || {};
            rif.objects[value] = {};
            context.index++;
        },
        responses: function (context) {
            var value = context.tokens[context.index].value;
            var rif = context.rif;
            rif.responses = rif.responses || {};
            rif.responses[value] = [];
            context.index += 2;
        }
    };

    return function (tokens) {
        var context = {
            tokens: tokens,
            rif:  {},
            index: 0
        };
        while (context.index < context.tokens.length) {
            var token = context.tokens[context.index].token;
            if (handlers[token]) {
                (handlers[token])(context);
            } else {
                console.log("no handler for token " + token);
                break;
            }
        }
        return context.rif;
    };
})();
