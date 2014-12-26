var rifExpand = (function () {
    "use strict";
    return function(tokens) {
        var newtokens = [];
        var definitions = {};
        for (var i = 0; i < tokens.length; ++i) {
            var token_pair = tokens[i];
            var token = token_pair.token;
            if (token === "define") {
                var id = token_pair.value;
                var definition = [];
                for (++i; i < tokens.length && tokens[i].token != "enddef"; ++i)
                    definition.push(tokens[i]);
                definitions[id] = definition;
                continue;
            } else if (definitions[token]) {
                newtokens = newtokens.concat(definitions[token]);
                continue;
            }
            newtokens.push(token_pair);
        }
        return newtokens;
    };
})();
