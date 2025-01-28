"use strict";

const fs = require("fs");
const path = require("path");

// 1. Read new version from command line arguments

const newVersion = process.argv[2];

if (!newVersion) {
    console.error("Error! New version is not provided.");
    process.exit(1);
}

// 2. Validate new version

if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    console.error("Error! Invalid new version.");
    process.exit(1);
}

// 3. Update version in package.json, package-lock.json and public/manifest.json

const projectRoot = path.resolve(__dirname, "..");

updateVersionInJsonFile(path.join(projectRoot, "public", "manifest.json"), {
    version: null,
});
updateVersionInJsonFile(path.join(projectRoot, "package.json"), {
    version: null,
});
updateVersionInJsonFile(path.join(projectRoot, "package-lock.json"), {
    version: null,
    packages: {
        "": {
            version: null,
        },
    },
});

/**
 * @param {string} filePath
 * @param {ObjectParserUtilOptions} options
 */
function updateVersionInJsonFile(filePath, options) {
    try {
        const json = JSON.parse(fs.readFileSync(filePath, "utf8"));

        updateVersionInObject(json, options);

        fs.writeFileSync(filePath, JSON.stringify(json, null, 4));
    } catch (e) {
        console.error(`Error! Failed to update ${filePath} file.`);
        process.exit(1);
    }
}

/**
 * @param {{[key: string]: any}} object
 * @param {ObjectParserUtilOptions} options
 */
function updateVersionInObject(object, options) {
    for (const [key, nestedOptions] of Object.entries(options)) {
        if (nestedOptions === null) {
            object[key] = newVersion;
        } else {
            updateVersionInObject(object[key], nestedOptions);
        }
    }
}

console.log(`Success! Updated version to ${newVersion}.`);
process.exit(0);
