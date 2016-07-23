define(['rif/story_text'], function(RifStoryText) {
    "use strict";

    var formatter;
    var dom;
    var appendSpy;
    var world;
    var output_context;
    var calltopics;
    var story_text;

    function setupFormatterOutputWithLinks(links) {
        formatter.formatOutput = jasmine.createSpy("formatOutput").andReturn({node: "formattedText", links: links});
    }

    function setupFormatterOutput() {
        setupFormatterOutputWithLinks([]);
    }

    beforeEach(function() {
        var click_factory = function(keywords) {
            return function(e) {
                return false;
            }
        };
        appendSpy = jasmine.createSpy("div append");
        dom = {
            createDiv: jasmine.createSpy("getElementBySelector"),
            scrollToEnd: function() {},
            append: function(div) {},
            getElementBySelector: jasmine.createSpy("getElementBySelector"),
            removeElement: jasmine.createSpy("removeElement"),
            showElement: jasmine.createSpy("showElement"),
            removeClass: jasmine.createSpy('removeClass'),
            removeEvent: jasmine.createSpy('removeEvent'),
            clear: jasmine.createSpy('clear'),
            setText: jasmine.createSpy('setText'),
            appendText: jasmine.createSpy('appendText')
        };
        dom.createDiv.andReturn({ append: appendSpy});
        output_context = jasmine.createSpyObj(
            'output context',
            [
                'begin',
                'append',
                'end',
                'getOutputText',
                'addMenuCallback'
            ]);
        formatter = {
            formatOutput: function() { return {node: "formattedText"}; },
            formatMenu: function() { return "formattedText"; },
            createContext: function() {
                return output_context;
            }
        };
        world = {
            getState: function() {
                return undefined;
            }
        };

        setupFormatterOutput();

        calltopics = jasmine.createSpy('calltopics');
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
    describe("say", function () {
        it("should output the text when called", function() {
            story_text.say({ text: "This is some text" }, 'responder');
            expect(output_context.begin).toHaveBeenCalled();
            expect(output_context.append).toHaveBeenCalledWith('This is some text');
            expect(output_context.end).toHaveBeenCalled();
            expect(appendSpy).toHaveBeenCalledWith("formattedText");
        });
        it("should format with a class if specified", function() {
            story_text.say({ text: "This is some text", as: "aclass" }, 'responder');
            expect(output_context.begin).toHaveBeenCalledWith('aclass');
            expect(output_context.append).toHaveBeenCalledWith('This is some text');
            expect(appendSpy).toHaveBeenCalledWith("formattedText");
        });
        it("should output the text into the specified element", function() {
            story_text.say({ text: "This is some text", into: "someelement" }, 'responder');
            expect(dom.setText).toHaveBeenCalledWith("someelement", "formattedText");
        });
        it("should output the text onto the specified element", function() {
            story_text.say({ text: "This is some text", onto: "someelement" }, 'responder');
            expect(dom.appendText).toHaveBeenCalledWith("someelement", "formattedText");
        });
        it("should scroll to the end of the text", function() {
            dom.scrollToEnd = jasmine.createSpy("scrollToEnd");
            story_text.say({ text: "This is some text" }, 'responder');
            expect(dom.scrollToEnd).toHaveBeenCalled();
        });
        it("should hide autohides text after the next command", function() {
            dom.removeElement = jasmine.createSpy("removeElement");
            story_text.say({ text: "This is some text", autohides: true }, 'responder');
            story_text.say({ text: "This is some more text", autohides: true }, 'responder');
            story_text.hideSections([]);
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
            story_text.say(says, 'responder');
            expect(output_context.append).toHaveBeenCalledWith("My name is Ishmael. Your name is mud. Your state is happy.");
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
            story_text.say(says, 'responder');
            expect(output_context.append).toHaveBeenCalledWith("My name is Ishmael.");
        });
    });
    describe("says with 'call' markup", function() {
        it("should invoke 'call' on the interact for a topic", function() {
            var says = { text: "My name is {+NAME+}." };
            story_text.say(says, 'responder');
            expect(calltopics).toHaveBeenCalledWith("NAME");
        });
        it("should invoke 'call' on the interact for a caller-targeted topic", function() {
            var says = { text: "My name is {+NAME>\"responder\"+}." };
            story_text.say(says, 'responder');
            expect(calltopics).toHaveBeenCalledWith('NAME>\"responder\"');
        });
        it("should invoke 'call' on the interact for multiple topic", function() {
            var says = { text: "My name is {+FIRST NAME+}." };
            story_text.say(says, 'responder');
            expect(calltopics).toHaveBeenCalledWith('FIRST NAME');
        });
        function fakeCall(topics) {
            if (topics == "NAME") {
                story_text.say({ text: "Ishmael"}, 'responder');
            } else {
                story_text.say({ text: "Nemo"}, 'responder');
            }
        }
        it("should append the individual pieces of text", function() {
            calltopics.andCallFake(fakeCall);
            story_text.say( { text: "My name is {+NAME+}." }, 'responder');
            expect(output_context.append).toHaveBeenCalledWith("My name is ");
            expect(output_context.append).toHaveBeenCalledWith("Ishmael");
            expect(output_context.append).toHaveBeenCalledWith(".");
        });
        it("should handle multiple 'calls' markups", function() {
            calltopics.andCallFake(fakeCall);
            story_text.say( { text: "My name is {+NAME+}, but you're just {+FISH+}." }, 'responder');
            expect(output_context.append).toHaveBeenCalledWith("My name is ");
            expect(output_context.append).toHaveBeenCalledWith("Ishmael");
            expect(output_context.append).toHaveBeenCalledWith(", but you're just ");
            expect(output_context.append).toHaveBeenCalledWith("Nemo");
            expect(output_context.append).toHaveBeenCalledWith(".");
        });
        it("should handle recursive call markup", function() {
            function fakeCall(topics) {
                if (topics == "FIRSTNAME") {
                    story_text.say({ text: "Ishmael"});
                } else if (topics == "NAME") {
                    story_text.say({ text: "{+FIRSTNAME+}"});
                }
            }
            calltopics.andCallFake(fakeCall);
            story_text.say( { text: "My name is {+NAME+}." }, 'responder');
            expect(output_context.append).toHaveBeenCalledWith("My name is ");
            expect(output_context.append).toHaveBeenCalledWith("Ishmael");
            expect(output_context.append).toHaveBeenCalledWith(".");
        });
        it("should handle call markup as a result of state markup", function() {
            world.getState = function(id) {
                if (id === "firstName") {
                    return "{+NAME+}";
                } else {
                    return false;
                }
            };
            calltopics.andCallFake(fakeCall);
            story_text.say( { text: "My name is {=firstName=}." }, 'responder');
            expect(output_context.append).toHaveBeenCalledWith("My name is ");
            expect(output_context.append).toHaveBeenCalledWith("Ishmael");
            expect(output_context.append).toHaveBeenCalledWith(".");
        });
        it("should handle state markup as a result of call markup", function() {
            function fakeCall(topics) {
                if (topics == "NAME") {
                    story_text.say({ text: "{=firstName=}"});
                }
            }
            world.getState = function(id) {
                if (id === "firstName") {
                    return "Ishmael";
                } else {
                    return false;
                }
            };
            calltopics.andCallFake(fakeCall);
            story_text.say( { text: "My name is {+NAME+}." }, 'responder');
            expect(output_context.append).toHaveBeenCalledWith("My name is ");
            expect(output_context.append).toHaveBeenCalledWith("Ishmael");
            expect(output_context.append).toHaveBeenCalledWith(".");
        });
    });
    describe("choose", function() {
        it('should build the menu', function() {
            spyOn(formatter, 'formatMenu').andCallThrough();
            output_context.addMenuCallback.andCallFake(function() {
                return 314;
            });
            var click_callback = jasmine.createSpy('click_callback');
            story_text.choose(["one", "two", "three"], click_callback);
            expect(output_context.addMenuCallback).toHaveBeenCalled();
            expect(formatter.formatMenu).toHaveBeenCalledWith(["one", "two", "three"], 314);
        });
    });
    describe("separator support", function() {
        it("should add a hidden separator div before the command if text was output previously", function() {
            story_text.say({ text: "This is some text" });
            dom.createDiv.reset();
            dom.append = jasmine.createSpy("append");
            story_text.beforeCommand();
            expect(dom.createDiv).toHaveBeenCalledWith();
            expect(appendSpy).toHaveBeenCalledWith("<div class='separatorholder'><div class='separator' style='display:none' id='separator0'></div></div>");
            expect(dom.append).toHaveBeenCalled();
            expect(dom.showElement).not.toHaveBeenCalled();
        });
        it("should not show the separator when new text is output if show_separator is not set", function() {
            story_text.say({ text: "This is some text" });
            dom.createDiv.reset();
            dom.append = jasmine.createSpy("append");
            story_text.beforeCommand();
            story_text.say({ text: "This is some more text" });
            expect(dom.showElement).not.toHaveBeenCalled();
        });
        it("should show the separator when new text is output if show_separator is set", function() {
            world.getState = function(id) {
                return id === "show_separator:";
            };
            story_text.say({ text: "This is some text" });
            dom.createDiv.reset();
            dom.append = jasmine.createSpy("append");
            story_text.beforeCommand();
            story_text.say({ text: "This is some more text" });
            expect(dom.showElement).toHaveBeenCalledWith("#separator0");
        });
    });
});
