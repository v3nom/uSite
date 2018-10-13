import { ContentItem } from "./ContentItem";
import { IContext } from "../context";

export interface IContentItemFactory {
    create(context: IContext, filePath: string): ContentItem;
    createFromItem<A>(item: ContentItem, params: A): ContentItem & A;
}