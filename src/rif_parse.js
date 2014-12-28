var rifParse;
rifParse = (function () {
    "use strict";

    var Parser = function(tokens) {
        this.tokens = tokens;
        this.rif = {};
        this.index = 0;
    };

    Parser.prototype.addString = function(target, entry) {
        target[entry.token] = entry.value;
        this.index++;
    };

    Parser.prototype.addList = function(target, entry) {
        target[entry.token] = entry.value.split(" ");
        this.index++;
    };

    Parser.prototype.addInt = function(target, entry) {
        target[entry.token] = parseInt(entry.value);
        this.index++;
    };

    Parser.prototype.parse_response_prompts = Parser.prototype.addString;
    Parser.prototype.parse_response_is = Parser.prototype.addString;
    Parser.prototype.parse_response_runs = Parser.prototype.addInt;
    Parser.prototype.parse_response_matches = Parser.prototype.addList;
    Parser.prototype.parse_response_needs = Parser.prototype.addList;

    Parser.prototype.parse_does_says = Parser.prototype.addString;
    Parser.prototype.parse_does_sets = Parser.prototype.addList;
    Parser.prototype.parse_does_calls = Parser.prototype.addList;
    Parser.prototype.parse_does_suggests = Parser.prototype.addList;

    Parser.prototype.parseEntries = function(target, prefix) {
        while (this.index < this.tokens.length) {
            var entry = this.tokens[this.index];
            var handler = this[prefix + entry.token];
            if (handler) {
                handler.call(this, target, entry);
            } else {
                break;
            }
        }
    };

    Parser.prototype.parse_response_does = function(response, entry) {
        response.does = response.does || {};
        var slotname = entry.value || "common";
        response.does[slotname] = response.does[slotname] || {};
        var slot = response.does[slotname];
        this.index++;
        this.parseEntries(slot, "parse_does_");
    };

    Parser.prototype.parse_response_groups = function(response, entry) {
        this.index++;
        response.groups = this.parseResponseGroup();
    };

    Parser.prototype.parse_response_uses = function(response, entry) {
        this.index++;
        var responses = this.parseResponseGroup();
        if (entry.value === "first" || entry.value === "random") {
            response[entry.value] = responses;
        }
    };

    Parser.prototype.parse_response = function() {
        this.index++;
        var response = {};
        this.parseEntries(response, "parse_response_");
        return response;
    }

    Parser.prototype.parse_object = function () {
        var value = this.tokens[this.index].value;
        var rif = this.rif;
        rif.objects = rif.objects || {};
        rif.objects[value] = {};
        this.index++;
    };
    Parser.prototype.parseResponseGroup = function() {
        var responses = [];
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
        return responses;
    }
    Parser.prototype.parse_responses = function () {
        var value = this.tokens[this.index].value;
        var rif = this.rif;
        rif.responses = rif.responses || {};
        this.index++;
        rif.responses[value] = this.parseResponseGroup();
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
