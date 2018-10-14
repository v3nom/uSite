import { IContext } from "../context";

export function loadFile(context: IContext, path: string) {
    var exists = context.fs.exists(path);
    if (!exists) {
        throw 'File does not exist: ' + path;
    }
    return context.fs.readFile(path, { encoding: 'utf-8' });
}

export function compareFiles(fileA, fileB) {
    return fileA === fileB;
}

export function getLocalPath(context: IContext, p: string) {
    return context.fs.joinPaths(context.cwd, p);
}

export function evaluateParametrisedPath(destination: string, entry) {
    var parts = destination.match(/\{[a-zA-Z]*\}/g);
    if (!parts) {
        return destination;
    }

    parts.forEach((part) => {
        destination = destination.replace(part, entry[part.replace('}', '').replace('{', '')]);
    });

    return destination;
}