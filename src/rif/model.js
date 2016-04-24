define(['./topic_strategy'], function(RifTopicStrategy) {
    var type = function() {
        this.clusters = {};
    };
    var proto = type.prototype;

    proto.getCurrentTopics = function(rif_model) {
        rif_model = rif_model || {};
        var topics = [];
        $.each(this.clusters, function(index, cluster) {
            RifTopicStrategy.mergeClusterInto(topics, cluster, rif_model[index]);
        });
        return topics;
    };
    proto.getTopics = function(cluster_id) {
        return this.clusters[cluster_id] || [];
    };
    proto.addTopics = function(cluster_id, topics) {
        var cluster = this.clusters[cluster_id] || [];
        topics = topics.slice(0);
        for (var i = 0; i < cluster.length; ++i) {
            RifTopicStrategy.mergeTopicsInto(cluster[i], topics);
        }
        this.clusters[cluster_id] = cluster.concat(topics);
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

    proto.update = function(rif_model) {
        var self = this;
        $.each(rif_model, function(id, cluster_model) {
            if (self.clusters[id] && cluster_model.decaying) {
                RifTopicStrategy.decayTopics(self.clusters[id], cluster_model.decaying);
            }
        });
    };

    proto.suggestTopics = function(topics, rif_model) {
        var self = this;
        $.each(rif_model, function(id, cluster_model) {
            if (cluster_model.suggestible)
                self.addTopics(id, topics);
        });
    };
    return type;
});
