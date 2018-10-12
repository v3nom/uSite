import uSite from "./usite";
import { InMemoryFileSystem } from "./fileSystem/inMemory/inMemoryFileSystem";
import { PostItemFactory } from "./content/PostItemFactory";

describe("usite test suite", () => {
    it("should read global settings", () => {
        const fs = new InMemoryFileSystem();
        const settings = {
            title: "Blog",
            url: "http://blog.blog/"
        };

        fs.writeFile("./website.json", JSON.stringify(settings));

        const blog = new uSite();
        blog.context.cwd = "./";
        blog.context.fs = fs;
        blog.context.global = blog.loadOptions("website.json");

        expect(blog.context.fs).toBe(fs);
        expect(blog.context.global).toEqual(settings);
    });

    it("should support loading and transforming content", () => {
        const fs = new InMemoryFileSystem();
        fs.mkdirs("content/post/");
        fs.writeFile("content/post/1.md", "Post1");
        fs.writeFile("content/post/2.md", "Post2");

        const blog = new TestUsite();
        blog.context.cwd = "./";
        blog.context.fs = fs;
        blog.context.global = {
            title: "TestBlog"
        };
        blog.globResult = [
            "content/post/1.md",
            "content/post/2.md"
        ];

        const posts = blog.loadContent("content/post/*", new PostItemFactory()).map((post) => {
            post.load();
        });

        expect(posts.count()).toBe(2);
    });
});

class TestUsite extends uSite {
    public globResult: string[];
    protected globSync(patern: string): string[] {
        return this.globResult;
    }
}