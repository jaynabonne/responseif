var ResponseLib = (function () {
    "use strict";
    var type = function (interact) {
        this.interact = interact;
        this.types = [];
    };

    var PriorityResponseGetter = (function () {
        var type = function (candidates) {
            this.reset(-1);
            this.addPriorityResponses(candidates);
        };

        var proto = type.prototype;

        proto.reset = function (score) {
            this.results = [];
            this.score = score;
        };

        proto.updateScore = function (score) {
            if (score > this.score) {
                this.reset(score);
            }
        };

        proto.addResponse = function (response) {
            if (response.score === this.score) {
                this.results.push(response);
            }
        };

        proto.addPriorityResponse = function (response) {
            this.updateScore(response.score);
            this.addResponse(response);
        };

        proto.addPriorityResponses = function (candidates) {
            var self = this;
            var bound = function(response) {
                self.addPriorityResponse(response)
            }
            candidates.forEach(bound);
        };

        return type;
    }());

    function hasRunAndRuns(response) { return response.runs !== undefined && response.run !== undefined; }

    function responseCountValid(response) { return !hasRunAndRuns(response) || response.run < response.runs; }

    function hasTopics(response) { return response.matches !== undefined; }

    function topicInTopics(topic, topics) { return topics.indexOf(topic) !== -1; }

    function isRequiredTopic(topic) { return topic[0] === "*"; }

    function extractTopic(topic) { return isRequiredTopic(topic) ? topic.substring(1) : topic; }

    function hasRequiredTopics(response, topics) {
        for (var i = 0; i < response.matches.length; ++i) {
            var topic = response.matches[i];
            if (isRequiredTopic(topic) && !topicInTopics(extractTopic(topic), topics)) {
                return false;
            }
        }
        return true;
    }

    function responseRequiredTopicsAreDefined(response, topics) { return !hasTopics(response) || hasRequiredTopics(response, topics); }

    function computeTopicScore(topic, topics) {
        for (var i = 0; i < topics.length; ++i) {
            if (topic === topics[i]) {
                return 10000;
            }
        }
        return 0;
    }

    function doComputeScore(response_topics, topics) {
        var score = 0;
        for (var i = 0; i < response_topics.length; ++i) {
            score += computeTopicScore(extractTopic(response_topics[i]), topics);
        }
        return score;
    }

    var proto = type.prototype;

    proto.stateNeedIsMet = function(id) {
        if (id[0] === '!') {
            return !this.interact.getState(id.substr(1));
        } else {
            return this.interact.getState(id);
        }
    };

    proto.responseNeedsAreMet = function(response) {
        if (response.needs) {
            for (var i = 0; i < response.needs.length; ++i) {
                if (!this.stateNeedIsMet(response.needs[i])) {
                    return false;
                }
            }
        }
        return true;
    };
    proto.responseIsEligible = function(response, topics) {
        return responseCountValid(response) &&
                this.responseNeedsAreMet(response) &&
                responseRequiredTopicsAreDefined(response, topics);
    };

    proto.computeScore = function(response_topics, topics) {
        return (!response_topics || response_topics.length === 0) ? 10000 : doComputeScore(response_topics, topics);
    };

    proto.addIfHasScore = function (response, topics, candidates) {
        var score = this.computeScore(response.matches, topics);
        if (score > 0) {
            candidates.push({response: response, score: score});
        }
    };

    proto.addResponse = function (response, topics, candidates) {
        if (this.responseIsEligible(response, topics)) {
            if (response.groups !== undefined) {
                this.addResponses(response.groups, topics, candidates);
            } else {
                this.addIfHasScore(response, topics, candidates);
            }
        }
    };

    proto.addResponses = function (responses, topics, candidates) {
        var self = this;
        var boundAdd = function (response) { self.addResponse(response, topics, candidates); };
        responses.forEach(boundAdd);
        return candidates;
    };

    proto.selectResponses = function(responses, topics) {
        return this.addResponses(responses, topics, []);
    };

    proto.getPriorityResponses = function (candidates) {
        return new PriorityResponseGetter(candidates).results;
    };

    function incrementResponseRunCount(response) {
        response.run = (response.run || 0) + 1;
    }

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
    };

    proto.processSays = function (response) {
        var section = getCurrentSection(response);
        if (section && section.says) {
            this.interact.say(section.says, response);
        }
    };

    proto.processResponse = function (candidate, caller) {
        incrementResponseRunCount(candidate.response);
        this.processSays(candidate.response);
    };

    function groupCandidates(candidates, prompts) {
        var groups = { };
        candidates.forEach(function (candidate) {
            if (candidate.response.prompts) {
                prompts.push(candidate);
            } else {
                var type = candidate.response.is || "default";
                if (!groups[type]) {
                    groups[type] = [];
                }
                groups[type].push(candidate);
            }
        });
        return groups;
    }

    proto.processGroup = function(group, caller) {
        var self = this;
        group.forEach(function(response) { self.processResponse(response, caller); });
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

    proto.runMenu = function(prompts, caller) {
        var self = this;
        var items = getMenuItems(prompts);
        this.interact.choose(items, function (which) {
            if (which !== -1) {
                self.processMenuResponses(items[which], prompts, caller);
            }
        });
    };

    proto.processPrompts = function (prompts, caller) {
        if (prompts.length === 1 && !prompts[0].response.forceprompt) {
            this.processGroup(prompts, caller);
        } else if (prompts.length > 0) {
            this.runMenu(prompts, caller);
        }
    };

    proto.processDefinedGroups = function(groups, caller) {
        var self = this;
        this.types.forEach(function (type) {
            if (groups.hasOwnProperty(type)) {
                self.processGroup(groups[type], caller);
                groups[type] = undefined;
            }
        });
    };

    proto.processGroups = function(groups, caller) {
        for (var group in groups) {
            if (groups.hasOwnProperty(group) && groups[group]) {
                this.processGroup(groups[group], caller);
            }
        }
    };

    proto.processResponses = function (candidates, caller) {
        var self = this;
        var prompts = [];
        var groups = groupCandidates(candidates, prompts);

        this.processDefinedGroups(groups, caller);
        this.processGroups(groups, caller);
        this.processPrompts(prompts, caller);
    };

    proto.setTypes = function(types) {
        this.types = types;
    };

    return type;
})();
