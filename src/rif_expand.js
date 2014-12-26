function rifExpand(tokens) {
    var newtokens = [];
    for (var i = 0; i < tokens.length; ++i) {
        var token_pair = tokens[i];
        var token = token_pair.token;
        if (token === "define" || token ==="enddef")
            continue;
        newtokens.push(token_pair);
    }
    return newtokens;
}
