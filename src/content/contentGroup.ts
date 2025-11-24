import { IContext } from "../context.js";
import { ContentItem } from "./contentItem.js";

export type GroupTemplateFn<T extends ContentItem> = (group: ContentGroup<T>) => string;

export interface ContentGroup<A extends ContentItem> {
    groupKey: string,
    entries: A[],
    context: IContext,
    previousGroup?: ContentGroup<A>,
    nextGroup?: ContentGroup<A>,
    [key: string]: unknown,
}