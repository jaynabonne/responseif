define(['./response_core'], function (RifResponseCore) {
    "use strict";
    var type = function(caller, interact, topics, world) {
        this.caller = caller;
        this.interact = interact;
        this.topics = topics;
        this.world = world;
    };

    var proto = type.prototype;

    function getCurrentSection(response) {
        var section = undefined;
        var does = response.does;
        if (does) {
            section = does[response.run.toString()];
            if (!section) {
                section = does.common;
            }
        }
        return section;
    }

    function incrementResponseRunCount(response) {
        response.run = (response.run || 0) + 1;
    }

    proto.process_says = function (action, responder) {
        this.interact.say(action.says, responder);
    };

    proto.process_sets = function (action, responder) {
        this.world.setState(action.sets, responder || "");
    };

    proto.process_uses = function (action, responder) {
        var self = this;
        if (action.uses.all) {
            $.each(action.uses.all, function(index, child) {
                if (RifResponseCore.responseIsEligible(child, self.topics, responder, self.world)) {
                    self.processAResponse(child, responder);
                }
            });
        }
        if (action.uses.first) {
            $.each(action.uses.first, function(index, child) {
                if (RifResponseCore.responseIsEligible(child, self.topics, responder, self.world)) {
                    self.processAResponse(child, responder);
                    return false;
                }
            });
        }
        if (action.uses.random) {
            var list = [];
            $.each(action.uses.random, function(index, child) {
                if (RifResponseCore.responseIsEligible(child, self.topics, responder, self.world)) {
                    list.push(child);
                }
            });
            if (list.length !== 0) {
                var index = this.world.getRandomInRange(0, list.length-1);
                self.processAResponse(list[index], responder);
            }
        }
    };

    proto.process_calls = function (action) {
        this.interact.call(action.calls);
    };

    proto.process_animates = function (action) {
        this.interact.animate(action.animates);
    };

    proto.process_invokes = function (action) {
        this.interact.invoke(action.invokes);
    };

    proto.process_moves = function(action, responder) {
        this.world.setParent(action.moves.target || responder, action.moves.to);
    };

    proto.process_suggests = function (action) {
        this.interact.suggest(action.suggests);
    };

    proto.process_adds = function (action, responder) {
        this.interact.addTopics(action.adds.keywords, action.adds.to || responder);
    };

    proto.processAResponse = function(response, responder) {
        incrementResponseRunCount(response);
        var section = getCurrentSection(response);
        if (section) {
            var self = this;
            $.each(section, function(index, action) {
                $.each(action, function(key) {
                    self['process_'+key](action, responder);
                });
            });
        }
    };

    proto.processResponse = function (candidate) {
        this.processAResponse(candidate.response, candidate.responder);
    };

    return type;
});
