
require(['rif_engine'], function(RifEngine) {
    var params = {
        rif_file: 'helloworld.txt',
        element: $('#output')
    };
    var engine = new RifEngine(params, function() {
        engine.interact.sendCommand([{keyword:"START"}]);
    });
});


/*
<script type="text/javascript" src="/src/rif_html_formatter.js"></script>
    <script type="text/javascript" src="/src/rif_interact.js"></script>
    <script type="text/javascript" src="/src/rif_response.js"></script>
    <script type="text/javascript" src="/src/rif_dom.js"></script>
    <script type="text/javascript" src="/src/rif_expression.js"></script>
    <script type="text/javascript" src="/src/rif_expand.js"></script>
    <script type="text/javascript" src="/src/rif_parse.js"></script>
    <script type="text/javascript" src="/src/rif_tokenize.js"></script>
    <script type="text/javascript" src="/src/rif_world.js"></script>
    <script type="text/javascript" src="/src/rif_load.js"></script>
    <script type="text/javascript" src="/src/rif_engine.js"></script>
*/