import { ContentItem } from "./ContentItem";
import { IPostMeta } from "./IPostMeta";

export type PostContentItem = {
    meta: IPostMeta,
    excerpt: string;
} & ContentItem;