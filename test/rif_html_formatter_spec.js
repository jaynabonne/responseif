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
            var node = formatter.formatOutput("", clickfactory);
            expect(node.html()).toBe("");
        });
        it("returns text that contains no markup", function () {
            var node = formatter.formatOutput("this is some text", clickfactory);
            expect(node.html()).toBe("this is some text");
        });
        it("returns a keyword as a keyword span", function () {
            var node = formatter.formatOutput("{!Keyword!}", clickfactory);
            expect(node.html()).toBe('<span class="keyword">Keyword</span>');
        });
        it("returns an embedded keyword as a keyword span along with the normal text", function () {
            var node = formatter.formatOutput("This is a {!Keyword!} to click on.", clickfactory);
            expect(node.html()).toBe('This is a <span class="keyword">Keyword</span> to click on.');
        });
        it("returns all embedded keywords as keyword spans along with the normal text", function () {
            var node = formatter.formatOutput("This is a {!Keyword!} to click on. This is another {!one!}.", clickfactory);
            expect(node.html()).toBe('This is a <span class="keyword">Keyword</span> to click on. This is another <span class="keyword">one</span>.');
        });
        it("returns a keyword plus text as a keyword span with the correct text", function () {
            var node = formatter.formatOutput("{!This is the text|Keyword!}", clickfactory);
            expect(node.html()).toBe('<span class="keyword">This is the text</span>');
        });
        it("sets click handlers for the keyword spans", function () {
            var clickresult;
            var factory = function(keyword) {
                return function() {
                    clickresult = keyword;
                };
            };
            var node = formatter.formatOutput("This is a {!keyword!}. This is another {!one!}. And {!a final one|lastone!}", factory);
            var span = node.children("span.keyword");
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
            var menu_click_factory = function(i) {
                return function() {
                    clickresult = i;
                };
            };
            var node = formatter.formatOutput("This is a {!menu item|menu:0!}. This is another {!one|menu:1!}. And {!a final one|menu:2!}", factory, menu_click_factory);
            var span = node.children("span.keyword");
            $(span[0]).click();
            expect(clickresult).toBe(0);
            $(span[1]).click();
            expect(clickresult).toBe(1);
            $(span[2]).click();
            expect(clickresult).toBe(2);
        });
        it("formats properly inside a div", function() {
            var node = formatter.formatOutput("<div>{!This is the text|Keyword!}</div>", clickfactory);
            expect(node.html()).toBe('<div><span class="keyword">This is the text</span></div>');
        })
    });
    describe("formatMenu", function () {
        it("returns an empty menu for no menu items", function () {
            var text = formatter.formatMenu([]);
            expect(text).toBe('<div class="menu"></div>');
        });
        it("formats a menu node properly", function () {
            var text = formatter.formatMenu(["A menu entry"]);
            expect(text).toBe('<div class="menu"><div class="menuitem">{!A menu entry|menu:0!}</div></div>');
        });
        it("formats multiple menu nodes properly", function () {
            var text = formatter.formatMenu(["A menu entry", "Another menu entry"]);
            expect(text).toBe('<div class="menu"><div class="menuitem">{!A menu entry|menu:0!}</div><div class="menuitem">{!Another menu entry|menu:1!}</div></div>');
        });
    });
});
