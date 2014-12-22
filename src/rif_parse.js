var rifParse = (function() {
    return function(tokens) {
        var rif = {};
        for (var index = 0; index < tokens.length; ++index) {
            var token = tokens[index];
            if (token.token === "object") {
                rif.objects = rif.objects || {};
                rif.objects[token.value] = {};
            } else if (token.token === "responses") {
                rif.responses = {};
                rif.responses[token.value] = {};
            }
        }
        return rif;
    };
})();