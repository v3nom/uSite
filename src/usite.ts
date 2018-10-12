import * as glob from "glob";
import * as FileUtils from "./utils/fileUtils";
import { IContext } from "./context";
import { ContentItemFactory } from './content/ContentItemFactory';
import { ContentArray } from './ContentArray';
import { parseOptionsWithSuggestedType, getSuggestedType } from './utils/metaParser';
import { FileSystem } from './fileSystem/fileSystem';
import { Utils } from "./utils/utils";

export default class uSite {
    private _context: IContext;

    constructor() {
        this._context = {
            cwd: process.cwd(),
            fs: new FileSystem,
        };
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

    public parseOptions(content) {
        return parseOptionsWithSuggestedType(content, getSuggestedType('', content));
    }

    public loadContent(pattern, contentItemFactory: ContentItemFactory) {
        var files = this.globSync(pattern);
        var entries = files.map((file) => contentItemFactory.Create(this.context, FileUtils.getLocalPath(this._context, file)));
        return new ContentArray(this.context, entries, contentItemFactory);
    }

    protected globSync(pattern: string): string[] {
        return glob.sync(pattern, { cwd: this._context.cwd })
    }

    public copy(t: string, d: string) {
        this.context.fs.copy(FileUtils.getLocalPath(this._context, t), FileUtils.getLocalPath(this._context, d));
    }
}
