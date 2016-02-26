define(['./response_core'], function (RifResponseCore) {
    "use strict";
    var type = function(world) {
        this.world = world;
    };

    var proto = type.prototype;

    function getCurrentSection(response) {
        var section = undefined;
        var does = response.does;
        if (does) {
            var section = does[response.run.toString()];
            if (!section) {
                section = does.common;
            }
        }
        return section;
    }

    function incrementResponseRunCount(response) {
        response.run = (response.run || 0) + 1;
    }

    proto.process_says = function (action, context) {
        context.interact.say(action.says, context.responder);
    };

    proto.process_sets = function (action, context) {
        this.world.setState(action.sets, context.responder || "");
    };

    proto.process_uses = function (action, context) {
        var self = this;
        if (action.uses.all) {
            $.each(action.uses.all, function(index, child) {
                if (RifResponseCore.responseIsEligible(child, context.topics, context.responder, self.world)) {
                    self.processResponse({response: child, responder: context.responder}, context.caller, context.interact, context.topics);
                }
            });
        }
        if (action.uses.first) {
            $.each(action.uses.first, function(index, child) {
                if (RifResponseCore.responseIsEligible(child, context.topics, context.responder, self.world)) {
                    self.processResponse({response: child, responder: context.responder}, context.caller, context.interact, context.topics);
                    return false;
                }
            });
        }
        if (action.uses.random) {
            var list = [];
            $.each(action.uses.random, function(index, child) {
                if (RifResponseCore.responseIsEligible(child, context.topics, context.responder, self.world)) {
                    list.push(child);
                }
            });
            if (list.length !== 0) {
                var index = this.world.getRandomInRange(0, list.length-1);
                self.processResponse({response: list[index], responder: context.responder}, context.caller, context.interact, context.topics);
            }
        }
    };

    proto.process_calls = function (action, context) {
        context.interact.call(action.calls);
    };

    proto.process_animates = function (action, context) {
        context.interact.animate(action.animates);
    };

    proto.process_invokes = function (action, context) {
        context.interact.invoke(action.invokes);
    };

    proto.process_moves = function(action, context) {
        this.world.setParent(action.moves.target || context.responder, action.moves.to);
    };

    proto.process_suggests = function (action, context) {
        context.interact.suggest(action.suggests);
    };

    proto.process_adds = function (action, context) {
        context.interact.addTopics(action.adds.keywords, action.adds.to || context.responder);
    };

    proto.processResponse = function (candidate, caller, interact, topics) {
        var response = candidate.response;
        var responder = candidate.responder;
        incrementResponseRunCount(response);
        var section = getCurrentSection(response);
        var context = {
            responder: responder,
            interact: interact,
            caller: caller,
            topics: topics
        };
        if (section) {
            var self = this;
            $.each(section, function(index, action) {
                $.each(action, function(key) {
                    self['process_'+key](action, context);
                });
            });
        }
    };

    return type;
});
