describe("Interact", function () {
    var output;
    var interact;
    var appendSpy;
    var formatter;
    var responseLib;
    var world;
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

        interact = new Interact(dom, formatter, world);
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
        it("should hide autohides text after the next command", function() {
            dom.hideElement = jasmine.createSpy("hideElement");
            interact.say({ text: "This is some text", autohides: true });
            interact.say({ text: "This is some more text", autohides: true });
            interact.sendCommand([]);
            expect(dom.hideElement).toHaveBeenCalledWith("#outputdiv1", 250);
            expect(dom.hideElement).toHaveBeenCalledWith("#outputdiv2", 250);
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
        it("should invoke the world's getState", function() {
            world.getState.andReturn(true);
            expect(interact.getState("somestate")).toBe(true);
        });
    });
    describe("setState", function () {
        it("should invoke the world's setState", function() {
            interact.setState("somestate");
            expect(world.setState).toHaveBeenCalledWith("somestate");
        });
    });
    describe("invoke", function () {
        it("should invoke the function", function() {
            global_variable = 0;
            interact.invoke("global_variable=10");
            expect(global_variable).toBe(10);
            delete global_variable;
        });
    });
    describe("sendCommand", function() {
        it("should invoke the world's callTopics", function() {
            interact.sendCommand(["topicA", "topicB"]);
            expect(world.callTopics).toHaveBeenCalledWith(["topicA", "topicB"]);
        });
    });
});
