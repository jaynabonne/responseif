define([], function() {

    var verbs = [];

    var module = {};

    var Verb = function(root, overrides) {
        if (overrides) {
            $.extend(this, overrides);
        }
        this.root = root;
    };

    function endsWith(word, end) {
        var position = word.length - end.length;
        var lastIndex = word.indexOf(end, position);
        return lastIndex !== -1 && lastIndex === position;
    }

    var prototype = Verb.prototype;
    prototype.conjugate = function(flags) {
        if (this[flags]) {
            return this[flags];
        }
        if (flags[1] === 'p') {
            if (endsWith(this.root, 'e'))
                return this.root + 'd';
            return this.root + 'ed';
        } else if (flags === 'tPs') {
            if (endsWith(this.root, 's') || endsWith(this.root, 'ch') || endsWith(this.root, 'sh') || endsWith(this.root, 'o'))
                return this.root + 'es';
            return this.root + 's';
        }
        return this.root;
    };

    module.get = function(root) {
        return verbs[root] || new Verb(root);
    };

    module.define = function(root, options) {
        verbs[root] = new Verb(root, options);
    };

    module.define('be', {
        fPs: 'am',
        FPs: 'are',
        fps: 'was',
        Fps: 'were',
        sPs: 'are',
        SPs: 'are',
        sps: 'were',
        Sps: 'were',
        tPs: 'is',
        TPs: 'are',
        tps: 'was',
        Tps: 'were'
    });

    module.define('have', {
        fPs: 'have',
        FPs: 'have',
        fps: 'had',
        Fps: 'had',
        sPs: 'have',
        SPs: 'have',
        sps: 'had',
        Sps: 'had',
        tPs: 'has',
        TPs: 'have',
        tps: 'had',
        Tps: 'had'
    });
    return module;
});

