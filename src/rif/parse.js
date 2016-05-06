define([], function () {
    "use strict";

    var Parser = function(tokens) {
        this.tokens = tokens;
        this.rif = {responses:{}, models: {}};
        this.index = 0;
        this.nextId = 0;
    };

    Parser.prototype.parseEntries = function(target, prefix) {
        while (this.index < this.tokens.length) {
            var pair = this.currentPair();
            var handler = this[prefix + pair.token];
            if (handler) {
                handler.call(this, target, pair);
            } else {
                break;
            }
        }
    };

    Parser.prototype.setFlag = function(target, entry) {
        if (entry.value === "")
            target[entry.token] = true;
        else
            target[entry.token] = entry.value.toLowerCase() === "true";
        this.index++;
    };

    Parser.prototype.addString = function(target, entry) {
        target[entry.token] = entry.value;
        this.index++;
    };

    Parser.prototype.addMultiString = function(target, entry) {
        target[entry.token] = target[entry.token] || [];
        target[entry.token].push(entry.value);
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

    Parser.prototype.addDoesTopicList = function(actions, entry) {
        var action = {};
        action[entry.token] = parseWeightedTopics(entry.value);
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
    Parser.prototype.parse_says_as = Parser.prototype.parse_says_attribute;
    Parser.prototype.parse_says_autohides = Parser.prototype.set_says_attribute_flag;

    Parser.prototype.parseSetExpression = function(value) {
        var o = { expression: value };
        if (value.indexOf('=') === -1) {
            this.parseEntries(o, "parse_sets_");
        }
        return o;
    };

    Parser.prototype.parse_does_sets = function(actions, entry) {
        this.index++;
        var action = {};
        var value = entry.value;
        action[entry.token] = this.parseSetExpression(value);
        actions.push(action);
    };

    Parser.prototype.parse_sets_to = function(action, entry) {
      action.to = entry.value;
      this.index++;
    };

    Parser.prototype.parse_does_calls = Parser.prototype.addDoesTopicList;
    Parser.prototype.parse_does_invokes = Parser.prototype.addDoesString;
    Parser.prototype.parse_does_suggests = function(actions, entry) {
        var action = {suggests: {keywords: parseWeightedTopics(entry.value) }};
        this.index++;
        this.parseEntries(action.adds, "parse_suggests_");
        actions.push(action );
    };
    Parser.prototype.parse_does_adds = function(actions, entry) {
        var action = {adds: {keywords: parseWeightedTopics(entry.value) }};
        this.index++;
        this.parseEntries(action.adds, "parse_adds_");
        actions.push(action );
    };
    Parser.prototype.parse_adds_to = function(action, entry) {
        action.cluster = entry.value;
        this.index++;
    };
    Parser.prototype.parse_adds_for = function(action, entry) {
        action.actor = entry.value;
        this.index++;
    };
    Parser.prototype.parse_does_removes = function(actions, entry) {
        var action = {removes: {keywords: parseWeightedTopics(entry.value) }};
        this.index++;
        this.parseEntries(action.removes, "parse_removes_");
        actions.push(action );
    };
    Parser.prototype.parse_removes_from = function(action, entry) {
        action.cluster = entry.value;
        this.index++;
    };
    Parser.prototype.parse_removes_for = function(action, entry) {
        action.actor = entry.value;
        this.index++;
    };
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
    };
    Parser.prototype.parse_does_uses = function(actions, entry) {
        this.index++;
        var responses = this.parseResponseGroup();
        if (entry.value === "first" || entry.value === "random" || entry.value === "all" || entry.value === "best") {
            var action = { uses: {}};
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
        var action = { moves: {}};
        action.moves.target = entry.value;
        this.parseMoveAttributes(action.moves);
        actions.push(action);
    };

    Parser.prototype.parse_moves_to = function(moves, entry) {
        this.index++;
        moves.to = entry.value;
    };

    function add_simple_action(actions, entry) {
        this.index++;
        var action = { };
        action[entry.token] = {};
        actions.push(action);
    }

    Parser.prototype.parse_does_resets = add_simple_action;
    Parser.prototype.parse_does_clears = add_simple_action;

    Parser.prototype.parse_does_adjusts = function(actions, entry) {
        this.index++;
        var action = { adjusts: { variable: entry.value } };
        this.parseEntries(action.adjusts, "parse_adjusts_");
        actions.push(action );
    };

    Parser.prototype.parse_adjusts_toward = Parser.prototype.addString;
    Parser.prototype.parse_adjusts_stepping = Parser.prototype.addString;

    Parser.prototype.parse_response_prompts = Parser.prototype.addString;
    Parser.prototype.parse_response_is = Parser.prototype.addString;
    Parser.prototype.parse_response_occurs = Parser.prototype.addInt;
    Parser.prototype.parse_response_orders = Parser.prototype.addInt;
    Parser.prototype.parse_response_needs = Parser.prototype.addMultiString;
    Parser.prototype.parse_response_forcesprompt = Parser.prototype.setFlag;

    Parser.prototype.parse_response_weights = function(target, entry) {
        this.index++;
        target[entry.token] = entry.value;
    };

    function parseWeightedTopics(matches_value) {
        var values = matches_value.split(" ");
        var matches = [];
        $.each(values, function (index, value) {
            var fields = value.split("=");
            if (fields.length === 1) {
                matches.push({keyword: fields[0], weight: 1});
            } else {
                matches.push({keyword: fields[0], weight: parseFloat(fields[1])/100.0});
            }
        });
        return matches;
    }

    function parseMatches(matches_value) {
        return parseWeightedTopics(matches_value);
    }

    Parser.prototype.parse_response_matches = function(target, entry) {
        target[entry.token] = parseMatches(entry.value);
        this.index++;
    };

    Parser.prototype.parse_response_selects = function(response, entry) {
        this.index++;
        response.selects = this.parseResponseGroup();
    };

    Parser.prototype.parse_response = function() {
        var value = this.currentPair().value;
        this.index++;
        var response = {};
        if (value !== '') {
            response.matches = parseMatches(value);
        }
        response.id = this.nextId++;
        this.parseEntries(response, "parse_response_");
        return response;
    };

    Parser.prototype.parseResponseGroup = function() {
        var responses = [];
        while (this.index < this.tokens.length) {
            var pair = this.currentPair();
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
                console.log('parse_responses(line: ' + this.line + '): Unexpected token ".' + token + '" (expected ".end" or new ".response")');
                alert('parse_responses(line: ' + this.line + '): Unexpected token ".' + token + '" (expected ".end" or new ".response")');
                break;
            }
        }
        return responses;
    };

    Parser.prototype.parse_responses = function () {
        var pair = this.currentPair();
        var token = pair.token;
        var value = pair.value;
        var rif = this.rif;
        rif[token] = rif[token]|| {};
        this.index++;
        rif[token][value] = this.parseResponseGroup();
    };

    Parser.prototype.parse_actions = Parser.prototype.parse_responses;

    Parser.prototype.parse_set = function() {
        var expression = this.currentPair().value;
        this.index++;
        var rif = this.rif;
        rif.sets = rif.sets || [];
        rif.sets.push(this.parseSetExpression(expression));
    };

    Parser.prototype.parse_model = function() {
        var actor = this.currentPair().value || 'standard';
        this.index++;
        var rif = this.rif;
        rif.models[actor] = this.parseModel();
    };

    Parser.prototype.parse_model_cluster = function(model, pair) {
        var cluster = {};
        this.index++;
        this.parseEntries(cluster, 'parse_model_cluster_');
        model.clusters[pair.value] = cluster;
    };

    Parser.prototype.parse_model_cluster_weight = Parser.prototype.addString;
    Parser.prototype.parse_model_cluster_decaying = Parser.prototype.addString;
    Parser.prototype.parse_model_cluster_suggestible = Parser.prototype.setFlag;

    Parser.prototype.parseModel = function() {
        var prefix = 'parse_model_';

        var model = {
            clusters: {}
        };

        while (this.index < this.tokens.length) {
            var pair = this.currentPair();
            var token = pair.token;
            if (token === "end") {
                this.index++;
                break;
            } else if (this[prefix + pair.token]) {
                this[prefix + pair.token].call(this, model, pair);
            } else {
                console.log('parse_responses(line: ' + this.line + '): Unexpected token ".' + token + '" (expected ".end" or model phrase)');
                alert('parse_responses(line: ' + this.line + '): Unexpected token ".' + token + '" (expected ".end" or model phrase)');
                break;
            }
        }
        return model;
    };

    Parser.prototype.parse_listener = function() {
        var listener = this.currentPair().value;
        var rif = this.rif;
        rif.listeners = rif.listeners || {};
        rif.listeners[listener] = {};
        this.index++;
    };

    Parser.prototype.parse_move = function() {
        var move = { target: this.currentPair().value };
        this.index++;
        this.parseMoveAttributes(move);
        var rif = this.rif;
        rif.moves = rif.moves || [];
        rif.moves.push(move);
    };

    Parser.prototype["parse_click-effect"] = function() {
        var rif = this.rif;
        rif.clickEffect = { transitions:[]};
        this.index++;
        this.parseEntries(rif.clickEffect, "parse_animates_");
    };

    Parser.prototype.currentPair = function() {
        var pair = this.tokens[this.index];
        if (pair.line) {
            this.line = pair.line;
        }
        return pair;
    };

    Parser.prototype.parse = function() {
        while (this.index < this.tokens.length) {
            var token = this.currentPair().token;
            var attribute = "parse_"+ token;
            if (this[attribute]) {
                this[attribute]();
            } else {
                console.log("parse(line: " + this.line + "): no handler for token " + token);
                alert("parse(line: " + this.line + "): no handler for token " + token);
                break;
            }
        }
        return this.rif;
    };

    return function (tokens) {
        var parser = new Parser(tokens);
        return parser.parse();
    };
});
