import nunjucks from 'nunjucks';
import * as FileUtils from './utils/fileUtils.js';
import { IContext } from './context.js';
import { ContentItem } from './content/contentItem.js';
import { ContentGroup, GroupTemplateFn } from './content/contentGroup.js';

export class ContentMap<T extends ContentItem> {
    private _groups: { [key: string]: ContentGroup<T> };

    constructor(private context: IContext, groups: { [key: string]: T[] }) {
        this._groups = {};
        this.createContentGroups(groups);
    }

    private createContentGroups(groups: { [key: string]: T[] }) {
        let previousContentGroup: ContentGroup<T> | null = null;
        Object.keys(groups).forEach((groupKey) => {
            const entries = groups[groupKey];

            const contentGroup: ContentGroup<T> = {
                context: this.context,
                groupKey: groupKey,
                entries: entries,
            };
            if (previousContentGroup) {
                previousContentGroup.nextGroup = contentGroup;
                contentGroup.previousGroup = previousContentGroup;
            }

            this._groups[groupKey] = contentGroup;
            previousContentGroup = contentGroup;
        });
    }

    public emit(templ: string | GroupTemplateFn<T>, dest: string) {
        Object.keys(this._groups).forEach((groupKey) => {
            const contentGroup = this._groups[groupKey];

            let fileContent: string;
            if (typeof templ == 'string') {
                nunjucks.configure(this.context.cwd);
                fileContent = nunjucks.render(templ, contentGroup);
            } else {
                fileContent = templ(contentGroup);
            }

            let destinationPath = FileUtils.evaluateParametrisedPath(dest, contentGroup);
            destinationPath = FileUtils.getLocalPath(this.context, destinationPath);
            var ext = this.context.fs.extname(destinationPath);

            if (!ext) {
                destinationPath = this.context.fs.joinPaths(destinationPath, 'index.html');
            }

            this.context.fs.mkdirs(this.context.fs.dirname(destinationPath));

            if (this.context.fs.exists(destinationPath) && FileUtils.compareFiles(FileUtils.loadFile(this.context, destinationPath), fileContent)) {
                return;
            }

            this.context.fs.writeFile(destinationPath, fileContent);
        });
    }

    public filter(filterFN: (group: ContentGroup<T>) => boolean) {
        var result: { [key: string]: T[] } = {};
        Object.keys(this._groups).forEach((groupKey) => {
            const contentGroup = this._groups[groupKey];
            if (filterFN(contentGroup)) {
                result[groupKey] = contentGroup.entries;
            }
        });
        return new ContentMap(this.context, result);
    }

    public get(key: string) {
        return this._groups[key];
    }

    public get groups() {
        return this._groups;
    }

    public count(): number {
        return Object.keys(this._groups).length;
    }
}