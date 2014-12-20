function createTokenPair(token, value) {
    return { token: token, value: value.trim()};
}

function extractTokenPair(parts, index, last_index) {
    var token = parts[index];
    var values = parts.slice(index+1, last_index);
    var value = values.join(" ");
    return createTokenPair(token.slice(1), value);
}

function tokenize(input) {
    if (input === "") {
        return [];
    }
    var parts = input.split(/[\s,]/);
    var result = [];
    
    var index = 0;
    var last_index = parts.length;
    
    result.push(extractTokenPair(parts, index, last_index));
    
    return result;
}
