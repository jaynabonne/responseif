var rifExpand = (function () {
    "use strict";
    var Expander = function(tokens) {
        this.tokens = tokens;
        this.new_tokens = [];
        this.definitions = {};
        this.index = 0;
    };
    Expander.prototype.expand = function() {
        var tokens = this.tokens;
        for (this.index = 0; this.index < tokens.length; ++this.index) {
            var token_pair = tokens[this.index];
            var token = token_pair.token;
            if (token === "define") {
                var definition = [];
                var start = ++this.index;
                while (this.index < this.tokens.length && this.tokens[this.index].token != "enddef")
                    ++this.index;
                this.definitions[token_pair.value] = this.tokens.slice(start, this.index);
                continue;
            } else if (this.definitions[token]) {
                this.new_tokens = this.new_tokens.concat(this.definitions[token]);
                continue;
            }
            this.new_tokens.push(token_pair);
        }
        return this.new_tokens;
    };
    return function(tokens) {
        var expander = new Expander(tokens);
        return expander.expand();
    };
})();
