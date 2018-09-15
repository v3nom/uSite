var path = require('path');
var fse = require('fs-extra');

var dirPath = __dirname;
var demoPath = path.resolve(dirPath, '../node_modules/usiteDemo/');
var workingDirectory = process.cwd();

fse.copySync(demoPath, workingDirectory);