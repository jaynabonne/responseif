var tokenize = (function() {
    "use strict";
    
    function isAToken(part) {
        return part.charAt(0) === ".";
    }

    function extractToken(parts, index) {
        return parts[index].slice(1);
    }

    function extractValue(parts, index, last_index) {
        return parts.slice(index, last_index).join(" ").trim();
    }

    function extractTokenPair(parts, index, last_index) {
        return {
            token: extractToken(parts, index),
            value: extractValue(parts, index+1, last_index)
        };
    }

    function findNextToken(index, parts) {
        while (index < parts.length && !isAToken(parts[index])) {
            ++index;
        }
        return index;
    }

    return function(input) {
        if (input === "") {
            return [];
        }
        var parts = input.split(/[\s,]/);
        var result = [];

        var index = findNextToken(0, parts);
        while (index < parts.length) {
            var last_index = findNextToken(index+1, parts);

            result.push(extractTokenPair(parts, index, last_index));
            index = last_index;
        }
        return result;
    }
})();
