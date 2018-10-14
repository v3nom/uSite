import * as path from 'path';
import { IFileSystem } from "../ifileSystem";
import { FSNode } from "./fsNode";

export class InMemoryFileSystem implements IFileSystem {
    private root: FSNode;

    constructor() {
        this.root = new FSNode(".");
    }

    isDirectory(path: string): boolean {
        return this.root.resolvePath(path).isFolder;
    }

    joinPaths(a: string, b: string): string {
        return path.join(a, b);
    }

    mkdirs(p: string) {
        this.root.createFromPath(p);
    }

    exists(path: string): boolean {
        return this.root.resolvePath(path) != null;
    }

    readFile(path: string, encoding: string | { encoding: string; }) {
        const dest = this.root.resolvePath(path);
        if (!dest) {
            throw new Error("File not found");
        }
        return dest.content;
    }

    writeFile(destination: string, content: string) {
        const dest = path.dirname(destination);
        const fileName = path.basename(destination);
        const node = this.root.resolvePath(dest);
        if (!node) {
            throw new Error("Destination (" + destination + ") does not exist");
        }

        const file = new FSNode(fileName);
        file.content = content;
        node.addChild(file);
    }

    dirname(p: string): string {
        return path.dirname(p);
    }

    extname(p: string): string {
        return path.extname(p);
    }

    copy(a: string, b: string) {
        const input = this.readFile(a, "utf-8");
        this.mkdirs(b);
        this.writeFile(b, input);
    }
}