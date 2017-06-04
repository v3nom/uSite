var fs = require('fs');
var fse = require('fs-extra');
var path = require('path')
var nunjucks = require('nunjucks');
var marked = require('marked');
var getSlug = require('speakingurl');
var yaml = require('js-yaml');
var glob = require("glob");

marked.setOptions({
    highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
    }
});

var uSite = {};
uSite.global = {};
uSite.cwd = process.cwd();

class ContentEntry {
    constructor(basePath) {
        this.basePath = basePath;
        this.isBaseFile = !fs.statSync(basePath).isDirectory();
        this.global = uSite.global;
    }

    loadString(fileName) {
        if (!fileName && this.isBaseFile) {
            return loadFile(this.basePath);
        }
        return loadFile(path.join(this.basePath, fileName));
    }

    parseOptions(s) {
        return parseOptionsWithSuggestedType(s, getSuggestedType('', s));
    }

    parseMarkdown(s) {
        return marked(s);
    }

    generateSlug(s) {
        return getSlug(s);
    }

    emit(templ, dest) {
        var w;
        if (typeof templ == 'string') {
            nunjucks.configure(uSite.cwd);
            w = nunjucks.render(templ, this);
        } else {
            w = templ(this);
        }

        var d = evaluateParametrisedPath(dest, this);
        d = getLocalPath(d);
        fse.mkdirsSync(d);
        d = path.join(d, 'index.html');

        if (fs.existsSync(d) && compareFiles(fs.readFileSync(d, 'utf8'), w)) {
            return;
        }
        fs.writeFileSync(d, w);
    }
}

class ContentGroup {
    constructor(allGroups) {
        this.allGroups = allGroups;
    }

    emit(templ, dest) {
        var allGroups = this.allGroups;
        Object.keys(this.allGroups).forEach((groupKey) => {
            var entries = allGroups[groupKey];
            var context = {
                groupKey: groupKey,
                entries: entries,
                global: uSite.global,
            };
            var w;
            if (typeof templ == 'string') {
                nunjucks.configure(uSite.cwd);
                w = nunjucks.render(templ, context);
            } else {
                w = templ(context);
            }
            var d = evaluateParametrisedPath(dest, context);
            d = getLocalPath(d);
            var ext = path.extname(d);

            if (!ext) {
                d = path.join(d, 'index.html');
            }
            fse.mkdirsSync(path.dirname(d));

            if (fs.existsSync(d) && compareFiles(fs.readFileSync(d, 'utf8'), w)) {
                return;
            }
            fs.writeFileSync(d, w)
        });
    }

    filter(filterFN) {
        var result = {};
        Object.keys(this.allGroups).forEach((groupKey) => {
            if (filterFN(groupKey)) {
                result[groupKey] = this.allGroups[groupKey];
            }
        });
        return new ContentGroup(result);
    }
}

class ContentArray {
    constructor(entries) {
        this.entries = entries;
    }

    emit(templ, dest) {
        this.entries.forEach((entry) => {
            entry.emit(templ, dest);
        });
    }

    group(groupKeyFn) {
        var groups = {};
        this.entries.forEach((entry, index) => {
            var k = groupKeyFn(entry, index);
            if (!groups[k]) {
                groups[k] = [];
            }
            groups[k].push(entry)
        });
        return new ContentGroup(groups);
    }

    sort(sortFn) {
        this.entries.sort((a, b) => {
            return sortFn(a, b);
        });
        return this;
    }
}

function evaluateParametrisedPath(s, entry) {
    var parts = s.match(/\{[a-zA-Z]*\}/g);
    if (!parts) {
        return s;
    }
    parts.forEach((part) => {
        s = s.replace(part, entry[part.replace('}', '').replace('{', '')]);
    });
    return s;
}

function getLocalPath(p) {
    return path.join(uSite.cwd, p);
}

function getSuggestedType(p, content) {
    if (p.indexOf('.json') != -1) {
        return 'json';
    }
    if (content.indexOf('{') == 0) {
        return 'json'
    }
    return 'yaml';
}

function tryParseYaml(c) {
    try {
        return yaml.safeLoad('---\n' + c + '...\n');
    } catch (e) {
        //console.warn(e);
        return null;
    }
}

function tryParseJson(c) {
    try {
        return JSON.parse(c);
    } catch (e) {
        //console.warn(e)
        return null;
    }
}

function parseOptionsWithSuggestedType(content, suggestedType) {
    var parsers = [tryParseYaml, tryParseJson];
    if (suggestedType == 'json') {
        parsers = parsers.reverse()
    }
    for (var a = 0; a < parsers.length; a++) {
        var r = parsers[a](content);
        if (r != null) {
            return r;
        }
    }
}

function loadFile(p) {
    var exists = fs.existsSync(p);
    if (!exists) {
        throw 'File doest not exist: ' + p;
    }
    return fs.readFileSync(p).toString();
}

function compareFiles(fileA, fileB) {
    return fileA === fileB;
}

uSite.loadOptions = (path) => {
    var p = getLocalPath(path);
    var content = loadFile(p);
    return parseOptionsWithSuggestedType(content, getSuggestedType(path, content));
}

uSite.parseOptions = (content) => {
    return parseOptionsWithSuggestedType(content, getSuggestedType('', content));
}

uSite.loadContent = (pattern, prepareFn) => {
    var files = glob.sync(pattern, { cwd: uSite.cwd });
    var entries = files.map((file) => {
        var entry = new ContentEntry(getLocalPath(file));
        prepareFn(entry);
        return entry;
    });
    return new ContentArray(entries);
}

uSite.copy = (t, d) => {
    fse.copySync(getLocalPath(t), getLocalPath(d));
}

module.exports = uSite;