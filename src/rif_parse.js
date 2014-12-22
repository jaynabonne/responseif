var rifParse = (function() {
    return function(tokens) {
        var rif = {};
        if (tokens.length > 0) {
            var token = tokens[0];
            if (token.token === "object") {
                rif.objects = {};
                rif.objects[tokens[0].value] = {};
            } else if (token.token === "responses") {
                rif.responses = {};
                rif.responses[tokens[0].value] = {};
            }
        }
        return rif;
    };
})();