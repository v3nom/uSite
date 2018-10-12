import { ContentGroup } from "./ContentGroup";
import { ContentItemFactory } from "./content/ContentItemFactory";
import { ContentItem } from "./content/ContentItem";
import { IContext } from "./context";

export class ContentArray<T extends ContentItem> {
    constructor(private contex: IContext, private entries: T[], private contentItemFactory: ContentItemFactory) {
    }

    public emit(templ, dest) {
        this.entries.forEach((entry) => {
            entry.emit(templ, dest);
        });
    }

    public map<A>(mapFn: (value: T, index: number, array: T[]) => A) {
        const result = this.entries.map((value, index, arr) => {
            let result = mapFn(value, index, arr);
            if (!result) {
                return value;
            }
            return this.contentItemFactory.CreateFromItem(value, result)
        });
        return new ContentArray(this.contex, result, this.contentItemFactory);
    }

    public group(groupKeyFn) {
        var groups = {};
        this.entries.forEach((entry, index) => {
            var k = groupKeyFn(entry, index);
            if (!groups[k]) {
                groups[k] = [];
            }
            groups[k].push(entry)
        });
        return new ContentGroup(this.contex, groups);
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
}