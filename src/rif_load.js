var rifLoad = (function() {
    var type = function(load_file) {
        this.load_file = load_file;
    };

    type.prototype.loadTokens = function(name, completion) {
        this.load_file(name, function (data) {
            var tokens = rifTokenize(data);
            completion(tokens);
        });
    };

    return type;
})();