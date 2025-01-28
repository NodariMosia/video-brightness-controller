"use strict";

const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

/**
 * @typedef {{ [key: string]: string | ObjectParserUtilOptions }} ObjectParserUtilOptions
 */

const version = getVersionFromCLIArgs();

const root = path.resolve(__dirname, "..");

const manifestPath = path.join(root, "public", "manifest.json");
const packageJsonPath = path.join(root, "package.json");
const packageLockJsonPath = path.join(root, "package-lock.json");

const prettierConfigPath = path.join(root, ".prettierrc");

/** @type {[string, ObjectParserUtilOptions][]} */
const filesToUpdate = [
    [manifestPath, { version }],
    [packageJsonPath, { version }],
    [packageLockJsonPath, { version, packages: { "": { version } } }],
];

updateVersions();

/***************************
 **** Utility functions ****
 ***************************/

function getVersionFromCLIArgs() {
    console.log(process.argv);
    const version = process.argv[2];

    if (!version) {
        console.error("Error! New version is not provided.");
        process.exit(1);
    }

    if (!/^\d+\.\d+\.\d+$/.test(version)) {
        console.error("Error! Invalid new version format. Correct format: x.x.x");
        process.exit(1);
    }

    return version;
}

async function updateVersions() {
    try {
        const prettierConfig = await getPrettierConfig();

        await Promise.all(
            filesToUpdate.map(([filePath, options]) => {
                return updateVersionInJsonFile(filePath, prettierConfig, options);
            })
        );

        console.log(`Success! Updated version to ${version}.`);
        process.exit(0);
    } catch (error) {
        console.error(`Failed to update version. ${error}`);
        process.exit(1);
    }
}

async function getPrettierConfig() {
    const prettierConfig = await prettier.resolveConfig(prettierConfigPath);

    if (!prettierConfig) {
        throw new Error(`Couldn't find prettier config at ${prettierConfigPath}.`);
    }

    prettierConfig.parser = "json";

    return prettierConfig;
}

/**
 * @param {string} filePath
 * @param {import("prettier").Options} prettierConfig
 * @param {ObjectParserUtilOptions} options
 */
async function updateVersionInJsonFile(filePath, prettierConfig, options) {
    try {
        const fileContents = fs.readFileSync(filePath, "utf8");
        const json = JSON.parse(fileContents);

        updateVersionInObject(json, options);

        const jsonString = JSON.stringify(json, null, prettierConfig.tabWidth ?? 4);
        const formattedJsonString = await prettier.format(jsonString, prettierConfig);

        fs.writeFileSync(filePath, formattedJsonString);
    } catch (e) {
        throw new Error(`Failed to update ${filePath} file.`);
    }
}

/**
 * @param {{[key: string]: any}} object
 * @param {ObjectParserUtilOptions} options
 */
function updateVersionInObject(object, options) {
    for (const [key, versionOrNestedOptions] of Object.entries(options)) {
        if (typeof versionOrNestedOptions === "string") {
            object[key] = versionOrNestedOptions;
        } else {
            updateVersionInObject(object[key], versionOrNestedOptions);
        }
    }
}
