define(['rif/topic_strategy'], function(RifTopicStrategy) {
    describe('mergeCurrentTopics', function() {
        it('should return an empty array for empty inputs', function() {
            expect(RifTopicStrategy.mergeCurrentTopics([], [])).toEqual([]);
        });
        it('should return called topics', function() {
            expect(RifTopicStrategy.mergeCurrentTopics([{keyword: 'keyword1', weight: 100}], [])).toEqual([{keyword: 'keyword1', weight: 100}]);
        });
        it('should merge current topics into called topics', function() {
            var merged = RifTopicStrategy.mergeCurrentTopics(
                [{keyword: 'keyword1', weight: 100}],
                [{keyword: 'keyword2', weight: 50}]
            );
            expect(merged).toEqual([
                {keyword: 'keyword1', weight: 100},
                {keyword: 'keyword2', weight: 50}
            ]);
        });
        it('should not replace topic with topic having lower value', function() {
            var merged = RifTopicStrategy.mergeCurrentTopics(
                [{keyword: 'keyword1', weight: 60}],
                [{keyword: 'keyword1', weight: 50}]
            );
            expect(merged).toEqual([
                {keyword: 'keyword1', weight: 60}
            ]);
        });
        it('should replace topic if higher value', function() {
            var merged = RifTopicStrategy.mergeCurrentTopics(
                [{keyword: 'keyword1', weight: 60}],
                [{keyword: 'keyword1', weight: 80}]
            );
            expect(merged).toEqual([
                {keyword: 'keyword1', weight: 80}
            ]);
        });
    });
});