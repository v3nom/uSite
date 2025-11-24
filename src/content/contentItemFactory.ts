import nunjucks from 'nunjucks';
import * as FileUtils from '../utils/fileUtils.js';
import { IContext } from '../context.js';
import { ContentItem, TemplateFn } from "./contentItem.js";
import { IContentItemFactory } from "./icontentItemFactory.js";

let uid = 0;

export class ContentItemFactory implements IContentItemFactory {
    public create(context: IContext, filePath: string): ContentItem {
        const item = { uid: uid++ } as ContentItem;
        return this.addMethods(context, filePath, item);
    }

    public createFromItem<A>(item: ContentItem, params: A): A & ContentItem {
        const result = params as ContentItem & A;
        this.addMethods(item.context, item.filePath, result);
        return result;
    }

    protected addMethods<A extends ContentItem>(context: IContext, filePath: string, target: A) {
        target.context = context;
        target.filePath = filePath;
        target.rawContent = null;

        target.load = () => {
            target.rawContent = ContentItemFactory.getContent(context, filePath);
        }

        target.emit = (template: string | TemplateFn<A>, destination: string) => {
            return ContentItemFactory.emit(target, template as any, destination);
        }

        return target;
    }

    private static emit(item: ContentItem, template: string | TemplateFn<ContentItem>, destination: string) {
        const context = item.context;

        let fileContent: string;
        if (typeof template == 'string') {
            nunjucks.configure(context.cwd);
            fileContent = nunjucks.render(template, item);
        } else {
            fileContent = template(item);
        }

        let destinationPath = FileUtils.evaluateParametrisedPath(destination, item);
        destinationPath = FileUtils.getLocalPath(context, destinationPath);

        context.fs.mkdirs(destinationPath);

        destinationPath = context.fs.joinPaths(destinationPath, 'index.html');

        if (context.fs.exists(destinationPath) && FileUtils.compareFiles(context.fs.readFile(destinationPath, 'utf8'), fileContent)) {
            return;
        }

        context.fs.writeFile(destinationPath, fileContent);
    }

    private static getContent(context: IContext, filePath: string) {
        return FileUtils.loadFile(context, filePath);
    }
}