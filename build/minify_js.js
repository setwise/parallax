var utilities = require("./utilities");

var rootSiteJs = [
    "./js/libs/jquery-2.1.3.min.js",
    "./js/home.js"
];
utilities.combineAndMinify(rootSiteJs, "./js/combined.min.js", utilities.jsMinificationFunction);
