/*
This script applies all migrations from /system/migrations that have not already
been applied.
Database access configuration is extracted from /persistent/environment.php.

Each migration is applied as an SQL transaction, such that all instructions
in a particular migration file must be successful before the transaction is
committed - any errors will cause the transaction to be rolled back and the
database left as it was before that migration was attempted.

Since migrations can be additive (newer ones might require that older ones
be applied), if one migration fails, the procedure is aborted and later
migrations on the list will not be applied.

The structure of this script is based on the Node.js principles of async
callbacks. To avoid callback hell, wherever necessary for clarity, each
"next step" callback is a top-level named function to which control passes
after the previous step is complete.
 */
var fs = require("fs");
var mysql = require("mysql");
var moment = require("moment");

/**
 * List of migrations that were applied successfully.
 * @type {[string]}
 */
var successfulMigrations = [];

/**
 * List of migrations that could not be applied.
 * @type {[string]}
 */
var failedMigrations = [];

// Pull configuration info from environment file.
var config = loadDatabaseCredentials("./persistent/environment.php");

//Migration application flow starts here...
console.log("Retrieving stored migrations...");
var migrations = fs.readdirSync("./system/migrations");
console.log("" + migrations.length + " migrations found:");
printStringArray(migrations);

console.log("Connecting to database...");
var connection = mysql.createConnection(config);

// Connect to the database.
connection.connect(function (err) {
    if(err) {
        console.log("Unable to connect to the database. The following error has occurred: " + err);
        console.log("Has the site been installed?");
        cleanupAndExit(false);
    }

    console.log("Retrieving previously applied migrations...");
    connection.query('SELECT name FROM migration', onAppliedMigrationsReceived);
});

/**
 * Runs after migrations are successfully retrieved from the database.
 * @param {string} err Any error in retrieving the migrations from database.
 * @param {[{}]} rows Array of rows returned.
 */
function onAppliedMigrationsReceived(err, rows) {
    if(err) {
        console.log("Failed to read from migrations table. The following error has occurred: " + err);
        console.log("Has the site bee installed?");
        cleanupAndExit(false);
    } else {
        // Results look like: [{"name": "migration1.php"}, {"name": "migration2.php"}]
        // Flatten array of structures to just a list of names.
        var appliedMigrations = rows.map(function(row) {
            return row['name'];
        });

        // Determine what migrations should be applied.
        console.log("" + appliedMigrations.length + " previously applied migrations found:");
        printStringArray(appliedMigrations);

        // We should apply all migration from the migrations list that are not recorded in the database.
        var migrationsToApply = filterMigrations(migrations, appliedMigrations);

        if(migrationsToApply.length == 0) {
            console.log("No migrations need to be applied. Have a great day!");
            cleanupAndExit(true);
        }

        // Make sure we are applying earlier migrations before later migrations.
        migrationsToApply.sort();

        applyMigrations(migrationsToApply);
    }
}

/**
 * Executed after we determine which migrations need to be applied. Kicks off the process
 * of actually applying them.
 * @param {[string]} migrationsToApply The filtered list of migrations we will apply.
 */
function applyMigrations(migrationsToApply) {
    console.log("Found " + migrationsToApply.length + " migrations that need to be applied:");
    printStringArray(migrationsToApply);

    // Kick off the application process with the first migration on the list.
    applyNextMigration(migrationsToApply, 0);
}

/**
 * Recursively called function which allows us to loop through the migration array via callbacks.
 * @param {[string]} migrationArray The list of migrations to be applied.
 * @param {int} currentIndex Current index into the list. We stop when this is equal
 * to the length of the list.
 */
