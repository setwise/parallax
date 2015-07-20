var utilities = require("./utilities");

var baseCssFiles = [ // CSS combined in order of inclusion on page.
    "./css/main.css"
];
utilities.combineAndMinify(baseCssFiles, "./css/combined.min.css", utilities.cssMinificationFunction);
