define(['rif/topic_strategy'], function(RifTopicStrategy) {
    describe('mergeTopicsInto', function() {
        it('should not change the original topic is the new topics array is empty', function() {
            var topic = { keyword: 'akeyword', weight: 0.9};
            var topics = [];
            RifTopicStrategy.mergeTopicsInto(topic, topics);
            expect(topic).toEqual({ keyword: 'akeyword', weight: 0.9});
            expect(topics).toEqual([]);
        });
        it('should update the topic weight for a new topic with a greater weight', function() {
            var topic = { keyword: 'akeyword', weight: 0.4};
            var new_topic = { keyword: 'akeyword', weight: 0.7};
            var topics = [new_topic];
            RifTopicStrategy.mergeTopicsInto(topic, topics);
            expect(topic).toEqual({ keyword: 'akeyword', weight: 0.7});
            expect(topics).toEqual([]);
        });
        it('should not update the topic weight for a new topic with a lesser weight', function() {
            var topic = { keyword: 'akeyword', weight: 0.4};
            var new_topic = { keyword: 'akeyword', weight: 0.2};
            var topics = [new_topic];
            RifTopicStrategy.mergeTopicsInto(topic, topics);
            expect(topic).toEqual({ keyword: 'akeyword', weight: 0.4});
            expect(topics).toEqual([]);
        });
        it('should not update the topic weight for a topic with a different keyword', function() {
            var topic = { keyword: 'akeyword', weight: 0.4};
            var new_topic = { keyword: 'bkeyword', weight: 0.9};
            var topics = [new_topic];
            RifTopicStrategy.mergeTopicsInto(topic, topics);
            expect(topic).toEqual({ keyword: 'akeyword', weight: 0.4});
            expect(topics).toEqual([new_topic]);
        });
        it('should update the topic further on in the topics array', function() {
            var topic = { keyword: 'akeyword', weight: 0.4};
            var new_topic = { keyword: 'bkeyword', weight: 0.8};
            var new_topic2 = { keyword: 'akeyword', weight: 0.9};
            var topics = [new_topic, new_topic2];
            RifTopicStrategy.mergeTopicsInto(topic, topics);
            expect(topic).toEqual({ keyword: 'akeyword', weight: 0.9});
            expect(topics).toEqual([new_topic]);
        });
    });
    describe('mergeClusterInto', function() {
        it('should return the original topics unchanged if the cluster is empty', function() {
            var topics = [{keyword: 'keyword', weight: 1}];
            var cluster = [];
            RifTopicStrategy.mergeClusterInto(topics, cluster);
            expect(topics).toEqual([{keyword: 'keyword', weight: 1}]);
        });
        it('should merge the cluster topics into the running topics', function() {
            var topics = [{keyword: 'keyword', weight: 1}];
            var cluster = [{keyword: 'ckeyword', weight: 0.9}];
            RifTopicStrategy.mergeClusterInto(topics, cluster);
            expect(topics).toEqual([{keyword: 'keyword', weight: 1}, {keyword: 'ckeyword', weight: 0.9}]);
        });
        it('should scale the cluster topics by the cluster weight', function() {
            var topics = [{keyword: 'keyword', weight: 1}];
            var cluster = [{keyword: 'ckeyword', weight: 0.8}];
            var cluster_model = { weight: 0.5 };
            RifTopicStrategy.mergeClusterInto(topics, cluster, cluster_model);
            expect(topics).toEqual([{keyword: 'keyword', weight: 1}, {keyword: 'ckeyword', weight: 0.4}]);
        });
        it('should combine matching keywords in a more positive way', function() {
            var topics = [{keyword: 'keyword', weight: 1}];
            var cluster = [{keyword: 'keyword', weight: 0.8}];
            RifTopicStrategy.mergeClusterInto(topics, cluster);
            expect(topics).toEqual([{keyword: 'keyword', weight: 1.4}]);
        });
    });
    describe('mergeTopics', function() {
        it('should return an empty array for empty inputs', function() {
            expect(RifTopicStrategy.mergeTopics([], [])).toEqual([]);
        });
        it('should return called topics', function() {
            expect(RifTopicStrategy.mergeTopics([{keyword: 'keyword1', weight: 1}], [])).toEqual([{keyword: 'keyword1', weight: 1}]);
        });
        it('should merge current topics into called topics', function() {
            var merged = RifTopicStrategy.mergeTopics(
                [{keyword: 'keyword1', weight: 1}],
                [{keyword: 'keyword2', weight: 0.5}]
            );
            expect(merged).toEqual([
                {keyword: 'keyword1', weight: 1},
                {keyword: 'keyword2', weight: 0.5}
            ]);
        });
        it('should scale new topics if a scale is passed', function() {
            var merged = RifTopicStrategy.mergeTopics(
                [{keyword: 'keyword1', weight: 1}],
                [{keyword: 'keyword2', weight: 0.5}],
                0.5
            );
            expect(merged).toEqual([
                {keyword: 'keyword1', weight: 1},
                {keyword: 'keyword2', weight: 0.25}
            ]);
        });
        it('should not replace topic with topic having lower value', function() {
            var merged = RifTopicStrategy.mergeTopics(
                [{keyword: 'keyword1', weight: 0.6}],
                [{keyword: 'keyword1', weight: 0.5}]
            );
            expect(merged).toEqual([
                {keyword: 'keyword1', weight: 0.6}
            ]);
        });
        it('should replace topic if higher value', function() {
            var merged = RifTopicStrategy.mergeTopics(
                [{keyword: 'keyword1', weight: 0.6}],
                [{keyword: 'keyword1', weight: 0.8}]
            );
            expect(merged).toEqual([
                {keyword: 'keyword1', weight: 0.8}
            ]);
        });
    });
    describe('decayTopics', function() {
        it('should set decay toward 0 for a single item', function() {
            var topics = [ { keyword: 'keyword1', weight: 1}];
            RifTopicStrategy.decayTopics(topics);
            expect(topics).toEqual( [
                {keyword: 'keyword1', weight: 0.8}
            ]);
        });
        it('should set create a new array with topic weights decayed toward 0 for multiple items', function() {
            var topics = [ { keyword: 'keyword1', weight: 1}, { keyword: 'keyword2', weight: 0.8}];
            RifTopicStrategy.decayTopics(topics);
            expect(topics).toEqual( [
                {keyword: 'keyword1', weight: 0.8},
                {keyword: 'keyword2', weight: 0.64}
            ]);
        });
        it('should not change topics with weight 0', function() {
            var topics = [ { keyword: 'keyword1', weight: 0}];
            RifTopicStrategy.decayTopics(topics);
            expect(topics).toEqual( [
                {keyword: 'keyword1', weight: 0}
            ]);
        });
    });
});