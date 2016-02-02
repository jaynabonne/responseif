var RifHtmlFormatter = (function () {
    
    var type = function () {
        this.linkid = 0;
    };

    function createClickable(type, text, cssClass, click) {
        return $("<" + type + ">", {class: cssClass}).html(text).click(click);
    }
    
    type.prototype = {
        formatOutput: function(text, clickfactory, menu_callbacks, css_class) {
            var self = this;
            text = text
                    .replace(/\{!/g, "<span class='keyword'>")
                    .replace(/!\}/g, "</span>");

            var outerspan = $("<span>");
            if (css_class) {
                outerspan.addClass(css_class);
            }
            outerspan.append(text);
            var clickspans = outerspan.find(".keyword");
            clickspans.each( function(id, span) {
                var keyword = span.innerHTML;
                var subindex = keyword.indexOf("|");
                if (subindex >= 0) {
                    span.innerHTML = keyword.substring(0, subindex);
                    keyword = keyword.substring(subindex+1);
                }
                if (keyword.indexOf("menu:") === 0) {
                    var entry = keyword.substring(5);
                    var pieces = entry.split(":");
                    var callback = menu_callbacks[pieces[0]];
                    var index = parseInt(pieces[1]);
                    $(span).click(function() {
                        callback(index);
                    });
                } else {
                    $(span).click(clickfactory(keyword));
                    $(span).addClass("link" + self.linkid++);
                }
            });
            return outerspan;
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
}());
