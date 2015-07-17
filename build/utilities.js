var fs = require("fs");
var path = require("path");

// Build utilities
/**
 * Get list of file names in startDirectory matching extension. Optionally recurse into subdirectories.
 * @param {string} startDirectory The directory to start in. This may be absolute or relative to CWD.
 * @param {string} extension The extension of the files to collect.
 * @param {boolean=true} recurse Recurse into subdirectories. Defaults to 'true'.
 * @returns {Array} List of absolute paths to all matching files. Paths will be relative to startDirectory.
 */
exports.getFilesWithExtension = function (startDirectory, extension, recurse) {
    internal.argRequired(startDirectory);
    internal.argRequired(extension);
    recurse = internal.argDefault(recurse, true);

    var directories = [startDirectory];
    var fileNames = [];
    while(recurse && directories.length > 0) {
        var nextDir = directories.pop();
        internal.processDirectory(nextDir, extension, fileNames, directories);
    }

    return fileNames;
};

/**
 * Compiles the provided LESS source into CSS and stores in the destination CSS file.
 * @param {string} sourceFile The source .less file.
 * @param {string} destinationFile The target .css file.
 */
exports.compileLessToCss = function (sourceFile, destinationFile) {
    var less = require("less");
    internal.argRequired(sourceFile);
    internal.argRequired(destinationFile);

    var lessStr = fs.readFileSync(sourceFile, "utf8");
    less.render(lessStr).then(
        function(output) {
            console.log("Successfully compiled " + sourceFile + " to " + destinationFile);
            fs.writeFileSync(destinationFile, output.css, "utf8");
        }, function(error) {
            console.log("Failed to compile " + sourceFile + " to " + destinationFile + ". Error: " + error);
        }
    );
};

/**
 * Minifies collection of CSS files (provided by relative path to the site root) to the given output file.
 * @param {Array<string>} inFiles Absolute paths to all CSS files to be combined.
 * @param {string} outFile Output CSS file to be written to.
 * @param {function(string): string} minificationFunction The function to minify the resource.
 */
exports.combineAndMinify = function (inFiles, outFile, minificationFunction) {
    internal.argRequired(inFiles);
    internal.argRequired(outFile);

    console.log("Combining and Minifying:");
    console.log("Input: " + inFiles);
    console.log("Destination: " + outFile);

    var minified = minificationFunction(inFiles);
    fs.writeFileSync(outFile, minified, "utf8");
};

/**
 * Combines and minifies the given array of CSS files.
 * @param {Array<String>} infFiles CSS files to minify and combine.
 * @returns {String} The combined and minified CSS.
 */
exports.cssMinificationFunction = function (infFiles) {
    var CleanCss = require("clean-css");
    var minified = (new CleanCss({ root: ".", relativeTo: "."})).minify(infFiles);

    if(minified.warnings.length > 0) {
        console.log("Warnings: " + minified.warnings);
    }

    if(minified.errors.length > 0) {
        console.log("Errors: " + minified.errors);
        throw "CSS Minification Error";
    }

    return minified.styles;
};

/**
 * Combines and minifies the given array of JS files.
 * @param {Array<String>} infFiles JS files to minify and combine.
 * @returns {String} The combined and minified JS.
 */
exports.jsMinificationFunction = function (inFiles) {
    var UglifyJs = require("uglify-js");
    var minified = UglifyJs.minify(inFiles);
    return minified.code;
};

/**
 * Finds the given pattern in the file and replaces with the given string.
 * @param {String} file The file to open. Relative to current directory.
 * @param {RegExp} findPattern The pattern to find.
 * @param {String} replaceString The string to use as a replacement.
 */
exports.findAndReplaceInFile = function (file, findPattern, replaceString) {
    internal.argRequired(file);
    internal.argRequired(findPattern);
    internal.argRequired(replaceString);

    if(!fs.existsSync(file)) {
        throw "File '" + file + "' not found.";
    }

    var fileContents = fs.readFileSync(file, "utf8");

    var found = fileContents.search(findPattern) >= 0;
    if(!found) {
        throw "Pattern '" + findPattern.toString() + "' not found in file."
    }
    var result = fileContents.replace(findPattern, replaceString);
    fs.writeFileSync(file, result, "utf8");
}

// Internal helper functions
var internal = {};
/**
 * Process the given directory.
 * - Files matching extension will be added to fileNamesList.
 * - Directories will be added to directoriesToProcessList.
 * @param {string} directory The directory.
 * @param {string} extension The extension to match.
 * @param {Array<string>} fileNamesList Files matching extension are added to this list.
 * @param {Array<string>} directoriesToProcessList Directories are added to this list.
 */
internal.processDirectory = function (directory, extension, fileNamesList, directoriesToProcessList) {
    var fileNames = fs.readdirSync(directory);

    for(var i = 0; i < fileNames.length; i++) {
        var fileName = path.join(directory, fileNames[i]);

        var fileStat = fs.statSync(fileName);
        if(fileStat.isDirectory()) {
            directoriesToProcessList.push(fileName);
        } else if(fileStat.isFile() && path.extname(fileName) == extension) {
            fileNamesList.push(fileName);
        }
    }
}

/**
 * Throws exception if the arg is undefined. Use it to require that an arg was provided.
 * @param {*} arg The arg to check.
 */
internal.argRequired = function (arg) {
    if(arg === undefined) {
        throw "Missing required arg.";
    }
};

/**
 * Returns the the provided arg, or the provided default value if the arg was not provided.
 * @param {*} arg The arg to check.
 * @param {*} defaultValue The value to use if arg was not provided.
 * @returns {*} The selected value.
 */
internal.argDefault = function (arg, defaultValue) {
    return arg || defaultValue;
};
