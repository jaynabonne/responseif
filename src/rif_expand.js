var rifExpand = (function () {
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

    var Expander = function(tokens) {
        this.iterator = new Iterator(tokens);
        this.new_tokens = [];
        this.definitions = {};
    };

    Expander.prototype.createDefinition = function(id) {
        var definition = [];
        while (!this.iterator.done() && this.iterator.get().token != "enddef") {
            definition.push(this.iterator.get());
            this.iterator.next();
        }
        this.definitions[id] = definition;
    };

    Expander.prototype.useDefinition = function(token) {
        var expanded_tokens = this.definitions[token];
        this.new_tokens = this.new_tokens.concat(expanded_tokens);
    };

    Expander.prototype.expandNext = function() {
        var token_pair = this.iterator.get();
        var token = token_pair.token;
        if (token === "define") {
            this.iterator.next();
            this.createDefinition(token_pair.value);
        } else if (this.definitions[token]) {
            this.useDefinition(token);
        } else {
            this.new_tokens.push(token_pair);
        }
    };

    Expander.prototype.expand = function() {
        while(!this.iterator.done()) {
            this.expandNext();
            this.iterator.next();
        }
        return this.new_tokens;
    };
    return function(tokens) {
        var expander = new Expander(tokens);
        return expander.expand();
    };
})();
