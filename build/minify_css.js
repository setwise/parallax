var utilities = require("./utilities");

// Root site CSS
var baseCssFiles = [ // CSS combined in order of inclusion on page.
    "./css/libs/normalize.css",
    "./css/libs/bootstrap.min.css",
    "./css/libs/datepicker.css",
    "./css/libs/glyphicons.css",
    "./css/main.css"
];
utilities.combineAndMinify(baseCssFiles, "./css/combined.min.css", utilities.cssMinificationFunction);

// Admin site CSS
var adminCssFiles = [ // CSS combined in order of inclusion on page.
    "./admin/css/libs/bootstrap.min.css",
    "./admin/css/libs/datepicker.css",
    "./admin/font-awesome-4.3.0/css/font-awesome.min.css",
    "./admin/css/main.css"
];
utilities.combineAndMinify(adminCssFiles, "./admin/css/combined.min.css", utilities.cssMinificationFunction);

