# uSite ![Tests passing](https://github.com/v3nom/usite/actions/workflows/test.yml/badge.svg)
uSite is a tiny static website generator for programmers. uSite consists of a content transformation API and less than 90 lines of example code for building a blog. The user of uSite is fully in control to change how websites are generated and come up with conventions which make sense for particular types of projects.

## Installing
npm install -g usite

## Usage
- Create empty folder for your website
- Navigate to your new folder using Terminal
- Execute "usite init" command to get barebones website
- Execute "npm install" to get website dependencies
- Execute "usite generate blog" to get static HTML website. Execute this command each time you want to update the generated website.

## Custom blog example
```js
const blog = new uSite();

// Load website settings and put them in context.global
blog.context.global = blog.loadOptions('website.json');

// Process post files to extract content and meta information
const posts = blog.loadContent('content/post/*').map((item) => {
    const file = item.rawContent;
    var fileParts = file.split('+++', 1);
    var content = file.replace(fileParts[0] + '+++', '');
    var contentParts = content.split('<!-- excerpt -->');
    var meta = blog.utils.parseOptions(fileParts[0]);
    const slug = meta.slug || blog.utils.generateSlug(meta.title);

    return {
        meta: meta,
        slug: slug,
        content: blog.utils.parseMarkdown(content),
        excerpt: blog.utils.parseMarkdown(contentParts[0]),
        relativeUrl: 'post/' + slug
    };
}).sort((a, b) => { return b.meta.date.getTime() - a.meta.date.getTime(); });

// Render posts using single page template
posts.emit('template/single.njk', 'www/post/{slug}');

// Group posts to pages based on postsPerPage parameter
var postGroup = posts.group((post, index) => {
    return Math.floor(index / (blog.context.global.postsPerPage || 10)).toString();
});

// Render each page group using list template
postGroup.emit('template/list.njk', 'www/posts/{groupKey}');

// Copy static resources
blog.copy('content/images', 'www/images');
// Index page is just the first page group
blog.copy('www/posts/0/index.html', 'www/index.html');
```

## Documentation

### uSite
Main class of uSite static website generator.

Instance methods
- **.loadOptions(path:string):Object** - reads file contents, detects contetn type (JSON, YAML) and parses the content to a JS Object
- **.loadContent(path:string):ContentList< T extends ContentItem >** - loads all files using given glob pattern and returns ContentList object holding ContentItems
- **.copy(sourcePath, destinationPath)** - copies files or folders from source location to destination location

### ContentItem
Representation of a file read by .loadContent() method call
- **.context:Object** - context holds internal functions
- **.filePath:string** - holds path to a file from which this item was created
- **.rawContent:string** - holds raw string content of a file

### ContentList< T extends ContentItem >

- **.map(fn:()=>T):ContentList< T extends ContentItem >** - Maps ContentItem to new representation and returns new instance of ContentList. Existing ContentItem properties are copied to T and will be overrriden if same attribute names were used.
- **.emit(templateFn:()=>string, destination:string)** - renders ContentItem using Nunjucks template and creates files based on destination pattern
- **.group(groupKeyFn: (item: T extends ContentItem, index: number) => string): ContentMap< T >** - creates ContentMap where items are grouped by key returned from groupKeyFn
- **.sort(sortFn: (a: T, b: T) => number)** - sorts items in the ContentList
- **.count():number** - returns count of items in the list
- **.get(i:number):T** - returns ContentItem with given index

### ContentMap< T extends ContentItem >
ContentMap is a version of ContentList where ContentItems are grouped by a key. One common usecase for a map is pagination.
- **.emit(templateFn:()=>string|string, destination:string)** - renders ContentItem using Nunjucks template and creates files based on destination pattern
- **.filter(filterFn:(group:ContentMap< T extends ContentItem >) => boolean)** - filters groups based on given predicate