var RSS = require('rss20');

uSite.global = uSite.loadOptions('website.json');

var posts = uSite.loadContent('content/post/*', (entry) => {
    var file = entry.loadString();
    var fileParts = file.split('+++', 2);

    entry.meta = entry.parseOptions(fileParts[0]);
    entry.slug = entry.meta.slug || entry.generateSlug(entry.meta.title);

    var content = fileParts[1];
    var contentParts = content.split('<!-- excerpt -->')
    entry.content = entry.parseMarkdown(content);
    entry.excerpt = entry.parseMarkdown(contentParts[0]);

    entry.relativeUrl = 'post/' + entry.slug;
}).sort((a, b) => { return b.meta.date - a.meta.date; });

posts.emit('template/single.njk', 'www/post/{slug}');

var postGroup = posts.group((post, index) => {
    return Math.round(index / 10);
});

postGroup.emit('template/list.njk', 'www/posts/{groupKey}');

var firstPage = postGroup.filter((groupKey) => {
    return groupKey == 0;
});
firstPage.emit('template/list.njk', 'www/index.html');

uSite.copy('template/res', 'www');

// Generate RSS feed
firstPage.emit((groupContext) => {
    var feed = new RSS.Feed();
    feed.title = groupContext.global.title;
    feed.description = groupContext.global.description;
    feed.link = groupContext.global.url || '';
    feed.pubDate = (new Date()).toGMTString();

    groupContext.entries.forEach((entry) => {
        var item = new RSS.Item();
        item.title = entry.meta.title;
        item.description = entry.excerpt;
        item.link = feed.link + entry.relativeUrl;
        item.pubDate = (new Date(entry.meta.date)).toGMTString();
        feed.addItem(item);
    });

    return feed.getXML();
}, 'www/rss.xml');

// Generate sitemap
posts.group(() => 0).emit((groupContext) => {
    var sitemapContent = '';
    if (groupContext.global.url) {
        sitemapContent += groupContext.global.url + '\n';
    }
    Object.keys(postGroup.allGroups).forEach((k) => {
        sitemapContent += (groupContext.global.url || '') + 'posts/' + k + '\n';
    });
    groupContext.entries.forEach((entry) => {
        sitemapContent += (groupContext.global.url || '') + entry.relativeUrl + '\n';
    });
    return sitemapContent;
}, 'www/sitemap.txt');
