define([], function () {
    
    var type = function () {
        this.linkid = 0;
    };

    function makeMenuClick(callback, index) {
        return function () {
            callback(index);
        };
    }

    function convertKeyword(span) {
        var keyword = span.innerHTML;
        var subindex = keyword.lastIndexOf("|");
        if (subindex >= 0) {
            span.innerHTML = keyword.substring(0, subindex);
            keyword = keyword.substring(subindex + 1);
        }
        return keyword;
    }

    function addMenuLink(jqSpan, entry, menu_callbacks) {
        var pieces = entry.split(":");
        var callback = menu_callbacks[pieces[0]];
        var index = parseInt(pieces[1]);
        jqSpan.click(makeMenuClick(callback, index));
    }

    function replaceLinks(text) {
        text = text
            .replace(/\{!!/g, "<span class='pending-permanent-keyword'>")
            .replace(/!!\}/g, "</span>")
            .replace(/\{!/g, "<span class='pending-keyword'>")
            .replace(/!\}/g, "</span>");
        return text;
    }

    function createSpan(css_class, text) {
        var span = $("<span>");
        if (css_class) {
            span.addClass(css_class);
        }
        span.append(text);
        return span;
    }

    type.prototype = {
        addLink: function (jqSpan, clickfactory, keyword, links) {
            jqSpan.click(clickfactory(keyword));
            if (links) {
                var cls = "link" + this.linkid++;
                jqSpan.addClass(cls);
                links.push({selector: '.' + cls, keywords: keyword});
            }
        },
        processLinks: function(outerspan, keyword_class, menu_callbacks, clickfactory, links) {
            var selector_class = 'pending-' + keyword_class
            var selector = '.' + selector_class;
            var clickspans = outerspan.find(selector);
            var spans = clickspans.length;
            for (var i = 0; i < spans; ++i) {
                var span = clickspans[0];
                var keyword = convertKeyword(span);
                var jqSpan = $(span);
                jqSpan.removeClass(selector_class);
                jqSpan.addClass(keyword_class);
                if (keyword.indexOf("menu:") === 0) {
                    addMenuLink(jqSpan, keyword.substring(5), menu_callbacks);
                } else {
                    this.addLink(jqSpan, clickfactory, keyword, links);
                }
                clickspans = outerspan.find(selector);
            }
        },

        formatLinks: function (outerspan, menu_callbacks, clickfactory) {
            var links = [];
            this.processLinks(outerspan, 'permanent-keyword', menu_callbacks, clickfactory);
            this.processLinks(outerspan, 'keyword', menu_callbacks, clickfactory, links);
            return {node: outerspan, links: links};
        },

        formatOutput: function(text, clickfactory, menu_callbacks, css_class) {
            var outerspan = createSpan(css_class, replaceLinks(text));
            return this.formatLinks(outerspan, menu_callbacks, clickfactory);
        },

        formatMenu: function(options, menu_index) {
            var s = '<div class="menu">';
            $.each(options, function (index, value) {
                s += '<div class="menuitem">{!' + value + '|menu:' + menu_index + ':' + index + '!}</div>';
            });
            s += '</div>';
            return s;

        },

        createContext: function() {
            return {
                text: '',
                append: function(text) {
                    this.text += text;
                },
                getOutputText: function() {
                    return this.text;
                }
            };
        }
    };
    return type;
});
