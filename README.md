# responsif
ResponsIF - a reponse-based interactive fiction engine, written in JavaScript. This is still a very nascent engine. Lots to come! If you find it interesting, let me know. I'd be happy to work with anyone who wishes to use it.

A good starting point is the "ResponsIF User's Guide" PDF, located in the docs folder.

Installation: To install, simply clone or download the github repository to your local machine. You should then be able to open the sample index.html files in your browser. (Note that Chrome will not open local files properly without disabling CORS restrictions. Internet Explorer, Firefox and Safari all work fine as is. A local web server - such as node's http-server - can be used to overcome the Chrome limitations.)

To create a new riff to work with, it's probably easiest to copy one of the samples (e.g. tutorial1) into the samples folder and then gut the .txt file in the data folder to begin adding your own content. Note that the "hello world" sample is most likely not the best to use as a starting point, as it does not have any CSS styles, especially for links.

To create a riff not in the samples folder, the paths to the JavaScript files will need to be changed in the main html file to reference the correct location.
