import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import { IFileSystem } from "./ifileSystem";

export class FileSystem implements IFileSystem {
    public isDirectory(path: string) {
        return fs.statSync(path).isDirectory()
    }

    public joinPaths(a: string, b: string): string {
        return path.join(a, b);
    }

    public mkdirs(path: string) {
        fse.mkdirsSync(path);
    }

    public exists(path: string): boolean {
        return fs.existsSync(path);
    }

    public readFile(path: string, encoding: string) {
        return fs.readFileSync(path, encoding);
    }

    public writeFile(destination: string, content: string) {
        fs.writeFileSync(destination, content);
    }

    public dirname(p: string): string {
        return path.dirname(p);
    }

    public extname(p: string): string {
        return path.extname(p);
    }

    public copy(a: string, b: string) {
        fse.copySync(a, b);
    }
}