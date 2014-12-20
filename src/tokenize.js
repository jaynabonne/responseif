function tokenize(input) {
    if (input === "") {
        return [];
    }
    var parts = input.split(/[\s,]/);
    var result = [];
    var token = parts[0];
    var values = parts.slice(1);
    var value = values.join(" ");
    
    return [{ token: token.slice(1), value: value.trim()}];
}
