describe("RifInteract", function () {
    var output;
    var interact;
    var appendSpy;
    var formatter;
    var responseLib;
    var world;
    beforeEach(function () {
        appendSpy = jasmine.createSpy("div append");
        dom = {
            createDiv: jasmine.createSpy("getElementBySelector"),
            scrollToEnd: function() {},
            append: function(div) {},
            getElementBySelector: jasmine.createSpy("getElementBySelector"),
            removeElement: jasmine.createSpy("removeElement"),
            showElement: jasmine.createSpy("showElement")
        };
        dom.createDiv.andReturn({ append: appendSpy});
        formatter = {
            formatOutput: function() { return "formattedText"; },
            formatMenu: function() { return "formattedText"; }
        };
        world = {
            getState: jasmine.createSpy("getState"),
            setState: jasmine.createSpy("setState"),
            setParent: jasmine.createSpy("setParent"),
            getCurrentResponders : function() {
                return [];
            },
            getPOV: function() {
                return "player";
            }
        };
        rif = {};
        response_lib = {
            callTopics: jasmine.createSpy("callTopics")
        };
        interact = new RifInteract(dom, formatter, world, response_lib, rif);
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
            dom.removeElement = jasmine.createSpy("removeElement");
            interact.say({ text: "This is some text", autohides: true });
            interact.say({ text: "This is some more text", autohides: true });
            interact.sendCommand([]);
            expect(dom.removeElement).toHaveBeenCalledWith("#outputdiv1", 250);
            expect(dom.removeElement).toHaveBeenCalledWith("#outputdiv2", 250);
        });
        it("replaces in-line markup with state values", function() {
            formatter.formatOutput = jasmine.createSpy("formatOutput");
            world.getState = function(id) {
                if (id === "name") {
                    return "Ishmael";
                } else if (id === "yourname") {
                    return "mud";
                } else {
                    return false;
                }
            };
            var says = { text: "My name is {=name=}. Your name is {= yourname  =}." };
            interact.say(says);
            expect(formatter.formatOutput).toHaveBeenCalledWith("My name is Ishmael. Your name is mud.", jasmine.any(Function));
        });
    });
    describe("call", function () {
        it("should call the passed topics", function () {
            interact.call(["topicA", "topicB", "topicC"]);
            expect(response_lib.callTopics).toHaveBeenCalledWith({}, [{keyword:"topicA"}, {keyword:"topicB"}, {keyword:"topicC"}], "player", interact);
        });
    });
    describe("callActions", function () {
        it("should call the passed topics", function () {
            rif.actions = { actor: "responses"};
            interact.callActions(["topicA", "topicB", "topicC"]);
            expect(response_lib.callTopics).toHaveBeenCalledWith({actor: "responses"}, [{keyword:"topicA"}, {keyword:"topicB"}, {keyword:"topicC"}], "actor", interact);
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
    describe("invoke", function () {
        it("should invoke the function", function() {
            global_variable = 0;
            interact.invoke("global_variable=10");
            expect(global_variable).toBe(10);
            delete global_variable;
        });
    });
    describe("sendCommand", function() {
        it("should invoke the response library's callTopics", function () {
            interact.sendCommand(["topicA", "topicB"]);
            expect(response_lib.callTopics).toHaveBeenCalled();
        });
        it("should invoke idle processing", function () {
            interact.idleProcessing = jasmine.createSpy("idleProcessing");
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            expect(interact.idleProcessing).toHaveBeenCalledWith();
        });
    });
    describe("sendCommand separator support", function() {
        it("should add a hidden separator div before the command if text was output previously", function() {
            interact.say({ text: "This is some text" });
            dom.createDiv.reset();
            dom.append = jasmine.createSpy("append");
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            expect(dom.createDiv).toHaveBeenCalledWith();
            expect(appendSpy).toHaveBeenCalledWith("<div class='separatorholder'><div class='separator' style='display:none' id='separator0'></div></div>");
            expect(dom.append).toHaveBeenCalled();
            expect(dom.showElement).not.toHaveBeenCalled();
        });
        it("should show the separator when new text is output", function() {
            interact.say({ text: "This is some text" });
            dom.createDiv.reset();
            dom.append = jasmine.createSpy("append");
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            interact.say({ text: "This is some more text" });
            expect(dom.showElement).toHaveBeenCalledWith("#separator0");
        });
    });
    xdescribe("sendCommand separator support", function() {
        it("should add not create a separator div before the command if text was not output previously", function() {
            interact.say({ text: "This is some text", into: "someelement" });
            dom.createDiv.reset();
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            expect(dom.createDiv).not.toHaveBeenCalled();
        });
        it("should add not create a separator div before the command if .into text was output previously", function() {
            dom.createDiv.reset();
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            expect(dom.createDiv).not.toHaveBeenCalled();
        });
        it("should add not create a separator div until text is output again", function() {
            interact.say({ text: "This is some text" });
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            dom.createDiv.reset();
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            expect(dom.createDiv).not.toHaveBeenCalled();
        });
        it("should increment the separator number each time", function() {
            interact.say({text: "This is some text"});
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            interact.say({text: "This is some more text"});
            dom.createDiv.reset();
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            expect(dom.createDiv).toHaveBeenCalledWith();
            expect(appendSpy).toHaveBeenCalledWith("<div class='separatorholder'><div class='separator' id='separator1'></div></div>");
        });
        it("should hide a previous separator when a new one is created", function(){
            interact.say({text: "This is some text"});
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            interact.say({text: "This is some more text"});
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            expect(dom.removeElement).toHaveBeenCalledWith("#separator0", 1);
        });
});
    describe("choose", function() {
        it("should auto-hide the menu on next command", function() {
            dom.removeElement = jasmine.createSpy("removeElement");
            interact.choose(["one", "two", "three"]);
            interact.sendCommand([]);
            expect(dom.removeElement).toHaveBeenCalledWith("#outputdiv1", 250);
        });
    });
    describe("expandResponseReferences", function() {
        it('should return the same responses if no references exist', function() {
            var responses = [
                {
                    id: "A"
                },
                {
                    id: "B"
                }
            ]

            expect(interact.expandResponseReferences(responses)).toEqual(responses);
        });
        it('should return reference responses', function() {
            rif.responses = {referred: [{id: "C"}, {id: "D"}]};
            var responses = [
                {
                    id: "A"
                },
                {
                    reference: "referred"
                },
                {
                    id: "B"
                }
            ];

            var expected = [
                {
                    id: "A"
                },
                {
                    id: "C"
                },
                {
                    id: "D"
                },
                {
                    id: "B"
                }
            ];
            expect(interact.expandResponseReferences(responses)).toEqual(expected);
        });
    });
});
