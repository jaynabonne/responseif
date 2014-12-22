var rifParse;
rifParse = (function () {

    var Parser = function(tokens) {
        this.tokens = tokens;
        this.rif = {};
        this.index = 0;
    };

    Parser.prototype.handlers = {
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
        var context = new Parser(tokens);
        while (context.index < context.tokens.length) {
            var token = context.tokens[context.index].token;
            if (context.handlers[token]) {
                (context.handlers[token])(context);
            } else {
                console.log("no handler for token " + token);
                break;
            }
        }
        return context.rif;
    };
})();
