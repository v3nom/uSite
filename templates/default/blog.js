import RSS from "rss20";

export const generate = function (uSite) {
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
    blog.copy('template/res', 'www');
    // Index page is just the first page group
    blog.copy('www/posts/0/index.html', 'www/index.html');

    // Generate RSS feed from first page group
    postGroup.filter((g) => g.groupKey === "0").emit((group) => {
        var feed = new RSS.Feed();
        feed.title = group.context.global.title;
        feed.description = group.context.global.description;
        feed.link = group.context.global.url || '';
        feed.pubDate = (new Date()).toUTCString();
        group.entries.forEach((entry) => {
            var item = new RSS.Item();
            item.title = entry.meta.title;
            item.description = entry.excerpt;
            item.link = feed.link + entry.relativeUrl;
            item.pubDate = (new Date(entry.meta.date)).toUTCString();
            feed.addItem(item);
        });
        return feed.getXML();
    }, 'www/rss.xml');

    // Generate sitemap
    posts.group(() => "0").emit((group) => {
        const sitemapContent = [];
        const rootURL = group.context.global.url || '';

        // Add index page
        if (rootURL) {
            sitemapContent.push(rootURL);
        }

        // Add links to group index pages
        Object.keys(postGroup.groups).forEach((groupKey) => {
            sitemapContent.push(`${rootURL}posts/${groupKey}`);
        });

        // Add direct links to articles
        group.entries.forEach((entry) => {
            sitemapContent.push(rootURL + entry.relativeUrl);
        });

        return sitemapContent.join('\n');
    }, 'www/sitemap.txt');
}