import { IContext } from '../context.js';

export type TemplateFn<T> = (item: T) => string;

export type ContentItem = {
    uid: number;
    context: IContext;
    filePath: string;
    rawContent: string | null;
    load(): void;
    emit(template: string | TemplateFn<ContentItem>, destination: string): void;
};