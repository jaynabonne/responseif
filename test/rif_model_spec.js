define(['rif/model'], function(RifModel) {
    "use strict";
    var model;
    describe("rifModel", function () {
        beforeEach(function() {
            model = new RifModel();
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
        it('should not update an existing topic weight if the new one is less', function() {
            model.addTopics('cluster_id', [{keyword: 'atopic', weight: 0.9}]);
            model.addTopics('cluster_id', [{keyword: 'atopic', weight: 0.6}]);
            expect(model.getTopics('cluster_id')).toEqual([{keyword: 'atopic', weight: 0.9}]);
        });
        describe('getCurrentTopics', function() {
            it('should default to having no current topics', function() {
                expect(model.getCurrentTopics()).toEqual([]);
            });
            it('should return a topic assigned to a cluster', function() {
                model.addTopics('cluster1', [{keyword: 'atopic', weight: 1}]);
                expect(model.getCurrentTopics()).toEqual([{keyword: 'atopic', weight: 1}]);
            });
            it('should return topics assigned to multiple clusters', function() {
                model.addTopics('cluster1', [{keyword: 'atopic', weight: 1}]);
                model.addTopics('cluster2', [{keyword: 'btopic', weight: 0.8}]);
                expect(model.getCurrentTopics()).toEqual([{keyword: 'atopic', weight: 1}, {keyword: 'btopic', weight: 0.8}]);
            });
            it('should combine topics with the same keyword in a positive way', function() {
                model.addTopics('cluster1', [{keyword: 'atopic', weight: 0.2}]);
                model.addTopics('cluster2', [{keyword: 'atopic', weight: 0.4}]);
                expect(model.getCurrentTopics()).toEqual([{keyword: 'atopic', weight: 0.56}]);
            });
            it('should use the cluster model weight, if there is one', function() {
                model.addTopics('cluster1', [{keyword: 'atopic', weight: 0.8}]);
                var rif_model = { cluster1 : { weight: 0.5}};
                expect(model.getCurrentTopics(rif_model)).toEqual([{keyword: 'atopic', weight: 0.4}]);
            });
        });
        describe('update', function() {
            it('should apply cluster decays', function() {
                model.addTopics('cluster1', [{keyword: 'atopic', weight: 0.8}]);
                expect(model.getTopics('cluster1')).toEqual([{keyword: 'atopic', weight: 0.8}]);

                var rif_model = { cluster1 : { decaying: 0.5}};
                model.update(rif_model);

                expect(model.getTopics('cluster1')).toEqual([{keyword: 'atopic', weight: 0.4}]);
            });
        });
        describe('suggestTopics', function() {
            it('should add topics to suggestible clusters', function() {
                var rif_model = { cluster1 : { suggestible: true}};
                model.suggestTopics([{keyword: 'stopic', weight: 0.9}], rif_model);

                expect(model.getTopics('cluster1')).toEqual([{keyword: 'stopic', weight: 0.9}]);
            });
            it('should not add topics to non-suggestible clusters', function() {
                var rif_model = { cluster1 : { }};
                model.suggestTopics([{keyword: 'stopic', weight: 0.9}], rif_model);

                expect(model.getTopics('cluster1')).toEqual([]);
            });
        });
    });
});
