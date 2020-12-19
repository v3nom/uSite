#!/usr/bin/env node
var path = require('path');
var fs = require('fs');

var command = process.argv[2];
var param = process.argv[3];

if (command == 'generate') {
    if (!param) {
        console.error('Filename is required when calling generate. Example: "usite generate blog"');
        return;
    }

    var generator = require(path.resolve(process.cwd(), param));
    if (!generator.generate) {
        console.error("Provided generator is missing generate function");
        return;
    }

    var uSite = require("./dist/usite");
    generator.generate(uSite.default);
}

if (command == 'init') {
    var fse = require('fs-extra');
    var dirPath = __dirname;

    var demoPath = path.resolve(dirPath, './node_modules/usiteDemo/');
    if (!fse.existsSync(demoPath)) {
        demoPath = path.resolve(dirPath, '../usiteDemo/')
        if (!fse.existsSync(demoPath)) {
            console.error("usiteDemo dependency not found");
            return;
        }
    }

    var workingDirectory = process.cwd();

    fse.copySync(path.resolve(demoPath, "./content"), workingDirectory);
    fse.copySync(path.resolve(demoPath, "./template"), workingDirectory);
    fse.copySync(path.resolve(demoPath, "./blog.js"), workingDirectory);
    fse.copySync(path.resolve(demoPath, "./website.json"), workingDirectory);
}
