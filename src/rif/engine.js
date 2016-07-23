define(['./world', './load', './dom', './html_formatter', './expand', './parse', './interact', './response','./story_text'],
        function(RifWorld, RifLoad, RifDOM, RifHtmlFormatter, rifExpand, rifParse, RifInteract, RifResponse, RifStoryText) {
    function loadRif(completion) {
        var self = this;
        this.load.loadTokens(this.rif_file, function (tokens) {
            rifExpand(tokens, function(tokens) {
                var rif = rifParse(tokens);
                self.world.addRif(rif);
                completion(rif);
            });
        });
    }

    function initFromParams(params) {
        var self = this;
        self.data_root = params.data_root || "data/";

        function loadFile(name, completion) {
            $.ajax({
                url: self.data_root + name,
                cache: false,
                dataType: 'text'
            }).done(completion);
        }

        self.rif_file = params.rif_file || "rif.txt";
        self.load_file = params.load_file || loadFile;
        self.load = params.load || new RifLoad(self.load_file);

        self.world = params.world || new RifWorld();
        self.formatter = params.formatter || new RifHtmlFormatter();
        self.dom = params.dom || new RifDOM(params.element);

        var clickFactory = function (topics) {
            return function (e) {
                var target = $(e.target);
                if (self.rif.clickEffect !== undefined) {
                    $.each(self.rif.clickEffect.transitions, function(index, transition) {
                        self.dom.animate(target, transition.to, transition.lasting);
                    });
                }
                self.interact.sendCommandTopics(topics);
                return false;
            };
        };
        self.story_text = new RifStoryText(self.formatter, clickFactory, self.dom, self.world, function(topics) {
            self.interact.callTopicString(topics);
        });
        self.response = params.response || new RifResponse(self.world, self.story_text);
    }
    var type = function(params, completion) {
        initFromParams.call(this, params);
        var self = this;

        loadRif.call(this, function(rif) {
            self.rif = rif;
            self.interact =  new RifInteract(self.world, self.response, rif, self.story_text);
            completion();
        });
    };

    type.prototype.getWorld = function() {
        return this.world;
    };
    type.prototype.getInteract = function() {
        return this.interact;
    };
    type.prototype.start = function() {
        this.interact.runSetups();
        this.interact.sendCommand([{keyword:"START"}]);
    };
    return type;
});