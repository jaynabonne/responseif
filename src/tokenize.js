function tokenize(input) {
    if (input === "") {
        return [];
    }
    var parts = input.split(" ");
    var result = [];
    var token = parts[0];
    var value = parts.length > 1 ? parts[1] : "";
    
    return [{ token: token.slice(1), value: value}];
}
