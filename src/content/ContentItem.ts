import { IContext } from '../context';

export type TemplateFn = (item: ContentItem) => string;

export type ContentItem = {
    context: IContext;
    filePath: string;
    rawContent: string;
    load(): void;
    emit(template: string | TemplateFn, destination: string): void;
};