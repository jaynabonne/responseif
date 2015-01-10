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
            append: function(div) {},
            getElementBySelector: jasmine.createSpy("getElementBySelector")
        };
        formatter = { formatOutput: function() { return "formattedText"; }};

        interact = new Interact(dom, formatter, {});
        appendSpy.reset();
    });
    describe("say", function () {
        it("should output the text when called", function() {
            interact.say({ text: "This is some text" });
            expect(appendSpy).toHaveBeenCalledWith("formattedText");
        });
        it("should output the text into the specified element", function() {
            interact.say({ text: "This is some text", into: "someelement" });
            expect(dom.getElementBySelector).toHaveBeenCalledWith("someelement");
        });
        it("should scroll to the end of the text", function() {
            dom.scrollToEnd = jasmine.createSpy("scrollToEnd");
            interact.say({ text: "This is some text" });
            expect(dom.scrollToEnd).toHaveBeenCalled();
        });
    });
});
