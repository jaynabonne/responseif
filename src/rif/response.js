define(['./response_core','./response_processor','./priority_response_getter'], function (RifResponseCore, RifResponseProcessor, RifPriorityResponseGetter) {
    "use strict";
    var type = function (world, story_text) {
        this.world = world;
        this.story_text = story_text;
        this.types = ['general'];
    };

    var proto = type.prototype;

    proto.processResponses = function (candidates, caller, topics, interact) {
        var processor = new RifResponseProcessor(caller, interact, topics, this.world, this.story_text);
        processor.processResponses(candidates, this.types);
    };

    proto.setTypes = function(types) {
        this.types = types;
    };

    proto.getCandidateResponses = function(responders, topics) {
        var world = this.world;
        var candidates = [];
        $.each(responders, function(responder) {
            var responses = responders[responder];
            if (responses) {
                candidates = candidates.concat(RifResponseCore.selectResponses(responses, topics, responder, world));
            }
        });
        return candidates;
    };

    proto.callTopics = function(responders, topics, caller, interact) {

        var candidates = this.getCandidateResponses(responders, topics);
        candidates = RifPriorityResponseGetter.getPriorityResponses(candidates);

        this.processResponses(candidates, caller, topics, interact);
    };

    return type;
});
