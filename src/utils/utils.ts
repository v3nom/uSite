import getSlug from 'speakingurl';
import * as MetaParser from './metaParser.js';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
}));

export class Utils {
    public static parseMarkdown(content: string): string {
        return marked.parse(content) as string;
    }

    public static parseOptions(s: string): unknown {
        return MetaParser.parseOptionsWithSuggestedType(s, MetaParser.getSuggestedType('', s));
    }

    public static generateSlug(input: string): string {
        return getSlug(input);
    }
}