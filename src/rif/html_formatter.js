define([], function () {
    
    var type = function () {
        this.linkid = 0;
    };

    type.prototype = {
        processLinks: function(clickspans, menu_callbacks, clickfactory, links) {
            var self = this;
            clickspans.each(function (id, span) {
                var keyword = span.innerHTML;
                var subindex = keyword.indexOf("|");
                if (subindex >= 0) {
                    span.innerHTML = keyword.substring(0, subindex);
                    keyword = keyword.substring(subindex + 1);
                }
                if (keyword.indexOf("menu:") === 0) {
                    var entry = keyword.substring(5);
                    var pieces = entry.split(":");
                    var callback = menu_callbacks[pieces[0]];
                    var index = parseInt(pieces[1]);
                    $(span).click(function () {
                        callback(index);
                    });
                } else {
                    $(span).click(clickfactory(keyword));
                    if (links) {
                        var cls = "link" + self.linkid++;
                        $(span).addClass(cls);
                        links.push({selector: '.' + cls, keywords: keyword});
                    }
                }
            });
        },
        formatOutput: function(text, clickfactory, menu_callbacks, css_class) {
            text = text
                    .replace(/\{!!/g, "<span class='permanent-keyword'>")
                    .replace(/!!\}/g, "</span>")
                    .replace(/\{!/g, "<span class='keyword'>")
                    .replace(/!\}/g, "</span>");

            var outerspan = $("<span>");
            if (css_class) {
                outerspan.addClass(css_class);
            }
            outerspan.append(text);

            var links = [];
            this.processLinks(outerspan.find(".permanent-keyword"), menu_callbacks, clickfactory);
            this.processLinks(outerspan.find(".keyword"), menu_callbacks, clickfactory, links);
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
