import { IContext } from '../context';

export type TemplateFn<T> = (item: T) => string;

export type ContentItem = {
    uid: number;
    context: IContext;
    filePath: string;
    rawContent: string;
    load(): void;
    emit(template: string | TemplateFn<ContentItem>, destination: string): void;
};