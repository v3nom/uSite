import * as path from 'path';

export class FSNode {
    private _parent: FSNode | undefined;
    private _extension: string;
    public children: { [key: string]: FSNode };
    public name: string;
    public fileName: string;
    public content: string = "";

    constructor(name: string) {
        this.children = { ".": this };
        this.name = name;
        this._extension = path.extname(name);
        this.fileName = path.basename(name, this._extension);
    }

    public addChild(node: FSNode) {
        this.children[node.name] = node;
        node.parent = this;
    }

    public get extension() {
        return this._extension;
    }

    public get isFolder() {
        return this.extension === "";
    }

    public get parent() {
        return this._parent;
    }

    public set parent(p: FSNode | undefined) {
        if (p) {
            this.children[".."] = p;
        }
        this._parent = p;
    }

    public createFromPath(p: string) {
        const parts = this.getPathParts(p);
        const walkResult = this.walk(parts);
        let lastNode = walkResult.node;

        if (walkResult.remaining.length === 0) {
            return lastNode;
        }

        for (let a = walkResult.remaining.length - 1; a >= 0; a--) {
            const part = walkResult.remaining[a];
            if (!part) {
                continue;
            }

            const node = new FSNode(part);
            if (!node.isFolder) {
                break;
            }

            lastNode.addChild(node);
            lastNode = node;
        }

        return lastNode;
    }

    public resolvePath(p: string): FSNode | null | undefined {
        if (p == "") {
            return undefined;
        }
        const parts = this.getPathParts(p);
        const result = this.walk(parts);

        if (result.remaining.length > 0) {
            return null;
        }

        return result.node;
    }

    private getPathParts(p: string) {
        return p.split(path.sep).reverse();
    }

    private walk(parts: string[]): { node: FSNode, remaining: string[] } {
        const lastPart = parts.pop();
        if (!lastPart) {
            return { node: this, remaining: parts };
        }
        const node = this.children[lastPart];

        if (parts.length >= 1 && node) {
            return node.walk(parts);
        }

        if (lastPart && !node) {
            return { node: this, remaining: parts.concat(lastPart) };
        }

        return { node: node || this, remaining: parts };
    }
}