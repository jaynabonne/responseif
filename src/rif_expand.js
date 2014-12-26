var rifExpand = (function () {
    "use strict";
    var Expander = function(tokens) {
        this.tokens = tokens;
        this.new_tokens = [];
        this.definitions = {};
        this.index = 0;
    };
    Expander.prototype.expandNext = function() {
        var token_pair = this.tokens[this.index];
        var token = token_pair.token;
        if (token === "define") {
            var definition = [];
            var start = ++this.index;
            while (this.index < this.tokens.length && this.tokens[this.index].token != "enddef")
                ++this.index;
            this.definitions[token_pair.value] = this.tokens.slice(start, this.index);
            return;
        } else if (this.definitions[token]) {
            this.new_tokens = this.new_tokens.concat(this.definitions[token]);
            return;
        }
        this.new_tokens.push(token_pair);
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
