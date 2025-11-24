import { ContentItem } from "./contentItem.js";
import { IContext } from "../context.js";

export interface IContentItemFactory {
    create(context: IContext, filePath: string): ContentItem;
    createFromItem<A>(item: ContentItem, params: A): ContentItem & A;
}