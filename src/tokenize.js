function tokenize(input) {
    if (input === "") {
        return [];
    }
    var tokens = input.split(" ");
    var result = [];
    for (var i = 0; i < tokens.length; ++i) {
        var token = tokens[i];
        if (token) {
            result.push({ token: token.slice(1), value: ""});
        }
    }
    return result;
}
