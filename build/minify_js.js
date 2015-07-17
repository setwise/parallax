var utilities = require("./utilities");

// Root site.
var rootSiteJs = [
    "./js/libs/jquery-2.1.3.min.js",
    "./js/libs/bootstrap.min.js",
    "./js/libs/bootstrap-datepicker.js",
    "./js/libs/jquery.validate.min.js",
    "./js/libs/retina.min.js",
    "./js/libs/handlebars-v3.0.0.js",
    "./js/libs/fastclick.js",
    "./js/global.js",
    "./js/home.js"
];
utilities.combineAndMinify(rootSiteJs, "./js/combined.min.js", utilities.jsMinificationFunction);

// Admin site.
var adminSiteJs = [
    "./admin/js/libs/jquery-2.1.3.min.js",
    "./admin/js/libs/bootstrap.min.js",
    "./admin/js/libs/jquery-ui.min.js",
    "./admin/js/libs/bootstrap-datepicker.js",
    "./admin/js/libs/jquery.validate.min.js",
    "./admin/js/libs/fastclick.js",
    "./admin/js/libs/chart.min.js",
    "./admin/js/libs/handlebars-v3.0.0.js",
    "./ckeditor/ckeditor.js",
    "./ckeditor/adapters/jquery.js",
    "./ckfinder/ckfinder.js",
    "./admin/js/global.js"
];
utilities.combineAndMinify(adminSiteJs, "./admin/js/combined.min.js", utilities.jsMinificationFunction);
