var rifParse;
rifParse = (function () {

    var Parser = function(tokens) {
        this.tokens = tokens;
        this.rif = {};
        this.index = 0;
    };

    Parser.prototype.parse_response = function() {
        this.index++;
        var response = {};
        while (this.index < this.tokens.length) {
            var entry = this.tokens[this.index];
            var token = entry.token;
            if (token === "text") {
                response.text = entry.value;
                this.index++;
            } else if (token === "maxusecount") {
                response.maxusecount = parseInt(entry.value);
                this.index++;
            } else if (token === "topics" || token === "subtopics" || token === "needs") {
                response[token] = entry.value.split(" ");
                this.index++;
            } else {
                break;
            }
        }
        return response;
    }

    Parser.prototype.parse_object = function () {
        var value = this.tokens[this.index].value;
        var rif = this.rif;
        rif.objects = rif.objects || {};
        rif.objects[value] = {};
        this.index++;
    };
    Parser.prototype.parse_responses = function () {
        var value = this.tokens[this.index].value;
        var rif = this.rif;
        rif.responses = rif.responses || {};
        var responses = [];
        this.index++;
        while (this.index < this.tokens.length) {
            var token = this.tokens[this.index].token;
            if (token === "response") {
                responses.push(this.parse_response());
            } else if (token === "end") {
                this.index++;
                break;
            } else {
                console.log("parse_responses: Unknown token " + token);
                break;
            }
        }
        rif.responses[value] = responses;
    };

    Parser.prototype.parse = function() {
        while (this.index < this.tokens.length) {
            var token = this.tokens[this.index].token;
            var attribute = "parse_"+ token;
            if (this[attribute]) {
                this[attribute]();
            } else {
                console.log("parse: no handler for token " + token);
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
