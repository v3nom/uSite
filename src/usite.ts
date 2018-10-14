import * as glob from "glob";
import * as FileUtils from "./utils/fileUtils";
import { IContext } from "./context";
import { IContentItemFactory } from './content/IContentItemFactory';
import { ContentList } from './ContentList';
import { parseOptionsWithSuggestedType, getSuggestedType } from './utils/metaParser';
import { FileSystem } from './fileSystem/fileSystem';
import { Utils } from "./utils/utils";
import { ContentItemFactory } from "./content/ContentItemFactory";

export default class uSite {
    private _context: IContext;
    private contentItemFactory: IContentItemFactory;

    constructor() {
        this._context = {
            cwd: process.cwd(),
            fs: new FileSystem,
        };
        this.contentItemFactory = new ContentItemFactory();
    }

    public get context() {
        return this._context;
    }

    public get utils() {
        return Utils;
    }

    public loadOptions(path) {
        var p = FileUtils.getLocalPath(this._context, path);
        var content = FileUtils.loadFile(this.context, p);
        return parseOptionsWithSuggestedType(content, getSuggestedType(path, content));
    }

    public loadContent(pattern) {
        var files = this.globSync(pattern);
        var entries = files.map((file) => this.contentItemFactory.create(this.context, FileUtils.getLocalPath(this._context, file)));
        return new ContentList(this.context, entries, this.contentItemFactory);
    }

    protected globSync(pattern: string): string[] {
        return glob.sync(pattern, { cwd: this._context.cwd })
    }

    public copy(t: string, d: string) {
        this.context.fs.copy(FileUtils.getLocalPath(this._context, t), FileUtils.getLocalPath(this._context, d));
    }
}
