var rifParse;
rifParse = (function () {
    "use strict";

    var Parser = function(tokens) {
        this.tokens = tokens;
        this.rif = {};
        this.index = 0;
    };

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

    Parser.prototype.addDoesList = function(actions, entry) {
        var action = {};
        action[entry.token] = entry.value.split(" ");
        actions.push(action);
        this.index++;
    };

    Parser.prototype.parse_does_says = function(actions, entry) {
        actions.push({says: { text: entry.value } } );
        this.index++;
    };
    Parser.prototype.parse_says_attribute = function(actions, entry) {
        var last_action = actions[actions.length-1];
        if (last_action) {
            last_action.says[entry.token] = entry.value ;
        }
        this.index++;
    };
    Parser.prototype.parse_says_attribute_list = function(actions, entry) {
        var last_action = actions[actions.length-1];
        if (last_action) {
            last_action.says[entry.token] = entry.value.split(" ");
        }
        this.index++;
    };
    Parser.prototype.parse_does_into = Parser.prototype.parse_says_attribute;
    Parser.prototype.parse_does_sets = Parser.prototype.addDoesList;
    Parser.prototype.parse_does_calls = Parser.prototype.addDoesList;
    Parser.prototype.parse_does_suggests = Parser.prototype.addDoesList;
    Parser.prototype.parse_does_animates = function(actions, entry) {
        actions.push({animates: { selector: entry.value, transitions: [] } } );
        this.index++;
    };
    Parser.prototype.parse_does_to = function(actions, entry) {
        var last_action = actions[actions.length-1];
        if (last_action) {
            last_action.animates.transitions.push({to: entry.value});
        }
        this.index++;
    };
    Parser.prototype.parse_does_lasting = function(actions, entry) {
        var last_action = actions[actions.length-1];
        if (last_action) {
            var transitions = last_action.animates.transitions;
            transitions[transitions.length-1].lasting = parseInt(entry.value);
        }
        this.index++;
    }
    Parser.prototype.parse_does_uses = function(actions, entry) {
        this.index++;
        var responses = this.parseResponseGroup();
        if (entry.value === "first" || entry.value === "random" || entry.value === "all") {
            var action = { uses: {}}
            action.uses[entry.value] = responses;
            actions.push(action);
        }
    };

    var createDoesSlot = function(response, name) {
        response.does = response.does || {};
        var slotname = name || "common";
        return (response.does[slotname] = response.does[slotname] || []);
    };

    Parser.prototype.parse_response_does = function(response, entry) {
        this.index++;
        this.parseEntries(createDoesSlot(response, entry.value), "parse_does_");
    };

    Parser.prototype.parse_response_prompts = Parser.prototype.addString;
    Parser.prototype.parse_response_is = Parser.prototype.addString;
    Parser.prototype.parse_response_runs = Parser.prototype.addInt;
    Parser.prototype.parse_response_matches = Parser.prototype.addList;
    Parser.prototype.parse_response_needs = Parser.prototype.addList;

    Parser.prototype.parse_response_groups = function(response, entry) {
        this.index++;
        response.groups = this.parseResponseGroup();
    };

    Parser.prototype.parse_response = function() {
        this.index++;
        var response = {};
        this.parseEntries(response, "parse_response_");
        return response;
    };

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
                console.log('parse_responses: Unexpected token ".' + token + '" (expected ".end" or new ".response")');
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

    Parser.prototype.parse_set = function() {
        var expression = this.tokens[this.index].value;
        var rif = this.rif;
        rif.sets = rif.sets || [];
        rif.sets.push(expression);
        this.index++;
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
