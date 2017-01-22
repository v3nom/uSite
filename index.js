#!/usr/bin/env node
uSite = require('./usite');

var command = process.argv[2];

if (command == 'generate') {
    require('./recipies/blog');
}
if (command == 'init') {
    require('./recipies/init');
}