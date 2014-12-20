function createTokenPair(token, value) {
    return { token: token, value: value.trim()};
}

function extractTokenPair(parts, index, last_index) {
    var token = parts[index];
    var values = parts.slice(index+1, last_index);
    var value = values.join(" ");
    return createTokenPair(token.slice(1), value);
}

function findNextToken(index, parts) {
    var parts_length = parts.length;
    while (index < parts_length) {
        if (parts[index].charAt(0) === ".") {
            break;
        }
        ++index;
    }
    return index;
}

function tokenize(input) {
    if (input === "") {
        return [];
    }
    var parts = input.split(/[\s,]/);
    var result = [];
    
    var index = 0;
    var parts_length = parts.length;
    while (index < parts_length) {
        var last_index = findNextToken(index+1, parts);

        result.push(extractTokenPair(parts, index, last_index));
        index = last_index;
    }
    
    return result;
}
