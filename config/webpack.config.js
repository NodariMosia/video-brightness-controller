"use strict";

const common = require("./webpack.common.js");
const PATHS = require("./paths");

/**
 * @param {Record<string, string>} _env
 * @param {Record<string, string>} argv
 * @returns {import("webpack").Configuration}
 */
function config(_env, argv) {
    return {
        ...common,
        entry: {
            popup: PATHS.src + "/popup.js",
            contentScript: PATHS.src + "/contentScript.js",
            // background: PATHS.src + "/background.js",
        },
        devtool: argv.mode === "production" ? false : "source-map",
    };
}

module.exports = config;
