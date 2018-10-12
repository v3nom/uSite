import { FSNode } from "./fsNode"

describe("fsNode test suite", () => {
    it("should report file details", () => {
        const f = new FSNode("a.txt");
        expect(f.name).toBe("a.txt");
        expect(f.fileName).toBe("a");
        expect(f.extension).toBe(".txt");
        expect(f.isFolder).toBe(false);
    });

    it("should report folder details", () => {
        const f = new FSNode("a");
        expect(f.name).toBe("a");
        expect(f.extension).toBe("");
        expect(f.isFolder).toBe(true);
    });

    it("should follow simple path", () => {
        const root = new FSNode(".");
        const a = new FSNode("a");
        const b = new FSNode("b");
        root.addChild(a);
        a.addChild(b);

        const result = root.resolvePath("a/b");
        expect(result.name).toBe(b.name);
    });

    it("should support file", () => {
        const root = new FSNode(".");
        const a = new FSNode("a");
        const b = new FSNode("b");
        const f = new FSNode("t.txt");
        f.content = "test file";

        root.addChild(a);
        a.addChild(b);
        b.addChild(f);

        const result = root.resolvePath("a/b/t.txt");
        expect(result.name).toBe(f.name);
        expect(result.content).toBe(f.content);
    });

    it("should support folders", () => {
        const root = new FSNode(".");
        const a = new FSNode("a");
        const b = new FSNode("b");

        root.addChild(a);
        a.addChild(b);

        const result = root.resolvePath("a/b/");
        expect(result.name).toBe(b.name);
        expect(result.extension).toBe("");
        expect(result.isFolder).toBe(true);
    });

    it("should support ..", () => {
        const root = new FSNode(".");
        const a = new FSNode("a");
        const b = new FSNode("b");
        const f = new FSNode("t.txt");
        f.content = "test file";

        root.addChild(a);
        a.addChild(f);
        a.addChild(b);

        const result = b.resolvePath("../t.txt");
        expect(result.name).toBe(f.name);
        expect(result.isFolder).toBe(false);
    });

    it("should support .", () => {
        const root = new FSNode(".");
        const a = new FSNode("a");
        const b = new FSNode("b");
        const f = new FSNode("t.txt");
        f.content = "test file";

        root.addChild(a);
        a.addChild(f);
        a.addChild(b);

        const result = a.resolvePath("./t.txt");
        expect(result.name).toBe(f.name);
        expect(result.isFolder).toBe(false);
    });

    it("should support file extensions", () => {
        const root = new FSNode(".");
        const f = new FSNode("t.txt");

        root.addChild(f);

        const result = root.resolvePath("./t.txt");
        expect(result.name).toBe(f.name);
        expect(result.extension).toBe(".txt");
        expect(result.isFolder).toBe(false);
    });

    it("should create folders", () => {
        const root = new FSNode(".");
        const lastNode = root.createFromPath("./a/b/c/");

        expect(lastNode.name).toBe("c");
        expect(lastNode.isFolder).toBe(true);

        const a = root.resolvePath("./a");
        const b = a.resolvePath("./b");

        expect(a.name).toBe("a");
        expect(b.name).toBe("b");
    });

    it("should throw error on missing path", () => {
        const root = new FSNode(".");
        const a = new FSNode("a");

        root.addChild(a);

        expect(() => {
            root.resolvePath("./a/b");
        }).toThrow();
    });
});