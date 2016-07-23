define(['./topic_strategy'], function(RifTopicStrategy) {
    "use strict";

    function convertTopics(topics) {
        return topics.map(function(value) { return {keyword: value, weight: 1.0} });
    }

    var type = function (dom, world, response_lib, rif, story_text) {
        this.dom = dom;
        this.world = world;
        this.response_lib = response_lib;
        this.rif = rif;
        this.story_text = story_text;
    };

    type.prototype = {
        choose: function(options, callback) {
            var self = this;
            var click_callback = function(index) {
                self.story_text.hideSections();
                callback(index);
                self.idleProcessing();
            };

            this.story_text.choose(options, click_callback);
        },
        callTopicString: function(topics) {
            var index = topics.indexOf('>');
            if (index >= 0) {
                var caller = topics.substring(index+1);
                topics = topics.substring(0, index);
                this.callTopicsForCaller(this.world.getState(caller), convertTopics(topics.split(" ")));
            } else {
                this.call(convertTopics(topics.split(" ")));
            }
        },
        callTopicsForCaller: function (caller, topics) {
            var responders = this.world.getCurrentResponders(caller);
            this.callTopicsWithResponders(topics, responders, caller);
        },
        call: function(topics) {
            this.callTopicsForCaller(this.world.getPOV(), topics);
        },
        getResponses: function (responders) {
            var responses = {};
            if (!this.rif.responses)
                return responses;
            var self = this;
            $.each(responders, function (index, value) {
                if (self.rif.responses[value])
                    responses[value] = self.expandResponseReferences(self.rif.responses[value]);
            });
            return responses;
        },
        callTopicsWithResponders: function(topics, responders, caller) {
            var merged_topics = RifTopicStrategy.mergeCurrentTopics(topics, this.world.getCurrentTopics(caller));
            this.response_lib.callTopics(this.getResponses(responders), merged_topics, caller, this, this.story_text);
        },
        invoke: function(body, responder) {
            var f = new Function('world', 'interact', 'story_text', 'responder', body);
            f(this.world, this, this.story_text, responder);
        },
        sendCommand: function(topics) {
            this.story_text.hideSections();
            this.story_text.beforeCommand();
            this.call(topics);
            this.idleProcessing();
            this.world.updateModels();
            this.hideObsoleteLinks();
        },
        sendCommandTopics: function(keywords) {
            this.sendCommand(convertTopics(keywords.split(" ")));
        },
        hideObsoleteLinks: function() {
            var self = this;
            var responders = this.world.getCurrentResponders(this.world.getPOV());
            var responses = this.getResponses(responders);
            this.story_text.filterLinks(function(link) {
                var candidates = self.response_lib.getCandidateResponses(responses, convertTopics(link.keywords.split(' ')));
                if (candidates.length === 0) {
                    self.dom.removeClass(link.selector, 'keyword');
                    self.dom.removeEvent(link.selector, 'click');
                    return false;
                }
                return true;
            });
        },
        idleProcessing: function() {
            this.callActions(["ACT"]);
        },
        addResponseReferences : function(responses, new_responses) {
            if (!responses) {
                return;
            }
            var self = this;
            $.each(responses, function(index, value) {
                if (value.reference) {
                    self.addResponseReferences(self.rif.responses[value.reference], new_responses);
                } else {
                    new_responses.push(value);
                }
            });
        },
        expandResponseReferences: function(responses) {
            var new_responses = [];
            this.addResponseReferences(responses, new_responses);
            return new_responses;
        },
        callActions: function(topics) {
            topics = convertTopics(topics);
            var actions = this.rif.actions;
            for (var actor in actions) {
                if (actions.hasOwnProperty(actor)) {
                    var responses = {};
                    responses[actor] = actions[actor];
                    var merged_topics = RifTopicStrategy.mergeCurrentTopics(topics, this.world.getCurrentTopics(actor));
                    this.response_lib.callTopics(responses, merged_topics, actor, this, this.story_text);
                }
            }
        },
        runSetups: function() {
            var setups = this.rif.setup;
            if (!setups) {
                return;
            }
            var self = this;

            $.each(setups, function(index, setup) {
                var responders = {};
                responders[setup.responder] = setup.responses;

                self.response_lib.callTopics( responders, [], '', self, self.story_text );
            });
        }
    };
    return type;
});
