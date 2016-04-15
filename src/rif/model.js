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
            cluster.push(topic);
        });
        this.clusters[cluster_id] = cluster;
    };
    return type;
});
