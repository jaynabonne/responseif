define(['rif/model'], function(RifModel) {
    "use strict";
    var model
    describe("rifModel", function () {
        beforeEach(function() {
            model = new RifModel();
        });
        it('should default to having no current topics', function() {
            expect(model.getCurrentTopics()).toEqual([]);
        });
        it('should default to having no topics for a cluster id', function() {
            expect(model.getTopics('cluster_id')).toEqual([]);
        });
        it('should be able to add and get a cluster topic', function() {
            model.addTopics('cluster_id', [{keyword: 'atopic', weight: 0.9}]);
            expect(model.getTopics('cluster_id')).toEqual([{keyword: 'atopic', weight: 0.9}]);
        });
        it('should add and get topics for different clusters', function() {
            model.addTopics('cluster_id', [{keyword: 'atopic', weight: 0.9}]);
            model.addTopics('cluster_id2', [{keyword: 'btopic', weight: 0.7}]);
            expect(model.getTopics('cluster_id')).toEqual([{keyword: 'atopic', weight: 0.9}]);
            expect(model.getTopics('cluster_id2')).toEqual([{keyword: 'btopic', weight: 0.7}]);
        });
        it('should add and get multiple cluster topics', function() {
            model.addTopics('cluster_id', [{keyword: 'atopic', weight: 0.9}]);
            model.addTopics('cluster_id', [{keyword: 'btopic', weight: 0.6}]);
            expect(model.getTopics('cluster_id')).toEqual([{keyword: 'atopic', weight: 0.9}, {keyword: 'btopic', weight: 0.6}]);
        });
        it('should delete existing topics', function() {
            model.addTopics('cluster_id', [{keyword: 'atopic', weight: 0.6},{keyword: 'btopic', weight: 0.9},{keyword: 'ctopic', weight: 0.4}]);
            model.removeTopics('cluster_id', [{keyword: 'atopic'},{keyword: 'ctopic'}]);
            expect(model.getTopics('cluster_id')).toEqual([{keyword: 'btopic', weight: 0.9}]);
        });
        it('should update an existing topic weight if the new one is greater', function() {
            model.addTopics('cluster_id', [{keyword: 'atopic', weight: 0.6}]);
            model.addTopics('cluster_id', [{keyword: 'atopic', weight: 0.9}]);
            expect(model.getTopics('cluster_id')).toEqual([{keyword: 'atopic', weight: 0.9}]);
        });
    });
});
