var rifLoad = (function() {

    var type = function(load_file) {
        this.load_file = load_file;
    };

    function addIncludes(completion) {
        while (this.index < this.tokens.length) {
            var token_pair = this.tokens[this.index];
            if (token_pair.token === 'include') {
                var self = this;
                this.load_file(token_pair.value, function(data) {
                    var new_tokens = rifTokenize(data);
                    self.tokens = self.tokens.slice(0, self.index).concat(new_tokens).concat(self.tokens.slice(self.index+1));
                    addIncludes.call(self, completion);
                });
                return;
            }
            ++this.index;
        }
        completion(this.tokens);
    }

    type.prototype.loadTokens = function(name, completion) {
        var self = this;
        self.load_file(name, function (data) {
            self.tokens = rifTokenize(data);
            self.index = 0;
            addIncludes.call(self, completion);
        });
    };

    return type;
})();