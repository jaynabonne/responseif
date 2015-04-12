var rifLoad = (function() {

    var type = function(load_file) {
        this.load_file = load_file;
    };

    type.prototype.loadTokens = function(name, completion) {
        self = this;
        self.load_file(name, function (data) {
            var tokens = rifTokenize(data);
            $.each(tokens, function(index, token_pair) {
                if (token_pair.token === 'include') {
                    self.load_file(token_pair.value, function(data) {
                    });
                }
            });
            completion(tokens);
        });
    };

    return type;
})();