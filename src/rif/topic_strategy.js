define([], function() {
    "use strict";
    var service = { };

    service.mergeCurrentTopics = function(called, current) {
        var merged = called.slice();
        $.each(current, function(index, value) {
            var keyword = value.keyword;
            var i = 0;
            for (; i < merged.length; ++i) {
                if (merged[i].keyword === keyword) {
                    if (merged[i].weight < value.weight) {
                        merged[i] = value;
                    }
                    break;
                }
            }
            if (i === merged.length) {
                merged.push(value);
            }
        });
        return merged;
    };
    return service;
});
