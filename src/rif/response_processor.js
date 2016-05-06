define(['./response_core','./priority_response_getter', './fuzzy'], function (RifResponseCore, RifPriorityResponseGetter, RifFuzzy) {
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

    function incrementResponseRunCount(response, world) {
        response.run = (response.run || world.getResponseRuns(response.id)) + 1;
        world.setResponseRuns(response.id, response.run);
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
                    self.processResponse(child, responder);
                }
            });
        }
        if (action.uses.first) {
            $.each(action.uses.first, function(index, child) {
                if (RifResponseCore.responseIsEligible(child, self.topics, responder, self.world)) {
                    self.processResponse(child, responder);
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
                self.processResponse(list[index], responder);
            }
        }
        if (action.uses.best){
            var candidates = RifResponseCore.selectResponses(action.uses.best, this.topics, responder, this.world);
            this.processResponses(RifPriorityResponseGetter.getPriorityResponses(candidates));
        }
    };

    proto.process_calls = function (action) {
        this.interact.call(action.calls);
    };

    proto.process_animates = function (action) {
        this.interact.animate(action.animates);
    };

    proto.process_invokes = function (action, responder) {
        this.interact.invoke(action.invokes, responder);
    };

    proto.process_moves = function(action, responder) {
        this.world.setParent(action.moves.target || responder, action.moves.to);
    };

    proto.process_suggests = function (action, responder) {
        this.world.suggestTopics(responder, action.suggests.keywords);
    };

    proto.process_adds = function (action, responder) {
        this.world.addTopics(action.adds.actor || responder, action.adds.keywords, action.adds.cluster);
    };

    proto.process_resets = function (action, responder, response) {
        response.run = 0;
        this.world.setResponseRuns(response.id, response.run);
    };

    proto.process_clears = function (action) {
        this.interact.clear(action.clears);
    };

    proto.process_adjusts = function (action, responder, response) {
        var adjusts = action.adjusts;
        var value = this.world.getState(adjusts.variable, responder);
        var target = this.world.getState(adjusts.toward || "0", responder);
        var increment = this.world.getState(adjusts.stepping || "0.2", responder);
        var new_value = RifFuzzy.adjust(value, target, increment);
        this.world.setState({expression: adjusts.variable+'='+new_value}, responder);
    };

    proto.processResponse = function(response, responder) {
        incrementResponseRunCount(response, this.world);
        var section = getCurrentSection(response);
        if (section) {
            var self = this;
            $.each(section, function(index, action) {
                $.each(action, function(key) {
                    self['process_'+key](action, responder, response);
                });
            });}
    };

    function orderCompare(a, b) {
        return (a.response.orders || 1) - (b.response.orders || 1);
    }

    proto.processGroup = function(group) {
        var self = this;
        group.sort(orderCompare);
        group.forEach(function(candidate) { self.processResponse(candidate.response, candidate.responder); });
    };

    function addPrompt(items, candidate) {
        var prompt = candidate.response.prompts;
        if (items.indexOf(prompt) === -1) {
            items.push(prompt);
        }
    }

    function getMenuItems(prompts) {
        var items = [];
        prompts.forEach(function (candidate) { addPrompt(items, candidate); });
        return items;
    }

    proto.processMenuResponses = function(prompt, prompts) {
        var self = this;
        prompts.forEach(function (candidate) {
            if (candidate.response.prompts === prompt) {
                self.processResponse(candidate.response, candidate.responder);
            }
        });
    };

    proto.runMenu = function(prompts) {
        var self = this;
        var items = getMenuItems(prompts);
        this.interact.choose(items, function (which) {
            if (which !== -1) {
                self.processMenuResponses(items[which], prompts);
            }
        });
    };

    function forcesPrompt(response) {
        return response.forcesprompt === undefined || response.forcesprompt;
    }

    proto.processPrompts = function(prompts) {
        if (prompts.length === 1 && !forcesPrompt(prompts[0].response)) {
            this.processGroup(prompts);
        } else if (prompts.length > 0) {
            this.runMenu(prompts);
        }
    };

    proto.processDefinedGroups = function(groups, types) {
        var self = this;
        types.forEach(function (type) {
            if (groups.hasOwnProperty(type)) {
                self.processGroup(groups[type]);
                groups[type] = undefined;
            }
        });
    };

    proto.processGroups = function(groups) {
        var self = this;
        $.each(groups, function(index, group) {
            if (group) {
                self.processGroup(group);
            }
        });
    };

    proto.processResponses = function(candidates, types) {
        types = types || [];
        var candidate_groups = RifResponseCore.groupCandidates(candidates);

        this.processDefinedGroups(candidate_groups.groups, types);
        this.processGroups(candidate_groups.groups);
        this.processPrompts(candidate_groups.prompts);
    };

    return type;
});
