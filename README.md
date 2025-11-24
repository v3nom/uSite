# uSite

![Tests passing](https://github.com/v3nom/usite/actions/workflows/test.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**uSite** is a tiny, flexible static website generator designed for programmers.

It consists of a powerful content transformation API and a minimal footprint—less than 90 lines of code can build a fully functional blog. With uSite, you are in full control of your build pipeline, conventions, and site structure.

## 🚀 Features

*   **Minimalist**: Core logic is lightweight and unopinionated.
*   **Flexible**: Define your own conventions and build steps.
*   **Programmatic**: Use standard JavaScript/TypeScript to generate your site.
*   **Fast**: Built on modern Node.js.

## 📦 Installation

Install uSite globally via npm:

```bash
npm install -g usite
```

## 🏁 Quick Start

1.  **Create a project folder**:
    ```bash
    mkdir my-website
    cd my-website
    ```

2.  **Initialize a barebones site**:
    ```bash
    usite init
    ```

3.  **Install dependencies**:
    ```bash
    npm install
    ```

4.  **Generate your site**:
    ```bash
    usite generate blog
    ```
    *This runs the `blog` task defined in your configuration.*

## 📝 Example: Custom Blog Build

Here is a complete example of how to build a blog using uSite. This script loads settings, processes markdown files, and renders them using Nunjucks templates.

```javascript
const blog = new uSite();

// 1. Load website settings into the global context
blog.context.global = blog.loadOptions('website.json');

// 2. Load and process post files
const posts = blog.loadContent('content/post/*')
    .map((item) => {
        const file = item.rawContent;
        const [frontMatter, ...rest] = file.split('+++');
        const content = rest.join('+++').trim();
        const [excerpt] = content.split('<!-- excerpt -->');

        const meta = blog.utils.parseOptions(frontMatter);
        const slug = meta.slug || blog.utils.generateSlug(meta.title);

        return {
            meta,
            slug,
            content: blog.utils.parseMarkdown(content),
            excerpt: blog.utils.parseMarkdown(excerpt),
            relativeUrl: `post/${slug}`
        };
    })
    .sort((a, b) => b.meta.date.getTime() - a.meta.date.getTime());

// 3. Render individual post pages
posts.emit('template/single.njk', 'www/post/{slug}');

// 4. Group posts for pagination (e.g., 10 posts per page)
const postsPerPage = blog.context.global.postsPerPage || 10;
const postGroups = posts.group((post, index) => {
    return Math.floor(index / postsPerPage).toString();
});

// 5. Render pagination pages
postGroups.emit('template/list.njk', 'www/posts/{groupKey}');

// 6. Copy static assets
blog.copy('content/images', 'www/images');

// 7. Create the index page (alias for the first page of posts)
blog.copy('www/posts/0/index.html', 'www/index.html');
```

## 📚 API Reference

### `uSite`
The main class for the static site generator.

*   **`loadOptions(path: string): Object`**
    Reads a file (JSON/YAML), detects the content type, and parses it into a JavaScript object.

*   **`loadContent<T>(path: string): ContentList<T>`**
    Loads files matching the glob pattern and returns a `ContentList` of `ContentItem`s.

*   **`copy(sourcePath: string, destinationPath: string): void`**
    Copies files or directories from source to destination.

### `ContentItem`
Represents a single file loaded by `loadContent`.

*   **`context: Object`**: Holds internal context and helper functions.
*   **`filePath: string`**: The absolute path to the source file.
*   **`rawContent: string`**: The raw string content of the file.

### `ContentList<T>`
A collection of content items with transformation methods.

*   **`map<U>(fn: (item: T) => U): ContentList<U>`**
    Transforms each item in the list. Properties from the original item are copied to the new item, overriding duplicates.

*   **`emit(templateFn: string, destination: string): void`**
    Renders items using a Nunjucks template and writes them to the destination pattern (e.g., `www/post/{slug}`).

*   **`group(keyFn: (item: T, index: number) => string): ContentMap<T>`**
    Groups items by a key returned by the function. Useful for pagination or categories.

*   **`sort(sortFn: (a: T, b: T) => number): ContentList<T>`**
    Sorts the items in the list.

*   **`count(): number`**
    Returns the number of items.

*   **`get(i: number): T`**
    Returns the item at the specified index.

### `ContentMap<T>`
A collection of grouped `ContentList`s.

*   **`emit(templateFn: string, destination: string): void`**
    Renders each group using a template.

*   **`filter(predicate: (group: ContentList<T>) => boolean): ContentMap<T>`**
    Filters groups based on the predicate.

## 📄 License

MIT