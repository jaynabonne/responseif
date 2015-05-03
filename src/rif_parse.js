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

    Parser.prototype.setFlag = function(target, entry) {
        target[entry.token] = true;
        this.index++;
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

    Parser.prototype.addDoesString = function(actions, entry) {
        var action = {};
        action[entry.token] = entry.value;
        actions.push(action);
        this.index++;
    };

    Parser.prototype.parse_does_says = function(actions, entry) {
        this.index++;
        var action = {says: { text: entry.value } };
        this.parseEntries(action.says, "parse_says_");
        actions.push( action );
    };
    Parser.prototype.parse_says_attribute = function(says, entry) {
        says[entry.token] = entry.value ;
        this.index++;
    };
    Parser.prototype.set_says_attribute_flag = function(says, entry) {
        says[entry.token] = true;
        this.index++;
    };
    Parser.prototype.parse_says_into = Parser.prototype.parse_says_attribute;
    Parser.prototype.parse_says_autohides = Parser.prototype.set_says_attribute_flag;

    Parser.prototype.parse_does_sets = Parser.prototype.addDoesList;
    Parser.prototype.parse_does_calls = Parser.prototype.addDoesList;
    Parser.prototype.parse_does_invokes = Parser.prototype.addDoesString;
    Parser.prototype.parse_does_suggests = Parser.prototype.addDoesList;
    Parser.prototype.parse_does_animates = function(actions, entry) {
        var action = {animates: { selector: entry.value, transitions: [] } };
        this.index++;
        this.parseEntries(action.animates, "parse_animates_");
        actions.push(action );
    };
    Parser.prototype.parse_animates_to = function(animates, entry) {
        var transition = {to: entry.value};
        this.index++;
        this.parseEntries(transition, "parse_transition_");
        animates.transitions.push(transition);
    };
    Parser.prototype.parse_transition_lasting = function(transition, entry) {
        transition.lasting = parseInt(entry.value);
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

    Parser.prototype.parseMoveAttributes = function(moves) {
        this.parseEntries(moves, "parse_moves_");
    };

    Parser.prototype.parse_does_moves = function(actions, entry) {
        this.index++;
        var action = { moves: {}}
        action.moves.target = entry.value;
        this.parseMoveAttributes(action.moves);
        actions.push(action);
    };

    Parser.prototype.parse_moves_to = function(moves, entry) {
        this.index++;
        moves.to = entry.value;
    };

    Parser.prototype.parse_response_prompts = Parser.prototype.addString;
    Parser.prototype.parse_response_is = Parser.prototype.addString;
    Parser.prototype.parse_response_occurs = Parser.prototype.addInt;
    Parser.prototype.parse_response_orders = Parser.prototype.addInt;
    Parser.prototype.parse_response_needs = Parser.prototype.addList;
    Parser.prototype.parse_response_forcesprompt = Parser.prototype.setFlag;

    Parser.prototype.parse_response_matches = function(target, entry) {
        var values = entry.value.split(" ");
        var matches = [];
        $.each(values, function(index, value) {
            var fields = value.split("=");
            if (fields.length === 1) {
                matches.push({keyword: fields[0]});
            } else {
                matches.push({keyword: fields[0], weight: parseInt(fields[1])});
            }
        });

        target[entry.token] = matches;
        this.index++;
    };

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
            var pair = this.tokens[this.index]
            var token = pair.token;
            if (token === "response") {
                responses.push(this.parse_response());
            } else if (token === "reference") {
                responses.push({reference: pair.value});
                this.index++;
            } else if (token === "end") {
                this.index++;
                break;
            } else {
                console.log('parse_responses: Unexpected token ".' + token + '" (expected ".end" or new ".response")');
                break;
            }
        }
        return responses;
    };

    Parser.prototype.parse_responses = function () {
        var pair = this.tokens[this.index];
        var token = pair.token;
        var value = pair.value;
        var rif = this.rif;
        rif[token] = rif[token]|| {};
        this.index++;
        rif[token][value] = this.parseResponseGroup();
    };

    Parser.prototype.parse_actions = Parser.prototype.parse_responses;

    Parser.prototype.parse_set = function() {
        var expression = this.tokens[this.index].value;
        var rif = this.rif;
        rif.sets = rif.sets || [];
        rif.sets.push(expression);
        this.index++;
    };

    Parser.prototype.parse_move = function() {
        var move = { target: this.tokens[this.index].value };
        this.index++;
        this.parseMoveAttributes(move);
        var rif = this.rif;
        rif.moves = rif.moves || [];
        rif.moves.push(move);
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
