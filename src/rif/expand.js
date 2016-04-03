define([], function () {
    "use strict";

    var Iterator = function(tokens) {
        this.tokens = tokens;
        this.index = 0;
        this.length = tokens.length;
    };

    Iterator.prototype.done = function() {
        return this.index === this.length;
    };

    Iterator.prototype.next = function() {
        return ++this.index;
    };

    Iterator.prototype.get = function() {
        return this.tokens[this.index];
    };

    var Expander = function() {
        this.definitions = {};
    };

    Expander.prototype.createDefinition = function(id) {
        var definition = [];
        for (; !this.iterator.done() && this.iterator.get().token != "enddef"; this.iterator.next()) {
            definition.push(this.iterator.get());
        }
        this.definitions[id] = definition;
    };

    function isNotEmpty(value) {
        return value !== undefined && value !== '';
    }
    function joinStrings(s1, s2) {
        if (isNotEmpty(s1)) {
            if (isNotEmpty(s2)) {
                return s1 + " " + s2;
            }
            return s1;
        }
        return isNotEmpty(s2) ? s2 : '';
    }
    function replaceValues(tokens, value) {
        var new_tokens = [];
        for (var i = 0; i < tokens.length; ++i) {
            var token_pair = tokens[i];
            if (token_pair.token === "<value>") {
                var last = new_tokens.length-1;
                var last_pair = new_tokens[last];
                var new_value = joinStrings(joinStrings(last_pair.value, value), token_pair.value);
                new_tokens[last] = {token: last_pair.token, value: new_value};
            } else {
                new_tokens.push(token_pair);
            }
        }
        return new_tokens;
    }

    Expander.prototype.applyDefinition = function(token, value) {
        var iterator = this.iterator;
        var new_tokens = this.new_tokens;
        var valued_tokens = replaceValues(this.definitions[token], value);
        var expanded_tokens = this.expand(new Iterator(valued_tokens));
        this.iterator = iterator;
        this.new_tokens = new_tokens.concat(expanded_tokens);
    };

    var comment_chars = "/-#";

    Expander.prototype.expandNext = function() {
        var token_pair = this.iterator.get();
        var token = token_pair.token;

        if (comment_chars.indexOf(token[0]) >= 0) {
            return;
        }

        if (token === "define") {
            this.iterator.next();
            this.createDefinition(token_pair.value);
        } else if (this.definitions[token]) {
            this.applyDefinition(token, token_pair.value);
        } else if (token !== "<value>") {
            this.new_tokens.push(token_pair);
        }
    };

    Expander.prototype.expand = function(iterator) {
        this.new_tokens = [];
        this.iterator = iterator;
        while(!this.iterator.done()) {
            this.expandNext();
            this.iterator.next();
        }
        return this.new_tokens;
    };
    return function(tokens, completion) {
        var expander = new Expander();
        var result = expander.expand(new Iterator(tokens));
        completion(result);
    };
});
