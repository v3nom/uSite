uSite.global = uSite.loadOptions('website.json');

var posts = uSite.loadContent('content/post/*', (entry) => {
    var file = entry.loadString();
    var fileParts = file.split('+++', 2);

    entry.meta = entry.parseOptions(fileParts[0]);
    entry.slug = entry.generateSlug(entry.meta.title);

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

postGroup.filter((groupKey) => {
    return groupKey == 0;
}).emit('template/list.njk', 'www/index.html');

uSite.copy('template/res', 'www');
