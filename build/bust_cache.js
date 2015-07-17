var utilities = require("./utilities");

// Version is the third argument.
// First: node
// Second: path to script
// Third: bamboo version
var version = process.argv[2];

console.log("Updating cache version to v=" + version);

var filePath =  "./system/resourceIncluder.php";
var pattern = /(.*CACHE_VERSION.*)1(.*\n)/;
var replace = "$1" + version + "$2";

utilities.findAndReplaceInFile(filePath, pattern, replace);
