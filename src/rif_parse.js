var rifParse = (function() {
    return function(tokens) {
        var rif = {};
        if (tokens.length > 0) {
            rif.objects = {};
            rif.objects[tokens[0].value] = {};
        }
        return rif;
    };
})();