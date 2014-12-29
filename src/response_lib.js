var ResponseLib = (function () {
    "use strict";
    var type = function (interact) {
        this.interact = interact;
    };

    function hasRunAndRuns(response) { return response.runs !== undefined && response.run !== undefined; }

    function responseCountValid(response) { return !hasRunAndRuns(response) || response.run < response.runs; }

    function hasTopics(response) { return response.topics !== undefined; }

    function topicInTopics(topic, topics) { return topics.indexOf(topic) !== -1; }

    function isRequiredTopic(topic) { return topic[0] === "*"; }

    function extractTopic(topic) { return isRequiredTopic(topic) ? topic.substring(1) : topic; }

    function hasRequiredTopics(response, topics) {
        for (var i = 0; i < response.topics.length; ++i) {
            var topic = response.topics[i];
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
        return response_topics.length === 0 ? 10000 : doComputeScore(response_topics, topics);
    };
    return type;
})();
