define(['rif/fuzzy'], function(RifFuzzy) {
    "use strict";
    var strategy = { };

    strategy.mergeTopicsInto = function(topic, new_topics) {
        for (var i = 0; i < new_topics.length; ++i) {
            var new_topic = new_topics[i];
            if (new_topic.keyword === topic.keyword) {
                topic.weight = Math.max(new_topic.weight, topic.weight);
                new_topics.splice(i, 1);
                return;
            }
        }
    };

    function scale_weight(weight, new_weight) {
        return weight + (2-weight)*(new_weight/2);
    }

    strategy.mergeClusterInto = function(topics, cluster, cluster_model) {
        var cluster_weight = (cluster_model && cluster_model.weight) ? cluster_model.weight : 1;
        $.each(cluster, function(index, cluster_topic) {
            var weight = cluster_topic.weight*cluster_weight;
            $.each(topics, function (i, topic) {
                if (topic.keyword === cluster_topic.keyword) {
                    weight = scale_weight(weight, topic.weight);
                    topics.splice(i, 1);
                    return false;
                }
            });
            topics.push({ keyword: cluster_topic.keyword, weight: weight} );
        });
    };

    strategy.mergeTopics = function(a, b, scale) {
        scale = scale || 1.0;
        var merged = a.slice();
        $.each(b, function(index, value) {
            var keyword = value.keyword;
            var i = 0;
            var scaled_weight = value.weight*scale;
            var new_topic = { keyword: keyword, weight: scaled_weight};
            for (; i < merged.length; ++i) {
                if (merged[i].keyword === keyword) {
                    if (merged[i].weight < scaled_weight) {
                        merged[i] = new_topic;
                    }
                    break;
                }
            }
            if (i === merged.length) {
                merged.push(new_topic);
            }
        });
        return merged;
    };

    strategy.mergeCurrentTopics = function(called, current) {
        return this.mergeTopics(called, current);
    };

    strategy.decayTopics = function(topics, decay) {
        $.each(topics, function(index, topic) {
            topic.weight = RifFuzzy.adjust(topic.weight, 0, decay);
        });
    };
    return strategy;
});
