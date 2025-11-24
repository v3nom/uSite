import { IContext } from "../context.js";

export function loadFile(context: IContext, path: string) {
    var exists = context.fs.exists(path);
    if (!exists) {
        throw 'File does not exist: ' + path;
    }
    return context.fs.readFile(path, { encoding: 'utf-8' });
}

export function compareFiles(fileA: string, fileB: string) {
    return fileA == fileB;
}

export function getLocalPath(context: IContext, path: string) {
    return context.fs.joinPaths(context.cwd, path);
}

export function evaluateParametrisedPath(path: string, entry: { [key: string]: unknown }) {
    var parts = path.match(/\{[a-zA-Z]*\}/g);
    if (!parts) {
        return path;
    }

    parts.forEach((part) => {
        const key = part.replace('}', '').replace('{', '');
        const value = String(entry[key]);
        path = path.replace(part, value);
    });

    return path;
}