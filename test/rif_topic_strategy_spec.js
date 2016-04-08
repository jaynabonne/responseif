define(['rif/topic_strategy'], function(RifTopicStrategy) {
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
        it('should set create a new array with topic weights decayed toward 0 for a single item', function() {
            var topics = [ { keyword: 'keyword1', weight: 1}];
            var new_topics = RifTopicStrategy.decayTopics(topics);
            expect(new_topics).toEqual( [
                {keyword: 'keyword1', weight: 0.8}
            ]);
        });
        it('should set create a new array with topic weights decayed toward 0 for multiple items', function() {
            var topics = [ { keyword: 'keyword1', weight: 1}, { keyword: 'keyword2', weight: 0.8}];
            var new_topics = RifTopicStrategy.decayTopics(topics);
            expect(new_topics).toEqual( [
                {keyword: 'keyword1', weight: 0.8},
                {keyword: 'keyword2', weight: 0.64}
            ]);
        });
        it('should not change topics with weight 0', function() {
            var topics = [ { keyword: 'keyword1', weight: 0}];
            var new_topics = RifTopicStrategy.decayTopics(topics);
            expect(new_topics).toEqual( [
                {keyword: 'keyword1', weight: 0}
            ]);
        });
        it('should not modify the original topic objects', function() {
            var topics = [ { keyword: 'keyword1', weight: 1}, { keyword: 'keyword2', weight: 0.8}];
            var new_topics = RifTopicStrategy.decayTopics(topics);
            expect(topics[0].weight).toBe(1);
            expect(topics[1].weight).toBe(0.8);
        });
    });
});