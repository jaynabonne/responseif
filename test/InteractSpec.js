describe("Interact", function () {
    var output;
    var interact;
    var appendSpy;
    var formatter;
    var responseLib;
    beforeEach(function () {
        appendSpy = jasmine.createSpy("div append");
        dom = {
            createDiv: function() { return { append: appendSpy}; },
            scrollToEnd: function() {},
            append: function(div) {},
            getElementBySelector: jasmine.createSpy("getElementBySelector")
        };
        formatter = { formatOutput: function() { return "formattedText"; }};
        world = {
            callTopics: jasmine.createSpy("callTopics"),
            getState: jasmine.createSpy("getState"),
            setState: jasmine.createSpy("setState")
        };

        interact = new Interact(dom, formatter, {}, world);
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
    describe("call", function () {
        it("should call the passed topics", function () {
            interact.call(["topicA", "topicB", "topicC"]);
            expect(world.callTopics).toHaveBeenCalledWith(["topicA", "topicB", "topicC"]);
        });
    });
    describe("animate", function () {
        it("should animate the passed item(s)", function () {
            dom.animate = jasmine.createSpy("animate");
            interact.animate( { selector: "aselector", transitions: [ {to: "optionsA", lasting: 1500}, {to: "optionsB", lasting: 1000} ] } );
            expect(dom.animate.callCount).toBe(2);
            expect(dom.animate.argsForCall[0]).toEqual(["aselector", "optionsA", 1500]);
            expect(dom.animate.argsForCall[1]).toEqual(["aselector", "optionsB", 1000]);
        });
    });
    describe("getState", function () {
        it("should invoke the world's getState for a bare id", function() {
            world.getState.andReturn(true);
            expect(interact.getState("somestate")).toBe(true);
            expect(world.getState).toHaveBeenCalledWith("somestate");
        });
        it("should invert the world's getState value for !id", function() {
            world.getState.andReturn(true);
            expect(interact.getState("!somestate")).toBe(false);
            expect(world.getState).toHaveBeenCalledWith("somestate");
        });
    });
    describe("setState", function () {
        it("should invoke the world's setState with true for a bare id", function() {
            interact.setState("somestate");
            expect(world.setState).toHaveBeenCalledWith("somestate", true);
        });
        it("should invoke the world's setState with false for a negated id", function() {
            interact.setState("!somestate");
            expect(world.setState).toHaveBeenCalledWith("somestate", false);
        });
    });
});
