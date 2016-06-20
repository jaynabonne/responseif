define(['rif/html_formatter'], function(RifHtmlFormatter) {
describe("RifHtmlFormatter", function () {
    "use strict";
    var formatter;
    beforeEach(function () {
        formatter = new RifHtmlFormatter();
    });
    describe("formatOutput", function () {
        var clickfactory;
        beforeEach(function () {
            clickfactory = function(keyword) { return function() {}; };
        });
        it("returns an empty string when passed an empty string", function () {
            var formatted = formatter.formatOutput("", clickfactory);
            expect(formatted.node.html()).toBe("");
            expect(formatted.links).toEqual([]);
        });
        it("returns text that contains no markup", function () {
            var formatted = formatter.formatOutput("this is some text", clickfactory);
            expect(formatted.node.html()).toBe("this is some text");
            expect(formatted.links).toEqual([]);
        });
        it("returns a keyword as a keyword span with a link class", function () {
            var formatted = formatter.formatOutput("{!Keyword!}", clickfactory);
            expect(formatted.node.html()).toBe('<span class="keyword link0">Keyword</span>');
            expect(formatted.links).toEqual([{selector: '.link0', keywords: 'Keyword'}]);
        });
        it("returns an embedded keyword as a keyword span along with the normal text", function () {
            var formatted = formatter.formatOutput("This is a {!Keyword!} to click on.", clickfactory);
            expect(formatted.node.html()).toBe('This is a <span class="keyword link0">Keyword</span> to click on.');
            expect(formatted.links).toEqual([{selector: '.link0', keywords: 'Keyword'}]);
        });
        it("returns all embedded keywords as keyword spans along with the normal text", function () {
            var formatted = formatter.formatOutput("This is a {!Keyword!} to click on. This is another {!one!}.", clickfactory);
            expect(formatted.node.html()).toBe('This is a <span class="keyword link0">Keyword</span> to click on. This is another <span class="keyword link1">one</span>.');
            expect(formatted.links).toEqual([{selector: '.link0', keywords: 'Keyword'},{selector: '.link1', keywords: 'one'}]);
        });
        it("returns a keyword plus text as a keyword span with the correct text", function () {
            var formatted = formatter.formatOutput("{!This is the text|Keyword!}", clickfactory);
            expect(formatted.node.html()).toBe('<span class="keyword link0">This is the text</span>');
            expect(formatted.links).toEqual([{selector: '.link0', keywords: 'Keyword'}]);
        });
        it("sets click handlers for the keyword spans", function () {
            var clickresult;
            var factory = function(keyword) {
                return function() {
                    clickresult = keyword;
                };
            };
            var formatted = formatter.formatOutput("This is a {!keyword!}. This is another {!one!}. And {!a final one|lastone!}", factory);
            var span = formatted.node.children("span.keyword");
            $(span[0]).click();
            expect(clickresult).toBe("keyword");
            $(span[1]).click();
            expect(clickresult).toBe("one");
            $(span[2]).click();
            expect(clickresult).toBe("lastone");
        });
        it("sets click handlers for the keyword menu spans", function () {
            var clickresult = "";
            var factory = function(keyword) {
                return function() {
                    clickresult = keyword;
                };
            };
            var menu_callbacks = {
                10: function(i) { clickresult = i; }
            };
            var formatted = formatter.formatOutput("This is a {!menu item|menu:10:0!}. This is another {!one|menu:10:1!}. And {!a final one|menu:10:2!}", factory, menu_callbacks);
            var span = formatted.node.children("span.keyword");
            $(span[0]).click();
            expect(clickresult).toBe(0);
            $(span[1]).click();
            expect(clickresult).toBe(1);
            $(span[2]).click();
            expect(clickresult).toBe(2);
        });
        it("formats properly inside a div", function() {
            var formatted = formatter.formatOutput("<div>{!This is the text|Keyword!}</div>", clickfactory);
            expect(formatted.node.html()).toBe('<div><span class="keyword link0">This is the text</span></div>');
            expect(formatted.links).toEqual([{selector: '.link0', keywords: 'Keyword'}]);
        });
        it("sets the class of the span if passed", function () {
            var formatted = formatter.formatOutput("this is some text", clickfactory, null, "aclass");
            expect(formatted.node.hasClass('aclass')).toBeTruthy();
        });
        it("returns a permanent keyword as a keyword span without a link class", function () {
            var formatted = formatter.formatOutput("{!!Keyword!!}", clickfactory);
            expect(formatted.node.html()).toBe('<span class="permanent-keyword">Keyword</span>');
            expect(formatted.links).toEqual([]);
        });
        it('formats nested links', function() {
            var formatted = formatter.formatOutput("{!This is a long link with a nested {!section of text|keyword2!}.|keyword1!}", clickfactory);
            expect(formatted.node.html()).toBe('<span class="keyword link0">This is a long link with a nested <span class="keyword link1">section of text</span>.</span>');
            expect(formatted.links).toEqual([{selector: '.link0', keywords: 'keyword1'}, {selector: '.link1', keywords: 'keyword2'}]);
        });
    });
    describe("formatMenu", function () {
        it("returns an empty menu for no menu items", function () {
            var text = formatter.formatMenu([], 13);
            expect(text).toBe('<div class="menu"></div>');
        });
        it("formats a menu node properly", function () {
            var text = formatter.formatMenu(["A menu entry"], 15);
            expect(text).toBe('<div class="menu"><div class="menuitem">{!A menu entry|menu:15:0!}</div></div>');
        });
        it("formats multiple menu nodes properly", function () {
            var text = formatter.formatMenu(["A menu entry", "Another menu entry"], 17);
            expect(text).toBe('<div class="menu"><div class="menuitem">{!A menu entry|menu:17:0!}</div><div class="menuitem">{!Another menu entry|menu:17:1!}</div></div>');
        });
    });
    describe("getContext", function() {
        it('returns empty text by default', function() {
            var context = formatter.createContext();
            expect(context.getOutputText()).toBe('');
        });
        it('returns appended text', function() {
            var context = formatter.createContext();
            context.append('some text');
            expect(context.getOutputText()).toBe('some text');
        });
        it('returns multiply appended text', function() {
            var context = formatter.createContext();
            context.append('some text');
            context.append('ual stuff');
            expect(context.getOutputText()).toBe('some textual stuff');
        });
    });
});
});
