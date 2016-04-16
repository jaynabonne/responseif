define([], function() {
    var type = function() {
        this.clusters = {};
    };
    var proto = type.prototype;

    proto.getCurrentTopics = function() {
        return [];
    };
    proto.getTopics = function(cluster_id) {
        return this.clusters[cluster_id] || [];
    };
    proto.addTopics = function(cluster_id, topics) {
        var cluster = this.clusters[cluster_id] || [];
        $.each(topics, function(index, topic) {
            for (var i = 0; i < cluster.length; ++i) {
                var cluster_topic = cluster[i];
                if (cluster_topic.keyword === topic.keyword) {
                    cluster_topic.weight = Math.max(cluster_topic.weight, topic.weight);
                    return;
                }
            }
            cluster.push(topic);
        });
        this.clusters[cluster_id] = cluster;
    };
    proto.removeTopics = function(cluster_id, topics) {
        var cluster = this.clusters[cluster_id];
        if (!cluster) {
            return;
        }

        var keywords = topics.map(function(value) { return value.keyword; });
        for (var i = cluster.length - 1; i >= 0; i--) {
            if (keywords.indexOf(cluster[i].keyword) != -1) {
                cluster.splice(i, 1);
            }
        }
    };
    return type;
});
