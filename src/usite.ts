import * as glob from "glob";
import * as FileUtils from "./utils/fileUtils.js";
import { IContext } from "./context.js";
import { IContentItemFactory } from './content/icontentItemFactory.js';
import { ContentList } from './contentList.js';
import { parseOptionsWithSuggestedType, getSuggestedType } from './utils/metaParser.js';
import { FileSystem } from './fileSystem/fileSystem.js';
import { Utils } from "./utils/utils.js";
import { ContentItemFactory } from "./content/contentItemFactory.js";

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

    public loadOptions(path: string) {
        var p = FileUtils.getLocalPath(this._context, path);
        var content = FileUtils.loadFile(this.context, p);
        return parseOptionsWithSuggestedType(content, getSuggestedType(path, content));
    }

    public loadContent(pattern: string) {
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
