var fs = require("fs");
var rimraf = require("rimraf");

// Cleans the deployment directory of all unnecessary files.
// For safety, caller must pass argument '-f' to actually run the delete operation.

/**
 * Modify this array to change the deployment delete list.
 * The build will delete all files here from the deployment.
 * @type {string[]}
 */
var toDelete = [
    "./less",
    "./admin/less",
    "./README.md"
];

var hasForceFlag = process.argv[2] == "-f";
if(!hasForceFlag) {
    console.log("Pass -f to script to really delete. No files removed.")
    console.log("Files that would be deleted: ");
    printDeleteList(toDelete);
} else {
    console.log("Received -f flag. Beginning delete operation...");
    deleteFiles(toDelete);
}

/**
 * Prints the absolute paths of all files to be deleted.
 * @param {string[]} toDelete List of files to delete.
 */
function printDeleteList(toDelete) {
    for(var i = 0; i < toDelete.length; i++) {
        console.log(toDelete[i] + " [" + (fs.existsSync(toDelete[i]) ? "EXISTS" : "DOES NOT EXIST") + "]");
    }
}

/**
 * Deletes the files in the list provided.
 * @param {string[]} toDelete List of files to delete.
 */
function deleteFiles(toDelete) {
    for(var i = 0; i < toDelete.length; i++) {
        var file = toDelete[i];

        if(fs.lstatSync(file).isDirectory()) {
            console.log("Removing directory '" + file + "'");
            rimraf.sync(file);
        } else {
            console.log("Removing file '" + file + "'");
            fs.unlinkSync(file);
        }
    }
}