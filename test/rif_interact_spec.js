define(['rif/interact'], function(RifInteract) {
describe("RifInteract", function () {
    var output;
    var interact;
    var appendSpy;
    var formatter;
    var responseLib;
    var world;
    var rif;
    var dom;
    var response_lib;

    function setupFormatterOutputWithLinks(links) {
        formatter.formatOutput = jasmine.createSpy("formatOutput").andReturn({node: "formattedText", links: links});
    }

    function setupFormatterOutput() {
        setupFormatterOutputWithLinks([]);
    }

    beforeEach(function () {
        appendSpy = jasmine.createSpy("div append");
        dom = {
            createDiv: jasmine.createSpy("getElementBySelector"),
            scrollToEnd: function() {},
            append: function(div) {},
            getElementBySelector: jasmine.createSpy("getElementBySelector"),
            removeElement: jasmine.createSpy("removeElement"),
            showElement: jasmine.createSpy("showElement"),
            removeClass: jasmine.createSpy('removeClass'),
            removeEvent: jasmine.createSpy('removeEvent')
        };
        dom.createDiv.andReturn({ append: appendSpy});
        formatter = {
            formatOutput: function() { return {node: "formattedText"}; },
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
            callTopics: jasmine.createSpy('callTopics'),
            getCandidateResponses: jasmine.createSpy('getCandidateResponses')
        };
        interact = new RifInteract(dom, formatter, world, response_lib, rif);
        appendSpy.reset();
        setupFormatterOutput();
    });
    describe("say", function () {
        it("should output the text when called", function() {
            interact.say({ text: "This is some text" }, 'responder');
            expect(appendSpy).toHaveBeenCalledWith("formattedText");
        });
        it("should format with a class if specified", function() {
            interact.say({ text: "This is some text", as: "aclass" }, 'responder');
            expect(formatter.formatOutput).toHaveBeenCalledWith("This is some text", jasmine.any(Function), jasmine.any(Object), "aclass");
        });
        it("should output the text into the specified element", function() {
            interact.say({ text: "This is some text", into: "someelement" }, 'responder');
            expect(dom.getElementBySelector).toHaveBeenCalledWith("someelement");
        });
        it("should scroll to the end of the text", function() {
            dom.scrollToEnd = jasmine.createSpy("scrollToEnd");
            interact.say({ text: "This is some text" }, 'responder');
            expect(dom.scrollToEnd).toHaveBeenCalled();
        });
        it("should hide autohides text after the next command", function() {
            dom.removeElement = jasmine.createSpy("removeElement");
            interact.say({ text: "This is some text", autohides: true }, 'responder');
            interact.say({ text: "This is some more text", autohides: true }, 'responder');
            interact.sendCommand([]);
            expect(dom.removeElement).toHaveBeenCalledWith("#outputdiv1", 250);
            expect(dom.removeElement).toHaveBeenCalledWith("#outputdiv2", 250);
        });
        it("replaces in-line markup with state values", function() {
            world.getState = function(id, responder) {
                if (id === "name") {
                    return "Ishmael";
                } else if (id === "yourname") {
                    return "mud";
                } else if (id === ':state' && responder === 'responder') {
                    return 'happy';
                } else {
                    return false;
                }
            };
            var says = { text: "My name is {=name=}. Your name is {= yourname  =}. Your state is {=:state=}." };
            interact.say(says, 'responder');
            expect(formatter.formatOutput).toHaveBeenCalledWith("My name is Ishmael. Your name is mud. Your state is happy.", jasmine.any(Function), jasmine.any(Object), undefined);
        });
        it("replaces in-line markup with state values recursively", function() {
            world.getState = function(id) {
                if (id === "firstName") {
                    return "Ishmael";
                } else if (id === "name") {
                    return "{=firstName=}";
                } else {
                    return false;
                }
            };
            var says = { text: "My name is {=name=}." };
            interact.say(says, 'responder');
            expect(formatter.formatOutput).toHaveBeenCalledWith("My name is Ishmael.", jasmine.any(Function), jasmine.any(Object), undefined);
        });
    });
    describe("says with 'call' markup", function() {
        it("should invoke 'call' on the interact for a topic", function() {
            var says = { text: "My name is {+NAME+}." };
            interact.say(says, 'responder');
            expect(response_lib.callTopics).toHaveBeenCalledWith({}, [{keyword:"NAME"}], "player", jasmine.any(Object));
        });
        it("should invoke 'call' on the interact for a caller-targeted topic", function() {
            world.getState.andReturn("responder");
            var says = { text: "My name is {+NAME>\"responder\"+}." };
            interact.say(says, 'responder');
            expect(response_lib.callTopics).toHaveBeenCalledWith({}, [{keyword:"NAME"}], "responder", jasmine.any(Object));
        });
        it("should invoke 'call' on the interact for multiple topic", function() {
            var says = { text: "My name is {+FIRST NAME+}." };
            interact.say(says, 'responder');
            expect(response_lib.callTopics).toHaveBeenCalledWith({}, [{keyword:"FIRST"}, {keyword:"NAME"}], "player", jasmine.any(Object));
        });
        function fakeCall(responses, topics) {
            if (topics[0].keyword == "NAME") {
                interact.say({ text: "Ishmael"}, 'responder');
            } else {
                interact.say({ text: "Nemo"}, 'responder');
            }
        }
        it("should 'say' the individual pieces of text as a single string", function() {
            response_lib.callTopics.andCallFake(fakeCall);
            interact.say( { text: "My name is {+NAME+}." }, 'responder');
            expect(formatter.formatOutput).toHaveBeenCalledWith("My name is Ishmael.", jasmine.any(Function), jasmine.any(Object), undefined);
        });
        it("should handle multiple 'calls' markups", function() {
            response_lib.callTopics.andCallFake(fakeCall);
            interact.say( { text: "My name is {+NAME+}, but you're just {+FISH+}." }, 'responder');
            expect(formatter.formatOutput).toHaveBeenCalledWith("My name is Ishmael, but you're just Nemo.", jasmine.any(Function), jasmine.any(Object), undefined);
        });
        it("should handle recursive call markup", function() {
            function fakeCall(responses, topics) {
                if (topics[0].keyword == "FIRSTNAME") {
                    interact.say({ text: "Ishmael"});
                } else if (topics[0].keyword == "NAME") {
                    interact.say({ text: "{+FIRSTNAME+}"});
                }
            }
            response_lib.callTopics.andCallFake(fakeCall);
            interact.say( { text: "My name is {+NAME+}." }, 'responder');
            expect(formatter.formatOutput).toHaveBeenCalledWith("My name is Ishmael.", jasmine.any(Function), jasmine.any(Object), undefined);
        });
        it("should handle call markup as a result of state markup", function() {
            world.getState = function(id) {
                if (id === "firstName") {
                    return "{+NAME+}";
                } else {
                    return false;
                }
            };
            response_lib.callTopics.andCallFake(fakeCall);
            interact.say( { text: "My name is {=firstName=}." }, 'responder');
            expect(formatter.formatOutput).toHaveBeenCalledWith("My name is Ishmael.", jasmine.any(Function), jasmine.any(Object), undefined);
        });
        it("should handle state markup as a result of call markup", function() {
            function fakeCall(responses, topics) {
                if (topics[0].keyword == "NAME") {
                    interact.say({ text: "{=firstName=}"});
                }
            }
            world.getState = function(id) {
                if (id === "firstName") {
                    return "Ishmael";
                } else {
                    return false;
                }
            };
            response_lib.callTopics.andCallFake(fakeCall);
            interact.say( { text: "My name is {+NAME+}." }, 'responder');
            expect(formatter.formatOutput).toHaveBeenCalledWith("My name is Ishmael.", jasmine.any(Function), jasmine.any(Object), undefined);
        });
    });
    describe("call", function () {
        it("should call the passed topics", function () {
            interact.call([{keyword: "topicA"}, {keyword: "topicB"}, {keyword: "topicC"}]);
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
        it("should not show the separator when new text is output if show_separator is not set", function() {
            interact.say({ text: "This is some text" });
            dom.createDiv.reset();
            dom.append = jasmine.createSpy("append");
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            interact.say({ text: "This is some more text" });
            expect(dom.showElement).not.toHaveBeenCalled();
        });
        it("should show the separator when new text is output if show_separator is set", function() {
            world.getState = function(id) {
                return id === "show_separator";
            };
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
            ];

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
    describe('hiding obsolete links', function() {
        it('should remove a link after the next command', function() {
            setupFormatterOutputWithLinks([{selector: '.link1', keywords: 'Keyword1'}]);
            response_lib.getCandidateResponses = function(responders, topics) {
                return [];
            };

            interact.say({ text: "This is some text" }, 'responder');
            expect(dom.removeClass).not.toHaveBeenCalledWith('.link1', 'keyword');

            interact.sendCommand([{keyword: "topicA"}]);
            expect(dom.removeClass).toHaveBeenCalledWith('.link1', 'keyword');
            expect(dom.removeEvent).toHaveBeenCalledWith('.link1', 'click');
        });
        it('should remove multiple links after the next command', function() {
            setupFormatterOutputWithLinks([{selector: '.link1', keywords: 'Keyword1'},{selector: '.link2', keywords: 'Keyword2'}]);
            response_lib.getCandidateResponses = function(responders, topics) {
                return [];
            };


            interact.say({ text: "This is some text" }, 'responder');

            interact.sendCommand([{keyword: "topicA"}]);
            expect(dom.removeClass).toHaveBeenCalledWith('.link1', 'keyword');
            expect(dom.removeEvent).toHaveBeenCalledWith('.link1', 'click');
            expect(dom.removeClass).toHaveBeenCalledWith('.link2', 'keyword');
            expect(dom.removeEvent).toHaveBeenCalledWith('.link2', 'click');
        });
        it('should not remove a link if topics still have a response', function() {
            setupFormatterOutputWithLinks([{selector: '.link1', keywords: 'Keyword1'}]);
            world.getCurrentResponders = function() {
                return ['responder'];
            };

            response_lib.getCandidateResponses = function(responders, topics) {
                console.log("gCR with ", topics);
                if (topics[0].keyword === 'Keyword1')
                    return [{response: {}, score: '10000', responder: 'responder'}];
                return [];
            };

            interact.say({ text: "This is some text" }, 'responder');

            interact.sendCommand([{keyword: "topicA"}]);
            expect(dom.removeClass).not.toHaveBeenCalledWith('.link1', 'keyword');
            expect(dom.removeEvent).not.toHaveBeenCalledWith('.link1', 'click');
        });
    });
});

});
