import * as nunjucks from 'nunjucks';
import * as FileUtils from '../utils/fileUtils';
import { IContext } from '../context';
import { ContentItem, TemplateFn } from "./ContentItem";

export class ContentItemFactory {
    public Create(context: IContext, filePath: string): ContentItem {
        return this.AddMethods(context, filePath, {});
    }

    public CreateFromItem<A>(item: ContentItem, params: A): A & ContentItem {
        const result = params as ContentItem & A;
        this.AddMethods(item.context, item.filePath, result);
        return result;
    }

    protected AddMethods(context: IContext, filePath: string, target: object) {
        const result = target as ContentItem;
        result.context = context;
        result.filePath = filePath;
        result.rawContent = null;

        result.load = () => {
            result.rawContent = ContentItemFactory.GetContent(context, filePath);
        }

        result.emit = (template: string | TemplateFn, destination: string) => {
            return ContentItemFactory.Emit(result, template, destination);
        }

        return result;
    }

    private static Emit(item: ContentItem, template: string | TemplateFn, destination: string) {
        const context = item.context;

        let w;
        if (typeof template == 'string') {
            nunjucks.configure(context.cwd);
            w = nunjucks.render(template, item);
        } else {
            w = template(item);
        }

        var d = FileUtils.evaluateParametrisedPath(destination, this);
        d = FileUtils.getLocalPath(context, d);

        context.fs.mkdirs(d);

        d = context.fs.joinPaths(d, 'index.html');

        if (context.fs.exists(d) && FileUtils.compareFiles(context.fs.readFile(d, 'utf8'), w)) {
            return;
        }

        context.fs.writeFile(d, w);
    }

    private static GetContent(context: IContext, filePath: string) {
        return FileUtils.loadFile(context, filePath);
    }
}