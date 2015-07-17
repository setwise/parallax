var utilities = require("./utilities");

// Environment name is the third argument.
// First: node
// Second: path to script
// Third: environment name.
var envName = process.argv[2];

console.log("Updating environment name to: " + envName);

var filePath =  "./system/configuration.php";
var pattern1 = /(.*HTTP_ENV_NAME.*)1(.*\n)/;
var pattern = /(define\("HTTP_ENV_NAME", ").*("\);)/;
var replace = "$1" + envName + "$2";

utilities.findAndReplaceInFile(filePath, pattern, replace);