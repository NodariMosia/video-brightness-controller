"use strict";

const { readFileSync, existsSync, mkdirSync } = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

try {
    const projectRoot = path.resolve(__dirname, "..");

    const { name, version } = JSON.parse(
        readFileSync(path.join(projectRoot, "package.json"), "utf8")
    );

    const outdir = path.join(projectRoot, "release");
    const filename = `${name}-v${version}.zip`;

    const zip = new AdmZip();
    zip.addLocalFolder(path.join(projectRoot, "build"));
    if (!existsSync(outdir)) {
        mkdirSync(outdir);
    }
    zip.writeZip(path.join(outdir, filename));

    console.log(
        `Success! Created a ${filename} file under ${outdir} directory. You can upload this file to web store.`
    );
} catch (e) {
    console.error("Error! Failed to generate a zip file.");
}
