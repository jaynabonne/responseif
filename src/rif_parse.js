var rifParse;
rifParse = (function () {

    var Parser = function(tokens) {
        this.tokens = tokens;
        this.rif = {};
        this.index = 0;
    };

    Parser.prototype.handlers = {
        object: function () {
            var value = this.tokens[this.index].value;
            var rif = this.rif;
            rif.objects = rif.objects || {};
            rif.objects[value] = {};
            this.index++;
        },
        responses: function () {
            var value = this.tokens[this.index].value;
            var rif = this.rif;
            rif.responses = rif.responses || {};
            rif.responses[value] = [];
            this.index += 2;
        }
    };

    Parser.prototype.parse = function() {
        while (this.index < this.tokens.length) {
            var token = this.tokens[this.index].token;
            if (this.handlers[token]) {
                var func = (this.handlers[token]).bind(this);
                func();
            } else {
                console.log("no handler for token " + token);
                break;
            }
        }
        return this.rif;
    };

    return function (tokens) {
        var parser = new Parser(tokens);
        return parser.parse();
    };
})();