function applyNextMigration(migrationArray, currentIndex) {
    // Check exit condition.
    if(currentIndex == migrationArray.length) {
        console.log("All migrations applied successfully.");
        cleanupAndExit(true);
    }

    // Apply the migration.
    var currentMigration = migrationArray[currentIndex];

    // Configure failure function. Will be called if this migration fails.
    // Prints information and aborts the script.
    var onFailure = function() {
        console.log("Error applying migration: '" + currentMigration + "'. Aborting...");
        failedMigrations = migrationArray.splice(currentIndex);
        cleanupAndExit(false);
    };

    // Configure success function. Will be called if this migrations succeeds.
    // Records that this migration was successful and makes recursive call to
    // apply the next migration.
    var onSuccess = function() {
        console.log("Migration '" + currentMigration + "' applied successfully.");
        successfulMigrations.push(currentMigration);
        applyNextMigration(migrationArray, currentIndex + 1);
    };

    // Load all instructions.
    console.log("Applying migration '" + currentMigration + "'...");
    var instructions = loadMigrationFile(currentMigration);

    // Add the statement to update the migrations table to the end of the migration instructions.
    // This will make sure it gets executed, but last.
    instructions.push(createMigrationSqlEntry(currentMigration));

    // Go!
    startTransaction(instructions, onFailure, onSuccess);
}

/**
 * Constructs the SQL statement needed to record a migration in the database.
 * @param {string} migrationName The name of the migration applied.
 * @returns {string} The prepared SQL statement.
 */
function createMigrationSqlEntry(migrationName) {
    var formattedNow = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    return "INSERT INTO migration (name,user_id,created,modified) VALUES ("
        + connection.escape(migrationName) + ","
        + connection.escape(1) + ","
        + connection.escape(formattedNow) + ","
        + connection.escape(formattedNow) + ");";
}

/**
 * Applies the migration SQL instructions. Handles transaction details
 * (setup, rollback, commit).
 * @param {[string]} transactionInstructions Array of SQL transaction instructions.
 * @param {function(string)} onFailure Callback function to be executed on error.
 * @param {function()} onSuccess Callback function to be executed after transaction
 * successfully committed.
 */
function startTransaction(transactionInstructions, onFailure, onSuccess) {
    // Set up failure function. Executed on migration instruction failure and handles
    // transaction rollback.
    var onTransactionFailure = function (err) {
        console.log("Rolling back migration after transaction error: " + err);
        connection.rollback(function (err) {
            if(err) {
                console.log("Failed to roll back transaction.");
            } else {
                console.log("Transaction rolled back successfully.");
            }
            onFailure(err);
        });
    };

    // Set up success function. Executed after success of last migration instruction and
    // handles the transaction commit.
    var onTransactionSuccess = function () {
        console.log("Committing migration...");
        connection.commit(function(err) {
            if(err) {
                onTransactionFailure("Error committing transaction. Rolling Back. Error: " + err);
            }
            console.log("Migration successfully committed.");
            onSuccess();
        })
    };

    // Start the transaction and execute first instruction.
    connection.beginTransaction(function (err) {
        if(err) {
            onTransactionFailure(err);
        }
        executeMigrationInstruction(transactionInstructions, 0, onTransactionFailure, onTransactionSuccess);
    });
}

/**
 * Recursively called function which allows us to loop through the migration instructions via callbacks.
 * @param {[string]} migrationInstructions Array of SQL instructions to apply.
 * @param {int} index Index of current transaction instructions. Exit condition is when
 * index equals array length.
 * @param {function(string)} onTransactionFailure Function to be executed on any transaction failure.
 * @param {function()} onTransactionSuccess Function to be executed after last transaction succeeds.
 */
function executeMigrationInstruction(migrationInstructions, index, onTransactionFailure, onTransactionSuccess) {
    // Check exit condition.
    if(index == migrationInstructions.length) {
        console.log("All migrations instructions applied successfully");
        onTransactionSuccess();
        return;
    }

    // Execute the current instruction as query.
    console.log("Applying migration instruction: \n" + migrationInstructions[index]);
    connection.query(migrationInstructions[index], function (err) {
        if(err) {
            onTransactionFailure(err);
            return;
        }
        console.log("Migration instruction successfully applied.");
        executeMigrationInstruction(migrationInstructions, index + 1, onTransactionFailure, onTransactionSuccess);
    });
}

/**
 * Closes any open database connections and exits script.
 * @param {bool=} successful Whether the script should exit successfully or not.
 */
function cleanupAndExit(successful) {
    if(connection) {
        connection.end();
    }
    printSummary();
    process.exit((successful) ? 0 : 1);
}

/**
 * Prints a summary of the migrations results.
 */
function printSummary() {
    console.log("Final Summary");
    console.log("" + successfulMigrations.length + " migrations were applied successfully:");
    printStringArray(successfulMigrations);
    console.log("" + failedMigrations.length + " migrations could not be applied:");
    printStringArray(failedMigrations);
    console.log("End summary.");
}

