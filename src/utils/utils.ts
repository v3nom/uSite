import * as getSlug from 'speakingurl';
import * as MetaParser from './metaParser';
import { marked } from 'marked';

marked.setOptions({
    highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
    }
});

export class Utils {
    public static parseMarkdown(content: string): string {
        return marked(content);
    }

    public static parseOptions(s): any {
        return MetaParser.parseOptionsWithSuggestedType(s, MetaParser.getSuggestedType('', s));
    }

    public static generateSlug(input: string): string {
        return getSlug(input);
    }
}