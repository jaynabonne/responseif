var rifParse;
rifParse = (function () {

    var Parser = function(tokens) {
        this.tokens = tokens;
        this.rif = {};
        this.index = 0;
    };

    Parser.prototype.responseParse = function() {
        this.index++;
        return {};
    }

    Parser.prototype.objectParse = function () {
        var value = this.tokens[this.index].value;
        var rif = this.rif;
        rif.objects = rif.objects || {};
        rif.objects[value] = {};
        this.index++;
    };
    Parser.prototype.responsesParse = function () {
        var value = this.tokens[this.index].value;
        var rif = this.rif;
        rif.responses = rif.responses || {};
        var responses = [];
        this.index++;
        var token = this.tokens[this.index].token;
        if (token === "response") {
            responses.push(this.responseParse());
        }
        rif.responses[value] = responses;
        this.index++;
    };

    Parser.prototype.parse = function() {
        while (this.index < this.tokens.length) {
            var token = this.tokens[this.index].token;
            var attribute = token+"Parse";
            if (this[attribute]) {
                this[attribute]();
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
