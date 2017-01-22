var path = require('path');
var fse = require('fs-extra');

var dirPath = __dirname;
var demoPath = path.resolve(dirPath, '../demo/');
var workingDirectory = process.cwd();

fse.copySync(demoPath, workingDirectory);