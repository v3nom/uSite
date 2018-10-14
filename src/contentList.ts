import { ContentMap } from "./contentMap";
import { IContentItemFactory } from "./content/icontentItemFactory";
import { ContentItem, TemplateFn } from "./content/contentItem";
import { IContext } from "./context";

export class ContentList<T extends ContentItem> {
    constructor(private contex: IContext, private entries: T[], private contentItemFactory: IContentItemFactory) {
    }

    public emit(templ: string | TemplateFn<T>, dest: string) {
        this.entries.forEach((entry) => {
            entry.emit(templ, dest);
        });
    }

    public map<A>(mapFn: (value: T, index: number, array: T[]) => A) {
        const result = this.entries.map((value, index, arr) => {
            this.ensureContentLoaded(value);
            let result = mapFn(value, index, arr);
            if (!result) {
                throw new Error("Map call must return value");
            }
            return this.contentItemFactory.createFromItem(value, result)
        });
        return new ContentList(this.contex, result, this.contentItemFactory);
    }

    public group(groupKeyFn: (item: T, index: number) => string) {
        var groups: { [key: string]: T[] } = {};

        this.entries.forEach((entry, index) => {
            var k = groupKeyFn(entry, index);
            if (!groups[k]) {
                groups[k] = [];
            }
            groups[k].push(entry)
        });

        return new ContentMap(this.contex, groups);
    }

    public sort(sortFn: (a: T, b: T) => number) {
        this.entries.sort((a, b) => {
            return sortFn(a, b);
        });
        return this;
    }

    public count(): number {
        return this.entries.length;
    }

    public get(index: number): T {
        return this.entries[index];
    }

    private ensureContentLoaded(item: T) {
        if (!item.rawContent) {
            item.load();
        }
    }
}