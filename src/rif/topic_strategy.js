define(['rif/fuzzy'], function(RifFuzzy) {
    "use strict";
    var strategy = { };

    strategy.mergeTopics = function(called, current) {
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

    strategy.decayTopics = function(topics) {
        var new_topics = [];
        $.each(topics, function(index, topic) {
            var new_topic = $.extend({}, topic);
            new_topic.weight = RifFuzzy.adjust(new_topic.weight, 0, 0.2);
            new_topics.push(new_topic);
        });
        return new_topics;
    };
    return strategy;
});
