define([], function () {
    var Type = function (candidates) {
        this.reset(-1);
        this.addPriorityResponses(candidates);
    };

    var proto = Type.prototype;

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
        candidates.forEach(function(response) {
            self.addPriorityResponse(response)
        });
    };

    return {
        getPriorityResponses : function(candidates) {
            return new Type(candidates).results;
        }
    }
});