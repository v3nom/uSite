import * as nunjucks from 'nunjucks';
import * as FileUtils from './utils/fileUtils';
import { IContext } from './context';

export class ContentGroup {
    constructor(private context: IContext, private _allGroups) {
    }

    public get allGroups() {
        return this._allGroups;
    }

    public emit(templ, dest) {
        var allGroups = this.allGroups;
        var lastKey = null;
        var lastContext = null;
        var groupContexts = Object.keys(this.allGroups).map((groupKey) => {
            if (lastContext) {
                lastContext.nextGroup = groupKey;
            }
            lastContext = {
                groupKey: groupKey,
                entries: allGroups[groupKey],
                global: this.context,
                previousGroup: lastKey,
                nextGroup: null,
            };
            lastKey = groupKey;
            return lastContext;
        });

        groupContexts.forEach((context) => {
            var w;
            if (typeof templ == 'string') {
                nunjucks.configure(this.context.cwd);
                w = nunjucks.render(templ, context);
            } else {
                w = templ(context);
            }
            var d = FileUtils.evaluateParametrisedPath(dest, context);
            d = FileUtils.getLocalPath(this.context, d);
            var ext = this.context.fs.extname(d);

            if (!ext) {
                d = this.context.fs.joinPaths(d, 'index.html');
            }

            this.context.fs.mkdirs(this.context.fs.dirname(d));

            if (this.context.fs.exists(d) && FileUtils.compareFiles(FileUtils.loadFile(this.context, d), w)) {
                return;
            }

            this.context.fs.writeFile(d, w)
        });
    }

    public filter(filterFN) {
        var result = {};
        Object.keys(this.allGroups).forEach((groupKey) => {
            if (filterFN(groupKey)) {
                result[groupKey] = this.allGroups[groupKey];
            }
        });
        return new ContentGroup(this.context, result);
    }

    public count(): number {
        return this._allGroups.length;
    }
}