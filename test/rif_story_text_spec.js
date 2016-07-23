define(['rif/story_text'], function(RifStoryText) {
    "use strict";
    describe("rifStoryText", function () {
        var dom;
        var story_text;
        beforeEach(function() {
            var formatter = {};
            var click_factory = function(keywords) {
                return function(e) {
                    return false;
                }
            };
            dom = {
                createDiv : function() {
                    return {};
                },
                append: function(div) {
                }
            };
            var world = {};
            var calltopics = jasmine.createSpy('calltopics');
            story_text = new RifStoryText(formatter, click_factory, dom, world, calltopics);
        });
        describe("animate", function () {
            it("should animate the passed item(s)", function () {
                dom.animate = jasmine.createSpy("animate");
                story_text.animate( { selector: "aselector", transitions: [ {to: "optionsA", lasting: 1500}, {to: "optionsB", lasting: 1000} ] } );
                expect(dom.animate.callCount).toBe(2);
                expect(dom.animate.argsForCall[0]).toEqual(["aselector", "optionsA", 1500]);
                expect(dom.animate.argsForCall[1]).toEqual(["aselector", "optionsB", 1000]);
            });
        });
        describe("clear", function () {
            it("should clear the output div", function() {
                dom.clear = jasmine.createSpy('clear');
                story_text.clear({});
                expect(dom.clear).toHaveBeenCalled();
            });
        });
    });
});
