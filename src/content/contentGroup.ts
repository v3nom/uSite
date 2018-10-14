import { IContext } from "../context";
import { ContentItem } from "./ContentItem";

export type GroupTemplateFn<T extends ContentItem> = (group: ContentGroup<T>) => string;

export interface ContentGroup<A extends ContentItem> {
    groupKey: string,
    entries: A[],
    context: IContext,
    previousGroup?: ContentGroup<A>,
    nextGroup?: ContentGroup<A>,
}