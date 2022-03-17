import uSite from "./usite";
import { InMemoryFileSystem } from "./fileSystem/inMemory/inMemoryFileSystem";

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
        fs.writeFile("content/post/1.md", "meta+++content");
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

        const posts = blog.loadContent("content/post/*").map((post) => {
            return {};
        });

        expect(posts.count()).toBe(2);

        const mappedPosts = posts.map((post) => {
            const separator = "+++";

            const [meta] = post.rawContent.split(separator, 1);
            const content = post.rawContent.replace(meta + separator, "");

            return {
                meta: {
                    title: meta,
                },
                content: content,
            };
        });

        expect(mappedPosts.count()).toBe(2);
        expect(mappedPosts.get(0).meta.title).toBe("meta");
        expect(mappedPosts.get(0).content).toBe("content");
    });

    it("should emit to file 1 to 1", () => {
        const blog = setupBlog([
            { path: "content/post/1.md", content: "meta+++content1" },
            { path: "content/post/2.md", content: "meta+++content2" },
        ]);

        const posts = blog.loadContent("content/post/*").map((post, index) => {
            const [meta, content] = post.rawContent.split("+++");
            return { meta, content, slug: `post${index}` };
        });

        posts.emit((item) => {
            return `<div>${item.content}</div>`;
        }, "www/post/{slug}");

        expect(blog.context.fs.readFile("www/post/post0/index.html", "utf-8")).toBe("<div>content1</div>");
        expect(blog.context.fs.readFile("www/post/post1/index.html", "utf-8")).toBe("<div>content2</div>");
    });

    it("should support map after map", () => {
        const blog = setupBlog([
            { path: "content/post/1.md", content: "title1+++content1" },
            { path: "content/post/2.md", content: "meta+++content2" },
        ]);

        const posts = blog.loadContent("content/post/*").map((post, index) => {
            const [meta, content] = post.rawContent.split("+++");
            return {
                meta: {
                    title: meta,
                    slug: `post${index}`
                }, content
            };
        });

        const posts2 = posts.map((post) => {
            return {
                slug: post.meta.slug,
                title: post.meta.title,
            };
        });

        expect(posts2.get(0).slug).toBe("post0");
        expect(posts2.get(0).title).toBe("title1");
        expect(posts2.get(0).filePath).toBe("content/post/1.md");
        expect(posts2.get(1).filePath).toBe("content/post/2.md");
    });

    it("should support group", () => {
        const blog = setupBlog([
            { path: "content/post/1.md", content: "title1+++content1" },
            { path: "content/post/2.md", content: "title2+++content2" },
            { path: "content/post/3.md", content: "title1+++content3" },
        ]);

        const posts = blog.loadContent("content/post/*").map((post) => {
            const [title, content] = post.rawContent.split("+++");
            return { title, content };
        });

        const groups = posts.group((post, index) => {
            return post.title;
        });

        expect(groups.count()).toBe(2);

        const someGroups = groups.filter((group) => {
            return group.groupKey === "title1";
        });

        expect(someGroups.count()).toBe(1);
    });

    it("should support group emit", () => {
        const blog = setupBlog([
            { path: "content/post/1.md", content: "title1+++content1" },
            { path: "content/post/2.md", content: "title2+++content2" },
            { path: "content/post/3.md", content: "title1+++content3" },
        ]);

        const posts = blog.loadContent("content/post/*").map((post) => {
            const [title, content] = post.rawContent.split("+++");
            return { title, content };
        });

        const groups = posts.group((post, index) => {
            return post.title;
        });

        groups.emit((group) => {
            return `<ul>${group.entries.map(e => `<li>${e.content}</li>`).join("")}</ul>`;
        }, "www/groups/{groupKey}");

        expect(blog.context.fs.readFile(`www/groups/title1/index.html`, "utf-8")).toBe("<ul><li>content1</li><li>content3</li></ul>");
        expect(blog.context.fs.readFile(`www/groups/title2/index.html`, "utf-8")).toBe("<ul><li>content2</li></ul>");
    });

    it("should expose global context", () => {
        const blog = setupBlog([
            { path: "content/post/1.md", content: "title1+++content1" },
            { path: "content/post/2.md", content: "title2+++content2" },
        ]);

        const posts = blog.loadContent("content/post/*");
        posts.emit((post) => {
            return `${post.context.global.title}`;
        }, "www/posts/{uid}");

        expect(blog.context.fs.readFile(`www/posts/${posts.get(0).uid}/index.html`, "utf-8")).toBe("TestBlog");
        expect(blog.context.fs.readFile(`www/posts/${posts.get(1).uid}/index.html`, "utf-8")).toBe("TestBlog");
    });

    it("should support filter", () => {
        const blog = setupBlog([
            { path: "content/post/1.md", content: "title1+++content1" },
            { path: "content/post/2.md", content: "title2+++content2" },
            { path: "content/post/3.md", content: "title2+++content2" },
        ]);

        const posts = blog.loadContent("content/post/*");
        const filtered = posts.filter((post) => {
            return post.rawContent == "title2+++content2";
        });

        expect(filtered.count()).toBe(2);
        expect(filtered.get(0).uid).toBe(posts.get(1).uid);
        expect(filtered.get(1).uid).toBe(posts.get(2).uid);
    });
});

function setupBlog(files: { path: string, content: string }[]) {
    const fs = new InMemoryFileSystem();

    files.forEach((file) => {
        fs.mkdirs(file.path);
        fs.writeFile(file.path, file.content);
    });

    const blog = new TestUsite();
    blog.context.cwd = "./";
    blog.context.fs = fs;
    blog.context.global = {
        title: "TestBlog"
    };

    blog.globResult = files.map(f => f.path);

    return blog;
}

class TestUsite extends uSite {
    public globResult: string[];
    protected globSync(patern: string): string[] {
        return this.globResult;
    }
}