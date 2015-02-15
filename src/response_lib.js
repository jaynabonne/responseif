var ResponseLib = (function () {
    "use strict";
    var type = function (interact, world) {
        this.interact = interact;
        this.world = world;
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

    function keywordInTopics(keyword, topics) {
        var found = false;
        $.each(topics, function(index, value) {
            if (value.keyword === keyword) {
                found = true;
            }
            return !found;
        });
        return found;
    }

    function isRequiredTopic(topic) { return topic.keyword[0] === "*"; }

    function extractTopic(topic) { return isRequiredTopic(topic) ? { keyword: topic.keyword.substring(1), weight: topic.weight} : topic; }

    function hasRequiredTopics(response, topics) {
        for (var i = 0; i < response.matches.length; ++i) {
            var topic = response.matches[i];
            if (isRequiredTopic(topic) && !keywordInTopics(extractTopic(topic).keyword, topics)) {
                return false;
            }
        }
        return true;
    }

    function responseRequiredTopicsAreDefined(response, topics) { return !hasTopics(response) || hasRequiredTopics(response, topics); }

    function getTopicWeight(topic) {
        return topic.weight || 100;
    }

    function computeTopicScore(topic, topics) {
        for (var i = 0; i < topics.length; ++i) {
            if (topic.keyword === topics[i].keyword) {
                return getTopicWeight(topic) * getTopicWeight(topics[i]);
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

    proto.getState = function(id, responder) {
        return this.world.getState(id, responder || "");
    };

    proto.setState = function(id, responder) {
        return this.world.setState(id, responder || "");
    };

    proto.stateNeedIsMet = function(id, responder) {
        return this.getState(id, responder);
    };

    proto.responseNeedsAreMet = function(response, responder) {
        if (response.needs) {
            for (var i = 0; i < response.needs.length; ++i) {
                if (!this.stateNeedIsMet(response.needs[i], responder)) {
                    return false;
                }
            }
        }
        return true;
    };
    proto.responseIsEligible = function(response, topics, responder) {
        return responseCountValid(response) &&
                this.responseNeedsAreMet(response, responder) &&
                responseRequiredTopicsAreDefined(response, topics);
    };

    proto.computeScore = function(response_topics, topics) {
        return (!response_topics || response_topics.length === 0) ? 10000 : doComputeScore(response_topics, topics);
    };

    proto.addIfHasScore = function (response, topics, candidates, responder) {
        var score = this.computeScore(response.matches, topics);
        if (score > 0) {
            candidates.push({response: response, score: score, responder: responder});
        }
    };

    proto.addResponse = function (response, topics, candidates, responder) {
        if (this.responseIsEligible(response, topics, responder)) {
            if (response.groups !== undefined) {
                this.addResponses(response.groups, topics, candidates, responder);
            } else {
                this.addIfHasScore(response, topics, candidates, responder);
            }
        }
    };

    proto.addResponses = function (responses, topics, candidates, responder) {
        var self = this;
        var boundAdd = function (response) { self.addResponse(response, topics, candidates, responder); };
        responses.forEach(boundAdd);
        return candidates;
    };

    proto.selectResponses = function(responses, topics, responder) {
        return this.addResponses(responses, topics, [], responder);
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

    proto.replaceMarkup = function(says, responder) {
        var newsays = jQuery.extend({}, says);
        var index;
        var text = newsays.text;
        while ((index = text.indexOf("{=")) != -1) {
            var endindex = text.indexOf("=}", index+2);
            if (endindex === -1) {
                break;
            }
            var id = text.substring(index+2, endindex);
            var value = this.getState(id.trim(" "), responder);
            text = text.substring(0, index) + value + text.substring(endindex+2);
        }
        newsays.text = text;
        return newsays;
    };

    proto.processSays = function (action, response, responder) {
        if (action.says) {
            var text = action.says.text;
            var newsays;
            while (text !== "") {
                var index = text.indexOf("{+");
                if (index === -1) {
                    break;
                }
                var end_index = text.indexOf("+}", index+2);
                var topics = text.substring(index+2, end_index);
                newsays = $.extend(action.says, {text: text.substring(0, index)});
                this.interact.say(this.replaceMarkup(newsays, responder), response);
                this.interact.call(topics.split(" "));
                text = text.substring(end_index+2);
            }
            newsays = $.extend(action.says, {text: text});
            this.interact.say(this.replaceMarkup(newsays, responder), response);
        }
    };

    proto.processSets = function (action, responder) {
        if (action.sets) {
            var self = this;
            action.sets.forEach( function(set) {
                self.setState(set, responder);
            })
        }
    };

    proto.processUses = function (action, responder) {
        if (action.uses) {
            var self = this;
            if (action.uses.all) {
                $.each(action.uses.all, function(index, child) {
                    if (self.responseIsEligible(child, [], responder)) {
                        self.processResponse({response: child, responder: responder});
                    }
                });
            }
            if (action.uses.first) {
                $.each(action.uses.first, function(index, child) {
                    if (self.responseIsEligible(child, [], responder)) {
                        self.processResponse({response: child, responder: responder});
                        return false;
                    }
                });
            }
        }
    };

    proto.processCalls = function(action) {
        if (action.calls) {
            this.interact.call(action.calls);
        }
    };

    proto.processAnimates = function(action) {
        if (action.animates) {
            this.interact.animate(action.animates);
        }
    };

    proto.processInvokes = function(action) {
        if (action.invokes) {
            this.interact.invoke(action.invokes);
        }
    };

    proto.processMoves = function(action) {
        if (action.moves) {
            this.interact.setParent(action.moves.target, action.moves.to);
        }
    };

    proto.processSuggests = function(action) {
        if (action.suggests) {
            this.interact.suggest(action.suggests);
        }
    };

    proto.processResponse = function (candidate, caller) {
        var response = candidate.response;
        var responder = candidate.responder;
        incrementResponseRunCount(response);
        var section = getCurrentSection(response);
        if (section) {
            var self = this;
            $.each(section, function(index, action) {
                self.processSays(action, response, responder);
                self.processSets(action, responder);
                self.processUses(action);
                self.processCalls(action);
                self.processAnimates(action);
                self.processInvokes(action);
                self.processMoves(action);
                self.processSuggests(action);
            });
        }
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

    function orderCompare(a, b) {
        var orderA = a.response.orders || 1;
        var orderB = b.response.orders || 1;
        return orderA < orderB
                ? -1
                : orderA === orderB
                    ? 0
                    : 1;
    }

    proto.processGroup = function(group, caller) {
        group.sort(orderCompare);

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

    proto.processMenuResponses = function(prompt, prompts, caller) {
        var self = this;
        prompts.forEach(function (candidate) {
            if (candidate.response.prompts === prompt) {
                self.processResponse(candidate, caller);
            }
        });
    };

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
        if (prompts.length === 1 && !prompts[0].response.forcesprompt) {
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

    proto.callTopics = function(responders, topics, caller) {
        console.log("call topics:", topics);
        var candidates = [];
        for (var responder in responders) {
            if (responders.hasOwnProperty(responder)) {
                var responses = responders[responder];
                if (responses) {
                    candidates = candidates.concat(this.selectResponses(responses, topics, responder));
                }
            }
        }
        candidates = this.getPriorityResponses(candidates);

        this.processResponses(candidates, caller);
    };

    return type;
})();
