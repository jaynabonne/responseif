define(['./topic_strategy', './response_core'], function(RifTopicStrategy, rifResponseCore) {
    "use strict";

    var type = function (world, response_lib, rif, story_text) {
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
                this.callTopicsForCaller(this.world.getState(caller), rifResponseCore.convertTopics(topics));
            } else {
                this.call(rifResponseCore.convertTopics(topics));
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
            return rifResponseCore.getResponsesForResponders(responders, this.rif);
        },
        callTopicsWithResponders: function(topics, responders, caller) {
            var merged_topics = RifTopicStrategy.mergeCurrentTopics(topics, this.world.getCurrentTopics(caller));
            var responses = rifResponseCore.getResponsesForResponders(responders, this.rif);
            this.response_lib.callTopics(responses, merged_topics, caller, this);
        },
        invoke: function(body, responder) {
            var f = new Function('world', 'interact', 'story_text', 'responder', body);
            f(this.world, this, this.story_text, responder);
        },
        sendCommand: function(topics) {
            this.story_text.beforeCommand();

            this.call(topics);

            this.idleProcessing();

            this.story_text.afterCommand();
        },
        sendCommandTopics: function(keywords) {
            this.sendCommand(rifResponseCore.convertTopics(keywords));
        },
        idleProcessing: function() {
            this.callActions("ACT");
            this.world.updateModels();
        },
        callActions: function(topics) {
            topics = rifResponseCore.convertTopics(topics);
            var actions = this.rif.actions;
            for (var actor in actions) {
                if (actions.hasOwnProperty(actor)) {
                    var responses = {};
                    responses[actor] = actions[actor];
                    var merged_topics = RifTopicStrategy.mergeCurrentTopics(topics, this.world.getCurrentTopics(actor));
                    this.response_lib.callTopics(responses, merged_topics, actor, this);
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

                self.response_lib.callTopics( responders, [], '', self );
            });
        }
    };
    return type;
});
