var rifExpand = (function () {
    "use strict";
    var Expander = function(tokens) {
        this.tokens = tokens;
        this.new_tokens = [];
        this.definitions = {};
    };

    Expander.prototype.processDefinition = function(id) {
        var start = ++this.index;
        while (this.index < this.tokens.length && this.tokens[this.index].token != "enddef")
            ++this.index;
        this.definitions[id] = this.tokens.slice(start, this.index);
    }

    Expander.prototype.expandNext = function() {
        var token_pair = this.tokens[this.index];
        var token = token_pair.token;
        if (token === "define") {
            this.processDefinition(token_pair.value);
        } else if (this.definitions[token]) {
            this.new_tokens = this.new_tokens.concat(this.definitions[token]);
        } else {
            this.new_tokens.push(token_pair);
        }
    };
    Expander.prototype.expand = function() {
        for (this.index = 0; this.index < this.tokens.length; ++this.index) {
            this.expandNext();
        }
        return this.new_tokens;
    };
    return function(tokens) {
        var expander = new Expander(tokens);
        return expander.expand();
    };
})();
