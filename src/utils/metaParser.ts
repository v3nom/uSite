import * as yaml from 'js-yaml';

function tryParseYaml(c: string) {
    try {
        return yaml.load('---\n' + c + '...\n');
    } catch (e) {
        return null;
    }
}

function tryParseJson(c: string) {
    try {
        return JSON.parse(c);
    } catch (e) {
        return null;
    }
}

export function getSuggestedType(path: string, content: string) {
    if (path.indexOf('.json') != -1) {
        return 'json';
    }
    if (content.indexOf('{') == 0) {
        return 'json'
    }
    return 'yaml';
}

export function parseOptionsWithSuggestedType(content: string, suggestedType?: 'json' | "yaml") {
    const parsers: { [key: string]: (c: string) => unknown } = {
        json: tryParseJson,
        yaml: tryParseYaml,
    };

    if (suggestedType) {
        const c = parsers[suggestedType](content);
        if (c != null) {
            return c;
        }
    }

    for (let parser of Object.keys(parsers)) {
        var r = parsers[parser](content);
        if (r != null) {
            return r;
        }
    }
}