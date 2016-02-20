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

    type.prototype = {
        processLinks: function(outerspan, keyword_class, menu_callbacks, clickfactory, links) {
            var self = this;
            var selector_class = 'pending-' + keyword_class
            var selector = '.' + selector_class;
            var clickspans = outerspan.find(selector);
            var spans = clickspans.length;
            // do "for" loop instead of the more natural "while" to constrain loop count.
            for (var i = 0; i < spans; ++i) {
                var span = clickspans[0];
                var keyword = convertKeyword(span);
                var jqSpan = $(span);
                jqSpan.removeClass(selector_class);
                jqSpan.addClass(keyword_class);
                if (keyword.indexOf("menu:") === 0) {
                    var entry = keyword.substring(5);
                    var pieces = entry.split(":");
                    var callback = menu_callbacks[pieces[0]];
                    var index = parseInt(pieces[1]);
                    jqSpan.click(makeMenuClick(callback, index));
                } else {
                    jqSpan.click(clickfactory(keyword));
                    if (links) {
                        var cls = "link" + self.linkid++;
                        jqSpan.addClass(cls);
                        links.push({selector: '.' + cls, keywords: keyword});
                    }
                }
                clickspans = outerspan.find(selector);
            }
        },
        formatOutput: function(text, clickfactory, menu_callbacks, css_class) {
            text = text
                    .replace(/\{!!/g, "<span class='pending-permanent-keyword'>")
                    .replace(/!!\}/g, "</span>")
                    .replace(/\{!/g, "<span class='pending-keyword'>")
                    .replace(/!\}/g, "</span>");

            var outerspan = $("<span>");
            if (css_class) {
                outerspan.addClass(css_class);
            }
            outerspan.append(text);

            var links = [];
            this.processLinks(outerspan, 'permanent-keyword', menu_callbacks, clickfactory);
            this.processLinks(outerspan, 'keyword', menu_callbacks, clickfactory, links);
            return { node: outerspan, links: links };
        },

        formatMenu: function(options, menu_index) {
            var s = '<div class="menu">';
            $.each(options, function(index, value) {
                s += '<div class="menuitem">{!' + value + '|menu:' + menu_index + ':' + index + '!}</div>';
            });
            s += '</div>';
            return s;
        }
    };
    return type;
});
