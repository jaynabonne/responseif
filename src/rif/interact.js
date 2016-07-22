define(['./topic_strategy','./story_text'], function(RifTopicStrategy, RifStoryText) {
    "use strict";

    function convertTopics(topics) {
        return topics.map(function(value) { return {keyword: value, weight: 1.0} });
    }

    var type = function (dom, formatter, world, response_lib, rif) {
        this.dom = dom;
        this.formatter = formatter;
        this.world = world;
        this.response_lib = response_lib;
        this.rif = rif;
        var self = this;

        var clickFactory = function (keywords) {
            return function (e) {
                var target = $(e.target);
                if (rif.clickEffect !== undefined) {
                    $.each(rif.clickEffect.transitions, function(index, transition) {
                        dom.animate(target, transition.to, transition.lasting);
                    });
                }
                self.sendCommand(convertTopics(keywords.split(" ")));
                return false;
            };
        };
        this.story_text = new RifStoryText(formatter, clickFactory, dom, world);
    };

    function expandCallMarkup(text, context, css_class) {
        context.begin(css_class);
        while (text !== "") {
            var index = text.indexOf("{+");
            if (index === -1) {
                break;
            }
            var end_index = text.indexOf("+}", index + 2);
            var topics = text.substring(index + 2, end_index);
            context.append(text.substring(0, index));
            this.callTopicString(topics);
            text = text.substring(end_index + 2);
        }
        context.append(text);
        context.end();
    }

    type.prototype = {
        say: function (says, responder) {
            var text = this.story_text.replaceMarkup(says.text, responder, this.world);

            var context = this.story_text.push_context();
            expandCallMarkup.call(this, text, context, says.as);
            this.story_text.pop_context(says, responder);
        },
        choose: function(options, callback) {
            var context = this.story_text.push_context();
            var self = this;
            var menu_index = context.addMenuCallback(function(index) {
                self.hideSections();
                callback(index);
                self.idleProcessing();
            });
            var says = { text: this.formatter.formatMenu(options, menu_index), autohides: true};
            this.say(says);
            this.story_text.pop_context(says, '');
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
            this.response_lib.callTopics(this.getResponses(responders), merged_topics, caller, this);
        },
        callActions: function(topics) {
            topics = convertTopics(topics);
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
        animate: function(animates) {
            this.story_text.animate(animates);
        },
        clear: function() {
            this.story_text.clear();
        },
        invoke: function(body, responder) {
            var f = new Function('world', 'interact', 'responder', body);
            f(this.world, this, responder);
        },
        sendCommand: function(topics) {
            this.story_text.hideSections();
            this.story_text.beforeCommand();
            this.call(topics);
            this.idleProcessing();
            this.world.updateModels();
            this.hideObsoleteLinks();
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