/**
 * Prints the given array of strings, each on its own line, prefaced by [index].
 * @param {[string]} array
 */
function printStringArray(array) {
    for(var i = 0; i < array.length; i++) {
        console.log("[" + i + "] " + array[i]);
    }
}

/**
 * Returns an array that contains all elements of possibleMigrations that
 * are NOT in appliedMigrations.
 * @param {[string]} possibleMigrations Migrations that might need to be applied.
 * @param {[string]} appliedMigrations Migrations that have already been applied.
 * @returns {[string]} The filtered array.
 */
function filterMigrations(possibleMigrations, appliedMigrations) {
    return possibleMigrations.filter(function (element) {
        return (appliedMigrations.indexOf(element) == -1);
    })
}

/**
 * Loads migrations instructions from file.
 * @param {string} migrationFileName The name of the migration file to load from /system/migrations.
 * @returns {[string]} List of instructions from this file, filtered to only include SQL.
 */
function loadMigrationFile(migrationFileName) {
    var rawFileData = fs.readFileSync("./system/migrations/" + migrationFileName, "utf8");

    return rawFileData.split("\n")                                     // Split each line.
        .map(function (s) { return s.trim(); })                             // Remove whitespace.
        .filter(function (element) {
            return element != "" && element != "<?php" && element != "?>";  // Remove all blank or PHP lines.
        });
}

/**
 * Loads database credential information from the environment file.
 * @param {string} environmentFilePath Path, from site root, of the environment file.
 * @returns {{}}
 */
function loadDatabaseCredentials(environmentFilePath) {
    var rawFileData = fs.readFileSync(environmentFilePath, "utf8");

    var retVal = {};
    addParamToConfigObject(retVal, "user", extractPhpDefinedVariable(rawFileData, "DATABASE_USERNAME"));
    addParamToConfigObject(retVal, "password", extractPhpDefinedVariable(rawFileData, "DATABASE_PASSWORD"));
    addParamToConfigObject(retVal, "host", extractPhpDefinedVariable(rawFileData, "DATABASE_HOST"));
    addParamToConfigObject(retVal, "port", extractPhpDefinedVariable(rawFileData, "DATABASE_PORT", asInt, false));
    addParamToConfigObject(retVal, "database", extractPhpDefinedVariable(rawFileData, "DATABASE_NAME"));

    return retVal;
}

/**
 * Extract the given variable name from the given PHP text. The variable must be
 * defined using the 'define("name", value); syntax.
 * @param text The PHP text to search.
 * @param varName The name of the variable to extract.
 * @param {function(string, string=): (string|Number)=} typeFunction Expected type, defaults to asString.
 * @param {bool=} required Default: true. If false, and value not found, will return null.
 * @returns {Number|string|null}
 */
function extractPhpDefinedVariable(text, varName, typeFunction, required) {
    typeFunction = typeFunction || asString;
    var regex = new RegExp('^define\\("' + varName + '",\\s+"(.+)"\\);\\s*$', 'm');
    var match = regex.exec(text);
    if(!match && required) {
        console.log("Failed to find required variable in environment file: " + varName);
        cleanupAndExit(false);
    }

    return (match) ? typeFunction(match[1], varName) : null;
}

/**
 * Adds the param/value to the given config object if the value is not null.
 * @param {{}} configObj The object to which the param name and value should be added.
 * @param {string} paramName The param name.
 * @param {Number|string|null} paramValue The value.
 */
function addParamToConfigObject(configObj, paramName, paramValue) {
    if(!paramValue) {
        return;
    }

    configObj[paramName] = paramValue;
}

/**
 * Identity function, returns input.
 * @param {string} inputString
 * @returns {string}
 */
function asString(inputString) {
    return inputString;
}

/**
 * Converts the extracted variable to an integer.
 * @param {string} inputString String to convert.
 * @param {string} varName Name of the extracted variable - used for error messaging.
 * @returns {Number} Converted value.
 */
function asInt(inputString, varName) {
    var intVal = parseInt(inputString);
    if(isNaN(intVal)) {
        console.log("Failed to load " + varName + " as integer.");
        cleanupAndExit(false);
    }
    return intVal;
}