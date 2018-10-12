import { InMemoryFileSystem } from "./inMemoryFileSystem";

describe("InMemoryFileSystem spec", () => {
    it("should support mkdirs", () => {
        const fs = new InMemoryFileSystem();
        fs.mkdirs("./a/b/c/");
        fs.writeFile("./a/b/c/a.txt", "aaa");
        expect(fs.readFile("./a/b/c/a.txt", "utf-8")).toBe("aaa");
    });

    it("should support copy", () => {
        const fs = new InMemoryFileSystem();
        fs.mkdirs("./a/b");
        fs.mkdirs("./x/");

        fs.writeFile("./a/b/a.txt", "aaa");
        fs.copy("./a/b/a.txt", "./x/c/b.txt");

        expect(fs.readFile("./x/c/b.txt", "utf-8")).toBe("aaa");
    });

    it("should join paths", () => {
        const fs = new InMemoryFileSystem();
        expect(fs.joinPaths("./", "file.txt")).toBe("file.txt");
    });

    it("should support implicit path", () => {
        const fs = new InMemoryFileSystem();
        fs.writeFile("a.txt", "aaa");

        expect(fs.readFile("a.txt", "utf-8")).toBe("aaa");
    });

    it("should support exist", () => {
        const fs = new InMemoryFileSystem();
        fs.writeFile("a.txt", "aaa");

        expect(fs.exists("./a.txt")).toBeTruthy();
    });
});