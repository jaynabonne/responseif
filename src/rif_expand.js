var rifExpand = (function () {
    "use strict";
    return function(tokens) {
        var new_tokens = [];
        var definitions = {};
        for (var i = 0; i < tokens.length; ++i) {
            var token_pair = tokens[i];
            var token = token_pair.token;
            if (token === "define") {
                var definition = [];
                var start = ++i;
                while (i < tokens.length && tokens[i].token != "enddef")
                    ++i;
                definitions[token_pair.value] = tokens.slice(start, i);
                continue;
            } else if (definitions[token]) {
                new_tokens = new_tokens.concat(definitions[token]);
                continue;
            }
            new_tokens.push(token_pair);
        }
        return new_tokens;
    };
})();
