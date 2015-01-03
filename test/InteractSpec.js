describe("Interact", function () {
    var output;
    var interact;
    var appendSpy;
    var formatter;
    beforeEach(function () {
        appendSpy = jasmine.createSpy("div append");
        dom = {
            createDiv: function() { return { append: appendSpy}; },
            scrollToEnd: function() {},
            append: function(div) {}
        };
        formatter = { formatOutput: function() { return "formattedText"; }};
        interact = new Interact({}, dom, formatter);
        appendSpy.reset();
    });
    describe("say", function () {
        it("should output the text when called", function() {
            interact.say("This is some text");
            expect(appendSpy).toHaveBeenCalledWith("formattedText");
        });
    });
});
