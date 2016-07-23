define(['rif/story_text'], function(RifStoryText) {
    "use strict";
    describe("rifStoryText", function () {
        var formatter = {};
        var click_factory = function(keywords) {
            return function(e) {
                return false;
            }
        };
        var dom = {
            createDiv : function() {
                return {};
            },
            append: function(div) {
            }
        };
        var world = {};
        var calltopics = jasmine.createSpy('calltopics');
        var story_text = new RifStoryText(formatter, click_factory, dom, world, calltopics);
    });
});
