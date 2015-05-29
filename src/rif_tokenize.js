var rifTokenize = (function() {
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

    function mergeToPreviousValue(result, token_pair) {
        var count = result.length;
        while (count > 0) {
            var last_token_pair = result[count - 1];
            if (last_token_pair.token !== "__LINE__") {
                if (last_token_pair.value !== "") {
                    last_token_pair.value += " ";
                }
                last_token_pair.value += token_pair.value;
                break;
            }
            count--;
        }
        token_pair.value = "";
    }

    return function(input) {
        input = input.replace(/\n/gm, " .__LINE__ ");
        var parts = input.split(/[\s]/);
        var result = [];

        var index = findNextToken(0, parts);
        while (index < parts.length) {
            var last_index = findNextToken(index+1, parts);

            var token_pair = extractTokenPair(parts, index, last_index);
            if (token_pair.token === "__LINE__" && token_pair.value !== "") {
                mergeToPreviousValue(result, token_pair);
            }
            result.push(token_pair);
            index = last_index;
        }
        return result;
    }
})();
